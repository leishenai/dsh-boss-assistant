// stage.mjs —— 生成「可打包」的干净副本到 dist/dsh-boss-assistant2，再原子替换。
// 为什么不在原地打包：源码目录里有 scripts/source/（原始 HTML 副本）与生成脚本，
// 其中一份副本仍带着原页的 localStorage key 字面量；打包件不该带这些。
// 用逐文件拷贝而不是 cpSync：cpSync 在 Windows 上对这个包会异常退出（实测 exit 0xC0000409）。
import { mkdirSync, rmSync, readFileSync, readdirSync, statSync, copyFileSync, renameSync, existsSync } from 'node:fs'
import { join, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')
const dist = join(root, 'dist')
const stage = join(dist, 'dsh-boss-assistant')

const FILES = ['package.json', 'cordis.patch.yml', 'icon.svg', 'README.md', 'LICENSE']
const DIRS = ['dsh', 'lib', 'locale']

rmSync(stage, { recursive: true, force: true })
mkdirSync(stage, { recursive: true })

for (const f of FILES) {
  if (!existsSync(join(root, f))) throw new Error('缺少打包文件：' + f)
  copyFileSync(join(root, f), join(stage, f))
}

const copyDir = (from, to) => {
  mkdirSync(to, { recursive: true })
  for (const name of readdirSync(from)) {
    const src = join(from, name)
    const dst = join(to, name)
    const st = statSync(src)
    if (st.isDirectory()) copyDir(src, dst)
    else copyFileSync(src, dst)
  }
}
for (const d of DIRS) copyDir(join(root, d), join(stage, d))

/** 密检：未替换的模板占位串、密钥样式。命中即失败。 */
const BAD = [
  [/\{\{[A-Za-z0-9_]{8,}\}\}/g, '模板占位串（未替换的 {{token}}）'],
  [/\b(sk-[A-Za-z0-9]{20,}|ghp_[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16})\b/g, '疑似密钥'],
]
const hits = []
const listing = []
let bytes = 0

const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    const st = statSync(p)
    if (st.isDirectory()) {
      walk(p)
      continue
    }
    const rel = relative(stage, p).replace(/\\/g, '/')
    listing.push(rel + '  ' + st.size + ' B')
    bytes += st.size
    if (!/\.(js|mjs|json|css|yml|md|svg)$/i.test(name)) continue
    const text = readFileSync(p, 'utf8')
    for (const [rx, label] of BAD) {
      const m = text.match(rx)
      if (m) hits.push(rel + ' :: ' + label + ' :: ' + m.slice(0, 3).join(' | '))
    }
  }
}
walk(stage)

console.log('files:\n  ' + listing.join('\n  '))
console.log('total: ' + bytes + ' B')
if (hits.length) {
  console.log('secret scan: FAIL\n  ' + hits.join('\n  '))
  process.exit(1)
}
console.log('secret scan: clean')