import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))

const src = readFileSync('scripts/source/body-static.html', 'utf8')
let b = src
b = b.replace(/<!--\s*pnid:[^>-]*?-->/g, '')
b = b.replace(/(^|[\s>])pnid:[A-Za-z0-9]+-->/g, '$1')
b = b.replace(/\sdata-page-node-id="[^"]*"/g, '')
b = b.replace(/\sdata-pnid-children="[^"]*"/g, '')
b = b.replace(/<body[^>]*>\s*/, '').replace(/<\/body>\s*/g, '')
b = b.replace('">\n        当前身份', '>\n        当前身份')
b = b.replace('">当前身份', '>当前身份')
b = b.replace(/<span class="demo-tag">[\s\S]*?<\/span>/, '<span class="demo-tag" id="demoTag"></span>')
b = b.replace(
  '<div class="spacer"></div>',
  '<div class="spacer"></div>\n      <span class="save-badge" id="saveBadge" title="">\u{1F4BE} 待保存</span>',
)
b = b.replace(/\n{2,}/g, '\n').trim()
// 页面内标题与插件 title 保持一致：侧边栏、页面、插件市场里是同一个名字
const TITLE = JSON.parse(readFileSync(join(here, '..', 'locale', 'zh.json'), 'utf8')).meta.title
b = b.replace('<b>老板超级助手</b><span>人 · 财 · 事 三视图 v1.3</span>', '<b>' + TITLE + '</b><span>人 · 财 · 事 三视图 v1.3 · DSH 插件</span>')
if (/pnid|data-page-node-id/.test(b)) throw new Error('外壳里还有作者标记')

const header = [
  '/* 外壳静态结构：取自源文件 <body>，去掉作者标记（data-page-node-id / pnid 注释）后按原文保留。',
  '   只动三处：演示标签改由运行时填充、插入「保存状态」徽标、demo-tag 文本留空。 */',
].join('\n')

const out = `import { RUNTIME } from './runtime.js'

${header}
export const SHELL_HTML = String.raw\`${b}\`
`
writeFileSync('src/shell.js', out, 'utf8')
console.log('shell.js', out.length, 'B')