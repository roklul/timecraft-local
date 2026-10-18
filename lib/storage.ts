import { WorklogItem } from '@/types/worklog';
import { ProjectItem, ProjectType, PROJECT_COLORS } from '@/types/project';
import { format, startOfWeek, addDays } from 'date-fns';

const STORAGE_KEY = 'timecraft_worklogs_v1';
const TOMBSTONE_WORKLOGS_KEY = 'timecraft_tombstone_worklogs_v1';
const TOMBSTONE_PROJECTS_KEY = 'timecraft_tombstone_projects_v1';
const TOMBSTONE_PROJECT_IDS_KEY = 'timecraft_tombstone_project_ids_v2';

export function getDeletedWorklogIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(TOMBSTONE_WORKLOGS_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

export function addDeletedWorklogId(id: string, notionPageId?: string): void {
  if (typeof window === 'undefined') return;
  try {
    const set = getDeletedWorklogIds();
    if (id) set.add(id);
    if (notionPageId) set.add(notionPageId);
    localStorage.setItem(TOMBSTONE_WORKLOGS_KEY, JSON.stringify(Array.from(set)));
  } catch (err) {
    console.error('Failed to add deleted worklog id to tombstone:', err);
  }
}

export function getDeletedProjectNames(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(TOMBSTONE_PROJECTS_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

export function addDeletedProjectName(name: string): void {
  if (typeof window === 'undefined' || !name) return;
  try {
    const set = getDeletedProjectNames();
    set.add(name);
    localStorage.setItem(TOMBSTONE_PROJECTS_KEY, JSON.stringify(Array.from(set)));
  } catch (err) {
    console.error('Failed to add deleted project name to tombstone:', err);
  }
}

export function removeDeletedProjectName(name: string): void {
  if (typeof window === 'undefined' || !name) return;
  try {
    const set = getDeletedProjectNames();
    if (set.has(name)) {
      set.delete(name);
      localStorage.setItem(TOMBSTONE_PROJECTS_KEY, JSON.stringify(Array.from(set)));
    }
  } catch (err) {
    console.error('Failed to remove deleted project name from tombstone:', err);
  }
}

export function getDeletedProjectIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(TOMBSTONE_PROJECT_IDS_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

export function addDeletedProjectId(id: string, notionPageId?: string): void {
  if (typeof window === 'undefined') return;
  const ids = getDeletedProjectIds();
  if (id) ids.add(id);
  if (notionPageId) ids.add(notionPageId);
  localStorage.setItem(TOMBSTONE_PROJECT_IDS_KEY, JSON.stringify([...ids]));
}

export function removeDeletedProjectId(id: string, notionPageId?: string): void {
  if (typeof window === 'undefined') return;
  const ids = getDeletedProjectIds();
  ids.delete(id);
  if (notionPageId) ids.delete(notionPageId);
  localStorage.setItem(TOMBSTONE_PROJECT_IDS_KEY, JSON.stringify([...ids]));
}

export function getInitialDemoWorklogs(): WorklogItem[] {
  // 取得本週週一為基準
  const today = new Date();
  const monday = startOfWeek(today, { weekStartsOn: 1 });

  const dMon = format(monday, 'yyyy-MM-dd');
  const dTue = format(addDays(monday, 1), 'yyyy-MM-dd');
  const dWed = format(addDays(monday, 2), 'yyyy-MM-dd');
  const dThu = format(addDays(monday, 3), 'yyyy-MM-dd');
  const dFri = format(addDays(monday, 4), 'yyyy-MM-dd');

  return [
    {
      id: 'demo-1',
      taskName: 'Notion MCP 連接器調度與 API 封包構建',
      project: 'AI 開發實戰',
      scope: 'work',
      category: 'Coding',
      date: dMon,
      startTime: '09:00',
      endTime: '11:30',
      hours: 2.5,
      progress: 80,
      notes: '實作與 Claude Code Notion MCP Server 串接協定與 Page CRUD 中間人',
      syncStatus: 'synced',
      notionPageId: 'notion_page_001',
    },
    {
      id: 'demo-2',
      taskName: '架構規劃與 12 核心積木評估會議',
      project: '架構設計',
      scope: 'work',
      category: 'Planning',
      date: dMon,
      startTime: '14:00',
      endTime: '15:30',
      hours: 1.5,
      progress: 100,
      notes: '依據投影片 1-4 積木圖鑑確認系統中轉與安全防護機制',
      syncStatus: 'synced',
      notionPageId: 'notion_page_002',
    },
    {
      id: 'demo-3',
      taskName: '週日曆 0.5hr 網格 UI 組件實作',
      project: 'AI 開發實戰',
      scope: 'work',
      category: 'Coding',
      date: dTue,
      startTime: '09:30',
      endTime: '12:00',
      hours: 2.5,
      progress: 90,
      notes: '完成 7 天 x 48 時間槽佈局，支援直覺點擊與選取填報工時',
      syncStatus: 'synced',
      notionPageId: 'notion_page_003',
    },
    {
      id: 'demo-4',
      taskName: '客戶需求訪談與功能覆盤',
      project: '客戶專案',
      scope: 'work',
      category: 'Meeting',
      date: dWed,
      startTime: '10:00',
      endTime: '11:30',
      hours: 1.5,
      progress: 60,
      notes: '確認 Notion Database 欄位對齊要求（Task, Hours, Status）',
      syncStatus: 'pending',
    },
    {
      id: 'demo-5',
      taskName: '專案甘特圖視覺化與進度聚合計算',
      project: 'AI 開發實戰',
      scope: 'work',
      category: 'Design',
      date: dThu,
      startTime: '13:30',
      endTime: '16:00',
      hours: 2.5,
      progress: 75,
      notes: '依專案維度計算累計工時與長條圖跨度',
      syncStatus: 'pending',
    },
    {
      id: 'demo-6',
      taskName: '程式碼檢視與優雅降級容錯測試',
      project: '產品重構',
      scope: 'work',
      category: 'Review',
      date: dFri,
      startTime: '15:00',
      endTime: '17:00',
      hours: 2.0,
      progress: 50,
      notes: '驗證斷網時寫入 localStorage 快取與重連補同步機制',
      syncStatus: 'pending',
    },
  ];
}

export function loadWorklogs(): WorklogItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    let logs: WorklogItem[] = [];
    if (!raw) {
      logs = getInitialDemoWorklogs();
    } else {
      logs = (JSON.parse(raw) as WorklogItem[]).map((item) => ({
        ...item,
        scope: item.scope || 'work',
      }));
    }

    // 依據 Tombstone 黑名單徹底過濾已被刪除之工時或專案
    const deletedIds = getDeletedWorklogIds();
    const deletedProjects = getDeletedProjectNames();
    const filtered = logs.filter((w) => {
      if (deletedIds.has(w.id) || (w.notionPageId && deletedIds.has(w.notionPageId))) {
        return false;
      }
      if (w.project && deletedProjects.has(w.project)) {
        return false;
      }
      return true;
    });

    if (filtered.length !== logs.length || !raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    }
    return filtered;
  } catch (err) {
    console.error('Failed to load worklogs from localStorage:', err);
    return [];
  }
}

export function saveWorklogs(worklogs: WorklogItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(worklogs));
  } catch (err) {
    console.error('Failed to save worklogs to localStorage:', err);
  }
}

