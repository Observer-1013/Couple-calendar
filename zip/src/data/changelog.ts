export interface ChangelogEntry {
  id: string;
  date: string;
  title: string;
  summary: string;
  items: string[];
}

export const CHANGELOG_ENTRIES: ChangelogEntry[] = [
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
