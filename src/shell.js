import { RUNTIME } from './runtime.js'

/* 外壳静态结构：取自源文件 <body>，去掉作者标记（data-page-node-id / pnid 注释）后按原文保留。
   只动三处：演示标签改由运行时填充、插入「保存状态」徽标、demo-tag 文本留空。 */
export const SHELL_HTML = String.raw`<div class="app">
  <!-- ============ 侧边栏 ============ -->
  <aside class="sidebar">
    <div class="logo"><div class="mark">板</div><div><b>老板超级助手 · 人财事三视图</b><span>人 · 财 · 事 三视图 v1.3 · DSH 插件</span></div></div>
    <div class="nav-group">驾驶舱</div>
    <div class="nav-item" data-view="dashboard"><span class="ico">🏠</span>总览驾驶舱<span class="nav-badge" id="navAlertBadge"></span></div>
    <div class="nav-group">消息与派活</div>
    <div class="nav-item" data-view="messages"><span class="ico">💬</span>消息中心 · 微信/企微</div>
    <div class="nav-item" data-view="tasks"><span class="ico">📌</span>任务派活 · 回执</div>
    <div class="nav-group">三视图</div>
    <div class="nav-item" data-view="projects"><span class="ico">📋</span>事 · 项目台账</div>
    <div class="nav-item" data-view="people"><span class="ico">👥</span>人 · 状态视图</div>
    <div class="nav-item" data-view="finance"><span class="ico">💰</span>财 · 进出一张表</div>
    <div class="nav-item" data-view="pnl"><span class="ico">🧾</span>损益一页纸 · 净利</div>
    <div class="nav-item" data-view="pipeline"><span class="ico">🔻</span>商机漏斗 · 增量</div>
    <div class="nav-group">贴身服务</div>
    <div class="nav-item" data-view="report"><span class="ico">📄</span>老板周报 · 一键生成</div>
    <div class="nav-item" data-view="sentinel"><span class="ico">🚨</span>提醒哨兵<span class="nav-badge" id="navAlertBadge2"></span></div>
    <div class="nav-item" data-view="ask"><span class="ico">💡</span>老板问答 · 20问</div>
    <div class="nav-item" data-view="collect"><span class="ico">🎙️</span>一问一答采集</div>
    <div class="nav-group">运营与能力</div>
    <div class="nav-item" data-view="social"><span class="ico">🌱</span>社交运营 · 朋友圈</div>
    <div class="nav-item" data-view="aiops"><span class="ico">🤖</span>AI 与 Token 管理</div>
    <div class="nav-group">治理</div>
    <div class="nav-item" data-view="insights"><span class="ico">📈</span>需求埋点 Top10</div>
    <div class="nav-item" data-view="audit"><span class="ico">🧾</span>留痕日志</div>
    <div class="nav-item" data-view="import"><span class="ico">📥</span>数据导入 · Excel/CSV</div>
    <div class="nav-item" data-view="settings"><span class="ico">⚙️</span>权限与数据</div>
    <div class="foot">形态：确定性工作流 + AI 节点<br>规则引擎算数 · LLM 只做解释<br>对齐 PRD V0.2 四大场景</div>
  </aside>

  <!-- ============ 主区 ============ -->
  <div class="main">
    <div class="topbar">
      <h1 id="pageTitle">总览驾驶舱</h1>
      <span class="demo-tag" id="demoTag"></span>
      <div class="spacer"></div>
      <span class="save-badge" id="saveBadge" title="">💾 待保存</span>
      <div class="role-box">
        当前身份
        <div class="role-switch" id="roleSwitch">
          <button class="on" data-role="boss">老板</button>
          <button data-role="manager">管理层</button>
          <button data-role="staff">员工</button>
        </div>
      </div>
    </div>
    <div class="content" id="viewRoot"></div>
  </div>
</div>`