// ==========================================
// 專案管理 (Projects) 記憶積木
// ==========================================
const PROJECTS_KEY = 'timecraft_projects_v1';

export function getInitialDemoProjects(): ProjectItem[] {
  return [
    {
      id: 'proj-1',
      name: 'AI 開發實戰',
      color: '#3b82f6',
      status: 'active',
      scope: 'work',
      projectType: 'project',
      estimatedHours: 40,
      description: '運用 Next.js 與 Notion MCP 開發高效率個人工時工作台',
    },
    {
      id: 'proj-2',
      name: 'EIP',
      color: '#f97316',
      status: 'active',
      scope: 'work',
      projectType: 'project',
      estimatedHours: 20,
      description: '企業內部 EIP 系統流程與行政表單整合',
    },
    {
      id: 'proj-3',
      name: '架構設計',
      color: '#8b5cf6',
      status: 'active',
      scope: 'work',
      projectType: 'project',
      estimatedHours: 20,
      description: '12 核心積木架構評估、狀態完整性與中間人安全機制設計',
    },
    {
      id: 'proj-4',
      name: 'Graylog',
      color: '#f59e0b',
      status: 'active',
      scope: 'work',
      projectType: 'maintenance',
      estimatedHours: 0,
      description: '常態維運：集中式日誌監控、Dashboard 梳理、告警與規則調優 (無固定起訖)',
    },
    {
      id: 'proj-6',
      name: 'Graylog 系統設計',
      color: '#ec4899',
      status: 'active',
      scope: 'work',
      projectType: 'maintenance',
      estimatedHours: 0,
      description: '常態維運：告警機制、Teams Webhook 與自動化處理架構 (無固定起訖)',
    },
    {
      id: 'proj-7',
      name: 'Zabbix',
      color: '#10b981',
      status: 'active',
      scope: 'work',
      projectType: 'maintenance',
      estimatedHours: 0,
      description: '常態維運：伺服器主機、網路設備監控、觸發器告警與效能優化 (無固定起訖)',
    },
  ];
}

