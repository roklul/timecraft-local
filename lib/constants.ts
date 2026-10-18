import { CategoryType, ProjectInfo } from '@/types/worklog';

// 產生 00:00 至 23:30 每半小時一個刻度 (全天共 48 個槽位)
export const TIME_SLOTS: string[] = [];
for (let h = 0; h < 24; h++) {
  const hh = h.toString().padStart(2, '0');
  TIME_SLOTS.push(`${hh}:00`);
  TIME_SLOTS.push(`${hh}:30`);
}

// 供結束時間選單使用的完整清單 (00:30 至 24:00 共 48 個時間點)
export const END_TIME_SLOTS: string[] = [];
for (let h = 0; h < 24; h++) {
  const hh = h.toString().padStart(2, '0');
  END_TIME_SLOTS.push(`${hh}:30`);
  const nextH = (h + 1).toString().padStart(2, '0');
  END_TIME_SLOTS.push(`${nextH}:00`);
}

export const DEFAULT_PROJECTS: ProjectInfo[] = [
  {
    name: 'AI 開發實戰',
    color: '#3b82f6',
    bgLight: 'bg-blue-500/15 text-blue-300 border-blue-500/30 hover:border-blue-500/50',
    border: 'border-blue-500',
    text: 'text-blue-400',
    projectType: 'project',
  },
  {
    name: 'EIP',
    color: '#f97316',
    bgLight: 'bg-orange-500/15 text-orange-300 border-orange-500/30 hover:border-orange-500/50',
    border: 'border-orange-500',
    text: 'text-orange-400',
    projectType: 'project',
  },
  {
    name: '架構設計',
    color: '#8b5cf6',
    bgLight: 'bg-purple-500/15 text-purple-300 border-purple-500/30 hover:border-purple-500/50',
    border: 'border-purple-500',
    text: 'text-purple-400',
    projectType: 'project',
  },
  {
    name: 'Graylog',
    color: '#f59e0b',
    bgLight: 'bg-amber-500/15 text-amber-300 border-amber-500/30 hover:border-amber-500/50',
    border: 'border-amber-500',
    text: 'text-amber-400',
    projectType: 'maintenance',
  },
  {
    name: 'Graylog 系統設計',
    color: '#ec4899',
    bgLight: 'bg-pink-500/15 text-pink-300 border-pink-500/30 hover:border-pink-500/50',
    border: 'border-pink-500',
    text: 'text-pink-400',
    projectType: 'maintenance',
  },
  {
    name: 'Zabbix',
    color: '#10b981',
    bgLight: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:border-emerald-500/50',
    border: 'border-emerald-500',
    text: 'text-emerald-400',
    projectType: 'maintenance',
  },
];

export const PROJECT_CATEGORIES: CategoryType[] = ['Coding', 'Design', 'Review', 'Planning'];
export const MAINTENANCE_CATEGORIES: CategoryType[] = ['Deploy', 'Optimization', 'Incident', 'Maintenance', 'Troubleshooting'];

export const CATEGORY_CONFIG: Record<CategoryType, { label: string; badgeClass: string }> = {
  Coding: { label: '程式開發', badgeClass: 'bg-blue-900/60 text-blue-300 border-blue-700/50' },
  Design: { label: '系統設計', badgeClass: 'bg-indigo-900/60 text-indigo-300 border-indigo-700/50' },
  Review: { label: '代碼檢視', badgeClass: 'bg-amber-900/60 text-amber-300 border-amber-700/50' },
  Planning: { label: '規劃評估', badgeClass: 'bg-rose-900/60 text-rose-300 border-rose-700/50' },
  Deploy: { label: '建置導入', badgeClass: 'bg-teal-900/60 text-teal-300 border-teal-700/50' },
  Optimization: { label: '系統優化', badgeClass: 'bg-cyan-900/60 text-cyan-300 border-cyan-700/50' },
  Incident: { label: '告警排除', badgeClass: 'bg-rose-900/60 text-rose-300 border-rose-700/50' },
  Maintenance: { label: '日常維護', badgeClass: 'bg-emerald-900/60 text-emerald-300 border-emerald-700/50' },
  Troubleshooting: { label: '故障排查', badgeClass: 'bg-amber-900/60 text-amber-300 border-amber-700/50' },
  Meeting: { label: '開會溝通', badgeClass: 'bg-purple-900/60 text-purple-300 border-purple-700/50' },
  Leave: { label: '🏖️ 個人休假', badgeClass: 'bg-zinc-800 text-zinc-300 border-zinc-600' },
  Routine: { label: '例行事務', badgeClass: 'bg-sky-900/60 text-sky-300 border-sky-700/50' },
};

