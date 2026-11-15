import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join, basename } from 'node:path'
import { fileURLToPath } from 'node:url'

/*
 * build.mjs — 把「老板超级助手 · 人财事三视图」单文件 HTML 转成 DSH 插件的运行时。
 * 用法：node scripts/build.mjs [源 HTML]
 * 产物：src/runtime.js（整页运行时，收进 RUNTIME 命名空间）、src/theme.css
 *
 * 为什么需要这一层（原文件只读，不手改）：
 *  1. 每个标签带 data-page-node-id / pnid 注释，是网页编辑器的作者标记；
 *  2. 脚本是一个大 IIFE，内部同名 const 遍布各视图函数，直接改会造成重复声明；
 *  3. 整页渲染 + 内联 onclick 在宿主里必须收敛成「挂载/卸载」两个入口；
 *  4. 数据原来只写 localStorage，插件里改由宿主落盘（带乐观锁）。
 * 下面每一步都先断言锚点存在，改不到就报错，不会静默产出半成品。
 */

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')
const srcPath = process.argv[2] || join(here, 'source', 'wb-nosrc.html')
const html = readFileSync(srcPath, 'utf8')
const out = (...p) => join(root, ...p)
mkdirSync(out('src'), { recursive: true })

const report = []
let js = html.match(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/)[1]
let css = html.match(/<style[^>]*>([\s\S]*?)<\/style>/)[1]
const must = (cond, msg) => {
  if (!cond) throw new Error('锚点缺失：' + msg)
}

/* 1. 作者标记 */
const marks = (js.match(/data-page-node-id|pnid/g) || []).length
js = js.replace(/\sdata-page-node-id="[^"]*"/g, '')
js = js.replace(/\sdata-pnid-children="[^"]*"/g, '')
js = js.replace(/<!--\s*pnid:[^>-]*?-->/g, '')
css = css.replace(/^[^:{}]*data-page-node-id="[^"]*"\s*data-pnid-children="[^"]*"\s*\n?/, '')
css = css.replace(/\sdata-page-node-id="[^"]*"/g, '')
report.push('作者标记：' + marks + ' 处 → 0（js 与 css）')

/* 2. 内联 onclick 里的嵌套引号：'${x||''}' 展开后会把属性提前闭合 */
let quotes = 0
js = js.replace(/'\$\{([^{}]*\|\|[^{}]*)\}'/g, (_m, expr) => {
  quotes += 1
  return '\\x27${' + expr + '}\\x27'
})
report.push('内联事件嵌套引号：' + quotes + ' 处改为 \\x27 转义')

/* 3. 启动副作用与外壳绑定交给 React 外壳 */
const bootAt = js.lastIndexOf('/* ---- 启动 ---- */')
must(bootAt > 0, '启动段')
js = js.slice(0, bootAt)
const bindRx = /document\.querySelectorAll\('\.nav-item'\)\.forEach\(el=>el\.onclick=\(\)=>nav\(el\.dataset\.view\)\);\s*\ndocument\.getElementById\('roleSwitch'\)\.addEventListener\('click',e=>\{[\s\S]*?\}\);\s*\n/
must(bindRx.test(js), 'nav/roleSwitch 绑定段')
js = js.replace(bindRx, '')
report.push('启动副作用与外壳绑定已剥离，改由 React 外壳 mount/bindShell')

/* 4. 持久化：localStorage → 宿主 /api/boss-assistant/state（rev 乐观锁） */
must(js.includes("const LS_KEY='{PLACEHOLDER_A}';"), 'LS_KEY 常量')
js = js.replace(
  "const LS_KEY='{PLACEHOLDER_A}';",
  [
    "const LS_KEY='{PLACEHOLDER_A}';",
    "const STORE_URL='/api/boss-assistant/state';",
    "let STORE_INFO={rev:0,path:'',saved:false,corrupt:false,lastError:'',writable:false};",
  ].join('\n'),
)

const loadRx = /function load\(\)\{[\s\S]*?\n\}/
must(loadRx.test(js), 'load()')
js = js.replace(
  loadRx,
  [
    'function load(){',
    '  let d=null;',
    "  try{ const raw=localStorage.getItem(LS_KEY); if(raw) d=JSON.parse(raw);}catch(e){}",
    "  if(!d||typeof d!=='object')d=JSON.parse(JSON.stringify(SEED));",
    '  return withDefaults(d);',
    '}',
  ].join('\n'),
)

