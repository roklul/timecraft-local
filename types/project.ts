export type ProjectStatus = 'active' | 'completed' | 'on_hold';
export type ProjectScope = 'work' | 'personal';

// 專案類型：'project' (一般專案：有明確目標與起訖) | 'maintenance' (維運案：常態維運、無明顯起訖，如 Graylog、Zabbix)
export type ProjectType = 'project' | 'maintenance';

export interface ProjectItem {
  id: string;
  name: string;
  color: string;
  status: ProjectStatus;
  estimatedHours: number;
  scope: ProjectScope;
  projectType?: ProjectType; // 預設為 'project'
  description?: string;
  notionPageId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const PROJECT_COLORS = [
  { name: '海洋藍', hex: '#3b82f6', bgClass: 'bg-blue-500', textClass: 'text-blue-400' },
  { name: '經典紫', hex: '#8b5cf6', bgClass: 'bg-purple-500', textClass: 'text-purple-400' },
  { name: '寶石綠', hex: '#10b981', bgClass: 'bg-emerald-500', textClass: 'text-emerald-400' },
  { name: '琥珀金', hex: '#f59e0b', bgClass: 'bg-amber-500', textClass: 'text-amber-400' },
  { name: '珊瑚粉', hex: '#ec4899', bgClass: 'bg-pink-500', textClass: 'text-pink-400' },
  { name: '櫻桃紅', hex: '#ef4444', bgClass: 'bg-red-500', textClass: 'text-red-400' },
  { name: '極光青', hex: '#06b6d4', bgClass: 'bg-cyan-500', textClass: 'text-cyan-400' },
  { name: '石墨灰', hex: '#6b7280', bgClass: 'bg-gray-500', textClass: 'text-gray-400' },
];
