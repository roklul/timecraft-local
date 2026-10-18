import type { ProjectScope } from './project';

export type CategoryType =
  | 'Coding'
  | 'Meeting'
  | 'Design'
  | 'Review'
  | 'Planning'
  | 'Leave'
  | 'Deploy'
  | 'Optimization'
  | 'Incident'
  | 'Maintenance'
  | 'Troubleshooting'
  | 'Routine';

export type SyncStatusType = 'synced' | 'pending' | 'failed';

export interface WorklogItem {
  id: string;                  // 本地唯一識別碼 (UUID 或 timestamp)
  taskName: string;            // 任務名稱
  project: string;             // 專案名稱
  projectId?: string;          // 穩定專案識別碼；名稱只供顯示
  scope: ProjectScope;         // 工作或個人領域
  category: CategoryType;      // 屬性分類
  date: string;                // YYYY-MM-DD
  startTime: string;           // HH:mm (需為 :00 或 :30，例如 "14:00")
  endTime: string;             // HH:mm (例如 "16:30")
  hours: number;               // 步進為 0.5 (例如 2.5)
  progress: number;            // 0 - 100 (甘特圖使用)
  notes?: string;              // 備註
  notionPageId?: string;       // 關聯之 Notion 頁面 ID
  syncStatus: SyncStatusType;  // 同步狀態
  isLeave?: boolean;           // 是否為休假 (專案與甘特圖將忽略此排程)
  projectType?: 'project' | 'maintenance' | 'meeting' | 'routine'; // 專案性質：一般專案、維運案、會議、例行事務
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectInfo {
  name: string;
  color: string;
  bgLight: string;
  border: string;
  text: string;
  projectType?: 'project' | 'maintenance';
}
