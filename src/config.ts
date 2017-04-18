
import moment = require("moment-timezone");
require('any-promise/register/bluebird');

import path from 'path';

export interface LateConfigSpec {

  // How many days late are allowed
  days: moment.Duration | number;

  // Percentage taken off of a mark per day
  penaltyPerDay: number;
}

export interface Command {

  command: string;

  cwd?: string;
}

export type CommandSpec = Command | string;

export interface MarkingFileSpec {
  /**
   * Location to copy from
   */
  from: string;

  /**
   * Location to copy to
   */
  to: string;

  /**
   * True if the config file should be kept
   */
  keep: boolean;
}

export interface ConfigSpec {

  marker: string;

  overwrite: boolean;

  markingFiles?: MarkingFileSpec[];

  // Location where the student projects were extracted to, there should be a folder per
  // student in here
  extractedDirectory: string;

  /**
   * The branch to place marking information into, this defaults to "marking"
   */
  markingBranch?: string;

  /**
   * Commands to run per project
   */
  commands?: CommandSpec[];

  gradesFileName: string;

  // Date when the assignment is due, usually copied from Sakai
  dueDate: moment.Moment | string;

  late: LateConfigSpec;
}

export class MarkingFile {

  readonly from: string;

  readonly to: string;

  readonly keep: boolean;

  constructor(spec: MarkingFileSpec) {
    this.from = spec.from;
    this.to = spec.to;
    this.keep = spec.keep;
  }

}

export class LateConfig {

  // How many days late are allowed
  readonly days: moment.Duration;

  // Percentage taken off of a mark per day
  readonly penaltyPerDay: number;

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

  overwrite: boolean = false;

  // Location where the student projects were extracted to, there should be a folder per
  // student in here
  extractedDirectory: string;

  markingFiles: MarkingFile[];

  /**
   * The branch to place marking information into, this defaults to "marking"
   */
  markingBranch: string = 'marking';

  /**
   * Grades file path
   */
  gradesFileName: string;

  commands: Command[];

    // Date when the assignment is due, usually copied from Sakai
  dueDate: moment.Moment;

  late: LateConfig;

  constructor(from: ConfigSpec) {
    this.marker = from.marker;
    this.overwrite = from.overwrite;

    this.extractedDirectory = from.extractedDirectory;

    this.gradesFileName = from.gradesFileName;

    this.commands = [];

    if (from.commands) {
      this.commands = from.commands.map(cmd => {
        if (typeof cmd == 'string') {
          return { command: cmd };
        } else {
          return cmd;
        }
      });
    }

    this.markingFiles = !!from.markingFiles ? from.markingFiles.map(v => new MarkingFile(v)) : [];

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