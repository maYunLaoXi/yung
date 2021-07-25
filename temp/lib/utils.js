import path from "path/posix";
import fs from 'fs';
const { resolve, relative } = path;
const cwd = process.cwd();
// 依懒路径
const dependPath = resolve(cwd, 'node_modules/yung/temp');
function pagePath(page) {
    return page ? resolve(cwd, 'src', page) : resolve(cwd);
}
export function rewriteConfig({ page, base = './', publicDir = resolve(cwd, 'public') }) {
    const root = pagePath(page);
    const configPath = resolve(cwd, 'vite.config.ts');
    const tempPath = relative(dependPath, configPath);
    let code = `
    import userConfig from '${tempPath}'
    const inlineConfig = {
      root: '${root}',
      base: '${base}',
      publicDir: '${publicDir}'
    }
  `;
    if (!fs.existsSync(configPath)) {
        code += `
      export default inlineConfig
    `;
    }
    else {
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
    `;
    }
    const yungConfPath = resolve(dependPath, 'yung.congig.ts');
    fs.writeFileSync(yungConfPath, code);
    return yungConfPath;
}
