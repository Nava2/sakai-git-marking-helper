
import * as moment from "moment";
import { Git } from "../types/simple-git";

interface SubmissionInfo {
    hash: string;

    date: moment.Moment;

    late: moment.Duration;

    penalty: number;
}

export interface Parsed {
    studentId: string;
    studentDirectory: string;

    cloneDirectory?: string;
    gitUri?: string;

    error?: Error | string;

    submission?: SubmissionInfo;

    git?: Git;
}
