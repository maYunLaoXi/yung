# yung
极简的前端构建工具，基于vite@2.4.3的封装，支持动态入口（多页面）模式。

API不多，使用`yung dev`，和`yung build`即可愉快开发。

继承vite的任意配置和插件，但`root`和`base`会被工具动态替换，从而实现动态入口模式。

有别于类官网的多页面模式，yung每次启动或构建一个页面，从而开发不周需求的项目，但其中已封装的工具或组件是可以复用的。有效的提升开发和维护的效率。

本前仅支持`typeScript`的vite配置文件

> 注： 有关vite的配置请写在项目根目录的`vite.config.ts`文件内。

## 使用

```
npm install yung -g           # 全局
npm install yung --save-dev   # 本地
```

### 基本目录结构

```
- src/
  - page1
    - main.ts                 # page1的脚本入口
    - index.thml              # page1的入口文件
  - page2
    - main.ts                 # page2的脚本入口
    - index.thml              # page2的入口文件
  ... 其他页面
  - main.ts                   # 默认脚本入口
- index.html                  # 默认入口html（遵循vite）
- vite.config.ts              # vite的配置
```
### 启动

本地开发和打包

```
# 全局安装用法：
yung dev                      # 单页模式（vite默认入口）
yung dev page                 # 启动页面page（开发）
yung dev page2                # 启动页面page2（开发）

yung build                    # 构建生产代码（vite默认入口)
yung build page               # 构建page生产代码
yung build page2              # 构建page2生产代码

# 本地安装用法：
npx yung dev                  # 单页模式（vite默认入口）
npx yung dev page             # 启动页面page（开发）
...

npx yung build                # 构建生产代码（vite默认入口)
npx yung build page           # 构建page生产代码
...
```

本地预览生产代码
```
yung preview                  # 预览默认页面（单页模式）
yung preview page             # 预览页面page
```

> 注： 如需在构建生产前进行typescript的类型检查，可先执行`tsc --noEmit`或使用`vue-tsc`。see: [https://vitejs.bootcss.com/guide/features.html#npm-dependency-resolving-and-pre-bundling](https://vitejs.bootcss.com/guide/features.html#npm-dependency-resolving-and-pre-bundling)
## TODO

* 构建生产代码时可以转入多个页面
  ```
  yung build page1 page2
  ```
* 代码跟据目录发布到服务器指定目录