// smoke.mjs — 不需要浏览器的冒烟验证。用几十行 DOM 桩把 lib/client.js 跑起来，检查：
//   1. __ModuleLoader__ 收到 id = 包名的工厂，工厂返回 { inject, apply }；
//   2. 侧边栏图标与整页成对注册、id 一致（点得动的前提），标签可读；
//   3. 两个组件都能渲染出元素，整页根是 .wb-plugin-root；
//   4. 样式标签只有一份，卸载后归零；
//   5. 外壳 HTML 结构完整（18 个导航项、关键 id 齐全、没有残留的作者标记）。
// 视图渲染、导航点击、数据落盘由真实页面验收。
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import vm from 'node:vm'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')
const code = readFileSync(join(root, 'lib', 'client.js'), 'utf8')

class El {
  constructor(tag) {
    this.tagName = String(tag || 'div').toUpperCase()
    this.children = []
    this.parentNode = null
    this.attrs = {}
    this.style = {}
    this.dataset = {}
    this.id = ''
    this._html = ''
    const set = new Set()
    this.classList = { add: (c) => set.add(c), remove: (c) => set.delete(c), contains: (c) => set.has(c) }
  }
  get innerHTML() {
    return this._html
  }
  set innerHTML(v) {
    this._html = String(v == null ? '' : v)
    this.children = []
    const re = /<div[^>]*\bid="([^"]+)"[^>]*>/g
    let m
    while ((m = re.exec(this._html))) {
      const c = new El('div')
      c.id = m[1]
      this.appendChild(c)
    }
  }
  setAttribute(k, v) {
    if (k === 'id') this.id = String(v)
    if (k === 'class') String(v).split(/\s+/).filter(Boolean).forEach((x) => this.classList.add(x))
    if (k.startsWith('data-')) this.dataset[k.slice(5)] = String(v)
    this.attrs[k] = v
  }
  appendChild(c) {
    c.parentNode = this
    this.children.push(c)
    return c
  }
  removeChild(c) {
    this.children = this.children.filter((x) => x !== c)
    c.parentNode = null
  }
  remove() {
    if (this.parentNode) this.parentNode.removeChild(this)
  }
  querySelector(sel) {
    return sel.startsWith('#') ? findById(this, sel.slice(1)) : null
  }
  querySelectorAll(sel) {
    const out = []
    const wantView = sel.includes('.nav-item')
    walk(this, (n) => {
      if (wantView && n.dataset && n.dataset.view) out.push(n)
    })
    return out
  }
  addEventListener() {}
  removeEventListener() {}
  scrollIntoView() {}
  click() {}
}

function walk(n, fn) {
  fn(n)
  for (const c of n.children) walk(c, fn)
}

function findById(n, id) {
  if (n.id === id) return n
  for (const c of n.children) {
    const r = findById(c, id)
    if (r) return r
  }
  return null
}

const document = {
  head: new El('head'),
  body: new El('body'),
  createElement: (t) => new El(t),
  getElementById: (id) => findById(document.body, id),
  querySelector: (s) => document.body.querySelector(s),
  querySelectorAll: (s) => document.body.querySelectorAll(s),
  addEventListener() {},
  removeEventListener() {},
}

const store = new Map()
const sandbox = {
  console,
  setTimeout,
  clearTimeout,
  requestAnimationFrame: (f) => setTimeout(f, 0),
  document,
  localStorage: {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
  },
  fetch: async (url) => ({
    ok: true,
    status: 200,
    json: async () => ({
      ok: true,
      rev: String(url).endsWith('/state') ? 0 : 1,
      state: null,
      saved: false,
      path: 'D:/stub/state.json',
    }),
  }),
}
sandbox.window = sandbox
sandbox.globalThis = sandbox
vm.createContext(sandbox)

const fail = (m) => {
  console.error('FAIL ' + m)
  process.exit(1)
}
const ok = (m) => console.log('OK   ' + m)

