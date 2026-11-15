// build-docs.mjs —— 生成发布用的 README（根 README.md = 插件 README + 开发/打包/发布说明）。
// 为什么拆开写：README.md 是给「装插件的人」看的；开发、打包、发布是给「改它的人」看的。
// 根 README 合并这份文档 + README.md 的插件说明，打包只带 README.md 那部分。
import { readFileSync, writeFileSync } from 'node:fs'

const dev = readFileSync('docs/DEVELOPING.md', 'utf8')
const pluginUser = readFileSync('README.md', 'utf8')
const marker = '\n## 开发、打包与发布\n'
if (pluginUser.includes(marker)) throw new Error('README 已合并过，先还原再跑')
writeFileSync('README.md', pluginUser.replace(/\s*$/, '\n') + marker + '\n' + dev.replace(/^# .*\n/, ''), 'utf8')
writeFileSync('.gitignore', [
  'node_modules/',
  'dist/',
  '*.bak',
  '*.tmp-*',
  '',
].join('\n'), 'utf8')
console.log('README.md merged with docs/DEVELOPING.md')