// 時間轉換小工具 (支援 24:00)
export function timeToMinutes(timeStr: string): number {
  if (timeStr === '24:00') return 24 * 60;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

export function minutesToTime(minutes: number): string {
  if (minutes >= 24 * 60) return '24:00';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export function calculateHours(startTime: string, endTime: string): number {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  const diffMinutes = Math.max(0, end - start);
  // 最小刻度 0.5 小時 (30 分鐘)
  return Math.round((diffMinutes / 60) * 2) / 2;
}

// 根據專案取得對應顏色配置 (支援動態傳入自訂專案列表與專案類型)
export function getProjectStyle(projectName: string, customColor?: string, projectType?: 'project' | 'maintenance'): ProjectInfo {
  if (
    projectName === '休假' ||
    projectName === '無' ||
    projectName === '無專案' ||
    projectName.includes('休假') ||
    projectName.includes('會議') ||
    projectName === '例會' ||
    projectName.includes('午休') ||
    projectName.includes('午餐') ||
    projectName.includes('例行事務') ||
    projectName.includes('庶務') ||
    projectName === '例行事務'
  ) {
    const isMeeting = projectName.includes('會議') || projectName === '例會';
    const isLunch = projectName.includes('午休') || projectName.includes('午餐');
    const isRoutine = projectName.includes('例行事務') || projectName.includes('庶務') || projectName === '例行事務';
    return {
      name: projectName === '無' ? '無專案' : projectName,
      color: isMeeting ? '#64748b' : isLunch ? '#f59e0b' : isRoutine ? '#0284c7' : '#a1a1aa',
      bgLight: isMeeting
        ? 'bg-slate-500/15 text-slate-300 border-slate-500/30 hover:border-slate-500/50'
        : isLunch
        ? 'bg-amber-500/15 text-amber-300 border-amber-500/30 hover:border-amber-500/50'
        : isRoutine
        ? 'bg-sky-500/15 text-sky-300 border-sky-500/30 hover:border-sky-500/50'
        : 'bg-zinc-800/80 text-zinc-300 border-zinc-700 hover:border-zinc-500/60',
      border: isMeeting ? 'border-slate-600' : isLunch ? 'border-amber-600' : isRoutine ? 'border-sky-600' : 'border-zinc-600',
      text: isMeeting ? 'text-slate-400' : isLunch ? 'text-amber-400' : isRoutine ? 'text-sky-400' : 'text-zinc-400',
      projectType: 'project',
    };
  }

  const found = DEFAULT_PROJECTS.find((p) => p.name === projectName);
  if (found) {
    return {
      ...found,
      projectType: projectType || found.projectType || 'project',
    };
  }

  const isMaint = projectType === 'maintenance' || /graylog|zabbix|維運|運維|監控/i.test(projectName);
  const hexColor = customColor || (isMaint ? '#10b981' : '#6366f1');
  return {
    name: projectName,
    color: hexColor,
    bgLight: isMaint
      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:border-emerald-500/50'
      : 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30 hover:border-indigo-500/50',
    border: isMaint ? 'border-emerald-500' : 'border-indigo-500',
    text: isMaint ? 'text-emerald-400' : 'text-indigo-400',
    projectType: isMaint ? 'maintenance' : 'project',
  };
}
