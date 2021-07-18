import { cac } from 'cac'

const cli = cac('yung')

cli
  .option('-c, --config <file>', '[string] use specified config file')

// dev
cli
  .command('[root]')
  .alias('serve')
  .option('-p, --page <path>', '[string] pageDir default src')
  .action((a, b, c) => {
    console.log({ a, b, c })
  })
// build
cli
  .command('build [...roots]')
  .option('-m --map', '[boolean] enable production sourceMap')
  .action((roots, b, c) => {
    console.log('build', { roots, b, c })
  })
cli.help()
cli.version('1.0.0')
cli.parse()