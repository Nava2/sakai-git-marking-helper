
import Promise = require('bluebird');

require('any-promise/register/bluebird');

const path = require('path');
import * as fs from 'mz/fs';
import glob = require('glob-promise');
import _ = require('lodash');

import { Parsed } from "./parsed";
const config = require("./config").load();

export function idRegex() {
  return /.*\(([\w\d]+)\)/;
}

export function getSubmissionForDirectory(studentDir: string): Promise<Parsed> {

  const m = idRegex().exec(studentDir);

  const parsed: Parsed = {
    studentId: m[1],
    studentDirectory: path.join(config.extractedDirectory, studentDir),
    warnings: []
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
      return arr[0].isDirectory() && !!idRegex().exec(arr[1]);
    })
    .map(arr => arr[1]);
}

/**
 * Reads all of the student directories, reading the `meta.json` file in each, producing a Parsed instance for each.
 */
export function readParsedStructure(): Promise<Parsed[]> {
  return getStudentDirectories()
    .map(getSubmissionForDirectory)
    .filter(v => !!v)
    .map((parsed: Parsed) => {
      return Promise.resolve(fs.readFile(path.join(parsed.studentDirectory, "meta.json")))
        .then(content => {
          return _.extend(parsed, JSON.parse(content.toString()));
        });
    });
}