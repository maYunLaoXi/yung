export interface VitePrams {
    cmd: string;
    configPath: string;
}
export declare function runViteCmd({ cmd, configPath }: VitePrams): void;