const saveRx = /function save\(\)\{ try\{localStorage\.setItem\(LS_KEY,JSON\.stringify\(S\)\);\}catch\(e\)\{\} \}/
must(saveRx.test(js), 'save()')
js = js.replace(
  saveRx,
  [
    'function save(){',
    '  try{localStorage.setItem(LS_KEY,JSON.stringify(S));}catch(e){}',
    '  pushState();',
    '}',
    '/** 新增字段对旧存档做无损补全（不升级 LS_KEY，保留用户已导入的真实数据） */',
    'function withDefaults(d){',
    "  ['goal','pnlExpense','pipeline','talent'].forEach(k=>{ if(d[k]===undefined||d[k]===null)d[k]=JSON.parse(JSON.stringify(SEED[k])); });",
    "  if(d.wnVersion===undefined)d.wnVersion='';",
    '  return d;',
    '}',
    '/* ---- 宿主持久化：浏览器半边只走这三条同源路由 ---- */',
    'let pushTimer=null;',
    'let pushClosed=false;',
    'async function readStore(){',
    "  const r=await fetch(STORE_URL,{headers:{accept:'application/json'},cache:'no-store'});",
    "  if(!r.ok)throw new Error('宿主返回 '+r.status);",
    '  const j=await r.json();',
    "  if(!j||!j.ok)throw new Error((j&&j.error)||'宿主未返回数据');",
    '  return j;',
    '}',
    'async function loadStore(){',
    '  const j=await readStore();',
    "  const info={rev:j.rev||0,path:j.path||'',saved:!!j.saved,corrupt:!!j.corrupt,savedAt:j.savedAt||'',writable:true,lastError:''};",
    "  return {state:(j.state&&typeof j.state==='object')?withDefaults(j.state):null,info};",
    '}',
    'function pushState(){',
    '  if(pushClosed||!STORE_INFO.writable)return;',
    '  if(pushTimer)clearTimeout(pushTimer);',
    '  pushTimer=setTimeout(async()=>{',
    '    if(pushClosed)return;',
    '    try{',
    "      const r=await fetch(STORE_URL,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({state:S,rev:STORE_INFO.rev})});",
    '      const j=await r.json().catch(()=>null);',
    '      if(r.ok&&j&&j.ok){STORE_INFO.rev=j.rev;STORE_INFO.path=j.path||STORE_INFO.path;STORE_INFO.saved=true;STORE_INFO.lastError="";}',
    '      else if(j&&j.conflict){ /* 盘上更新过：以宿主为准，别互相覆盖 */',
    '        const g=await readStore();',
    "        if(g.state&&typeof g.state==='object'){S=withDefaults(g.state);STORE_INFO.rev=g.rev;STORE_INFO.saved=true;STORE_INFO.lastError='';applyDateMode();render();}",
    "      } else { STORE_INFO.saved=false; STORE_INFO.lastError=(j&&j.error)||('HTTP '+r.status); }",
    "    }catch(e){ STORE_INFO.saved=false; STORE_INFO.lastError=String((e&&e.message)||e); }",
    '    renderSaveBadge();',
    '  },400);',
    '}',
  ].join('\n'),
)
report.push('持久化：localStorage → 宿主 /api/boss-assistant/state（rev 乐观锁 + 冲突回读）')

/* 5. 渲染：整块 innerHTML → 可重复挂载（多次挂载不叠监听、不叠 modal） */
const renderRx = /function render\(\)\{[\s\S]*?\n\}/
must(renderRx.test(js), 'render()')
js = js.replace(
  renderRx,
  [
    'function render(){',
    "  const host=document.getElementById('wbShell');",
    '  if(!host){return;}                 // 外壳未挂载：等 mount()',
    "  if(!can(state.view))state.view='dashboard';",
    "  document.querySelectorAll('#wbShell .nav-item').forEach(el=>{",
    "    el.classList.toggle('active',el.dataset.view===state.view);",
    "    el.style.display=can(el.dataset.view)?'':'none';",
    '  });',
    "  const title=document.getElementById('pageTitle');",
    '  if(title)title.textContent=VIEWS[state.view].t;',
    "  const root=document.getElementById('viewRoot');",
    '  root.innerHTML=VIEWS[state.view].render();',
    '  renderModal();',
    '  const n=allAlerts().length+msgStats().pending;',
    "  ['navAlertBadge','navAlertBadge2'].forEach(id=>{const b=document.getElementById(id);if(!b)return;b.textContent=n||'';b.style.display=n?'':'none';});",
    "  document.querySelectorAll('#roleSwitch button').forEach(x=>x.classList.toggle('on',x.dataset.role===state.role));",
    '  renderSaveBadge();',
    "  if(state._scrollTo)requestAnimationFrame(()=>{const el=document.getElementById(state._scrollTo);if(el){el.classList.add('jump-flash');el.scrollIntoView({behavior:'smooth',block:'center'});state._scrollTo=null;}});",
    '}',
  ].join('\n'),
)
report.push('render() 改为可重复挂载（重复 render 不叠加监听与弹窗）')

