
import moment = require("moment-timezone");
require('any-promise/register/bluebird');

export interface RubricConfig {
  templatePath: string;
  submissionPath: string;
}

export interface LateConfigSpec {

  // How many days late are allowed
  days: moment.Duration | number;

  // Percentage taken off of a mark per day
  penaltyPerDay: number;
}

export interface ConfigSpec {

  marker: string;

  rubric: RubricConfig;

  // Location where the student projects were extracted to, there should be a folder per
  // student in here
  extractedDirectory: string;

  /**
   * The branch to place marking information into, this defaults to "marking"
   */
  markingBranch?: string;

  // Date when the assignment is due, usually copied from Sakai
  dueDate: moment.Moment | string;

  late: LateConfigSpec;
}

export class LateConfig {

  // How many days late are allowed
  days: moment.Duration;

  // Percentage taken off of a mark per day
  penaltyPerDay: number;

  constructor(from: LateConfigSpec) {

    if (typeof from.days == 'number') {
      this.days = moment.duration(from.days, 'days');
    } else {
      this.days = from.days;
    }

    this.penaltyPerDay = from.penaltyPerDay;
  }
}


export class Config {

  marker: string;

  rubric: RubricConfig;

  // Location where the student projects were extracted to, there should be a folder per
  // student in here
  extractedDirectory: string;

  /**
   * The branch to place marking information into, this defaults to "marking"
   */
  markingBranch: string = 'marking';

  // Date when the assignment is due, usually copied from Sakai
  dueDate: moment.Moment;

  late: LateConfig;

  constructor(from: ConfigSpec) {
    this.marker = from.marker;

    this.rubric = from.rubric;

    this.extractedDirectory = from.extractedDirectory;

    if (from.markingBranch) {
      this.markingBranch = from.markingBranch;
    }

    if (typeof(from.dueDate) == 'string') {
      this.dueDate = moment.tz(from.dueDate, "DD-MMM-YYYY hh:mm", "America/Toronto");
    } else {
      this.dueDate = moment.tz(from.dueDate, "America/Toronto");
    }

    this.late = new LateConfig(from.late);
  }
}

export function load() {
  const configuration: ConfigSpec = require('../config');
  return new Config(configuration);
}