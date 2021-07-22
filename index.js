const path  = require('path')
const fs = require('fs')
const url = require('url')

const { log } = console
// log(path.join('./', '../', 'abc', '../a'))
const cac = path.resolve('lib', 'module')
const exixtCac = fs.existsSync(cac)
// log({ cac, exixtCac })
const fileUrl = url.pathToFileURL(cac)

async function getFile() {
  // const file = await eval(`import(fileUrl + '.mjs')`)
  // log(file.default)
  const file = require(cac)
  log(file)
}
getFile()