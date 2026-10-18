'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { WorklogItem } from '@/types/worklog';
import { ProjectItem, ProjectScope } from '@/types/project';
import { Header } from '@/components/Header';
import { WeekGrid } from '@/components/WeekGrid';
import { GanttView } from '@/components/GanttView';
import { ProjectsView } from '@/components/ProjectsView';
import { WorklogModal } from '@/components/WorklogModal';
import { ProjectModal } from '@/components/ProjectModal';
import { ToastContainer, ToastMessage } from '@/components/Toast';
import {
  loadWorklogs,
  saveWorklogs,
  loadProjects,
  saveProjects,
  syncProjectsWithWorklogs,
  addDeletedWorklogId,
  removeDeletedProjectName,
  addDeletedProjectId,
  removeDeletedProjectId,
} from '@/lib/storage';
import {
  migrateWorklogProjectLinks,
  removeProjectAndWorklogs,
  renameProjectAndWorklogs,
} from '@/lib/sync';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, isWithinInterval, parseISO } from 'date-fns';
import { CountryCode, getCountryDefinition } from '@/lib/holidays';
import { SettingsModal } from '@/components/SettingsModal';

export default function TimeCraftApp() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'grid' | 'gantt' | 'projects'>('grid');
  const [worklogs, setWorklogs] = useState<WorklogItem[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialData, setModalInitialData] = useState<Partial<WorklogItem> | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [selectedProjectForEdit, setSelectedProjectForEdit] = useState<ProjectItem | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>('TW');
  const [selectedScope, setSelectedScope] = useState<ProjectScope | 'all'>('work');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // 週一為一週開始
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });

  // 載入瀏覽器 localStorage 快取。
  useEffect(() => {
    try {
      const savedCountry = localStorage.getItem('timecraft_country_calendar') as CountryCode;
      if (savedCountry && (savedCountry === 'TW' || savedCountry === 'JP' || savedCountry === 'US' || savedCountry === 'SG')) {
        setSelectedCountry(savedCountry);
      }
    } catch {
      // ignore
    }

    // 自動依據現存工時補齊尚未建立之自訂專案（如「Graylog 系統設計」）
    const loadedWorklogs = loadWorklogs();
    const loadedProjects = loadProjects(loadedWorklogs);
    const linkedWorklogs = migrateWorklogProjectLinks(loadedWorklogs, loadedProjects);
    saveWorklogs(linkedWorklogs);
    setWorklogs(linkedWorklogs);
    setProjects(loadedProjects);

  }, []);

  // Toast 輔助
  const addToast = (type: ToastMessage['type'], title: string, message?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // 篩選當週工時
  const scopedWorklogs = worklogs.filter(
    (worklog) => selectedScope === 'all' || (worklog.scope || 'work') === selectedScope
  );
  const scopedProjects = projects.filter(
    (project) => selectedScope === 'all' || (project.scope || 'work') === selectedScope
  );
  const allCurrentWeekWorklogs = worklogs.filter((w) => {
    try {
      const itemDate = parseISO(w.date);
      return isWithinInterval(itemDate, { start: weekStart, end: weekEnd });
    } catch {
      return false;
    }
  });
  const currentWeekWorklogs = allCurrentWeekWorklogs.filter(
    (worklog) => selectedScope === 'all' || (worklog.scope || 'work') === selectedScope
  );

  // 統計數據
  const totalHours = currentWeekWorklogs.reduce((sum, w) => sum + w.hours, 0);
  const workHours = allCurrentWeekWorklogs
    .filter((item) => (item.scope || 'work') === 'work')
    .reduce((sum, item) => sum + item.hours, 0);
  const personalHours = allCurrentWeekWorklogs
    .filter((item) => item.scope === 'personal')
    .reduce((sum, item) => sum + item.hours, 0);

  // 週次跳轉處理
  const handlePrevWeek = () => setCurrentDate((prev) => subWeeks(prev, 1));
  const handleNextWeek = () => setCurrentDate((prev) => addWeeks(prev, 1));
  const handleToday = () => setCurrentDate(new Date());

  // 快捷功能：快速登記休假
  const handleOpenLeaveModal = useCallback((dateStr?: string) => {
    const targetDate = dateStr || format(new Date(), 'yyyy-MM-dd');
    setModalInitialData({
      scope: selectedScope === 'personal' ? 'personal' : 'work',
      taskName: '特休 / 全天休假',
      project: '休假',
      category: 'Leave',
      date: targetDate,
      startTime: '09:00',
      endTime: '18:00',
      hours: 8,
      progress: 100,
      notes: '個人特休 (專案與甘特圖自動忽略排程進度)',
      isLeave: true,
    });
    setIsModalOpen(true);
  }, [selectedScope]);

  // 快捷功能：快速登記中午午休 (預設 12:30~13:30，1小時，工作日/非上班日均可，填入後可自由微調)
  const handleOpenLunchModal = useCallback((dateStr?: string) => {
    const targetDate = dateStr || format(new Date(), 'yyyy-MM-dd');
    setModalInitialData({
      scope: selectedScope === 'personal' ? 'personal' : 'work',
      taskName: '中午午休',
      project: '無',
      category: 'Leave',
      date: targetDate,
      startTime: '12:30',
      endTime: '13:30',
      hours: 1,
      progress: 100,
      notes: '例行中午午休 (12:30~13:30，1小時)，不排入專案甘特圖',
      isLeave: true,
    });
    setIsModalOpen(true);
  }, [selectedScope]);

  // 全局快捷鍵 Alt+L：快速登記休假；Alt+U：快速登記中午午休
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // 避免在 input/textarea 編輯文字時誤觸發
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
        return;
      }
      if ((e.altKey || e.metaKey) && (e.key === 'l' || e.key === 'L')) {
        e.preventDefault();
        handleOpenLeaveModal();
      } else if ((e.altKey || e.metaKey) && (e.key === 'u' || e.key === 'U')) {
        e.preventDefault();
        handleOpenLunchModal();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [handleOpenLeaveModal, handleOpenLunchModal]);

  // 切換國家/地區行事曆
  const handleSelectCountry = (country: CountryCode) => {
    setSelectedCountry(country);
    try {
      localStorage.setItem('timecraft_country_calendar', country);
    } catch {
      // ignore
    }
    const countryDef = getCountryDefinition(country);
    addToast(
      'info',
      `已切換至 ${countryDef.flag} ${countryDef.name}行事曆`,
      `套用 ${countryDef.sourceName} 2026 國假與休假規則`
    );
  };

  // 點擊空白時間槽或選取範圍
  const handleOpenSlot = (dateStr: string, startTime: string, endTime?: string) => {
    const isLunchSlot = startTime === '12:30' && (endTime === '13:30' || !endTime);
    setModalInitialData({
      scope: selectedScope === 'personal' ? 'personal' : 'work',
      taskName: isLunchSlot ? '中午午休' : '',
      project: isLunchSlot ? '無' : undefined,
      category: isLunchSlot ? 'Leave' : undefined,
      date: dateStr,
      startTime,
      endTime: endTime || (isLunchSlot ? '13:30' : startTime === '23:30' ? '24:00' : undefined),
      hours: isLunchSlot ? 1 : undefined,
      progress: isLunchSlot ? 100 : undefined,
      notes: isLunchSlot ? '例行中午午休 (12:30~13:30，1小時)，不排入專案甘特圖' : '',
      isLeave: isLunchSlot,
    });
    setIsModalOpen(true);
  };

  // 點擊既有工時卡片進行編輯
  const handleEditItem = (item: WorklogItem) => {
    setModalInitialData(item);
    setIsModalOpen(true);
  };

  // 儲存工時 (新增或更新)
  const handleSaveWorklog = (savedItem: WorklogItem) => {
    let normalizedItem = savedItem;
    const isProjectWorklog =
      savedItem.project &&
      savedItem.project !== '無' &&
      savedItem.project !== '休假' &&
      !savedItem.project.includes('休假') &&
      !savedItem.isLeave &&
      savedItem.category !== 'Leave' &&
      savedItem.category !== 'Meeting' &&
      savedItem.category !== 'Routine';

    if (isProjectWorklog) {
      const existingProject = projects.find(
        (project) =>
          (savedItem.projectId ? project.id === savedItem.projectId : project.name === savedItem.project) &&
          (project.scope || 'work') === (savedItem.scope || 'work')
      );
      if (existingProject) {
        normalizedItem = { ...savedItem, projectId: existingProject.id, scope: existingProject.scope };
      } else {
        const updatedProjects = syncProjectsWithWorklogs([savedItem], projects);
        const newProject = updatedProjects.find(
          (project) => project.name === savedItem.project && project.scope === savedItem.scope
        );
        if (newProject) {
          normalizedItem = { ...savedItem, projectId: newProject.id };
          setProjects(updatedProjects);
          saveProjects(updatedProjects);
        }
      }
    }

    setWorklogs((prev) => {
      const existsIndex = prev.findIndex((w) => w.id === normalizedItem.id);
      let updated: WorklogItem[];
      if (existsIndex >= 0) {
        updated = [...prev];
        updated[existsIndex] = normalizedItem;
        addToast('success', '工時更新成功', `${normalizedItem.taskName} (${normalizedItem.hours}h) 已更新至本地快取`);
      } else {
        updated = [normalizedItem, ...prev];
        addToast('success', '工時登記成功', `${normalizedItem.taskName} (${normalizedItem.hours}h) 已排入週時程`);
      }
      saveWorklogs(updated);
      return updated;
    });
  };

  // 拖曳改期 (Drag & Drop 跨日/跨時段)
  const handleRescheduleWorklog = (updatedItem: WorklogItem) => {
    setWorklogs((prev) => {
      const existsIndex = prev.findIndex((w) => w.id === updatedItem.id);
      if (existsIndex === -1) return prev;
      const updated = [...prev];
      updated[existsIndex] = updatedItem;
      saveWorklogs(updated);
      return updated;
    });
    addToast(
      'success',
      '工時排程已調整',
      `已將「${updatedItem.taskName}」移至 ${updatedItem.date} (${updatedItem.startTime} - ${updatedItem.endTime})`
    );
  };

  // 刪除本機工時。
  const handleDeleteWorklog = async (id: string) => {
    const target = worklogs.find((w) => w.id === id);
    if (!target) return;

    try {
      addDeletedWorklogId(id, target.notionPageId);
      setWorklogs((prev) => {
        const updated = prev.filter((w) => w.id !== id);
        saveWorklogs(updated);
        return updated;
      });
      addToast('info', '工時已刪除', `「${target.taskName}」已自這個瀏覽器移除`);
    } catch (error) {
      addToast('error', '刪除失敗', error instanceof Error ? error.message : '請稍後重試');
    }
  };

  // 儲存專案 (新增或編輯)
  const handleSaveProject = (savedProj: ProjectItem) => {
    // 使用者主動建立或儲存專案時，將其移出刪除黑名單
    removeDeletedProjectName(savedProj.name);
    removeDeletedProjectId(savedProj.id, savedProj.notionPageId);

    const result = renameProjectAndWorklogs(projects, worklogs, savedProj);
    saveProjects(result.projects);
    saveWorklogs(result.worklogs);
    setProjects(result.projects);
    setWorklogs(result.worklogs);
    addToast(
      'success',
      projects.some((project) => project.id === savedProj.id) ? '專案更新成功' : '專案新增成功',
      result.renamedCount > 0 ? `已同步更新 ${result.renamedCount} 筆關聯工時` : `已儲存「${savedProj.name}」`
    );

  };

  // 刪除專案 (依需求連鎖刪除所有相關之每日工時記錄)
  const handleDeleteProject = async (id: string) => {
    const targetProj = projects.find((p) => p.id === id);
    if (!targetProj) return;

    try {
      const result = removeProjectAndWorklogs(projects, worklogs, id);
      addDeletedProjectId(targetProj.id, targetProj.notionPageId);
      result.removedWorklogs.forEach((item) => addDeletedWorklogId(item.id, item.notionPageId));
      saveProjects(result.projects);
      saveWorklogs(result.worklogs);
      setProjects(result.projects);
      setWorklogs(result.worklogs);
      addToast('success', '專案及關聯工時已刪除', `已刪除「${targetProj.name}」及 ${result.removedWorklogs.length} 筆工時`);
    } catch (error) {
      addToast('error', '專案刪除失敗', error instanceof Error ? error.message : '請稍後重試');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      {/* 頂部導覽列 */}
      <Header
        currentDate={currentDate}
        weekStart={weekStart}
        weekEnd={weekEnd}
        viewMode={viewMode}
        totalHours={totalHours}
        workHours={workHours}
        personalHours={personalHours}
        selectedScope={selectedScope}
        onSelectScope={setSelectedScope}
        selectedCountry={selectedCountry}
        onSelectCountry={handleSelectCountry}
        onPrevWeek={handlePrevWeek}
        onNextWeek={handleNextWeek}
        onToday={handleToday}
        onViewChange={setViewMode}
        onOpenAddModal={() => {
          setModalInitialData({
            scope: selectedScope === 'personal' ? 'personal' : 'work',
            project: '__custom__',
          });
          setIsModalOpen(true);
        }}
        onOpenLeaveModal={() => handleOpenLeaveModal()}
        onOpenLunchModal={() => handleOpenLunchModal()}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* 主體展示積木 (週網格 / 甘特圖 / 專案管理) */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8">
        {viewMode === 'grid' && (
          <WeekGrid
            weekStart={weekStart}
            worklogs={currentWeekWorklogs}
            country={selectedCountry}
            onOpenSlot={handleOpenSlot}
            onEditItem={handleEditItem}
            onRescheduleItem={handleRescheduleWorklog}
          />
        )}

        {viewMode === 'gantt' && (
          <GanttView
            weekStart={weekStart}
            worklogs={currentWeekWorklogs}
            onEditItem={handleEditItem}
            projects={projects}
          />
        )}

        {viewMode === 'projects' && (
          <ProjectsView
            projects={scopedProjects}
            worklogs={scopedWorklogs}
            onOpenAddModal={() => {
              setSelectedProjectForEdit(null);
              setIsProjectModalOpen(true);
            }}
            onEditProject={(proj) => {
              setSelectedProjectForEdit(proj);
              setIsProjectModalOpen(true);
            }}
            onDeleteProject={handleDeleteProject}
          />
        )}
      </main>

      {/* 工時填報彈窗 (支援 00:00 ~ 24:00 與動態專案列表) */}
      <WorklogModal
        key={`worklog-modal-${selectedScope}`}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveWorklog}
        onDelete={handleDeleteWorklog}
        initialData={modalInitialData}
        projects={projects}
        country={selectedCountry}
        defaultScope={selectedScope === 'personal' ? 'personal' : 'work'}
      />

      {/* 專案新增與編輯彈窗 */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSave={handleSaveProject}
        onDelete={handleDeleteProject}
        initialData={selectedProjectForEdit}
        defaultScope={selectedScope === 'personal' ? 'personal' : 'work'}
      />

      {/* 提示訊息通知積木 */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
