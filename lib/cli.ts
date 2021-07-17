#! /usr/bin/env node
import yargs from 'yargs/yargs'
import { hideBin } from 'yargs/helpers'

// const argv = yargs(process.argv.slice(2)).argv
const argv = yargs(hideBin(process.argv))
.usage('usage aaaaa')
.command(['serve [page]', 'dev'], 'create a development serve', (yargs) => {
  console.log(yargs.argv)
})
.command('build', 'build app for production', yargs => {
  console.log('building: ', yargs.argv)
})
.argv
// console.log(argv)
