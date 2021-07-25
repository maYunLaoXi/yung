import { spawn } from 'child_process'

export interface VitePrams {
  cmd: string,
  configPath: string
}

export function runViteCmd({ cmd, configPath }: VitePrams):void {
  spawn(
    'node',
    [require.resolve('vite/bin/vite.js'), cmd, '--config', configPath],
    { 
      /** 
       * 这样控制台才有颜色显示
       * see https://kohpoll.github.io/blog/2016/09/15/spawn-and-terminal-color/
       * see https://mlog.club/article/1599869
       * */ 
      stdio: 'inherit',
      cwd: process.cwd() 
    }
  )
}