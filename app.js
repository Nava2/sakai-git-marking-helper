"use strict";

const path = require('path');

const minimist = require('minimist')(process.argv.slice(2), {
  string: ['due']
});

require('any-promise/register/bluebird');

const _ = require('lodash');
const fs = require('fs-promise');
const git = require('simple-git');
const glob = require('glob-promise');
const moment = require('moment');
const Promise = require('bluebird');

if (!minimist._ || !minimist._[0]) {
  throw new Error('Must specify directory for students as positional argument.');
}

const DUE_DATE = moment(minimist.due || minimist._[0], [moment.ISO_8601, "DD-MMM-YYYY hh:mm"]);
const ASSIGNMENT_DIR = _.last(minimist._);
const PENALTY = 0.20;

const ID_REGEX = /.*\(([\w\d]+)\)/;

fs.readdir(ASSIGNMENT_DIR)
  .filter(studentDir => {
    return fs.stat(path.join(ASSIGNMENT_DIR, studentDir))
      .then(stat => {
        return stat.isDirectory();
      });
  })
  .map(studentDir => {
    return glob('*_submissionText.html', { cwd: path.join(ASSIGNMENT_DIR, studentDir) })
      .then(globbed => {
        if (globbed.length !== 1) {
          return Promise.reject(new Error("Got more than 1 submission: " + globbed));
        }

        return fs.readFile(path.join(ASSIGNMENT_DIR, studentDir, globbed[0]));
      })
      .then(location => {
        // The location from the file should be a URI
        const uri = location.toString().trim();

        const parsed = {
          studentId: ID_REGEX.exec(studentDir)[1],
          studentDirectory: path.join(ASSIGNMENT_DIR, studentDir)
        };

        if (!!uri && uri !== '') {
          _.extend(parsed, {
            cloneDirectory: path.join(ASSIGNMENT_DIR, studentDir, 'submission'),
            gitUri: uri
          });
        }

        return Promise.resolve(parsed);
      });
  })
  .map(parsed => {
    if (!parsed.gitUri) {
      return Promise.resolve(parsed);
    }

    parsed.git = git();
    return Promise.promisify(parsed.git.clone, { context: parsed.git })(parsed.gitUri, parsed.cloneDirectory).then(() => {
      return parsed;
    }).catch(err => {
      if (err.message.indexOf('already exists and is not an empty directory') >= 0) {
        console.warn(`${parsed.studentId}: Tried to clone repository, already exists: "${parsed.cloneDirectory}"`);
        return Promise.resolve(parsed);
      }

      throw err;
    });
  })
  .map(parsed => {
    // read the date back:
    const TIMESTAMP_FILE = path.join(parsed.studentDirectory, 'timestamp.txt');
    return fs.stat(TIMESTAMP_FILE)
      .then(stat => {
        if (stat.isFile()) {
          return fs.readFile(TIMESTAMP_FILE)
            .then(content => {
              return _.extend(parsed, {
                owlDate: moment(content.toString().trim(), 'YYYYMMDDhhmmssSSS')
              });
            });
        } else {
          return Promise.resolve(parsed);
        }
      })
      .then(parsed => {
        if (!!parsed.owlDate && !!parsed.git) {
          // parsed the git information
          return Promise.promisify(parsed.git.cwd(parsed.cloneDirectory).log, { context: parsed.git })()
            .then(logs => {
              // logs are in reverse chronological order already! :D

              for (let log of logs.all) {
                const mdate = moment(log.date, 'YYYY-MM-DD hh:mm:ss ZZ');
                if (mdate.isSameOrBefore(parsed.owlDate)) {
                  const lateDiff = moment.duration(mdate.diff(DUE_DATE));
                  _.extend(parsed, {
                    submission: {
                      hash: log.hash,
                      date: mdate,
                      late: lateDiff,
                      penalty: Math.max(0, lateDiff.days()) * PENALTY
                    }
                  });

                  return Promise.promisify(parsed.git.checkout, { context: parsed.git })(parsed.submission.hash)
                    .then(() => parsed);
                }
              }

              return parsed;
            });
        } else {
          return parsed;
        }
      })
      .catch(err => {
        if (err.code === 'ENOENT') {
          // timestamp.txt doesn't exist
          console.warn(parsed.studentId + ": No submission.");
          return Promise.resolve(parsed);
        } else {
          throw err;
        }
      });
  })
  .map(parsed => {

    const outDir = parsed.studentDirectory;

    delete parsed.cloneDirectory;
    delete parsed.studentDirectory;
    delete parsed.git;

    if (parsed.submission) {
      const days = parsed.submission.late.days();
      parsed.submission.late = (days <= 0 ? "on-time" : days + " days");

    }

    return fs.writeFile(path.join(outDir, "meta.json"), JSON.stringify(parsed, null, '  '));
  })
  .done(() => {
    console.log("Completed.")
  });

