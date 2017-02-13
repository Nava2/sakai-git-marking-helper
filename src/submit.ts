
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
import {readParsedStructure} from "./filesystem";
const config = cfg.load();

function submit() {
  console.log("Submitting student repositories to Github.");

  return readParsedStructure()
    .then(all => {
      console.log("It will take approximately " + (all.length * 250.0 / 1000.0 / 60.0 + "").substr(0, 5) + " minutes");
      return all;
    })
    .filter((p: Parsed) => (!p.error))
    // now we have all of the meta data back
    .map((parsed: Parsed) => {

      parsed.git = git(parsed.cloneDirectory);

      const filesToRemove = config.markingFiles.map(mf => (_.template(mf.to)(parsed)))
        .map(p => path.relative(parsed.cloneDirectory, p));

      return Promise.resolve(parsed.git.add('.')
        .rmKeepLocal(filesToRemove)
        .commit("Submitting marks")
        .push("origin", config.markingBranch))
        .then(() => {
          var deferred = Promise.defer();
          setTimeout(function(){
            deferred.resolve(parsed);
          }, 200);
          return deferred.promise;
        });
    });
}

export = submit;
