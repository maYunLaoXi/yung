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
  .command('dev [...pages]')
  .action((a, b, c) => {
    console.log('dev', { a, b, c })
  })
cli.help()
cli.version('1.0.0')
cli.parse()