
interface ChildProcess {

}

type Then = Function;

import Buffer from 'buffer';

export class Git {

    /**
     *
     * @param baseDir Base directory for all processes
     * @param ChildProcess
     * @param Buffer
     */
    constructor(baseDir?: string, ChildProcess?: ChildProcess, Buffer?: Buffer);

    ChildProcess: ChildProcess;
    Buffer: Buffer;


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
    cwd(workingDirectory: string, then?: Then): Git;


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
    init(bare: boolean, then?: Then): Git;

    /**
     * https://github.com/steveukx/git-js/blob/master/src/git.js#L110
     * @param then
     */
    status(then?: Then): Git;

    /**
     * https://github.com/steveukx/git-js/blob/master/src/git.js#L123
     * @param options
     * @param then
     */
    stashList(options: Object|string[], then?: Then): Git;

    /**
     * https://github.com/steveukx/git-js/blob/master/src/git.js#L144
     * @param options
     * @param then
     */
    stash(options: Object|string[], then?: Then): Git;

    clone(uri: string, directory?: string): Git;

    pull(remote: string, branch: string): Git;

    checkout(commitish: string): Git;

}
