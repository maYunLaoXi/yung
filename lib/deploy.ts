// 上传服务器
import { Client as SshClient } from 'ssh2'
import chalk from 'chalk'
import { readdir, stat } from 'fs/promises'
import { createReadStream } from 'fs'
import { join } from 'path'
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

async function uploadDir(sftp: any, localDir: string, remoteDir: string): Promise<void> {
  const files = await readdir(localDir)
  
  // 创建远程目录
  await new Promise<void>((resolve, reject) => {
    sftp.mkdir(remoteDir, (err: any) => {
      if (err && err.code !== 4) reject(err) // code 4 表示目录已存在
      else resolve()
    })
  })

  for (const file of files) {
    const localPath = join(localDir, file)
    const remotePath = `${remoteDir}/${file}`
    const stats = await stat(localPath)

    if (stats.isDirectory()) {
      await uploadDir(sftp, localPath, remotePath)
    } else {
      console.log(file)
      await new Promise<void>((resolve, reject) => {
        const readStream = createReadStream(localPath)
        const writeStream = sftp.createWriteStream(remotePath)
        
        writeStream.on('close', () => resolve())
        writeStream.on('error', (err: any) => reject(err))
        readStream.on('error', (err: any) => reject(err))
        
        readStream.pipe(writeStream)
      })
    }
  }
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
    const upDir = `${baseDir}/${sonPath}`

    log(chalk.hex('#ff328c').bold(`from: ${codeDir}`))
    log(chalk.green(`to: ${upDir}`))
    log(chalk.blueBright('uploading...'))

    const conn = new SshClient()
    conn.on('ready', () => {
      conn.sftp((err, sftp) => {
        if (err) {
          reject(err)
          return
        }

        uploadDir(sftp, codeDir, upDir)
          .then(() => {
            resolve({ from: codeDir, to: upDir, status: 'success' })
          })
          .catch(reject)
          .finally(() => {
            conn.end()
          })
      })
    }).on('error', reject)
      .connect(sshInfo.ssh)
  })
}

export default deploy