import { cac } from 'cac'
import { rewriteConfig } from './utils'
import { runViteCmd } from './viteUtils'


const cli = cac('yung')
export interface ServerOptions {
  base?: string
}

cli
  .option('--base <path>', `[string] public base path (default: ./)`)

// dev
cli
  .command('serve [page]')
  .alias('dev')
  .action(async (page: string, options: ServerOptions): Promise<void> => {
    const yungConfPath = rewriteConfig({ page, base: options.base || './' })
    runViteCmd({ cmd: 'serve', configPath: yungConfPath })
  })

// prod
cli
  .command('build [...pages]')
  .action(async (pages: string[], options: ServerOptions): Promise<void> => {
    const [page] = pages
    const yungConfPath = rewriteConfig({ page, base: options.base || './' })
    runViteCmd({ cmd: 'build', configPath: yungConfPath })
  })

// preview
cli
  .command('preview [page]')
  .action(async (page: string, option: ServerOptions): Promise<void> => {
    const yungConfPath = rewriteConfig({ page, base: option.base || './' })
    runViteCmd({ cmd: 'preview', configPath: yungConfPath })
  })
cli.help()
cli.version(require('../package.json').version)
