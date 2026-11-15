# 验收记录 — dsh-boss-assistant 1.0.0

环境：Windows，DSH `0.2.2-rc.1`，profile `web`（`http://127.0.0.1:3080`）。

## 1. 源码与产物层

| 检查 | 命令 | 结果 |
|---|---|---|
| 宿主半边语法 | `node --check dsh/index.mjs` | 通过 |
| 客户端产物语法 | `node --check lib/client.js` | 通过 |
| 转换断言 | `node scripts/build.mjs` | 作者标记 0 处、内联引号 4 处转义、持久化改宿主、render 可重挂载 |
| 冒烟 | `node scripts/smoke.mjs` | 5/5：槽位成对注册、组件可渲染、样式 1→0、外壳 18 导航项 + 关键 id、无作者标记 |
| 宿主半边 | `node scripts/test-host.mjs` | 7/7：空盘读、写读一致、过期 rev 409 不覆盖、写前快照、坏文件 corrupt 且原样保留、reset、快照上限 |
| 包清单 | `python dsh_dev.py doctor` | `missing_export_files: []`，`dsh.bundle` / `dsh.client` / `dsh.host` 三段齐全 |

## 2. profile 与安装层

| 检查 | 结果 |
|---|---|
| profile `package.json`：`dsh.profile.bundles` 含 `dsh-boss-assistant` | 是（卸载走插件管理器） |
| profile `cordis.patch.yml`：`name: dsh-boss-assistant` 的行数 | **1**（id `boss-assistant`，带 `root` / `maxSnapshots`） |
| `cordis_inspect_query` `Config.listConfigs` | 只有 `include:boss-assistant` 一条 |
| `cordis_inspect_query` `Slots.listSubTree(root=sidebar.panellist)` | 占用列表里只有一条 `boss-assistant`（`order 60`） |

## 3. 真实运行层（宿主进程重启后）

| 检查 | 证据 |
|---|---|
| Host 半边激活 | 启动日志 `[boss-assistant] 路由已注册，跳过 /api/boss-assistant/state（write）` —— 兜底生效且没有把插件打断 |
| 侧栏单条 | 页面截图：`老板超级助手 · 人财事三视图` 只出现一次 |
| 页面标题 | 页内左上角标题 = `locale/zh.json` 的 `meta.title`（`老板超级助手 · 人财事三视图`） |
| 自检标记 | 页面控制台 `window.__BOSS_ASSISTANT_LAST__` → `{ id, root, at }` |

## 4. 待你在页面上确认（自动化不冒充）

- [ ] 点侧栏图标 → 18 个视图能逐个切换
- [ ] 顶部身份切「老板 / 管理层 / 员工」→ 菜单随之收缩
- [ ] 任一操作后徽标变 `💾 已保存`，`C:\Users\mingl\.dsh\boss-assistant\state.json` 有内容、`snapshots\` 有新快照
- [ ] 换深色皮肤后卡片/表格/弹窗可读
- [ ] 「权限与数据 → 恢复演示数据」可重置

## 5. 未覆盖

- 其他 DSH 版本（仅 0.2.2-rc.1 实测）；其他操作系统未验证。
- 公开市场收录：未提交，未审核。