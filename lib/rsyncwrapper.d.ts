/// <reference types="typescript" />

interface RsyncOptions {
    src: string | Array<string>;
    dest: string;
    ssh?: boolean;
    port?: string;
    privateKey?: string;
    sshCmdArgs?: Array<string>;
    recursive?: boolean;
    deleteAll?: boolean;
    delete?: boolean;
    compareMode?: "checksum" | "sizeOnly";
    include?: Array<string>;
    exclude?: Array<string>;
    excludeFirst?: Array<string>;
    dryRun?: boolean;
    onStdout?: (data: string) => void;
    onStderr?: (data: string) => void;
    times?: boolean;
    args?: Array<string>;
}

type RsyncCallback = (
    error: Error | null,
    stdout: string,
    stderr: string,
    cmd: string,
) => void;

declare function rsync(options: RsyncOptions, callback: RsyncCallback): void;

export = rsync;
