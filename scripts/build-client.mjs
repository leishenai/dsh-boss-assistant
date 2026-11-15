// build-client.mjs — 把 src/client 合成 DSH 客户端半边的单文件产物。
// 产物形状（宿主认可）：window.__ModuleLoader__.load({ id: '<包名>', factory(require) { … return { inject, apply } } })
// 只 require 平台种子表里的 react；不用 esbuild，纯字符串拼接 + node --check 兜底。

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
const read = (p) => readFileSync(join(root, p), 'utf8')

const runtime = read('src/runtime.js').replace(/^export const RUNTIME = \(\(\) => \{/m, 'const RUNTIME = (() => {')
const theme = read('src/theme.css')
let shell = read('src/shell.js')
let panel = read('src/client/panel.js')

/* 把外壳结构内联进面板组件（String.raw + 反引号要转义） */
const shellHtml = shell.match(/export const SHELL_HTML = String\.raw`([\s\S]*)`\s*$/)
if (!shellHtml) throw new Error('shell.js 里找不到 SHELL_HTML')
const shellEscaped = shellHtml[1].replace(/`/g, '\\`').replace(/\$\{/g, '\\${')

const panelCode = panel
  .replace(/export const SHELL_HTML = String\.raw`__SHELL_HTML__`/, 'export const SHELL_HTML = String.raw`' + shellEscaped + '`')
  .replace(/^import \{ RUNTIME \} from '\.\/runtime\.js'\s*$/m, '')
  .replace(/^export \{ RUNTIME \}.*$/m, '')
  .replace(/\bexport function createWorkbench\b/, 'function createWorkbench')
  .replace(/^export (const|function|class) /gm, '$1 ')

const themeEscaped = theme.replace(/`/g, '\\`').replace(/\$\{/g, '\\${')

const out = `// ${pkg.name} client half — 由 scripts/build-client.mjs 生成，勿手改。
window.__ModuleLoader__.load({
  id: ${JSON.stringify(pkg.name)},
  factory(require) {
    const React = require('react')

${runtime}

${panelCode}

    /* ---------------- 侧边栏图标（PanellistIcon）与整页（WorkbenchPage） ---------------- */
    const PANEL_ID = 'boss-assistant'
    const PANEL_LABEL = ${JSON.stringify(JSON.parse(readFileSync(join(root, 'locale', 'zh.json'), 'utf8')).meta.title)}

    function PanellistIcon(props) {
      const size = (props && props.size) || 16
      const active = !!(props && props.active)
      return React.createElement(
        'span',
        {
          'aria-hidden': true,
          style: {
            width: size,
            height: size,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: active ? 'var(--dsw-alias-brand-primary)' : 'var(--dsw-alias-label-secondary)',
          },
        },
        React.createElement(
          'svg',
          { viewBox: '0 0 16 16', width: size, height: size, fill: 'none' },
          React.createElement('rect', { x: 1.5, y: 2, width: 13, height: 12, rx: 2, stroke: 'currentColor', strokeWidth: 1.3 }),
          React.createElement('path', { d: 'M4.6 5.6h3.4M4.6 8h6.8M4.6 10.4h4.6', stroke: 'currentColor', strokeWidth: 1.3, strokeLinecap: 'round' }),
        ),
      )
    }

    const WorkbenchPage = createWorkbench(React)

    const CSS = \`${themeEscaped}\`

    return {
      inject: ['slots'],
      apply(ctx) {
        const style = document.createElement('style')
        style.dataset.pluginCss = ${JSON.stringify(pkg.name)}
        style.textContent = CSS
        document.head.appendChild(style)

        const disposers = []
        const guard = (key, fn) => {
          try {
            return fn()
          } catch (err) {
            console.error('${pkg.name}: 槽位注册失败 ' + key, err)
            return () => {}
          }
        }
        if (ctx.slots) {
          // 侧边栏图标与整页必须同 id：点图标 = layout.selectPanel(id)，key 不存在会抛错并保留原选中态
          disposers.push(ctx.slots.inject('sidebar.panellist', () => guard('sidebar.panellist', () => ctx.slots.register({
            name: 'sidebar.panellist', id: PANEL_ID, order: 60, label: PANEL_LABEL,
          }, PanellistIcon))))
          disposers.push(ctx.slots.inject('main', () => guard('main', () => ctx.slots.register({
            name: 'main', key: PANEL_ID,
          }, WorkbenchPage))))
        }

        return () => {
          for (const d of disposers) {
            try { d() } catch {}
          }
          style.remove()
        }
      },
    }
  },
})
`

mkdirSync(join(root, 'lib'), { recursive: true })
writeFileSync(join(root, 'lib', 'client.js'), out, 'utf8')
console.log('lib/client.js', out.length, 'B')