let captured = null
sandbox.__ModuleLoader__ = { load: (v) => (captured = v) }
vm.runInContext(code, sandbox, { filename: 'lib/client.js' })

if (!captured) fail('ModuleLoader.load 没有被调用')
if (captured.id !== 'dsh-boss-assistant') fail('模块 id 与包名不一致: ' + captured.id)

const reactStub = {
  createElement: (type, props, ...kids) => ({ type, props: props || {}, kids }),
  useState: (v) => [v, () => {}],
  useRef: () => ({ current: null }),
  useEffect: () => {},
}
const mod = captured.factory((name) => {
  if (name === 'react') return reactStub
  throw new Error('require 了平台不提供的模块: ' + name)
})
if (!mod || typeof mod.apply !== 'function') fail('工厂返回值没有 apply()')
if (!Array.isArray(mod.inject) || !mod.inject.includes('slots')) fail('注入表里没有 slots')

const regs = []
const ctx = {
  slots: {
    inject(key, cb) {
      regs.push({ key })
      const d = cb()
      if (typeof d === 'function') regs[regs.length - 1].dispose = d
      return () => {}
    },
    register(options, comp) {
      regs.push({ register: options, comp })
      return () => {}
    },
  },
}
const teardown = mod.apply(ctx)

const entries = regs.filter((r) => r.register)
const panel = entries.find((r) => r.register.name === 'sidebar.panellist')
const main = entries.find((r) => r.register.name === 'main')
if (!panel) fail('没有注册 sidebar.panellist')
if (!main) fail('没有注册 main')
if (panel.register.id !== main.register.key) fail('侧边栏 id 与 main key 不一致')
if (!panel.register.label) fail('侧边栏没有标签')
if (typeof panel.comp !== 'function' || typeof main.comp !== 'function') fail('组件不是函数')
ok('槽位成对注册: panellist(id=' + panel.register.id + ') + main(key=' + main.register.key + ')')

const iconTree = panel.comp({ size: 16, active: false })
if (!iconTree || !iconTree.type) fail('侧边栏图标组件没有返回元素')
const pageTree = main.comp({})
if (!pageTree || !pageTree.props || pageTree.props.className !== 'wb-plugin-root') fail('整页根节点不是 .wb-plugin-root')
ok('组件可渲染: 图标为 ' + String(iconTree.type) + '，整页根为 .wb-plugin-root')

const styles = () => document.head.children.filter((c) => c.tagName === 'STYLE')
if (styles().length !== 1) fail('样式标签数量应为 1，实际 ' + styles().length)
if (typeof teardown === 'function') teardown()
if (styles().length !== 0) fail('卸载后样式标签没有移除')
ok('样式生命周期: 注册时 1 份，卸载后归零')

const shellHtml = (code.match(/const SHELL_HTML = String\.raw`([\s\S]*?)`\n/) || [])[1]
if (!shellHtml) fail('产物里找不到 SHELL_HTML')
if (!/class="sidebar"/.test(shellHtml)) fail('外壳里没有侧栏')
if (!/data-view="dashboard"/.test(shellHtml)) fail('外壳里没有导航项')
if (/pnid|data-page-node-id/.test(shellHtml)) fail('外壳里还有作者标记')
const navCount = (shellHtml.match(/class="nav-item"/g) || []).length
if (navCount !== 18) fail('导航项数量应为 18，实际 ' + navCount)
for (const id of ['viewRoot', 'pageTitle', 'roleSwitch', 'saveBadge', 'demoTag']) {
  if (!shellHtml.includes('id="' + id + '"')) fail('外壳缺少 #' + id)
}
ok('外壳结构: 侧栏 + ' + navCount + ' 个导航项 + 5 个关键 id，无作者标记')

console.log('')
console.log('冒烟通过: 5 组检查全过（注册、成对槽位、组件渲染、样式生命周期、外壳结构）')
console.log('视图渲染 / 导航点击 / 数据落盘由真实页面验收，见 README 的验收清单')