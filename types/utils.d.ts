export interface CliOption {
    page: string;
    base?: string;
    publicDir?: string;
}
export declare function rewriteConfig({ page, base, publicDir }: CliOption): string;
