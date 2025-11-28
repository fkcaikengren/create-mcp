# create-mcp ⚡
[![npm](https://img.shields.io/npm/v/@caikengren-cli/create-mcp?label=@caikengren-cli%2Fcreate-mcp)](https://www.npmjs.com/package/@caikengren-cli/create-mcp) [![node](https://img.shields.io/node/v/@caikengren-cli/create-mcp?label=node)](https://www.npmjs.com/package/@caikengren-cli/create-mcp)

下一代 MCP 服务器脚手架，一键生成可运行的示例项目。

## 特性
- 即刻开始：通过 `pnpm dlx` 或 `npx` 无需全局安装
- 模板齐全：`template-stdio`（标准输入输出）与 `template-streamable`（HTTP Stream）
- 开箱可用：演示工具覆盖文件统计与实时天气查询
- 极简交互：最少问题、自动更新模板项目 `package.json`
- 现代构建：TypeScript、ESM、`tsdown` 构建与严格 `typecheck`
- 许可证：MIT

## 快速开始
- 使用 `pnpm`：`pnpm dlx @caikengren-cli/create-mcp`
- 使用 `npx`：`npx @caikengren-cli/create-mcp`

随后按照提示选择模板并填写项目名。

## CLI 用法
```
Usage: create-mcp [project-name] [options]

Create a new MCP server project from a template

Options:
  -v, --version          output the version number
  -t, --template <name>  Template to use
  -h, --help             display help for command
```

示例：
- 指定模板并创建：`npx @caikengren-cli/create-mcp my-server -t template-stdio`

## 模板一览

### template-stdio
- 传输方式：`stdio`
- 提供工具：`count_files`（统计指定目录下文件数量）
- 主要文件：
  - `src/server.ts` 注册工具与连接 `StdioServerTransport`
  - `src/main.ts` CLI 入口（子命令 `run-server`）

运行步骤：
- 安装依赖：`pnpm install`
- 构建代码：`pnpm build`
- 运行并调试：
  - 直接运行：`node dist/main.js run-server`
  - 使用 Inspector：`pnpm inspect`

工具输入：
- `path` 目录路径，默认 `.`
- `ignore` 忽略列表，默认 `['node_modules', '.git', 'dist']`

### template-streamable
- 传输方式：`HTTP Stream`（`/mcp` 路由）
- 提供工具：`get_weather_now`（查询当前城市天气）
- 主要文件：
  - `src/server.ts` 注册工具与连接 `StreamableHTTPServerTransport`
  - `src/core/seniverse.ts` 天气接口封装（心知天气）
  - `src/core/index.ts` 从环境变量读取密钥

项目根目录创建`.env`文件，添加环境变量：
```
SENIVERSE_PUBLIC_KEY=你的PublicKey
SENIVERSE_SECRET_KEY=你的SecretKey
PORT=3000
```

运行步骤：
- 安装依赖：`pnpm install`
- 构建代码：`pnpm build`
- 启动服务：`node dist/main.js`
- 访问接口：`http://localhost:3000/mcp`



## 开发与构建
- Node 要求：`>=20`
- 安装依赖：`pnpm install`
- 开发调试：`pnpm start`（运行本仓库 CLI 源码）或 `pnpm dev`（监视构建）
- 生产构建：`pnpm build`
- 类型检查：`pnpm typecheck`


## 发布

切换到 `release` 分支
```
git checkout -b release
```
执行 `pnpm release` 发布。 
```bash
pnpm release
```
然后就会自动，打包，发布npm包，打tag推送release，切回main分支并合并release分支.


## 兼容性
- 引擎：`node >= 20`


## 变更日志
- 请查阅 `CHANGELOG.md`

## 许可证
- MIT，详见 `LICENSE`
