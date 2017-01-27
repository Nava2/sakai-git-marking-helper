"use strict";

const path = require('path');

const _ = require('lodash');
const fs = require('fs-promise');
const git = require('simple-git');
const glob = require('glob-promise');
const moment = require('moment');
const Promise = require('bluebird');
const hbs = require('handlebars');

const config = require('./config.js');

const minimist = require('minimist')(process.argv.slice(2), {
  boolean: ['download', 'submit']
});

require('any-promise/register/bluebird');



config.dueDate = moment(config.dueDate, [moment.ISO_8601, "DD-MMM-YYYY hh:mm"]);

fs.readFile(path.join(__dirname, 'rubric.md.hbs'))
  .then(v => v.toString())
  .then(hbs.compile)
  .then(RUBRIC_TEMPLATE => {
    return fs.readdir(ASSIGNMENT_DIR)
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
          .then(contentArray => {
            const content = contentArray.toString();

            const ID_REGEX = /.*\(([\w\d]+)\)/;

            const parsed = {
              studentId: ID_REGEX.exec(studentDir)[1],
              studentDirectory: path.join(ASSIGNMENT_DIR, studentDir)
            };

            if (content !== '') {
              const CORRECT_GIT_URL_REGEX = /git@github\.com:uwoece-se2205b-2017\/[\w-]+\.git/g;
              const correctMatch = CORRECT_GIT_URL_REGEX.exec(content);
              if (!!correctMatch) {
                // got a valid git url:
                // The location from the file should be a URI
                const uri = correctMatch[0];

                _.extend(parsed, {
                  cloneDirectory: path.join(ASSIGNMENT_DIR, studentDir, 'submission'),
                  gitUri: uri
                });

              } else {
                const HTTPS_GIT_URL_REGEX = /https:\/\/github\.com\/uwoece-se2205b-2017\/[\w-]+\.git/g;

                const httpsMatch = HTTPS_GIT_URL_REGEX.exec(content);
                if (!!httpsMatch) {
                  _.extend(parsed, {
                    error: "Received https link, incorrect submission: " + httpsMatch[0]
                  });
                } else {
                  const INVALID_GIT_URL_REGEX = /git@github.com:uwoece-se2205b-2017\/[\w-]+\.git/g;
                  const invalidUrlMatch = INVALID_GIT_URL_REGEX.exec(content);
                  if (!!invalidUrlMatch) {
                    _.extend(parsed, {
                      error: "Invalid git url found: " + invalidUrlMatch[0]
                    });
                  }
                }
              }
            }

            return Promise.resolve(parsed);
          });
      })
      .map(parsed => {
        if (!parsed.gitUri) {
          return Promise.resolve(parsed);
        }

        return fs.exists(parsed.cloneDirectory)
          .then(exists => {
            if (!exists) {
              parsed.git = git();
              return Promise.promisify(parsed.git.clone, {context: parsed.git})(parsed.gitUri, parsed.cloneDirectory);
            } else {
              parsed.git = git(parsed.cloneDirectory);
              return Promise.promisify(parsed.git.pull, { context: parsed.git })('origin', 'master');
            }
          })
          .then(() => parsed)
          .catch(err => {
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
                    if (mdate.isSameOrBefore(DUE_DATE)) {
                      if (mdate.isAfter(parsed.owlDate)) {
                        // submitted code after the due date
                        _.extend(parsed, {
                          warning: "Code submitted after OWL submission, but before Due Date"
                        })
                      }

                      const lateDiff = moment.duration(moment.max(mdate, parsed.owlDate).diff(DUE_DATE));
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
      .catch(parsed => {
        return parsed;
      })
      .map(parsed => {

        const git = parsed.git;
        delete parsed.git;

        const outDir = parsed.studentDirectory;
        const cloneDir = parsed.cloneDirectory;

        delete parsed.cloneDirectory;
        delete parsed.studentDirectory;

        if (parsed.submission) {
          const days = parsed.submission.late.days();
          parsed.submission.late = (days <= 0 ? "on-time" : days + " days");
        }

        return fs.writeFile(path.join(outDir, "meta.json"), JSON.stringify(parsed, null, '  '))
          .then(() => {
            if (!parsed.error && !!git) {
              const localGit = git.cwd(cloneDir);
              return Promise.promisify(localGit.branch, { context: localGit })('marking', { '--force': true })
                .then(() => Promise.promisify(localGit.checkout, { context: localGit })('marking'))
                .then(() => {
                  const templateParsed = _.cloneDeep(parsed);
                  templateParsed.submission.date = templateParsed.submission.date.format("MMMM Do YYYY, hh:mm:ss");
                  templateParsed.submission.penalty = (templateParsed.submission.penalty * 100.0) + '%';

                  return fs.writeFile(path.join(cloneDir, "RUBRIC.md"), RUBRIC_TEMPLATE(templateParsed))
                });
            } else {
              return Promise.resolve();
            }
          })
      });
  });

