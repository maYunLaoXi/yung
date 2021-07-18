const path  = require('path')
const fs = require('fs')
const url = require('url')

const { log } = console
// log(path.join('./', '../', 'abc', '../a'))
const cac = path.resolve('lib', 'cac')
const exixtCac = fs.existsSync(cac)
// log({ cac, exixtCac })
const fileUrl = url.pathToFileURL(cac)
function imp() {
  return new Promise(resolve => {
    log(fileUrl)
    const file = (eval(`import(fileUrl + '.js')`).default)
    setTimeout(() => {
      log(file)
      resolve(file)
    }, 100);
  })
}
// imp()
const file = (eval(`import(fileUrl + '.js')`))