// test-host.mjs — 宿主半边离线测试：不起 DSH，直接把 dsh/index.mjs 装到假 ctx 上，
// 用真的 Request/Response 打三条路由，验证最容易翻车的七件事：
//   空盘读取 / 写入与读回 / 过期 rev 的 409 / 写前快照 / 坏文件不冒充空数据 / reset / 快照保留上限。
//
// 宿主里 `zod` 由平台以 ESM 提供，工作区没有 node_modules；这里先在临时目录建一个
// `node_modules/zod` 垫片（只有 Config 需要的那几个方法），把被测文件复制过去再跑，跑完即删。

import { mkdtempSync, existsSync, rmSync, readdirSync, readFileSync, writeFileSync, mkdirSync, cpSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const fail = (m) => {
  console.error('FAIL ' + m)
  process.exit(1)
}
const ok = (m) => console.log('OK   ' + m)

const sandbox = mkdtempSync(join(tmpdir(), 'desk-wb-'))
const nodeModules = join(sandbox, 'node_modules', 'zod')
mkdirSync(nodeModules, { recursive: true })
writeFileSync(
  join(nodeModules, 'package.json'),
  JSON.stringify({ name: 'zod', version: '0.0.0-stub', type: 'module', main: 'index.js' }),
)
writeFileSync(
  join(nodeModules, 'index.js'),
  [
    'function make(defaultValue) {',
    '  const api = { describe: () => api, description: () => api, default: (v) => make(v), int: () => api, min: () => api, max: () => api }',
    '  api._default = defaultValue',
    '  return api',
    '}',
    'export default { object: (shape) => ({ shape }), string: () => make(""), number: () => make(0) }',
  ].join('\n'),
)
const hostDir = join(sandbox, 'dsh')
mkdirSync(hostDir, { recursive: true })
cpSync(join(import.meta.dirname, '..', 'dsh', 'index.mjs'), join(hostDir, 'index.mjs'))
writeFileSync(join(sandbox, 'package.json'), JSON.stringify({ name: 'desk-wb-test', type: 'module' }))

const mod = await import(pathToFileURL(join(sandbox, 'dsh', 'index.mjs')).href)
ok('宿主模块可加载: name=' + mod.name + ' inject=' + mod.inject.join(',') + ' Config=' + (mod.Config ? 'yes' : 'no'))
if (typeof mod.apply !== 'function') fail('没有导出 apply()')
if (!Array.isArray(mod.inject) || !mod.inject.includes('connection')) fail('inject 里没有 connection')

const dataDir = join(sandbox, 'data')
const routes = new Map()
const ctx = {
  connection: {
    fetch: {
      register(r) {
        routes.set(r.methods.join(',') + ' ' + r.path, r)
        return async () => {}
      },
    },
  },
  logger: { info() {}, warn() {} },
}
const teardown = mod.apply(ctx, { root: dataDir, maxSnapshots: 3 })
const readRoute = routes.get('GET /api/boss-assistant/state')
const writeRoute = routes.get('POST /api/boss-assistant/state')
const resetRoute = routes.get('POST /api/boss-assistant/reset')
if (!readRoute || !writeRoute || !resetRoute) fail('三条路由没注册全: ' + [...routes.keys()].join(' | '))
ok('路由注册: ' + [...routes.keys()].join(' | '))

const call = async (route, init) => {
  const res = await route.fetch(new Request('http://127.0.0.1' + route.path, init))
  return { status: res.status, body: await res.json() }
}

let r = await call(readRoute, { method: 'GET' })
if (r.status !== 200 || r.body.state !== null || r.body.saved !== false) fail('空盘读取异常')
ok('空盘读取: state=null, saved=false')

const sample = { projects: [{ id: 'P1', name: '测试项目' }], people: [], audit: [] }
r = await call(writeRoute, { method: 'POST', body: JSON.stringify({ state: sample, rev: 0 }) })
if (r.status !== 200 || r.body.rev !== 1) fail('首次写入异常: ' + JSON.stringify(r.body))
ok('首次写入 rev=1（' + r.body.size + ' B）')

r = await call(readRoute, { method: 'GET' })
if (!r.body.saved || JSON.stringify(r.body.state) !== JSON.stringify(sample)) fail('读回不一致')
ok('读回一致 rev=' + r.body.rev)

const stale = await call(writeRoute, { method: 'POST', body: JSON.stringify({ state: { hacked: 1 }, rev: 0 }) })
if (stale.status !== 409 || !stale.body.conflict) fail('过期 rev 未拦截: ' + stale.status)
const after = await call(readRoute, { method: 'GET' })
if (JSON.stringify(after.body.state) !== JSON.stringify(sample)) fail('冲突写入被落地了')
ok('过期 rev: 409 conflict，盘上数据未被覆盖')

r = await call(writeRoute, { method: 'POST', body: JSON.stringify({ state: Object.assign({}, sample, { mark: 2 }), rev: 1 }) })
if (r.status !== 200 || r.body.rev !== 2) fail('二次写入异常: ' + JSON.stringify(r.body))
const snaps = join(dataDir, 'snapshots')
const files = () => (existsSync(snaps) ? readdirSync(snaps).filter((f) => f.endsWith('.json')) : [])
if (!files().length) fail('没有生成写前快照')
ok('写前快照 ' + files().length + ' 份')

writeFileSync(join(dataDir, 'state.json'), '{ 坏掉的 JSON', 'utf8')
r = await call(readRoute, { method: 'GET' })
if (r.body.corrupt !== true) fail('坏文件未报 corrupt')
if (readFileSync(join(dataDir, 'state.json'), 'utf8') !== '{ 坏掉的 JSON') fail('坏文件被改写')
ok('坏文件: 报 corrupt=true 且原样保留')

r = await call(resetRoute, { method: 'POST', body: '{}' })
if (r.status !== 200 || !r.body.ok) fail('reset 失败')
r = await call(readRoute, { method: 'GET' })
if (r.body.state !== null) fail('reset 后不为空')
ok('reset: 清空并留快照 rev=' + r.body.rev)

let rev = r.body.rev
for (let i = 0; i < 6; i++) {
  const w = await call(writeRoute, { method: 'POST', body: JSON.stringify({ state: { n: i }, rev }) })
  if (w.status !== 200) fail('循环写入失败 rev=' + rev + ' -> ' + JSON.stringify(w.body))
  rev = w.body.rev
}
if (files().length > 3) fail('快照保留上限没生效: ' + files().length)
ok('快照上限: 保留 ' + files().length + ' 份（配置 3）')

if (typeof teardown === 'function') teardown()
rmSync(sandbox, { recursive: true, force: true })
ok('卸载清理 + 临时沙箱已删')
console.log('')
console.log('宿主半边测试通过: 路由 / 写入 / 冲突 / 快照 / 坏文件 / 重置 / 上限 7 组全过')