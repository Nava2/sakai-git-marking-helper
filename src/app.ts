"use strict";

import Promise from "bluebird";

const config = require('./config').load();
const download = require("./download");
const submit = require('./submit');
const pkg = require('./package');

const minimist = require('minimist')(process.argv.slice(2), {
  boolean: ['download', 'pkg', 'package']
});

let action: Promise<void>;
if (minimist.download) {
  // we've been asked to download

  console.log("Downloading submissions: " + config.extractedDirectory);
  action = download();
} else if (minimist.submit) {
  console.log("Submitting marks on Github: " + config.extractedDirectory);

  action = submit();
} else if (minimist.package) {

  console.log("Packaging for upload to Sakai: " + config.extractedDirectory);
  action = pkg();
}

action.catch((error: Error) => {
    console.log(error.message);
  })
  .done(() => {
    console.log("Completed!");
  });

