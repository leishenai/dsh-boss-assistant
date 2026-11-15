<!--badges-->
![DSH](https://img.shields.io/badge/DeepSeek%20Harness-0.2.2--rc.1-2456e6) ![license](https://img.shields.io/badge/license-MIT-green)
# 老板超级助手 · 人财事三视图（DSH 客户端插件）

把 `index-1115.html` 那一整页「老板超级助手」收成 **DSH 客户端插件**：左侧多一个图标（名字就是「老板超级助手 · 人财事三视图」），点开就是整页老板超级助手（中央 `main` 面板），18 个视图照旧；数据从 `localStorage` 挪到本机 JSON，写入前留快照。

| 项 | 值 |
|---|---|
| 包名 | `dsh-boss-assistant` |
| 侧边栏 / 面板 id | `boss-assistant` |
| 源码 | `D:\workbuddy\工作台\dsh-boss-assistant` |
| 数据 | `C:\Users\mingl\.dsh\boss-assistant\state.json`（`snapshots\` 留最近 40 次写前快照） |
| 路由 | `GET/POST /api/boss-assistant/state`、`POST /api/boss-assistant/reset` |
| profile 配置 | `C:\Users\mingl\.dsh\profiles\web\cordis.patch.yml` 末尾 **一行** `- insert: - id: boss-assistant` |

## 为什么不是「把 HTML 塞进去」

| 原页的做法 | 插件里的做法 | 原因 |
|---|---|---|
| 整页 `<body>` + 自带侧栏 | React 外壳只渲染一层 `.wb-plugin-root`，原 `<body>` 结构（已去作者标记）挂进去 | 在宿主里它只是中央面板，不能占满整个应用 |
| 启动即 `render()` + 全局内联 `onclick` | `RUNTIME.mount()` / `unmount()` 两个入口，内联函数统一挂到 `window` | 挂载/卸载要可控，卸载要把 `modal`、键盘监听、防抖计时器收干净 |
| `localStorage` 存全量数据 | 宿主三条同源路由 + `rev` 乐观锁 + 写前快照 | 停用/换机器不丢；多标签同时写不会互相覆盖 |
| 每个标签带 `data-page-node-id` / `pnid` 注释 | 生成时清除 | 那是网页编辑器的作者标记，插件里没用 |
| 内联事件里 `'${x||''}'` 嵌套引号 | 统一改成 `\x27` 转义 | 表达式为空时会提前闭合属性，整段脚本报 SyntaxError |

转换全部在 `scripts/build.mjs` 里完成，**原 HTML 只读不改**；每一步先断言锚点存在，改不到就报错，不静默产出半成品。

## 目录

```
dsh-boss-assistant/
├─ dsh/index.mjs             宿主半边：落盘 + 三条路由 + 同名路由兜底（Config: root / maxSnapshots）
├─ lib/client.js             客户端产物（scripts/build-client.mjs 生成，勿手改）
├─ src/                      生成物：runtime.js（整页运行时）/ shell.js（外壳结构）/ theme.css
├─ src/client/panel.js       React 外壳：把 shell 挂进 #wbShell，再交给 RUNTIME.mount()
├─ scripts/build.mjs         源 HTML → src/runtime.js + src/theme.css
├─ scripts/make-shell.mjs    源 <body> → src/shell.js（标题取 locale/zh.json 的 meta.title）
├─ scripts/build-client.mjs  合成 lib/client.js（ModuleLoader 外壳，只 require react）
├─ scripts/smoke.mjs         冒烟：槽位成对注册 / 组件可渲染 / 样式生命周期 / 外壳结构
├─ scripts/test-host.mjs     宿主半边离线测试：路由 / 写入 / 409 / 快照 / 坏文件 / reset / 上限
├─ locale/{zh,en}.json       插件市场里显示的名称与说明
└─ icon.svg
```

## 构建与自测

```powershell
cd D:\workbuddy\工作台\dsh-boss-assistant
npm run build     # 重新生成 src 与 lib/client.js
npm run check     # 语法检查 + 冒烟 + 宿主半边测试（16 项）
```

`test-host.mjs` 在临时目录里造一个 `node_modules/zod` 垫片跑被测文件（工作区没有 node_modules），跑完即删。

## 安装与启用

安装时 `plugin_manager install_bundle` 会把包加进 profile 的 bundle 列表，**同时** bundle 自带的 `cordis.patch.yml` 也会插入一行 —— 两行同 id 会让第二个在注册路由时撞名。本机的收口做法：

1. `profiles\web\package.json` 的 `dsh.profile.bundles` 里**保留** `dsh-boss-assistant`（包还装在那儿，卸载走插件管理器）；
2. `profiles\web\cordis.patch.yml` 里只留**一行** `- insert: - id: boss-assistant`，带 `root` 与 `maxSnapshots`；
3. bundle 自带那份 patch 与它同 id（`boss-assistant`），两行 merge 成一行；
4. 宿主半边对「同名路由已注册」做了兜底：万一仍被装成两行，第二条只记一条警告、不把整条装配打断。

改 `lib/client.js` 后客户端半边走 HMR 自动重载；改 `dsh/index.mjs` 需要重启 DSH。

## 验收清单（在页面上逐条点一遍）

- [ ] 左侧栏出现「老板超级助手 · 人财事三视图」图标，整页只有这一个（不再有重复项）
- [ ] 点开后是 18 个视图的整页：总览驾驶舱 / 消息中心 / 任务派活 / 项目台账 / 人员状态 / 进出一张表 / 损益一页纸 / 商机漏斗 / 老板周报 / 提醒哨兵 / 问答 / 采集 / 社交 / AI 与 Token / 埋点 / 留痕 / 导入 / 权限与数据
- [ ] 顶部「当前身份」切老板 / 管理层 / 员工，菜单随之收缩（权限 v0）
- [ ] 任一操作（如“提醒哨兵 → 派活”）后，右侧出现 `💾 已保存`；悬停能看到 `state.json` 路径与 rev
- [ ] 页脚状态行显示数据文件路径；`C:\Users\mingl\.dsh\boss-assistant\state.json` 里有对应内容，`snapshots\` 里出现新快照
- [ ] 深色主题下（右上角换皮肤）卡片、表格、弹窗都可读
- [ ] 「权限与数据 → 恢复演示数据」可重置，重置前先留快照

## 已知边界

- 数据目录以 `state.json` 实际落点为准：`backendConfig()` 在没有 config 时钉死到 `C:/Users/mingl/.dsh/boss-assistant`，与浏览器半边 `fetchHook` 用的路径一致。同一份插件绝不能出现两个数据目录（config 里的 `!!js` 表达式在没有环境上下文时会退化成进程 cwd，实测会落到 `D:\workbuddy\工作台`）。
- 视图内部仍是「字符串 HTML + 全局函数」的既有写法：每次 `render()` 整块替换 `#viewRoot`，所以 React 只接管容器，不接管视图。
- 首次打开用的是原型里的演示快照（项目/回款为真实快照、人员与支出为演示）。
- 自检：页面控制台执行 `window.__BOSS_ASSISTANT_LAST__` 能看到当前生效那一行（id / 数据目录 / 激活时间）。

## 开发、打包与发布

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