
import * as moment from "moment";
import { Git } from "simple-git";

export interface SubmissionInfo {

  /**
   * Commit information
   */
  commit: {
    date: moment.Moment,
    hash: string;
  };

  sakaiDate: moment.Moment;

  late: moment.Duration;

  penalty: number;
}

export class Parsed {
  studentId: string;
  studentDirectory: string;

  cloneDirectory?: string;
  gitUri?: string;

  error?: Error;
  warnings: string[] = [];

  rawSubmission?: string;
  submission?: SubmissionInfo;

  git?: Git;
}
