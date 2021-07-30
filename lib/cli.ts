import { cac } from 'cac'
import { rewriteConfig, obj2Cmd, run, bin } from './utils'
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
      runViteCmd({ cmd: 'serve', configPath: yungConfPath, commands: obj2Cmd(options) })
    } catch (e) {
      console.log(chalk.red(`error during dev server:\n${e.stack}`))
      process.exit(1)
    }
  })
  .allowUnknownOptions()

// prod
cli
  .command('build [...pages]')
  .action(async (pages: string[], options: ServerOptions): Promise<void> => {
    try {
      const [page] = pages
      const yungConfPath = rewriteConfig({ page, base: options.base || './' })
      runViteCmd({ cmd: 'build', configPath: yungConfPath, commands: obj2Cmd(options) })
    } catch(e) {
      console.log(chalk.red(`error during build:\n${e.stack}`))
      process.exit(1)
    }
  })

// preview
cli
  .command('preview [page]')
  .action(async (page: string, options: ServerOptions): Promise<void> => {
    try {
      const yungConfPath = rewriteConfig({ page, base: options.base || './' })
      runViteCmd({ cmd: 'preview', configPath: yungConfPath, commands: obj2Cmd(options) })
    } catch(e) {
      console.log(chalk.red(`error when starting preview server:\n${e.stack}`))
      process.exit(1)
    }
  })

// deploy
cli
  .command('deploy <env>')
  .action(async (env, option) => {
    console.log(process.argv)
    console.log({ option, obj2Cmd: obj2Cmd(option) })
  })
  .allowUnknownOptions()

cli.help()
cli.version(require('../package.json').version)
cli.parse()
