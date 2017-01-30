
"use strict";


import Promise = require('bluebird');

require('any-promise/register/bluebird');

const path = require('path');
import * as fs from 'mz/fs';

import _ = require('lodash');
import git = require("simple-git");
import moment = require('moment');
import glob = require('glob-promise');
import Handlebars = require('handlebars');

import {Parsed, SubmissionInfo} from './parsed';

import cfg = require("./config");
const config = cfg.load();

function getRubricTemplate() {
  return Promise.resolve(fs.readFile(config.rubric.templatePath))
    .then(v => v.toString())
    .then(Handlebars.compile);
}

function readSubmissionInfo(studentDir: string): Promise<Parsed> {
  const ID_REGEX = /.*\(([\w\d]+)\)/;

  const parsed: Parsed = {
    studentId: ID_REGEX.exec(studentDir)[1],
    studentDirectory: path.join(config.extractedDirectory, studentDir)
  };

  return Promise.resolve(glob('*_submissionText.html', { cwd: path.join(config.extractedDirectory, studentDir) }))
    .then(globbed => {
      if (globbed.length !== 1) {
        return Promise.reject(new Error("Got more than 1 submission: " + globbed));
      }

      return Promise.resolve(fs.readFile(path.join(config.extractedDirectory, studentDir, globbed[0])));
    })
    .then(contentArray => {
      const content = contentArray.toString();

      if (content !== '') {
        const CORRECT_GIT_URL_REGEX = /git@github\.com:uwoece-se2205b-2017\/[\w-]+\.git/g;
        const correctMatch = CORRECT_GIT_URL_REGEX.exec(content);
        if (!!correctMatch) {
          // got a valid git url:
          // The location from the file should be a URI
          const uri = correctMatch[0];

          parsed.cloneDirectory = path.join(config.extractedDirectory, studentDir, `submission-${parsed.studentId}`);
          parsed.gitUri = uri;
        } else {
          // Now look for common errors
          const HTTPS_GIT_URL_REGEX = /https:\/\/github\.com\/uwoece-se2205b-2017\/[\w-]+\.git/g;

          const httpsMatch = HTTPS_GIT_URL_REGEX.exec(content);
          if (!!httpsMatch) {
            throw new Error("Received https link, incorrect submission: " + httpsMatch[0]);
          } else {
            const INVALID_GIT_URL_REGEX = /git@github.com:uwoece-se2205b-2017\/[\w-]+\.git/g;
            const invalidUrlMatch = INVALID_GIT_URL_REGEX.exec(content);
            if (!!invalidUrlMatch) {
              throw new Error("Invalid git url found: " + invalidUrlMatch[0]);
            }
          }
        }
      }

      return parsed;
    })
    .catch((e: Error) => {
      parsed.error = e;
      return Promise.resolve(parsed);
    })
}

function cloneSubmissions(parsed: Parsed): Promise<Parsed> {
  if (!parsed.gitUri) {
    return Promise.resolve(parsed);
  }

  return Promise.resolve(fs.exists(parsed.cloneDirectory))
    .then((exists: boolean) => {
      parsed.git = git();
      if (!exists) {
        return Promise.resolve(parsed.git.clone(parsed.gitUri, parsed.cloneDirectory)
          .cwd(parsed.cloneDirectory));
      } else {
        parsed.git = parsed.git.cwd(parsed.cloneDirectory);
        return Promise.resolve(parsed.git.pull('origin', 'master'));
      }
    })
    .then(() => parsed)
    .catch((err: Error) => {
      if (err.message.indexOf('already exists and is not an empty directory') >= 0) {
        console.warn(`${parsed.studentId}: Tried to clone repository, already exists: "${parsed.cloneDirectory}"`);
        return parsed;
      }

      throw err;
    });
}

function readSakaiTimestamp(parsed: Parsed): Promise<moment.Moment> {
  // read the date back:
  const TIMESTAMP_FILE = path.join(parsed.studentDirectory, 'timestamp.txt');
  return Promise.resolve(fs.stat(TIMESTAMP_FILE))
    .then(stat => {

      if (stat.isFile()) {
        return Promise.resolve(fs.readFile(TIMESTAMP_FILE));
      } else {
        // No submission
        throw new Error("No submission found");
      }
    })
    .then(content => {
      return Promise.resolve(moment(content.toString().trim(), 'YYYYMMDDhhmmssSSS'));
    })
    .catch({ code: 'ENOENT' }, () => {
      // timestamp.txt doesn't exist
      throw new Error("No submission");
    });
}

