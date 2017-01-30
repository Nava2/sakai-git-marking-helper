
"use strict";


import Promise = require('bluebird');

require('any-promise/register/bluebird');

const path = require('path');
import * as fs from 'mz/fs';

import _ = require('lodash');
import git = require("simple-git");
import moment = require('moment');
import glob = require('glob-promise');

import {Parsed} from './parsed';

import cfg = require("./config");
import {getStudentDirectories, getSubmissionForDirectory} from "./filesystem";
const config = cfg.load();

function submit() {
  return getStudentDirectories()
    .map(getSubmissionForDirectory)
    .map((parsed: Parsed) => {
      return Promise.resolve(fs.readFile(path.join(parsed.studentDirectory, "meta.json")))
        .then(content => {
          return _.extend(parsed, JSON.parse(content.toString()));
        });
    })
    .filter((p: Parsed) => (!p.error))
    // now we have all of the meta data back
    .map((parsed: Parsed) => {

      parsed.git = git(parsed.cloneDirectory);

      return Promise.resolve(parsed.git.add('.')
        .commit("Submitting marks")
        .push("origin", config.markingBranch));
    })
    .each(parsed => {
      console.log(parsed);
    });
}

export = submit;
