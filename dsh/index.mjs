import z from 'zod'
import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  existsSync,
  renameSync,
  statSync,
  readdirSync,
  copyFileSync,
  unlinkSync,
} from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'

/*
 * 老板超级助手 · 人财事三视图 —— 宿主半边（DSH Host / Cordis 插件）
 *
 * 职责：
 *   1. 老板超级助手全量数据（原型里那份 localStorage 对象）落到本机 JSON：原子写 + 乐观锁 + 写前快照；
 *   2. 给浏览器半边开三条同源精确路由（查询串会让装配直接失败，所以路径写死）：
 *        GET  /api/boss-assistant/state   读
 *        POST /api/boss-assistant/state   写（带 rev）
 *        POST /api/boss-assistant/reset   清空（前端随后用种子数据重写）
 *   3. 数据目录默认 $DSH_HOME/boss-assistant，可在 cordis.patch.yml 的 config.root 改。
 *
 * 为什么不用 localStorage 就完事：插件一停用或换机器就全丢；
 * 多标签同时开着时，后写的会把先写的整份盖掉（原型里真踩过）。
 * 所以写盘前比 rev，盘上更新过就回 409 让浏览器回读，谁都不悄悄盖掉谁。
 *
 * ⚠ Config 描述用 zod 4 的 describe()。引擎里装的是 zod 4.6.7，没有 .description()：
 *   写成 .description() 会让整个插件 failed to import（启动日志里能一眼看到）。
 */

export const name = 'dsh-boss-assistant'
export const inject = ['connection']

export const Config = z.object({
  root: z
    .string()
    .describe('老板超级助手数据目录；留空则用 $DSH_HOME/boss-assistant（state.json 与 snapshots/ 都在这里）')
    .default(''),
  maxSnapshots: z.number().int().min(1).max(200).describe('保留多少次写前快照').default(40),
})

const DEFAULT_ROOT = join(process.env.DSH_HOME || join(homedir(), '.dsh'), 'boss-assistant')

/*
 * 没有 config 时（例如插件树被别的方式装载）也要落到同一个目录：
 * 以浏览器半边 fetchHook 使用的路径为准。为什么：config 里的 !!js 表达式在没有环境上下文时
 * 会退化成进程 cwd（实测落到了 D:\workbuddy\老板超级助手），两边各写一份数据是插件里最难查的坑。
 */
const PINNED_ROOT = 'C:/Users/mingl/.dsh/boss-assistant'
function backendConfig() {
  const cfg = globalThis.__BACKEND_CONFIG__
  if (cfg && typeof cfg === 'object' && typeof cfg.root === 'string' && cfg.root.trim()) return cfg
  return Object.freeze({ root: PINNED_ROOT, maxSnapshots: 40 })
}
const STORE_VERSION = 1

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  })

function defaultRoot() {
  return DEFAULT_ROOT
}

export function rootOf(config) {
  const r = config && typeof config.root === 'string' && config.root.trim() ? config.root.trim() : ''
  return r || defaultRoot()
}

const statePath = (root) => join(root, 'state.json')

/** 读盘。解析失败时返回 corrupt 标记并保留坏文件，绝不假装「没有数据」。 */
export function readState(root) {
  const file = statePath(root)
  if (!existsSync(file)) return { exists: false, rev: 0, state: null, corrupt: false }
  let raw
  try {
    raw = readFileSync(file, 'utf8')
  } catch (err) {
    return { exists: true, rev: 0, state: null, corrupt: true, error: String(err.message || err) }
  }
  if (!raw.trim()) return { exists: true, rev: 0, state: null, corrupt: false }
  try {
    const doc = JSON.parse(raw)
    const state =
      doc && typeof doc === 'object' && doc.state && typeof doc.state === 'object'
        ? doc.state
        : doc && typeof doc === 'object' && doc.empty === true
          ? null
          : doc
    const rev = doc && typeof doc === 'object' && Number.isFinite(doc.rev) ? doc.rev : 0
    return { exists: true, rev, state, corrupt: false, savedAt: doc && doc.savedAt }
  } catch (err) {
    return { exists: true, rev: 0, state: null, corrupt: true, error: String(err.message || err) }
  }
}

/** 写盘：临时文件 + rename（NTFS 上覆盖是原子的），失败不会留半个 JSON。 */
export function writeState(root, state, rev) {
  mkdirSync(root, { recursive: true })
  const file = statePath(root)
  const tmp = file + '.tmp-' + process.pid + '-' + Date.now()
  // state 为 null 表示「已清空」：写显式标记，读侧就不会把整份文档误当成数据
  const doc =
    state === null
      ? { version: STORE_VERSION, rev, savedAt: new Date().toISOString(), empty: true }
      : { version: STORE_VERSION, rev, savedAt: new Date().toISOString(), state }
  writeFileSync(tmp, JSON.stringify(doc, null, 1), 'utf8')
  renameSync(tmp, file)
  return rev
}

/** 只保留最近 N 份快照；快照目录是本插件私有，别的什么也不碰。 */
function pruneSnapshots(dir, keep) {
  let files = []
  try {
    files = readdirSync(dir)
      .filter((f) => f.endsWith('.json'))
      .map((f) => ({ name: f, mtime: statSync(join(dir, f)).mtimeMs }))
  } catch {
    return
  }
  files.sort((a, b) => b.mtime - a.mtime)
  for (const f of files.slice(keep)) {
    try {
      unlinkSync(join(dir, f.name))
    } catch {}
  }
}

