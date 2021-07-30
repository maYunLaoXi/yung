import path from "path"
import fs from 'fs'
import execa from 'execa'

export interface CliOption {
  page: string,
  base?: string,
  publicDir?: string
}
export interface GLobalCliOptions {
  '--'?: string[]
  base?: string
  root?: string
  [propName: string]: any
}

const { resolve, relative } = path
const cwd = process.cwd()

// 依懒路径
const dependPath: string = resolve(cwd, 'node_modules/vite')
function pagePath(page: string | undefined): string {
  return page ? resolve(cwd, 'src', page) : resolve(cwd)
}

export function rewriteConfig({
  page,
  base = './',
  publicDir = resolve(cwd, 'public')
}: CliOption): string {
  const root = pagePath(page)
  const configPath = resolve(cwd, 'vite.config.ts')
  const tempPath = relative(dependPath, configPath)
  let code = `
    import userConfig from '${tempPath}'
    const inlineConfig = {
      root: '${root}',
      base: '${base}',
      publicDir: '${publicDir}'
    }
  `
  if (!fs.existsSync(configPath)) {
    code += `
      export default inlineConfig
    `
  } else {
    code += `
      export default async function(option) {
        const config = await (typeof userConfig === 'function'
        ? userConfig(option)
        : userConfig)
  
        if(config.root && config.root === '${root}') {
          console.warn('root will be replace by ${root}')
        }
        if(config.base && config.base === '${base}') {
          console.warn('base will be replace by ${base}')
        }
        if(config.publicDir && config.publicDir === '${publicDir}') {
          console.warn('publicDir will be replace by ${publicDir}')
        }
        return Object.assign(config, inlineConfig)
      }
    `
  }
  const yungConfPath = resolve(dependPath, 'yung.config.ts')
  fs.writeFileSync(yungConfPath, code)
  return yungConfPath
}

/**
 * 将对象转化为参数，并且去掉 -- base root的值
 * @param obj GLobalCliOptions
 * @returns 
 */
export function obj2Cmd(obj: GLobalCliOptions):string[] {
  const cmd: string[] = []
  const copy = { ...obj }
  delete copy['--']
  delete copy.base
  delete copy.root
  const keys = Object.keys(copy)
  if (!keys.length) return []
  for (let key in copy) {
    let line = key.length === 1 ? '-' : '--'
    if (typeof copy[key] === 'boolean') {
      cmd.push(`${line}${key}`)
    } else {
      cmd.push(`${line}${key}`, `${copy[key]}`)
    }
  }
  return cmd
}

/**
 * 这样控制台才有颜色显示
 * see https://kohpoll.github.io/blog/2016/09/15/spawn-and-terminal-color/
 * see https://mlog.club/article/1599869
 * */ 
export const run = (bin: string, args: string[], opts = {}) =>
  execa(bin, args, { stdio: 'inherit', ...opts })

export const bin = (name: string) => 
  path.resolve(process.cwd(), 'node_modules/.bin/' + name)
