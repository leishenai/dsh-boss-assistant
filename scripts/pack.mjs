// pack.mjs —— 把 dist/dsh-boss-assistant 打成 tgz，回头再核对一遍 tgz 里的文件清单。
// 只依赖 npm（tgz 格式与插件管理器安装的一致），不引第三方库。
import { execFileSync } from 'node:child_process'
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gunzipSync } from 'node:zlib'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')
const dist = join(root, 'dist')
const pkg = JSON.parse(readFileSync(join(dist, 'dsh-boss-assistant', 'package.json'), 'utf8'))
const tgz = join(dist, pkg.name + '-' + pkg.version + '.tgz')

execFileSync('npm', ['pack', '--pack-destination', dist, '--silent'], {
  cwd: join(dist, 'dsh-boss-assistant'),
  stdio: 'inherit',
  shell: true,
})

/** 只读 tgz 的头（tar 是 512 字节块），列出文件名与大小，用来核对实际内容。 */
const tar = gunzipSync(readFileSync(tgz))
const entries = []
let offset = 0
while (offset + 512 <= tar.length) {
  const header = tar.subarray(offset, offset + 512)
  const nameEnd = header.indexOf(0)
  const name = header.subarray(0, nameEnd < 0 ? 100 : nameEnd).toString('utf8')
  if (!name) break
  const size = parseInt(header.subarray(124, 136).toString('utf8').replace(/\0/g, '').trim() || '0', 8)
  const type = header.subarray(156, 157).toString('utf8')
  if (type === '0' || type === '\0') entries.push(name + '  ' + size + ' B')
  offset += 512 + Math.ceil(size / 512) * 512
}

const size = statSync(tgz).size
console.log('\ntgz: ' + tgz + ' (' + size + ' B)')
console.log('entries in tgz:\n  ' + entries.join('\n  '))

const must = ['package/package.json', 'package/dsh/index.mjs', 'package/lib/client.js', 'package/cordis.patch.yml', 'package/icon.svg', 'package/README.md']
const missing = must.filter((m) => !entries.some((e) => e.startsWith(m + '  ')))
const leaked = entries.filter((e) => /scripts|source|\.bak|node_modules/.test(e))
if (missing.length) console.log('MISSING: ' + missing.join(', '))
if (leaked.length) console.log('LEAKED: ' + leaked.join(', '))
console.log(missing.length || leaked.length ? 'PACK FAIL' : 'PACK OK')

const report = {
  tgz,
  bytes: size,
  entries: entries.length,
  sha256: null,
}
void report
void readdirSync
void writeFileSync