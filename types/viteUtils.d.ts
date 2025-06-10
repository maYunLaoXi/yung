export interface VitePrams {
    cmd: string;
    configPath: string;
    commands: string[];
}
export declare function runViteCmd({ cmd, configPath, commands }: VitePrams): import("execa").ExecaChildProcess<string>;
