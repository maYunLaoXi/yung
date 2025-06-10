import execa from 'execa';
export interface CliOption {
    page: string;
    base?: string;
    publicDir?: string;
}
export interface GLobalCliOptions {
    '--'?: string[];
    base?: string;
    root?: string;
    [propName: string]: any;
}
export declare function rewriteConfig({ page, base, publicDir }: CliOption): string;
/**
 * 将对象转化为参数，并且去掉 -- base root的值
 * @param obj GLobalCliOptions
 * @returns
 */
export declare function obj2Cmd(obj: GLobalCliOptions): string[];
/**
 * 这样控制台才有颜色显示
 * see https://kohpoll.github.io/blog/2016/09/15/spawn-and-terminal-color/
 * see https://mlog.club/article/1599869
 * */
export declare const run: (bin: string, args: string[], opts?: {}) => execa.ExecaChildProcess<string>;
export declare const bin: (name: string) => string;
