export interface ChangelogEntry {
  id: string;
  date: string;
  title: string;
  summary: string;
  items: string[];
}

export const CHANGELOG_ENTRIES: ChangelogEntry[] = [
  {
    id: '2026-07-07-todo-rollovers',
    date: '2026-07-07',
    title: '未完成待办会移动式顺延',
    summary: '过期未完成的已排期待办会移动到今天，旧日期保留淡色划线痕迹，避免重复复制。',
    items: [
      '自动顺延现在更新同一条 Supabase todo，不再每天复制一条新的待办。',
      '旧日期会显示浅蓝灰色、文字划线的历史框，表示这条任务已经顺延走了。',
      '新增 todo_rollovers 历史表，用来长期保存旧日期痕迹并支持实时同步。',
    ],
  },
  {
    id: '2026-06-25-smoother-background-sync',
    date: '2026-06-25',
    title: '数据同步不再打断页面',
    summary: '新增、编辑或删除内容后，页面会留在当前位置并在后台完成 Supabase 同步。',
    items: [
      '全屏 Loading 现在只用于首次打开和恢复登录状态。',
      '日常操作触发的数据刷新改为后台进行，不再让日历短暂白屏。',
      '短时间内重复到达的本地刷新和 Realtime 通知会合并，减少重复查询。',
    ],
  },
  {
    id: '2026-06-23-feature-wishes',
    date: '2026-06-23',
    title: '设置里新增功能许愿',
    summary: 'Settings 里新增可折叠的 Feature Wishes，用来一起记录以后想开发的功能。',
    items: [
      '双方都可以在功能许愿里一条条新增想法。',
      '已有愿望可以直接编辑，适合慢慢补充和整理需求。',
      '新增 Supabase feature_wishes 表，准备支持长期保存和实时同步。',
    ],
  },
  {
    id: '2026-06-23-monday-calendar-start',
    date: '2026-06-23',
    title: '日历现在从周一开始',
    summary: '月视图、周视图和年视图里的小月历都改成 Monday-first 排列。',
    items: [
      '月视图表头从 MON 到 SUN 显示。',
      '周视图的起止范围改为周一到周日。',
      '年视图每个月的小日历也同步使用周一开头。',
    ],
  },
  {
    id: '2026-06-23-editable-todo-assignee',
    date: '2026-06-23',
    title: '待办归属现在可以修改',
    summary: '编辑待办时不仅可以改文字，也可以把归属改成双方共享或某一个人。',
    items: [
      '左侧个人待办编辑框新增归属选择。',
      '右侧 Flexible 和 Scheduled 待办编辑框也支持切换归属。',
      '修改会写回 Supabase 的 assignee_role，并继续通过实时同步刷新到另一端。',
    ],
  },
  {
    id: '2026-06-23-inbox-mood-category',
    date: '2026-06-23',
    title: '信箱新增心情记录类别',
    summary: 'Couple Inbox 现在可以把消息标记为 Mood，用来记录当天状态和情绪。',
    items: [
      '新增 Mood 类别，可以在发送信箱消息时直接选择。',
      '信箱卡片上会显示消息类别，方便区分计划、灵感、情话和心情记录。',
      'Supabase 类别约束已准备更新，Mood 记录可以长期保存。',
    ],
  },
  {
    id: '2026-06-22-editable-todos',
    date: '2026-06-22',
    title: '待办现在可以直接编辑',
    summary: '写错字或想调整措辞时，不需要删除重建待办了。',
    items: [
      '左侧个人待办新增编辑入口，可以保存或取消修改。',
      '右侧 Flexible 和 Scheduled 待办都支持直接编辑文字。',
      '编辑后的待办会写回 Supabase，并通过现有实时同步刷新到另一端。',
    ],
  },
  {
    id: '2026-06-22-personal-status-weather',
    date: '2026-06-22',
    title: '新增个人状况和天气位置',
    summary: '右侧栏新增个人状况入口，可以查看双方最近 7 天打卡和所在地天气。',
    items: [
      '左侧栏收起后的图标现在可以点击，展开后会自动滚到对应区块。',
      '右侧栏新增个人状况按钮，展开后仍保留信箱、待办和个人状况三个快捷按钮。',
      '个人状况里展示双方最近 7 天 habit 打卡总次数和每日点阵。',
      '天气位置支持手动输入城市或使用浏览器当前位置，并准备保存到 Supabase profile。',
    ],
  },
  {
    id: '2026-06-22-settings-undo',
    date: '2026-06-22',
    title: '设置、颜色和更安全的编辑',
    summary: '这次更新主要补齐个性化设置、日常使用细节，以及删除前后的安全感。',
    items: [
      '新增设置页，可以管理昵称、邀请码、浅色/深色主题、图层颜色、个人日程颜色和习惯内容。',
      '给可编辑的日程、待办和信箱消息加入删除与撤销操作。',
      '把邀请码移动到设置里，让侧边栏继续专注于图层和个人待办。',
      '确认了实时同步、Vercel 生产部署和 Supabase 删除权限都能正常工作。',
    ],
  },
  {
    id: '2026-06-21-live-foundation',
    date: '2026-06-21',
    title: '接入 Supabase 实时数据底座',
    summary: 'CoupleSync 从静态 UI 变成了真正可以长期保存、多人同步的共享空间。',
    items: [
      '接入 Supabase Auth、用户资料、情侣空间绑定、身份角色和邀请码。',
      '日程、待办、习惯、信箱消息、回复、图层和拖拽排期都已经可以写入数据库。',
      '补充了 GitHub OAuth 配置辅助、Vercel 部署辅助和线上版本验证脚本。',
      '预留 Google Calendar API 结构，方便之后继续做真实 OAuth 同步。',
    ],
  },
];
