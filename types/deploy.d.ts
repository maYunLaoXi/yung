export declare type ServiceType = {
    baseDir: string;
    codeDir?: string;
    backupDir?: string;
    ssh: {
        host: string;
        port: number;
        username: string;
        password: string;
    };
};
declare function deploy(codeDir: string, page: string | undefined, sshInfo: ServiceType): Promise<void>;
export default deploy;
