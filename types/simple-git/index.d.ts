// Type definitions for simple-git v1.65.0
// Project: [~THE PROJECT NAME~]
// Definitions by: Kevin Brightwell <https://github.com/Nava2>

/// <reference types="node" />

import Promise from 'bluebird';

export = git;

declare function git(baseDir?: string): git.Git;

declare namespace git {

  export type Callback<T> = (err: any, result: T) => void;

  export interface Options {
    [prop: string]: string;
  }

  export interface StatusSummary {

  }

  export interface LogOptionsObject {
    // commitish from
    from?: string;

    // commitish to
    to?: string;

    // Path to a file
    file?: string;

    // String that the log messages are split on
    splitter?: string;
  }

  export type LogOptions = LogOptionsObject | string[] | Options;

  /**
   * https://github.com/steveukx/git-js/blob/master/src/responses/ListLogSummary.js#L33
   */
  export interface ListLogLine {
    [logProp: string]: string;
  }

  /**
   * https://github.com/steveukx/git-js/blob/master/src/responses/ListLogSummary.js#L9
   */
  export class ListLogSummary {

    all?: ListLogLine[];

    /**
     * https://github.com/steveukx/git-js/blob/master/src/responses/ListLogSummary.js#L25
     */
    latest?: ListLogLine;

    /**
     * https://github.com/steveukx/git-js/blob/master/src/responses/ListLogSummary.js#L31
     */
    total?: number;

    /**
     * https://github.com/steveukx/git-js/blob/master/src/responses/ListLogSummary.js#L39
     */
    static COMMIT_BOUNDARY: string;

    /**
     * https://github.com/steveukx/git-js/blob/master/src/responses/ListLogSummary.js#L9
     * @param all
     */
    constructor(all?: ListLogLine[]);

    /**
     * https://github.com/steveukx/git-js/blob/master/src/responses/ListLogSummary.js#L41
     *
     * @param text
     * @param splitter
     * @param fields
     */
    static parse(text: string, splitter: string, fields?: string[]): ListLogSummary;
  }

  export interface Branch {

    current: boolean;

    name: string;

    // commitish
    commit: string;

    label: string;
  }

  export interface BranchMap {
    [name: string]: Branch;
  }

  /**
   * https://github.com/steveukx/git-js/blob/master/src/responses/BranchSummary.js
   */
  export class BranchSummary {

    detached: boolean;
    current: string;

    all: Branch[];
    branches: BranchMap;


    constructor();

    static parse(commit: string): BranchSummary;
  }

  export class Git {

    // /**
    //  *
    //  * @param baseDir Base directory for all processes
    //  * @param ChildProcess
    //  * @param Buffer
    //  */
    // constructor(baseDir?: string, ChildProcess?: ChildProcess, Buffer?: Buffer);

    // ChildProcess: ChildProcess;
    // Buffer: Buffer;


    /**
     * See: https://github.com/steveukx/git-js/blob/master/src/git.js#L43
     * @param command Git command
     * @return
     */
    customBinary(command: string): Git;

    /**
     * See: https://github.com/steveukx/git-js/blob/master/src/git.js#L55
     * @param workingDirectory
     * @param then
     */
    cwd(workingDirectory: string, then?: Callback<void>): GitNext<void>;


    /**
     * https://github.com/steveukx/git-js/blob/master/src/git.js#L81
     * @param outputHandler
     */
    outputHandler(outputHandler: (command: string, stdout: Buffer, stderr: Buffer)=>void): Git;


    /**
     * https://github.com/steveukx/git-js/blob/master/src/git.js#L92
     * @param bare
     * @param then
     */
    init(bare: boolean, then?: Callback<void>): GitNext<void>;

    /**
     * https://github.com/steveukx/git-js/blob/master/src/git.js#L110
     * @param then
     */
    status(then?: Callback<StatusSummary>): GitNext<StatusSummary>;

    /**
     * https://github.com/steveukx/git-js/blob/master/src/git.js#L123
     * @param options
     * @param then
     */
    stashList(options: Object|string[], then?: Callback<ListLogSummary>): GitNext<ListLogSummary>;

    /**
     * https://github.com/steveukx/git-js/blob/master/src/git.js#L144
     * @param options
     * @param then
     */
    stash(options: Options | string[], then?: Callback<void>): GitNext<void>;

    clone(uri: string, directory?: string, then?: Callback<void>): GitNext<void>;

    pull(remote: string, branch: string, then?: Callback<void>): GitNext<void>;

    checkout(checkoutWhat: string | string[], then?: Callback<void>): GitNext<void>;

    log(options?: LogOptions, then?: Callback<ListLogSummary>): GitNext<ListLogSummary>;

    branch(options?: Options | string[], then?: Callback<BranchSummary>): GitNext<BranchSummary>;
  }

  export class GitNext<A1> extends Git {
    then<R>(arg: (a: A1) => R|Promise<R>): Promise<R>;
  }
}

