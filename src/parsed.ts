
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

export interface Parsed {
  studentId: string;
  studentDirectory: string;

  cloneDirectory?: string;
  gitUri?: string;

  error?: Error;

  submission?: SubmissionInfo;

  git?: Git;
}
