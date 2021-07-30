import { run, bin } from './utils'
export interface VitePrams {
  cmd: string
  configPath: string
  commands: string[]
}

// 执行vite
export function runViteCmd({ cmd, configPath, commands = [] }: VitePrams) {
  commands.push('--config', configPath)
  return run(bin('vite'), [cmd, ...commands])
}