function getLastCommit(git: git.Git, cloneDirectory: string, sakaiDate: moment.Moment): Promise<SubmissionInfo> {
  // parse the git information
  if (!git) {
    return null;
  }

  return Promise.promisify(git.log, { context: git })()
    .then((logs: git.ListLogSummary) => {
      // logs are in reverse chronological order already! :D
      let warnings = [];

      const maxSubDate = config.dueDate.add(config.late.days);

      for (let log of logs.all) {
        const mdate = moment(log["date"], 'YYYY-MM-DD hh:mm:ss ZZ');
        if (mdate.isSameOrBefore(maxSubDate)) {
          if (mdate.isAfter(sakaiDate)) {
            // submitted code after the due date
            warnings.push("Code submitted after Sakai submission, but before Due Date");
          }

          const lateDiff = moment.duration(moment.max(mdate, sakaiDate).diff(config.dueDate));
          let submission: SubmissionInfo = {
            commit: {
              hash: log["hash"],
              date: mdate
            },

            sakaiDate: sakaiDate,
            late: lateDiff,
            penalty: Math.max(0, lateDiff.days()) * config.late.penaltyPerDay
          };

          return Promise.promisify<void, string>(git.checkout, { context: git })(submission.commit.hash)
            .then(() => (Promise.resolve(submission)));
        }
      }

      throw new Error("No valid submission found.");
    });
}

function initializeSubmissions(): Promise<Parsed[]> {
  return Promise.resolve(fs.readdir(config.extractedDirectory))
    .map(studentDir => {
      return Promise.resolve(fs.stat(path.join(config.extractedDirectory, studentDir)))
        .then(stat => [stat, studentDir]);
    })
    .filter(arr => {
      return arr[0].isDirectory();
    })
    .map(arr => arr[1])
    .map(readSubmissionInfo)
    .map(cloneSubmissions)
    .map((parsed: Parsed) => {
      // Get the timestamp
      return readSakaiTimestamp(parsed)
        .then((sakaiDate: moment.Moment) => {
          // With the timestamp, now we read the commit information
          if (!parsed.error) {
            return getLastCommit(parsed.git, parsed.cloneDirectory, sakaiDate)
              .then(subInfo => {
                parsed.submission = subInfo;
                return Promise.resolve(parsed);
              });
          } else {
            return parsed;
          }
        })
        .catch((e: Error) => {
          parsed.error = e;
          return Promise.resolve(parsed);
        });
    });
}

/**
 * Using all of the parsed information, now write it back for marking use
 * @param rubricTemplate The Handlebars template data is written into for a rubric
 * @param parsed
 * @returns {Promise<void>}
 */
function writeParsedInformation(rubricTemplate: any, parsed: Parsed): Promise<Parsed> {
  const git: git.Git = parsed.git;

  const outDir = parsed.studentDirectory;
  const cloneDir = parsed.cloneDirectory;

  let json: any = parsed;
  delete json.git;

  if (parsed.submission) {
    const days = parsed.submission.late.days();
    json.submission.late = (days <= 0 ? "on-time" : days + " days");
  }

  return Promise.resolve(fs.writeFile(path.join(outDir, "meta.json"), JSON.stringify(json, null, '  ')))
    .then(() => {
      if (!parsed.error && !!git) {

        return Promise.promisify<void, string[]>(git.branch, { context: git })([config.markingBranch, '--force'])
          .then(() => Promise.promisify<void, string[]>(git.checkout, { context: git })([config.markingBranch]))
          .then(() => {
            const templateParsed = _.cloneDeep(json);
            templateParsed.submission.commit.date = templateParsed.submission.commit.date.format("MMMM Do YYYY, hh:mm:ss");
            templateParsed.submission.penalty = (templateParsed.submission.penalty * 100.0) + '%';

            const rubricPath = path.join(_.template(config.rubric.submissionPath)(parsed));
            return Promise.resolve(fs.writeFile(rubricPath, rubricTemplate(templateParsed)));
          })
          .catch((error: Error) => {
            parsed.error = error;
            return Promise.resolve(parsed);
          });
      } else {
        return Promise.resolve();
      }
    })
    .then(() => (Promise.resolve(parsed)));
}

function download() {
  return getRubricTemplate()
    .then(rubric => {
      return initializeSubmissions()
        .map((parsed: Parsed) => (writeParsedInformation(rubric, parsed)));
    })
    .each((parsed: Parsed) => {
      if (parsed.error) {
        console.warn(`${parsed.studentId}: ${parsed.error.message}`);
      } else {
        console.log(`${parsed.studentId}: Completed download`);
      }
    });
}

export = download;

