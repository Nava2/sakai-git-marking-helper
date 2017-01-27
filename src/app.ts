"use strict";

const path = require('path');

import _ from 'lodash';
import * as fs from 'fs-promise';
const git = require('simple-git');
import moment from 'moment';
const glob = require('glob-promise');
import Promise from 'bluebird';
import hbs from 'handlebars';

import config from "./config";

const minimist = require('minimist')(process.argv.slice(2), {
  boolean: ['download', 'submit']
});

if (minimist.download) {
    // we've been asked to download
    import download = require("./download");

    download();
}