/** 真正写盘前留一份现场；只读不留，否则 40 份额度一天就用光。 */
export function snapshot(root, reason, keep = 40) {
  const file = statePath(root)
  if (!existsSync(file)) return null
  try {
    const dir = join(root, 'snapshots')
    mkdirSync(dir, { recursive: true })
    const ts = new Date().toISOString().replace(/[:.]/g, '-')
    const tag = String(reason || 'save')
      .replace(/[^\w\u4e00-\u9fa5-]+/g, '_')
      .slice(0, 24)
    let target = join(dir, ts + '__' + tag + '.json')
    let i = 1
    while (existsSync(target)) target = join(dir, ts + '__' + tag + '-' + i++ + '.json')
    copyFileSync(file, target)
    pruneSnapshots(dir, keep)
    return target
  } catch {
    return null
  }
}

/**
 * 注册一条精确路由。「同名路由已存在」说明同一插件被装了两条（两份 config 指向同一份数据），
 * 这不该让整个插件 failed to activate —— 跳过并记一条警告，数据仍由先注册的那条服务。
 */
function safeRegister(connection, route, label, warn) {
  try {
    return connection.fetch.register(route)
  } catch (err) {
    if (String((err && err.message) || err).includes('already registered')) {
      const say = warn && typeof warn === 'function' ? warn : () => {}
      say('[boss-assistant] 路由已注册，跳过 ' + route.path + '（' + label + '）')
      return () => {}
    }
    throw err
  }
}

export function apply(ctx, config) {
  const cfg = config && Object.keys(config).length ? config : backendConfig()
  const root = rootOf(cfg)
  const keep = Math.max(1, Math.min(200, Number(cfg.maxSnapshots) || 40))
  const warn = ctx.logger && typeof ctx.logger.warn === 'function' ? (m) => ctx.logger.warn(m) : undefined
  const info = () => {
    const file = statePath(root)
    const exists = existsSync(file)
    return { root, path: file, exists, size: exists ? statSync(file).size : 0 }
  }

  try {
    mkdirSync(root, { recursive: true })
  } catch (err) {
    if (ctx.logger && typeof ctx.logger.warn === 'function') {
      ctx.logger.warn('[boss-assistant] 数据目录不可用：' + String((err && err.message) || err))
    }
  }

  /* ---------- 读 ---------- */
  const readRoute = safeRegister(ctx.connection, {
    path: '/api/boss-assistant/state',
    methods: ['GET'],
    requestBody: 'buffered',
    async fetch() {
      try {
        const r = readState(root)
        return json({
          ok: true,
          rev: r.rev,
          state: r.state,
          saved: r.exists && !r.corrupt,
          corrupt: r.corrupt,
          error: r.error || null,
          savedAt: r.savedAt || null,
          ...info(),
        })
      } catch (err) {
        return json({ ok: false, error: String((err && err.message) || err) }, 500)
      }
    },
  }, 'read', warn)

  /* ---------- 写 ---------- */
  const writeRoute = safeRegister(ctx.connection, {
    path: '/api/boss-assistant/state',
    methods: ['POST'],
    requestBody: 'buffered',
    async fetch(request) {
      let body
      try {
        body = await request.json()
      } catch {
        return json({ ok: false, error: '请求体不是合法 JSON' }, 400)
      }
      if (!body || typeof body !== 'object' || !body.state || typeof body.state !== 'object') {
        return json({ ok: false, error: '请求体需要 { state, rev }' }, 400)
      }
      try {
        const current = readState(root)
        const baseRev = Number.isFinite(Number(body.rev)) ? Number(body.rev) : 0
        // 只有盘上确实有可解析数据、且版本对不上才算冲突；坏文件按新基线写入（快照已留）
        if (current.exists && !current.corrupt && baseRev !== current.rev) {
          return json(
            {
              ok: false,
              conflict: true,
              rev: current.rev,
              state: current.state,
              error: '盘上 rev=' + current.rev + '，请求 rev=' + baseRev,
            },
            409,
          )
        }
        const snap = snapshot(root, body.reason || 'save', keep)
        const rev = (Number.isFinite(current.rev) ? current.rev : 0) + 1
        writeState(root, body.state, rev)
        return json({ ok: true, rev, snapshot: snap, ...info() })
      } catch (err) {
        return json({ ok: false, error: String((err && err.message) || err) }, 500)
      }
    },
  }, 'write', warn)

  /* ---------- 清空（恢复演示数据前留痕） ---------- */
  const resetRoute = safeRegister(ctx.connection, {
    path: '/api/boss-assistant/reset',
    methods: ['POST'],
    requestBody: 'buffered',
    async fetch() {
      try {
        const snap = snapshot(root, 'reset', keep)
        const current = readState(root)
        const rev = (Number.isFinite(current.rev) ? current.rev : 0) + 1
        writeState(root, null, rev)
        return json({ ok: true, rev, snapshot: snap, ...info() })
      } catch (err) {
        return json({ ok: false, error: String((err && err.message) || err) }, 500)
      }
    },
  }, 'reset', warn)

  // 自检标记：插件装了两行时，后激活的那行会在这里覆盖前一行，页面 `window.__BOSS_ASSISTANT_LAST__` 能看到是谁。
  try { globalThis.__BOSS_ASSISTANT_LAST__ = { id: ctx.fiber && ctx.fiber.entry && ctx.fiber.entry.options && ctx.fiber.entry.options.id, root, at: new Date().toISOString() } } catch {}

  if (ctx.logger && typeof ctx.logger.info === 'function') {
    ctx.logger.info('[boss-assistant] 数据目录 ' + root + ' · 快照保留 ' + keep + ' 份 · 路由 /api/boss-assistant/*')
  }

  return () => {
    for (const dispose of [readRoute, writeRoute, resetRoute]) {
      try {
        if (typeof dispose === 'function') {
          const r = dispose()
          if (r && typeof r.then === 'function') r.catch(() => {})
        }
      } catch {}
    }
  }
}