/* 6. 挂载/卸载/全局事件绑定 */
js += `

/* ===================== 外壳（React）用的生命周期 =====================
 * 视图函数照旧返回 HTML 字符串；外壳只决定「何时挂、挂在哪」。
 *   mount(stored, info)  挂载后画第一次，并把内联事件需要的函数挂到 window 上
 *   unmount()            卸载时收干净：计时器、键盘监听、document.body 上的 modal 节点
 *   bindShell()          重绑侧栏导航与身份切换（覆盖式，不会叠加）
 * ================================================================== */
function bindShell(){
  document.querySelectorAll('#wbShell .nav-item').forEach(el=>el.onclick=()=>nav(el.dataset.view));
  const sw=document.getElementById('roleSwitch');
  if(sw)sw.onclick=function(e){
    const b=e.target.closest('button');if(!b)return;
    state.role=b.dataset.role;
    log('身份切换','切换为「'+ROLE_CONF[state.role].label+'」视角');
    if(!can(state.view))state.view='dashboard';
    render();
  };
}
function mount(stored, info){
  pushClosed=false;
  S=(stored&&typeof stored==='object')?withDefaults(stored):JSON.parse(JSON.stringify(SEED));
  STORE_INFO=info
    ?{rev:info.rev||0,path:info.path||'',saved:!!info.saved,corrupt:!!info.corrupt,savedAt:info.savedAt||'',lastError:'',writable:true}
    :{rev:0,path:'',saved:false,corrupt:false,savedAt:'',lastError:'本地模式',writable:false};
  applyDateMode();
  bindShell();
  render();
  if(!S.audit.length){ log('系统启动','老板超级助手 v1.3（插件版）加载完成，基准日 '+DEMO_DATE); }
  document.addEventListener('keydown',windowKeydown);
}
function unmount(){
  pushClosed=true;
  if(pushTimer){clearTimeout(pushTimer);pushTimer=null;}
  document.removeEventListener('keydown',windowKeydown);
  const m=document.getElementById('modalRoot'); if(m)m.remove();
  state.modal=null;
}
/** Esc / Enter 兜底（原页靠内联 onkeydown；插件里统一挂一个，卸载时摘掉） */
function windowKeydown(e){
  if(e.key==='Escape'&&state.modal){closeModal();return;}
  if(e.key!=='Enter')return;
  const t=e.target;
  if(!t||!t.id)return;
  if(t.id==='qaInput'){e.preventDefault();sendQ();}
  else if(t.id==='ci'){
    if(typeof missingFields==='function'){const miss=missingFields();if(miss.length){e.preventDefault();answerCollectCustom(miss[0].key);}}
  }
}
function renderSaveBadge(){
  const b=document.getElementById('saveBadge');
  if(!b)return;
  const where=STORE_INFO.path?('已写入本机 '+STORE_INFO.path):'尚未写入宿主';
  b.textContent=STORE_INFO.writable?(STORE_INFO.saved?'💾 已保存':'💾 待保存'):'📴 本地模式';
  b.title=(STORE_INFO.lastError?('最近一次：'+STORE_INFO.lastError+' · '):'')+where+(STORE_INFO.rev?(' · rev '+STORE_INFO.rev):'');
  b.className='save-badge'+(STORE_INFO.saved?' on':'');
}
`
/* 内联 onclick / innerHTML 里的按钮只认 window 上的函数名 */
js += `
/* 内联事件与被 innerHTML 写进 DOM 的按钮只认 window 上的函数名（点击时才求值，挂载后赋值同样有效） */
Object.assign(window, {
  nav, askQ, sendQ, askDispatch, dismissAnswer, answerCollect, answerCollectCustom,
  openDispatch, closeModal, submitDispatch, doneTask, ackTask, remindTask,
  markMsgDone, genDraft, confirmSend, dropDraft, toggleAgent, topup,
  likeMoment, batchLike, skipMoment, pipeMove, setBackup, ignoreItem,
  setMTab, setTTab, setFTab, setPTab, setSTab, setGTab, setImpTab,
  impParse, impFile, impTextSet, dlTemplate, doImport, doSummarize, doCopy,
  exportWeekly, copyWeekly, exportAudit, setGoal, setDateMode, dateMode,
  dispatchHiring, resetData, showWhatsNew, dismissWhatsNew
});
`

/* 7. 收进 RUNTIME 命名空间，并把外壳需要的入口暴露出去 */
const tail = `
return {
  loadStore: () => loadStore(),
  mount: (state, info) => mount(state, info),
  unmount: () => unmount(),
  nav: (view, id) => nav(view, id),
  can: (view) => can(view),
  views: () => Object.keys(VIEWS).map(k => ({ key: k, title: VIEWS[k].t })),
  role: () => state.role,
  alerts: () => allAlerts().length,
  pending: () => msgStats().pending,
  demoDate: DEMO_DATE,
  dateMode: () => dateMode(),
  setDateMode: (m) => setDateMode(m),
  reset: () => resetData(),
  store: () => ({ ...STORE_INFO }),
  render: () => render(),
}
`

