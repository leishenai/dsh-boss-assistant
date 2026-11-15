// dsh-boss-assistant client half — 由 scripts/build-client.mjs 生成，勿手改。
window.__ModuleLoader__.load({
  id: "dsh-boss-assistant",
  factory(require) {
    const React = require('react')

/* 由 scripts/build.mjs 自动生成（源：wb-nosrc.html，原文件只读不改）。 */
const RUNTIME = (() => {

/* =====================================================================
   老板超级助手 · 原型 v0.9
   形态：1 个总管 + 4 个技能(台账/人员/财务/哨兵) + 1 套规则 + 1 套权限
   原则：规则引擎算数、结果可核对；LLM 只做解释与话术；所有答案给原始依据
===================================================================== */
/* P0-1：日期机制改造。演示模式 = 时间冻结在数据基准日（逾期天数不漂移）；真实模式 = 跟随系统今天（逾期/账龄/预测窗口实时计算） */
const DEMO_DATE = '2026-11-04';                 // 演示数据基准日（快照冻结点）
let CUR_DATE = DEMO_DATE;                       // 当前计算基准日，由 applyDateMode() 初始化
const fmt = n => '¥' + Number(n).toLocaleString('zh-CN');
const fmtD = d => d ? d.slice(5).replace('-','/') : '—';
const daysBetween = (a,b) => Math.round((new Date(b) - new Date(a)) / 86400000);
const todayStr = () => CUR_DATE;
const localDateStr = (d=new Date()) => d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const plusDays = (ds,n) => { const d=new Date(ds+'T00:00:00'); d.setDate(d.getDate()+n); return localDateStr(d); };
function dateMode(){ return S.dateMode==='real' ? 'real' : 'demo'; }
function applyDateMode(){ CUR_DATE = dateMode()==='real' ? localDateStr() : DEMO_DATE; }
function setDateMode(md){
  S.dateMode = md; applyDateMode();
  log('时间模式', md==='real' ? '切换为真实日期：逾期天数从今天（'+CUR_DATE+'）实时计算' : '切换为演示模式：时间冻结在数据基准日 '+DEMO_DATE);
  save(); render();
}

/* ---------------- 种子数据（模拟） ---------------- */
const SEED = {
  projects:[
    /* ===== 真实项目数据 · 来源：交付项目管理中心只读快照（数据截止 2026-10-23） ===== */
    {id:'P2026-001',name:'拉普拉斯HR系统建设项目',client:'拉普拉斯新能源科技股份有限公司',type:'实施+定制开发',price:'FP',pm:'Jone.wang',stage:'执行',progress:80,contract:2350000,paid:1175000,manDays:3780.3,start:'2025-07-01',end:'2026-03-31',
     risk:'高',riskNote:'考勤推进等客户IT评估（9/11客户反馈未定），阻塞回款③④⑤共117.5万（合同50%）；另有组织人事/薪资21个数据准确性问题、团队撤离后UAT人力存疑、薪资双轨换算风险',
     milestones:[{n:'K1-K3 章程/调研/蓝图签字',done:true},{n:'M1-M2 组织人事配置+UAT培训',done:true},{n:'M8 考勤：客户验证→UAT',done:false},{n:'M9 考勤：正式上线（回款③依据）',done:false},{n:'M10 项目初验/终验（回款④依据）',done:false},{n:'M11 上线支持期+结项归档（回款⑤依据）',done:false}],
     deliver:[{n:'调研报告+蓝图方案',ok:true},{n:'组织人事模块上线',ok:true},{n:'考勤模块上线',ok:false},{n:'验收确认书',ok:false}]},
    {id:'P2026-002',name:'业财二期PCR项目',client:'锦航（上海锦航人力资源有限公司）',type:'PS系统客户化开发',price:'FP',pm:'Jone.wang',stage:'初始',progress:5,contract:130000,paid:0,manDays:0,start:'2026-09-14',end:'2026-12-31',
     risk:'中等',riskNote:'合同签订与进场开发并行，合同未签即投入开发；若条款/范围谈崩前期投入缺乏保障。回款批次待合同条款拆分',
     milestones:[{n:'K1 合同签订',done:false},{n:'K2 进场/启动会+章程批准',done:false},{n:'M1 需求调研+方案确认',done:false},{n:'M4 上线+验收',done:false},{n:'M5 结项归档',done:false}],
     deliver:[{n:'合同签署',ok:false},{n:'开发范围书面确认',ok:false},{n:'PS客户化交付',ok:false}]},
    {id:'P2026-003',name:'绩效模块实施',client:'北京世新茂科技有限公司',type:'实施（绩效模块）',price:'FP',pm:'待补',stage:'执行',progress:null,contract:300000,paid:0,manDays:0,start:'',end:'',
     risk:'低',riskNote:'回款批次待核对；合同大写金额笔误（叁拾万柒仟肆佰），以小写 150,000（验收款）为准',
     milestones:[{n:'①首付款 40% ¥120,000',done:false},{n:'②验收付款 50% ¥150,000',done:false},{n:'③尾款(质保金) 10% ¥30,000',done:false}],
     deliver:[{n:'实施交付',ok:false},{n:'验收合格',ok:false}]},
    {id:'P2026-004',name:'薪酬管理模块实施',client:'北京世新茂科技有限公司',type:'实施（薪酬模块）',price:'FP',pm:'待补',stage:'执行',progress:null,contract:550000,paid:0,manDays:0,start:'',end:'',
     risk:'低',riskNote:'回款批次待核对（①首付40% 22万 / ②验收50% 27.5万 / ③尾款10% 5.5万质保1年）',
     milestones:[{n:'①首付款 40% ¥220,000',done:false},{n:'②验收付款 50% ¥275,000',done:false},{n:'③尾款 10% ¥55,000',done:false}],
     deliver:[{n:'实施交付',ok:false},{n:'验收合格',ok:false}]},
    {id:'P2026-005',name:'PS系统核心功能开发框架(2026年度)',client:'北京罗克维尔斯科技有限公司',type:'客户化开发框架',price:'T&M',pm:'待补',stage:'执行',progress:null,contract:1852668,paid:0,manDays:0,start:'',end:'',unitPrice:'分档单价 2430/1710/2520',budgetDays:820,
     risk:'中等',riskNote:'185.27万为「820预估人天×单价」推算值，非合同承诺金额；按下达订单逐笔跟踪，未下达部分不构成应收',
     milestones:[{n:'按订单滚动下达',done:false},{n:'订单验收+出具报告',done:false}],
     deliver:[{n:'订单台账',ok:false},{n:'验收报告',ok:false}]},
    {id:'P2026-006',name:'低碳院全方位绩效优化与创新',client:'北京低碳清洁能源研究院',type:'实施+定制开发',price:'FP',pm:'待补',stage:'执行',progress:null,contract:948000,paid:0,manDays:0,start:'2024-08-30',end:'',
     risk:'中等',riskNote:'10%尾款 9.48万 约定「系统功能验收合格2年后」支付，现金回收周期近2年，需记录实际验收日期并设到期提醒',
     milestones:[{n:'①②③ 批次发票',done:false},{n:'系统功能验收合格',done:false},{n:'④尾款 ¥94,800（验收+2年）',done:false}],
     deliver:[{n:'实施交付',ok:false},{n:'验收确认',ok:false}]},
    {id:'P2026-007',name:'中燃HR共享服务中心平台',client:'深圳市中燃科技有限公司',type:'数字化项目开发+实施',price:'FP',pm:'待补',stage:'执行',progress:null,contract:1890000,paid:0,manDays:0,start:'',end:'',
     risk:'中等',riskNote:'10%尾款 17.66万 在终验合格6个月期满后才结算，依赖《项目终验报告》签字日期，需取得原件留档并按签字日+6个月设提醒',
     milestones:[{n:'①预付款 ¥529,800（待核对）',done:false},{n:'②初验 ¥529,800',done:false},{n:'③终验 ¥529,800',done:false},{n:'④尾款 ¥176,600（终验+6个月）',done:false}],
     deliver:[{n:'平台开发+实施',ok:false},{n:'终验报告',ok:false}]},
    {id:'P2026-008',name:'中国邮政香港HCM项目',client:'中国邮政香港有限公司',type:'产品采购+实施',price:'FP',pm:'待补',stage:'执行',progress:null,contract:1710000,paid:0,manDays:0,start:'',end:'',
     risk:'高',riskNote:'惩罚性条款偏重：误期赔偿0.5%/周(上限5%)、人员更换罚款2万/人次(上限10%)；付款前须提交5%履约保证金85,500，违约可从保证金直接扣划',
     milestones:[{n:'① 40% ¥684,000（合同生效）',done:false},{n:'② 40% ¥684,000（试点上线）',done:false},{n:'保证金 ¥85,500 缴纳确认',done:false}],
     deliver:[{n:'履约保证金缴纳',ok:false},{n:'试点上线',ok:false},{n:'上线运行合格证书',ok:false}]},
    {id:'P2026-009',name:'龙湖PS系统维保',client:'北京龙智数科科技服务有限公司',type:'软件维保',price:'T&M',pm:'待补',stage:'上线支持',progress:null,contract:0,paid:0,manDays:0,start:'2024-11-05',end:'',unitPrice:'顾问人天单价（按季结算）',
     risk:'高',riskNote:'索引表曾误标「项目制」，合同实为顾问人天单价结算，收款唯一依据为季度《工作量确认单》；口径误判将导致成本与定价错配、无法开票',
     milestones:[{n:'季度工作量确认单',done:false},{n:'按季开票收款',done:false}],
     deliver:[{n:'维保服务',ok:true},{n:'季度确认单归档',ok:false}]},
    {id:'P2026-019',name:'新希望六和HR个税运维',client:'四川新希望动物营养科技有限公司',type:'运维+PTS平台租赁',price:'FP',pm:'待补',stage:'上线支持',progress:null,contract:230000,paid:0,manDays:0,start:'2026-01-01',end:'2026-12-31',
     risk:'高',riskNote:'合同金额23万为优惠价，计费口径按实际人次流量（5万人×6元/年），超出部分另行收取；年末未按实际人次对账将直接少收',
     milestones:[{n:'年度运维服务',done:false},{n:'年底按实际人次对账',done:false}],
     deliver:[{n:'运维服务',ok:false},{n:'人次对账单',ok:false}]},
    {id:'P2026-020',name:'趣加PTS智能服务平台(数据服务年费版)',client:'上海趣加网络科技有限公司',type:'SaaS平台+数据服务',price:'T&M',pm:'待补',stage:'执行',progress:null,contract:392000,paid:0,manDays:0,start:'',end:'',unitPrice:'3,000/人天',
     risk:'中等',riskNote:'T&M 项目按人天结算，已投入人天未开票即漏收；需建立人天/订单台账并按月对照开票',
     milestones:[{n:'人天台账建立',done:false},{n:'按单开票',done:false}],
     deliver:[{n:'SaaS平台服务',ok:false},{n:'数据服务',ok:false}]},
  ],
  people:[
    {id:'E1',name:'张一鸣',role:'前端工程师',on:true,sat:115,salary:18000,weekly:true,trend:[92,98,105,115],projects:['P2026-001','P2026-002'],note:'连续 3 周超负荷，存在 burnout 风险'},
    {id:'E2',name:'李慧',role:'UI 设计师',on:true,sat:85,salary:14000,weekly:true,trend:[80,88,90,85],projects:['P2026-001','P2026-003'],note:'产出稳定'},
    {id:'E3',name:'王铁军',role:'后端工程师',on:true,sat:70,salary:20000,weekly:false,trend:[95,90,75,70],projects:['P2026-006'],note:'近 4 周产出持续下降，本周未交周报'},
    {id:'E4',name:'赵倩',role:'项目经理',on:true,sat:95,salary:16000,weekly:true,trend:[90,92,94,95],projects:['P2026-001','P2026-002','P2026-006'],note:'同时带 3 个项目，接近满载'},
    {id:'E5',name:'刘畅',role:'销售顾问',on:true,sat:60,salary:12000,weekly:true,trend:[70,65,62,60],projects:[],note:'可承接新客源'},
    {id:'E6',name:'陈默',role:'测试工程师',on:true,sat:45,salary:11000,weekly:true,trend:[60,55,50,45],projects:['P2026-001'],note:'负载较低，可支援其他项目'},
    {id:'E7',name:'孙晓',role:'运营专员',on:true,sat:0,salary:9000,weekly:false,trend:[85,40,0,0],projects:[],note:'连续 2 周无产出记录，上周开始请假未销假'},
    {id:'E8',name:'周明',role:'实施顾问',on:true,sat:90,salary:15000,weekly:true,trend:[85,88,92,90],projects:['P2026-004','P2026-006'],note:'正常'},
    {id:'E9',name:'吴迪',role:'后端工程师',on:false,sat:0,salary:17000,weekly:false,trend:[80,60,0,0],projects:[],note:'10/27 已离职，P2026-002 项目交接人是张一鸣'},
  ],
  /* 人事变动时间线（人·状态视图 - 人事变动页） */
  peopleChanges:[
    {date:'2026-10-27',who:'吴迪',type:'离职',detail:'后端工程师离职，P2026-002 业财二期PCR项目后端交接给张一鸣，交接人饱和度升至 115%'},
    {date:'2026-10-26',who:'孙晓',type:'请假',detail:'开始病假，至今未销假，产出连续 2 周为 0'},
    {date:'2026-09-15',who:'陈默',type:'入职',detail:'测试工程师入职，10 月起支援 P1 大屏联调测试'},
    {date:'2026-04-01',who:'刘畅',type:'入职',detail:'销售顾问入职，负责新客源拓展与协会渠道'},
    {date:'2026-01-08',who:'吴迪',type:'入职',detail:'后端工程师入职（已于 10/27 离职）'},
  ],
  /* 入职日期（人员档案用） */
  hireDates:{E1:'2024-03-15',E2:'2023-07-01',E3:'2022-09-01',E4:'2023-01-10',E5:'2025-04-01',E6:'2025-09-15',E7:'2024-06-20',E8:'2023-11-01',E9:'2024-01-08'},
  /* 财 · 进出一张表（真实回款批次表 · 快照 2026-10-23）：kind=已收/待核对/未触发/应付/已付 */
  /* 批次字段：trig=合同触发条件 ms=绑定里程碑 note=备注 */
  finance:[
    {id:'B01',type:'in',item:'P2026-001 回款① 30%',project:'P2026-001',amount:705000,date:'2025-07-15',kind:'已收',trig:'合同签署 + 开票后15日',ms:'合同签订',note:'已到账'},
    {id:'B02',type:'in',item:'P2026-001 回款② 20%',project:'P2026-001',amount:470000,date:'2025-10-25',kind:'已收',trig:'蓝图确认书签署 + 开票后15日',ms:'K3 蓝图签字',note:'确认书建议补归档'},
    {id:'B03',type:'in',item:'P2026-001 回款③ 20%',project:'P2026-001',amount:470000,date:'2026-10-23',kind:'未触发',trig:'全模块上线确认书 + 开票后15日',ms:'M9 考勤上线',note:'卡在考勤；两模块确认书先行≠触发本批次'},
    {id:'B04',type:'in',item:'P2026-001 回款④ 20%',project:'P2026-001',amount:470000,date:'2026-10-23',kind:'未触发',trig:'项目验收确认书 + 开票后15日',ms:'M10 验收',note:''},
    {id:'B05',type:'in',item:'P2026-001 回款⑤ 10%',project:'P2026-001',amount:235000,date:'2026-10-23',kind:'未触发',trig:'整体上线完成6个月后 + 开票后15日',ms:'上线日+6个月',note:'时间放大器：上线越晚到账越晚'},
    {id:'B06',type:'in',item:'P2026-002 合同款（待拆）',project:'P2026-002',amount:130000,date:'2026-10-23',kind:'未触发',trig:'合同签订后按条款拆分',ms:'',note:'合同未签，先追合同落地'},
    {id:'B07',type:'in',item:'P2026-003 ①首付款 40%',project:'P2026-003',amount:120000,date:'2026-10-23',kind:'待核对',trig:'合同签订生效',ms:'合同生效',note:'发票后30工作日付款'},
    {id:'B08',type:'in',item:'P2026-003 ②验收付款 50%',project:'P2026-003',amount:150000,date:'2026-10-23',kind:'待核对',trig:'系统上线运行稳定、验收合格',ms:'验收合格',note:'⚠合同大写误写「叁拾万柒仟肆佰」，以小写 150,000 为准'},
    {id:'B09',type:'in',item:'P2026-003 ③尾款(质保金) 10%',project:'P2026-003',amount:30000,date:'2026-10-23',kind:'待核对',trig:'质保期届满起30日内',ms:'质保届满',note:'扣除应扣款后一次性无息支付'},
    {id:'B10',type:'in',item:'P2026-004 ①首付款 40%',project:'P2026-004',amount:220000,date:'2026-10-23',kind:'待核对',trig:'合同签订后',ms:'合同生效',note:''},
    {id:'B11',type:'in',item:'P2026-004 ②验收付款 50%',project:'P2026-004',amount:275000,date:'2026-10-23',kind:'待核对',trig:'验收合格并收到全额专票',ms:'验收合格',note:''},
    {id:'B12',type:'in',item:'P2026-004 ③尾款 10%',project:'P2026-004',amount:55000,date:'2026-10-23',kind:'待核对',trig:'终验合格之日起免费质保1年期满',ms:'质保期满',note:''},
    {id:'B13',type:'in',item:'P2026-005 按订单滚动结算',project:'P2026-005',amount:0,date:'2026-10-23',kind:'未触发',trig:'订单验收合格并出具报告后60日内付款',ms:'订单验收',note:'185.27万=820预估人天×分档单价(2430/1710/2520)，以下达订单人天锁定'},
    {id:'B14',type:'in',item:'P2026-006 ① 20%',project:'P2026-006',amount:189600,date:'2026-10-23',kind:'待核对',trig:'提交同比例增值税专用发票',ms:'',note:'收票后60工作日'},
    {id:'B15',type:'in',item:'P2026-006 ② 30%',project:'P2026-006',amount:284400,date:'2026-10-23',kind:'待核对',trig:'提交同比例发票',ms:'',note:'收票后60工作日'},
    {id:'B16',type:'in',item:'P2026-006 ③ 40%',project:'P2026-006',amount:379200,date:'2026-10-23',kind:'待核对',trig:'系统功能验收合格 + 50%总额发票',ms:'验收合格',note:'收票后60工作日'},
    {id:'B17',type:'in',item:'P2026-006 ④尾款 10%',project:'P2026-006',amount:94800,date:'2026-10-23',kind:'待核对',trig:'系统功能验收合格2年后 + 收据',ms:'验收满2年',note:'⏳现金回收最晚的一笔，务必设到期提醒'},
    {id:'B18',type:'in',item:'P2026-007 产品费（一次性）',project:'P2026-007',amount:124000,date:'2026-10-23',kind:'待核对',trig:'产品安装完成 + 100%专票(13%)',ms:'安装完成',note:''},
    {id:'B19',type:'in',item:'P2026-007 ①预付款 30%',project:'P2026-007',amount:529800,date:'2026-10-23',kind:'待核对',trig:'合同生效',ms:'合同生效',note:'占实施费176.6万'},
    {id:'B20',type:'in',item:'P2026-007 ②初验款 30%',project:'P2026-007',amount:529800,date:'2026-10-23',kind:'待核对',trig:'初验合格并签署《项目初验报告》',ms:'初验',note:'初验后30工作日'},
    {id:'B21',type:'in',item:'P2026-007 ③终验款 30%',project:'P2026-007',amount:529800,date:'2026-10-23',kind:'待核对',trig:'终验合格并签署《项目终验报告》',ms:'终验',note:'终验后30工作日'},
    {id:'B22',type:'in',item:'P2026-007 ④尾款 10%',project:'P2026-007',amount:176600,date:'2026-10-23',kind:'待核对',trig:'终验合格之日起6个月期满',ms:'终验+6个月',note:'期满后30工作日'},
    {id:'B23',type:'in',item:'P2026-008 ① 40%',project:'P2026-008',amount:684000,date:'2026-10-23',kind:'待核对',trig:'合同生效 + 发票 + 付款申请书',ms:'合同生效',note:'⚠付款前须提交5%履约保证金85,500'},
    {id:'B24',type:'in',item:'P2026-008 ② 40%',project:'P2026-008',amount:684000,date:'2026-10-23',kind:'待核对',trig:'试点上线 + 《上线运行合格证书》',ms:'试点上线',note:''},
    {id:'B25',type:'in',item:'P2026-008 其余批次（差额推算）',project:'P2026-008',amount:342000,date:'2026-10-23',kind:'待核对',trig:'待核对',ms:'',note:'批次待补录（合同额 1,710,000 − 已拆 1,368,000）'},
    {id:'B26',type:'in',item:'P2026-009 季度结算（T&M）',project:'P2026-009',amount:0,date:'2026-10-23',kind:'未触发',trig:'季度《工作量确认单》',ms:'',note:'收入=实际人天×顾问人天单价，按季开票；补齐历史确认单'},
    {id:'B27',type:'in',item:'P2026-019 年度服务费（按人次对账）',project:'P2026-019',amount:230000,date:'2026-10-23',kind:'未触发',trig:'2026年底按实际服务人次对账',ms:'',note:'优惠价23万含5万人×6元/年，超出部分另行收取，年末须对账补开票'},
    {id:'B28',type:'in',item:'P2026-020 ②年度服务费',project:'P2026-020',amount:65000,date:'2026-10-23',kind:'待核对',trig:'自2025-01-01起每年支付，开票后30日内',ms:'',note:'不含税；36,000服务人次/年上限，超额部分合同结束后30日内结算'},
    {id:'B29',type:'in',item:'P2026-020 其余批次（差额推算）',project:'P2026-020',amount:327000,date:'2026-10-23',kind:'待核对',trig:'待核对',ms:'',note:'批次待补录（合同额 392,000 − 年度服务费 65,000）'},
    {id:'E01',type:'out',item:'十月人力成本（工资+社保·估算演示）',project:'',amount:186000,date:'2026-10-10',kind:'已付'},
    {id:'E02',type:'out',item:'办公室房租 11 月（演示）',project:'',amount:22000,date:'2026-10-28',kind:'应付',due:'2026-11-05'},
    {id:'E03',type:'out',item:'云服务器年费（演示）',project:'',amount:9800,date:'2026-10-15',kind:'已付'},
    {id:'E04',type:'out',item:'P2026-008 履约保证金（合同价5%，付款前须缴）',project:'P2026-008',amount:85500,date:'2026-10-23',kind:'应付'},
    {id:'E05',type:'out',item:'十一月人力成本（预估·演示）',project:'',amount:186000,date:'2026-11-10',kind:'应付',due:'2026-11-10'},
  ],
  /* ===== 子表：财-进出一张表（数据样表 v1.0 · 2026-11-04）===== */
  /* 01 收款流水：每一笔实际到账的客户回款 */
  flowsIn:[
    {id:'R1',date:'2026-09-05',client:'华远集团',contract:'HT-2025-018',kind:'进度款',amount:620000,method:'银行转账',invoice:'FP20260901',note:'第二期进度款'},
    {id:'R2',date:'2026-09-12',client:'中泰物流',contract:'HT-2026-003',kind:'预收',amount:224000,method:'银行转账',invoice:'FP20260912',note:'合同预付款 30%'},
    {id:'R3',date:'2026-09-20',client:'恒信零售',contract:'HT-2026-011',kind:'验收款',amount:180000,method:'银行转账',invoice:'FP20260920',note:''},
    {id:'R4',date:'2026-10-08',client:'城建集团',contract:'HT-2025-007',kind:'进度款',amount:280000,method:'银行转账',invoice:'FP20261008',note:'第三期，仍欠 168 万'},
    {id:'R5',date:'2026-10-15',client:'星海医药',contract:'HT-2026-002',kind:'进度款',amount:360000,method:'承兑汇票',invoice:'FP20261015',note:'6 个月银承'},
    {id:'R6',date:'2026-10-22',client:'长青制造',contract:'HT-2025-026',kind:'质保金',amount:120000,method:'银行转账',invoice:'FP20261022',note:'项目结清'},
  ],
  /* 02 付款流水：每一笔实际付出去的钱 */
  flowsOut:[
    {id:'P1',date:'2026-09-08',vendor:'云启软件（分包）',contract:'HT-2025-007',cat:'外包',amount:245000,method:'银行转账',invOk:'否',note:'数据中台开发分包'},
    {id:'P2',date:'2026-09-25',vendor:'城市人才服务',contract:'公共',cat:'人工',amount:150000,method:'银行转账',invOk:'是',note:'9 月外包人力'},
    {id:'P3',date:'2026-10-08',vendor:'宏图咨询',contract:'HT-2026-003',cat:'外包',amount:60000,method:'银行转账',invOk:'是',note:'咨询专家费'},
    {id:'P4',date:'2026-10-10',vendor:'恒安物业',contract:'公共',cat:'房租',amount:30000,method:'银行转账',invOk:'是',note:'10 月办公室租金'},
    {id:'P5',date:'2026-10-15',vendor:'税务局',contract:'公共',cat:'税费',amount:52000,method:'—',invOk:'—',note:'9 月增值税及附加'},
    {id:'P6',date:'2026-10-20',vendor:'顺捷物流',contract:'HT-2026-002',cat:'差旅',amount:18000,method:'银行转账',invOk:'是',note:'驻场设备运输'},
  ],
  /* 03 应收台账：所有未结清的应收（账龄按今天算：1-30 黄 / 31-60 橙 / 60+ 红） */
  recv:[
    {id:'AR1',client:'华远集团',contract:'HT-2025-018',contractAmt:3860000,invDate:'2026-10-10',invNo:'FP20261010',amount:960000,paid:0,term:30,due:'2026-11-09',owner:'李工',status:'未到期',next:'10/28 已发对账单',promise:'2026-11-10'},
    {id:'AR2',client:'城建集团',contract:'HT-2025-007',contractAmt:5200000,invDate:'2026-08-20',invNo:'FP20260821',amount:1680000,paid:0,term:30,due:'2026-09-19',owner:'王工',status:'已发律师函',next:'11/05 上门谈判，要求先付 80 万',promise:'2026-11-15'},
    {id:'AR3',client:'星海医药',contract:'HT-2026-002',contractAmt:2450000,invDate:'2026-07-25',invNo:'FP20260726',amount:820000,paid:0,term:30,due:'2026-08-24',owner:'张工',status:'诉讼准备',next:'已委托律师，11/12 前发函',promise:''},
    {id:'AR4',client:'中泰物流',contract:'HT-2026-003',contractAmt:1680000,invDate:'2026-09-16',invNo:'FP20260917',amount:386000,paid:0,term:30,due:'2026-10-16',owner:'李工',status:'催收中',next:'财务对接人已换，重新对接',promise:'2026-11-08'},
    {id:'AR5',client:'恒信零售',contract:'HT-2026-011',contractAmt:960000,invDate:'—',invNo:'—',amount:280000,paid:0,term:30,due:'2026-11-19',owner:'王工',status:'待开票',next:'已交付待验收，验收通过后 3 日内开票',promise:'2026-11-19'},
    {id:'AR6',client:'长青制造',contract:'HT-2025-026',contractAmt:720000,invDate:'2026-06-30',invNo:'FP20260630',amount:120000,paid:120000,term:30,due:'2026-07-30',owner:'张工',status:'已结清',next:'—',promise:''},
  ],
  /* 04 应付台账：所有未结清的应付（排付款计划、防现金撞车） */
  payable:[
    {id:'AP1',vendor:'云启软件（分包）',contract:'HT-2025-007',amount:245000,paid:0,term:30,due:'2026-09-25',prio:'高',plan:'2026-11-06',note:'已逾期，供应商催款中'},
    {id:'AP2',vendor:'城市人才服务',contract:'公共',amount:180000,paid:150000,term:30,due:'2026-11-15',prio:'高',plan:'2026-11-15',note:'人力外包月结'},
    {id:'AP3',vendor:'恒安物业',contract:'公共',amount:30000,paid:0,term:15,due:'2026-11-05',prio:'高',plan:'2026-11-05',note:'房租，不能拖'},
    {id:'AP4',vendor:'宏图咨询',contract:'HT-2026-003',amount:60000,paid:60000,term:30,due:'2026-10-15',prio:'中',plan:'',note:'已结清'},
    {id:'AP5',vendor:'顺捷物流',contract:'HT-2026-002',amount:18000,paid:0,term:30,due:'2026-11-20',prio:'低',plan:'2026-11-20',note:''},
  ],
  /* 05 合同订单台账（Backlog）：未来营收的唯一领先指标 */
  orders:[
    {id:'O1',contract:'HT-2025-018',client:'华远集团',name:'ERP 实施',amount:3860000,sign:'2025-11-20',from:'2025-12-01',to:'2026-12-31',recognized:2895000,expectMonth:'2026-12',status:'执行中',note:'剩余验收款 96 万'},
    {id:'O2',contract:'HT-2025-007',client:'城建集团',name:'数据中台建设',amount:5200000,sign:'2025-08-15',from:'2025-09-01',to:'2027-03-31',recognized:3120000,expectMonth:'2027-01',status:'执行中',note:'回款严重滞后'},
    {id:'O3',contract:'HT-2026-002',client:'星海医药',name:'MES 系统上线',amount:2450000,sign:'2026-03-01',from:'2026-03-15',to:'2026-11-30',recognized:1470000,expectMonth:'2026-11',status:'执行中',note:'验收存在争议'},
    {id:'O4',contract:'HT-2026-003',client:'中泰物流',name:'数字化咨询',amount:1680000,sign:'2026-05-10',from:'2026-05-20',to:'2026-12-15',recognized:1008000,expectMonth:'2026-12',status:'执行中',note:''},
    {id:'O5',contract:'HT-2026-011',client:'恒信零售',name:'会员系统',amount:960000,sign:'2026-07-01',from:'2026-07-10',to:'2026-10-31',recognized:672000,expectMonth:'2026-10',status:'待验收',note:'已交付，等验收'},
    {id:'O6',contract:'HT-2025-026',client:'长青制造',name:'运维服务',amount:720000,sign:'2025-07-01',from:'2025-07-01',to:'2026-06-30',recognized:720000,expectMonth:'已结项',status:'已结项',note:'已全额回款'},
  ],
  /* 06 项目成本归集：哪个项目赚钱、哪个在赔钱 */
  costs:[
    {id:'C1',month:'2026-09',contract:'HT-2025-018',client:'华远集团',heads:8,hours:1280,labor:72000,outs:28000,travel:11600,revenue:180000},
    {id:'C2',month:'2026-09',contract:'HT-2025-007',client:'城建集团',heads:12,hours:1960,labor:108000,outs:46000,travel:18000,revenue:240000},
    {id:'C3',month:'2026-09',contract:'HT-2026-002',client:'星海医药',heads:6,hours:940,labor:54000,outs:18000,travel:8000,revenue:110000},
    {id:'C4',month:'2026-10',contract:'HT-2025-018',client:'华远集团',heads:7,hours:1120,labor:63000,outs:22000,travel:9000,revenue:150000},
    {id:'C5',month:'2026-10',contract:'HT-2026-011',client:'恒信零售',heads:3,hours:480,labor:27000,outs:6000,travel:3000,revenue:60000},
    {id:'C6',month:'2026-10',contract:'HT-2026-003',client:'中泰物流',heads:4,hours:620,labor:36000,outs:9000,travel:5000,revenue:72000},
    /* 07 / 08 月为演示补齐历史数据（用于驾驶舱毛利趋势线，样表演示口径） */
    {id:'C7',month:'2026-07',contract:'HT-2025-018',client:'华远集团',heads:9,hours:1420,labor:72000,outs:26000,travel:10000,revenue:190000},
    {id:'C8',month:'2026-07',contract:'HT-2025-007',client:'城建集团',heads:12,hours:1880,labor:114000,outs:46000,travel:18000,revenue:260000},
    {id:'C9',month:'2026-07',contract:'HT-2026-002',client:'星海医药',heads:6,hours:900,labor:56000,outs:20000,travel:10000,revenue:145000},
    {id:'C10',month:'2026-08',contract:'HT-2025-018',client:'华远集团',heads:8,hours:1340,labor:74000,outs:28000,travel:10000,revenue:190000},
    {id:'C11',month:'2026-08',contract:'HT-2025-007',client:'城建集团',heads:11,hours:1760,labor:116000,outs:42000,travel:18000,revenue:250000},
    {id:'C12',month:'2026-08',contract:'HT-2026-002',client:'星海医药',heads:6,hours:880,labor:58000,outs:19000,travel:8000,revenue:135000},
  ],
  /* 07 费用预算执行：超支标红，提前一个月发现问题 */
  budget:[
    {id:'B1',month:'2026-10',dept:'交付部',item:'差旅费',budget:40000,actual:46800,note:'驻场频次增加'},
    {id:'B2',month:'2026-10',dept:'交付部',item:'外包服务费',budget:150000,actual:162000,note:'星海项目临时加人'},
    {id:'B3',month:'2026-10',dept:'研发部',item:'软件与工具',budget:20000,actual:12600,note:'两项采购延后'},
    {id:'B4',month:'2026-10',dept:'市场部',item:'业务招待费',budget:15000,actual:21800,note:'两个大客户招待超支'},
    {id:'B5',month:'2026-10',dept:'管理部',item:'房租物业',budget:30000,actual:30000,note:''},
    {id:'B6',month:'2026-10',dept:'管理部',item:'人员薪酬',budget:380000,actual:392000,note:'10 月新入职 2 人'},
  ],
  /* 08 资金账户余额：受限资金要标出，否则高估可用现金 */
  accts:[
    {id:'A1',name:'基本户',bank:'建设银行',last4:'8821',type:'基本户',open:1860000,fin:1240000,fout:1180000,end:1920000,restricted:false,note:'日常经营主账户'},
    {id:'A2',name:'一般户',bank:'招商银行',last4:'4473',type:'一般户',open:620000,fin:360000,fout:280000,end:700000,restricted:false,note:''},
    {id:'A3',name:'保证金专户',bank:'农业银行',last4:'0092',type:'专户',open:380000,fin:0,fout:0,end:380000,restricted:true,note:'投标保证金，不可动用'},
    {id:'A4',name:'企业支付宝',bank:'支付宝',last4:'—',type:'第三方',open:12400,fin:3600,fout:2400,end:13600,restricted:false,note:''},
  ],
  /* 应收余额周快照（近 8 周 · 演示补齐，用于驾驶舱趋势线；最后一点 = 当前应收余额 ¥4,126,000 / 逾期 ¥2,886,000） */
  arTrend:[
    {d:'2026-08-29',bal:2500000,over:820000},
    {d:'2026-09-12',bal:2500000,over:820000},
    {d:'2026-09-26',bal:2886000,over:2500000},
    {d:'2026-10-03',bal:2886000,over:2500000},
    {d:'2026-10-17',bal:3846000,over:2500000},
    {d:'2026-10-24',bal:4126000,over:2500000},
    {d:'2026-10-31',bal:4126000,over:2886000},
    {d:'2026-11-01',bal:4126000,over:2886000},
  ],
  /* ================= PRD 4.1 场景一：微信 / 企微消息与群聊（F1-1 ~ F1-6） =================
     接入方式：账号授权读取（PRD F1-1，不做复杂直连）。数据为演示，真实接入后同结构替换。 */
  messages:[
    {id:'M1',src:'企微群',group:'拉普拉斯 HR 项目群',from:'杨帆',org:'拉普拉斯新能源 · IT 总监',vip:true,
     time:'2026-11-04 08:42',body:'Jone，考勤模块的接口评估我们内部又过了一轮，安全组担心打卡数据出境，需要你们出一份数据流向说明。另外回款③那份确认书，财务说等考勤上线确认书一起走，你们看这周能不能给个时间点？'},
    {id:'M2',src:'私聊',group:'',from:'王建国',org:'城建集团 · 采购部主任',vip:true,
     time:'2026-11-04 09:15',body:'168 万这笔我们内部在走流程，这周先付 80 万，剩下的月底一起结。你们先别发律师函了，我这边顶着压力在推，希望你们理解。'},
    {id:'M3',src:'私聊',group:'',from:'刘敏',org:'星海医药 · 财务经理',vip:true,
     time:'2026-11-03 17:20',body:'律师函我们收到了。合同里验收标准写得不清，我们法务认为不具备验收条件。本周五前给书面答复，你们也把验收清单发一份正式的过来。'},
    {id:'M4',src:'企微群',group:'世新茂绩效项目群',from:'张海涛',org:'北京世新茂 · 总经理',vip:true,
     time:'2026-11-04 10:05',body:'合同上金额大写写的是「叁拾万柒仟肆佰」，小写又是 150,000，这两个不一致。财务说必须以合同为准，你们看怎么处理？要补签的话我们配合。'},
    {id:'M5',src:'企微群',group:'中国邮政香港 HCM 项目',from:'陈志强',org:'中国邮政香港 · 项目对接人',vip:false,
     time:'2026-11-03 15:48',body:'提醒一下，第一期付款前必须先提交合同价 5% 的履约保证金，也就是 85,500，这两笔我们是一起走的。发票抬头和付款申请书模板我发群里了。'},
    {id:'M6',src:'私聊',group:'',from:'赵倩',org:'项目经理 · 内部',vip:false,
     time:'2026-11-04 09:30',body:'M9 考勤联调还差两个人天，这周要出演示环境。能不能让陈默过来支援两天？他手上那个测试任务我帮他往后挪。'},
    {id:'M7',src:'私聊',group:'',from:'李慧',org:'UI 设计师 · 内部',vip:false,
     time:'2026-11-04 08:10',body:'老板，明天下午的设计评审能不能挪到周四上午？客户那边的素材还没给全，我怕明天过不了。'},
    {id:'M8',src:'私聊',group:'',from:'周会计',org:'中泰物流 · 财务',vip:false,
     time:'2026-11-03 14:22',body:'麻烦把上期发票的开票资料再发一遍，我们这边换了开票系统，之前的档案没了。谢谢。'},
    {id:'M9',src:'企微群',group:'中泰物流数字化项目',from:'周明',org:'实施顾问 · 内部',vip:false,
     time:'2026-11-03 18:00',body:'今日进度：完成基础数据导入 6 张表，剩余 3 张待客户确认字段口径，明天继续。'},
    {id:'M10',src:'服务通知',group:'',from:'招商银行',org:'到账通知',vip:false,
     time:'2026-11-04 07:05',body:'您尾号 4473 账户于 11-04 07:02 收到 华远集团 货款 280,000.00 元，当前余额 980,000.00 元。'},
    {id:'M11',src:'企微群',group:'物业通知群',from:'恒安物业',org:'物业服务',vip:false,
     time:'2026-11-03 16:30',body:'通知：11 月 9 日（周日）09:00-17:00 大厦配电检修，全楼停电，请提前安排。'},
    {id:'M12',src:'私聊',group:'',from:'孙磊',org:'北京罗克维尔斯 · 采购',vip:false,
     time:'2026-11-04 09:52',body:'PS 框架这个月下达的订单人天结算单，麻烦按分档单价拉一份明细给我们，财务要跟预算对一下。'},
    {id:'M13',src:'私聊',group:'',from:'刘畅',org:'销售顾问 · 内部',vip:false,
     time:'2026-11-03 20:12',body:'新希望那个按人次对账的事，他们年底才肯对，我担心跨年补开票有风险，这个要不要提前跟财务打个招呼？'}
  ],
  /* 消息处理状态：cls 分类结果可覆盖；done=已处理；drafts=待确认的 AI 代发（F1-6 风险拦截队列） */
  msgDone:{}, msgCls:{},
  drafts:[
    {id:'D1',msgId:'M5',to:'陈志强（中国邮政香港）',text:'陈经理您好，履约保证金 85,500 我们已列入本周付款计划，会与第一期款同步提交，付款申请书按您发的模板准备。缴纳凭证出来后我第一时间发您。',
     risk:['涉及金额 85,500','对外正式表态'],status:'待确认',at:'2026-11-04 10:20'}
  ],
  /* ================= PRD 4.4 F4-2 / F4-3：任务派活与回执追踪 ================= */
  tasks:[
    {id:'T1',title:'催回城建集团 168 万进度款（先落实 80 万）',from:'应收逾期 · 城建集团',assignee:'李工',due:'2026-11-05',status:'待回执',created:'2026-11-02',ctx:'AR2',note:'对方口头承诺本周先付 80 万，需书面确认'},
    {id:'T2',title:'给客户明确 M9 考勤上线时间点',from:'里程碑逾期 · P2026-001',assignee:'赵倩',due:'2026-11-04',status:'进行中',created:'2026-11-01',ctx:'P2026-001',note:'卡住回款③④⑤共 117.5 万'},
    {id:'T3',title:'世新茂合同金额勘误并补签',from:'AI 代发拦截 · 合同金额不一致',assignee:'刘畅',due:'2026-11-06',status:'待回执',created:'2026-11-03',ctx:'P2026-003',note:'大写叁拾万柒仟肆佰 vs 小写 150,000，以小写为准'},
    {id:'T4',title:'恒信零售验收通过后 3 日内开票',from:'发票待开 · 恒信零售 28 万',assignee:'王工',due:'2026-11-20',status:'进行中',created:'2026-10-30',ctx:'AR5',note:'内部侧问题，不是客户问题'},
    {id:'T5',title:'中国邮政保证金 85,500 付款前提交',from:'应付 · P2026-008',assignee:'周明',due:'2026-11-08',status:'待回执',created:'2026-11-03',ctx:'P2026-008',note:'不交保证金客户不付款'},
    {id:'T6',title:'星海医药回款方案（律师函后书面答复）',from:'应收逾期 · 星海医药 82 万',assignee:'张工',due:'2026-11-02',status:'进行中',created:'2026-10-28',ctx:'AR3',note:'已逾期 72 天，诉讼准备中'},
    {id:'T7',title:'补录 P2026-002~006 项目人天台账',from:'数据缺口 · 人天覆盖率仅 9%',assignee:'刘蔚',due:'2026-11-10',status:'进行中',created:'2026-10-29',ctx:'',note:'数据不全则毛利指标不可信'},
    {id:'T8',title:'陈默支援 P2026-001 考勤联调 2 人天',from:'人员调配建议 · 张一鸣超负荷',assignee:'陈默',due:'2026-11-06',status:'已完成',created:'2026-11-01',ctx:'P2026-001',note:'',done:'2026-11-04 10:12'},
    {id:'T9',title:'补一份考勤模块数据流向说明给客户安全组',from:'企微消息 · 杨帆',assignee:'王铁军',due:'2026-11-07',status:'待回执',created:'2026-11-04',ctx:'P2026-001',note:'客户安全组要求，直接决定 M9 能否上线'},
    {id:'T10',title:'M9 考勤模块前端联调 + 演示环境搭建',from:'里程碑 · P2026-001',assignee:'张一鸣',due:'2026-11-06',status:'进行中',created:'2026-11-03',ctx:'P2026-001',note:'当前饱和度 115%，需陈默支援'},
    {id:'T11',title:'导出 10 月项目工时明细给财务',from:'数据缺口 · 人天台账',assignee:'张一鸣',due:'2026-11-05',status:'待回执',created:'2026-11-04',ctx:'',note:'影响毛利指标可信度'}
  ],
  /* ================= PRD 4.2 场景二：朋友圈与内容运营（F2-1 ~ F2-5） ================= */
  contacts:[
    {id:'C1',name:'杨帆',org:'拉普拉斯新能源',title:'IT 总监',freq:18,lastGap:0,biz:5,tags:['核心客户','在建项目'],black:false},
    {id:'C2',name:'王建国',org:'城建集团',title:'采购部主任',freq:9,lastGap:2,biz:4,tags:['大额应收','关系修复'],black:false},
    {id:'C3',name:'张海涛',org:'北京世新茂',title:'总经理',freq:6,lastGap:1,biz:5,tags:['合同勘误','决策人'],black:false},
    {id:'C4',name:'陈志强',org:'中国邮政香港',title:'项目对接人',freq:11,lastGap:1,biz:4,tags:['付款在即'],black:false},
    {id:'C5',name:'刘敏',org:'星海医药',title:'财务经理',freq:4,lastGap:3,biz:3,tags:['诉讼中'],black:true},
    {id:'C6',name:'孙磊',org:'北京罗克维尔斯',title:'采购',freq:7,lastGap:0,biz:3,tags:['框架订单'],black:false},
    {id:'C7',name:'刘总',org:'长江商学院同学会',title:'会长',freq:3,lastGap:12,biz:2,tags:['人脉','潜在转介绍'],black:false},
    {id:'C8',name:'周会计',org:'中泰物流',title:'财务',freq:8,lastGap:1,biz:2,tags:['日常对接'],black:false}
  ],
  moments:[
    {id:'MO1',who:'杨帆',time:'2 小时前',text:'新工厂第一批产品下线，团队连续三个月终于交付，感谢每一位伙伴。',fresh:true},
    {id:'MO2',who:'张海涛',time:'5 小时前',text:'公司十周年，从 12 个人到 180 个人，最好的时代还在后面。',fresh:true},
    {id:'MO3',who:'刘总',time:'昨天',text:'读《原则》第三遍，管理者最难的是承认自己会看错人。',fresh:false},
    {id:'MO4',who:'陈志强',time:'昨天',text:'港岛的秋天，跑完十公里。',fresh:true}
  ],
  liked:[],                                  // 已点赞（推荐待点赞 + 一键批量，不做静默自动点赞）
  /* ================= PRD 4.3 场景三：大模型与智能体管理（F3-1 ~ F3-3） ================= */
  llmUsers:[
    {id:'L1',dept:'交付部',name:'赵倩',quota:3000000,used:2180000,model:'企业版'},
    {id:'L2',dept:'交付部',name:'王铁军',quota:3000000,used:3260000,model:'企业版'},
    {id:'L3',dept:'研发部',name:'张一鸣',quota:5000000,used:4120000,model:'企业版 · 长上下文'},
    {id:'L4',dept:'市场部',name:'刘畅',quota:2000000,used:860000,model:'标准版'},
    {id:'L5',dept:'管理部',name:'孙晓',quota:1000000,used:120000,model:'标准版'},
    {id:'L6',dept:'财务部',name:'周会计',quota:1000000,used:980000,model:'标准版'}
  ],
  agents:[
    {id:'AG1',name:'项目周报助手',dept:'交付部',status:'启用',grant:'L2 管理层',calls:1280,score:4.6,note:'每周一自动汇总 11 个项目进展'},
    {id:'AG2',name:'回款催收助手',dept:'财务部',status:'启用',grant:'L2 财务负责人',calls:640,score:4.4,note:'按账龄生成催收话术，发送前须确认'},
    {id:'AG3',name:'合同风险审阅',dept:'交付部',status:'停用',grant:'L1 老板',calls:210,score:4.1,note:'试运行后停用，误报率偏高'},
    {id:'AG4',name:'简历初筛助手',dept:'管理部',status:'启用',grant:'L2 管理层',calls:96,score:3.8,note:'仅内部使用'},
    {id:'AG5',name:'老板问答助手',dept:'管理部',status:'启用',grant:'L1 老板',calls:2140,score:4.8,note:'本产品的核心能力'}
  ],
  /* ===== P1-1：年度经营目标 + 历史期间费用（演示补齐，净利一页纸用） =====
     口径：06 表 labor / outs 已归集项目人力与外包成本，07 表「人员薪酬」「外包服务费」不重复计入期间费用；
     期间费用 = 差旅 / 软件工具 / 业务招待 / 房租物业。10 月由 07 表实时计算，07-09 月为演示补齐。 */
  goal:{year:2026,label:'2026 年新签合同额',target:15000000,note:'目标为演示设定，可在损益一页纸中调整'},
  pnlExpense:[
    {month:'2026-07',travel:38000,tool:14000,entertain:16000,rent:30000,note:'演示补齐'},
    {month:'2026-08',travel:40000,tool:15000,entertain:17000,rent:30000,note:'演示补齐'},
    {month:'2026-09',travel:42000,tool:13000,entertain:19000,rent:30000,note:'演示补齐'}
  ],
  /* ===== P1-2：商机漏斗（增量经营视角：下个季度的钱从哪来） ===== */
  pipeline:[
    {id:'OP1',client:'中车集团',name:'HR 系统三期',stage:'商务谈判',amount:2200000,prob:0.80,expect:'2026-11-25',owner:'刘畅',last:'2026-11-03',next:'周五出最终报价并约决策人'},
    {id:'OP2',client:'锦航',name:'业财一体化二期',stage:'投标',amount:1600000,prob:0.60,expect:'2026-12-10',owner:'刘畅',last:'2026-11-01',next:'投标文件技术分复核'},
    {id:'OP3',client:'北京世新茂',name:'PS 系统升级',stage:'方案/报价',amount:980000,prob:0.45,expect:'2026-12-20',owner:'赵倩',last:'2026-10-30',next:'等客户确认实施范围'},
    {id:'OP4',client:'城建集团',name:'数据中台运维包',stage:'需求确认',amount:1200000,prob:0.30,expect:'2027-01-15',owner:'刘畅',last:'2026-10-15',next:'⚠ 长时间无进展，需约复访'},
    {id:'OP5',client:'恒信零售',name:'会员系统二期',stage:'线索',amount:600000,prob:0.15,expect:'2027-02-01',owner:'刘畅',last:'2026-10-22',next:'转介绍，先做需求访谈'},
    {id:'OP6',client:'华远集团',name:'ERP 运维续约',stage:'商务谈判',amount:850000,prob:0.75,expect:'2026-11-28',owner:'赵倩',last:'2026-11-03',next:'续约折扣待老板拍板'},
    {id:'OP7',client:'长青制造',name:'运维服务续签',stage:'已签约',amount:720000,prob:1,expect:'2026-11-02',owner:'刘畅',last:'2026-11-02',next:'已签约，转交付'},
    {id:'OP8',client:'星海医药',name:'MES 验收追加',stage:'方案/报价',amount:450000,prob:0.35,expect:'2026-12-30',owner:'赵倩',last:'2026-10-18',next:'⚠ 验收争议未解，长时间无进展'},
    {id:'OP9',client:'宏图咨询',name:'HR 咨询框架',stage:'已流失',amount:500000,prob:0,expect:'',owner:'刘畅',last:'2026-10-20',next:'预算被客户砍掉'},
    {id:'OP10',client:'顺捷物流',name:'考勤系统',stage:'已流失',amount:380000,prob:0,expect:'',owner:'刘畅',last:'2026-10-12',next:'价格竞争失败'}
  ],
  /* ===== P1-4：关键岗位 AB 角（缺 B 角 = 不可替代风险） ===== */
  talent:[
    {id:'AB1',proj:'P2026-001',module:'考勤模块 · 前端联调',owner:'张一鸣',backup:'',ready:'',impact:'回款③④⑤共 ¥117.5 万卡在 M9 考勤上线',note:'A 角饱和度 115%，连续 3 周超负荷'},
    {id:'AB2',proj:'P2026-002',module:'业财接口 · 后端',owner:'王铁军',backup:'',ready:'',impact:'二期 PCR 项目交付无人可接',note:'A 角近 4 周产出 95→70 持续下降，且未交周报'},
    {id:'AB3',proj:'P2026-006',module:'数据迁移 · 实施',owner:'周明',backup:'',ready:'',impact:'客户侧数据口径只有一人清楚',note:'无文档沉淀'},
    {id:'AB4',proj:'P2026-001',module:'项目管理 · 客户对接',owner:'赵倩',backup:'周明',ready:'可接',impact:'—',note:'B 角已参与周会，可代行对接'},
    {id:'AB5',proj:'P2026-003',module:'UI 与验收材料',owner:'李慧',backup:'陈默',ready:'需 2 周交接',impact:'—',note:'B 角熟悉度 60%'},
    {id:'AB6',proj:'P2026-004',module:'蓝图方案 · 售前',owner:'刘畅',backup:'',ready:'',impact:'在谈商机 5 个由其一人跟进',note:'销售侧单点依赖'}
  ],
  /* 今日三件事被忽略的记录（PRD 5.2：回答必须带动作，忽略也要留痕） */
  ignored:{},
  sent:[],                  // AI 代发已确认发送记录（PRD 非功能：AI 代发行为留痕可追溯）

  qa:{},                    // 采集到的答案 {key:{q,a,at}}
  stats:{},                 // 需求埋点 {questionText: count}
  audit:[]                  // 留痕 {t,who,act,detail}
};

/* ---------------- 状态与持久化 ---------------- */
const LS_KEY='{PLACEHOLDER_A}';
const STORE_URL='/api/boss-assistant/state';
let STORE_INFO={rev:0,path:'',saved:false,corrupt:false,lastError:'',writable:false};
let S = load();
applyDateMode();   // P0-1：按 S.dateMode 初始化计算基准日（demo=冻结 / real=今天）
function load(){
  let d=null;
  try{ const raw=localStorage.getItem(LS_KEY); if(raw) d=JSON.parse(raw);}catch(e){}
  if(!d||typeof d!=='object')d=JSON.parse(JSON.stringify(SEED));
  return withDefaults(d);
}
function save(){
  try{localStorage.setItem(LS_KEY,JSON.stringify(S));}catch(e){}
  pushState();
}
/** 新增字段对旧存档做无损补全（不升级 LS_KEY，保留用户已导入的真实数据） */
function withDefaults(d){
  ['goal','pnlExpense','pipeline','talent'].forEach(k=>{ if(d[k]===undefined||d[k]===null)d[k]=JSON.parse(JSON.stringify(SEED[k])); });
  if(d.wnVersion===undefined)d.wnVersion='';
  return d;
}
/* ---- 宿主持久化：浏览器半边只走这三条同源路由 ---- */
let pushTimer=null;
let pushClosed=false;
async function readStore(){
  const r=await fetch(STORE_URL,{headers:{accept:'application/json'},cache:'no-store'});
  if(!r.ok)throw new Error('宿主返回 '+r.status);
  const j=await r.json();
  if(!j||!j.ok)throw new Error((j&&j.error)||'宿主未返回数据');
  return j;
}
async function loadStore(){
  const j=await readStore();
  const info={rev:j.rev||0,path:j.path||'',saved:!!j.saved,corrupt:!!j.corrupt,savedAt:j.savedAt||'',writable:true,lastError:''};
  return {state:(j.state&&typeof j.state==='object')?withDefaults(j.state):null,info};
}
function pushState(){
  if(pushClosed||!STORE_INFO.writable)return;
  if(pushTimer)clearTimeout(pushTimer);
  pushTimer=setTimeout(async()=>{
    if(pushClosed)return;
    try{
      const r=await fetch(STORE_URL,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({state:S,rev:STORE_INFO.rev})});
      const j=await r.json().catch(()=>null);
      if(r.ok&&j&&j.ok){STORE_INFO.rev=j.rev;STORE_INFO.path=j.path||STORE_INFO.path;STORE_INFO.saved=true;STORE_INFO.lastError="";}
      else if(j&&j.conflict){ /* 盘上更新过：以宿主为准，别互相覆盖 */
        const g=await readStore();
        if(g.state&&typeof g.state==='object'){S=withDefaults(g.state);STORE_INFO.rev=g.rev;STORE_INFO.saved=true;STORE_INFO.lastError='';applyDateMode();render();}
      } else { STORE_INFO.saved=false; STORE_INFO.lastError=(j&&j.error)||('HTTP '+r.status); }
    }catch(e){ STORE_INFO.saved=false; STORE_INFO.lastError=String((e&&e.message)||e); }
    renderSaveBadge();
  },400);
}
function resetData(){ S=JSON.parse(JSON.stringify(SEED)); state.role='boss'; save(); render(); }

/* ---------------- 权限 v0：三级 + 字段白名单 ----------------
   PRD 3.2：L1 全权 / L2 管理（所属业务线或财务模块）/ L3 执行（仅自己被 @ 的任务与相关上下文） */
const ROLE_CONF={
  boss:   {label:'老板',   nav:['dashboard','messages','tasks','projects','people','finance','pnl','pipeline','report','sentinel','social','aiops','ask','collect','insights','audit','import','settings'], salary:true,  finance:true,  noteAll:true,  msgAll:true,  taskAll:true},
  manager:{label:'管理层', nav:['dashboard','messages','tasks','projects','people','finance','pnl','pipeline','report','sentinel','social','aiops','ask','collect','insights','audit','import'],                      salary:false, finance:true,  noteAll:true,  msgAll:true,  taskAll:true},
  staff:  {label:'员工',   nav:['dashboard','messages','tasks','projects','people','sentinel','collect'],                                                                        salary:false, finance:false, noteAll:false, msgAll:false, taskAll:false},
};
function can(view){ return ROLE_CONF[state.role].nav.includes(view); }
const STAFF_SELF='张一鸣';   // 员工视角演示身份（L3 仅可见派给自己的任务）
function maskSalary(){ return !ROLE_CONF[state.role].salary; }

/* ---------------- 留痕 ---------------- */
function log(act,detail){
  S.audit.unshift({t:new Date().toLocaleString('zh-CN',{hour12:false}),who:ROLE_CONF[state.role].label,act,detail});
  if(S.audit.length>200)S.audit.length=200; save();
}

/* ---------------- 技能1：项目台账规则 ---------------- */
function projOverdueMs(p){ return (p.milestones||[]).filter(m=>!m.done && daysBetween(m.due,todayStr())>0); }
function projRiskLevel(p){ const od=projOverdueMs(p).length; return od>=2?'高':od===1?'中等':(p.risk||'低'); }
function projReceivable(p){ return S.finance.filter(f=>f.project===p.id&&f.type==='in'&&f.kind==='应收'); }
/* P0：里程碑→回款金额联动。未完成里程碑匹配其绑定的回款批次，算出"这个节点卡住多少钱" */
function msBlockedAmt(p,m){
  if(m.done)return 0;
  const all=S.finance.filter(f=>f.project===p.id&&f.type==='in');
  const seq={'①':0,'②':1,'③':2,'④':3,'⑤':4};
  const sm=m.n.match(/回款([①②③④⑤])/);                                  // 「M9（回款③依据）」→ 第③个批次
  if(sm){const f=all[seq[sm[1]]];return (f&&f.kind!=='已收')?f.amount:0;}
  const amt=(m.n.match(/¥\s?([\d,]+)/)||[])[1];                           // 「①首付款 ¥120,000」→ 按金额匹配
  if(amt){const v=+amt.replace(/,/g,'');const f=all.find(x=>x.amount===v&&x.kind!=='已收');if(f)return v;}
  const unb=all.filter(f=>f.kind!=='已收');                               // 「M9 考勤上线」↔ 里程碑「M9 考勤：正式上线」→ 按绑定里程碑文本匹配
  const norm=s=>(s||'').replace(/[：:，,()\s]/g,'');
  const f=unb.find(x=>x.ms&&norm(m.n).includes(norm(x.ms)));
  return f?f.amount:0;
}
function allAlerts(){
  const alerts=[];
  // 规则1：里程碑逾期
  S.projects.forEach(p=>projOverdueMs(p).forEach(m=>{
    alerts.push({type:'里程碑逾期',sev:daysBetween(m.due,todayStr())>7?'high':'mid',
      title:`「${p.name}」里程碑「${m.n}」已逾期 ${daysBetween(m.due,todayStr())} 天`,
      detail:`计划完成日 ${m.due}，当前项目处于「${p.stage}」阶段。负责人建议：${p.milestones.length?'赵倩（PM）':'—'}`,
      jump:['projects',p.id]});
  }));
  // 规则2：应收逾期（数据源：03 应收台账，按约定到期日计算）
  (S.recv||[]).filter(r=>r.amount>r.paid&&daysBetween(r.due,todayStr())>0).forEach(r=>{
    const od=daysBetween(r.due,todayStr());
    alerts.push({type:'应收逾期',sev:od>60?'high':od>30?'high':'mid',
      title:`${r.client} 应收逾期 ${fmt(r.amount-r.paid)}（发票 ${r.invNo}）`,
      detail:`开票 ${r.invDate}，账期 ${r.term} 天，约定到期 ${r.due}，已逾期 ${od} 天（${od>60?'60 天以上':od>30?'31-60 天':'1-30 天'}）。责任人 ${r.owner}，催收状态：${r.status}。下一步：${r.next}`,
      jump:['finance','recv']});
  });
  // 规则4：客户集中度（P1 新增：单一客户占比过高 = 经营命脉被人拿捏）
  clientStats().forEach(k=>{
    const rs=[];
    if(k.cShare>=0.3)rs.push('在手合同占比 '+(k.cShare*100).toFixed(0)+'%');
    if(k.over>0&&k.overShare>=0.4)rs.push('占全部逾期应收 '+(k.overShare*100).toFixed(0)+'%');
    if(!rs.length)return;
    alerts.push({type:'客户集中',sev:'mid',
      title:`客户集中度预警：${k.client}（${rs.join('，')}）`,
      detail:`在手合同 ${fmt(k.contract)}、应收余额 ${fmt(k.bal)}${k.over>0?'、其中逾期 '+fmt(k.over):''}。单一客户占比过高 = 经营命脉被人拿捏，建议对该客户做账期重谈，同时拓展新客户对冲。`,
      jump:['finance','sum']});
  });
  // 规则3：周报缺失
  S.people.filter(p=>p.on&&!p.weekly).forEach(p=>{
    alerts.push({type:'周报缺失',sev:'mid',
      title:`${p.name}（${p.role}）本周未交周报`,
      detail:`该员工近 4 周产出趋势：${p.trend.join(' → ')}。${p.note}`,
      jump:['people',p.id]});
  });
  // 规则5：任务超时未回执（PRD F4-3：超时自动升级提醒至老板）
  S.tasks.filter(taskOverdue).forEach(t=>{
    const od=daysBetween(t.due,todayStr());
    alerts.push({type:'任务超时',sev:od>2?'high':'mid',
      title:`${t.assignee} 未按期完成：${t.title}`,
      detail:`截止 ${t.due}，已逾期 ${od} 天。来源：${t.from}${t.reminded?'（已催办 '+t.reminded+' 次）':''}${t.note?'。'+t.note:''}`,
      jump:['tasks',t.id]});
  });
  // 规则6：AI 代发待老板确认（PRD F1-6：涉及金额/承诺/对外表态必须确认）
  (S.drafts||[]).filter(d=>d.status==='待确认').forEach(d=>{
    alerts.push({type:'AI 代发待确认',sev:'high',
      title:`有一条 AI 拟好的回复等您确认：${d.to}`,
      detail:`风险拦截命中「${d.risk.join('、')}」，按 PRD F1-6 必须老板确认后才可发出。拟稿：${d.text.slice(0,60)}…`,
      jump:['messages',d.msgId]});
  });
  return alerts;
}
function projName(id){ const p=S.projects.find(x=>x.id===id); return p?p.name:'—'; }

/* =====================================================================
   PRD 4.1 场景一：消息处理引擎（F1-2 重要性识别 / F1-3 关键信息提取 / F1-6 风险拦截）
   全部走规则引擎，可核对；不经过 LLM 判断
===================================================================== */
const MSG_MUST=['报价','合同','金额','付款','回款','保证金','违约','投诉','诉讼','律师','确认书','验收','赔偿','加薪','辞退','裁员','担保','折扣','涨价','补签','对账'];
const MSG_NOTICE=['通知','停电','检修','到账','余额','简历','日报','已发布','推送','维护','进度：'];
const MSG_PRO = /能不能|可以|麻烦|请|是否|确认|安排|发一份|发一遍|要一份|时间|支援|放一份/;
function msgClassify(m){
  if(S.msgCls&&S.msgCls[m.id])return S.msgCls[m.id];              // 老板可人工改判（改判会留痕）
  const b=m.body||'';
  if(MSG_MUST.some(k=>b.includes(k)))return 'boss';
  if(m.vip)return 'boss';
  if(MSG_NOTICE.some(k=>b.includes(k)))return 'notice';
  return MSG_PRO.test(b)?'ai':'notice';
}
function msgClassLabel(c){ return c==='boss'?'必须老板回':c==='ai'?'可助手代回':'仅需知会'; }
function msgExtract(m){
  const b=m.body||'', out=[];
  const amt=b.match(/[\d][\d,]{2,}(?:\.\d+)?\s*(?:万|元)/g);
  if(amt)out.push({k:'金额',v:amt.slice(0,2).join(' / ')});
  const t=b.match(/本周[一二三四五六日天]?|下周[一二三四五六日天]?|这周|月底|周五前|下周|明天/);
  if(t)out.push({k:'时间',v:t[0]});
  if(/确认书|验收|补签|评估|答复|时间点|方案|流程|清单/.test(b)){
    const seg=(b.match(/[^，。？；]*?(确认书|验收|补签|评估|答复|时间点)[^，。？；]*/)||[''])[0];
    if(seg)out.push({k:'决策点',v:seg.slice(0,30)});
  }
  const own=S.people.find(p=>b.includes(p.name));
  if(own)out.push({k:'责任人',v:own.name+'（'+own.role+'）'});
  if(!out.length)out.push({k:'信息',v:'例行汇报，无需回复'});
  return out;
}
/* F1-6 发送前风险拦截：涉及金额 / 承诺 / 对外正式表态，一律老板确认后才可发 */
function msgRisk(text){
  const r=[];
  if(/[\d][\d,]{2,}(?:\.\d+)?\s*(?:万|元)/.test(text))r.push('涉及具体金额');
  if(/保证|一定|肯定|承诺|包您|确保|没问题/.test(text))r.push('含承诺表述');
  if(/客户|甲方|贵司|您|合同|付款|保证金/.test(text))r.push('对外正式表态');
  return r;
}
/* F1-5 个性化自动回复：生成建议 + 人工确认发送（首版不做全自动外发） */
function msgDraft(m){
  const b=m.body||'';
  if(/考勤|上线|数据流向|确认书/.test(b))return '杨总您好，数据流向说明我们今天整理，明天下班前发您安全组；回款③的确认书我们与考勤上线确认书一并提交，具体时间点我这边周三前给您准信。';
  if(/先付|别发律师函|内部在走流程|顶上/.test(b))return '王主任您好，感谢推动。80 万这周到位后，剩余部分请给一个书面时间点，我们同步暂停后续动作，配合您内部流程。';
  if(/验收标准|书面答复/.test(b))return '刘经理您好，正式验收清单我们今天就发您，按合同附件逐条对应；本周五前我们给出书面答复，也希望能安排一次双方对口径的会。';
  if(/大写|补签/.test(b))return '张总您好，合同金额以小写 150,000 为准（大写系笔误），我们起草一份补充说明，双方盖章确认即可，不影响后续付款节点。';
  if(/保证金/.test(b))return '陈经理您好，履约保证金 85,500 已列入本周付款计划，与第一期款同步提交，付款申请书按您发的模板准备，缴纳凭证出来后第一时间发您。';
  if(/对账|人次/.test(b))return '关于按人次对账，建议 12 月 20 日前先做一次预对账，避免跨年补开票；具体口径我们整理一版发您确认。';
  if(/发票|开票资料/.test(b))return '好的，开票资料马上发您，包含营业执照、开户信息、一般纳税人资格证明，收到后请回执一下。';
  if(/支援|人天/.test(b))return '可以，陈默这两天过去支援，手上的测试任务你帮他顺延，成本记在 P2026-001。';
  if(/评审|挪到/.test(b))return '可以挪到周四上午，客户素材今天催一下，明天先内部过一遍。';
  if(/结算单|分档单价/.test(b))return '好的，本月订单人天结算单按分档单价（2430/1710/2520）拉明细，今天下班前发您采购和财务。';
  return '收到，我看完给您回复。';
}
function msgStats(){
  const all=S.messages.filter(m=>!S.msgDone[m.id]);
  const g=c=>all.filter(m=>msgClassify(m)===c).length;
  return {boss:g('boss'),ai:g('ai'),notice:g('notice'),all:all.length,
    pending:(S.drafts||[]).filter(d=>d.status==='待确认').length,
    done:Object.keys(S.msgDone||{}).length};
}
function markMsgDone(id){
  S.msgDone[id]=new Date().toLocaleString('zh-CN',{hour12:false});
  log('消息处理','标记已处理：'+id);save();render();
}
function genDraft(id){
  const m=S.messages.find(x=>x.id===id);if(!m)return;
  const text=msgDraft(m), risk=msgRisk(text);
  S.drafts.unshift({id:'D'+Date.now(),msgId:id,to:m.from+'（'+m.org+'）',text,risk,status:'待确认',at:new Date().toLocaleString('zh-CN',{hour12:false})});
  log('AI 起草回复','为「'+m.from+'」生成回复草稿'+(risk.length?'（命中风险拦截：'+risk.join('、')+'）':''));
  save();render();
}
function confirmSend(did){
  const d=S.drafts.find(x=>x.id===did);if(!d)return;
  if(!confirm('确认发送给「'+d.to+'」？\n\n'+d.text+'\n\n'+(d.risk.length?'⚠ 风险提示：'+d.risk.join('、'):'')))return;
  d.status='已发送';
  S.sent.unshift({...d,sentAt:new Date().toLocaleString('zh-CN',{hour12:false})});
  S.msgDone[d.msgId]=new Date().toLocaleString('zh-CN',{hour12:false});
  log('AI 代发','老板确认后发送给「'+d.to+'」'+(d.risk.length?'（已过风险拦截）':''));
  save();render();
}
function dropDraft(did){
  const d=S.drafts.find(x=>x.id===did);if(!d)return;
  d.status='已取消';log('AI 代发','取消草稿：'+d.to);save();render();
}

/* =====================================================================
   PRD 4.4 F4-2 / F4-3：任务派活与回执追踪
===================================================================== */
function taskOverdue(t){ return t.status!=='已完成'&&daysBetween(t.due,todayStr())>0; }
function taskScope(){ return ROLE_CONF[state.role].taskAll?S.tasks:S.tasks.filter(t=>t.assignee===STAFF_SELF); }
function taskStats(list){
  const all=list||S.tasks, done=all.filter(t=>t.status==='已完成').length;
  const acked=all.filter(t=>t.status!=='待回执').length;
  return {total:all.length,done,acked,pending:all.length-acked,
    doing:all.filter(t=>t.status==='进行中').length,
    overdue:all.filter(taskOverdue).length,
    closure:all.length?Math.round(acked/all.length*100):0};
}
function ackTask(id){
  const t=S.tasks.find(x=>x.id===id);if(!t)return;
  t.status='进行中';t.ackAt=new Date().toLocaleString('zh-CN',{hour12:false});
  log('任务回执',t.assignee+' 已回执：「'+t.title+'」');save();render();
}
function doneTask(id){
  const t=S.tasks.find(x=>x.id===id);if(!t)return;
  t.status='已完成';t.done=new Date().toLocaleString('zh-CN',{hour12:false});
  log('任务完成',t.assignee+' 提交完成：「'+t.title+'」');save();render();
}
function remindTask(id){
  const t=S.tasks.find(x=>x.id===id);if(!t)return;
  t.reminded=(t.reminded||0)+1;
  log('任务催办','向「'+t.assignee+'」催办：'+t.title+'（第 '+t.reminded+' 次）');save();render();
}
function openDispatch(preset){
  state.modal={type:'dispatch',preset:preset||{}};renderModal();
}
function submitDispatch(){
  const title=(document.getElementById('dpTitle')||{}).value||'';
  const who=(document.getElementById('dpWho')||{}).value||'';
  const due=(document.getElementById('dpDue')||{}).value||'';
  const note=(document.getElementById('dpNote')||{}).value||'';
  if(!title.trim()||!who||!due){alert('请填写任务标题、责任人、截止日期');return;}
  const pre=(state.modal&&state.modal.preset)||{};
  S.tasks.unshift({id:'T'+Date.now(),title:title.trim(),from:pre.from||'手动派活',assignee:who,due,status:'待回执',created:todayStr(),ctx:pre.ctx||'',note:note.trim()});
  log('任务派活','派给「'+who+'」：'+title.trim()+'，截止 '+due+(pre.from?'（来源：'+pre.from+'）':''));
  closeModal();save();render();
}
/* PRD 5.2：首屏即答案——今日待处理三件事（合并四类信号，按严重度排序） */
function triageItems(){
  const items=[];
  (S.drafts||[]).filter(d=>d.status==='待确认').forEach(d=>{
    const m=S.messages.find(x=>x.id===d.msgId);
    items.push({key:'draft_'+d.id,score:100,icon:'🤖',tag:'AI 代发待确认',
      title:'一条 AI 拟好的回复等您确认：'+(m?m.from+'（'+m.org+'）':d.to),
      why:'风险拦截命中「'+d.risk.join('、')+'」，按 F1-6 必须您确认后才可发出',
      jump:['messages',d.msgId],dispatch:{title:'跟进：'+d.to,from:'AI 代发 · '+d.risk.join('、'),ctx:d.msgId}});
  });
  allAlerts().filter(a=>a.type!=='任务超时'&&a.type!=='AI 代发待确认').forEach(a=>{
    items.push({key:'alert_'+a.title,score:a.sev==='high'?90:55,icon:a.type==='里程碑逾期'?'📅':a.type==='应收逾期'?'💸':'🚨',tag:a.type,
      title:a.title,why:a.detail.slice(0,90)+(a.detail.length>90?'…':''),
      jump:a.jump,dispatch:{title:'处理：'+a.title.slice(0,26),from:a.type,ctx:a.jump[1]||''}});
  });
  S.messages.filter(m=>!S.msgDone[m.id]&&msgClassify(m)==='boss').forEach(m=>{
    items.push({key:'msg_'+m.id,score:80+(m.vip?5:0),icon:'💬',tag:'必须老板回',
      title:m.from+'（'+m.org+'）：'+(m.body.slice(0,34))+'…',
      why:'重要性识别为「必须老板回」'+(m.vip?' · 关键联系人':'')+'，提取：'+msgExtract(m).map(x=>x.k+' '+x.v).join('｜').slice(0,60),
      jump:['messages',m.id],dispatch:{title:'回复并跟进：'+m.from,from:'消息'+(m.group?' · '+m.group:''),ctx:m.id}});
  });
  S.tasks.filter(taskOverdue).forEach(t=>{
    items.push({key:'task_'+t.id,score:70,icon:'⏰',tag:'任务超时未回执',
      title:t.assignee+' 未按期完成：'+t.title,
      why:'截止 '+t.due+'，已逾期 '+daysBetween(t.due,todayStr())+' 天，来源：'+t.from,
      jump:['tasks',t.id],dispatch:{title:'升级跟进：'+t.title,from:'任务超时 · '+t.from,ctx:t.ctx}});
  });
  const dt=dataTrust();
  if(dt.overall<0.6)items.push({key:'data_trust',score:35,icon:'🧩',tag:'数据不完整',
    title:'看板指标仅基于 '+Math.round(dt.overall*100)+'% 数据计算，结论可能有偏',
    why:'最大缺口：'+dt.items.sort((a,b)=>a.cov-b.cov)[0].k+'（覆盖 '+Math.round(dt.items.sort((a,b)=>a.cov-b.cov)[0].cov*100)+'%）',
    jump:['dashboard',''],dispatch:null});
  return items.filter(i=>!S.ignored[i.key]).sort((a,b)=>b.score-a.score);
}
function ignoreItem(key){
  S.ignored[key]=todayStr();
  log('今日三件事','忽略一项待办：'+key);
  save();render();
}
/* PRD 6.3：数据不全必须产品化——「基于 x% 数据计算」+ 补齐清单 */
function dataTrust(){
  const n=S.projects.length||1;
  const manDay=S.projects.filter(p=>p.manDays>0).length/n;                 // 有人天记录的项目
  const contractFile=Math.min(1,6/n);                                      // 快照中 5 个项目无合同文件
  const recvMap=S.projects.filter(p=>S.finance.some(f=>f.project===p.id&&f.kind==='已收')).length/n;
  const invOk=S.recv.filter(r=>r.invNo&&r.invNo!=='—').length/(S.recv.length||1);
  const priceOk=S.projects.filter(p=>p.price==='FP'||p.unitPrice).length/n;
  const items=[
    {k:'项目人天台账',cov:manDay,w:0.28,fix:'补齐 P2026-002~006 的人天记录（当前仅 1 个项目有人天）'},
    {k:'合同—项目映射',cov:contractFile,w:0.2,fix:'5 个项目有业务登记但无合同文件，先补合同编号与扫描件'},
    {k:'回款对应关系',cov:recvMap,w:0.2,fix:'大部分项目无回款批次记录，需与财务流水逐笔勾对'},
    {k:'应收开票信息',cov:invOk,w:0.16,fix:'恒信零售 28 万未开票，补齐后可提升该指标'},
    {k:'计价与单价口径',cov:priceOk,w:0.16,fix:'T&M 项目补人天单价与分档规则'}
  ];
  const overall=items.reduce((s,i)=>s+i.cov*i.w,0);
  return {items,overall,level:overall>=0.8?'可信':overall>=0.6?'基本可信':'数据不完整'};
}
/* PRD 4.2：重点人员识别（互动频次 + 商机关联度 + 最近互动衰减） */
function relationScore(c){
  const freq=Math.min(1,c.freq/20)*40, biz=(c.biz/5)*40;
  const rec=c.lastGap<=2?20:c.lastGap<=7?13:c.lastGap<=15?7:2;
  return Math.round(freq+biz+rec);
}
function recommendMoments(){
  const ok=S.moments.filter(m=>!S.liked.includes(m.id)&&m.fresh);
  return ok.map(m=>{const c=S.contacts.find(x=>x.name===m.who);return {...m,c};})
    .filter(x=>x.c&&!x.c.black)
    .map(x=>({...x,score:relationScore(x.c)}))
    .sort((a,b)=>b.score-a.score);
}
/* F2-3 内容摘要：三点式（结论 / 时间 / 待办），规则抽取后由 LLM 润色 */
function summarizeText(text){
  const segs=String(text).split(/[。！？\n]/).map(s=>s.trim()).filter(s=>s.length>6);
  const used=new Set();
  const take=(...res)=>{
    for(const re of res){
      const s=segs.find(x=>re.test(x)&&!used.has(x));
      if(s){used.add(s);return s;}
    }
    return undefined;
  };
  const money=segs.find(s=>/[\d][\d,]{2,}\s*(?:万|元)/.test(s));
  const decision=take(/确定|决定|结论|同意|拍板|按/);
  const timing=take(/\d{1,2}\s*月\s*\d{1,2}\s*日|\d{1,2}\/\d{1,2}|截止/, /周|月|日|底/);
  const todo=take(/需要|请|麻烦|负责|牵头|安排|跟进|提供|发/);
  const out=[
    '结论：'+(decision||money||segs[0]||'—'),
    '时间节点：'+(timing||'未提及明确时间'),
    '待办 / 责任人：'+(todo||'未提及待办事项')
  ];
  if(money)out.push('涉及金额：'+(money.match(/[\d][\d,]{2,}(?:\.\d+)?\s*(?:万|元)/)||['—'])[0]);
  return out.slice(0,4);
}
/* F2-4 / F2-5 分平台文案：一次编辑，四条不同调性 */
function genCopy(topic){
  const t=topic||'我们帮中小企业把经营数据变成老板一眼能懂的看板';
  return [
    {p:'朋友圈',tone:'偏人味',text:'今天跟一位做了 18 年制造的老板聊，他说最怕的不是没订单，是月底算不清到底赚没赚钱。\n我们把他的项目、人天、回款拉到一张表上，他盯着看了半分钟说：原来是这两个客户在养我。\n'+t},
    {p:'视频号',tone:'偏叙事',text:'【一个老板的三十秒】\n早上 8 点，他打开手机，看到三件事：谁欠他钱、哪个项目卡住了、谁该交的东西没交。\n'+t+' 这不是报表，是他每天的第一口气。'},
    {p:'抖音',tone:'偏钩子',text:'老板别再看 Excel 了❗\n11 个项目、732 万没收回来，一张图看完。\n'+t+' #中小企业 #经营管理 #老板日常'},
    {p:'小红书',tone:'偏种草',text:'给所有 10-500 人公司的老板安利一个东西 🧾\n不用装系统、不用学操作，打开就知道今天该催谁的钱。\n'+t+'\n#经营管理 #老板工具 #现金流'}
  ];
}
/* PRD 4.3：Token 配额与计费（P2 变现载体） */
const TOKEN_PRICE=0.012;   // 元/千 token（演示定价）
function llmStats(){
  const dept={};
  S.llmUsers.forEach(u=>{
    dept[u.dept]=dept[u.dept]||{quota:0,used:0,people:0};
    dept[u.dept].quota+=u.quota;dept[u.dept].used+=u.used;dept[u.dept].people++;
  });
  const used=S.llmUsers.reduce((s,u)=>s+u.used,0),quota=S.llmUsers.reduce((s,u)=>s+u.quota,0);
  return {dept,used,quota,rate:quota?used/quota:0,
    over:S.llmUsers.filter(u=>u.used>u.quota),
    bill:used/1000*TOKEN_PRICE};
}
function agentStats(){
  const on=S.agents.filter(a=>a.status==='启用');
  return {on:on.length,total:S.agents.length,
    calls:S.agents.reduce((s,a)=>s+a.calls,0),
    score:(S.agents.reduce((s,a)=>s+a.score,0)/(S.agents.length||1))};
}


/* ---------------- 技能2：人员状态规则 ---------------- */
function teamSummary(){
  const on=S.people.filter(p=>p.on);
  return {total:S.people.length,on:on.length,
    avgSat:Math.round(on.reduce((s,p)=>s+p.sat,0)/on.length),
    noWeekly:on.filter(p=>!p.weekly).length,
    overload:on.filter(p=>p.sat>100).length,
    idle:on.filter(p=>p.sat<50).length};
}

/* ---------------- 技能3：财务规则 ---------------- */
function finSummary(){
  const recd=S.finance.filter(f=>f.type==='in'&&f.kind==='已收');
  const untrig=S.finance.filter(f=>f.type==='in'&&(f.kind==='未触发'||f.kind==='待核对'));
  const outM=S.finance.filter(f=>f.type==='out'&&f.kind==='已付'&&f.date.startsWith('2026-10'));
  const recv=S.finance.filter(f=>f.type==='in'&&f.kind==='应收');
  const recvOver=recv.filter(f=>f.due&&daysBetween(f.due,todayStr())>0);
  const pay=S.finance.filter(f=>f.type==='out'&&f.kind==='应付');
  const contractTotal=S.projects.reduce((s,p)=>s+(p.contract||0),0);
  const totalReceived=recd.reduce((s,f)=>s+f.amount,0);
  return {
    totalReceived, contractTotal,
    recvRate:contractTotal>0?Math.round(totalReceived/contractTotal*100):0,
    untrigSum:untrig.reduce((s,f)=>s+f.amount,0), untrigList:untrig,
    inSum:totalReceived, outSum:outM.reduce((s,f)=>s+f.amount,0),
    recvSum:recv.reduce((s,f)=>s+f.amount,0), recvOverSum:recvOver.reduce((s,f)=>s+f.amount,0),
    recvOverList:recvOver, paySum:pay.reduce((s,f)=>s+f.amount,0),
    net:totalReceived-outM.reduce((s,f)=>s+f.amount,0)};
}

/* 子表「09 指标口径」：全部 KPI 由规则计算，口径以样表 09 页为准 */
function finOps(){
  const M='2026-10'; // 本期 = 2026-10
  const inM=S.flowsIn.filter(f=>f.date.startsWith(M));
  const outM=S.flowsOut.filter(f=>f.date.startsWith(M));
  const inflow=inM.reduce((s,f)=>s+f.amount,0), outflow=outM.reduce((s,f)=>s+f.amount,0);
  const recvOpen=S.recv.filter(r=>r.amount>r.paid);                          // 未结清应收
  const recvBal=recvOpen.reduce((s,r)=>s+(r.amount-r.paid),0);               // 应收余额
  const recvOver=recvOpen.filter(r=>daysBetween(r.due,todayStr())>0);        // 逾期
  const recvOverSum=recvOver.reduce((s,r)=>s+(r.amount-r.paid),0);
  const payOpen=S.payable.filter(r=>r.amount>r.paid);                        // 未结清应付
  const payBal=payOpen.reduce((s,r)=>s+(r.amount-r.paid),0);
  const payOver=payOpen.filter(r=>daysBetween(r.due,todayStr())>0);
  const avail=S.accts.filter(a=>!a.restricted).reduce((s,a)=>s+a.end,0);     // 可用资金（剔除受限）
  const fixedM=S.budget.filter(b=>['人员薪酬','房租物业','税费'].includes(b.item)).reduce((s,b)=>s+b.actual,0);
  const safety=fixedM>0?(avail/fixedM):0;                                    // 现金安全垫（月）
  const costRows=S.costs.map(c=>{const cost=c.labor+c.outs+c.travel,gm=c.revenue-cost;
    return {...c,cost,gm,rate:c.revenue>0?gm/c.revenue:0};});
  const rev9=costRows.filter(c=>c.month==='2026-09').reduce((s,c)=>s+c.revenue,0);
  const gm9=costRows.filter(c=>c.month==='2026-09').reduce((s,c)=>s+c.gm,0);
  const rev10=costRows.filter(c=>c.month==='2026-10').reduce((s,c)=>s+c.revenue,0);
  const gm10=costRows.filter(c=>c.month==='2026-10').reduce((s,c)=>s+c.gm,0);
  return {M,inflow,outflow,net:inflow-outflow,recvOpen,recvBal,
    recvOverSum,recvOverRate:recvBal>0?Math.round(recvOverSum/recvBal*100):0,recvOver,
    payOpen,payBal,payOver,avail,safety,fixedM,costRows,
    gmRate9:rev9>0?gm9/rev9:0, gmRate10:rev10>0?gm10/rev10:0,
    unconfirmed:S.orders.reduce((s,o)=>s+(o.amount-o.recognized),0),       // 未确认收入（在手订单）
    /* P0 新增：可支配现金 + 人效三数 */
    payDue30:payOpen.filter(r=>daysBetween(r.due,todayStr())>=-30).reduce((s,r)=>s+(r.amount-r.paid),0),
    onCnt:S.people.filter(p=>p.on).length,
    labor10:(S.budget.find(b=>b.item==='人员薪酬'&&b.month===M)||{}).actual||0,
    revM:rev10, gmM:gm10};
}
/* finOps 衍生指标：可支配现金（可支配=可用资金−未来30天刚性支出）与人均口径 */
function finOpsX(){
  const o=finOps();
  o.rigid30=o.payDue30+o.fixedM;
  o.disp=o.avail-o.rigid30;                                    // 可支配现金（市场口径：货币资金−受限−30天刚性支出）
  o.perRev=o.onCnt?o.revM/o.onCnt:0;                           // 人均产值（月）
  o.perGm=o.onCnt?o.gmM/o.onCnt:0;                             // 人均毛利（月）
  o.laborRatio=o.revM>0?o.labor10/o.revM:0;                    // 人力成本占收入比
  /* P1 新增：发票状态拆分 + DSO + 平均逾期天数 */
  const open=o.recvOpen;
  o.invDone=open.filter(r=>r.invNo&&r.invNo!=='—');            // 已开票未回款（客户侧问题：催收）
  o.invWait=open.filter(r=>!r.invNo||r.invNo==='—');           // 未开票（内部侧问题：尽快开票）
  o.invDoneSum=o.invDone.reduce((s,r)=>s+(r.amount-r.paid),0);
  o.invWaitSum=o.invWait.reduce((s,r)=>s+(r.amount-r.paid),0);
  o.dso10=o.revM>0?Math.round(o.recvBal/o.revM*30):0;          // DSO＝应收余额÷本期确认收入×30
  o.dso9=o.rev9>0?Math.round(o.recvBal/o.rev9*30):0;           // 同口径按上月收入折算（环比方向参考）
  const odRows=open.filter(r=>daysBetween(r.due,todayStr())>0);
  o.avgOd=odRows.length?Math.round(odRows.reduce((s,r)=>s+(r.amount-r.paid)*daysBetween(r.due,todayStr()),0)/odRows.reduce((s,r)=>s+(r.amount-r.paid),0)):0; // 金额加权平均逾期天数
  return o;
}
/* P1：客户集中度（按客户聚合 合同/应收/逾期/未确认收入，单一客户过高=经营风险） */
function clientStats(){
  const byC={};
  S.orders.forEach(o=>{const k=byC[o.client]=byC[o.client]||{client:o.client,contract:0,recg:0,bal:0,over:0,unconf:0};
    k.contract+=o.amount;k.recg+=o.recognized;k.unconf+=o.amount-o.recognized;});
  S.recv.filter(r=>r.amount>r.paid).forEach(r=>{const k=byC[r.client]=byC[r.client]||{client:r.client,contract:r.contractAmt,recg:0,bal:0,over:0,unconf:0};
    k.bal+=r.amount-r.paid;if(daysBetween(r.due,todayStr())>0)k.over+=r.amount-r.paid;});
  const totC=Object.values(byC).reduce((s,k)=>s+k.contract,0)||1;
  const totBal=Object.values(byC).reduce((s,k)=>s+k.bal,0)||1;
  const totOver=Object.values(byC).reduce((s,k)=>s+k.over,0)||1;
  return Object.values(byC).map(k=>({...k,cShare:k.contract/totC,balShare:k.bal/totBal,overShare:k.over/totOver}))
    .sort((a,b)=>b.contract-a.contract);
}

/* =====================================================================
   P1 引擎：① 损益一页纸 ② 商机漏斗 ③ 老板周报 ④ 关键人才 AB 角
   原则沿用：规则引擎算数、口径可核对、数据不全时不下结论
===================================================================== */
/* 期间费用口径：06 表 labor/outs 已含项目人力与外包，07 表同名科目不重复计入；
   只取差旅 / 软件工具 / 招待 / 房租。若该月 07 表有数据则实时算，否则用演示补齐值。 */
const fmtSigned=n=>(n>=0?'':'−')+fmt(Math.abs(n));   // 负数金额规范写法：−¥9,200
const PNL_OP_EXCLUDE=['人员薪酬','外包服务费'];
function pnlExpenseOf(month){
  const rows=S.budget.filter(b=>b.month===month&&!PNL_OP_EXCLUDE.includes(b.item));
  if(rows.length)return {amt:rows.reduce((s,b)=>s+b.actual,0),estimated:false,
    detail:rows.map(b=>b.item+' '+fmt(b.actual)).join(' + ')};
  const h=(S.pnlExpense||[]).find(x=>x.month===month);
  return {amt:h?(h.travel+h.tool+h.entertain+h.rent):0,estimated:true,
    detail:h?`差旅 ${fmt(h.travel)} + 软件 ${fmt(h.tool)} + 招待 ${fmt(h.entertain)} + 房租 ${fmt(h.rent)}（演示补齐）`:'无费用数据'};
}
function pnlOps(){
  const byM={};
  S.costs.forEach(c=>{const o=byM[c.month]=byM[c.month]||{month:c.month,rev:0,cost:0};o.rev+=c.revenue;o.cost+=c.labor+c.outs+c.travel;});
  const months=Object.keys(byM).sort().map(k=>{
    const o=byM[k], ex=pnlExpenseOf(k);
    o.gm=o.rev-o.cost; o.gmRate=o.rev?o.gm/o.rev:0;
    o.opex=ex.amt; o.opexDetail=ex.detail; o.estimated=ex.estimated;
    o.net=o.gm-o.opex; o.netRate=o.rev?o.net/o.rev:0;
    return o;
  });
  const cur=months[months.length-1]||{month:finOps().M,rev:0,cost:0,gm:0,gmRate:0,opex:0,net:0,netRate:0,estimated:true,opexDetail:'—'};
  const signed=S.projects.reduce((s,p)=>s+(p.contract||0),0);
  const target=(S.goal&&+S.goal.target)||15000000;
  const gap=Math.max(0,target-signed);
  const avg=signed/(S.projects.length||1);
  const cm=+todayStr().slice(5,7), remainMonths=Math.max(1,13-cm);
  const first=months[0],last=cur;
  const drops=months.filter((m,i)=>i>0&&m.netRate<months[i-1].netRate).length;
  return {months,cur,first,signed,target,gap,rate:target?signed/target:0,avg,
    needDeals:avg?Math.ceil(gap/avg):0,monthlyNeed:gap/remainMonths,remainMonths,drops,
    turning:months.length>1&&months[months.length-2].net>=0&&last.net<0};
}
function setGoal(){
  const v=prompt('设置 2026 年新签合同额目标（元）：',String((S.goal&&S.goal.target)||15000000));
  if(v===null)return; const n=+String(v).replace(/[^\d.]/g,'');
  if(!n||n<=0){alert('请输入有效金额');return;}
  S.goal={...(S.goal||{}),target:n}; log('年度目标','新签合同额目标调整为 '+fmt(n)); save(); render();
}
/* 商机漏斗：六阶段 + 加权额 + 赢单率 + 下月预计签约 + 停滞预警 */
const PIPE_STAGES=['线索','需求确认','方案/报价','投标','商务谈判','已签约'];
const PIPE_PROB={'线索':0.15,'需求确认':0.30,'方案/报价':0.45,'投标':0.60,'商务谈判':0.80,'已签约':1,'已流失':0};
function pipelineOps(){
  const all=S.pipeline||[];
  const open=all.filter(o=>!['已签约','已流失'].includes(o.stage));
  const won=all.filter(o=>o.stage==='已签约').length, lost=all.filter(o=>o.stage==='已流失').length;
  const sum=(rows,f)=>rows.reduce((s,o)=>s+f(o),0);
  const amt=sum(open,o=>o.amount), weighted=sum(open,o=>o.amount*(o.prob||0));
  const winRate=(won+lost)?won/(won+lost):0;
  const y=+todayStr().slice(0,4), m=+todayStr().slice(5,7);
  const ny=m===12?y+1:y, nm2=m===12?1:m+1, nm=`${ny}-${String(nm2).padStart(2,'0')}`;
  const nextDeals=open.filter(o=>(o.expect||'').startsWith(nm));
  const nextAmt=sum(nextDeals,o=>o.amount*(o.prob||0));
  const stalled=open.filter(o=>o.last&&daysBetween(o.last,todayStr())>14);
  const byStage=PIPE_STAGES.map(st=>{const rows=(st==='已签约'?all:open).filter(o=>o.stage===st);
    return {stage:st,cnt:rows.length,amt:sum(rows,o=>o.amount),weighted:sum(rows,o=>o.amount*(o.prob||0))};});
  return {all,open,won,lost,winRate,amt,weighted,nextAmt,nextDeals,stalled,byStage,nm};
}
function pipeMove(id,dir){
  const o=(S.pipeline||[]).find(x=>x.id===id); if(!o)return;
  const all=PIPE_STAGES.concat(['已流失']); let i=all.indexOf(o.stage)+dir;
  if(i<0||i>=all.length)return;
  o.stage=all[i]; o.last=todayStr(); o.prob=PIPE_PROB[o.stage]!==undefined?PIPE_PROB[o.stage]:o.prob;
  log('商机推进',`「${o.client} · ${o.name}」阶段调整为 ${o.stage}`); save(); render();
}
/* 关键人才 AB 角：缺 B 角 = 不可替代；A 角超负荷 / 未交周报 = 高危 */
function talentOps(){
  const rows=S.talent||[];
  const noB=rows.filter(r=>!r.backup);
  const high=noB.filter(r=>{const p=S.people.find(x=>x.name===r.owner);return p&&(p.sat>100||!p.weekly);});
  return {rows,noB,high,cover:rows.length?(rows.length-noB.length)/rows.length:0};
}
function setBackup(id){
  const r=(S.talent||[]).find(x=>x.id===id); if(!r)return;
  const v=prompt(`为「${r.module}」指定 B 角（当前 A 角 ${r.owner}）：`,r.backup||'');
  if(v===null)return;
  r.backup=v.trim(); r.ready=r.backup?'待交接':'';
  log('AB 角维护',`「${r.module}」B 角设为 ${r.backup||'（清空）'}`); save(); render();
}
function dispatchHiring(){
  openDispatch({title:'启动关键岗位招聘 / 在招进度跟进',from:'人员调配建议 · 内部无可调配人选',ctx:''});
}
/* 老板周报：一键生成可转发的一页纸（纯文本 + 独立 HTML 文件） */
function weeklyReport(){
  const ops=finOpsX(),pn=pnlOps(),pipe=pipelineOps(),tal=talentOps(),dt=dataTrust(),F=finSummary();
  const tri=triageItems().slice(0,3),al=allAlerts();
  const pct=n=>(n*100).toFixed(1)+'%';
  const meta={date:todayStr(),basis:dateMode()==='real'?'真实日期':'演示冻结 '+DEMO_DATE,trust:Math.round(dt.overall*100)};
  const secs=[
    {h:'一、老板四数',rows:[
      `可支配现金 ${fmt(ops.disp)}（安全垫 ${ops.safety.toFixed(1)} 个月）`,
      `毛利率 ${pct(ops.gmRate10)}（环比 ${((ops.gmRate10-ops.gmRate9)*100).toFixed(1)}pt）`,
      `应收超期 ${fmt(ops.recvOverSum)}（逾期率 ${ops.recvOverRate}%，${ops.recvOver.length} 笔）`,
      `人均毛利 ${fmt(Math.round(ops.perGm))}／月`
    ]},
    {h:'二、这个月赚了多少',rows:[
      `确认收入 ${fmt(pn.cur.rev)} − 直接成本 ${fmt(pn.cur.cost)} = 毛利 ${fmt(pn.cur.gm)}（${pct(pn.cur.gmRate)}）`,
      `毛利 − 期间费用 ${fmt(pn.cur.opex)} = 净利 ${fmtSigned(pn.cur.net)}（净利率 ${pct(pn.cur.netRate)}）`,
      pn.turning?'⚠ 净利由正转负，这是本月最需要关注的一条':'净利率趋势：'+pn.months.map(m=>m.month.slice(5)+'月 '+pct(m.netRate)).join(' → '),
      `年度目标 ${fmt(pn.target)} · 已签 ${fmt(pn.signed)}（${pct(pn.rate)}）· 缺口 ${fmt(pn.gap)}，年内还需约 ${pn.needDeals} 个均单`
    ]},
    {h:'三、下个季度的钱从哪来',rows:[
      `在谈商机 ${pipe.open.length} 个 / ${fmt(pipe.amt)}，加权预计签约 ${fmt(pipe.weighted)}`,
      `下月（${pipe.nm}）预计签约 ${fmt(pipe.nextAmt)}（${pipe.nextDeals.length} 个商机）`,
      `历史赢单率 ${pct(pipe.winRate)}；停滞商机 ${pipe.stalled.length} 个${pipe.stalled.length?'：'+pipe.stalled.map(o=>o.client).join('、'):''}`
    ]},
    {h:'四、必须您处理的三件事',rows:tri.length?tri.map((t,i)=>`${i+1}. ${t.title} — ${t.why}`):['本周无待处理事项']},
    {h:'五、风险与人才',rows:[
      `哨兵共 ${al.length} 条提醒，高危 ${al.filter(a=>a.sev==='high').length} 条`,
      `关键岗位 ${tal.rows.length} 个，无 B 角 ${tal.noB.length} 个（覆盖率 ${pct(tal.cover)}），高危 ${tal.high.length} 个`,
      ...tal.high.slice(0,2).map(r=>`· ${r.owner}「${r.module}」无 B 角且 A 角异常：${r.impact}`)
    ]},
    {h:'六、数据说明',rows:[`数据可信度 ${meta.trust}%（${dt.level}）；以上指标基于台账计算，数据不全时只看趋势、不作为结论。`]}
  ];
  const text=['【老板周报】'+meta.date+'（基准日口径：'+meta.basis+'）','',...secs.flatMap(s=>[s.h,...s.rows.map(r=>'  '+r),'']),'—— 由老板超级助手规则引擎生成 · 原始数据可在系统内逐条核对'].join('\n');
  const html=`<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>老板周报 ${meta.date}</title><style>body{font-family:"Microsoft YaHei",system-ui,sans-serif;max-width:760px;margin:32px auto;padding:0 20px;color:#1c2333;line-height:1.8}h1{font-size:22px;border-bottom:3px solid #2456e6;padding-bottom:10px}h2{font-size:15px;color:#2456e6;margin-top:26px}li{margin:4px 0}.meta{color:#6b7688;font-size:12px}.foot{margin-top:32px;border-top:1px solid #e5e9f0;padding-top:12px;color:#6b7688;font-size:12px}</style></head><body><h1>老板周报 · ${meta.date}</h1><div class="meta">生成口径：${meta.basis} ｜ 数据可信度 ${meta.trust}%（${dt.level}）｜ 规则引擎生成，原始依据可在系统内核对</div>${secs.map(s=>`<h2>${s.h}</h2><ul>${s.rows.map(r=>`<li>${r}</li>`).join('')}</ul>`).join('')}<div class="foot">老板超级助手 · 人 · 财 · 事 三视图</div></body></html>`;
  return {meta,secs,text,html};
}
function copyWeekly(){
  const t=weeklyReport().text;
  const done=()=>{log('老板周报','复制周报文本到剪贴板');save();alert('周报文本已复制，可直接粘贴到微信 / 邮件');};
  if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).then(done).catch(()=>fallback());}
  else fallback();
  function fallback(){try{const ta=document.createElement('textarea');ta.value=t;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);done();}catch(e){alert('复制失败，请手动选中周报文本');}}
}
function exportWeekly(){
  const r=weeklyReport();
  const blob=new Blob([r.html],{type:'text/html;charset=utf-8'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='老板周报_'+r.meta.date+'.html';a.click();
  log('老板周报','导出可转发 HTML 周报');save();
}

/* ---------------- 技能4：20 问题库（规则引擎出答案 + 原始依据） ---------------- */
function buildAnswer(q){
  const F=finSummary(),T=teamSummary();
  const norm=q.replace(/[？?！!。.\s]/g,'');
  const has=(...ws)=>ws.some(w=>norm.includes(w));
  const mk=(text,evi,extra)=>({text,evi,extra});
  // --- PRD 新增：消息 / 任务 / 数据可信度 / AI 用量 ---
  if(has('今天','待处理','该处理','三件事','先看什么','忙什么')){
    const items=triageItems();
    if(!items.length)return mk('今天没有需要您亲自处理的事。哨兵未触发高危提醒，任务全部已回执 👍',[{label:'提醒哨兵',view:'sentinel'}]);
    return mk(`今天需要您处理 <b class="hl">${items.length}</b> 件事，前 3 件是：`+
      items.slice(0,3).map((it,i)=>`<br>${i+1}. <b>${it.title}</b><br><span style="color:var(--muted);font-size:12.5px">${it.why}</span>`).join('')+
      `<br><br>每条都能一键 @ 责任人派活，或跳到原始依据核对。`,
      items.slice(0,3).map(it=>({label:it.tag+' · '+it.title.slice(0,16),view:it.jump[0],id:it.jump[1]||''})));
  }
  if(has('消息','谁找我','要我回','未读','微信','企微')){
    const st=msgStats();
    const bossList=S.messages.filter(m=>!S.msgDone[m.id]&&msgClassify(m)==='boss');
    return mk(`待处理消息 <b class="hl">${st.all}</b> 条：必须老板回 <b class="hl">${st.boss}</b> 条、可助手代回 ${st.ai} 条、仅需知会 ${st.notice} 条。另有 ${st.pending} 条 AI 拟稿等您确认。`+
      `<br><br>必须您回的：`+bossList.map(m=>`<br>· <b>${m.from}</b>（${m.org}）：${m.body.slice(0,32)}…`).join(''),
      bossList.map(m=>({label:m.from+' · '+m.org,view:'messages',id:m.id})));
  }
  if(has('任务','派活','回执','谁没做','落实','跟进到哪')){
    const st=taskStats(), od=S.tasks.filter(taskOverdue);
    return mk(`共派出 <b class="hl">${st.total}</b> 个任务，已回执 ${st.acked} 个，<b class="hl">派活闭环率 ${st.closure}%</b>（PRD 30 天目标 ≥60%）。${st.overdue?'<br><br><b style="color:var(--red)">超时未完成 '+st.overdue+' 个：</b>'+od.map(t=>'<br>· '+t.assignee+'：'+t.title+'（截止 '+t.due+'，逾期 '+daysBetween(t.due,todayStr())+' 天）').join(''):'<br><br>没有超时任务。'}`,
      od.map(t=>({label:t.assignee+' · '+t.title.slice(0,14),view:'tasks',id:t.id})));
  }
  if(has('数据可信','数据完整','数据准','数据质量','准不准')){
    const dt=dataTrust();
    return mk(`当前看板数据可信度 <b class="hl">${Math.round(dt.overall*100)}%</b>（${dt.level}）。分项：`+
      dt.items.map(i=>`<br>· ${i.k}：${Math.round(i.cov*100)}%（权重 ${Math.round(i.w*100)}%）`).join('')+
      `<br><br>补齐优先级：`+dt.items.slice().sort((a,b)=>(b.w*(1-b.cov))-(a.w*(1-a.cov))).slice(0,3).map((i,n)=>(n+1)+'. '+i.fix).join('；')+
      `<br><br>所以毛利率、人均毛利这类指标现在只能看趋势，不能当结论——数据不全时我们不做结论性输出。`,
      [{label:'数据可信度明细',view:'dashboard'}]);
  }
  if(has('token','Token','用量','大模型','配额','智能体')){
    const L=llmStats(),A=agentStats();
    return mk(`本月 Token 用量 <b class="hl">${(L.used/1000000).toFixed(2)}M</b>，配额使用率 ${(L.rate*100).toFixed(0)}%。超额 ${L.over.length} 人（${L.over.map(u=>u.name).join('、')||'无'}）。按现价折算本月应收 <b class="hl">${fmt(Math.round(L.bill))}</b>。在用智能体 ${A.on}/${A.total} 个，累计调用 ${A.calls.toLocaleString('en-US')} 次，平均评分 ${A.score.toFixed(1)}。`,
      [{label:'AI 与 Token 管理',view:'aiops'}]);
  }
  if(has('朋友圈','点赞','重点人员','社交','维护关系')){
    const list=S.contacts.slice().sort((a,b)=>relationScore(b)-relationScore(a)).slice(0,3);
    const rec=recommendMoments();
    return mk(`关系评分最高的 3 位：`+list.map(c=>`<br>· <b>${c.name}</b>（${c.org} · ${c.title}）评分 ${relationScore(c)}，近 30 天互动 ${c.freq} 次`).join('')+
      `<br><br>今天有 <b class="hl">${rec.length}</b> 条待点赞推荐${rec.length?'（'+rec.map(m=>m.who).join('、')+'）':''}。我们不做静默自动点赞，只给推荐列表 + 一键批量。`,
      list.map(c=>({label:c.name+' · '+c.org,view:'social',id:c.id})));
  }
  if(has('导入','Excel','excel','CSV','csv','怎么填','录入','更新数据')){
    return mk('数据支持 Excel/CSV 导入：项目台账、收款流水、应收台账、人员名单四张表。到「数据导入」页从 Excel 复制粘贴或上传 CSV，先解析预览（新增几条 / 更新几条）再确认落表，全程留痕，导入后数据可信度自动重算。',[{label:'去数据导入',view:'import'}]);
  }
  // --- P1：损益 / 年度目标 / 商机 / 周报 / AB 角（放在财之前，避免"赚"字被现金流分支截走） ---
  if(has('损益','净利','赚了多少','这个月赚','亏','一页纸')){
    const p=pnlOps(),c=p.cur,pct=n=>(n*100).toFixed(1)+'%';
    return mk(`<b>${c.month} 这个月到底赚了多少</b>：确认收入 ${fmt(c.rev)} − 直接成本 ${fmt(c.cost)} = 毛利 ${fmt(c.gm)}（${pct(c.gmRate)}），再减期间费用 ${fmt(c.opex)}，<b class="hl" style="color:${c.net>=0?'var(--green)':'var(--red)'}">净利 ${fmtSigned(c.net)}（净利率 ${pct(c.netRate)}）</b>。<br>`+
      `近 ${p.months.length} 个月净利率：${p.months.map(m=>m.month.slice(5)+'月 '+pct(m.netRate)).join(' → ')}。${p.turning?'<b style="color:var(--red)">本月由正转负，这是最该看的一条。</b>':''}<br><br>`+
      `口径：07 费用表中的「人员薪酬 / 外包服务费」已在 06 项目成本归集，不重复计入期间费用。数据可信度 ${Math.round(dataTrust().overall*100)}%，结论只看趋势。`,
      [{label:'损益一页纸',view:'pnl'},{label:'项目成本明细',view:'finance',id:'cost'},{label:'费用预算',view:'finance',id:'budget'}]);
  }
  if(has('年度目标','目标完成','缺口','还差多少','完成多少')){
    const p=pnlOps();
    return mk(`2026 年新签合同额目标 <b>${fmt(p.target)}</b>，在手合同 <b class="hl">${fmt(p.signed)}</b>（完成 <b class="hl">${(p.rate*100).toFixed(0)}%</b>），<b style="color:var(--red)">缺口 ${fmt(p.gap)}</b>。<br>`+
      `今年还剩 ${p.remainMonths} 个月，月均需签 ${fmt(Math.round(p.monthlyNeed))}；按当前均单 ${fmt(Math.round(p.avg))} 测算，还需约 <b class="hl">${p.needDeals} 单</b>。<br>`+
      `好消息：商机漏斗里下月预计签约 ${fmt(pipelineOps().nextAmt)}，在谈加权 ${fmt(pipelineOps().weighted)}。`,
      [{label:'年度目标对照',view:'pnl'},{label:'商机漏斗',view:'pipeline'}]);
  }
  if(has('商机','漏斗','在谈','预计签约','赢单','下季度','下月')){
    const p=pipelineOps();
    return mk(`在谈商机 <b class="hl">${p.open.length} 个</b>（合计 ${fmt(p.amt)}），按阶段赢率加权预计签约 <b class="hl">${fmt(p.weighted)}</b>；历史赢单率 ${(p.winRate*100).toFixed(0)}%（签 ${p.won} / 流失 ${p.lost}）。<br>`+
      `<b>下月（${p.nm}）预计签约 ${fmt(p.nextAmt)}</b>，来自 ${p.nextDeals.length} 个商机：${p.nextDeals.map(o=>o.client+' '+fmtShort(o.amount)+'×'+(o.prob*100).toFixed(0)+'%').join('、')||'暂无'}。<br>`+
      `阶段分布：${p.byStage.filter(s=>s.cnt).map(s=>s.stage+' '+s.cnt+'个/'+fmtShort(s.amt)).join(' ｜ ')}。<br>`+
      `${p.stalled.length?'<b style="color:var(--red)">⚠ '+p.stalled.length+' 个商机超 14 天无进展：'+p.stalled.map(o=>o.client).join('、')+'</b>，建议本周派活重启跟进。':'暂无停滞商机。'}`,
      [{label:'商机漏斗',view:'pipeline'},{label:'年度目标缺口',view:'pnl'}]);
  }
  if(has('老板周报','生成周报','一键周报','周报推送')){
    const r=weeklyReport();
    return mk(`《老板周报》已按当前台账生成（${r.meta.date}，口径 ${r.meta.basis}），共 ${r.secs.length} 段：${r.secs.map(s=>s.h.replace(/^[一二三四五六]、/,'')).join(' / ')}。<br>`+
      `本周一页纸的头条：<b>${r.secs[1].rows[1]}</b>。<br><br>到「老板周报」页可复制文本（直接粘微信）、导出独立 HTML 文件、或打印存 PDF，每次生成与导出都会留痕。`,
      [{label:'打开老板周报',view:'report'},{label:'损益一页纸',view:'pnl'}]);
  }
  if(has('AB角','ab角','接班','不可替代','单点依赖','谁走了','关键岗位','瘫痪')){
    const t=talentOps();
    return mk(`关键岗位 <b>${t.rows.length}</b> 个，B 角覆盖率 <b class="hl">${(t.cover*100).toFixed(0)}%</b>，<b style="color:var(--red)">${t.noB.length} 个岗位无 B 角</b>，其中 ${t.high.length} 个高危（A 角同时超负荷或未交周报）。<br>`+
      t.high.map(r=>`<br>· <b>${r.owner}</b>「${r.module}」无 B 角：${r.impact}`).join('')+
      `<br><br>建议先给高危岗位指定 B 角并派活做文档交接；内部确实无人时，一键生成招聘需求单。`,
      [{label:'AB 角矩阵',view:'people',id:'talent'},{label:'人员调配建议',view:'people',id:'overview'}]);
  }
  // --- 财 ---
  if(has('本月回款','回款多少','回款合计','收了多少钱','这个月收','累计回款')){
    const list=S.finance.filter(f=>f.type==='in'&&f.kind==='已收');
    return mk(`累计已完成回款 <b class="hl">${fmt(F.totalReceived)}</b>，整体回款率 <b class="hl">${F.recvRate}%</b>（合同总额 ${fmt(F.contractTotal)}）。已收：${list.map(f=>f.item.split('（')[0]).join('；')}。另有 <b class="hl">${F.untrigList.length}</b> 个批次未触发、合计 ${fmt(F.untrigSum)}——大头是 P2026-001 回款③④⑤共 117.5 万，卡在考勤模块上线（客户IT评估未定）。`,
      list.map(f=>({label:f.item,view:'finance',id:f.id})).concat([{label:'未触发批次明细',view:'finance'}]));
  }
  if(has('集中度','大客户','客户占比','客户结构')){
    const cs=clientStats();
    const warn=cs.filter(k=>k.cShare>=0.3||k.balShare>=0.3||(k.over>0&&k.overShare>=0.4));
    return mk(`在手合同 ${fmt(cs.reduce((s,k)=>s+k.contract,0))}，分散在 ${cs.length} 个客户。<b class="hl">${warn.length}</b> 个客户触发集中度信号：`+
      warn.map(k=>`<br>· <b>${k.client}</b>：合同占比 ${(k.cShare*100).toFixed(0)}%，应收 ${fmt(k.bal)}${k.over>0?'，逾期 '+fmt(k.over)+'（占逾期 '+(k.overShare*100).toFixed(0)+'%）':''}`).join('')+
      `<br><br>建议：对高占比客户重谈账期；销售考核加「新客户占比」防止越干越集中。`,
      warn.map(k=>({label:k.client+' · 经营汇总',view:'finance',id:'sum'})));
  }
  if(has('应收逾期','逾期应收','欠款','谁欠钱','没回款','待回款')){
    const ops=finOps();
    if(!ops.recvOver.length)return mk('当前没有已到账期逾期的应收。',[]);
    return mk(`共 <b class="hl">${ops.recvOver.length}</b> 笔应收逾期，逾期金额合计 <b class="hl" style="color:var(--red)">${fmt(ops.recvOverSum)}</b>（占应收余额 ${ops.recvOverRate}%，&gt;20% 即预警）：`+
      ops.recvOver.map(r=>`<br>· <b>${r.client}</b>（${r.contract}）未收 ${fmt(r.amount-r.paid)}，到期 ${r.due}，已逾期 <b>${daysBetween(r.due,todayStr())}</b> 天 · ${r.owner} · ${r.status}`).join('')+
      `<br><br>催收动作：${ops.recvOver.map(r=>r.next).filter(n=>n&&n!=='—').join('；')}。`,
      ops.recvOver.map(r=>({label:r.client+' · '+r.invNo,view:'finance',id:r.id})));
  }
  if(has('支出','成本','花')){
    const outs=[...S.flowsOut].sort((a,b)=>b.amount-a.amount);
    const tot=outs.reduce((s,f)=>s+f.amount,0);const top=outs[0];
    return mk(`已发生付款合计 <b class="hl">${fmt(tot)}</b>，最大一项是「${top.vendor} · ${top.cat}」<b class="hl">${fmt(top.amount)}</b>（占 ${(top.amount/tot*100).toFixed(0)}%）。另有应付未付 <b class="hl">${fmt(finOps().payBal)}</b>，其中云启分包款 24.5 万已逾期需优先排付。`,
      outs.slice(0,3).map(f=>({label:f.vendor+' · '+f.note,view:'finance'})));
  }
  if(has('现金流','净额','赚')){
    const ops=finOps();
    return mk(`本期（2026-10）经营流入 <b class="hl">${fmt(ops.inflow)}</b> − 流出 ${fmt(ops.outflow)} = 净现金流 <b class="hl" style="color:${ops.net>=0?'var(--green)':'var(--red)'}">${ops.net>=0?'+':''}${fmt(ops.net)}</b>。可用资金 ${fmt(ops.avail)}（不含保证金专户），现金安全垫 <b class="hl">${ops.safety.toFixed(1)} 个月</b>（&lt;3 个月预警）。注意：应收余额还有 ${fmt(ops.recvBal)}，其中逾期 ${fmt(ops.recvOverSum)}。`,
      [{label:'财 · 进出一张表',view:'finance'},{label:'资金账户明细',view:'finance'}]);
  }
  if(has('应付','要付')){
    const ops=finOps();
    const open=[...ops.payOpen].sort((a,b)=>(a.due||'9999').localeCompare(b.due||'9999'));
    return mk(`当前应付余额合计 <b class="hl">${fmt(ops.payBal)}</b>，共 ${open.length} 笔：`+open.map(r=>`<br>· ${r.vendor} 未付 ${fmt(r.amount-r.paid)}，到期 ${r.due}${daysBetween(r.due,todayStr())>0?` <span class="tag red">已逾期 ${daysBetween(r.due,todayStr())} 天</span>`:''}（优先级 ${r.prio}，计划付款 ${r.plan||'待定'}）`).join(''),
      open.map(r=>({label:r.vendor,view:'finance',id:r.id})));
  }
  if(has('报价','定价','卖多少钱','收费')){ // 采集类问题示例
    bumpStat(q);
    return mk('定价尚未定版（这是决策点 D3 之前的悬而未决项）。会上的报价区间从 1000 讨论到 19800，建议按「基础包 + 增值包」两档先出报价单 v1，我在「一问一答采集」里列了待您拍板的字段。',[{label:'去拍板',view:'collect'}]);
  }
  // --- 事 ---
  if(has('延期风险','风险','要延期','有问题')){
    const risky=S.projects.map(p=>({p,lv:projRiskLevel(p)})).filter(x=>x.lv!=='低').sort((a,b)=>(b.lv==='高')-(a.lv==='高'));
    return mk(`目前有 <b class="hl">${risky.length}</b> 个项目存在风险：`+risky.map(x=>{
      const od=projOverdueMs(x.p);
      return `<br>· <b>${x.p.name}</b>（${x.p.client}）风险等级 <span class="tag ${x.lv==='高'?'red':'orange'}">${x.lv}</span>${od.length?`，逾期里程碑：${od.map(m=>m.n+'（逾期'+daysBetween(m.due,todayStr())+'天）').join('、')}`:''}。${x.p.riskNote}`;
    }).join(''), risky.map(x=>({label:x.p.name,view:'projects',id:x.p.id})));
  }
  if(has('下周','近期','里程碑','到期','deadline')){
    const soon=[];S.projects.forEach(p=>p.milestones.forEach(m=>{if(!m.done&&daysBetween(todayStr(),m.due)>=0&&daysBetween(todayStr(),m.due)<=14)soon.push({p,m});}));
    const od=[];S.projects.forEach(p=>p.milestones.forEach(m=>{if(!m.done&&daysBetween(m.due,todayStr())>0)od.push({p,m});}));
    return mk(`未来 14 天内到期里程碑 <b class="hl">${soon.length}</b> 个：`+soon.map(x=>`<br>· ${fmtD(x.m.due)} ${x.p.name}「${x.m.n}」`).join('')+
      (od.length?`<br><br>⚠️ 另有 ${od.length} 个已逾期：`+od.map(x=>`${x.p.name}「${x.m.n}」`).join('、')+'，详见提醒哨兵。':''),
      soon.map(x=>({label:x.p.name,view:'projects',id:x.p.id})));
  }
  if(has('回款进度','每个项目','各项目','项目健康')){
    return mk('各项目合同与回款：'+S.projects.map(p=>{
      const pct=Math.round(p.paid/p.contract*100);
      return `<br>· ${p.name}：合同 ${fmt(p.contract)}，已回 <b class="hl">${fmt(p.paid)}（${pct}%）</b>，未回 ${fmt(p.contract-p.paid)}`;
    }).join(''), S.projects.map(p=>({label:p.name,view:'projects',id:p.id})));
  }
  if(has('新签','签了几个','本月项目')){
    const ns=S.projects.filter(p=>p.sign&&p.sign>='2026-10-01');
    return mk(`10 月以来新签 <b class="hl">${ns.length}</b> 个项目：${ns.map(p=>`${p.name}（${fmt(p.contract)}）`).join('、')}。另有 1 个项目（品牌视觉设计）SOW 因版权条款停滞未签。`,
      ns.map(p=>({label:p.name,view:'projects',id:p.id})));
  }
  // --- 人 ---
  if(has('周报','没交周报')){
    const nw=S.people.filter(p=>p.on&&!p.weekly);
    return mk(nw.length?`本周有 <b class="hl">${nw.length}</b> 人未交周报：`+nw.map(p=>`<br>· <b>${p.name}</b>（${p.role}），近4周产出 ${p.trend.join('→')}，${p.note}`).join(''):'本周全员已交周报 👍',
      nw.map(p=>({label:p.name,view:'people',id:p.id})));
  }
  if(has('饱和度','负载','忙','超负荷')){
    const ov=S.people.filter(p=>p.on&&p.sat>100);
    return mk(`在岗 ${T.on} 人，平均饱和度 <b class="hl">${T.avgSat}%</b>。超负荷 ${ov.length} 人：`+ov.map(p=>`<br>· <b>${p.name}</b>（${p.role}）${p.sat}%，参与：${p.projects.map(projName).join('、')}，${p.note}`).join('')+
      `<br><br>负载较低可接新活：`+S.people.filter(p=>p.on&&p.sat<60).map(p=>`${p.name}（${p.sat}%）`).join('、'),
      ov.map(p=>({label:p.name,view:'people',id:p.id})));
  }
  if(has('状态怎么样','最近状态','状态如何','怎么样了')){
    const name=q.replace(/[？?]|最近状态|状态怎么样|状态如何|最近|怎么样了/g,'').trim();
    const p=S.people.find(x=>x.name.includes(name));
    if(!p)return mk('没有找到这位同事，请确认姓名（可试：张一鸣、王铁军、孙晓等）。',[]);
    const dir=p.trend[3]>=p.trend[0]?'上升':'下降';
    return mk(`<b>${p.name}</b>（${p.role}，${p.on?'在岗':'离职'}）：<br>· 饱和度 <b class="hl">${p.sat}%</b>，本周周报${p.weekly?'已交':'<b style="color:var(--red)">未交</b>'}；<br>· 近 4 周产出趋势 ${p.trend.join(' → ')}（整体${dir}）；<br>· 参与项目：${p.projects.map(projName).join('、')||'无'}；<br>· 综合判断：${p.note}<br><br>⚠️ 以上判断基于台账指标，供参考，建议结合 1:1 沟通确认。`,
      [{label:'人 · 状态视图',view:'people',id:p.id},{label:'周报留痕',view:'audit'}]);
  }
  if(has('在岗','多少人','团队')){
    return mk(`团队共 ${T.total} 人，在岗 <b class="hl">${T.on}</b> 人（吴迪 10/27 离职，孙晓请假未销假）。平均饱和度 ${T.avgSat}%；超负荷 ${T.overload} 人、低负载 ${T.idle} 人、本周未交周报 ${T.noWeekly} 人。`,
      [{label:'人 · 状态视图',view:'people'}]);
  }
  if(has('离职','人事变动')){
    return mk('近 30 天人事变动：吴迪（后端工程师）于 10/27 离职，其负责的 P3 小程序后端已交接给张一鸣（该交接已使张一鸣饱和度升至 115%）；孙晓自上周起请假未销假，产出连续 2 周为 0。',
      [{label:'吴迪',view:'people',id:'E9'},{label:'孙晓',view:'people',id:'E7'}]);
  }
  // --- 治理 ---
  if(has('需求','埋点','大家都在问','top','Top')){
    return mkStats();
  }
  if(has('留痕','日志','谁看了','审计')){
    return mk(`留痕日志共 <b class="hl">${S.audit.length}</b> 条。谁在什么时间问了什么、看了什么、系统做了什么，全部可回溯。最近 3 条：`+
      S.audit.slice(0,3).map(a=>`<br>· [${a.t}] ${a.who} ${a.act}：${a.detail}`).join(''),
      [{label:'留痕日志',view:'audit'}]);
  }
  if(has('提醒','哨兵')){
    const al=allAlerts();
    return mk(`提醒哨兵当前触发 <b class="hl">${al.length}</b> 条：里程碑逾期 ${al.filter(a=>a.type==='里程碑逾期').length} 条、应收逾期 ${al.filter(a=>a.type==='应收逾期').length} 条、周报缺失 ${al.filter(a=>a.type==='周报缺失').length} 条。按严重度排序，可在哨兵页逐条处理。`,
      [{label:'提醒哨兵',view:'sentinel'}]);
  }
  // 兜底：计为需求埋点
  bumpStat(q);
  return mk('这个问题超出了当前规则库（我目前能答：回款、应收逾期、支出、现金流、项目风险、里程碑、回款进度、人员状态、饱和度、周报、提醒、留痕、需求统计等）。<br>您的提问已自动记入「需求埋点」，每周会汇总 Top10 需求用于迭代——这正是本产品内置的需求收集机制。',
    [{label:'需求埋点',view:'insights'}]);
}
function bumpStat(q){ S.stats[q]=(S.stats[q]||0)+1; save(); }
function mkStats(){
  const arr=Object.entries(S.stats).sort((a,b)=>b[1]-a[1]).slice(0,10);
  return mk(arr.length?`按提问频次统计的老板高频问题 Top${arr.length}：`+arr.map(([q,c],i)=>`<br>${i+1}. ${q}（被问 ${c} 次）`).join('')+'<br><br>这些真实提问就是下一版功能的优先级依据。':'需求埋点暂无数据，去「老板问答」随便问点什么吧。',[{label:'需求埋点',view:'insights'}]);
}

/* ---------------- 一问一答采集：推导缺失字段 ---------------- */
function missingFields(){
  const miss=[];
  S.projects.forEach(p=>{
    if(!p.sign && !p.paid)miss.push({key:'sign_'+p.id,q:`「${p.name}」的合同/SOW 什么时候能签下来？`,hint:['本周内','下周一前','客户预算未批','暂缓'],apply:v=>{p.sign=todayStr();}});
    if(!p.start)miss.push({key:'start_'+p.id,q:`「${p.name}」预计什么时候启动？`,hint:['11月中旬','12月初','待定'],apply:v=>{p.start=todayStr();}});
  });
  S.people.filter(p=>p.on&&!p.weekly).forEach(p=>{
    miss.push({key:'weekly_'+p.id,q:`${p.name}本周周报一句话进展是什么？`,hint:['项目联调中','客户沟通','请假中'],apply:()=>{p.weekly=true;}});
  });
  S.projects.filter(p=>projRiskLevel(p)==='高').forEach(p=>{
    miss.push({key:'risk_'+p.id,q:`「${p.name}」当前最大的卡点是什么？需要您定个处理原则。`,hint:['我来出面沟通客户','降级为观察项','暂停投入'],apply:()=>{p.risk='中等';p.riskNote='老板已介入协调（'+todayStr()+'）';}});
  });
  miss.push({key:'price',q:'基础包定价您倾向哪个档位？（影响报价单 v1）',hint:['9800/年','19800/年','先内测免费'],apply:()=>{}});
  return miss.filter(m=>!S.qa[m.key]);
}

/* =====================================================================
   PRD 场景视图
===================================================================== */
/* ---- 场景一：微信 / 企微消息中心（F1-1 ~ F1-6） ---- */
const M_TABS=[['all','全部待处理'],['boss','必须老板回'],['ai','可助手代回'],['notice','仅需知会'],['sent','AI 已代发']];
function setMTab(t){ state.mTab=t; render(); }
function rMessages(){
  if(!ROLE_CONF[state.role].msgAll){
    return `<div class="card"><div class="bd"><div class="lock-view"><div class="big">🔒</div><div><b>消息流仅老板 / 管理层可见</b></div>
      <div style="font-size:12.5px;max-width:480px;line-height:1.7">PRD 3.2（L3 执行级）：员工仅可见自己被 @ 的任务与相关上下文，不开放老板的完整消息流——避免员工产生被监控感而抵触使用。您的任务请到「任务派活」查看。</div>
      <button class="btn primary" onclick="nav('tasks')">去我的任务 →</button></div></div></div>`;
  }
  const st=msgStats(), tab=state.mTab||'all';
  const tabs=`<div class="subnav-tabs">${M_TABS.map(([k,l])=>{
    const c=k==='all'?st.all:k==='boss'?st.boss:k==='ai'?st.ai:k==='notice'?st.notice:S.sent.length;
    return `<button class="${tab===k?'on':''}" onclick="setMTab('${k}')">${l} <b style="opacity:.7">${c}</b></button>`;
  }).join('')}</div>`;
  const kpis=`<div class="grid kpis" style="margin-bottom:14px">
    <div class="card kpi warn"><div class="lab">必须老板回</div><div class="val">${st.boss}</div><div class="sub">涉及决策 / 金额 / 关键联系人</div></div>
    <div class="card kpi"><div class="lab">可助手代回</div><div class="val">${st.ai}</div><div class="sub">生成建议 + 人工确认发送</div></div>
    <div class="card kpi"><div class="lab">仅需知会</div><div class="val">${st.notice}</div><div class="sub">不占用您的注意力</div></div>
    <div class="card kpi ${st.pending?'warn':''}"><div class="lab">风险拦截待确认</div><div class="val">${st.pending}</div><div class="sub">含金额 / 承诺 / 对外表态</div></div>
  </div>`;
  let body='';
  if(tab==='sent'){
    body=`<div class="card"><div class="hd"><h3>AI 代发记录（全部经老板确认后才发出）</h3><span class="tag gray" style="margin-left:auto">${S.sent.length} 条</span></div><div class="bd">
      ${S.sent.length?S.sent.map(d=>`<div class="msg-card"><div class="msg-hd"><div class="avatar">✉</div><div style="flex:1"><b>${d.to}</b><div class="msg-meta">发送于 ${d.sentAt} · 由老板确认后发出${d.risk.length?' · 通过风险校验：'+d.risk.join('、'):''}</div></div></div>
        <div class="msg-body">${d.text}</div></div>`).join(''):'<div class="empty">还没有 AI 代发记录。到「全部待处理」里挑一条，点「AI 起草回复」试试。</div>'}
    </div></div>`;
  }else{
    let list=S.messages.filter(m=>!S.msgDone[m.id]);
    if(tab!=='all')list=list.filter(m=>msgClassify(m)===tab);
    list=list.slice().sort((a,b)=>b.time.localeCompare(a.time));
    body=`<div class="card"><div class="hd"><h3>消息流 · 按重要性分三类（规则引擎识别，非 LLM 判断）</h3><div style="margin-left:auto">${tabs}</div></div><div class="bd">
      ${list.length?list.map(m=>{
        const cls=msgClassify(m), ext=msgExtract(m);
        const draft=S.drafts.find(d=>d.msgId===m.id&&d.status==='待确认');
        const tone=cls==='boss'?'red':cls==='ai'?'orange':'gray';
        return `<div class="msg-card" id="${m.id}">
          <div class="msg-hd"><div class="avatar">${m.from.slice(0,1)}</div>
            <div style="flex:1"><b>${m.from}</b> <span class="tag ${tone}">${msgClassLabel(cls)}</span>${m.vip?' <span class="tag purple">关键联系人</span>':''}
              <div class="msg-meta">${m.org} · ${m.src}${m.group?'「'+m.group+'」':''} · ${m.time.slice(11)}</div></div>
            <span style="font-size:11.5px;color:var(--muted)">${m.time.slice(5,10)}</span></div>
          <div class="msg-body">${m.body}</div>
          <div class="msg-extract">${ext.map(e=>`<span class="kchip">${e.k} <b>${e.v}</b></span>`).join('')}</div>
          ${draft?`<div class="draft-box"><div class="dt">🤖 AI 拟稿（发送前需您确认）</div><div class="dtext">${draft.text}</div>
            ${draft.risk.length?`<div class="riskbar">⚠ 风险拦截命中：${draft.risk.join('、')} —— 按 F1-6 必须老板确认后才可发出</div>`:'<div style="font-size:11.5px;color:var(--green);margin-top:6px">✓ 未命中风险拦截，仍建议确认后发送</div>'}
            <div class="msg-acts"><button class="btn primary sm" onclick="confirmSend('${draft.id}')">发送</button><button class="btn sm" onclick="genDraft('${m.id}')">换一版</button><button class="btn sm" onclick="dropDraft('${draft.id}')">取消</button></div></div>`:''}
          <div class="msg-acts">
            <button class="btn sm" onclick="genDraft('${m.id}')">🤖 ${draft?'重新起草':'AI 起草回复'}</button>
            <button class="btn sm" onclick="openDispatch({title:'回复并跟进：${m.from.replace(/'/g,'')}',from:'消息 · ${m.from.replace(/'/g,'')}',ctx:'${m.id}'})">→ 派活给责任人</button>
            <button class="btn sm" onclick="markMsgDone('${m.id}')">✓ 标记已处理</button>
            <span style="font-size:11.5px;color:var(--muted);margin-left:auto">${m.body.length>60?'已提取 '+ext.length+' 个关键点':''}</span>
          </div></div>`;
      }).join(''):'<div class="empty">这一类已清空 🎉</div>'}
    </div></div>`;
  }
  return kpis+body+`<div class="card" style="margin-top:14px"><div class="bd"><b style="font-size:13px">这里的边界（PRD 明确要求）</b><div class="risk-note">
    · <b>F1-1</b> 接入方式：账号授权读取，不做复杂直连；接入失败时降级为「手动转发给助手」<br>
    · <b>F1-2 / F1-3</b> 重要性识别与关键信息提取全部由规则引擎完成（关键词 + 联系人等级 + 抽取模板），可核对、可改判<br>
    · <b>F1-5 / F1-6</b> 首版不做全自动外发：AI 只生成建议，涉及金额、承诺、对外正式表态的一律<b>老板确认后</b>才发出，且全程留痕<br>
    · 自动回复出错代价是老板的社交信用，不是一次点击——所以宁可慢一步。</div></div></div>`;
}

/* ---- F4-2 / F4-3：任务派活与回执追踪 ---- */
const T_TABS=[['all','全部'],['pending','待回执'],['doing','进行中'],['overdue','超时'],['done','已完成']];
function setTTab(t){ state.tTab=t; render(); }
function rTasks(){
  const scope=taskScope();
  const st=taskStats(scope), tab=state.tTab||'all';
  const me=ROLE_CONF[state.role].taskAll;
  const tabs=`<div class="subnav-tabs">${T_TABS.map(([k,l])=>{
    const c=k==='all'?st.total:k==='pending'?st.pending:k==='doing'?st.doing:k==='overdue'?st.overdue:st.done;
    return `<button class="${tab===k?'on':''}" onclick="setTTab('${k}')">${l} <b style="opacity:.7">${c}</b></button>`;
  }).join('')}</div>`;
  let list=scope.slice().sort((a,b)=>a.due.localeCompare(b.due));
  if(tab==='pending')list=list.filter(t=>t.status==='待回执');
  else if(tab==='doing')list=list.filter(t=>t.status==='进行中');
  else if(tab==='overdue')list=list.filter(taskOverdue);
  else if(tab==='done')list=list.filter(t=>t.status==='已完成');
  const kpis=`<div class="grid kpis" style="margin-bottom:14px">
    <div class="card kpi"><div class="lab">派活总数</div><div class="val">${st.total}</div><div class="sub">覆盖 ${new Set(scope.map(t=>t.from.split(' · ')[0])).size} 类信号</div></div>
    <div class="card kpi ${st.closure>=60?'ok':'warn'}"><div class="lab">派活闭环率</div><div class="val">${st.closure}%</div><div class="sub">已回执 ${st.acked} / ${st.total} · PRD 30 天目标 ≥60%</div></div>
    <div class="card kpi ${st.overdue?'warn':''}"><div class="lab">超时未完成</div><div class="val">${st.overdue}</div><div class="sub">超时自动升级提醒至老板</div></div>
    <div class="card kpi"><div class="lab">待回执</div><div class="val">${st.pending}</div><div class="sub">超过 1 天未回执自动催办</div></div>
  </div>`;
  return kpis+`<div class="card"><div class="hd"><h3>任务台账 · 从指标异常一键 @ 责任人</h3><div style="margin-left:auto;display:flex;gap:8px;align-items:center">${tabs}${me?`<button class="btn primary sm" onclick="openDispatch({})">+ 派活</button>`:''}</div></div><div class="bd">
    ${me?'':`<div class="callout" style="margin-bottom:11px">员工视角（PRD 3.2 · L3 执行级）：只会看到派给「${STAFF_SELF}」的任务，其他人与其他业务线的任务不可见 —— 这也是员工不抵触使用的前提。</div>`}
    ${list.length?list.map(t=>{
      const od=taskOverdue(t);
      const stTag=t.status==='已完成'?'green':od?'red':t.status==='进行中'?'blue':'orange';
      return `<div class="alert-item" id="${t.id}">
        <div class="aico" style="background:${od?'var(--red-soft)':'var(--primary-soft)'};color:${od?'var(--red)':'var(--primary)'}">${t.status==='已完成'?'✓':od?'⏰':'📌'}</div>
        <div style="flex:1">
          <div class="t">${t.title} <span class="tag ${stTag}">${t.status==='已完成'?'已完成':od?'已超时 '+daysBetween(t.due,todayStr())+' 天':t.status}</span></div>
          <div class="d">责任人 <b>${t.assignee}</b> · 截止 ${t.due} · 来源：${t.from}${t.note?' · '+t.note:''}</div>
          <div class="meta" style="display:flex;gap:7px;flex-wrap:wrap;align-items:center">
            ${t.status!=='已完成'?`<button class="btn sm" onclick="remindTask('${t.id}')">催办${t.reminded?'（'+t.reminded+'）':''}</button>`:''}
            ${t.status==='待回执'?`<button class="btn sm primary" onclick="ackTask('${t.id}')">模拟回执</button>`:''}
            ${t.status==='进行中'?`<button class="btn sm" onclick="doneTask('${t.id}')">标记完成</button>`:''}
            ${t.ctx&&t.ctx.startsWith('P')?`<a style="color:var(--primary);cursor:pointer;font-size:12px" onclick="nav('projects','${t.ctx}')">查看关联项目 →</a>`:''}
            ${t.ctx&&t.ctx.startsWith('AR')?`<a style="color:var(--primary);cursor:pointer;font-size:12px" onclick="nav('finance','recv')">查看应收台账 →</a>`:''}
            ${t.ackAt?`<span style="font-size:11.5px;color:var(--muted)">回执于 ${t.ackAt}</span>`:''}
            ${t.done?`<span style="font-size:11.5px;color:var(--green)">完成于 ${t.done}</span>`:''}
          </div>
        </div></div>`;
    }).join(''):'<div class="empty">这个筛选下没有任务</div>'}
  </div></div>
  <div class="card" style="margin-top:14px"><div class="bd"><b style="font-size:13px">闭环规则</b><div class="risk-note">
    · <b>F4-2</b> 任一指标异常（逾期 / 超时 / 数据缺口）都能直接 @ 责任人，自动带入指标上下文，员工不用重新描述问题<br>
    · <b>F4-3</b> 员工必须回执；截止日次日未完成，自动升级为「超时」并进入今日三件事与哨兵，提醒到老板本人<br>
    · 留痕：派活、回执、催办、完成全部记录，可用于复盘"哪类事总是拖"。</div></div></div>`;
}

/* ---- 场景二：朋友圈与内容运营（F2-1 ~ F2-5） ---- */
const S_TABS=[['people','重点人员'],['like','待点赞'],['sum','内容摘要'],['copy','多平台文案']];
function setSTab(t){ state.sTab=t; render(); }
function rSocial(){
  const tab=state.sTab||'people';
  const tabs=`<div class="subnav-tabs">${S_TABS.map(([k,l])=>`<button class="${tab===k?'on':''}" onclick="setSTab('${k}')">${l}</button>`).join('')}</div>`;
  let body='';
  if(tab==='people'){
    const list=S.contacts.slice().sort((a,b)=>relationScore(b)-relationScore(a));
    body=`<div class="card"><div class="hd"><h3>重点人员识别（互动频次 × 商机关联度 × 最近互动衰减）</h3><div style="margin-left:auto">${tabs}</div></div><div class="bd" style="padding:0;overflow-x:auto">
      <table><thead><tr><th>联系人</th><th>关系评分</th><th>近 30 天互动</th><th>商机关联</th><th>标签</th><th>建议动作</th></tr></thead><tbody>
      ${list.map(c=>{const s=relationScore(c);
        return `<tr id="${c.id}"><td><b>${c.name}</b><br><span style="font-size:11.5px;color:var(--muted)">${c.org} · ${c.title}</span></td>
        <td><div style="display:flex;align-items:center;gap:7px"><span class="bar-wrap"><span class="bar-fill" style="width:${s}%;background:${s>=70?'var(--green)':s>=50?'var(--orange)':'var(--red)'};display:block"></span></span><b style="font-size:12.5px">${s}</b></div></td>
        <td>${c.freq} 次<div style="font-size:11px;color:var(--muted)">最近 ${c.lastGap===0?'今天':c.lastGap+' 天前'}</div></td>
        <td>${'★'.repeat(c.biz)}<span style="color:#d8dee9">${'★'.repeat(5-c.biz)}</span></td>
        <td>${c.tags.map(t=>`<span class="tag ${t.includes('客户')||t.includes('应收')?'blue':t.includes('诉讼')?'red':'gray'}" style="margin:1px">${t}</span>`).join('')}${c.black?' <span class="tag gray">已加黑名单</span>':''}</td>
        <td style="font-size:12px;color:var(--muted)">${c.black?'不参与点赞推荐':s>=70?'保持每周一次真实互动':s>=50?'找机会约一次线下':c.lastGap>10?'关系在冷却，尽快破冰':'维持现状'}</td></tr>`;}).join('')}
      </tbody></table></div></div>`;
  }else if(tab==='like'){
    const rec=recommendMoments();
    body=`<div class="card"><div class="hd"><h3>推荐待点赞 · 不做静默自动点赞</h3><div style="margin-left:auto;display:flex;gap:8px;align-items:center">${tabs}${rec.length?`<button class="btn primary sm" onclick="batchLike()">一键批量点赞（${Math.min(3,rec.length)}）</button>`:''}</div></div><div class="bd">
      ${rec.length?rec.map(m=>`<div class="msg-card" id="${m.id}"><div class="msg-hd"><div class="avatar">${m.who.slice(0,1)}</div>
        <div style="flex:1"><b>${m.who}</b> <span class="tag ${m.score>=70?'green':'orange'}">关系评分 ${m.score}</span> <span class="tag gray">${m.time}</span>
        <div class="msg-meta">${m.c?m.c.org+' · '+m.c.title:''}</div></div></div>
        <div class="msg-body">${m.text}</div>
        <div class="msg-acts"><button class="btn primary sm" onclick="likeMoment('${m.id}')">👍 点赞</button><button class="btn sm" onclick="skipMoment('${m.id}')">这次跳过</button>
        <span style="font-size:11.5px;color:var(--muted);margin-left:auto">推荐理由：${m.c&&m.c.biz>=4?'商机关联度高':'近期互动活跃'}</span></div></div>`).join(''):'<div class="empty">今天没有待点赞的重点人员动态 🎉</div>'}
      <div class="risk-note">为什么不做「自动点赞」：自动点赞属于代老板行使社交行为，机械感一旦被识破，反噬大于收益。<b>推荐列表 + 一键批量</b>是更稳的形态；黑名单与频次上限已在规则内（每人每天 ≤ 3 条）。</div>
    </div></div>`;
  }else if(tab==='sum'){
    const demo=S.news?S.news[0].text:'';
    body=`<div class="card"><div class="hd"><h3>长文 / 群聊记录 → 三点式摘要</h3><div style="margin-left:auto">${tabs}</div></div><div class="bd">
      <div class="form-row"><label>把长文、群聊记录或会议纪要粘进来（默认已放一段示例）</label>
        <textarea id="sumIn" style="min-height:130px">${(state.sumText||'本周项目例会：P2026-001 考勤模块接口评估客户安全组提出数据出境疑虑，需要我方出具数据流向说明，确定由王铁军在 11 月 7 日前提供；回款③的确认书客户要求与考勤上线确认书一并提交，赵倩负责跟进时间点。城建集团承诺本周先付 80 万，剩余月底结清，李工负责索取书面确认。星海医药法务认为不具备验收条件，需本周五前给出书面答复，张工负责。会议决定：11 月 10 日前完成 P2026-002~006 人天补录，刘蔚牵头，否则毛利指标不可信。').replace(/</g,'&lt;')}</textarea></div>
      <button class="btn primary" onclick="doSummarize()">生成三点摘要</button>
      ${state.sumRes?`<div class="draft-box" style="margin-top:13px;border-color:var(--line);background:#f8faff"><div class="dt" style="color:var(--primary)">📝 三点式摘要</div>
        ${state.sumRes.map(s=>`<div class="dtext" style="padding:3px 0">· ${s}</div>`).join('')}</div>`:''}
      <div class="risk-note">抽取规则：结论句（含"确定/决定/按"）→ 时间句（含"周/月/日/前/截止"）→ 待办句（含"需要/请/负责/安排"），再由 LLM 润色成人话。金额与时间保持原文，不改写、不推断。</div>
    </div></div>`;
  }else{
    const res=state.copyRes;
    body=`<div class="card"><div class="hd"><h3>一次编辑 · 分平台四版文案</h3><div style="margin-left:auto">${tabs}</div></div><div class="bd">
      <div class="form-row"><label>主题 / 核心信息</label><input id="copyIn" value="${(state.copyTopic||'我们帮中小企业把项目、人天、回款拉到一张表上，老板打开手机三十秒知道今天该催谁的钱').replace(/"/g,'&quot;')}"></div>
      <button class="btn primary" onclick="doCopy()">生成朋友圈 / 视频号 / 抖音 / 小红书</button>
      ${res?`<div class="grid two-col" style="margin-top:13px">${res.map(r=>`<div class="card" style="box-shadow:none"><div class="hd"><h3 style="font-size:13px">${r.p}</h3><span class="tag purple" style="margin-left:auto">${r.tone}</span></div><div class="bd"><div style="font-size:12.5px;line-height:1.75;white-space:pre-wrap">${r.text}</div></div></div>`).join('')}</div>`:''}
      <div class="risk-note">各平台风控不同，逐个接入是必然（PRD F2-4），不做"一个接口打通全平台"的假设。首版只生成草稿，发布动作仍由老板完成。</div>
    </div></div>`;
  }
  return body;
}
function likeMoment(id){
  S.liked.push(id);
  const m=S.moments.find(x=>x.id===id);
  log('社交运营','点赞：'+m.who+' 的朋友圈（'+m.time+'）');save();render();
}
function skipMoment(id){
  const i=S.moments.findIndex(x=>x.id===id);if(i>=0)S.moments[i].fresh=false;
  log('社交运营','跳过推荐：'+id);save();render();
}
function batchLike(){
  const rec=recommendMoments().slice(0,3);
  rec.forEach(m=>S.liked.push(m.id));
  log('社交运营','一键批量点赞 '+rec.length+' 条（'+rec.map(m=>m.who).join('、')+'）');
  save();render();
}
function doSummarize(){
  const el=document.getElementById('sumIn');if(!el)return;
  state.sumText=el.value;state.sumRes=summarizeText(el.value);
  log('内容摘要','生成三点式摘要（'+el.value.length+' 字）');render();
}
function doCopy(){
  const el=document.getElementById('copyIn');if(!el)return;
  state.copyTopic=el.value;state.copyRes=genCopy(el.value);
  log('多平台文案','生成四平台文案草稿');render();
}

/* ---- 场景三：大模型与智能体管理（F3-1 ~ F3-3） ---- */
const G_TABS=[['usage','员工用量'],['bill','Token 账单'],['agents','智能体管理']];
function setGTab(t){ state.gTab=t; render(); }
function rAIOps(){
  const tab=state.gTab||'usage', L=llmStats(), A=agentStats();
  const tabs=`<div class="subnav-tabs">${G_TABS.map(([k,l])=>`<button class="${tab===k?'on':''}" onclick="setGTab('${k}')">${l}</button>`).join('')}</div>`;
  const kpis=`<div class="grid kpis" style="margin-bottom:14px">
    <div class="card kpi"><div class="lab">本月 Token 用量</div><div class="val">${(L.used/1000000).toFixed(2)}M</div><div class="sub">配额 ${(L.quota/1000000).toFixed(1)}M · 使用率 ${(L.rate*100).toFixed(0)}%</div></div>
    <div class="card kpi ${L.over.length?'warn':''}"><div class="lab">超配额员工</div><div class="val">${L.over.length}</div><div class="sub">${L.over.map(u=>u.name).join('、')||'—'}</div></div>
    <div class="card kpi"><div class="lab">本月应收 Token 费用</div><div class="val">${fmt(Math.round(L.bill))}</div><div class="sub">按 ${TOKEN_PRICE} 元/千 token 计（演示定价）</div></div>
    <div class="card kpi"><div class="lab">在用智能体</div><div class="val">${A.on}/${A.total}</div><div class="sub">累计调用 ${A.calls.toLocaleString('en-US')} 次 · 平均评分 ${A.score.toFixed(1)}</div></div>
  </div>`;
  let body='';
  if(tab==='usage'){
    body=`<div class="card"><div class="hd"><h3>员工大模型使用与分发（F3-1）</h3><div style="margin-left:auto">${tabs}</div></div><div class="bd" style="padding:0;overflow-x:auto">
      <table><thead><tr><th>员工 / 部门</th><th>模型</th><th>月配额</th><th>已用</th><th>使用率</th><th>状态</th><th>动作</th></tr></thead><tbody>
      ${S.llmUsers.map(u=>{const r=u.used/u.quota, over=u.used>u.quota;
        return `<tr id="${u.id}"><td><b>${u.name}</b><br><span style="font-size:11.5px;color:var(--muted)">${u.dept}</span></td>
        <td><span class="tag ${u.model.includes('长')?'purple':'blue'}">${u.model}</span></td>
        <td class="money">${(u.quota/1000000).toFixed(1)}M</td><td class="money">${(u.used/1000000).toFixed(2)}M</td>
        <td><div style="display:flex;align-items:center;gap:7px"><span class="bar-wrap"><span class="bar-fill" style="width:${Math.min(100,r*100)}%;background:${over?'var(--red)':r>0.85?'var(--orange)':'var(--green)'};display:block"></span></span><b style="font-size:12px;color:${over?'var(--red)':'inherit'}">${(r*100).toFixed(0)}%</b></div></td>
        <td>${over?'<span class="tag red">已超额</span>':r>0.85?'<span class="tag orange">接近上限</span>':'<span class="tag green">正常</span>'}</td>
        <td>${over?`<button class="btn sm" onclick="topup('${u.id}')">追加配额</button>`:'<span style="font-size:12px;color:var(--muted)">—</span>'}</td></tr>`;}).join('')}
      </tbody></table></div></div>
      <div class="card" style="margin-top:14px"><div class="bd"><b style="font-size:13px">管理即计费入口</b><div class="risk-note">Token 售卖与「员工大模型管理」是同一件事的两面：先帮老板管住<b>谁能用、用了多少</b>（管理），再按部门或按人售出配额（计费）。所以 F3-3 不是附属功能，而是 PRD 2.5 中 P2 变现路径的<b>计费载体</b>。</div></div></div>`;
  }else if(tab==='bill'){
    const ds=Object.entries(L.dept).sort((a,b)=>b[1].used-a[1].used);
    const max=ds.length?ds[0][1].used:1;
    body=`<div class="card"><div class="hd"><h3>按部门出账单（F3-3）</h3><div style="margin-left:auto">${tabs}</div></div><div class="bd">
      ${ds.map(([d,v])=>`<div style="padding:11px 0;border-bottom:1px dashed #f0f3f8">
        <div style="display:flex;align-items:center;gap:10px"><b style="width:72px;font-size:13px">${d}</b>
          <div style="flex:1"><span class="bar-wrap" style="width:100%"><span class="bar-fill" style="width:${v.used/max*100}%;background:var(--primary);display:block"></span></span></div>
          <span class="money" style="font-size:12.5px">${(v.used/1000000).toFixed(2)}M</span>
          <b class="money" style="width:88px;text-align:right">${fmt(Math.round(v.used/1000*TOKEN_PRICE))}</b></div>
        <div style="font-size:11.5px;color:var(--muted);margin-top:4px;padding-left:82px">${v.people} 人 · 配额 ${(v.quota/1000000).toFixed(1)}M · 使用率 ${(v.used/v.quota*100).toFixed(0)}%</div></div>`).join('')}
      <div style="display:flex;justify-content:space-between;padding-top:12px"><b>合计</b><b class="money">${fmt(Math.round(L.bill))}</b></div>
      <div class="risk-note">定价说明（演示）：${TOKEN_PRICE} 元/千 token，按实际用量结算，包年可打折。护城河是渠道与信任，不是技术——一旦大模型厂商直接下沉，价差会迅速被抹平，所以要把「管理」做成客户离不开的入口。</div>
    </div></div>`;
  }else{
    body=`<div class="card"><div class="hd"><h3>智能体管理（F3-2）</h3><span class="tag gray" style="margin-left:auto">PRD 定为规划项，不占 30 天资源</span><div style="margin-left:10px">${tabs}</div></div><div class="bd">
      ${S.agents.map(a=>`<div class="alert-item" id="${a.id}">
        <div class="aico" style="background:${a.status==='启用'?'var(--green-soft)':'#eef1f6'};color:${a.status==='启用'?'var(--green)':'var(--muted)'}">🤖</div>
        <div style="flex:1"><div class="t">${a.name} <span class="tag ${a.status==='启用'?'green':'gray'}">${a.status}</span> <span class="tag purple">${a.grant}</span></div>
        <div class="d">${a.dept} · 累计调用 ${a.calls.toLocaleString('en-US')} 次 · 效果评分 ${a.score} ${a.note?'· '+a.note:''}</div>
        <div class="meta" style="display:flex;gap:7px"><button class="btn sm" onclick="toggleAgent('${a.id}')">${a.status==='启用'?'停用':'启用'}</button>
          <span style="font-size:11.5px;color:var(--muted)">权限绑定：${a.grant}（按 3.2 三级模型）</span></div></div></div>`).join('')}
      <div class="risk-note">分层结论（PRD 4.3）：第一层员工大模型使用与分发 = 第二版本；第二层智能体管理 = 规划项，不进 30 天范围；第三层数字员工 = 只做概念储备。<b>没有足够多的智能体在用，管理功能就无从谈起。</b></div>
    </div></div>`;
  }
  return kpis+body;
}
function topup(id){
  const u=S.llmUsers.find(x=>x.id===id);if(!u)return;
  u.quota=Math.ceil(u.used*1.3/100000)*100000;
  log('AI 管理','为「'+u.name+'」追加配额至 '+(u.quota/1000000).toFixed(1)+'M');save();render();
}
function toggleAgent(id){
  const a=S.agents.find(x=>x.id===id);if(!a)return;
  a.status=a.status==='启用'?'停用':'启用';
  log('AI 管理','智能体「'+a.name+'」'+a.status);save();render();
}

/* ---- 派活弹窗（F4-2：指标异常 → 直接 @ 责任人） ---- */
function ensureModal(){
  if(!document.getElementById('modalRoot')){
    const d=document.createElement('div');d.id='modalRoot';document.body.appendChild(d);
  }
  return document.getElementById('modalRoot');
}
function renderModal(){
  const root=ensureModal();
  const m=state.modal;
  if(!m){root.innerHTML='';return;}
  if(m.type!=='dispatch'){root.innerHTML='';return;}
  const pre=m.preset||{};
  const opts=S.people.filter(p=>p.on).map(p=>`<option value="${p.name}">${p.name}（${p.role}）</option>`).join('');
  root.innerHTML=`<div class="modal-mask" onclick="if(event.target===this)closeModal()"><div class="modal">
    <div class="mhd"><h3>派活 · 直接 @ 责任人</h3><div style="flex:1"></div><button class="btn sm" onclick="closeModal()">✕</button></div>
    <div class="mbd">
      ${pre.from?`<div class="callout" style="margin-bottom:12px">📍 指标上下文已自动带入：<b>${pre.from}</b><br>员工打开任务就能看到问题是什么，不需要重新描述一遍。</div>`:''}
      <div class="form-row"><label>任务标题</label><input id="dpTitle" value="${(pre.title||'').replace(/"/g,'&quot;')}" placeholder="例如：催回城建集团 168 万进度款"></div>
      <div class="form-row"><label>责任人</label><select id="dpWho">${opts}</select></div>
      <div class="form-row"><label>截止日期</label><input id="dpDue" type="date" value="${plusDays(todayStr(),3)}"></div>
      <div class="form-row"><label>备注（可选）</label><textarea id="dpNote" placeholder="补充要求、边界条件…"></textarea></div>
      <div class="callout">派发后进入「待回执」，员工必须回执；截止次日仍未完成会自动升级为超时并提醒到您。</div>
    </div>
    <div class="mft"><button class="btn" onclick="closeModal()">取消</button><button class="btn primary" onclick="submitDispatch()">确认派发</button></div>
  </div></div>`;
}
function closeModal(){ state.modal=null; renderModal(); }


const state={view:'dashboard',role:'boss',chat:[],collectIdx:0,modal:null,mTab:'all',tTab:'all',sTab:'people',gTab:'usage',imp:null,imported:null};
const VIEWS={
  dashboard:{t:'总览驾驶舱',render:rDashboard},
  messages:{t:'消息中心 · 微信/企微',render:rMessages},
  tasks:{t:'任务派活 · 回执追踪',render:rTasks},
  projects:{t:'事 · 项目台账',render:rProjects},
  people:{t:'人 · 状态视图',render:rPeople},
  finance:{t:'财 · 进出一张表',render:rFinance},
  pnl:{t:'损益一页纸 · 本月净利',render:rPnl},
  pipeline:{t:'商机漏斗 · 增量经营',render:rPipeline},
  report:{t:'老板周报 · 一键生成',render:rReport},
  sentinel:{t:'提醒哨兵',render:rSentinel},
  social:{t:'社交运营 · 朋友圈',render:rSocial},
  aiops:{t:'AI 与 Token 管理',render:rAIOps},
  ask:{t:'老板问答 · 20 问',render:rAsk},
  collect:{t:'一问一答采集',render:rCollect},
  insights:{t:'需求埋点 Top10',render:rInsights},
  audit:{t:'留痕日志',render:rAudit},
  import:{t:'数据导入 · Excel/CSV',render:rImport},
  settings:{t:'权限与数据',render:rSettings},
};
function render(){
  const host=document.getElementById('wbShell');
  if(!host){return;}                 // 外壳未挂载：等 mount()
  if(!can(state.view))state.view='dashboard';
  document.querySelectorAll('#wbShell .nav-item').forEach(el=>{
    el.classList.toggle('active',el.dataset.view===state.view);
    el.style.display=can(el.dataset.view)?'':'none';
  });
  const title=document.getElementById('pageTitle');
  if(title)title.textContent=VIEWS[state.view].t;
  const root=document.getElementById('viewRoot');
  root.innerHTML=VIEWS[state.view].render();
  renderModal();
  const n=allAlerts().length+msgStats().pending;
  ['navAlertBadge','navAlertBadge2'].forEach(id=>{const b=document.getElementById(id);if(!b)return;b.textContent=n||'';b.style.display=n?'':'none';});
  document.querySelectorAll('#roleSwitch button').forEach(x=>x.classList.toggle('on',x.dataset.role===state.role));
  renderSaveBadge();
  if(state._scrollTo)requestAnimationFrame(()=>{const el=document.getElementById(state._scrollTo);if(el){el.classList.add('jump-flash');el.scrollIntoView({behavior:'smooth',block:'center'});state._scrollTo=null;}});
}
function nav(view,id){ if(!can(view)){alert('当前身份无权限访问该模块（权限 v0 已拦截，本次访问已留痕）');log('权限拦截','尝试访问 '+VIEWS[view].t);return;}
  if(view==='finance'&&id&&F_TABS.some(t=>t[0]===id))state.fTab=id;   // 跳转目标若是页签，直接切到该页签
  if(view==='people'&&id&&P_TABS.some(t=>t[0]===id))state.pTab=id;
  log('页面访问','进入「'+VIEWS[view].t+'」'+(id?'并定位记录 '+id:''));state.view=view;state._scrollTo=id;render(); }
/* =====================================================================
   P0-2：趋势小图（sparkline）。CEO 判断"变好还是变坏"靠斜率，不靠单点
===================================================================== */
function fmtShort(n){ const a=Math.abs(n); return a>=100000000?'¥'+(n/100000000).toFixed(2)+'亿':a>=10000?'¥'+(n/10000).toFixed(1).replace(/\.0$/,'')+'万':'¥'+Math.round(n).toLocaleString('zh-CN'); }
function sparkline(vals,opts){
  opts=opts||{};
  if(!vals||vals.length<2)return '';
  const W=150,H=36,P=3;
  const ys=vals.map(v=>v.y);
  let min=Math.min.apply(null,ys),max=Math.max.apply(null,ys);
  if(opts.zero)min=Math.min(0,min);
  if(max===min)max=min+1;
  const px=i=>P+(i/(vals.length-1))*(W-2*P);
  const py=v=>H-P-((v-min)/(max-min))*(H-2*P);
  const ptsStr=vals.map((v,i)=>px(i).toFixed(1)+','+py(v.y).toFixed(1)).join(' ');
  const first=vals[0],last=vals[vals.length-1];
  const up=last.y>=first.y;
  const good=opts.goodUp!==false;
  const color=opts.color||((up===good)?'var(--green)':'var(--red)');
  const cf=opts.capF||fmtShort;
  return `<div class="spark"><svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
    <polygon points="${P},${H-P} ${ptsStr} ${W-P},${H-P}" fill="${color}" opacity=".08"/>
    <polyline points="${ptsStr}" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
    <circle cx="${px(vals.length-1).toFixed(1)}" cy="${py(last.y).toFixed(1)}" r="2.8" fill="${color}"/>
  </svg><div class="spark-cap"><span>${first.x}</span><span>${cf(first.y)} → ${cf(last.y)}</span><span>${last.x}</span></div></div>`;
}
function sparkbar(vals){
  if(!vals||!vals.length)return '';
  const W=150,H=36,P=2,max=Math.max.apply(null,vals.map(v=>v.y).concat(1));
  const bw=(W-2*P)/vals.length;
  return `<div class="spark"><svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
    ${vals.map((v,i)=>{const h=Math.max(2,(v.y/max)*(H-2*P));return `<rect x="${(P+i*bw+1).toFixed(1)}" y="${(H-P-h).toFixed(1)}" width="${Math.max(1,bw-2).toFixed(1)}" height="${h.toFixed(1)}" rx="1.5" fill="${v.y>0?'var(--green)':'#dfe5ef'}"/>`;}).join('')}
  </svg><div class="spark-cap"><span>${vals[0].x}</span><span>周回款峰值 ${fmtShort(max)}</span><span>${vals[vals.length-1].x}</span></div></div>`;
}
/* 近 10 周可用资金余额：以当前 avail 为锚点按周净流水倒推（纯派生，不新增数据） */
function cashTrend(){
  const Wn=10,weeks=[];
  for(let i=Wn-1;i>=0;i--)weeks.push({end:plusDays(todayStr(),-i*7),in:0,out:0});
  const idx=d=>{const diff=daysBetween(d,todayStr());if(diff<0||diff>=Wn*7)return -1;return Wn-1-Math.floor(diff/7);};
  S.flowsIn.forEach(f=>{const i=idx(f.date);if(i>=0)weeks[i].in+=f.amount;});
  S.flowsOut.forEach(f=>{const i=idx(f.date);if(i>=0)weeks[i].out+=f.amount;});
  let bal=finOps().avail;
  for(let i=weeks.length-1;i>=0;i--){weeks[i].bal=bal;bal-=weeks[i].in-weeks[i].out;}
  return weeks.map(w=>({x:w.end.slice(5).replace('-','/'),y:w.bal}));
}
/* 近 10 周回款（周流入合计） */
function recvTrend(){
  const Wn=10,weeks=[];
  for(let i=Wn-1;i>=0;i--)weeks.push({end:plusDays(todayStr(),-i*7),in:0});
  const idx=d=>{const diff=daysBetween(d,todayStr());if(diff<0||diff>=Wn*7)return -1;return Wn-1-Math.floor(diff/7);};
  S.flowsIn.forEach(f=>{const i=idx(f.date);if(i>=0)weeks[i].in+=f.amount;});
  return weeks.map(w=>({x:w.end.slice(5).replace('-','/'),y:w.in}));
}
/* 月度毛利率与人均毛利（数据源：06 项目成本表；07/08 月为演示补齐历史） */
function gmTrend(){
  const m={};
  S.costs.forEach(c=>{const o=m[c.month]=m[c.month]||{rev:0,gm:0};o.rev+=c.revenue;o.gm+=c.revenue-(c.labor+c.outs+c.travel);});
  const ks=Object.keys(m).sort();
  const onCnt=S.people.filter(p=>p.on).length||1;
  return {
    rate:ks.map(k=>({x:k.slice(5)+'月',y:m[k].rev?(m[k].gm/m[k].rev*100):0})),
    perGm:ks.map(k=>({x:k.slice(5)+'月',y:Math.round(m[k].gm/onCnt)}))
  };
}
/* 应收逾期金额周快照（SEED.arTrend，最后一点 = 当前 recvOverSum） */
function arTrendPts(){ return (S.arTrend||[]).map(t=>({x:t.d.slice(5).replace('-','/'),y:t.over})); }

/* =====================================================================
   v1.2.1 可见性增强：让 P0 三项改造在首屏「一眼可见」
   1) 版本更新横幅（可关闭 / 可重开）  2) 放大版经营趋势图（2×2 带结论）
===================================================================== */
let _chartSeq=0;
function trendBox(title,icon,vals,opts){
  opts=opts||{};
  if(!vals||vals.length<2)return '';
  const W=320,H=92,L=8,R=12,T=10,B=10;
  const ys=vals.map(v=>v.y);
  let min=Math.min.apply(null,ys),max=Math.max.apply(null,ys);
  if(opts.zero)min=Math.min(0,min);
  const pad=(max-min)*0.12||1; min-=pad; max+=pad;
  const px=i=>L+(i/(vals.length-1))*(W-L-R);
  const py=v=>T+(1-(v-min)/(max-min))*(H-T-B);
  const first=vals[0],last=vals[vals.length-1],diff=last.y-first.y;
  const up=diff>=0, good=opts.goodUp!==false, isGood=(up===good);
  const col=opts.color||(isGood?'var(--green)':'var(--red)');
  const cf=opts.capF||fmtShort;
  const id='tg'+(_chartSeq++);
  const pts=vals.map((v,i)=>px(i).toFixed(1)+','+py(v.y).toFixed(1)).join(' ');
  const grid=[0.25,0.5,0.75].map(r=>{const y=T+r*(H-T-B);return `<line x1="${L}" y1="${y.toFixed(1)}" x2="${W-R}" y2="${y.toFixed(1)}" stroke="#e9edf5" stroke-width="1" stroke-dasharray="3 4"/>`;}).join('');
  const lastX=px(vals.length-1),lastY=py(last.y);
  const labelX=Math.min(W-R-2,Math.max(L+30,lastX-2));
  const sign=diff>=0?'+':'−';
  const deltaTxt=opts.deltaF?opts.deltaF(diff):`${sign}${cf(Math.abs(diff))}`;
  const cls=Math.abs(diff)<(Math.abs(first.y)*0.005||0.001)?'flat':isGood?'good':'bad';
  const arrow=diff>=0?'↑':'↓';
  const dirWord=up?'增加':'减少';
  const verb=opts.goodWord||(isGood?'在变好':'在恶化');
  const note=opts.note||`${vals.length} 个数据点：${cf(first.y)} → ${cf(last.y)}，${dirWord} <b>${cf(Math.abs(diff))}</b>，趋势<b style="color:${col}">${verb}</b>。`;
  return `<div class="trend-box">
    <div class="trend-hd"><span>${icon}</span><span>${title}</span><span class="trend-delta ${cls}">${deltaTxt} ${arrow}</span></div>
    <div class="trend-chart"><svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
      <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${col}" stop-opacity=".26"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></linearGradient></defs>
      ${grid}
      <polygon points="${L},${H-B} ${pts} ${lastX.toFixed(1)},${H-B}" fill="url(#${id})"/>
      <polyline points="${pts}" fill="none" stroke="${col}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/>
      <circle cx="${lastX.toFixed(1)}" cy="${lastY.toFixed(1)}" r="4" fill="#fff" stroke="${col}" stroke-width="2.4" vector-effect="non-scaling-stroke"/>
      <text x="${labelX.toFixed(1)}" y="${Math.max(T+9,lastY-8).toFixed(1)}" text-anchor="end" font-size="10" font-weight="700" fill="${col}">${cf(last.y)}</text>
    </svg><div class="trend-cap"><span>${first.x}</span><span>${opts.mid||'区间变化 '+deltaTxt}</span><span>${last.x}</span></div></div>
    <div class="trend-note">${note}</div>
  </div>`;
}
function trendSection(){
  const cash=cashTrend(),gm=gmTrend(),ar=arTrendPts(),recv=recvTrend();
  const pct=(a,b)=>b?((a/b)*100).toFixed(0)+'%':'—';
  const cashDiff=cash.length?cash[cash.length-1].y-cash[0].y:0;
  const arDiff=ar.length?ar[ar.length-1].y-ar[0].y:0;
  const gmDiff=gm.rate.length?gm.rate[gm.rate.length-1].y-gm.rate[0].y:0;
  return `<div class="card" id="trendSec" style="margin-bottom:14px;border-left:3px solid var(--primary)">
    <div class="hd"><h3>📈 经营趋势 · 不看单点，看斜率</h3><span class="tag blue" style="margin-left:8px">v1.2 新增</span>
      <div style="flex:1"></div><span style="font-size:11.5px;color:var(--muted)">现金 / 应收按周 · 毛利 / 人效按月 · 数据源见「财 · 项目成本」</span></div>
    <div class="bd"><div class="trend-grid">
      ${trendBox('可用资金 · 近10周','💵',cash,{goodUp:true,capF:fmtShort,note:cashDiff>=0?`资金面<b style="color:var(--green)">在变好</b>：10 周累计净流入 <b>${fmtShort(cashDiff)}</b>，但安全垫仍要按 30 天刚性支出单独看。`:`资金面<b style="color:var(--red)">在收紧</b>：10 周净流出 <b>${fmtShort(-cashDiff)}</b>，建议推迟非刚性付款。`})}
      ${trendBox('应收逾期 · 近8周','💸',ar,{goodUp:false,capF:fmtShort,note:arDiff>0?`逾期敞口 8 周内<b style="color:var(--red)">多了 ${fmtShort(arDiff)}</b>，是四张图里唯一持续恶化的——建议本周对城建、星海两家单独催收。`:`逾期敞口 8 周内<b style="color:var(--green)">减少 ${fmtShort(-arDiff)}</b>，催收见效。`})}
      ${trendBox('毛利率 · 近4月','📉',gm.rate,{goodUp:true,capF:v=>v.toFixed(1)+'%',deltaF:d=>(d>=0?'+':'−')+Math.abs(d).toFixed(1)+'pt',mid:'红线 25%',note:`毛利率${gmDiff>=0?'回升':'下滑'} <b>${Math.abs(gmDiff).toFixed(1)}pt</b>，当前 <b>${gm.rate.length?gm.rate[gm.rate.length-1].y.toFixed(1):'—'}%</b>${gm.rate.length&&gm.rate[gm.rate.length-1].y<25?'，<b style="color:var(--red)">已跌破 25% 红线</b>':'，仍在 25% 红线之上'}。`})}
      ${trendBox('人均毛利 · 近4月','👤',gm.perGm,{goodUp:true,capF:fmtShort,note:'人效与毛利同步看：若毛利率降而人均毛利升，通常是人力投入结构变化，而非单价问题。'})}
    </div>
    <div class="risk-note">📊 <b>周回款节奏</b>：${recv.map(v=>v.y>0?fmtShort(v.y):'—').join(' · ')}（近 10 周）。口径说明：现金曲线由当前可用资金按周流水倒推，为派生值；07/08 月毛利为演示补齐历史，导入真实成本表后自动替换。</div>
    </div></div>`;
}
const WN_VER='v1.3';
function dismissWhatsNew(){ S.whatsNewHidden=true; S.wnVersion=WN_VER; save(); render(); }
function showWhatsNew(){ S.whatsNewHidden=false; S.wnVersion=''; save(); nav('dashboard'); }
function whatsNew(){
  if(S.wnVersion===WN_VER)return '';
  const p=pnlOps(),pi=pipelineOps(),t=talentOps();
  return `<div class="wn">
    <div class="wn-head"><span class="wn-badge">${WN_VER} 更新</span><span class="wn-title">P1 四件已上线，点一下直接看结论</span>
      <span class="wn-sub">· 从「盯」做到「赚」：利润结论 / 年度目标 / 商机增量 / 关键人才</span>
      <button class="wn-x" onclick="dismissWhatsNew()">知道了 ✕</button></div>
    <div class="wn-grid">
      <button class="wn-item" onclick="nav('pnl')">
        <span class="wn-ico">🧾</span><span><span class="wn-t">1 · 损益一页纸 → 本月净利 <b style="color:${p.cur.net>=0?'var(--green)':'var(--red)'}">${fmtSigned(p.cur.net)}</b></span><span class="wn-d">收入−成本−费用 = 净利，净利率 ${(p.cur.netRate*100).toFixed(1)}%${p.turning?'（由正转负）':''}；年度目标完成 ${(p.rate*100).toFixed(0)}%，缺口 ${fmtShort(p.gap)}</span></span></button>
      <button class="wn-item" onclick="nav('pipeline')">
        <span class="wn-ico">🔻</span><span><span class="wn-t">2 · 商机漏斗 → 下月预计签 ${fmtShort(pi.nextAmt)}</span><span class="wn-d">六阶段在谈 ${pi.open.length} 个 / 加权 ${fmtShort(pi.weighted)}，赢单率 ${(pi.winRate*100).toFixed(0)}%，停滞 ${pi.stalled.length} 个</span></span></button>
      <button class="wn-item" onclick="nav('report')">
        <span class="wn-ico">📄</span><span><span class="wn-t">3 · 老板周报 → 一键生成可转发</span><span class="wn-d">六段一页纸（四数/损益/商机/三件事/风险/数据说明），可复制文本、导出 HTML、打印存 PDF</span></span></button>
      <button class="wn-item" onclick="nav('people','talent')">
        <span class="wn-ico">🔴</span><span><span class="wn-t">4 · 关键人才 AB 角 → ${t.noB.length} 个岗位无 B 角</span><span class="wn-d">覆盖率 ${(t.cover*100).toFixed(0)}%，高危 ${t.high.length} 个；可指定接班人、派活交接、生成招聘需求单</span></span></button>
    </div></div>`;
}

/* ===== P1-1 损益一页纸：CEO 月底只问一句「这个月到底赚了多少」 ===== */
function rPnl(){
  const p=pnlOps(),dt=dataTrust(),ops=finOpsX(),c=p.cur;
  const pct=n=>(n*100).toFixed(1)+'%';
  const col=v=>v>=0?'var(--green)':'var(--red)';
  const kpis=`<div class="grid kpis" style="margin-bottom:14px">
    <div class="card kpi"><div class="lab">确认收入（${c.month}）</div><div class="val">${fmt(c.rev)}</div><div class="sub">06 项目成本表 · 收入归集</div></div>
    <div class="card kpi"><div class="lab">直接成本</div><div class="val">${fmt(c.cost)}</div><div class="sub">项目人力 + 外包 + 差旅</div></div>
    <div class="card kpi"><div class="lab">毛利 / 毛利率</div><div class="val" style="color:${col(c.gm)}">${fmt(c.gm)}</div><div class="sub">毛利率 <b>${pct(c.gmRate)}</b>（红线 25%）</div></div>
    <div class="card kpi" style="border-left:3px solid ${col(c.net)}"><div class="lab">净利 / 净利率 · 本月到底赚了多少</div><div class="val" style="color:${col(c.net)}">${c.net>=0?'':'-'}${fmt(Math.abs(c.net))}</div><div class="sub">净利率 <b style="color:${col(c.net)}">${pct(c.netRate)}</b>${p.turning?' · <b style="color:var(--red)">由正转负</b>':''}</div></div>
  </div>`;
  const lines=[
    ['确认收入',c.rev,'var(--green)','06 表本期 revenue 合计'],
    ['− 直接成本',-c.cost,'var(--orange)','06 表 labor + outs + travel'],
    ['＝ 毛利',c.gm,col(c.gm),'毛利率 '+pct(c.gmRate)],
    ['− 期间费用',-c.opex,'var(--orange)',c.opexDetail],
    ['＝ 净利',c.net,col(c.net),'净利率 '+pct(c.netRate)]
  ];
  const paper=`<div class="card"><div class="hd"><h3>🧾 ${c.month} 损益一页纸</h3><span class="tag blue" style="margin-left:8px">收入 − 成本 − 费用 = 净利</span>
    <div style="flex:1"></div><button class="btn sm" onclick="setGoal()">✎ 调整年度目标</button></div><div class="bd">
    ${lines.map(([k,v,cc,note],i)=>`<div class="pnl-line" style="${i===4?'border-top:2px solid var(--line);font-weight:700;font-size:15px':i===2?'background:#f8faff':''}">
      <span>${k}</span><span class="money" style="color:${cc};font-weight:700">${v>=0?'':'−'}${fmt(Math.abs(v))}</span>
      <span style="font-size:11.5px;color:var(--muted)">${note}</span></div>`).join('')}
    <div class="risk-note" style="margin-top:12px"><b>口径（避免重复计算）</b>：06 表 labor / outs 已归集项目人力与外包成本，因此 07 费用预算表中的「人员薪酬」「外包服务费」<b>不再计入期间费用</b>；期间费用只取差旅 / 软件工具 / 业务招待 / 房租物业。${c.estimated?'本月费用为演示补齐值，':'本月费用由 07 表实时计算，'}导入真实费用表后自动替换。<br>
    ⚠ 数据可信度仅 ${Math.round(dt.overall*100)}%（${dt.level}）：06 表当前只覆盖 ${new Set(S.costs.filter(x=>x.month===c.month).map(x=>x.contract)).size} 个合同，净利结论<b>只看趋势、不作为对外口径</b>。</div>
    </div></div>`;
  const goal=`<div class="card" style="margin-top:14px"><div class="hd"><h3>🎯 年度目标进度 · ${p.target&&S.goal?S.goal.label:'新签合同额'}</h3><span class="tag ${p.rate>=0.8?'green':p.rate>=0.6?'blue':'orange'}" style="margin-left:8px">完成 ${(p.rate*100).toFixed(0)}%</span></div><div class="bd">
    ${finBar('已签',p.signed,p.target,'var(--primary)')}<div style="height:8px"></div>${finBar('缺口',p.gap,p.target,'var(--red)')}
    <div class="grid kpis" style="margin-top:14px">
      <div class="card kpi"><div class="lab">年度目标</div><div class="val">${fmt(p.target)}</div><div class="sub">${S.goal&&S.goal.year||2026} 年 · 可调整</div></div>
      <div class="card kpi"><div class="lab">在手合同额</div><div class="val">${fmt(p.signed)}</div><div class="sub">${S.projects.length} 个项目台账合计</div></div>
      <div class="card kpi"><div class="lab">还差</div><div class="val" style="color:var(--red)">${fmt(p.gap)}</div><div class="sub">剩 ${p.remainMonths} 个月 · 月均需签 ${fmt(Math.round(p.monthlyNeed))}</div></div>
      <div class="card kpi"><div class="lab">按均单测算还需</div><div class="val">${p.needDeals} 单</div><div class="sub">当前均单 ${fmt(Math.round(p.avg))}</div></div>
    </div>
    <div class="risk-note">下个月预计签约 <b>${fmt(pipelineOps().nextAmt)}</b>（来自商机漏斗加权）。<button class="btn sm" style="margin-left:8px" onclick="nav('pipeline')">去看商机漏斗 →</button></div>
    </div></div>`;
  const trend=`<div class="card" style="margin-top:14px"><div class="hd"><h3>📉 净利率趋势（近 ${p.months.length} 个月）</h3><span class="tag blue" style="margin-left:8px">CEO 看斜率</span></div><div class="bd">
    <div class="trend-grid">${trendBox('净利率 · 月度','💰',p.months.map(m=>({x:m.month.slice(5)+'月',y:m.netRate*100})),{goodUp:true,capF:v=>v.toFixed(1)+'%',deltaF:d=>(d>=0?'+':'−')+Math.abs(d).toFixed(1)+'pt',mid:'盈亏线 0%',zero:true,note:p.turning?`<b style="color:var(--red)">净利由正转负</b>：${p.months.map(m=>m.month.slice(5)+'月 '+pct(m.netRate)).join(' → ')}。连续 ${p.drops} 个月下滑，优先级高于新签单。`:`净利率走势 ${p.months.map(m=>m.month.slice(5)+'月 '+pct(m.netRate)).join(' → ')}。`})}
    ${trendBox('毛利率 · 月度','📈',p.months.map(m=>({x:m.month.slice(5)+'月',y:m.gmRate*100})),{goodUp:true,capF:v=>v.toFixed(1)+'%',deltaF:d=>(d>=0?'+':'−')+Math.abs(d).toFixed(1)+'pt',mid:'红线 25%',note:'毛利率与净利率剪刀差扩大，说明压缩利润的主要是期间费用而非项目交付成本。'})}</div>
    <div class="risk-note">明细：${p.months.map(m=>`${m.month.slice(5)}月 收入 ${fmtShort(m.rev)} / 费用 ${fmtShort(m.opex)} / 净利 <b style="color:${col(m.net)}">${fmtShort(m.net)}</b>${m.estimated?'（演示估算）':''}`).join(' ｜ ')}</div>
    </div></div>`;
  return kpis+paper+goal+trend;
}
/* ===== P1-2 商机漏斗：补上「下个季度的钱从哪来」 ===== */
function rPipeline(){
  const p=pipelineOps(),pn=pnlOps();
  const pct=n=>(n*100).toFixed(0)+'%';
  const kpis=`<div class="grid kpis" style="margin-bottom:14px">
    <div class="card kpi"><div class="lab">在谈商机</div><div class="val">${p.open.length} 个</div><div class="sub">合计 ${fmt(p.amt)}</div></div>
    <div class="card kpi"><div class="lab">加权预计签约额</div><div class="val">${fmt(p.weighted)}</div><div class="sub">Σ 金额 × 阶段赢率</div></div>
    <div class="card kpi"><div class="lab">历史赢单率</div><div class="val">${pct(p.winRate)}</div><div class="sub">签 ${p.won} / 流失 ${p.lost}</div></div>
    <div class="card kpi" style="border-left:3px solid var(--primary)"><div class="lab">下月（${p.nm}）预计签约</div><div class="val" style="color:var(--primary)">${fmt(p.nextAmt)}</div><div class="sub">${p.nextDeals.length} 个商机加权</div></div>
  </div>`;
  const funnel=`<div class="card"><div class="hd"><h3>🔻 六阶段漏斗（在谈商机）</h3><span class="tag blue" style="margin-left:8px">线索 → 签约</span>
    <div style="flex:1"></div><span style="font-size:11.5px;color:var(--muted)">条宽 = 该阶段金额占比</span></div><div class="bd">
    ${p.byStage.map(s=>`<div class="funnel-row">
      <span class="fn-lab">${s.stage}</span>
      <span class="fn-bar"><span style="width:${p.amt?Math.max(3,s.amt/p.amt*100):0}%;background:${s.stage==='商务谈判'?'var(--primary)':'#93b0f7'};display:block;height:100%;border-radius:6px"></span></span>
      <span class="fn-num">${s.cnt} 个</span><span class="fn-amt money">${fmt(s.amt)}</span>
      <span class="fn-w" style="color:var(--muted)">加权 ${fmtShort(s.weighted)}</span></div>`).join('')}
    <div class="risk-note">年度目标缺口 <b>${fmt(pn.gap)}</b>，当前加权管线 <b>${fmt(p.weighted)}</b>，${p.weighted>=pn.gap?'<b style="color:var(--green)">按现有管线可覆盖缺口</b>':'<b style="color:var(--red)">管线不足以覆盖缺口</b>，还差 '+fmtShort(pn.gap-p.weighted)+'，需要新增大单或提高赢率'}。</div>
    </div></div>`;
  const stalled=`<div class="card" style="margin-top:14px;border-left:3px solid var(--red)"><div class="hd"><h3>⏰ 停滞商机（超过 14 天无进展）</h3><span class="tag red" style="margin-left:8px">${p.stalled.length} 个</span></div><div class="bd">
    ${p.stalled.length?p.stalled.map(o=>`<div class="alert-item"><div class="aico" style="background:var(--red-soft);color:var(--red)">⏰</div>
      <div style="flex:1"><div class="t">${o.client} · ${o.name}（${o.stage} · ${fmt(o.amount)}）</div>
      <div class="d">最近跟进 ${o.last}，已 ${daysBetween(o.last,todayStr())} 天。${o.next}</div>
      <div class="meta"><button class="btn sm primary" onclick='openDispatch(${JSON.stringify({title:'重启跟进：'+o.client+' '+o.name,from:'商机停滞 · '+o.stage,ctx:o.id})})'>@ 派活跟进</button></div></div></div>`).join(''):'<div class="empty">在谈商机都在正常跟进 👍</div>'}
    </div></div>`;
  const table=`<div class="card" style="margin-top:14px"><div class="hd"><h3>📇 商机明细（可推进 / 回退阶段，动作留痕）</h3><span class="tag gray" style="margin-left:8px">${p.all.length} 条</span></div><div class="bd" style="padding:0;overflow-x:auto"><table><thead><tr>
    ${['客户 / 商机','阶段','金额','赢率','预计签约','负责人','最近进展 / 下一步','动作'].map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>
    ${p.all.map(o=>{const dead=o.stage==='已流失',won=o.stage==='已签约';
      return `<tr id="${o.id}"><td><b>${o.client}</b><br><span style="font-size:11.5px;color:var(--muted)">${o.name}</span></td>
      <td><span class="tag ${won?'green':dead?'gray':o.stage==='商务谈判'?'blue':'orange'}">${o.stage}</span></td>
      <td class="money"><b>${fmt(o.amount)}</b></td><td>${pct(o.prob||0)}</td>
      <td class="money" style="font-size:12px">${o.expect||'—'}</td><td>${o.owner}</td>
      <td style="font-size:11.5px;max-width:230px;color:${o.next&&o.next.startsWith('⚠')?'var(--red)':'var(--muted)'}">${o.last||'—'} · ${o.next||'—'}</td>
      <td style="white-space:nowrap">${won||dead?'<span style="color:var(--muted);font-size:11px">已归档</span>':`<button class="btn sm" onclick="pipeMove('${o.id}',1)">推进 →</button> <button class="btn sm" onclick="pipeMove('${o.id}',-1)">← 回退</button>`}</td></tr>`;
    }).join('')}</tbody></table></div>
    <div class="bd"><div class="risk-note" style="margin-top:0;border-top:0;padding-top:0">赢率按阶段经验值设定（线索 15% → 商务谈判 80%），仅用于加权测算；推进到「已签约」自动记为赢单，回退到「已流失」记入输单，赢单率随之重算。商机数据为演示，可在「数据导入」扩展接入。</div></div></div>`;
  return kpis+funnel+stalled+table;
}
/* ===== P1-4 关键人才 AB 角（人员视图第 5 个页签） ===== */
function rTalent(){
  const t=talentOps();
  const kpis=`<div class="grid kpis" style="margin-bottom:14px">
    <div class="card kpi"><div class="lab">关键岗位</div><div class="val">${t.rows.length} 个</div><div class="sub">影响回款 / 交付 / 售前</div></div>
    <div class="card kpi"><div class="lab">B 角覆盖率</div><div class="val" style="color:${t.cover<0.6?'var(--red)':'var(--green)'}">${(t.cover*100).toFixed(0)}%</div><div class="sub">低于 60% 红灯</div></div>
    <div class="card kpi"><div class="lab">无 B 角</div><div class="val" style="color:var(--red)">${t.noB.length} 个</div><div class="sub">人一走岗位即空</div></div>
    <div class="card kpi"><div class="lab">高危（A 角异常 + 无 B 角）</div><div class="val" style="color:var(--red)">${t.high.length} 个</div><div class="sub">超负荷或周报缺失</div></div>
  </div>`;
  const warn=`<div class="card" style="border-left:3px solid var(--red)"><div class="hd"><h3>🔴 不可替代预警 · 谁离职会让项目瘫痪</h3><span class="tag red" style="margin-left:8px">${t.high.length} 高危</span></div><div class="bd">
    ${t.high.length?t.high.map(r=>{const p=S.people.find(x=>x.name===r.owner)||{};
      return `<div class="alert-item"><div class="aico" style="background:var(--red-soft);color:var(--red)">🔴</div>
      <div style="flex:1"><div class="t">${r.owner}（${p.role||'—'}）· ${r.module}</div>
      <div class="d">A 角饱和度 ${p.sat||0}%${p.weekly?'':' · 本周未交周报'}，<b>无 B 角</b>。业务影响：${r.impact}。${r.note}</div>
      <div class="meta"><button class="btn sm primary" onclick="setBackup('${r.id}')">指定 B 角</button>
      <button class="btn sm" onclick='openDispatch(${JSON.stringify({title:'安排 '+r.module+' 交接与文档沉淀',from:'关键人才 AB 角 · 无 B 角',ctx:r.proj})})'>@ 派活交接</button>
      <button class="btn sm" onclick="nav('projects','${r.proj}')">查看项目 →</button></div></div></div>`;
    }).join(''):'<div class="empty">高危岗位已全部配好 B 角 👍</div>'}
    <div class="risk-note">规则：无 B 角 = 单点依赖；若 A 角同时饱和度 &gt;100% 或未交周报，升级为高危。中小公司最常见的经营事故不是丢单，是关键人突然离职。</div>
    </div></div>`;
  const matrix=`<div class="card" style="margin-top:14px"><div class="hd"><h3>🧩 关键岗位 AB 角矩阵</h3><span class="tag blue" style="margin-left:8px">点「指定 / 更换」即可维护</span>
    <div style="flex:1"></div><button class="btn sm" onclick="dispatchHiring()">内部无人？生成招聘需求单</button></div><div class="bd" style="padding:0;overflow-x:auto"><table><thead><tr>
    ${['项目','关键岗位 / 模块','A 角','B 角','接替准备度','业务影响','状态','动作'].map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>
    ${t.rows.map(r=>{const p=S.people.find(x=>x.name===r.owner)||{};const bad=!r.backup;
      const hi=t.high.includes(r);
      return `<tr id="${r.id}"><td><a style="color:var(--primary);cursor:pointer" onclick="nav('projects','${r.proj}')">${r.proj}</a></td>
      <td><b>${r.module}</b></td><td>${r.owner}<br><span style="font-size:11px;color:var(--muted)">饱和度 ${p.sat||0}%</span></td>
      <td>${r.backup?`<b>${r.backup}</b>`:'<b style="color:var(--red)">— 空缺 —</b>'}</td>
      <td style="font-size:12px;color:var(--muted)">${r.ready||'—'}</td>
      <td style="font-size:11.5px;max-width:200px">${r.impact}</td>
      <td><span class="tag ${hi?'red':bad?'orange':'green'}">${hi?'高危':bad?'单点依赖':'有备份'}</span></td>
      <td><button class="btn sm" onclick="setBackup('${r.id}')">${r.backup?'更换':'指定 B 角'}</button></td></tr>`;
    }).join('')}</tbody></table></div></div>`;
  return kpis+warn+matrix;
}
/* ===== P1-3 老板周报（兑现驾驶舱「每周一自动推送」的承诺） ===== */
function rReport(){
  const r=weeklyReport();
  return `<div class="card"><div class="hd"><h3>📄 老板周报 · ${r.meta.date}</h3>
    <span class="tag blue" style="margin-left:8px">一键生成 · 可转发</span><div style="flex:1"></div>
    <button class="btn primary sm" onclick="copyWeekly()">📋 复制文本</button>
    <button class="btn sm" onclick="exportWeekly()">⬇ 导出 HTML</button>
    <button class="btn sm" onclick="window.print()">🖨 打印 / 存 PDF</button></div>
    <div class="bd"><div class="callout">生成口径：<b>${r.meta.basis}</b> ｜ 数据可信度 <b>${r.meta.trust}%</b> ｜ 所有数字由规则引擎从台账实时计算，转发前可在系统内逐条核对。导出的是独立 HTML 文件，微信 / 邮件 / 浏览器都能直接打开。</div></div></div>
  <div class="card wk-paper" style="margin-top:14px"><div class="bd">
    <h1 style="font-size:21px;border-bottom:3px solid var(--primary);padding-bottom:10px;margin-bottom:6px">老板周报 · ${r.meta.date}</h1>
    <div style="font-size:11.5px;color:var(--muted);margin-bottom:14px">生成口径 ${r.meta.basis} ｜ 数据可信度 ${r.meta.trust}% ｜ 规则引擎生成</div>
    ${r.secs.map(s=>`<div class="wk-sec"><h2>${s.h}</h2><ul>${s.rows.map(x=>`<li>${x}</li>`).join('')}</ul></div>`).join('')}
    <div class="risk-note">老板超级助手 · 人 · 财 · 事 三视图 —— 数据不全时只看趋势，不输出结论性指标。</div>
  </div></div>
  <div class="card" style="margin-top:14px"><div class="hd"><h3>🔁 自动化说明</h3></div><div class="bd" style="font-size:12.5px;line-height:1.9;color:#42506b">
    · 当前为<b>手动一键生成</b>；PRD 规划「每周一自动生成推送」，接入企微/邮件通道后可按同一模板自动发送（生成行为已留痕）<br>
    · 周报内容随台账实时变化：导入真实数据、切换时间模式、推进商机阶段后，重新打开本页即为最新一版<br>
    · 生成 / 复制 / 导出 全部写入留痕日志，可在「留痕日志」核对
  </div></div>`;
}
/* ===== 驾驶舱 P1 结论条：把四个新模块的核心答案直接摆到首屏 ===== */
function p1Tiles(){
  const p=pnlOps(),pi=pipelineOps(),t=talentOps();
  const pct=n=>(n*100).toFixed(1)+'%';
  const tile=(icon,lab,val,sub,view,color)=>`<button class="p1-tile" onclick="nav('${view}')">
    <span class="p1-ico">${icon}</span><span class="p1-lab">${lab}</span>
    <span class="p1-val" style="color:${color}">${val}</span><span class="p1-sub">${sub}</span><span class="p1-go">查看 →</span></button>`;
  return `<div class="card" style="margin-bottom:14px;border-left:3px solid var(--green)">
    <div class="hd"><h3>💼 老板四个经营结论</h3><span class="tag green" style="margin-left:8px">P1 新增 · 从"盯"到"赚"</span>
      <div style="flex:1"></div><button class="btn sm primary" onclick="nav('report')">📄 一键生成老板周报</button></div>
    <div class="bd"><div class="p1-grid">
      ${tile('🧾','本月净利',`${p.cur.net>=0?'':'-'}${fmt(Math.abs(p.cur.net))}`,`净利率 ${pct(p.cur.netRate)}${p.turning?' · 由正转负':' · 收入−成本−费用'}`,'pnl',p.cur.net>=0?'var(--green)':'var(--red)')}
      ${tile('🎯','年度目标完成',`${(p.rate*100).toFixed(0)}%`,`缺口 ${fmt(p.gap)} · 还需约 ${p.needDeals} 单`,'pnl','var(--primary)')}
      ${tile('🔻','下月预计签约',fmt(pi.nextAmt),`在谈 ${pi.open.length} 个 · 加权 ${fmtShort(pi.weighted)}`,'pipeline','var(--primary)')}
      ${tile('🔴','关键岗位无 B 角',`${t.noB.length} 个`,`覆盖率 ${(t.cover*100).toFixed(0)}% · 高危 ${t.high.length} 个`,'people','var(--red)')}
    </div>
    <div class="risk-note">结论口径：净利来自 06 项目成本 + 07 费用预算（去重后）；年度目标为「在手合同额 / 新签目标」；下月预计签约 = 商机金额 × 阶段赢率。数据可信度 ${Math.round(dataTrust().overall*100)}%，仅供内部经营判断。</div>
    </div></div>`;
}

/* ---- 驾驶舱 ---- */
function rDashboard(){
  const F=finSummary(),ops=finOpsX(),T=teamSummary(),al=allAlerts().sort((a,b)=>(a.sev==='high'?0:1)-(b.sev==='high'?0:1));
  const active=S.projects.filter(p=>p.stage!=='SOW 待签').length;
  const done=S.projects.reduce((s,p)=>s+p.deliver.filter(d=>d.ok).length,0),totalD=S.projects.reduce((s,p)=>s+p.deliver.length,0);
  /* 老板四数看板红绿灯 */
  const c1=ops.safety<2?'red':ops.safety<3?'orange':'green';                 // 可支配现金：<2月红灯 <3月黄灯
  const gmPt=((ops.gmRate10-ops.gmRate9)*100);
  const c2=ops.gmRate10<0.25?'red':gmPt<-1.5?'orange':'green';               // 毛利率：<25% 或环比降>1.5pt
  const c3=ops.recvOverRate>35?'red':ops.recvOverRate>20?'orange':'green';   // 应收超期：>20%黄 >35%红
  const c4=ops.laborRatio>0.45?'orange':'green';                             // 人力成本占收入比
  /* P0-2：四条趋势小图数据（CEO 看斜率不看单点） */
  const cashPts=cashTrend(), gmT=gmTrend(), arPts=arTrendPts();
  const light=c=>c==='red'?'var(--red)':c==='orange'?'var(--orange)':'var(--green)';
  const four=`<div class="grid kpis" style="margin-bottom:10px">
    <div class="card kpi"><div class="lab">💵 可支配现金 <span style="color:${light(c1)}">●</span></div><div class="val" style="color:${light(c1)}">${fmt(ops.disp)}</div><div class="sub">可用资金 ${fmt(ops.avail)} − 30天刚性支出 ${fmt(ops.rigid30)} · 安全垫 <b style="color:${light(c1)}">${ops.safety.toFixed(1)} 个月</b>（&lt;2 红灯）</div>${sparkline(cashPts,{goodUp:true,capF:fmtShort})}</div>
    <div class="card kpi"><div class="lab">📈 毛利率（10月） <span style="color:${light(c2)}">●</span></div><div class="val" style="color:${light(c2)}">${(ops.gmRate10*100).toFixed(1)}%</div><div class="sub">环比 9 月 <b style="color:${gmPt>=0?'var(--green)':'var(--red)'}">${gmPt>=0?'+':''}${gmPt.toFixed(1)}pt</b>（降 &gt;1.5pt 黄灯，&lt;25% 红灯）</div>${sparkline(gmT.rate,{goodUp:true,capF:v=>v.toFixed(1)+'%'})}</div>
    <div class="card kpi"><div class="lab">💸 应收超期额 <span style="color:${light(c3)}">●</span></div><div class="val" style="color:${light(c3)}">${fmt(ops.recvOverSum)}</div><div class="sub">逾期率 <b style="color:${light(c3)}">${ops.recvOverRate}%</b> · ${ops.recvOver.length} 笔（&gt;20% 黄灯、&gt;35% 红灯）</div>${sparkline(arPts,{goodUp:false,capF:fmtShort})}</div>
    <div class="card kpi"><div class="lab">👤 人均毛利（月） <span style="color:${light(c4)}">●</span></div><div class="val" style="color:${light(c4)}">${fmt(Math.round(ops.perGm))}</div><div class="sub">人均产值 ${fmt(Math.round(ops.perRev))} · 人力成本占收入比 <b style="color:${light(c4)}">${(ops.laborRatio*100).toFixed(0)}%</b>（&gt;45% 黄灯）</div>${sparkline(gmT.perGm,{goodUp:true,capF:fmtShort})}</div>
  </div>
  <div class="card" style="margin-bottom:14px;padding:9px 16px"><div class="bd" style="font-size:12.5px;color:var(--muted);display:flex;gap:22px;flex-wrap:wrap;padding:0">
    <span>📋 进行中项目 <b style="color:var(--text)">${active}/${S.projects.length}</b></span>
    <span>📦 交付物 <b style="color:var(--text)">${done}/${totalD}</b></span>
    <span>👥 在岗 <b style="color:var(--text)">${T.on}人 · 饱和度 ${T.avgSat}%</b></span>
    <span>📝 未交周报 <b style="color:${T.noWeekly?'var(--red)':'var(--text)'}">${T.noWeekly}人</b></span>
    <span>🧾 在手订单未确认 <b style="color:var(--text)">${fmt(ops.unconfirmed)}</b></span>
    <span>🗓 基准日 <b style="color:var(--text)">${todayStr()}</b> <button class="mode-chip" onclick="setDateMode('${dateMode()==='demo'?'real':'demo'}')">${dateMode()==='demo'?'演示冻结 · 点此用今天算逾期':'真实日期 · 点此冻结回演示'}</button></span>
    <span style="margin-left:auto">频率：现金每周看 · 毛利/超期/人效每月看</span>
  </div></div>`;
  const dt=dataTrust();
  /* PRD 5.2 首屏即答案：打开就是「今天该处理哪三件事」，每条都带动作（派活 / 查看 / 忽略） */
  const tri=triageItems().slice(0,3);
  const triage=`<div class="card" style="margin-bottom:14px;border-left:3px solid var(--primary)">
    <div class="hd"><h3>🎯 今日待处理 ${tri.length} 件事</h3>
      <span class="tag blue" style="margin-left:8px">首屏即答案 · 不是空白输入框</span>
      <div class="spacer" style="flex:1"></div>
      <span style="font-size:11.5px;color:var(--muted)">共 ${triageItems().length} 条信号，按严重度取前 3</span>
      <button class="btn sm" onclick="nav('sentinel')">全部</button></div>
    <div class="bd"><div class="triage">
      ${tri.length?tri.map(t=>`<div class="triage-item">
        <div class="ti">${t.icon}</div>
        <div style="flex:1;min-width:0">
          <div class="tt">${t.title}</div>
          <div class="tw">${t.why}</div>
          <div class="ta">
            ${t.dispatch?`<button class="btn primary sm" onclick='openDispatch(${JSON.stringify(t.dispatch)})'>@ 派活</button>`:''}
            <button class="btn sm" onclick="nav('${t.jump[0]}',\x27${t.jump[1]||''}\x27)">查看依据</button>
            <button class="btn sm" onclick="ignoreItem('${t.key}')">忽略</button>
            <span class="tag gray" style="margin-left:auto">${t.tag}</span>
          </div>
        </div></div>`).join(''):'<div class="empty">今天没有需要您亲自处理的事 🎉</div>'}
    </div>
    <div style="margin-top:10px;font-size:11.5px;color:var(--muted)">忽略会留痕，明天不再重复打扰；新信号出现会重新进入列表。</div>
    </div></div>`;
  const trust=`<div class="card" style="margin-top:14px"><div class="hd"><h3>🧩 数据可信度 · ${Math.round(dt.overall*100)}%（${dt.level}）</h3>
    <span class="tag ${dt.overall>=0.8?'green':dt.overall>=0.6?'orange':'red'}" style="margin-left:8px">${dt.level}</span>
    <div class="spacer" style="flex:1"></div>
    <button class="btn primary sm" onclick="nav('import')">📥 导入真实数据，提升可信度</button>
    <span style="font-size:11.5px;color:var(--muted);margin-left:9px">数据不全时不输出结论性指标 —— PRD 1.3 / 6.3</span></div>
    <div class="bd">
      <div style="display:flex;gap:14px;flex-wrap:wrap">
      ${dt.items.map(i=>`<div style="flex:1;min-width:150px;background:#f8faff;border-radius:9px;padding:10px 12px">
        <div style="font-size:11.5px;color:var(--muted)">${i.k} <span style="color:var(--muted)">· 权重 ${Math.round(i.w*100)}%</span></div>        <div style="display:flex;align-items:center;gap:7px;margin-top:5px"><span class="bar-wrap" style="flex:1;width:auto"><span class="bar-fill" style="width:${Math.max(4,i.cov*100)}%;background:${i.cov>=0.8?'var(--green)':i.cov>=0.5?'var(--orange)':'var(--red)'};display:block"></span></span><b style="font-size:12px">${Math.round(i.cov*100)}%</b></div>
      </div>`).join('')}
      </div>
      <div class="risk-note"><b>补齐清单（按收益排序）</b><br>${dt.items.slice().sort((a,b)=>(b.w*(1-b.cov))-(a.w*(1-a.cov))).slice(0,3).map((i,n)=>`${n+1}. ${i.fix}`).join('<br>')}<br>
      <span style="color:var(--orange)">⚠ 当前毛利率、人均毛利等指标基于不完整数据计算，只能看趋势不能当结论。</span></div>
    </div></div>`;
  return whatsNew()+triage+four+trendSection()+p1Tiles()+`
  <div class="grid two-col">
    <div class="card"><div class="hd"><h3>🚨 提醒哨兵 · 需要您关注的 ${al.length} 件事</h3><div class="spacer" style="flex:1"></div><button class="btn sm" onclick="nav('sentinel')">全部处理</button></div><div class="bd">
      ${al.slice(0,4).map(alertHtml).join('')||'<div class="empty">一切正常 🎉</div>'}
    </div></div>
    <div>
      <div class="card" style="margin-bottom:14px"><div class="hd"><h3>💰 回款全景（真实快照 2026-10-23）</h3></div><div class="bd">
        ${finBar('累计回款',F.totalReceived,F.contractTotal,'var(--green)')}
        <div style="height:8px"></div>
        ${finBar('未回款',F.contractTotal-F.totalReceived,F.contractTotal,'var(--red)')}
        <div style="margin-top:10px">${sparkbar(recvTrend())}</div>
        <div class="risk-note">合同总额 <b>${fmt(F.contractTotal)}</b> ｜ 已回款 <b style="color:var(--green)">${fmt(F.totalReceived)}（${F.recvRate}%）</b>。<br>最大敞口：P2026-001 回款③④⑤共 ¥117.5 万卡考勤上线；10 月支出（估算演示）${fmt(F.outSum)} ｜ <a style="color:var(--primary);cursor:pointer;font-weight:600" onclick="nav('report')">📄 一键生成《老板周报》 →</a></div>
      </div></div>
      <div class="card"><div class="hd"><h3>🧾 最近留痕</h3><div class="spacer" style="flex:1"></div><button class="btn sm" onclick="nav('audit')">全部</button></div><div class="bd" style="padding-top:8px">
        ${S.audit.slice(0,5).map(a=>`<div style="font-size:12px;color:var(--muted);padding:5px 0;border-bottom:1px dashed #f0f3f8">[${a.t}] ${a.who} · ${a.act}</div>`).join('')||'<div class="empty">暂无记录</div>'}
      </div></div>
    </div>
  </div>`+trust;
}
function finBar(lab,v,max,color){const w=Math.min(100,v/max*100);return `<div style="display:flex;align-items:center;gap:10px"><span style="width:32px;font-size:12px;color:var(--muted)">${lab}</span><div style="flex:1;height:14px;background:#eef1f6;border-radius:7px;overflow:hidden"><div style="width:${w}%;height:100%;background:${color};border-radius:7px"></div></div><b style="font-size:13px;min-width:88px;text-align:right" class="money">${fmt(v)}</b></div>`;}
function alertHtml(a,i){
  const ICON={'里程碑逾期':'📅','应收逾期':'💸','周报缺失':'📝','客户集中':'🏢','任务超时':'⏰','AI 代发待确认':'🤖'};
  const icon=ICON[a.type]||'🔔';
  const bg=a.sev==='high'?'var(--red-soft)':'var(--orange-soft)';const col=a.sev==='high'?'var(--red)':'var(--orange)';
  return `<div class="alert-item"><div class="aico" style="background:${bg};color:${col}">${icon}</div>
    <div style="flex:1"><div class="t">${a.title}</div><div class="d">${a.detail}</div><div class="meta"><span class="tag ${a.sev==='high'?'red':'orange'}">${a.type}</span> <a style="color:var(--primary);cursor:pointer" onclick="nav('${a.jump[0]}',\x27${a.jump[1]||''}\x27)">查看原始依据 →</a></div></div></div>`;
}

/* ---- 项目台账 ---- */
const LEDGER_LIMIT = 6; // 台账展示上限：取多项目管理列表中的前 6 个项目
const COST_DAY = 1200;  // 内部综合成本率（元/人天，含五险一金与分摊，估算口径）
/* P1：毛利盯梢——FP 项目看「每一人天卖多少钱」（合同额÷累计人天 vs 成本线）；T&M 项目看单价 vs 成本线 */
function marginWatch(p){
  if(p.price==='FP'){
    if(!p.manDays)return {t:'待人天台账',cls:'gray'};
    const revDay=Math.round(p.contract/p.manDays);
    return {t:'¥'+revDay.toLocaleString()+'/人天',cls:revDay<1000?'red':revDay<1500?'orange':'green',sub:'vs 成本线 ¥'+COST_DAY,revDay};
  }
  const up=parseFloat((p.unitPrice||'').match(/[\d,]+(?:\.\d+)?/)); // T&M 从单价说明提取首个数字
  if(!up)return {t:'单价待补',cls:'gray'};
  return {t:'¥'+Math.round(up).toLocaleString()+'/人天',cls:up<COST_DAY?'red':up<COST_DAY*1.3?'orange':'green',sub:'vs 成本线 ¥'+COST_DAY,revDay:up};
}
function ledgerProjects(){ return S.projects.slice(0, LEDGER_LIMIT); }
function rProjects(){
  const list = ledgerProjects();
  const more = S.projects.length - list.length;
  const stageColor=s=>s==='执行'?'blue':s==='初始'?'orange':s==='上线支持'?'green':s==='转移'?'purple':'gray';
  return '<div class="card"><div class="hd"><h3>多项目管理 · 前 '+list.length+' 个项目</h3><span class="tag green" style="margin-left:10px">真实数据 · 交付项目管理中心快照 2026-10-23</span><span class="tag gray">共 '+S.projects.length+' 个项目'+(more>0?`，当前展示前 ${list.length} 个`:'')+'</span></div><div class="bd" style="padding:0;overflow-x:auto"><table><thead><tr>'+
  ['项目编号 / 名称','计价类型','阶段 / 进度','合同额','已回款','回款率','毛利盯梢（估算）','里程碑 / 回款批次','交付物','健康度 / 风险'].map(h=>`<th>${h}</th>`).join('')+
  '</tr></thead><tbody>'+list.map(p=>{
    const pct=p.contract>0?Math.round(p.paid/p.contract*100):0;
    const lv=p.risk;
    const od=projOverdueMs(p);
    const mw=marginWatch(p);
    return `<tr id="${p.id}"><td style="min-width:170px"><b>${p.name}</b><br><span style="font-size:11.5px;color:var(--muted)">${p.id} · ${p.client}</span></td>
    <td><span class="tag ${p.price==='FP'?'green':'purple'}" title="${p.price==='FP'?'Fixed Price 固定价格 · 盯毛利':'T&M 人天核算 · 盯结算率'}">${p.price}</span></td>
    <td><span class="tag ${stageColor(p.stage)}">${p.stage}</span><div style="font-size:11.5px;color:var(--muted);margin-top:3px">${p.progress!=null?'进度 '+p.progress+'%':(p.start?'起 '+fmtD(p.start):'排期待定')}</div></td>
    <td class="money">${fmt(p.contract)||'—'}</td><td class="money green">${fmt(p.paid)}</td>
    <td><div style="display:flex;align-items:center;gap:7px"><span class="bar-wrap"><span class="bar-fill" style="width:${Math.min(100,pct)}%;background:${pct>=60?'var(--green)':pct>=30?'var(--orange)':'var(--red)'};display:block"></span></span><span style="font-size:12px">${pct}%</span></div></td>
    <td>${mw.cls==='gray'?`<span class="tag gray">${mw.t}</span>`:`<span class="tag ${mw.cls}">${mw.t}</span><div style="font-size:11px;color:var(--muted);margin-top:3px">${mw.sub||''}${p.manDays?' · 累计'+p.manDays+'人天':''}</div>`}</td>
    <td style="min-width:170px">${p.milestones.map(m=>{const late=m.due&&!m.done&&daysBetween(m.due,todayStr())>0;
      const blk=msBlockedAmt(p,m);
      return `<div class="ms-line"><span class="ms-dot" style="background:${m.done?'var(--green)':late?'var(--red)':'#c3cbdb'}"></span><span style="font-size:11.5px;${late?'color:var(--red);font-weight:600':''}">${m.n}</span>${!m.done&&blk>0?` <span class="tag red" style="margin-left:2px" title="该里程碑未完成，卡住的回款批次金额">卡 ¥${blk.toLocaleString('en-US')}</span>`:''}</div>`;}).join('')}</td>
    <td>${p.deliver.map(d=>`<span class="tag ${d.ok?'green':'gray'}" style="margin:1px">${d.ok?'✓':'○'}${d.n}</span>`).join(' ')}</td>
    <td style="min-width:180px"><span class="tag ${lv==='高'?'red':lv==='中等'?'orange':'green'}">${lv}</span><div style="font-size:11.5px;color:var(--muted);max-width:210px;margin-top:3px">${p.riskNote||''}</div></td></tr>`;
  }).join('')+'</tbody></table></div></div>'+
  `<div class="card" style="margin-top:14px"><div class="bd"><b style="font-size:13px">台账口径说明</b><div class="risk-note">· 数据来源：<b>交付项目管理中心只读快照（数据截止 2026-10-23，共 11 个项目，合同总额 ¥10,352,668，已回款 ¥1,175,000，回款率 11%，累计人天 3780.3）</b><br>· 六阶段流水线：投标 → 初始 → 方案 → 执行 → 转移 → 上线支持<br>· 计价类型：<b>Fixed Price 盯毛利</b>（人天越多毛利越低，看成本回收率）；<b>T&M 盯结算率</b>（人天×单价−已回款=待结算，越大越要尽快开票）<br>· <b>毛利盯梢口径</b>：FP 项目 = 合同额 ÷ 累计人天 = 每一人天的实际售价，低于内部成本线 ¥${COST_DAY}/人天即标红（干得越多亏得越多）；T&M 项目 = 合同单价 vs 成本线。快照中 3780.3 为公司累计人天（暂挂 P2026-001），按项目拆分人天后本列即为真实毛利预警<br>· 公司级风险提示：两个乙方主体并存需按主体归集应收；5 个项目有业务登记但无合同文件；T&M 项目无合同总额存在人天漏收敞口</div></div></div>`;
}

/* ---- 人员视图（细化版：状态总览 / 薪酬成本 / 周报一览 / 人事变动） ---- */
const P_TABS=[['overview','状态总览'],['salary','薪酬成本'],['weekly','周报一览'],['changes','人事变动'],['talent','关键人才 AB 角']];
const SB_RATE=0.32; // 社保公积金企业部分估算比例
function setPTab(t){log('人员视图','切换到「'+(P_TABS.find(x=>x[0]===t)||['',''])[1]+'」');state.pTab=t;render();}
function personRisk(p){
  if(!p.on)return null;
  const drop=p.trend[0]>0&&p.trend[3]<=p.trend[0]*0.8;
  if(p.sat>100)return{lv:'high',tag:'超负荷',msg:'饱和度 '+p.sat+'%，连续超负荷有 burnout 风险，建议减负或增援'};
  if(drop&&!p.weekly)return{lv:'high',tag:'产出骤降 + 周报缺失',msg:'产出 '+p.trend[0]+'% → '+p.trend[3]+'%，且本周未交周报，建议 48 小时内 1:1 沟通'};
  if(!p.weekly)return{lv:'mid',tag:'周报缺失',msg:'本周未交周报，哨兵已自动提醒'};
  if(drop)return{lv:'mid',tag:'产出下降',msg:'近 4 周产出 '+p.trend[0]+'% → '+p.trend[3]+'%，趋势向下，建议关注'};
  if(p.sat<50)return{lv:'low',tag:'低负载',msg:'饱和度仅 '+p.sat+'%，可承接新任务或支援其他项目'};
  return null;
}
function payrollRows(){
  return S.people.filter(p=>p.on).map(p=>{
    const sb=Math.round(p.salary*SB_RATE);
    return {p,sb,month:p.salary+sb,year:(p.salary+sb)*13};
  });
}
/* P1：人员调配建议——超负荷 × 低负载自动撮合（同技能族优先，测试/运营可跨族支援） */
function roleFamily(r){
  if(/前端|后端|开发/.test(r))return'开发';
  if(/测试/.test(r))return'测试';
  if(/设计|UI/.test(r))return'设计';
  if(/项目|PM/.test(r))return'PM';
  if(/销售/.test(r))return'销售';
  return'运营';
}
function staffingSuggest(){
  const on=S.people.filter(p=>p.on&&p.sat>0);                  // 请假(产出为0)人员不参与调配
  const over=on.filter(p=>p.sat>100).sort((a,b)=>b.sat-a.sat);
  const idle=on.filter(p=>p.sat<70).sort((a,b)=>a.sat-b.sat);
  const used=new Set();
  return over.map(o=>{
    const fam=roleFamily(o.role);
    let cand=idle.find(c=>!used.has(c.id)&&roleFamily(c.role)===fam)
          ||idle.find(c=>!used.has(c.id)&&['测试','运营'].includes(roleFamily(c.role)));
    if(!cand)return {o,cand:null,msg:'无可调配人选——建议外部增援或与客户重排计划'};
    used.add(cand.id);
    const relief=Math.min(100-o.sat<0?Math.abs(o.sat-95):cand.sat, 30);
    return {o,cand,msg:`${cand.name}（${cand.role}，饱和度 ${cand.sat}%）可支援 ${o.name} 在 ${o.projects.map(id=>projName(id)).join('、')||'当前'} 的工作，预计为 ${o.name} 释放 10–15% 负载`};
  });
}
function rPeople(){
  const T=teamSummary();
  const tab=state.pTab||'overview';
  const tabs=`<div class="subnav-tabs">${P_TABS.map(([k,l])=>`<button class="${tab===k?'on':''}" onclick="setPTab('${k}')">${l}</button>`).join('')}</div>`;
  const kpis=tab==='talent'?'':`<div class="grid kpis" style="margin-bottom:14px">
    <div class="card kpi"><div class="lab">在岗 / 总人数</div><div class="val">${T.on} / ${T.total}</div></div>
    <div class="card kpi ${T.avgSat>95?'warn':'ok'}"><div class="lab">平均饱和度</div><div class="val">${T.avgSat}%</div></div>
    <div class="card kpi warn"><div class="lab">超负荷（&gt;100%）</div><div class="val">${T.overload}人</div></div>
    <div class="card kpi"><div class="lab">未交周报</div><div class="val">${T.noWeekly}人</div></div></div>`;
  let body='';
  /* -- 状态总览 -- */
  if(tab==='overview'){
    const LV={high:0,mid:1,low:2};
    const risks=S.people.map(p=>({p,r:personRisk(p)})).filter(x=>x.r).sort((a,b)=>LV[a.r.lv]-LV[b.r.lv]);
    body=`<div class="grid two-col">
    <div class="card"><div class="hd"><h3>人员状态一览</h3><span class="tag gray" style="margin-left:auto">${T.on} 人在岗</span></div><div class="bd" style="padding:0;overflow-x:auto"><table><thead><tr>
    ${['姓名 / 角色','入职','在岗','饱和度','本周周报','近4周趋势','参与项目','综合状态'].map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>
    ${S.people.map(p=>{
      const satColor=p.sat>100?'var(--red)':p.sat>80?'var(--orange)':p.sat>0?'var(--green)':'#c3cbdb';
      return `<tr id="${p.id}"><td><b>${p.name}</b><br><span style="font-size:12px;color:var(--muted)">${p.role}</span></td>
      <td style="font-size:12px;color:var(--muted)" class="money">${(S.hireDates||{})[p.id]||'—'}</td>
      <td><span class="tag ${p.on?'green':'gray'}">${p.on?'在岗':'离职'}</span></td>
      <td><div style="display:flex;align-items:center;gap:7px"><span class="bar-wrap"><span class="bar-fill" style="width:${Math.min(100,p.sat)}%;background:${satColor};display:block"></span></span><b style="font-size:12.5px;color:${p.sat>100?'var(--red)':'inherit'}">${p.sat}%</b></div></td>
      <td>${p.on?(p.weekly?'<span class="tag green">已交</span>':'<span class="tag red">未交</span>'):'—'}</td>
      <td style="font-size:12px;color:var(--muted);font-variant-numeric:tabular-nums">${p.trend.join(' → ')}</td>
      <td>${p.projects.map(id=>`<span class="tag blue" style="margin:1px;cursor:pointer" onclick="nav('projects','${id}')">${projName(id)}</span>`).join(' ')||'<span style="color:var(--muted)">—</span>'}</td>
      <td style="font-size:12.5px;max-width:200px">${p.note}</td></tr>`;
    }).join('')}</tbody></table></div></div>
    <div class="card"><div class="hd"><h3>⚠️ 人员风险预警</h3><span class="tag red" style="margin-left:auto">${risks.filter(x=>x.r.lv==='high').length} 高危 / ${risks.length} 人</span></div><div class="bd">
    ${risks.length?risks.map(x=>{
      const c=x.r.lv==='high'?'var(--red-soft)':x.r.lv==='mid'?'var(--orange-soft)':'var(--primary-soft)';
      const ic=x.r.lv==='high'?'🔴':x.r.lv==='mid'?'🟠':'🔵';
      return `<div class="alert-item"><div class="aico" style="background:${c}">${ic}</div>
      <div style="flex:1"><div class="t">${x.p.name}（${x.p.role}）<span class="tag ${x.r.lv==='high'?'red':x.r.lv==='mid'?'orange':'blue'}" style="margin-left:6px">${x.r.tag}</span></div>
      <div class="d">${x.r.msg}</div><div class="meta"><a style="color:var(--primary);cursor:pointer" onclick="nav('people','${x.p.id}')">查看档案 →</a></div></div></div>`;
    }).join(''):'<div class="empty">当前无人员风险 🎉</div>'}
    <div class="risk-note">预警规则：超负荷（饱和度&gt;100%）｜产出骤降+周报缺失｜低负载（&lt;50%）。均由规则引擎实时计算。</div>
    </div></div></div>
    <div class="card" style="margin-top:14px"><div class="hd"><h3>🧩 人员调配建议（超负荷 × 低负载自动撮合，省下的是招聘成本）</h3><span class="tag blue" style="margin-left:auto">规则引擎生成 · 同技能族优先</span></div><div class="bd">
    ${(()=>{const sug=staffingSuggest();
      return sug.length?sug.map(s=>`<div class="alert-item"><div class="aico" style="background:var(--primary-soft)">🧩</div>
      <div style="flex:1"><div class="t">${s.o.name}（${s.o.role} · ${s.o.sat}%）→ ${s.cand?s.cand.name+'（'+s.cand.role+' · '+s.cand.sat+'%）':'⚠ 无内部人选'}</div>
      <div class="d">${s.msg}</div></div></div>`).join(''):'<div class="empty">当前无超负荷人员，暂无需调配 🎉</div>';
    })()}
    <div class="risk-note">撮合逻辑：超负荷人员按技能族匹配低负载（&lt;70%）在岗人员（请假者不参与）；同族无人时测试/运营可跨族支援。调整饱和度后建议自动重算。</div>
    </div></div>`;
  }
  /* -- P1-4 关键人才 AB 角 -- */
  else if(tab==='talent'){ body=rTalent(); }
  /* -- 薪酬成本 -- */
  else if(tab==='salary'){
    if(maskSalary()){
      body=`<div class="card"><div class="lock-view"><div class="big">🔒</div><b>薪酬成本仅「老板」可见</b><div style="font-size:12px">权限 v0 字段白名单：薪资、财务明细仅授权人可见，本次访问已留痕</div></div></div>`;
    }else{
      const rows=payrollRows();
      const ops=finOpsX();
      const totM=rows.reduce((s,r)=>s+r.month,0),totY=rows.reduce((s,r)=>s+r.year,0),totSalary=rows.reduce((s,r)=>s+r.p.salary,0);
      body=`<div class="grid kpis" style="margin-bottom:14px">
      <div class="card kpi"><div class="lab">月人力成本（含社保）</div><div class="val">${fmt(totM)}</div><div class="sub">人均 ${fmt(Math.round(totM/rows.length))}</div></div>
      <div class="card kpi"><div class="lab">年人力成本（13 薪估算）</div><div class="val">${fmt(totY)}</div></div>
      <div class="card kpi"><div class="lab">人均产值（月）</div><div class="val">${fmt(Math.round(ops.perRev))}</div><div class="sub">确认收入 ${fmt(ops.revM)} ÷ 在岗 ${ops.onCnt} 人 · 市场参考 30–50 万/年</div></div>
      <div class="card kpi"><div class="lab">人均毛利（月）</div><div class="val">${fmt(Math.round(ops.perGm))}</div><div class="sub">毛利 ${fmt(ops.gmM)} ÷ 在岗 ${ops.onCnt} 人 · 连续下滑要查原因</div></div>
      <div class="card kpi ${ops.laborRatio>0.45?'warn':'ok'}"><div class="lab">人力成本占收入比</div><div class="val" style="color:${ops.laborRatio>0.45?'var(--orange)':'var(--green)'}">${(ops.laborRatio*100).toFixed(0)}%</div><div class="sub">薪酬实际 ${fmt(ops.labor10)} ÷ 确认收入 ${fmt(ops.revM)} · &gt;45% 黄灯</div></div>
      <div class="card kpi ${T.avgSat>95?'warn':'ok'}"><div class="lab">人均饱和度</div><div class="val">${T.avgSat}%</div><div class="sub">${T.avgSat>95?'投入已接近极限':'尚有承接空间'}</div></div></div>
      <div class="card"><div class="hd"><h3>薪酬成本明细（仅老板可见）</h3></div><div class="bd" style="padding:0;overflow-x:auto"><table><thead><tr>
      ${['姓名 / 角色','入职时间','月薪','社保公积金(估)','月人力成本','年成本(13薪)','饱和度','在跟项目'].map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>
      ${rows.map(r=>`<tr><td><b>${r.p.name}</b><br><span style="font-size:12px;color:var(--muted)">${r.p.role}</span></td>
      <td class="money" style="font-size:12px">${(S.hireDates||{})[r.p.id]||'—'}</td>
      <td class="money">${fmt(r.p.salary)}</td><td class="money" style="color:var(--muted)">${fmt(r.sb)}</td>
      <td class="money"><b>${fmt(r.month)}</b></td><td class="money">${fmt(r.year)}</td>
      <td><span class="tag ${r.p.sat>100?'red':r.p.sat>80?'orange':'green'}">${r.p.sat}%</span></td>
      <td style="font-size:12px">${r.p.projects.length} 个</td></tr>`).join('')}
      <tr style="background:#f8faff"><td><b>合计（${rows.length} 人）</b></td><td></td><td class="money"><b>${fmt(totSalary)}</b></td><td class="money" style="color:var(--muted)"><b>${fmt(totM-totSalary)}</b></td><td class="money"><b style="color:var(--primary)">${fmt(totM)}</b></td><td class="money"><b style="color:var(--primary)">${fmt(totY)}</b></td><td></td><td></td></tr>
      </tbody></table></div></div>
      <div class="card" style="margin-top:14px"><div class="bd"><b style="font-size:13px">口径说明</b><div class="risk-note">· 社保公积金按月薪 ${Math.round(SB_RATE*100)}% 估算（企业部分），年成本按 13 薪计<br>· <b>人效三数</b>（市场对标口径）：人均产值 = 当月确认收入 ÷ 在岗人数；人均毛利 = 当月项目毛利 ÷ 在岗人数；人力成本占收入比 = 当月薪酬实际 ÷ 当月确认收入。服务型中小企业人均产值参考区间 30–50 万/年，&gt;45% 成本占比需警惕；样表收入仅含 06 成本表已归集项目，占比偏高属样例口径<br>· 人效应与自己的历史环比，不跨行业横比；连续 2 月下滑即触发关注</div></div></div>`;
    }
  }
  /* -- 周报一览 -- */
  else if(tab==='weekly'){
    const on=S.people.filter(p=>p.on);
    const did=on.filter(p=>p.weekly);
    const sorted=[...on].sort((a,b)=>(a.weekly?1:0)-(b.weekly?1:0));
    body=`<div class="grid kpis" style="margin-bottom:14px">
    <div class="card kpi"><div class="lab">应交周报</div><div class="val">${on.length}人</div></div>
    <div class="card kpi ${did.length<on.length?'warn':'ok'}"><div class="lab">已交</div><div class="val">${did.length}人</div></div>
    <div class="card kpi ${did.length<on.length?'warn':'ok'}"><div class="lab">缴交率</div><div class="val">${Math.round(did.length/on.length*100)}%</div><div class="sub">哨兵自动催办缺失者</div></div></div>
    <div class="card"><div class="hd"><h3>本周周报一览（未交置顶标红）</h3></div><div class="bd" style="padding:0;overflow-x:auto"><table><thead><tr>
    ${['姓名 / 角色','本周周报','近4周产出趋势','状态摘要'].map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>
    ${sorted.map(p=>`<tr id="${p.id}"><td><b>${p.name}</b><br><span style="font-size:12px;color:var(--muted)">${p.role}</span></td>
    <td>${p.weekly?'<span class="tag green">已交</span>':'<span class="tag red">未交</span>'}</td>
    <td style="font-size:12px;font-variant-numeric:tabular-nums"><span style="color:${p.trend[3]>=p.trend[0]?'var(--green)':'var(--red)'}">${p.trend.join(' → ')}</span></td>
    <td style="font-size:12.5px">${p.note}</td></tr>`).join('')}</tbody></table></div></div>
    <div class="card" style="margin-top:14px"><div class="bd"><b style="font-size:13px">为什么盯周报？</b><div class="risk-note">周报是「人·状态视图」最便宜的数据源：无周报 → 无产出数据 → 状态失明。会上明确的失败模式"装完就忘"，靠周报+每周一《老板周报》自动推送来保命。</div></div></div>`;
  }
  /* -- 人事变动 -- */
  else{
    const CH=(S.peopleChanges||[]).slice().sort((a,b)=>b.date.localeCompare(a.date));
    const typeConf={'入职':['green','➕'],'离职':['gray','➖'],'请假':['orange','休假']};
    body=`<div class="card"><div class="hd"><h3>人事变动时间线（近 12 个月）</h3><span class="tag gray" style="margin-left:auto">${CH.length} 条记录</span></div><div class="bd">
    ${CH.map(c=>{const[cls,ic]=typeConf[c.type]||['blue','·'];
      return `<div style="display:flex;gap:14px;padding:11px 4px;border-bottom:1px dashed #f0f3f8;align-items:flex-start">
      <span class="money" style="font-size:12.5px;color:var(--muted);min-width:80px">${c.date}</span>
      <span class="tag ${cls}" style="min-width:44px;text-align:center">${ic}</span>
      <div style="flex:1"><b style="font-size:13.5px">${c.who}</b> <span style="font-size:12.5px;color:var(--muted)">${c.type}</span>
      <div style="font-size:12.5px;color:#42506b;margin-top:3px;line-height:1.6">${c.detail}</div></div></div>`;
    }).join('')}
    <div class="risk-note">变动影响自动联动：离职/请假人员的项目负载会重算到交接人头上（如吴迪离职 → 张一鸣饱和度 115% 触发超负荷预警）。</div>
    </div></div>`;
  }
  return kpis+`<div class="card" style="margin-bottom:14px"><div class="hd"><h3>人 · 状态视图</h3>${tabs}</div></div>`+body+
  (tab==='overview'&&maskSalary()?`<div class="card" style="margin-top:14px"><div class="bd" style="color:var(--muted);font-size:12.5px">🔒 薪酬字段已按权限白名单对当前身份隐藏（三级权限 v0）</div></div>`:'');
}

/* ---- 财务（子表：财-进出一张表 · 9 个页签对应工作簿各分页） ---- */
const F_TABS=[['sheet','进出一张表'],['forecast','现金流预测'],['recv','应收台账'],['pay','应付台账'],['orders','合同订单'],['cost','项目成本'],['budget','费用预算'],['acct','资金账户'],['sum','经营汇总'],['batch','回款批次 · 交付中心']];
function setFTab(t){log('财务视图','切换到「'+(F_TABS.find(x=>x[0]===t)||['',''])[1]+'」');state.fTab=t;render();}
function agingBucket(f){
  if(!f.due)return'ok';
  const d=daysBetween(f.due,todayStr());
  if(d<=0)return'ok';if(d<=7)return'd7';if(d<=30)return'd30';return'd90';
}
function rFinance(){
  const F=finSummary(),ops=finOpsX();
  const tab=state.fTab||'sheet';
  const tabs=`<div class="subnav-tabs">${F_TABS.map(([k,l])=>`<button class="${tab===k?'on':''}" onclick="setFTab('${k}')">${l}</button>`).join('')}</div>`;
  const kpis=`<div class="grid kpis" style="margin-bottom:14px">
    <div class="card kpi ok"><div class="lab">本期经营流入（10月）</div><div class="val">${fmt(ops.inflow)}</div><div class="sub">02 收款流水合计 · 流出 ${fmt(ops.outflow)}</div></div>
    <div class="card kpi ${ops.net>=0?'ok':''}"><div class="lab">经营净现金流</div><div class="val" style="color:${ops.net>=0?'var(--green)':'var(--red)'}">${ops.net>=0?'+':''}${fmt(ops.net)}</div><div class="sub">流入 − 流出 · 连续 2 月为负预警</div></div>
    <div class="card kpi ${ops.recvOverRate>20?'':''}"><div class="lab">应收余额</div><div class="val">${fmt(ops.recvBal)}</div><div class="sub">逾期 <b style="color:var(--red)">${fmt(ops.recvOverSum)}</b> · 逾期率 ${ops.recvOverRate}%（&gt;20% 预警）</div></div>
    <div class="card kpi"><div class="lab">应付余额</div><div class="val">${fmt(ops.payBal)}</div><div class="sub">${ops.payOver.length} 笔已逾期需优先排付</div></div>
    <div class="card kpi"><div class="lab">可用资金 / 安全垫</div><div class="val">${fmt(ops.avail)}</div><div class="sub">现金安全垫 ${ops.safety.toFixed(1)} 个月（&lt;3 预警）</div></div></div>`;
  let body='';
  /* -- 01+02 收款流水 + 付款流水 → 进出一张表主表 -- */
  if(tab==='sheet'){
    const rows=[...S.flowsIn.map(f=>({d:f.date,io:'in',who:f.client,contract:f.contract,cat:f.kind,amt:f.amount,method:f.method,note:f.note,id:f.id})),
                ...S.flowsOut.map(f=>({d:f.date,io:'out',who:f.vendor,contract:f.contract,cat:f.cat,amt:f.amount,method:f.method,note:(f.invOk==='否'?'⚠未取得发票 · ':'')+f.note,id:f.id}))]
               .sort((a,b)=>b.d.localeCompare(a.d));
    const mIn=S.flowsIn.filter(f=>f.date.startsWith('2026-09')).reduce((s,f)=>s+f.amount,0);
    body=`<div class="card"><div class="hd"><h3>进出一张表（收款流水 + 付款流水，按时间倒序）</h3><span class="tag green" style="margin-left:auto">数据源：子表 01 收款流水 + 02 付款流水</span></div><div class="bd" style="padding:0;overflow-x:auto"><table><thead><tr>
    ${['日期','收支','对方（客户 / 收款方）','项目 / 合同编号','款项 / 类别','金额','方式 / 发票','备注'].map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>
    ${rows.map(f=>`<tr id="${f.id}"><td class="money">${f.d}</td>
    <td><span class="tag ${f.io==='in'?'green':'orange'}">${f.io==='in'?'进':'出'}</span></td>
    <td><b>${f.who}</b></td><td class="money" style="font-size:12px">${f.contract}</td>
    <td>${f.cat}</td>
    <td class="money ${f.io==='in'?'green':''}"><b>${f.io==='in'?'+':'−'}${fmt(f.amt)}</b></td>
    <td style="font-size:12px;color:var(--muted)">${f.method}</td>
    <td style="font-size:12px;color:${f.note&&f.note.startsWith('⚠')?'var(--red)':'var(--muted)'}">${f.note||'—'}</td></tr>`).join('')}
    </tbody></table></div></div>
    <div class="card" style="margin-top:14px"><div class="bd"><b style="font-size:13px">口径说明（09 指标口径）</b><div class="risk-note">· 金额单位：元；本期经营流入 = 01 号表本期收款合计；本期经营流出 = 02 号表本期付款合计；经营净现金流 = 流入 − 流出（连续 2 月为负预警）<br>· 「云启软件 24.5 万分包款发票未取得」已标红——付款台账同步提醒补票<br>· 本页 P0 数据每周由银行流水 / 收款单据 / 付款申请单更新</div></div></div>`;
  }
  /* -- 回款批次（交付项目管理中心真实数据 · 快照 2026-10-23） -- */
  else if(tab==='batch'){
    body=`<div class="card"><div class="hd"><h3>回款批次 · 进出一张表（真实快照 2026-10-23）</h3><span class="tag green" style="margin-left:auto">收入侧 = 交付项目管理中心回款批次表</span></div><div class="bd" style="padding:0;overflow-x:auto"><table><thead><tr>
    ${['日期','收支','关联项目','批次 / 款项','金额','状态','合同触发条件','绑定里程碑 / 备注'].map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>
    ${[...S.finance].sort((a,b)=>b.date.localeCompare(a.date)).map(f=>{
      const over=f.kind==='应收'&&f.due&&daysBetween(f.due,todayStr())>0;
      const dueSoon=f.kind==='应付'&&f.due&&daysBetween(f.due,todayStr())>=0&&daysBetween(f.due,todayStr())<=2;
      const stCls=f.kind==='已收'||f.kind==='已付'?'gray':f.kind==='待核对'?'orange':f.kind==='未触发'?'blue':over?'red':dueSoon?'orange':'blue';
      return `<tr id="${f.id}"><td class="money">${f.date}</td>
      <td><span class="tag ${f.type==='in'?'green':'orange'}">${f.type==='in'?'进':'出'}</span></td>
      <td>${f.project?`<a style="color:var(--primary);cursor:pointer" onclick="nav('projects','${f.project}')">${f.project}</a>`:'<span style="color:var(--muted)">公共</span>'}</td>
      <td>${f.item.replace(/^P2026-\d+\s*/,'')}</td>
      <td class="money ${over?'red':f.type==='in'?'green':''}"><b>${f.type==='in'?'+':'−'}${fmt(f.amount)}</b></td>
      <td><span class="tag ${stCls}">${f.kind}${over?' · 逾期'+daysBetween(f.due,todayStr())+'天':''}${dueSoon?' · 即将到期':''}</span></td>
      <td style="font-size:12px;color:#42506b;max-width:210px">${f.trig||'—'}</td>
      <td style="font-size:12px;max-width:230px">${f.ms?`<span class="tag blue" style="margin:1px">${f.ms}</span> `:''}<span style="color:var(--muted)">${f.note||''}</span></td></tr>`;
    }).join('')}</tbody></table></div></div>
    <div class="card" style="margin-top:14px"><div class="bd"><b style="font-size:13px">⚠️ 口径与敏感数据提示</b><div class="risk-note">· 收入侧 29 个批次全部来自《交付项目管理中心》回款批次表（快照 2026-10-23）；快照中「已拆分批次合计 ¥8,565,000、已回款 ¥1,175,000（14%）」，个别项目批次拆分不全处已按差额推算并标注<br>· 状态口径：<b>已收</b>＝已到账；<b>待核对</b>＝批次已定、开票/回款状态待与合同核对；<b>未触发</b>＝合同触发条件尚未达成（多与里程碑绑定）<br>· 支出侧为估算演示数据；财务明细仅「老板 / 管理层」可见，员工访问被权限 v0 拦截并留痕</div></div></div>`;
  }
  /* -- 现金流滚动预测（未来 8 周：应收到账 − 应付到期 − 固定支出） -- */
  else if(tab==='forecast'){
    const W=8,dstr=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
    const t0=new Date(todayStr()+'T00:00:00');
    const wk=Array.from({length:W},(_,i)=>{const s=new Date(t0);s.setDate(s.getDate()+i*7);const e=new Date(s);e.setDate(e.getDate()+6);
      return {s:dstr(s),e:dstr(e),in:0,out:0,ins:[],outs:[]};});
    const wkOf=d=>{const diff=Math.floor((new Date(d+'T00:00:00')-t0)/86400000);return diff<0?0:Math.min(W-1,Math.floor(diff/7));};
    ops.recvOpen.forEach(r=>{const a=r.promise||r.due;const k=wkOf(a);wk[k].in+=r.amount-r.paid;wk[k].ins.push(r.client+' '+fmt(r.amount-r.paid));});
    ops.payOpen.forEach(r=>{const a=r.plan||r.due;const k=wkOf(a);wk[k].out+=r.amount-r.paid;wk[k].outs.push(r.vendor+' '+fmt(r.amount-r.paid));});
    const fixedW=Math.round(ops.fixedM/4.3);
    wk.forEach(w=>w.out+=fixedW);
    let bal=ops.avail;wk.forEach(w=>{w.net=w.in-w.out;w.end=bal+w.net;bal=w.end;});
    const totIn=wk.reduce((s,w)=>s+w.in,0),totOut=wk.reduce((s,w)=>s+w.out,0);
    const worst=wk.reduce((a,b)=>b.end<a.end?b:a);
    const overdueIn=ops.recvOver.reduce((s,r)=>s+(r.amount-r.paid),0);
    body=`<div class="grid kpis" style="margin-bottom:14px">
    <div class="card kpi ok"><div class="lab">期初可用资金</div><div class="val">${fmt(ops.avail)}</div><div class="sub">非受限账户期末余额</div></div>
    <div class="card kpi"><div class="lab">8 周预计流入</div><div class="val" style="color:var(--green)">+${fmt(totIn)}</div><div class="sub">${ops.recvOpen.length} 笔应收 · 已逾期挂账 ${fmt(overdueIn)} 按承诺日计入</div></div>
    <div class="card kpi"><div class="lab">8 周预计流出</div><div class="val" style="color:var(--red)">−${fmt(totOut)}</div><div class="sub">应付 ${fmt(ops.payBal)} + 固定支出每周 ${fmt(fixedW)}</div></div>
    <div class="card kpi ${worst.end<0?'':''}"><div class="lab">8 周内最低现金点</div><div class="val" style="color:${worst.end<0?'var(--red)':worst.end<ops.fixedM?'var(--orange)':'var(--green)'}">${fmt(worst.end)}</div><div class="sub">出现在 ${worst.s.slice(5)}~${worst.e.slice(5)} · ${worst.end<0?'⚠ 现金断裂，需提前筹资':worst.end<ops.fixedM?'⚠ 低于 1 个月固定支出':'安全'}</div></div></div>
    <div class="card"><div class="hd"><h3>未来 8 周现金流滚动预测（每周一自动刷新）</h3><span class="tag blue" style="margin-left:auto">流入按承诺回款日 · 流出按计划付款日 + 固定支出</span></div><div class="bd" style="padding:0;overflow-x:auto"><table><thead><tr>
    ${['周区间','预计流入','流入构成','预计流出','流出构成','当周净额','期末现金','状态'].map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>
    ${wk.map((w,i)=>{const st=w.end<0?'red':w.end<ops.fixedM?'orange':'green';
      return `<tr><td style="font-size:12px">${i===0?'本周':i===1?'下周':'第'+(i+1)+'周'}<br><span style="font-size:11px;color:var(--muted)">${w.s.slice(5)}~${w.e.slice(5)}</span></td>
      <td class="money green"><b>+${fmt(w.in)}</b></td>
      <td style="font-size:11.5px;color:var(--muted);max-width:180px">${w.ins.join('<br>')||'—'}</td>
      <td class="money"><b>−${fmt(w.out)}</b></td>
      <td style="font-size:11.5px;color:var(--muted);max-width:180px">${w.outs.join('<br>')||'固定支出 '+fmt(fixedW)}</td>
      <td class="money ${w.net>=0?'green':'red'}">${w.net>=0?'+':''}${fmt(w.net)}</td>
      <td class="money" style="font-size:14px"><b style="color:${st==='red'?'var(--red)':st==='orange'?'var(--orange)':'var(--green)'}">${fmt(w.end)}</b></td>
      <td><span class="tag ${st}">${st==='red'?'⚠ 缺口':st==='orange'?'偏紧':'安全'}</span></td></tr>`;
    }).join('')}</tbody></table></div></div>
    <div class="card" style="margin-top:14px"><div class="bd"><b style="font-size:13px">怎么用这张表（防"猝死"第一张图）</b><div class="risk-note">· 老板每周一扫一眼：<b>期末现金是否转负、哪一周最紧</b>。出现缺口周的三个动作：①把最大应收（如城建 ¥168 万）谈判提前回款 ②与供应商（云启 ¥24.5 万）协商分期 ③启用授信额度<br>· 口径：流入 = 应收台账「承诺回款日」（未承诺按约定到期日，已逾期计入第 1 周）；流出 = 应付「计划付款日」（未计划按到期日）+ 月固定支出（薪酬+房租+税费）÷ 4.3<br>· 预测是<b>先行指标</b>：逾期率、DSO 变化会直接改写这张表——先看预测、再定动作</div></div></div>`;
  }
  /* -- 03 应收台账（账龄 1-30 黄 / 31-60 橙 / 60+ 红 + 催收动作） -- */
  else if(tab==='recv'){
    const open=S.recv.filter(r=>r.amount>r.paid);
    const zone=r=>{const d=daysBetween(r.due,todayStr());return d>60?'60天以上':d>30?'31-60天':d>0?'1-30天':'未逾期';};
    const cls=r=>{const d=daysBetween(r.due,todayStr());return d>60?'red':d>30?'red':d>0?'orange':'blue';};
    const sumZ=z=>open.filter(r=>zone(r)===z).reduce((s,r)=>s+(r.amount-r.paid),0);
    body=`<div class="card"><div class="hd"><h3>应收账龄分析（03 应收台账 · 逾期天数自动按今天计算）</h3><span class="tag gray" style="margin-left:auto">应收余额 ${fmt(ops.recvBal)} · ${open.length} 笔未结清</span></div><div class="bd">
    <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(150px,1fr))">
    ${[['未逾期',sumZ('未逾期'),'var(--green)','var(--green-soft)'],['1-30 天',sumZ('1-30天'),'#B7791F','#FCF6E8'],['31-60 天',sumZ('31-60天'),'#DE8A26','#FCF2E3'],['60 天以上',sumZ('60天以上'),'var(--red)','var(--red-soft)']].map(([lab,v,c,bg])=>`
      <div style="background:${bg};border-radius:10px;padding:13px 15px">
      <div style="font-size:12px;color:var(--muted)">${lab}</div>
      <div style="font-size:19px;font-weight:700;color:${c};margin-top:4px" class="money">${fmt(v)}</div></div>`).join('')}
    </div>
    <div class="risk-note">应收逾期率 <b style="color:${ops.recvOverRate>35?'var(--red)':ops.recvOverRate>20?'var(--orange)':'var(--green)'}">${ops.recvOverRate}%</b>（&gt;20% 预警、&gt;35% 危险）· 逾期金额 ${fmt(ops.recvOverSum)} · 金额加权平均逾期 <b>${ops.avgOd}</b> 天（&gt;45 天危险）</div>
    </div></div>
    <div class="card" style="margin-top:14px"><div class="hd"><h3>发票状态拆分（已开票 vs 未开票，处置动作完全不同）</h3></div><div class="bd">
    <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(220px,1fr))">
      <div style="background:var(--primary-soft);border-radius:10px;padding:13px 15px">
        <div style="font-size:12px;color:var(--muted)">已开票未回款 · <b>${ops.invDone.length} 笔</b></div>
        <div style="font-size:19px;font-weight:700;color:var(--primary);margin-top:4px" class="money">${fmt(ops.invDoneSum)}</div>
        <div style="font-size:11.5px;color:var(--muted);margin-top:2px">客户侧问题 → 按账龄催收（律师函 / 谈判）</div></div>
      <div style="background:#FCF6E8;border-radius:10px;padding:13px 15px">
        <div style="font-size:12px;color:var(--muted)">未开票 · <b>${ops.invWait.length} 笔</b></div>
        <div style="font-size:19px;font-weight:700;color:#B7791F;margin-top:4px" class="money">${fmt(ops.invWaitSum)}</div>
        <div style="font-size:11.5px;color:var(--muted);margin-top:2px">内部侧问题 → 验收通过后 3 日内开票，晚开一天晚收一天</div></div>
    </div></div></div>
    <div class="card" style="margin-top:14px"><div class="hd"><h3>应收明细（按逾期天数降序）</h3></div><div class="bd" style="padding:0;overflow-x:auto"><table><thead><tr>
    ${['客户 / 合同','开票 / 发票号','应收','已收','未收余额','到期日','逾期','区间','责任人','催收状态','下一步动作','承诺回款日'].map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>
    ${[...S.recv].sort((a,b)=>daysBetween(b.due,todayStr())-daysBetween(a.due,todayStr())).map(r=>{
      const od=daysBetween(r.due,todayStr()),bal=r.amount-r.paid,done=bal<=0,uninv=!r.invNo||r.invNo==='—';
      return `<tr id="${r.id}" style="${od>60&&!done?'background:var(--red-soft)':''}"><td><b>${r.client}</b><br><span style="font-size:11.5px;color:var(--muted)">${r.contract} · 合同 ${fmt(r.contractAmt)}</span></td>
      <td class="money" style="font-size:11.5px">${uninv?'<span class="tag red">未开票</span>':r.invDate+'<br>'+r.invNo}</td>
      <td class="money">${fmt(r.amount)}</td><td class="money green">${fmt(r.paid)}</td>
      <td class="money"><b>${fmt(bal)}</b></td>
      <td class="money" style="font-size:12px">${fmtD(r.due)}</td>
      <td style="font-size:12.5px;font-weight:700;color:${od>0&&bal>0?'var(--red)':'var(--muted)'}">${done?'—':od>0?od+' 天':'未到期'}</td>
      <td><span class="tag ${done?'gray':cls(r)}">${done?'已结清':zone(r)}</span></td>
      <td style="font-size:12px">${r.owner}</td>
      <td style="font-size:12px">${r.status}</td>
      <td style="font-size:12px;color:#42506b;max-width:170px">${r.next}</td>
      <td class="money" style="font-size:12px">${r.promise||'—'}</td></tr>`;
    }).join('')}</tbody></table></div></div>
    <div class="card" style="margin-top:14px"><div class="bd"><b style="font-size:13px">口径说明</b><div class="risk-note">· 按「单笔开票记录一行」，未结清的全都在——账龄按开票日/约定到期日算到今天<br>· 催收升级路径：未到期（到期前 3 天提醒）→ 1-30 天（电话催收+对账单）→ 31-60 天（律师函/上门谈判）→ 60 天以上（诉讼准备）<br>· <b>发票拆分口径</b>：未开票的应收是自己的管理问题（赶开票），已开票逾期是客户的问题（催收/法务）——两类问题处置动作完全不同，不能混在一栏</div></div></div>`;
  }
  /* -- 04 应付台账（未来 4 周到期 + 付款优先级） -- */
  else if(tab==='pay'){
    const open=[...ops.payOpen].sort((a,b)=>(a.due||'9999').localeCompare(b.due||'9999'));
    const dueSoon=open.filter(r=>{const d=daysBetween(r.due,todayStr());return d>=-7&&d<=28;});
    body=`<div class="card"><div class="hd"><h3>⏰ 未来 4 周到期应付（排付款计划、防现金撞车）</h3><span class="tag ${dueSoon.length?'orange':'gray'}" style="margin-left:auto">${fmt(dueSoon.reduce((s,r)=>s+(r.amount-r.paid),0))} · ${dueSoon.length} 笔</span></div><div class="bd">
    ${dueSoon.length?dueSoon.map(r=>{const d=daysBetween(r.due,todayStr());
      return `<div class="alert-item"><div class="aico" style="background:${d<0?'var(--red-soft)':'#FCF2E3'};color:${d<0?'var(--red)':'var(--orange)'}">💸</div>
      <div style="flex:1"><div class="t">${r.vendor} · 未付 ${fmt(r.amount-r.paid)} <span class="tag ${r.prio==='高'?'red':r.prio==='中'?'orange':'gray'}" style="margin-left:6px">${r.prio}优先</span></div>
      <div class="d">到期 ${fmtD(r.due)}（${d<0?'<b style="color:var(--red)">已逾期 '+(-d)+' 天</b>':'还剩 '+d+' 天'}）· 计划付款 ${r.plan||'待定'} · ${r.note||''}</div></div></div>`;}).join(''):'<div class="empty">未来 4 周无到期应付款</div>'}
    </div></div>
    <div class="card" style="margin-top:14px"><div class="hd"><h3>应付明细（按到期日升序）</h3><span class="tag gray" style="margin-left:auto">应付余额 ${fmt(ops.payBal)}</span></div><div class="bd" style="padding:0;overflow-x:auto"><table><thead><tr>
    ${['供应商 / 合同','应付','已付','未付余额','账期','到期日','逾期','优先级','计划付款','备注'].map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>
    ${[...S.payable].sort((a,b)=>(a.due||'9999').localeCompare(b.due||'9999')).map(r=>{
      const bal=r.amount-r.paid,d=daysBetween(r.due,todayStr());
      return `<tr id="${r.id}"><td><b>${r.vendor}</b><br><span style="font-size:11.5px;color:var(--muted)">${r.contract}</span></td>
      <td class="money">${fmt(r.amount)}</td><td class="money green">${fmt(r.paid)}</td>
      <td class="money"><b>${fmt(bal)}</b></td><td class="money" style="font-size:12px">${r.term}天</td>
      <td class="money" style="font-size:12px">${fmtD(r.due)}</td>
      <td style="font-size:12.5px;font-weight:${d>0&&bal>0?'700':'400'};color:${d>0&&bal>0?'var(--red)':'var(--muted)'}">${bal<=0?'—':d>0?d+' 天':'未到期'}</td>
      <td><span class="tag ${r.prio==='高'?'red':r.prio==='中'?'orange':'gray'}">${r.prio}</span></td>
      <td class="money" style="font-size:12px">${r.plan||'—'}</td>
      <td style="font-size:12px;color:var(--muted)">${r.note||''}</td></tr>`;
    }).join('')}</tbody></table></div></div>`;
  }
  /* -- 05 合同订单（Backlog · 在手订单与未确认收入） -- */
  else if(tab==='orders'){
    body=`<div class="card"><div class="hd"><h3>合同订单台账（Backlog · 未来营收唯一领先指标）</h3><span class="tag blue" style="margin-left:auto">在手合同 ${fmt(S.orders.reduce((s,o)=>s+o.amount,0))} · 未确认收入 ${fmt(ops.unconfirmed)}</span></div><div class="bd" style="padding:0;overflow-x:auto"><table><thead><tr>
    ${['合同 / 客户 / 项目','合同金额','签约','服务期','已确认收入','未确认','预计确认','状态','备注'].map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>
    ${S.orders.map(o=>{const un=o.amount-o.recognized;
      return `<tr id="${o.id}"><td><b>${o.contract}</b> ${o.client}<br><span style="font-size:11.5px;color:var(--muted)">${o.name}</span></td>
      <td class="money"><b>${fmt(o.amount)}</b></td>
      <td class="money" style="font-size:12px">${fmtD(o.sign)}</td>
      <td class="money" style="font-size:11.5px">${o.from}<br>~ ${o.to}</td>
      <td class="money green">${fmt(o.recognized)}</td>
      <td class="money"><b>${fmt(un)}</b></td>
      <td><span class="tag blue">${o.expectMonth}</span></td>
      <td><span class="tag ${o.status==='执行中'?'green':o.status==='待验收'?'orange':'gray'}">${o.status}</span></td>
      <td style="font-size:12px;color:${(o.note||'').includes('滞后')||(o.note||'').includes('争议')?'var(--red)':'var(--muted)'}">${o.note||'—'}</td></tr>`;
    }).join('')}</tbody></table></div></div>
    <div class="card" style="margin-top:14px"><div class="bd"><b style="font-size:13px">怎么看这张表</b><div class="risk-note">· 未确认收入合计 <b>${fmt(ops.unconfirmed)}</b>——未来营收的蓄水池，每月更新一次<br>· 城建集团「回款严重滞后」、星海医药「验收存在争议」已标红，直接影响现金流入<br>· 各表客户/合同编号以本表为唯一来源，写法必须一致</div></div></div>`;
  }
  /* -- 06 项目成本（单项目盈亏 · 毛利率） -- */
  else if(tab==='cost'){
    const byContract={};ops.costRows.forEach(c=>{const k=byContract[c.contract]=byContract[c.contract]||{client:c.client,rev:0,cost:0};k.rev+=c.revenue;k.cost+=c.cost;});
    body=`<div class="card"><div class="hd"><h3>项目成本归集（按月 · 谁赚钱谁赔钱）</h3><span class="tag green" style="margin-left:auto">数据源：06 项目成本</span></div><div class="bd" style="padding:0;overflow-x:auto"><table><thead><tr>
    ${['月份','项目 / 客户','投入','工时','人工成本','外包','差旅及其他','成本合计','确认收入','项目毛利','毛利率'].map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>
    ${ops.costRows.map(c=>`<tr id="${c.id}"><td class="money" style="font-size:12px">${c.month}</td>
    <td><b>${c.contract}</b><br><span style="font-size:11.5px;color:var(--muted)">${c.client}</span></td>
    <td style="font-size:12px">${c.heads}人</td><td class="money" style="font-size:12px">${fmt(c.hours)}h</td>
    <td class="money">${fmt(c.labor)}</td><td class="money">${fmt(c.outs)}</td><td class="money">${fmt(c.travel)}</td>
    <td class="money"><b>${fmt(c.cost)}</b></td><td class="money green">${fmt(c.revenue)}</td>
    <td class="money ${c.gm>=0?'green':'red'}"><b>${fmt(c.gm)}</b></td>
    <td><span class="tag ${c.rate>=0.35?'green':c.rate>=0.25?'orange':'red'}">${(c.rate*100).toFixed(1)}%</span></td></tr>`).join('')}
    </tbody></table></div></div>
    <div class="card" style="margin-top:14px"><div class="hd"><h3>项目累计盈亏（全部月份合计，毛利 = 确认收入 − 成本合计）</h3></div><div class="bd">
    ${Object.entries(byContract).map(([k,v])=>{const gm=v.rev-v.cost;
      return finBar(k+' · '+v.client,gm,v.rev,gm>=0?'var(--green)':'var(--red)');}).join('<div style="height:8px"></div>')}
    <div class="risk-note">2026-07 / 08 月为演示补齐的历史数据（用于驾驶舱毛利趋势线）。综合毛利率：9 月 <b>${(ops.gmRate9*100).toFixed(1)}%</b> → 10 月 <b style="color:${ops.gmRate10>=ops.gmRate9?'var(--green)':'var(--red)'}">${(ops.gmRate10*100).toFixed(1)}%</b>（环比下降 &gt;1.5pt 预警）</div>
    </div></div>`;
  }
  /* -- 07 费用预算（执行率 · 超支标红） -- */
  else if(tab==='budget'){
    const totB=S.budget.reduce((s,b)=>s+b.budget,0),totA=S.budget.reduce((s,b)=>s+b.actual,0);
    body=`<div class="card"><div class="hd"><h3>费用预算执行（2026-10 · 超支标红）</h3><span class="tag ${totA>totB?'red':'green'}" style="margin-left:auto">预算 ${fmt(totB)} · 实际 ${fmt(totA)} · 执行率 ${(totA/totB*100).toFixed(0)}%</span></div><div class="bd" style="padding:0;overflow-x:auto"><table><thead><tr>
    ${['部门','费用科目','预算','实际','差异','执行率','说明'].map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>
    ${[...S.budget].sort((a,b)=>(b.actual/b.budget)-(a.actual/a.budget)).map(b=>{const d=b.actual-b.budget,rate=b.actual/b.budget;
      return `<tr id="${b.id}" style="${rate>1.1?'background:var(--red-soft)':''}"><td>${b.dept}</td><td><b>${b.item}</b></td>
      <td class="money">${fmt(b.budget)}</td><td class="money">${fmt(b.actual)}</td>
      <td class="money" style="color:${d>0?'var(--red)':'var(--green)'}">${d>0?'+':''}${fmt(d)}</td>
      <td><span class="tag ${rate>1.1?'red':rate>1?'orange':'green'}">${(rate*100).toFixed(0)}%</span></td>
      <td style="font-size:12px;color:var(--muted)">${b.note||'—'}</td></tr>`;
    }).join('')}</tbody></table></div></div>
    <div class="card" style="margin-top:14px"><div class="bd"><b style="font-size:13px">预警口径</b><div class="risk-note">执行率 &gt;110% 标红（业务招待费 145%、差旅费 117% 两项超支）；&gt;100% 橙色提示。目的：提前一个月发现问题，而不是年底才发现。</div></div></div>`;
  }
  /* -- 08 资金账户（可用资金 · 受限资金） -- */
  else if(tab==='acct'){
    const totEnd=S.accts.reduce((s,a)=>s+a.end,0);
    body=`<div class="card"><div class="hd"><h3>资金账户余额（真实可用资金）</h3><span class="tag blue" style="margin-left:auto">期末合计 ${fmt(totEnd)} · 可用 ${fmt(ops.avail)}</span></div><div class="bd" style="padding:0;overflow-x:auto"><table><thead><tr>
    ${['账户 / 开户行','类型','期初余额','本期流入','本期流出','期末余额','受限','备注'].map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>
    ${S.accts.map(a=>`<tr id="${a.id}"><td><b>${a.name}</b>（${a.bank} ${a.last4}）</td>
    <td><span class="tag ${a.restricted?'red':'blue'}">${a.type}</span></td>
    <td class="money">${fmt(a.open)}</td><td class="money green">${fmt(a.fin)}</td><td class="money">${fmt(a.fout)}</td>
    <td class="money"><b>${fmt(a.end)}</b></td>
    <td>${a.restricted?'<span class="tag red">受限 · 不可动用</span>':'<span class="tag green">否</span>'}</td>
    <td style="font-size:12px;color:var(--muted)">${a.note||'—'}</td></tr>`).join('')}
    </tbody></table></div></div>
    <div class="card" style="margin-top:14px"><div class="bd"><b style="font-size:13px">现金安全垫</b><div class="risk-note">可用资金 <b>${fmt(ops.avail)}</b>（已剔除保证金专户 38 万受限资金）÷ 月固定支出 ${fmt(ops.fixedM)}（薪酬+房租+税费）= <b style="color:${ops.safety<3?'var(--red)':'var(--green)'}">${ops.safety.toFixed(1)} 个月</b>安全垫（&lt;3 个月预警）。</div></div></div>`;
  }
  /* -- 经营汇总（09 指标口径 · 全部 KPI 汇总核对） -- */
  else if(tab==='sum'){
    const rows=[
      ['本期经营流入','现金',fmt(ops.inflow),'01 收款流水 · 本期合计','—'],
      ['本期经营流出','现金',fmt(ops.outflow),'02 付款流水 · 本期合计','—'],
      ['经营净现金流','现金',(ops.net>=0?'+':'')+fmt(ops.net),'流入 − 流出','连续 2 月为负'],
      ['应收余额','应收',fmt(ops.recvBal),'03 应收台账 · 未收余额合计','—'],
      ['逾期金额','应收',fmt(ops.recvOverSum),'03 · 逾期天数&gt;0 的未收余额','—'],
      ['应收逾期率','应收',ops.recvOverRate+'%','逾期金额 ÷ 应收余额','&gt;20% 预警 · &gt;35% 危险'],
      ['应收周转天数 DSO','应收',ops.dso10+' 天','应收余额 ÷ 本期确认收入 × 30','环比拉长 &gt;15 天预警'],
      ['平均逾期天数','应收',ops.avgOd+' 天','Σ(逾期额×逾期天数) ÷ 逾期额（金额加权）','&gt;45 天危险'],
      ['已开票未回款 / 未开票','应收',fmt(ops.invDoneSum)+' / '+fmt(ops.invWaitSum),'03 应收台账按发票号拆分','未开票部分为内部管理问题'],
      ['应付余额','应付',fmt(ops.payBal),'04 应付台账 · 未付余额合计','—'],
      ['可用资金','现金',fmt(ops.avail),'08 资金账户 · 非受限期末余额','—'],
      ['现金安全垫','现金',ops.safety.toFixed(1)+' 个月','可用资金 ÷ 月固定支出 '+fmt(ops.fixedM),'&lt;3 个月预警'],
      ['未确认收入','利润',fmt(ops.unconfirmed),'05 合同订单 · 合同额−已确认收入','在手订单蓄水池'],
      ['综合毛利率（10月）','利润',(ops.gmRate10*100).toFixed(1)+'%','06 项目成本 ·（确认收入−成本合计）÷确认收入','环比降&gt;1.5pt 预警'],
    ];
    body=`<div class="card"><div class="hd"><h3>经营指标总览（09 指标口径对照）</h3><span class="tag gray" style="margin-left:auto">全部由规则引擎实时计算 · 口径以子表 09 号表为准</span></div><div class="bd" style="padding:0;overflow-x:auto"><table><thead><tr>
    ${['指标','分类','当前值','计算口径 / 数据来源','预警阈值'].map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>
    ${rows.map(r=>`<tr><td><b>${r[0]}</b></td><td><span class="tag blue">${r[1]}</span></td>
    <td class="money" style="font-size:14px"><b>${r[2]}</b></td>
    <td style="font-size:12px;color:#42506b">${r[3]}</td>
    <td style="font-size:12px;color:var(--muted)">${r[4]}</td></tr>`).join('')}
    </tbody></table></div></div>
    <div class="card" style="margin-top:14px"><div class="hd"><h3>客户集中度分析（单一客户过高 = 经营命脉被人拿捏）</h3><span class="tag ${(()=>{const cs=clientStats();return cs.some(k=>k.cShare>=0.3)||cs.some(k=>k.overShare>=0.4)?'red':'green'})()}" style="margin-left:auto">${clientStats().length} 个客户</span></div><div class="bd" style="padding:0;overflow-x:auto"><table><thead><tr>
    ${['客户','在手合同','合同占比','应收余额','未确认收入','逾期金额','逾期占比','集中度信号'].map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>
    ${clientStats().map(k=>{
      const flags=[];
      if(k.cShare>=0.3)flags.push('<span class="tag red">合同占比 '+(k.cShare*100).toFixed(0)+'% ≥30%</span>');
      if(k.balShare>=0.3)flags.push('<span class="tag orange">应收占比 '+(k.balShare*100).toFixed(0)+'%</span>');
      if(k.overShare>=0.4)flags.push('<span class="tag red">占逾期 '+(k.overShare*100).toFixed(0)+'%</span>');
      return `<tr><td><b>${k.client}</b></td>
      <td class="money"><b>${fmt(k.contract)}</b></td>
      <td><div style="display:flex;align-items:center;gap:7px"><span class="bar-wrap"><span class="bar-fill" style="width:${Math.min(100,k.cShare*100).toFixed(0)}%;background:${k.cShare>=0.3?'var(--red)':'var(--primary)'};display:block"></span></span><span style="font-size:12px">${(k.cShare*100).toFixed(0)}%</span></div></td>
      <td class="money">${fmt(k.bal)}</td><td class="money">${fmt(k.unconf)}</td>
      <td class="money" style="color:${k.over>0?'var(--red)':'inherit'}">${k.over>0?fmt(k.over):'—'}</td>
      <td style="font-size:12px">${k.over>0?'<b style="color:var(--red)">'+(k.overShare*100).toFixed(0)+'%</b>':'—'}</td>
      <td style="max-width:200px">${flags.join(' ')||'<span class="tag green">正常</span>'}</td></tr>`;
    }).join('')}</tbody></table></div></div>
    <div class="card" style="margin-top:14px"><div class="bd"><b style="font-size:13px">客户集中度怎么看</b><div class="risk-note">· 阈值：单一客户<b>合同占比 ≥30%</b>、<b>应收占比 ≥30%</b>、<b>占逾期 ≥40%</b> 触发信号——市场教训是「低毛利大客户 + 长账期」最容易拖死小公司<br>· 当前最大风险客户一眼可见：城建集团既是第二大客户又占逾期近六成（¥168 万律师函中）——谈判筹码与现金流压力都在它身上<br>· 动作：对高占比客户做合同账期重谈；销售考核加「新客户占比」指标，防止越干越集中</div></div></div>
    <div class="card" style="margin-top:14px"><div class="bd"><b style="font-size:13px">数据来源对照（子表 00 填表说明）</b><div class="risk-note">· 01 收款流水 / 02 付款流水：银行流水、收付款单据 · 每周更新<br>· 03 应收台账 / 04 应付台账：开票记录+合同账期 / 采购合同+发票 · 每周更新（未结清的全都在）<br>· 05 合同订单：合同台账/CRM · 每月 ｜ 06 项目成本：工时+报表 · 每月 ｜ 07 费用预算：预算表+明细账 · 每月 ｜ 08 资金账户：银行对账单 · 每周<br>· 当前数据为子表 v1.0 数据样表（2026-11-04），正式填报真实流水后自动替换</div></div></div>`;
  }
  return kpis+`<div class="card" style="margin-bottom:14px"><div class="hd"><h3>财 · 进出一张表</h3>${tabs}</div></div>`+body;
}

/* ---- 哨兵 ---- */
function rSentinel(){
  const al=allAlerts().sort((a,b)=>(a.sev==='high'?0:1)-(b.sev==='high'?0:1));
  return `<div class="card"><div class="hd"><h3>六条规则 · 全自动巡检（无需人工盯）</h3></div><div class="bd" style="border-bottom:1px solid var(--line)">
    <span class="tag red">① 里程碑逾期</span> <span class="tag red">② 应收逾期</span> <span class="tag orange">③ 周报缺失</span> <span class="tag orange">④ 客户集中</span> <span class="tag red">⑤ 任务超时</span> <span class="tag red">⑥ AI 代发待确认</span>
    <span style="font-size:12.5px;color:var(--muted);margin-left:10px">命中 ${al.filter(a=>a.sev==='high').length} 条高危 / ${al.length} 条总数 · 每天 09:00 自动推送</span>
  </div><div class="bd">${al.map(alertHtml).join('')||'<div class="empty">哨兵未触发任何提醒，一切正常 🎉</div>'}</div></div>
  <div class="card" style="margin-top:14px"><div class="bd"><b style="font-size:13px">为什么哨兵优先做？</b><div class="risk-note">会上明确的失败模式是"装完就忘"。<b>主动推送</b>比被动问答更保命：逾期不等你来问，系统先开口。这 ${al.length} 条提醒全部由规则引擎产生，不经过 LLM 判断，零幻觉。<br>⑤⑥ 是 PRD 新增的两条：任务派出去没人回执、AI 写好回复等你点头——这两件事如果沉在列表里，闭环就断了。</div></div></div>`;
}

/* ---- 老板问答 ---- */
const QUICK_QS=['这个月赚了多少？','年度目标完成多少？','下月预计签约多少？','生成老板周报','谁走了项目会瘫痪？','今天该处理哪三件事？','有哪些消息要我回？','任务谁还没回执？','客户集中度怎么样？','应收逾期有哪些？','现金流情况怎么样？','哪些项目有延期风险？','谁没交周报？','张一鸣最近状态怎么样？','团队饱和度如何？','本月支出大头是什么？','应付有哪些快到期？','新签了几个项目？','有没有人可以接新活？','数据准不准？','Token 用量怎么样？','朋友圈该维护谁？','怎么导入Excel数据？'];
function rAsk(){
  const chat=state.chat.map((m,i)=>{
    if(m.role==='q')return `<div class="bubble q">${m.text}</div>`;
    const evi=(m.evi&&m.evi.length)
      ?`<div class="evi"><div class="evi-title">📎 原始依据（点击可跳转核对）</div>${m.evi.map(e=>`<span class="evi-link" onclick="nav('${e.view}',\x27${e.id||''}\x27)">→ ${e.label}</span>`).join('')}</div>`
      :'';
    /* PRD 5.2：回答必须带动作，避免看完就忘 */
    const acts=m.dismissed?'<div class="disclaimer">已忽略这条建议</div>'
      :`<div class="msg-acts" style="border-top:1px dashed var(--line);padding-top:8px;margin-top:8px">
        <button class="btn sm primary" onclick="askDispatch(${i})">@ 派活</button>
        ${m.evi&&m.evi.length?`<button class="btn sm" onclick="nav('${m.evi[0].view}',\x27${m.evi[0].id||''}\x27)">查看详情</button>`:''}
        <button class="btn sm" onclick="dismissAnswer(${i})">忽略</button>
        <span style="font-size:11px;color:var(--muted);margin-left:auto">${m.follow?'可继续追问':'答不上来会被埋点记录'}</span>
      </div>`;
    return `<div class="bubble a">${m.text}${evi}${acts}<div class="disclaimer">答案由规则引擎从台账实时计算 · 生成时间 ${new Date().toLocaleTimeString('zh-CN',{hour12:false})} · 本次问答已留痕</div></div>`;
  }).join('');
  return `<div class="card" style="margin-bottom:14px"><div class="bd">
    <div style="font-size:13px;color:var(--muted);margin-bottom:12px">🎯 这是 30 天验收的题库入口：<b style="color:var(--text)">"20 问里 ≥12 问答对且能点到原始依据"</b>。算数交给规则引擎，解释话术才用 LLM——老板要的是"一句话给答案 + 给依据"。</div>
    <div class="qa-chips">${QUICK_QS.map(q=>`<span class="chip" onclick="askQ('${q.replace(/'/g,"\\'")}')">${q}</span>`).join('')}</div>
    <div class="qa-hero"><input id="qaInput" placeholder="像跟助理说话一样提问，回车发送…" onkeydown="if(event.key==='Enter')sendQ()"><button class="btn primary" onclick="sendQ()">提问</button></div>
  </div></div>
  <div class="card"><div class="bd" id="qaLog" style="min-height:200px;max-height:520px;overflow-y:auto">
    ${chat||'<div class="empty">👇 点上面的快捷问题，或直接输入您的任何问题</div>'}
  </div></div>`;
}
function sendQ(){const inp=document.getElementById('qaInput');if(inp&&inp.value.trim())askQ(inp.value.trim());}
function askQ(q){
  log('老板问答','提问：「'+q+'」');
  const a=buildAnswer(q);
  state.chat.push({role:'q',text:q},{role:'a',text:a.text,evi:a.evi,q});
  save();render();
  requestAnimationFrame(()=>{const el=document.getElementById('qaLog');if(el)el.scrollTop=el.scrollHeight;});
}
function askDispatch(i){
  const m=state.chat[i];if(!m)return;
  const t=(m.q||'').slice(0,22);
  openDispatch({title:'处理：'+t,from:'老板问答 · '+(m.q||'').slice(0,18),ctx:''});
}
function dismissAnswer(i){
  const m=state.chat[i];if(!m)return;
  m.dismissed=true;
  log('老板问答','忽略一条回答的处置建议：'+(m.q||'').slice(0,20));
  save();render();
}

/* ---- 一问一答采集 ---- */
function rCollect(){
  const miss=missingFields();
  const collected=Object.entries(S.qa);
  return `<div class="grid two-col">
  <div class="card"><div class="hd"><h3>🎙️ AI 主动问 · 您一句话答</h3><span class="tag blue" style="margin-left:auto">剩余 ${miss.length} 项</span></div><div class="bd">
    <div style="font-size:12.5px;color:var(--muted);margin-bottom:12px">不做填表。缺什么字段，AI 就问什么，答案自动落表、落留痕。</div>
    ${miss.length?(()=>{const m=miss[0];return `
      <div class="bubble a" style="max-width:100%"><b>助手：</b>${m.q}
        <div class="quick-btns">${m.hint.map(h=>`<button class="btn sm" onclick="answerCollect('${m.key}','${h.replace(/'/g,"\\'")}')">${h}</button>`).join('')}</div>
        <div class="collect-input"><input id="ci" placeholder="或输入自定义答案…" onkeydown="if(event.key==='Enter')answerCollectCustom('${m.key}')"><button class="btn primary" onclick="answerCollectCustom('${m.key}')">回答</button></div>
      </div>`;})()
    :'<div class="empty">🎉 缺失字段已全部补齐，台账完整</div>'}
  </div></div>
  <div class="card"><div class="hd"><h3>✅ 已采集 ${collected.length} 条</h3></div><div class="bd" style="max-height:420px;overflow-y:auto">
    ${collected.length?collected.map(([k,v])=>`<div style="padding:9px 0;border-bottom:1px dashed #f0f3f8"><div style="font-size:12.5px;color:var(--muted)">${v.q}</div><div style="font-size:13.5px;margin-top:3px"><b>${v.a}</b> <span style="font-size:11px;color:var(--muted)">（${v.at} 已落表留痕）</span></div></div>`).join(''):'<div class="empty">还没有采集记录，从左边开始</div>'}
  </div></div></div>`;
}
function answerCollect(key,val){
  const m=missingFields().find(x=>x.key===key);if(!m)return;
  S.qa[key]={q:m.q,a:val,at:new Date().toLocaleString('zh-CN',{hour12:false})};
  m.apply(val);
  log('一问一答采集','回答「'+m.q+'」→「'+val+'」，已落表');
  save();render();
}
function answerCollectCustom(key){const inp=document.getElementById('ci');if(inp&&inp.value.trim())answerCollect(key,inp.value.trim());}

/* ---- 需求埋点 ---- */
function rInsights(){
  const arr=Object.entries(S.stats).sort((a,b)=>b[1]-a[1]);
  const max=arr.length?arr[0][1]:1;
  return `<div class="card"><div class="hd"><h3>📈 每周自动汇总：被问最多的 Top10</h3><span class="tag purple" style="margin-left:auto">内置需求收集机制</span></div><div class="bd">
  ${arr.length?arr.map(([q,c],i)=>`<div style="display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px dashed #f0f3f8">
    <b style="width:22px;color:${i<3?'var(--purple)':'var(--muted)'}">${i+1}</b>
    <div style="flex:1;font-size:13.5px">${q}</div>
    <div style="width:140px"><span class="bar-wrap" style="width:100%"><span class="bar-fill" style="width:${c/max*100}%;background:var(--purple);display:block"></span></span></div>
    <span class="tag purple">${c} 次</span></div>`).join(''):'<div class="empty">暂无数据——去「老板问答」提几个超出规则库的问题，它们会自动出现在这里</div>'}
  <div class="risk-note">机制说明：答不上来的问题 ≠ 失败，而是<b>需求信号</b>。每周一自动汇总 Top10 给产品组排期，这就是"需求自动收集"的落地方。</div></div></div>`;
}

/* ---- 留痕 ---- */
function rAudit(){
  return `<div class="card"><div class="hd"><h3>🧾 全量留痕（谁问了什么 · 谁看了什么 · AI 做了什么）</h3><span class="tag gray" style="margin-left:auto">${S.audit.length} 条</span></div><div class="bd" style="padding:0">
  <table><thead><tr><th style="width:170px">时间</th><th style="width:90px">身份</th><th style="width:130px">动作</th><th>详情</th></tr></thead><tbody>
  ${S.audit.length?S.audit.map(a=>`<tr class="audit-row"><td class="money">${a.t}</td><td><span class="tag ${a.who==='老板'?'blue':a.who==='管理层'?'purple':'gray'}">${a.who}</span></td><td>${a.act}</td><td>${a.detail}</td></tr>`).join(''):'<tr><td colspan="4"><div class="empty">暂无留痕，进行任意操作后自动记录</div></td></tr>'}
  </tbody></table></div></div>`;
}

/* ---- 设置 ---- */
function rSettings(){
  const c=ROLE_CONF[state.role];
  return `<div class="grid two-col">
  <div class="card"><div class="hd"><h3>🔐 权限 v0 · 三级 + 字段白名单</h3></div><div class="bd">
    <table><thead><tr><th>能力 / 身份</th><th>老板</th><th>管理层</th><th>员工</th></tr></thead><tbody>
    ${[['总览驾驶舱','✓','✓','✓（脱敏）'],['消息流（微信/企微）','✓','✓','🔒'],['任务派活 / 回执','✓（全部）','✓（全部）','✓（仅自己）'],['项目台账','✓','✓','✓（限参与）'],['人员状态','✓','✓','✓（脱敏）'],['财务明细','✓','✓','🔒'],['薪资字段','✓','🔒','🔒'],['社交运营 / 朋友圈','✓','✓','🔒'],['AI 与 Token 管理','✓','✓','🔒'],['留痕日志','✓','✓','🔒'],['权限管理','✓','🔒','🔒']]
    .map(r=>`<tr><td>${r[0]}</td>${r.slice(1).map(x=>`<td>${x==='✓'?'<span class="tag green">✓</span>':x==='🔒'?'<span class="tag gray">🔒</span>':`<span style="font-size:12px;color:var(--muted)">${x}</span>`}`).join('')}</td></tr>`).join('')}
    </tbody></table>
    <div class="risk-note">当前身份：<b>${c.label}</b>。薪资、财务明细仅授权人可见；越权访问被拦截并留痕——这条来自会上原话："他不希望财务让别人知道，这个权限要管好"。</div>
  </div></div>
  <div class="card"><div class="hd"><h3>🗓 时间模式 · 逾期天数按哪个"今天"算</h3><span class="tag ${dateMode()==='real'?'green':'orange'}" style="margin-left:auto">${dateMode()==='real'?'真实日期':'演示冻结'}</span></div><div class="bd">
    <div style="font-size:12.5px;color:var(--muted);line-height:1.75">
      <b>演示模式</b>：时间冻结在数据基准日 <b>${DEMO_DATE}</b>——逾期天数、账龄、预测窗口不随真实日期漂移，适合演示与截图。<br>
      <b>真实模式</b>：以系统<b>今天（${localDateStr()}）</b>为基准——逾期天数每天自动拉长，随时暴露数据漂移问题。
    </div>
    <div style="margin-top:11px;display:flex;gap:9px;flex-wrap:wrap">
      <button class="btn ${dateMode()==='demo'?'primary':''}" onclick="setDateMode('demo')">演示模式（基准日 ${DEMO_DATE}）</button>
      <button class="btn ${dateMode()==='real'?'primary':''}" onclick="setDateMode('real')">真实模式（今天 ${localDateStr()}）</button>
    </div>
    <div class="risk-note">当前计算基准日 <b>${todayStr()}</b>。切换只影响时间敏感计算（逾期 / 账龄 / 预测窗口），不改动任何台账数据，且已留痕。</div>
  </div></div>
  <div class="card"><div class="hd"><h3>🗄️ 数据与形态说明</h3></div><div class="bd">
    <div style="font-size:13px;line-height:1.9">
    · 形态：<b>确定性工作流 + AI 节点</b>，不是多 Agent 全家桶<br>
    · 实现：1 总管 + 4 场景（消息 / 看板 / 派活 / 运营）+ 1 规则库 + 1 权限体系<br>
    · 算数走规则引擎（可核对），LLM 只做解释与话术生成<br>
    · 数据接入：<b>微信 / 企微账号授权读取 + Excel/CSV 导入 + 移动端极简录入</b>（PRD 6.1）；接入失败降级为手动转发<br>
    · 数据开放：内部全量、外部脱敏；支持「数据时间窗」配置（默认近两年）<br>
    · 数据存储于本机浏览器（localStorage），演示用
    </div>
    <div style="margin-top:14px;display:flex;gap:10px;flex-wrap:wrap">
      <button class="btn primary" onclick="nav('import')">📥 去数据导入（Excel/CSV）</button>
      <button class="btn" onclick="showWhatsNew()">✨ 重新显示 v1.3 更新说明</button>
      <button class="btn" onclick="if(confirm('确定恢复全部演示数据？当前采集/问答/留痕记录将被清空。'))resetData()">↺ 重置演示数据</button>
      <button class="btn" onclick="exportAudit()">⬇ 导出留痕 JSON</button>
    </div>
  </div></div></div>`;
}
function exportAudit(){
  const blob=new Blob([JSON.stringify(S.audit,null,2)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='留痕日志_'+todayStr()+'.json';a.click();
  log('数据导出','导出留痕日志 JSON');save();
}

/* =====================================================================
   P0-3：数据导入（Excel/CSV · 四张表）。数据可信度 45% 的根因是没入口，
   本页是"把数字变活"的路径：粘贴 / 上传 → 解析预览 → 确认落表 → 全自动重算
===================================================================== */
const IMPORT_SPECS=[
 {k:'projects',label:'项目台账',icon:'📋',drive:'驱动：项目台账 / 毛利盯梢 / 里程碑卡款 / 今日待处理',
  cols:[['id','项目编号','str'],['name','项目名称','str'],['client','客户','str'],['price','计价FP或TM','price'],['stage','阶段','str'],['contract','合同额','num'],['paid','已回款','num'],['manDays','累计人天','num'],['risk','风险等级','str']],
  sample:'项目编号,项目名称,客户,计价FP或TM,阶段,合同额,已回款,累计人天,风险等级\nP2026-002,业财二期PCR项目,锦航,FP,初始,130000,0,260,中等\nP2026-021,示例新项目,示例客户,FP,初始,300000,0,0,低',
  tip:'已有项目编号 = 更新该行（例：给 P2026-002 补 260 人天，导入后毛利盯梢立即生效）；新编号 = 新增项目。金额建议写纯数字；如含千分位逗号，请从 Excel 直接复制粘贴（Tab 分隔不受影响）或给金额加英文引号。里程碑 / 交付物等复杂结构导入后请在台账人工补充。'},
 {k:'flowsIn',label:'收款流水',icon:'💵',drive:'驱动：驾驶舱回款趋势 / 财·进出一张表 / 现金周走势',
  cols:[['id','流水号','str'],['date','到账日期','str'],['client','客户','str'],['contract','合同号','str'],['kind','款项类别','str'],['amount','金额','num'],['method','收款方式','str'],['invoice','发票号','str'],['note','备注','str']],
  sample:'流水号,到账日期,客户,合同号,款项类别,金额,收款方式,发票号,备注\nR7,2026-11-05,城建集团,HT-2025-007,进度款,800000,银行转账,FP20261105,谈判约定的先付 80 万\nR8,2026-11-08,华远集团,HT-2025-018,验收款,960000,银行转账,FP20260810,AR1 结清',
  tip:'日期格式 YYYY-MM-DD；同流水号 = 更新。导入后「财 · 进出一张表」与驾驶舱回款趋势线立即更新。'},
 {k:'recv',label:'应收台账',icon:'💸',drive:'驱动：应收账龄 / 逾期预警 / 现金流预测窗口',
  cols:[['id','编号','str'],['client','客户','str'],['contract','合同号','str'],['contractAmt','合同金额','num'],['invDate','开票日','str'],['invNo','发票号','str'],['amount','应收金额','num'],['paid','已收金额','num'],['term','账期天','num'],['due','约定到期日','str'],['owner','责任人','str'],['status','催收状态','str'],['next','下一步动作','str'],['promise','承诺回款日','str']],
  sample:'编号,客户,合同号,合同金额,开票日,发票号,应收金额,已收金额,账期天,约定到期日,责任人,催收状态,下一步动作,承诺回款日\nAR7,示例客户,HT-2026-030,500000,2026-10-20,FP20261020,500000,0,30,2026-11-19,李工,未到期,到期前 3 天自动提醒,2026-11-19\nAR2,城建集团,HT-2025-007,5200000,2026-08-20,FP20260821,1680000,800000,30,2026-09-19,王工,部分回款,跟踪剩余 88 万,2026-11-25',
  tip:'账期与到期日用于自动计算逾期 / 账龄 / 预测窗口；未开票的发票号填 — 。已收金额变化会自动反映到应收余额与逾期率。'},
 {k:'people',label:'人员名单',icon:'👥',drive:'驱动：饱和度 / 人员调配建议 / 人事风险预警',
  cols:[['id','编号','str'],['name','姓名','str'],['role','角色','str'],['on','在岗1或0','bool'],['sat','饱和度','num'],['salary','月薪','num'],['weekly','周报1或0','bool'],['projects','参与项目','arr']],
  sample:'编号,姓名,角色,在岗1或0,饱和度,月薪,周报1或0,参与项目\nE10,王小明,前端工程师,1,60,15000,1,P2026-001;P2026-002\nE3,王铁军,后端工程师,1,75,20000,1,P2026-006',
  tip:'在岗填 1、离职填 0；饱和度填数字（如 115）。月薪仅老板可见，导入后自动进入薪酬成本计算；参与项目用分号分隔，项目编号须与项目台账一致。'}
];
function impSpec(){ return IMPORT_SPECS.find(s=>s.k===((state.imp&&state.imp.k)||IMPORT_SPECS[0].k))||IMPORT_SPECS[0]; }
function setImpTab(k){
  const el=document.getElementById('impText');
  state.imp=state.imp||{texts:{}};
  if(el)state.imp.texts[impSpec().k]=el.value;
  state.imp.k=k; state.imp.parsed=null; state.imp.errs=null; render();
}
function impTextSet(v){ const s=impSpec(); state.imp=state.imp||{k:s.k,texts:{}}; state.imp.texts[s.k]=v; state.imp.parsed=null; state.imp.errs=null; render(); }
function impFile(inp){ const f=inp.files&&inp.files[0]; if(!f)return; const r=new FileReader();
  r.onload=e=>impTextSet(String(e.target.result)); r.readAsText(f,'utf8'); }
function splitCSVLine(line,sep){
  const out=[];let cur='',q=false;
  for(const ch of line){
    if(ch==='"'){q=!q;continue;}
    if(ch===sep&&!q){out.push(cur);cur='';continue;}
    cur+=ch;
  }
  out.push(cur);
  return out.map(c=>c.trim());
}
function parseCSV(text){
  const lines=String(text).replace(/\r/g,'').split('\n').map(l=>l.trim()).filter(Boolean);
  if(lines.length<2)throw '至少需要表头 + 1 行数据';
  const sep=lines[0].split('\t').length>lines[0].split(',').length?'\t':',';   // 支持 Excel 直接粘贴（Tab 分隔）
  return lines.map(l=>splitCSVLine(l,sep));
}
function impConvert(v,t){
  if(t==='num'){ if(v===''||v==null)return null; const n=parseFloat(String(v).replace(/[¥￥,，\s]/g,'')); return isNaN(n)?null:n; }
  if(t==='bool'){ if(v===''||v==null)return null; return /^(1|是|true|在岗|已交)$/i.test(String(v)); }
  if(t==='arr'){ return v?String(v).split(/[;；、]/).map(x=>x.trim()).filter(Boolean):[]; }
  if(t==='price'){ return /^tm$/i.test(String(v))?'T&M':v; }
  return v==null?'':String(v);
}
function impParse(){
  const elx=document.getElementById('impText'); const spec=impSpec();
  state.imp=state.imp||{texts:{}};
  const text=(elx?elx.value:'')||state.imp.texts[spec.k]||'';
  state.imp.k=spec.k; state.imp.texts[spec.k]=text;
  const errs=[];
  try{
    const rows=parseCSV(text);
    const head=rows[0].map(h=>h.replace(/\s/g,''));
    const idx=spec.cols.map(c=>{ let i=head.findIndex(h=>h===c[1].replace(/\s/g,'')); if(i<0)i=head.findIndex(h=>h.toLowerCase()===c[0].toLowerCase()); return i; });
    if(idx[0]<0)errs.push('表头缺少「'+spec.cols[0][1]+'」列（第一行必须是表头）');
    const parsed=[];
    rows.slice(1).forEach((r,i)=>{
      if(idx[0]>=0&&!r[idx[0]]){ errs.push('第 '+(i+2)+' 行缺少「'+spec.cols[0][1]+'」，已跳过'); return; }
      if(r.length>head.length){ errs.push('第 '+(i+2)+' 行列数('+r.length+')超过表头('+head.length+')——多半是金额里的千分位逗号被当作分隔符：请从 Excel 直接粘贴（Tab 分隔）或给金额加英文引号，该行仍按表头位置尽量解析'); }
      const o={}; spec.cols.forEach((c,j)=>{ if(idx[j]>=0&&idx[j]<r.length)o[c[0]]=impConvert(r[idx[j]],c[2]); });
      if(Object.keys(o).length)parsed.push(o);
    });
    state.imp.parsed=parsed; state.imp.errs=errs;
    log('数据导入','解析「'+spec.label+'」：识别 '+parsed.length+' 行'+(errs.length?'，'+errs.length+' 行被跳过':''));
  }catch(e){ state.imp.parsed=null; state.imp.errs=[String(e.message||e)]; }
  save(); render();
}
function doImport(){
  const spec=impSpec(), st=state.imp;
  if(!st||!st.parsed||!st.parsed.length){ alert('请先「解析预览」，且至少识别出 1 行有效数据'); return; }
  let upd=0,add=0;
  st.parsed.forEach(o=>{
    const arr=S[spec.k];
    const exist=arr.find(x=>String(x.id)===String(o.id));
    if(exist){ Object.keys(o).forEach(f=>{ if(o[f]!==null&&o[f]!==''&&!(Array.isArray(o[f])&&!o[f].length))exist[f]=o[f]; }); upd++; }
    else{ o.id=o.id||('IM'+Date.now()+Math.floor(Math.random()*90+add));
      if(spec.k==='projects'){ o.milestones=o.milestones||[]; o.deliver=o.deliver||[]; }   // 导入的项目缺里程碑/交付物结构时补默认，防止哨兵与台账崩溃
      arr.push(o); add++; }
  });
  log('数据导入','「'+spec.label+'」导入完成：新增 '+add+' 条 / 更新 '+upd+' 条（数据可信度已自动重算）');
  state.imported={label:spec.label,add,upd,at:new Date().toLocaleString('zh-CN',{hour12:false})};
  st.parsed=null; st.texts[spec.k]='';
  save(); render();
}
function dlTemplate(){
  const spec=impSpec();
  const head=spec.cols.map(c=>c[1]).join(',');
  const rows=spec.sample?spec.sample.split('\n').slice(1).join('\n'):'';
  const blob=new Blob(['\ufeff'+head+'\n'+rows],{type:'text/csv;charset=utf-8'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=spec.label+'_导入模板.csv'; a.click();
  log('数据导入','下载「'+spec.label+'」导入模板'); save();
}
function rImport(){
  const spec=impSpec(), st=state.imp||{texts:{}};
  st.texts=st.texts||{};
  const text=st.texts[spec.k]||'';
  const tabs=`<div class="subnav-tabs" style="margin-left:0;margin-bottom:12px">${IMPORT_SPECS.map(s=>`<button class="${s.k===spec.k?'on':''}" onclick="setImpTab('${s.k}')">${s.icon} ${s.label}</button>`).join('')}</div>`;
  const done=state.imported?`<div class="callout" style="margin-bottom:12px">✅ 最近一次导入：${state.imported.label} · 新增 ${state.imported.add} 条 / 更新 ${state.imported.upd} 条 · ${state.imported.at}。当前数据可信度 <b>${Math.round(dataTrust().overall*100)}%</b>（${dataTrust().level}）</div>`:'';
  let preview='';
  if(st.parsed&&st.parsed.length){
    preview=`<div class="draft-box" style="margin-top:12px"><div class="dt" style="color:var(--green)">✓ 解析成功：识别 ${st.parsed.length} 行，待确认导入</div>
      <div style="overflow-x:auto"><table style="font-size:12px"><thead><tr>${spec.cols.map(c=>`<th>${c[1]}</th>`).join('')}</tr></thead><tbody>
      ${st.parsed.slice(0,8).map(o=>`<tr>${spec.cols.map(c=>{const v=o[c[0]];return `<td>${Array.isArray(v)?v.join(';'):(v==null?'—':v)}</td>`;}).join('')}</tr>`).join('')}
      </tbody></table></div>
      ${st.parsed.length>8?`<div style="font-size:11.5px;color:var(--muted);margin-top:6px">… 其余 ${st.parsed.length-8} 行未展示，导入时全部生效</div>`:''}
      <div class="msg-acts" style="margin-top:10px"><button class="btn primary" onclick="doImport()">③ 确认导入（落表 + 留痕 + 全指标重算）</button><button class="btn" onclick="impParse()">重新解析</button></div>
    </div>`;
  }
  const errbox=st.errs&&st.errs.length?`<div class="riskbar" style="margin-top:12px">⚠ 解析问题：<br>${st.errs.slice(0,5).map(e=>'· '+e).join('<br>')}</div>`:'';
  return done+`<div class="card"><div class="hd"><h3>📥 数据导入 · ${spec.label}（Excel / CSV）</h3><div style="margin-left:auto">${tabs}</div></div><div class="bd">
    <div class="form-row"><label>① 从 Excel 复制区域后直接粘贴（支持逗号 / Tab 分隔），或选择 CSV 文件</label>
      <textarea id="impText" style="min-height:150px" placeholder="从 Excel 复制区域后直接粘贴到这里，第一行必须是表头；或点下方「下载模板」看格式">${text.replace(/</g,'&lt;')}</textarea></div>
    <div class="msg-acts" style="margin-top:2px">
      <input type="file" accept=".csv,.txt" style="display:none" id="impFile" onchange="impFile(this)">
      <button class="btn primary" onclick="impParse()">② 解析预览</button>
      <button class="btn" onclick="document.getElementById('impFile').click()">选择 CSV 文件…</button>
      <button class="btn" onclick="dlTemplate()">下载模板（含示例行）</button>
      <button class="btn" onclick="impTextSet(${JSON.stringify(spec.sample).replace(/"/g,'&quot;')})">填入示例数据</button>
    </div>
    ${preview}${errbox}
    <div class="risk-note">② 导入规则：按「${spec.cols[0][1]}」匹配——已有记录只更新填写的字段（留空不动），新记录自动追加编号。${spec.tip}<br>
    · 全程留痕（留痕日志可查），导入后「数据可信度 / 今日待处理 / 哨兵」全部自动重算——这就是把 45% 可信度往上拉的路径<br>
    · 数据存本机浏览器；后续接入企微 / 银行流水后，本页仍作为兜底导入入口（PRD 6.1：Excel/CSV 导入 + 移动端极简录入）</div>
  </div></div>
  <div class="card" style="margin-top:14px"><div class="hd"><h3>四张表 · 各自驱动什么</h3></div><div class="bd">
    ${IMPORT_SPECS.map(s=>`<div class="alert-item"><div class="aico">${s.icon}</div><div style="flex:1"><div class="t">${s.label}</div><div class="d">${s.drive}</div></div><button class="btn sm" onclick="setImpTab('${s.k}')">切到这张表</button></div>`).join('')}
    <div class="risk-note">建议顺序：先<b>项目台账</b>（补人天，毛利盯梢立刻变绿）→ <b>收款流水</b>（现金与回款趋势线变长）→ <b>应收台账</b>（逾期与预测窗口精确）→ <b>人员名单</b>（饱和度与调配建议）。导入是数据可信度的唯一入口——导入越全，看板越敢下结论。</div>
  </div></div>`;
}



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

})()



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
const SHELL_HTML = String.raw`<div class="app">
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

function createWorkbench(React) {
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

    /* ---------------- 侧边栏图标（PanellistIcon）与整页（WorkbenchPage） ---------------- */
    const PANEL_ID = 'boss-assistant'
    const PANEL_LABEL = "老板超级助手 · 人财事三视图"

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

    const CSS = `
  :root{
    --bg:#f4f6fa; --card:#ffffff; --line:#e5e9f0; --text:#1c2333; --muted:#6b7688;
    --primary:#2456e6; --primary-soft:#eaf0ff; --red:#e5484d; --red-soft:#fdebec;
    --green:#2f9e63; --green-soft:#e8f6ee; --orange:#d97a06; --orange-soft:#fdf3e3;
    --purple:#7048c9; --purple-soft:#f1ebfb; --side:#101a33; --side-text:#b9c4dd;
    --radius:12px; --shadow:0 1px 3px rgba(16,26,51,.06),0 4px 16px rgba(16,26,51,.05);
  }
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:"PingFang SC","Microsoft YaHei",system-ui,sans-serif;background:var(--bg);color:var(--text);font-size:14px}
  .app{display:flex;min-height:100vh}
  /* ===== 侧边栏 ===== */
  .sidebar{width:212px;background:var(--side);color:var(--side-text);padding:18px 12px;flex-shrink:0;display:flex;flex-direction:column;gap:2px;position:sticky;top:0;height:100vh;overflow-y:auto}
  .logo{display:flex;align-items:center;gap:10px;padding:6px 10px 18px}
  .logo .mark{width:34px;height:34px;border-radius:9px;background:linear-gradient(135deg,#2f6bff,#7a4dff);display:flex;align-items:center;justify-content:center;font-weight:700;color:#fff;font-size:15px}
  .logo b{color:#fff;font-size:15px;display:block}
  .logo span{font-size:11px;color:#7d8db1}
  .nav-item{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:8px;cursor:pointer;transition:.15s;font-size:13.5px;user-select:none}
  .nav-item:hover{background:rgba(255,255,255,.07);color:#fff}
  .nav-item.active{background:var(--primary);color:#fff;font-weight:600}
  .nav-item .ico{width:18px;text-align:center;font-size:15px}
  .nav-group{margin:12px 10px 4px;font-size:11px;color:#5f6e94;letter-spacing:1px}
  .nav-badge{margin-left:auto;background:var(--red);color:#fff;font-size:11px;border-radius:8px;padding:0 6px;min-width:17px;text-align:center}
  .sidebar .foot{margin-top:auto;padding:12px 10px 0;font-size:11px;color:#5f6e94;line-height:1.7}
  /* ===== 主区 ===== */
  .main{flex:1;min-width:0;display:flex;flex-direction:column}
  .topbar{height:58px;background:var(--card);border-bottom:1px solid var(--line);display:flex;align-items:center;padding:0 22px;gap:14px;position:sticky;top:0;z-index:50}
  .topbar h1{font-size:16px;font-weight:600}
  .demo-tag{font-size:11px;color:var(--orange);background:var(--orange-soft);border:1px solid #f5d9a8;padding:2px 9px;border-radius:20px}
  .spacer{flex:1}
  .role-box{display:flex;align-items:center;gap:8px;font-size:12.5px;color:var(--muted)}
  .role-switch{display:flex;background:var(--bg);border:1px solid var(--line);border-radius:8px;padding:2px}
  .role-switch button{border:0;background:transparent;padding:5px 13px;border-radius:6px;cursor:pointer;font-size:12.5px;color:var(--muted)}
  .role-switch button.on{background:var(--primary);color:#fff;font-weight:600}
  .content{padding:20px 22px 40px;flex:1}
  .card{background:var(--card);border:1px solid var(--line);border-radius:var(--radius);box-shadow:var(--shadow)}
  .card .hd{padding:14px 18px;border-bottom:1px solid var(--line);display:flex;align-items:center;gap:10px}
  .card .hd h3{font-size:14.5px;font-weight:600}
  .card .bd{padding:16px 18px}
  .grid{display:grid;gap:14px}
  .kpis{grid-template-columns:repeat(auto-fit,minmax(170px,1fr))}
  .kpi{padding:15px 17px}
  .kpi .lab{font-size:12px;color:var(--muted)}
  .kpi .val{font-size:24px;font-weight:700;margin-top:5px}
  .kpi .sub{font-size:11.5px;color:var(--muted);margin-top:4px}
  .kpi.warn .val{color:var(--red)} .kpi.ok .val{color:var(--green)}
  .two-col{grid-template-columns:1.2fr .8fr}
  .three-col{grid-template-columns:repeat(3,1fr)}
  @media(max-width:1100px){.two-col,.three-col{grid-template-columns:1fr}}
  table{width:100%;border-collapse:collapse;font-size:13px}
  th{font-weight:600;color:var(--muted);text-align:left;padding:8px 10px;border-bottom:1px solid var(--line);font-size:12px;white-space:nowrap}
  td{padding:9px 10px;border-bottom:1px solid #f0f3f8;vertical-align:middle}
  tr:last-child td{border-bottom:0}
  tr:hover td{background:#f8faff}
  .tag{display:inline-block;font-size:11.5px;padding:2px 9px;border-radius:12px;font-weight:500;white-space:nowrap}
  .tag.blue{background:var(--primary-soft);color:var(--primary)}
  .tag.green{background:var(--green-soft);color:var(--green)}
  .tag.red{background:var(--red-soft);color:var(--red)}
  .tag.orange{background:var(--orange-soft);color:var(--orange)}
  .tag.gray{background:#eef1f6;color:var(--muted)}
  .tag.purple{background:var(--purple-soft);color:var(--purple)}
  .bar-wrap{background:#eef1f6;border-radius:6px;height:7px;width:90px;overflow:hidden;display:inline-block;vertical-align:middle}
  .bar-fill{height:100%;border-radius:6px}
  .money{font-variant-numeric:tabular-nums}
  .money.red{color:var(--red);font-weight:600}
  .money.green{color:var(--green)}
  /* 提醒 */
  .alert-item{display:flex;gap:12px;padding:12px 14px;border-radius:10px;border:1px solid var(--line);margin-bottom:10px;align-items:flex-start;background:#fff}
  .alert-item .aico{width:34px;height:34px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0}
  .alert-item .t{font-weight:600;font-size:13.5px}
  .alert-item .d{font-size:12.5px;color:var(--muted);margin-top:3px;line-height:1.5}
  .alert-item .meta{font-size:11.5px;color:var(--muted);margin-top:5px}
  .btn{border:1px solid var(--line);background:#fff;border-radius:8px;padding:6px 14px;font-size:12.5px;cursor:pointer;color:var(--text)}
  .btn:hover{border-color:var(--primary);color:var(--primary)}
  .btn.primary{background:var(--primary);border-color:var(--primary);color:#fff;font-weight:500}
  .btn.primary:hover{opacity:.92;color:#fff}
  .btn.sm{padding:3px 10px;font-size:12px}
  /* 问答 */
  .qa-hero{display:flex;gap:10px;margin-bottom:16px}
  .qa-hero input{flex:1;border:1px solid var(--line);border-radius:10px;padding:11px 15px;font-size:14px;outline:none}
  .qa-hero input:focus{border-color:var(--primary);box-shadow:0 0 0 3px var(--primary-soft)}
  .qa-chips{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px}
  .chip{background:#fff;border:1px solid var(--line);border-radius:18px;padding:6px 13px;font-size:12.5px;cursor:pointer;color:var(--muted)}
  .chip:hover{border-color:var(--primary);color:var(--primary)}
  .bubble{max-width:82%;padding:13px 16px;border-radius:14px;line-height:1.7;font-size:13.5px;margin-bottom:12px}
  .bubble.q{background:var(--primary);color:#fff;margin-left:auto;border-bottom-right-radius:4px}
  .bubble.a{background:#fff;border:1px solid var(--line);border-bottom-left-radius:4px}
  .bubble.a b.hl{color:var(--primary)}
  .evi{margin-top:9px;border-top:1px dashed var(--line);padding-top:8px}
  .evi-title{font-size:11.5px;color:var(--muted);margin-bottom:6px}
  .evi-link{display:inline-flex;align-items:center;gap:5px;font-size:12px;color:var(--primary);background:var(--primary-soft);border-radius:6px;padding:3px 9px;margin:0 6px 5px 0;cursor:pointer}
  .evi-link:hover{text-decoration:underline}
  .disclaimer{font-size:11.5px;color:var(--muted);margin-top:6px}
  /* 采集 */
  .chat-log{max-height:420px;overflow-y:auto;padding:4px 2px}
  .collect-input{display:flex;gap:8px;margin-top:8px}
  .collect-input input{flex:1;border:1px solid var(--line);border-radius:10px;padding:10px 13px;font-size:13.5px;outline:none}
  .collect-input input:focus{border-color:var(--primary)}
  .quick-btns{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
  /* 审计 */
  .audit-row td{font-size:12.5px;color:#42506b}
  /* 里程碑 */
  .ms-line{display:flex;align-items:center;gap:6px;margin:3px 0}
  .ms-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
  /* 面包屑跳转 */
  .jump-flash{animation:flash 1.6s ease}
  @keyframes flash{0%{background:#fff3c9}100%{background:transparent}}
  .lock-view{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 0;color:var(--muted);gap:12px}
  .lock-view .big{font-size:44px}
  .subnav-tabs{display:flex;gap:6px;margin-left:12px}
  .subnav-tabs button{border:0;background:transparent;font-size:12.5px;padding:5px 11px;border-radius:7px;cursor:pointer;color:var(--muted)}
  .subnav-tabs button.on{background:var(--primary-soft);color:var(--primary);font-weight:600}
  .empty{text-align:center;color:var(--muted);padding:30px 0;font-size:13px}
  .risk-note{font-size:12px;color:var(--muted);line-height:1.6;margin-top:10px;border-top:1px dashed var(--line);padding-top:9px}
  /* P0-2 趋势小图 */
  .spark{margin-top:8px}
  .spark svg{width:100%;height:36px;display:block}
  .spark-cap{display:flex;justify-content:space-between;font-size:10.5px;color:var(--muted);margin-top:2px}
  /* v1.2.1 可见性增强：版本更新横幅 + 经营趋势大图 */
  .wn{border:1px solid #c9d8ff;border-radius:13px;background:linear-gradient(110deg,#eef4ff 0%,#f7fbff 55%,#fff 100%);padding:15px 18px;margin-bottom:14px;box-shadow:0 2px 12px rgba(36,86,230,.07)}
  .wn-head{display:flex;align-items:center;gap:9px;margin-bottom:11px;flex-wrap:wrap}
  .wn-badge{background:var(--primary);color:#fff;font-size:11.5px;font-weight:700;padding:3px 9px;border-radius:6px;letter-spacing:.3px}
  .wn-title{font-size:15px;font-weight:700;color:#1b2b52}
  .wn-sub{font-size:12px;color:var(--muted)}
  .wn-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(215px,1fr));gap:9px}
  .wn-item{display:flex;gap:10px;align-items:flex-start;text-align:left;background:#fff;border:1px solid #dbe5fb;border-radius:10px;padding:10px 12px;cursor:pointer;transition:.15s}
  .wn-item:hover{border-color:var(--primary);transform:translateY(-1px);box-shadow:0 4px 12px rgba(36,86,230,.12)}
  .wn-ico{font-size:20px;line-height:1.2}
  .wn-t{font-size:13px;font-weight:650;color:#20304f}
  .wn-d{font-size:11.5px;color:var(--muted);line-height:1.5;margin-top:2px}
  .wn-x{margin-left:auto;border:0;background:transparent;color:var(--muted);font-size:12px;cursor:pointer;white-space:nowrap}
  .wn-x:hover{color:var(--primary)}
  .trend-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(255px,1fr));gap:11px}
  .trend-box{border:1px solid var(--line);border-radius:11px;background:linear-gradient(180deg,#fff,#fafbff);padding:11px 13px 9px}
  .trend-hd{display:flex;align-items:center;gap:7px;font-size:12.5px;font-weight:650;color:#27344d}
  .trend-delta{margin-left:auto;font-size:11.5px;font-weight:700;padding:2px 8px;border-radius:6px;white-space:nowrap}
  .trend-delta.good{background:var(--green-soft);color:var(--green)}
  .trend-delta.bad{background:var(--red-soft);color:var(--red)}
  .trend-delta.flat{background:#eef1f6;color:var(--muted)}
  .trend-chart{margin-top:8px}
  .trend-chart svg{width:100%;height:92px;display:block}
  .trend-cap{display:flex;justify-content:space-between;font-size:10.5px;color:var(--muted);margin-top:2px}
  .trend-note{font-size:11.5px;color:#4a5670;line-height:1.55;margin-top:7px;padding-top:7px;border-top:1px dashed var(--line)}
  .mode-chip{border:1px solid #c9d8ff;background:#eef4ff;color:var(--primary);border-radius:7px;padding:2px 9px;font-size:11.5px;cursor:pointer;font-weight:600}
  .mode-chip:hover{background:var(--primary);color:#fff}
  /* ===== v1.3 / P1：损益一页纸 · 商机漏斗 · 老板周报 · 经营结论 ===== */
  .pnl-line{display:flex;align-items:center;gap:12px;padding:9px 11px;border-bottom:1px dashed var(--line)}
  .pnl-line>span:first-child{width:118px;font-size:13px;font-weight:600;flex-shrink:0}
  .pnl-line .money{min-width:132px;text-align:right;font-variant-numeric:tabular-nums}
  .pnl-line>span:last-child{flex:1;font-size:11.5px;color:var(--muted);min-width:0}
  .funnel-row{display:flex;align-items:center;gap:10px;padding:7px 0;border-bottom:1px dashed var(--line);font-size:12.5px}
  .fn-lab{width:88px;font-weight:600;flex-shrink:0}
  .fn-bar{flex:1;height:14px;background:#eef1f6;border-radius:6px;overflow:hidden;min-width:70px}
  .fn-num{width:44px;text-align:right;flex-shrink:0}
  .fn-amt{width:112px;text-align:right;flex-shrink:0;font-variant-numeric:tabular-nums}
  .fn-w{width:112px;text-align:right;font-size:11.5px;flex-shrink:0}
  .p1-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:10px}
  .p1-tile{display:flex;flex-direction:column;align-items:flex-start;gap:3px;text-align:left;border:1px solid var(--line);border-radius:11px;background:linear-gradient(180deg,#fff,#f8faff);padding:12px 13px;cursor:pointer;transition:.15s;min-width:0}
  .p1-tile:hover{border-color:var(--primary);transform:translateY(-1px);box-shadow:0 4px 12px rgba(36,86,230,.1)}
  .p1-ico{font-size:17px}
  .p1-lab{font-size:11.5px;color:var(--muted)}
  .p1-val{font-size:19px;font-weight:700;line-height:1.3;overflow-wrap:anywhere}
  .p1-sub{font-size:11.5px;color:#4a5670;line-height:1.5}
  .p1-go{font-size:11px;color:var(--primary);font-weight:600;margin-top:3px}
  .wk-paper{background:#fff}
  .wk-sec{margin-top:18px}
  .wk-sec h2{font-size:14px;color:var(--primary);margin-bottom:6px}
  .wk-sec ul{padding-left:20px}
  .wk-sec li{font-size:12.5px;line-height:1.85;color:#2b3448}
  /* ===== PRD 新增：今日三件事 / 消息中心 / 任务 / 弹窗 ===== */
  .triage{display:flex;flex-direction:column;gap:9px}
  .triage-item{display:flex;gap:11px;padding:12px 13px;border:1px solid var(--line);border-radius:11px;background:linear-gradient(180deg,#fff,#fbfcff)}
  .triage-item .ti{width:30px;height:30px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:15px;background:var(--primary-soft);flex-shrink:0}
  .triage-item .tt{font-weight:600;font-size:13.5px;line-height:1.5}
  .triage-item .tw{font-size:12px;color:var(--muted);margin-top:3px;line-height:1.55}
  .triage-item .ta{display:flex;gap:7px;margin-top:8px;flex-wrap:wrap}
  .msg-card{border:1px solid var(--line);border-radius:11px;padding:13px 15px;margin-bottom:11px;background:#fff}
  .msg-hd{display:flex;gap:10px;align-items:flex-start}
  .avatar{width:34px;height:34px;border-radius:10px;background:linear-gradient(135deg,#2f6bff,#7a4dff);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;flex-shrink:0}
  .msg-meta{font-size:11.5px;color:var(--muted);margin-top:2px;line-height:1.5}
  .msg-body{font-size:13px;line-height:1.75;margin-top:9px;padding:10px 12px;background:#f7f9fd;border-radius:9px;color:#2b3448}
  .msg-extract{display:flex;flex-wrap:wrap;gap:6px;margin-top:9px}
  .kchip{font-size:11.5px;background:#fff;border:1px solid var(--line);border-radius:7px;padding:3px 9px;color:var(--muted)}
  .kchip b{color:var(--text);font-weight:600}
  .msg-acts{display:flex;gap:7px;margin-top:10px;flex-wrap:wrap;align-items:center}
  .draft-box{margin-top:10px;border:1px solid #f5d9a8;background:#fffdf6;border-radius:10px;padding:11px 13px}
  .draft-box .dt{font-size:11.5px;color:var(--orange);font-weight:600;margin-bottom:6px}
  .draft-box .dtext{font-size:12.5px;line-height:1.7;color:#3a4256;white-space:pre-wrap}
  .riskbar{margin-top:7px;font-size:11.5px;color:var(--red);background:var(--red-soft);border-radius:7px;padding:5px 9px}
  .modal-mask{position:fixed;inset:0;background:rgba(16,26,51,.45);z-index:200;display:flex;align-items:center;justify-content:center;padding:18px}
  .modal{background:#fff;border-radius:14px;width:min(520px,100%);box-shadow:0 20px 60px rgba(16,26,51,.3);overflow:hidden}
  .modal .mhd{padding:15px 18px;border-bottom:1px solid var(--line);display:flex;align-items:center}
  .modal .mhd h3{font-size:15px}
  .modal .mbd{padding:16px 18px;max-height:70vh;overflow-y:auto}
  .modal .mft{padding:12px 18px;border-top:1px solid var(--line);display:flex;gap:9px;justify-content:flex-end}
  .form-row{margin-bottom:12px}
  .form-row label{display:block;font-size:12px;color:var(--muted);margin-bottom:5px}
  .form-row input,.form-row select,.form-row textarea{width:100%;border:1px solid var(--line);border-radius:9px;padding:9px 12px;font-size:13.5px;outline:none;font-family:inherit}
  .form-row input:focus,.form-row select:focus,.form-row textarea:focus{border-color:var(--primary);box-shadow:0 0 0 3px var(--primary-soft)}
  .form-row textarea{min-height:72px;resize:vertical;line-height:1.6}
  .callout{background:var(--primary-soft);border-radius:9px;padding:9px 12px;font-size:12px;color:#2b3a63;line-height:1.6}
  .lock-view{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:70px 0;color:var(--muted);gap:10px;text-align:center}
  ::-webkit-scrollbar{width:8px;height:8px}::-webkit-scrollbar-thumb{background:#cfd6e4;border-radius:4px}

/* ===== 插件化追加：不改原样式，只补宿主内的布局约束、保存徽标与深色覆盖 ===== */
.wb-plugin-root{position:relative;flex:1 1 auto;min-height:0;width:100%;display:flex;flex-direction:column;background:var(--bg);color:var(--text);font-size:14px;font-family:"PingFang SC","Microsoft YaHei",system-ui,sans-serif;overflow:hidden}
#wbShell{display:flex;min-height:0;flex:1 1 auto;overflow:hidden}
#wbShell .sidebar{position:relative;top:auto;height:auto;overflow-y:auto}
#wbShell .main{height:100%;min-height:0;overflow:hidden}
#wbShell .content{flex:1 1 auto;min-height:0;overflow-y:auto;padding-bottom:48px}
.save-badge{font-size:11.5px;color:var(--muted);border:1px solid var(--line);border-radius:7px;padding:3px 9px;white-space:nowrap;cursor:default;background:transparent}
.save-badge.on{color:var(--green);border-color:#c6e3d1;background:var(--green-soft)}
#modalRoot .modal-mask{position:fixed;inset:0;z-index:400}
.wb-foot-note{flex:none;font-size:11px;color:var(--muted);padding:4px 22px 8px;border-top:1px dashed var(--line)}
[data-ds-dark-theme] .wb-plugin-root{--bg:#12161f;--card:#1a1f2b;--line:#2a3140;--text:#e6ebf5;--muted:#93a0b8;--primary:#6f96ff;--primary-soft:#1e2a4a;--red:#ff6b70;--red-soft:#3a1c22;--green:#4ad18b;--green-soft:#143327;--orange:#f0a94b;--orange-soft:#3a2a12;--purple:#a98bff;--purple-soft:#2b2345;--side:#161b26;--side-text:#b9c4dd}
[data-ds-dark-theme] .wb-plugin-root .card,[data-ds-dark-theme] .wb-plugin-root .modal,[data-ds-dark-theme] .wb-plugin-root .alert-item,[data-ds-dark-theme] .wb-plugin-root .msg-card,[data-ds-dark-theme] .wb-plugin-root .bubble.a{background:var(--card);border-color:var(--line);color:var(--text)}
[data-ds-dark-theme] .wb-plugin-root tr:hover td{background:#1f2733}
[data-ds-dark-theme] .wb-plugin-root .msg-body,[data-ds-dark-theme] .wb-plugin-root .draft-box,[data-ds-dark-theme] .wb-plugin-root .p1-tile,[data-ds-dark-theme] .wb-plugin-root .trend-box,[data-ds-dark-theme] .wb-plugin-root .triage-item,[data-ds-dark-theme] .wb-plugin-root .chip,[data-ds-dark-theme] .wb-plugin-root .btn,[data-ds-dark-theme] .wb-plugin-root .form-row input,[data-ds-dark-theme] .wb-plugin-root .form-row select,[data-ds-dark-theme] .wb-plugin-root .form-row textarea{background:#1f2431;border-color:var(--line);color:var(--text)}
[data-ds-dark-theme] .wb-plugin-root .btn:hover{color:var(--primary);border-color:var(--primary)}
[data-ds-dark-theme] .wb-plugin-root .btn.primary{background:var(--primary);border-color:var(--primary);color:#0f1420}
[data-ds-dark-theme] .wb-plugin-root .wn,[data-ds-dark-theme] .wb-plugin-root .callout{background:#1b2233;border-color:#2c3550}
[data-ds-dark-theme] .wb-plugin-root .sidebar{background:var(--side)}
`

    return {
      inject: ['slots'],
      apply(ctx) {
        const style = document.createElement('style')
        style.dataset.pluginCss = "dsh-boss-assistant"
        style.textContent = CSS
        document.head.appendChild(style)

        const disposers = []
        const guard = (key, fn) => {
          try {
            return fn()
          } catch (err) {
            console.error('dsh-boss-assistant: 槽位注册失败 ' + key, err)
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
