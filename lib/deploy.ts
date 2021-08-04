// 上传服务器
import { Client as SshClient } from 'ssh2'
// const { Client: SshClient } = require('ssh2')
const scpClient = require('scp2')
import chalk from 'chalk'
import path from 'path'
const { log } = console

export type ServiceType = {
  baseDir: string,
  codeDir?: string,
  backupDir?: string,
  ssh: {
    host: string,
    port: number,
    username: string,
    password: string
  }
}

async function deploy(codeDir: string, page = './', sshInfo: ServiceType) {
  const conn = new SshClient()
  conn.on('ready', async () => {
    upCode(codeDir, page, sshInfo).then(res => {
      log(chalk.green('deploy success'))
    }).catch(err => {
      log(chalk.red(`
        error when deploy:\n ${err}
      `))
    }).then(() => {
      conn.end()
    })
  }).connect({
    ...sshInfo.ssh
  })
}

async function upCode(codeDir: string, page: string, sshInfo: ServiceType) {
  let { baseDir, codeDir: remoteCodeDir } = sshInfo
  return new Promise((resolve, reject) => {
    if (!baseDir) {
      reject({ error: 'remote base dir is missing' })
      return
    }
    let sonPath = remoteCodeDir || page
    if (sonPath === '/') sonPath = './'
    if (sonPath[0] === '/') sonPath = sonPath.replace('/', '')
    const upDir = path.resolve(baseDir, sonPath)

    log(chalk.hex('#ff328c').bold(`from: ${codeDir}`))
    log(chalk.green(`to: ${upDir}`))
    log(chalk.blueBright('uploading...'))

    scpClient.scp(codeDir,
      {
        ...sshInfo.ssh,
        path: upDir
      },
      (err: any) => {
        if (err) reject(err)
        else resolve({ from: codeDir, to: upDir, status: 'success' })
      }
    )
  })
}

export default deploy