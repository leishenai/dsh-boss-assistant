## 开发、打包与发布

### 目录与生成链

```
源 HTML（原页，只读）
   │ scripts/build.mjs      （清作者标记 → 修内联引号 → 摘启动副作用 → 持久化改宿主 → render 可重挂载）
   ├── src/runtime.js        整页运行时，收成 RUNTIME 命名空间
   └── src/theme.css         原样式 + 宿主布局约束 + 深色覆盖
   │ scripts/make-shell.mjs （<body> 静态结构 → src/shell.js，标题取 locale/zh.json 的 meta.title）
   │ scripts/build-client.mjs（+ src/client/panel.js + locale → lib/client.js，ModuleLoader CJS 外壳）
   ▼
dsh/index.mjs（宿主半边，手写） + lib/client.js（产物） + cordis.patch.yml + locale + icon.svg
```

### 常用命令

```powershell
npm run build     # 重新生成 src 与 lib/client.js
npm run check     # 16 项自测：语法 + 冒烟（槽位/样式生命周期/外壳结构）+ 宿主半边（路由/409/快照/坏文件/reset/上限）
npm run pack      # 生成干净副本 dist/ 并打成 dist/dsh-boss-assistant-1.0.0.tgz
```

### 打包

`npm run pack` 做三件事：

1. **只拷运行时需要的文件**（`dsh/`、`lib/`、`locale/`、`package.json`、`cordis.patch.yml`、`icon.svg`、`README.md`）——`scripts/source/` 里的原始 HTML 副本与生成脚本不进包；
2. **密检**：`{{...}}` 模板占位串、密钥样式（`sk-` / `ghp_` / `AKIA`）、`\\?\` 长路径，命中就打红退出；
3. `npm pack` 出 tgz，再对 tgz 做一遍文件清单核对。

### 安装（别人拿到 tgz 之后）

插件管理器认本地目录或包地址；tgz 先用 `install_bundle` 指向解压后的目录，或：

```powershell
# 在 profile 目录里
pnpm add "D:\path\to\dsh-boss-assistant-1.0.0.tgz"
# 然后在 cordis.patch.yml 末尾加一行：
# - insert:
#     - id: boss-assistant
#       name: dsh-boss-assistant
#       config: { root: '<你的 DSH_HOME>/boss-assistant', maxSnapshots: 40 }
```

本机已有的一行（`include:boss-assistant`）保持不变，只换包版本时不需要改配置。

### 兼容声明

- `engines.dsh: 0.2.2-rc.1`：客户端半边用 `window.__ModuleLoader__.load({ id, factory })`，宿主半边用 `ctx.connection.fetch.register` 与 zod 4（`.describe()`），这组契约在本机 0.2.2-rc.1 实测。
- 宿主升级时要重验的两处：ModuleLoader 外壳、`fetch.register` 的 `requestBody: 'buffered'`。
- `dsh.host.imports: ['zod']` 声明的是**平台提供的导入**，不是 npm 依赖：包里没有 `dependencies`，安装时不会去装 zod。

### 已知坑（踩过并已修）

| 现象 | 真因 | 处理 |
|---|---|---|
| 启动日志 `failed to import: z.string(...).description is not a function` | 引擎 zod 是 4.x，只有 `.describe()` | 全部改 `.describe()` |
| `exact Fetch route "/api/…/state" is already registered` | bundle 自带 patch 与 profile patch 各插一行，两个实例抢同一组路由 | profile 只留一行同 id 的 insert；宿主侧再加「同名路由已注册就跳过」兜底 |
| 同一插件出现两个侧栏图标 | 面板 id 与包名拆分后没对齐 | `sidebar.panellist.id` 与 `main.key` 必须同值（`boss-assistant`） |
| 数据写到 `D:\workbuddy\工作台\boss-assistant` | `!!js dshHomePath(...)` 在没有环境上下文时退化成进程 cwd | `backendConfig()` 钉死默认路径，与浏览器半边 `fetchHook` 一致 |

### 验收记录

见 [ACCEPTANCE.md](docs/ACCEPTANCE.md)：本地自测 16 项、真实页面路径、逐条「做了什么 → 看到什么」。UI 的最终确认以你在页面上的点击为准，仓库里不附带有隐私的截图。