"use strict";

import Promise from "bluebird";

const config = require('./config').load();
const download = require("./download");
const submit = require('./submit');

const minimist = require('minimist')(process.argv.slice(2), {
  boolean: ['download', 'submit']
});

let action: Promise<void>;
if (minimist.download) {
  // we've been asked to download

  console.log("Downloading submissions: " + config.extractedDirectory);
  action = download();
} else if (minimist.submit) {
  console.log("Submitting marks on Github: " + config.extractedDirectory);

  action = submit();
}

action.catch((error: Error) => {
    console.log(error.message);
  })
  .done(() => {
    console.log("Completed!");
  });

