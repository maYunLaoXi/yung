# yung
前端构建工具，基于vite的封装，支持动态入口模式。

继承vite的任意配置和插件，但`root`和`base`会被工具动态替换，从而实现动太入口模式。

本前仅支持`typeScript`的vite配置文件

## 使用
```
npm install yung -g           # 全局
npm install yung --save-dev   # 本地
```


## 基本目录结构

```
- src/
vite.config.ts
```