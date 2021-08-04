import fs, { existsSync } from 'fs'
import path, { resolve } from 'path'
import { build } from 'esbuild'

interface NodeModuleWithCompile extends NodeModule {
  _compile(code: string, filename: string): any
}

// 目前仅对.ts文件作支持
export async function loadConfigFromFile(rootPath = resolve(process.cwd()), fileName = 'yung.config.ts') {
  const resolvePath = resolve(rootPath, fileName)
  if(!existsSync(resolvePath)){
    return {}
  }
  const bundled = await bundleConfigFile(resolvePath)
  const config = await loadConfigFromBundledFile(resolvePath, bundled.code)
  const userConfig = await (typeof config === 'function'
  ? config()
  : config)
  return userConfig
}

async function bundleConfigFile(fileName: string, mjs = false): Promise<{ code: string, dependencies: string[]}> {
  const result = await build({
    absWorkingDir: process.cwd(),
    entryPoints: [fileName],
    outfile: 'out.js',
    write: false,
    platform: 'node',
    bundle: true,
    format: mjs ? 'esm' : 'cjs',
    sourcemap: 'inline',
    metafile: true,
    plugins: [
      {
        name: 'externalize-deps',
        setup(build) {
          build.onResolve({ filter: /.*/ }, (args) => {
            const id = args.path
            if (id[0] !== '.' && !path.isAbsolute(id)) {
              return {
                external: true
              }
            }
          })
        }
      },
      {
        name: 'replace-import-meta',
        setup(build) {
          build.onLoad({ filter: /\.[jt]s$/ }, async (args) => {
            const contents = await fs.promises.readFile(args.path, 'utf8')
            return {
              loader: args.path.endsWith('.ts') ? 'ts' : 'js',
              contents: contents
                .replace(
                  /\bimport\.meta\.url\b/g,
                  JSON.stringify(`file://${args.path}`)
                )
                .replace(
                  /\b__dirname\b/g,
                  JSON.stringify(path.dirname(args.path))
                )
                .replace(/\b__filename\b/g, JSON.stringify(args.path))
            }
          })
        }
      }
    ]
  })
  const { text } = result.outputFiles[0]
  return {
    code: text,
    dependencies: result.metafile ? Object.keys(result.metafile.inputs) : []
  }
}

async function loadConfigFromBundledFile(fileName: string, bundledCode: string) {
  const extension = path.extname(fileName)
  const defaultLoader = require.extensions[extension]!
  require.extensions[extension] = (module: NodeModule, filename: string) => {
    if (fileName === filename) {
      ;(module as NodeModuleWithCompile)._compile(bundledCode, filename)
    } else {
      defaultLoader(module, filename)
    }
  }
  // clear cache in case of server restart
  delete require.cache[require.resolve(fileName)]
  const raw = require(fileName)
  const config = raw.__esModule ? raw.default : raw
  require.extensions[extension] = defaultLoader
  return config
}
