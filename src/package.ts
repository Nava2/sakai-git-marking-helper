
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
const config = cfg.load();

import {readParsedStructure} from "./filesystem";

import JSZip = require("jszip");

const FEEDBACK_MARKED = _.template("<p>Feedback is available at " +
  "<a href=\"<%= repoUrl %>/blob/<%= branch %>/<%= rubricFile %>\"><%= rubricFile %></a></p>\n" +
  "<p>Marked by: <%= marker %></p>");

const FEEDBACK_NO_SUB = _.template("<p>No submission provided.</p>\n" +
  "<p>Marked by: <%= marker %></p>");

function pkg() {
  console.log("Creating upload-able zip file for Sakai");

  const fullZip  = new JSZip();

  // Sakai is a pain in the arse and needs a separate folder.
  const zip = fullZip.folder('content');

  return Promise.resolve(fs.readFile(path.join(config.extractedDirectory, config.gradesFileName)))
    .then(content => {
      zip.file(config.gradesFileName, content);
    })
    .then(() => readParsedStructure())
    // now we have all of the meta data back
    .map((parsed: Parsed) => {
      const studentDir = path.relative(config.extractedDirectory, parsed.studentDirectory);

      let feedback;

      const templateBase = {
        branch: config.markingBranch,
        rubricFile: path.basename(config.rubric.submissionPath),
        marker: config.marker
      };
      if (!!parsed.submission) {
        const m = /github.com[\/:]([^\/.]+\/[^\/.]+).git/.exec(parsed.gitUri);
        if (!m) {
          throw new TypeError("Unknown gitUri");
        }

        feedback = FEEDBACK_MARKED(_.extend(templateBase, {
          repoUrl: `https://github.com/${m[1]}`,
        }));
      } else {
        feedback = FEEDBACK_NO_SUB(templateBase);
      }

      zip.folder(studentDir).file("comments.txt", feedback);

      return parsed;
    })
    .then((): Promise<Buffer> => {
      return Promise.resolve(fullZip.generateAsync({
        type: 'nodebuffer',

        compression: 'DEFLATE'
       // comment: 'Generated zip file.'
      }));
    })
    .then(buffer => {
      const writePath = path.join(config.extractedDirectory, 'for-sakai.zip');
      console.log('Writing to zip: ' + writePath);
      return Promise.resolve(fs.writeFile(writePath, buffer));
    });
}

export = pkg;
