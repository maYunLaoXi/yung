// 上传服务器
import { Client as SshClient } from 'ssh2'
import chalk from 'chalk'
import { readdir, stat } from 'fs/promises'
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

// 默认并发数：ssh2 的 SFTP 在单通道上支持多个并发请求
const DEFAULT_CONCURRENCY = 10

/**
 * 并发池：限制最大并发数的 map
 */
async function pool<T>(
  items: T[],
  concurrency: number,
  worker: (item: T, index: number) => Promise<void>
): Promise<void> {
  if (items.length === 0) return
  let cursor = 0
  const size = Math.min(concurrency, items.length)
  const runners = new Array(size).fill(0).map(async () => {
    while (cursor < items.length) {
      const idx = cursor++
      await worker(items[idx], idx)
    }
  })
  await Promise.all(runners)
}

/**
 * 递归收集本地目录下的所有子目录和文件
 */
async function collect(
  localDir: string,
  remoteDir: string,
  dirs: string[],
  files: { local: string; remote: string; size: number }[]
): Promise<void> {
  const entries = await readdir(localDir)
  dirs.push(remoteDir)
  for (const name of entries) {
    const localPath = join(localDir, name)
    const remotePath = `${remoteDir}/${name}`
    const stats = await stat(localPath)
    if (stats.isDirectory()) {
      await collect(localPath, remotePath, dirs, files)
    } else {
      files.push({ local: localPath, remote: remotePath, size: stats.size })
    }
  }
}

/**
 * 创建远程目录，忽略“目录已存在”（code 4）
 */
function ensureRemoteDir(sftp: any, remoteDir: string): Promise<void> {
  return new Promise((resolve, reject) => {
    sftp.mkdir(remoteDir, (err: any) => {
      if (err && err.code !== 4) reject(err)
      else resolve()
    })
  })
}

/**
 * 上传单个文件，使用 fastPut（底层分块并发，比 stream pipe 更快）
 */
function uploadFile(sftp: any, local: string, remote: string): Promise<void> {
  return new Promise((resolve, reject) => {
    sftp.fastPut(local, remote, (err: any) => {
      if (err) reject(err)
      else resolve()
    })
  })
}

/**
 * 并发上传整个目录
 * 1. 先递归收集所有目录与文件
 * 2. 按路径深度分层并发创建目录（保证父目录先于子目录）
 * 3. 并发上传所有文件
 */
async function uploadDir(
  sftp: any,
  localDir: string,
  remoteDir: string,
  concurrency = DEFAULT_CONCURRENCY
): Promise<{ dirs: number; files: number; bytes: number }> {
  const dirs: string[] = []
  const files: { local: string; remote: string; size: number }[] = []
  await collect(localDir, remoteDir, dirs, files)

  // 按深度分组，保证父目录先创建
  const byDepth = new Map<number, string[]>()
  for (const d of dirs) {
    const depth = d.split('/').length
    if (!byDepth.has(depth)) byDepth.set(depth, [])
    byDepth.get(depth)!.push(d)
  }
  const depths = [...byDepth.keys()].sort((a, b) => a - b)
  for (const depth of depths) {
    await pool(byDepth.get(depth)!, concurrency, (d) => ensureRemoteDir(sftp, d))
  }

  // 并发上传文件
  let done = 0
  const totalBytes = files.reduce((s, f) => s + f.size, 0)
  await pool(files, concurrency, async (f) => {
    await uploadFile(sftp, f.local, f.remote)
    done++
    if (done % 20 === 0 || done === files.length) {
      log(chalk.blueBright(`  uploaded ${done}/${files.length} files`))
    }
  })

  return { dirs: dirs.length, files: files.length, bytes: totalBytes }
}

async function upCode(codeDir: string, page: string, sshInfo: ServiceType) {
  const { baseDir, codeDir: remoteCodeDir } = sshInfo
  if (!baseDir) throw new Error('remote base dir is missing')

  let sonPath = remoteCodeDir || page
  if (sonPath === '/') sonPath = './'
  if (sonPath[0] === '/') sonPath = sonPath.replace('/', '')
  const upDir = `${baseDir}/${sonPath}`

  log(chalk.hex('#ff328c').bold(`from: ${codeDir}`))
  log(chalk.green(`to: ${upDir}`))
  log(chalk.blueBright('uploading...'))

  return new Promise((resolve, reject) => {
    const conn = new SshClient()
    conn.on('ready', () => {
      conn.sftp((err: any, sftp: any) => {
        if (err) {
          conn.end()
          reject(err)
          return
        }
        const startedAt = Date.now()
        uploadDir(sftp, codeDir, upDir)
          .then(({ files, bytes }) => {
            const secs = ((Date.now() - startedAt) / 1000).toFixed(1)
            const mb = (bytes / 1024 / 1024).toFixed(2)
            log(chalk.green(`  done: ${files} files, ${mb} MB in ${secs}s`))
            conn.end()
            resolve({ from: codeDir, to: upDir, status: 'success' })
          })
          .catch((e) => {
            conn.end()
            reject(e)
          })
      })
    })
      .on('error', reject)
      .connect(sshInfo.ssh)
  })
}

async function deploy(codeDir: string, page = './', sshInfo: ServiceType): Promise<void> {
  try {
    await upCode(codeDir, page, sshInfo)
    log(chalk.green('deploy success'))
  } catch (err: any) {
    log(chalk.red(`
      error when deploy:
      ${err?.message || err}
    `))
    throw err
  }
}

export default deploy