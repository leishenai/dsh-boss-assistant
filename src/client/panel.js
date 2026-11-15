import { RUNTIME } from './runtime.js'

/**
 * 老板超级助手页面本体（main 槽的占位者）。
 *
 * 原页是一整页 HTML：自己画侧栏、用 innerHTML 换视图。放进 DSH 后它只是中央面板里的一个页面，
 * 所以这里只做「容器」这一层，视图逻辑仍归运行时（views 生成字符串 HTML，原样保留）：
 *   1. 铺 .wb-plugin-root 占满面板、自己滚，不撑破宿主三栏布局；
 *   2. 把去掉作者标记的原 <body> 结构挂进来（SHELL_HTML）；
 *   3. RUNTIME.mount() 绑导航/身份切换并画第一个视图；卸载时 RUNTIME.unmount() 收干净。
 * 宿主读不到数据时退回浏览器本地缓存打开，并明说「这次不会写回本机文件」。
 */
export const SHELL_HTML = String.raw`__SHELL_HTML__`

export function createWorkbench(React) {
  return function Workbench() {
    const rootRef = React.useRef(null)
    const [phase, setPhase] = React.useState('loading')
    const [notice, setNotice] = React.useState('')

    React.useEffect(() => {
      let alive = true
      const el = rootRef.current && rootRef.current.querySelector('#wbShell')
      if (!el) return undefined
      el.innerHTML = SHELL_HTML
      const tag = el.querySelector('#demoTag')
      if (tag) tag.textContent = '项目/回款为真实快照 · 人员与支出为演示 · 基准日 ' + RUNTIME.demoDate

      RUNTIME
        .loadStore()
        .then((loaded) => {
          if (!alive) return
          RUNTIME.mount(loaded.state, loaded.info)
          setPhase('ready')
          if (loaded.info && loaded.info.corrupt) setNotice('盘上 state.json 解析失败，已按演示数据打开；坏文件原样保留，可人工修复。')
        })
        .catch((err) => {
          if (!alive) return
          RUNTIME.mount(null, null)
          setPhase('local')
          setNotice('宿主未连上（' + String((err && err.message) || err) + '），当前用浏览器本地缓存打开：这次改动不会写回本机文件。')
        })

      return () => {
        alive = false
        RUNTIME.unmount()
        el.innerHTML = ''
      }
    }, [])

    return React.createElement(
      'div',
      { className: 'wb-plugin-root', 'data-wb-phase': phase, ref: rootRef },
      React.createElement('div', { id: 'wbShell', className: 'wb-shell-host' }),
      phase === 'loading'
        ? React.createElement('div', { className: 'lock-view' }, React.createElement('div', { className: 'big' }, '⏳'), React.createElement('div', null, '正在读取老板超级助手数据…'))
        : null,
      notice ? React.createElement('div', { className: 'riskbar', style: { margin: '8px 22px' } }, notice) : null,
      React.createElement('div', { className: 'wb-foot-note' }, '数据在本机 ' + (RUNTIME.store().path || '（尚未写入）') + ' · 每次写入前留快照'),
    )
  }
}