export function syncProjectsWithWorklogs(
  worklogs: WorklogItem[],
  currentProjects: ProjectItem[]
): ProjectItem[] {
  let updatedProjects = [...currentProjects];
  let changed = false;

  const usedColors = new Set(updatedProjects.map((p) => p.color));
  const deletedProjects = getDeletedProjectNames();
  const deletedProjectIds = getDeletedProjectIds();

  for (const w of worklogs) {
    const projName = w.project?.trim();
    if (
      !projName ||
      projName === '無' ||
      projName === '休假' ||
      projName.includes('休假') ||
      projName === '團隊會議' ||
      projName.includes('會議') ||
      projName === '例會' ||
      projName === '例行事務' ||
      projName.includes('例行事務') ||
      projName.includes('庶務') ||
      w.isLeave ||
      w.category === 'Leave' ||
      w.category === 'Meeting' ||
      w.category === 'Routine' ||
      w.projectType === 'routine' ||
      deletedProjects.has(projName) ||
      (w.projectId ? deletedProjectIds.has(w.projectId) : false)
    ) {
      continue;
    }

    const exists = updatedProjects.some(
      (p) =>
        (w.projectId ? p.id === w.projectId : p.name === projName) &&
        (p.scope || 'work') === (w.scope || 'work')
    );
    if (!exists) {
      // 依序挑選尚未使用之顏色標籤
      const nextColor =
        PROJECT_COLORS.find((c) => !usedColors.has(c.hex))?.hex ||
        PROJECT_COLORS[updatedProjects.length % PROJECT_COLORS.length].hex;
      usedColors.add(nextColor);

      const isMaint =
        w.projectType === 'maintenance' ||
        /graylog|zabbix|維運|運維|監控/i.test(projName);
      const newProj: ProjectItem = {
        id: w.projectId || `proj-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: projName,
        color: nextColor,
        status: 'active',
        scope: w.scope || 'work',
        projectType: isMaint ? 'maintenance' : 'project',
        estimatedHours: isMaint ? 0 : 20,
        description: isMaint
          ? `常態維運案：於工時「${w.taskName}」填報時自訂建立 (無固定起訖)`
          : `於工時「${w.taskName}」填報時自訂建立之專案`,
        createdAt: new Date().toISOString(),
      };
      updatedProjects = [newProj, ...updatedProjects];
      changed = true;
    }
  }

  return changed ? updatedProjects : currentProjects;
}

export function loadProjects(existingWorklogs?: WorklogItem[]): ProjectItem[] {
  if (typeof window === 'undefined') return [];
  try {
    let projects: ProjectItem[];
    const raw = localStorage.getItem(PROJECTS_KEY);
    const deletedProjects = getDeletedProjectNames();
    const deletedProjectIds = getDeletedProjectIds();

    if (!raw) {
      projects = getInitialDemoProjects().filter(
        (p) => !deletedProjects.has(p.name) && !deletedProjectIds.has(p.id)
      );
      localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
    } else {
      projects = (JSON.parse(raw) as ProjectItem[]).map((project) => ({
        ...project,
        scope: project.scope || 'work',
      }));
      // 排除已刪除的專案以及非專案之標籤（休假、會議、例行事務非專案）
      projects = projects.filter(
        (p) =>
          !deletedProjects.has(p.name) &&
          !deletedProjectIds.has(p.id) &&
          !(p.notionPageId && deletedProjectIds.has(p.notionPageId)) &&
          !p.name.includes('休假') &&
          p.name !== '無' &&
          p.name !== '團隊會議' &&
          !p.name.includes('會議') &&
          p.name !== '例會' &&
          p.name !== '例行事務' &&
          !p.name.includes('例行事務') &&
          !p.name.includes('庶務')
      );

      // 自動升級既有快取：為缺少 projectType 或包含 Graylog/Zabbix 者自動補上維運案屬性
      projects = projects.map((p) => {
        const isMaint = /graylog|zabbix|維運|運維|監控/i.test(p.name);
        if (isMaint && p.projectType !== 'maintenance') {
          return { ...p, projectType: 'maintenance' as ProjectType, estimatedHours: p.estimatedHours || 0 };
        }
        if (!p.projectType) {
          const type: ProjectType = isMaint ? 'maintenance' : 'project';
          return { ...p, projectType: type };
        }
        return p;
      });

      // 自動補齊尚未被刪除的核心專案 (包含 Zabbix, Graylog 等)
      const coreProjects = getInitialDemoProjects();
      let hasChanges = false;
      for (const core of coreProjects) {
        if (!deletedProjects.has(core.name) && !projects.some((p) => p.name === core.name)) {
          projects.push(core);
          hasChanges = true;
        }
      }
      // 同步過濾無任何工時之舊 mock 專案（「客戶專案」、「產品重構」、「團隊會議」）
      const mockNamesToRemove = ['客戶專案', '產品重構', '團隊會議'];
      const filtered = projects.filter((p) => {
        if (!mockNamesToRemove.includes(p.name)) return true;
        const hasLogs = existingWorklogs?.some((w) => w.project === p.name);
        return hasLogs;
      });
      if (filtered.length !== projects.length) {
        projects = filtered;
        hasChanges = true;
      }
      if (hasChanges) {
        localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
      }
    }

    // 若傳入工時資料，自動掃描並補齊尚未登記之自訂專案
    if (existingWorklogs && existingWorklogs.length > 0) {
      const merged = syncProjectsWithWorklogs(existingWorklogs, projects);
      if (merged !== projects) {
        saveProjects(merged);
        return merged;
      }
    }

    return projects;
  } catch (err) {
    console.error('Failed to load projects from localStorage:', err);
    return [];
  }
}

export function saveProjects(projects: ProjectItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  } catch (err) {
    console.error('Failed to save projects to localStorage:', err);
  }
}
