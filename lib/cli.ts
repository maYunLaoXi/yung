import { cac } from 'cac'
import { rewriteConfig, obj2Cmd } from './utils'
import { loadConfigFromFile } from './config'
import { runViteCmd } from './viteUtils'
import deploy, { ServiceType } from './deploy'
import chalk from 'chalk'
import path from 'path'
import fs from 'fs'

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
  .allowUnknownOptions()

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
  .command('deploy [...pages]')
  .option('-s, --service <service>', '[string] deploy service info')
  .action(async (pages, options) => {
    try {
      const { log } = console
      const cwd = process.cwd()
      const [page] = pages
      // page没有传时默认为当前跟目录
      const dir = page ? path.resolve(cwd, 'src', page, 'dist') : path.resolve(cwd, 'dist')
      // 是否存在dist文件夹
      const isExist = fs.existsSync(dir)
      // log(dir, isExist)
      if (!isExist) {
        log(chalk.redBright(`
          run yung build [page] before deploy
          发布前请先进行构建生产代码
        `))
        process.exit(1)
      }
      const config = await loadConfigFromFile()
      const { service } = config
      const deployOption: ServiceType = service[options.service || 'lan']
      if (!deployOption) {
        log(chalk.redBright(`
          service option is must 
          use --service <service's name>
        `))
        process.exit(1)
      }
      await deploy(dir, page, deployOption)
    } catch(e) {
      console.log(chalk.red(`error when deploy:\n${e.stack}`))
      process.exit(1)
    }
  })

cli.help()
cli.version(require('../package.json').version)
cli.parse()
