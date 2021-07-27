import { cac } from 'cac'
import { rewriteConfig } from './utils'
import { runViteCmd } from './viteUtils'
import chalk from 'chalk'


const cli = cac('yung')
export interface ServerOptions {
  base?: string
}

cli
  .option('--base <path>', `[string] public base path (default: ./)`)
cli
  .command('[root]')
  .action(() => {
    console.log(chalk.blue(`
      this command no used
      run:  yung dev to start devement mode
    `))
  })

// dev
cli
  .command('serve [page]')
  .alias('dev')
  .action(async (page: string, options: ServerOptions): Promise<void> => {
    try {
      const yungConfPath = rewriteConfig({ page, base: options.base || './' })
      runViteCmd({ cmd: 'serve', configPath: yungConfPath })
    } catch (e) {
      console.log(chalk.red(`error during dev server:\n${e.stack}`))
      process.exit(1)
    }
  })

// prod
cli
  .command('build [...pages]')
  .action(async (pages: string[], options: ServerOptions): Promise<void> => {
    try {
      const [page] = pages
      const yungConfPath = rewriteConfig({ page, base: options.base || './' })
      runViteCmd({ cmd: 'build', configPath: yungConfPath })
    } catch(e) {
      console.log(chalk.red(`error during build:\n${e.stack}`))
      process.exit(1)
    }
  })

// preview
cli
  .command('preview [page]')
  .action(async (page: string, option: ServerOptions): Promise<void> => {
    try {
      const yungConfPath = rewriteConfig({ page, base: option.base || './' })
      runViteCmd({ cmd: 'preview', configPath: yungConfPath })
    } catch(e) {
      console.log(chalk.red(`error when starting preview server:\n${e.stack}`))
      process.exit(1)
    }
  })
cli.help()
cli.version(require('../package.json').version)
cli.parse()
