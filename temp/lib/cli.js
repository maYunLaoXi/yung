import { cac } from 'cac';
import { rewriteConfig } from './utils';
import { runViteCmd } from './viteUtils';
const cli = cac('yung');
cli
    .option('--base <path>', `[string] public base path (default: ./)`);
// dev
cli
    .command('serve [page]')
    .alias('dev')
    .action(async (page, options) => {
    const yungConfPath = rewriteConfig({ page, base: options.base || './' });
    runViteCmd({ cmd: 'serve', configPath: yungConfPath });
});
// prod
cli
    .command('build [...pages]')
    .action(async (pages, options) => {
    const [page] = pages;
    const yungConfPath = rewriteConfig({ page, base: options.base || './' });
    runViteCmd({ cmd: 'build', configPath: yungConfPath });
});
cli.help();
cli.version(require('../package.json').version);
