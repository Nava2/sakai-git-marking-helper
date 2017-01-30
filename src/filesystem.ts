
import Promise = require('bluebird');

require('any-promise/register/bluebird');

const path = require('path');
import * as fs from 'mz/fs';
import glob = require('glob-promise');

import { Parsed } from "./parsed";
const config = require("./config").load();

export function getSubmissionForDirectory(studentDir: string): Promise<Parsed> {
  const ID_REGEX = /.*\(([\w\d]+)\)/;

  const parsed: Parsed = {
    studentId: ID_REGEX.exec(studentDir)[1],
    studentDirectory: path.join(config.extractedDirectory, studentDir)
  };

  return Promise.resolve(glob('*_submissionText.html', {cwd: path.join(config.extractedDirectory, studentDir)}))
    .then(globbed => {
      if (globbed.length !== 1) {
        return Promise.reject(new Error("Got more than 1 submission: " + globbed));
      }

      return Promise.resolve(fs.readFile(path.join(config.extractedDirectory, studentDir, globbed[0])));
    })
    .then(contentArray => {
      parsed.rawSubmission = contentArray.toString();

      return parsed;
    });
}

/**
 * Get all of the student submission directories
 */
export function getStudentDirectories(): Promise<string[]> {
  return Promise.resolve(fs.readdir(config.extractedDirectory))
    .map(studentDir => {
      return Promise.resolve(fs.stat(path.join(config.extractedDirectory, studentDir)))
        .then(stat => [stat, studentDir]);
    })
    .filter(arr => {
      return arr[0].isDirectory();
    })
    .map(arr => arr[1]);
}