writeFileSync(
  out('src/runtime.js'),
  '/* 由 scripts/build.mjs 自动生成（源：' + basename(srcPath) + '，原文件只读不改）。 */\n' +
    'export const RUNTIME = (() => {\n' + js + '\n' + tail + '\n})()\n',
)

/* 8. 样式：原样式一字不改，只追加宿主内的布局约束、保存徽标与深色覆盖 */
const DARK = [
  '/* ===== 插件化追加：不改原样式，只补宿主内的布局约束、保存徽标与深色覆盖 ===== */',
  '.wb-plugin-root{position:relative;flex:1 1 auto;min-height:0;width:100%;display:flex;flex-direction:column;background:var(--bg);color:var(--text);font-size:14px;font-family:"PingFang SC","Microsoft YaHei",system-ui,sans-serif;overflow:hidden}',
  '#wbShell{display:flex;min-height:0;flex:1 1 auto;overflow:hidden}',
  '#wbShell .sidebar{position:relative;top:auto;height:auto;overflow-y:auto}',
  '#wbShell .main{height:100%;min-height:0;overflow:hidden}',
  '#wbShell .content{flex:1 1 auto;min-height:0;overflow-y:auto;padding-bottom:48px}',
  '.save-badge{font-size:11.5px;color:var(--muted);border:1px solid var(--line);border-radius:7px;padding:3px 9px;white-space:nowrap;cursor:default;background:transparent}',
  '.save-badge.on{color:var(--green);border-color:#c6e3d1;background:var(--green-soft)}',
  '#modalRoot .modal-mask{position:fixed;inset:0;z-index:400}',
  '.wb-foot-note{flex:none;font-size:11px;color:var(--muted);padding:4px 22px 8px;border-top:1px dashed var(--line)}',
  '[data-ds-dark-theme] .wb-plugin-root{--bg:#12161f;--card:#1a1f2b;--line:#2a3140;--text:#e6ebf5;--muted:#93a0b8;--primary:#6f96ff;--primary-soft:#1e2a4a;--red:#ff6b70;--red-soft:#3a1c22;--green:#4ad18b;--green-soft:#143327;--orange:#f0a94b;--orange-soft:#3a2a12;--purple:#a98bff;--purple-soft:#2b2345;--side:#161b26;--side-text:#b9c4dd}',
  '[data-ds-dark-theme] .wb-plugin-root .card,[data-ds-dark-theme] .wb-plugin-root .modal,[data-ds-dark-theme] .wb-plugin-root .alert-item,[data-ds-dark-theme] .wb-plugin-root .msg-card,[data-ds-dark-theme] .wb-plugin-root .bubble.a{background:var(--card);border-color:var(--line);color:var(--text)}',
  '[data-ds-dark-theme] .wb-plugin-root tr:hover td{background:#1f2733}',
  '[data-ds-dark-theme] .wb-plugin-root .msg-body,[data-ds-dark-theme] .wb-plugin-root .draft-box,[data-ds-dark-theme] .wb-plugin-root .p1-tile,[data-ds-dark-theme] .wb-plugin-root .trend-box,[data-ds-dark-theme] .wb-plugin-root .triage-item,[data-ds-dark-theme] .wb-plugin-root .chip,[data-ds-dark-theme] .wb-plugin-root .btn,[data-ds-dark-theme] .wb-plugin-root .form-row input,[data-ds-dark-theme] .wb-plugin-root .form-row select,[data-ds-dark-theme] .wb-plugin-root .form-row textarea{background:#1f2431;border-color:var(--line);color:var(--text)}',
  '[data-ds-dark-theme] .wb-plugin-root .btn:hover{color:var(--primary);border-color:var(--primary)}',
  '[data-ds-dark-theme] .wb-plugin-root .btn.primary{background:var(--primary);border-color:var(--primary);color:#0f1420}',
  '[data-ds-dark-theme] .wb-plugin-root .wn,[data-ds-dark-theme] .wb-plugin-root .callout{background:#1b2233;border-color:#2c3550}',
  '[data-ds-dark-theme] .wb-plugin-root .sidebar{background:var(--side)}',
].join('\n')
writeFileSync(out('src/theme.css'), css + '\n' + DARK + '\n')

writeFileSync(out('src', 'build-report.txt'), report.join('\n') + '\n')
console.log(report.join('\n'))
console.log('runtime.js', readFileSync(out('src/runtime.js')).length, 'B')
console.log('theme.css ', readFileSync(out('src/theme.css')).length, 'B')