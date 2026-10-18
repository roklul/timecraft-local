'use client';

import React, { useState, useEffect } from 'react';
import { WorklogItem, CategoryType } from '@/types/worklog';
import {
  TIME_SLOTS,
  END_TIME_SLOTS,
  DEFAULT_PROJECTS,
  CATEGORY_CONFIG,
  PROJECT_CATEGORIES,
  MAINTENANCE_CATEGORIES,
  calculateHours,
} from '@/lib/constants';
import { X, Clock, Calendar, Briefcase, Tag, Percent, FileText, Trash2, Sparkles, Wrench, Target, Users, ClipboardList } from 'lucide-react';

import { ProjectItem, ProjectScope } from '@/types/project';
import { getDayInfo, CountryCode } from '@/lib/holidays';

interface WorklogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: WorklogItem) => void;
  onDelete?: (id: string) => void;
  initialData?: Partial<WorklogItem> | null;
  projects?: ProjectItem[];
  country?: CountryCode;
  defaultScope?: ProjectScope;
}

export const WorklogModal: React.FC<WorklogModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialData,
  projects = [],
  country = 'TW',
  defaultScope = 'work',
}) => {
  const [scope, setScope] = useState<ProjectScope>(defaultScope);
  const availableProjects = React.useMemo(() => {
    const list =
      projects.length > 0
        ? projects.filter((p) => (p.scope || 'work') === scope).map((p) => {
            const isMaint =
              p.projectType === 'maintenance' ||
              /graylog|zabbix|維運|運維|監控/i.test(p.name);
            return {
              name: p.name,
              id: p.id,
              color: p.color,
              projectType: isMaint ? ('maintenance' as const) : ('project' as const),
            };
          })
        : DEFAULT_PROJECTS.map((p) => {
            const isMaint =
              p.projectType === 'maintenance' ||
              /graylog|zabbix|維運|運維|監控/i.test(p.name);
            return {
              name: p.name,
              id: undefined,
              color: p.color,
              projectType: isMaint ? ('maintenance' as const) : ('project' as const),
            };
          });
    return list;
  }, [projects, scope]);

  const isMeetingName = (name: string) =>
    name === '團隊會議' || name === '會議' || name.includes('會議') || name === '例會';

  const isRoutineName = (name: string) =>
    name === '例行事務' || name.includes('例行事務') || name.includes('庶務');

  const maintenanceProjects = React.useMemo(
    () =>
      availableProjects.filter(
        (p) => p.name !== '休假' && p.name !== '無' && !isMeetingName(p.name) && !isRoutineName(p.name) && p.projectType === 'maintenance'
      ),
    [availableProjects]
  );

  const standardProjects = React.useMemo(
    () =>
      availableProjects.filter(
        (p) => p.name !== '休假' && p.name !== '無' && !isMeetingName(p.name) && !isRoutineName(p.name) && p.projectType !== 'maintenance'
      ),
    [availableProjects]
  );

  const defaultProjName = standardProjects[0]?.name || maintenanceProjects[0]?.name || 'AI 開發實戰';

  const [taskName, setTaskName] = useState('');
  const [projectCategory, setProjectCategory] = useState<'project' | 'maintenance' | 'meeting' | 'routine'>('project');
  const [project, setProject] = useState(
    standardProjects[0]?.name || maintenanceProjects[0]?.name || '__custom__'
  );
  const [customProject, setCustomProject] = useState('');
  const [category, setCategory] = useState<CategoryType>('Coding');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:30');
  const [hours, setHours] = useState(1.5);
  const [progress, setProgress] = useState(50);
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const selectedDayStatus = React.useMemo(
    () => getDayInfo(date || new Date(), country),
    [date, country]
  );

  const activeCategories = React.useMemo(() => {
    if (projectCategory === 'maintenance') {
      return MAINTENANCE_CATEGORIES;
    }
    if (projectCategory === 'meeting') {
      return ['Meeting'] as CategoryType[];
    }
    if (projectCategory === 'routine') {
      return ['Routine'] as CategoryType[];
    }
    return PROJECT_CATEGORIES;
  }, [projectCategory]);

  const isLunchTime =
    (startTime === '12:30' && endTime === '13:30') ||
    taskName.includes('午休') ||
    taskName.includes('午餐');

  const isStandardProject =
    projectCategory === 'project' &&
    category !== 'Leave' &&
    !isLunchTime;

  const isEditing = !!initialData?.id;

  useEffect(() => {
    if (initialData) {
      setScope(initialData.scope || defaultScope);
      setTaskName(initialData.taskName || '');
      const proj = initialData.project || defaultProjName;
      let initialProgress = initialData.progress ?? 50;

      if (initialData.category === 'Leave' || initialData.isLeave || proj === '無' || proj === '休假') {
        setProjectCategory('project');
        setProject('無');
        setCustomProject('');
        initialProgress = 100;
      } else if (initialData.category === 'Meeting' || proj === '例行會議' || proj.includes('會議')) {
        setProjectCategory('meeting');
        setProject('例行會議');
        setCustomProject('');
        initialProgress = 100;
      } else if (
        initialData.category === 'Routine' ||
        initialData.projectType === 'routine' ||
        proj === '例行事務' ||
        proj.includes('例行事務') ||
        proj.includes('庶務')
      ) {
        setProjectCategory('routine');
        setProject('例行事務');
        setCustomProject('');
        initialProgress = 100;
      } else if (
        maintenanceProjects.some((p) => p.name === proj) ||
        /graylog|zabbix|維運|運維|監控/i.test(proj)
      ) {
        setProjectCategory('maintenance');
        if (maintenanceProjects.some((p) => p.name === proj)) {
          setProject(proj);
          setCustomProject('');
        } else {
          setProject('__custom__');
          setCustomProject(proj);
        }
        initialProgress = 100;
      } else {
        setProjectCategory('project');
        if (standardProjects.some((p) => p.name === proj)) {
          setProject(proj);
          setCustomProject('');
        } else {
          setProject('__custom__');
          setCustomProject(proj);
        }
      }
      setCategory(initialData.category || 'Coding');
      setDate(initialData.date || new Date().toISOString().split('T')[0]);
      const start = initialData.startTime || '09:00';
      const end = initialData.endTime || '10:30';
      setStartTime(start);
      setEndTime(end);
      setHours(initialData.hours ?? calculateHours(start, end));
      setProgress(initialProgress);
      setNotes(initialData.notes || '');
    } else {
      setScope(defaultScope);
      setTaskName('');
      setProjectCategory('project');
      setProject(standardProjects[0]?.name || maintenanceProjects[0]?.name || '__custom__');
      setCustomProject('');
      setCategory('Coding');
      setDate(new Date().toISOString().split('T')[0]);
      setStartTime('09:00');
      setEndTime('10:30');
      setHours(1.5);
      setProgress(50);
      setNotes('');
    }
    setErrorMsg('');
  }, [initialData, isOpen, standardProjects, maintenanceProjects, defaultProjName, defaultScope]);

  const handleTypeTabChange = (type: 'project' | 'maintenance' | 'meeting' | 'routine') => {
    setProjectCategory(type);
    setErrorMsg('');
    if (type === 'maintenance') {
      if (!maintenanceProjects.some((p) => p.name === project)) {
        setProject(maintenanceProjects[0]?.name || '__custom__');
      }
      if (!MAINTENANCE_CATEGORIES.includes(category)) {
        setCategory('Deploy');
      }
      setProgress(100);
    } else if (type === 'project') {
      if (!standardProjects.some((p) => p.name === project)) {
        setProject(standardProjects[0]?.name || '__custom__');
      }
      if (!PROJECT_CATEGORIES.includes(category)) {
        setCategory('Coding');
      }
      setProgress(50);
    } else if (type === 'meeting') {
      setProject('例行會議');
      setCategory('Meeting');
      setProgress(100);
    } else if (type === 'routine') {
      setProject('例行事務');
      setCategory('Routine');
      setProgress(100);
    }
  };

  const handleScopeChange = (nextScope: ProjectScope) => {
    setScope(nextScope);
    const firstProject = projects.find(
      (item) => (item.scope || 'work') === nextScope && item.projectType !== 'maintenance'
    );
    setProject(firstProject?.name || '__custom__');
    setProjectCategory('project');
    setCategory('Coding');
  };

  // 當起訖時間變動時，自動計算工時（以 0.5 為單位）
  const handleStartTimeChange = (newStart: string) => {
    setStartTime(newStart);
    const calculated = calculateHours(newStart, endTime);
    if (calculated <= 0) {
      // 若結束時間早於或等於起始時間，預設加 0.5 小時
      const [h, m] = newStart.split(':').map(Number);
      const endM = m + 30;
      const endH = endM >= 60 ? h + 1 : h;
      const endStr = `${endH.toString().padStart(2, '0')}:${(endM % 60).toString().padStart(2, '0')}`;
      setEndTime(endStr);
      setHours(0.5);
    } else {
      setHours(calculated);
    }
  };

  const handleEndTimeChange = (newEnd: string) => {
    setEndTime(newEnd);
    const calculated = calculateHours(startTime, newEnd);
    if (calculated <= 0) {
      setErrorMsg('結束時間必須晚於開始時間');
    } else {
      setErrorMsg('');
      setHours(calculated);
    }
  };

  // 當工作分類切換時處理專案聯動
  const handleCategoryChange = (newCat: CategoryType) => {
    setCategory(newCat);
    if (newCat === 'Leave') {
      setProject('無');
    } else if (newCat === 'Meeting') {
      setProjectCategory('meeting');
      setProject('例行會議');
    } else if (newCat === 'Routine') {
      setProjectCategory('routine');
      setProject('例行事務');
    } else if (
      projectCategory === 'meeting' ||
      projectCategory === 'routine' ||
      project === '無' ||
      project === '休假' ||
      project === '例行會議' ||
      project === '例行事務'
    ) {
      setProjectCategory('project');
      setProject(standardProjects[0]?.name || maintenanceProjects[0]?.name || defaultProjName);
      setCustomProject('');
    }
  };

  // 快速鍵/快捷功能：中午午休 (預設 12:30 ~ 13:30，1小時，工作日/非上班日均可，填入後可自由微調)
  const handlePresetLunchBreak = () => {
    setTaskName('中午午休');
    setProject('無');
    setProjectCategory('project');
    setCategory('Leave');
    setStartTime('12:30');
    setEndTime('13:30');
    setHours(1);
    setProgress(100);
    setNotes('例行中午午休 (12:30~13:30，1小時)，不排入專案甘特圖');
    setErrorMsg('');
  };

  // 快速鍵/快捷功能：一鍵休假 (Alt+L)
  const handlePresetFullDayLeave = () => {
    setTaskName('特休 / 全天休假');
    setProject('無');
    setCategory('Leave');
    setStartTime('09:00');
    setEndTime('18:00');
    setHours(8);
    setProgress(100);
    setNotes('個人特休 (專案與甘特圖自動忽略排程進度)');
    setErrorMsg('');
  };

  const handlePresetHalfDayLeave = () => {
    setTaskName('半天休假');
    setProject('無');
    setCategory('Leave');
    setStartTime('09:00');
    setEndTime('13:00');
    setHours(4);
    setProgress(100);
    setNotes('半天休假 (專案與甘特圖自動忽略排程進度)');
    setErrorMsg('');
  };

  // 鍵盤快速鍵：按下 Alt+L 自動填報休假，Alt+U 自動填報中午午休
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.altKey || e.metaKey) && (e.key === 'l' || e.key === 'L')) {
        e.preventDefault();
        handlePresetFullDayLeave();
      } else if ((e.altKey || e.metaKey) && (e.key === 'u' || e.key === 'U')) {
        e.preventDefault();
        handlePresetLunchBreak();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let finalTaskName = taskName.trim();
    if (!finalTaskName) {
      if (isLunchTime) {
        finalTaskName = '中午午休';
      } else if (category === 'Leave') {
        finalTaskName = '特休 / 休假';
      } else if (projectCategory === 'routine' || category === 'Routine') {
        finalTaskName = '例行事務';
      } else {
        setErrorMsg('請填寫任務名稱');
        return;
      }
    }

    const isLeaveItem = category === 'Leave' || isLunchTime;
    const isRoutineItem = projectCategory === 'routine' || category === 'Routine';
    let finalProject = project === '__custom__' ? customProject.trim() : project;
    if (isLeaveItem) {
      finalProject = '無';
    } else if (isRoutineItem) {
      finalProject = '例行事務';
    } else if (projectCategory === 'meeting' || category === 'Meeting') {
      finalProject = '例行會議';
    } else if (!finalProject || finalProject === '無') {
      setErrorMsg(projectCategory === 'maintenance' ? '請選擇或填寫維運案名稱' : '請選擇或填寫專案名稱');
      return;
    }

    const calculated = calculateHours(startTime, endTime);
    if (calculated <= 0) {
      setErrorMsg('結束時間必須晚於開始時間');
      return;
    }

    // 驗證 hours 需能被 0.5 整除
    if (hours % 0.5 !== 0 || hours <= 0) {
      setErrorMsg('工時必須為 0.5 小時之倍數');
      return;
    }

    const selectedProject = projects.find(
      (item) =>
        (initialData?.projectId ? item.id === initialData.projectId : item.name === finalProject) &&
        (item.scope || 'work') === scope
    );
    const item: WorklogItem = {
      id: initialData?.id || `wl-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      taskName: finalTaskName,
      project: finalProject,
      projectId: isLeaveItem || isRoutineItem || projectCategory === 'meeting' ? undefined : selectedProject?.id,
      scope,
      category: isLunchTime ? 'Leave' : isRoutineItem ? 'Routine' : category,
      date,
      startTime,
      endTime,
      hours,
      progress: isStandardProject ? Number(progress) : 100,
      notes:
        notes.trim() ||
        (isLunchTime
          ? '例行中午午休 (12:30~13:30，1小時)，不排入專案甘特圖'
          : isRoutineItem
          ? '例行事務 / 日常庶務 (免專案 · 免分類，不排入專案甘特圖)'
          : ''),
      isLeave: isLeaveItem,
      projectType:
        isLeaveItem || projectCategory === 'meeting'
          ? undefined
          : projectCategory === 'routine'
          ? 'routine'
          : projectCategory,
      syncStatus: 'pending',
      notionPageId: initialData?.notionPageId,
      updatedAt: new Date().toISOString(),
    };

    onSave(item);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
              ⏱
            </div>
            <div>
              <h2 className="text-lg font-semibold text-zinc-100">
                {isEditing ? '編輯工時記錄' : '填報工時 (Time-blocking)'}
              </h2>
              <p className="text-xs text-zinc-400">最小顆粒度 0.5 hr，自動同步</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-100 rounded-lg hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-sm">
          {/* 快捷鍵 / 一鍵快速填報 (中午午休、全天休假、半天休假) */}
          <div className="flex items-center justify-between p-2.5 bg-zinc-950/80 border border-zinc-800 rounded-xl text-xs flex-wrap gap-2">
            <div className="flex items-center gap-1.5 text-zinc-400">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-medium text-zinc-300">快速填報：</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handlePresetLunchBreak}
                className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 hover:border-amber-400/70 transition flex items-center gap-1.5 text-[11px] font-medium shadow-sm"
                title="快速填報中午午休 12:30~13:30 (1小時，工作日/非上班日均可，填入後可自由微調起訖時間；快速鍵：Alt+U)"
              >
                <span>🍱 中午午休 (1h)</span>
              </button>
              <button
                type="button"
                onClick={handlePresetFullDayLeave}
                className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 hover:border-amber-500/50 transition flex items-center gap-1.5 text-[11px]"
                title="快速填報全天休假 8 小時 (快速鍵：Alt+L)"
              >
                <span>🏖️ 一鍵全天休假 (8h)</span>
              </button>
              <button
                type="button"
                onClick={handlePresetHalfDayLeave}
                className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 hover:border-amber-500/50 transition flex items-center gap-1.5 text-[11px]"
                title="快速填報半天休假 4 小時"
              >
                <span>🏖️ 半天休假 (4h)</span>
              </button>
            </div>
          </div>
          {errorMsg && (
            <div className="p-3 bg-red-500/15 border border-red-500/40 rounded-xl text-red-300 text-xs flex items-center gap-2">
              <span>⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 任務名稱 (午休、例行事務免填) */}
          <div>
            <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
              <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-zinc-400" />
                <span>任務名稱</span>
                {!isLunchTime && category !== 'Leave' && projectCategory !== 'routine' && (
                  <span className="text-red-400">*</span>
                )}
              </label>
              {isLunchTime && (
                <span className="text-[11px] font-medium text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <span>🍱</span>
                  <span>午休免填（留空自動登記為「中午午休」）</span>
                </span>
              )}
              {!isLunchTime && projectCategory === 'routine' && (
                <span className="text-[11px] font-medium text-sky-300 bg-sky-500/15 border border-sky-500/30 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <span>📋</span>
                  <span>例行事務免填（留空自動登記為「例行事務」）</span>
                </span>
              )}
              {!isLunchTime && projectCategory !== 'routine' && category === 'Leave' && (
                <span className="text-[11px] text-zinc-400">
                  (休假免填，留空自動登記為「特休 / 全天休假」)
                </span>
              )}
            </div>
            <input
              type="text"
              required={!isLunchTime && category !== 'Leave' && projectCategory !== 'routine'}
              placeholder={
                isLunchTime
                  ? '中午午休 (午休免填，留空自動填報)'
                  : category === 'Leave'
                  ? '特休 / 全天休假 (留空自動填報)'
                  : projectCategory === 'routine'
                  ? '例如：信件處理、報表整理、日常庶務 (留空自動登記為「例行事務」)'
                  : '例如：實作個人專案的資料匯出功能'
              }
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700/80 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          {/* 專案與分類 (性質膠囊切換 ＋ 專屬獨立下拉選單 / 例行事務免選專案與分類) */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              {(['work', 'personal'] as ProjectScope[]).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleScopeChange(value)}
                  className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                    scope === value
                      ? value === 'work'
                        ? 'border-blue-500 bg-blue-500/15 text-blue-200'
                        : 'border-purple-500 bg-purple-500/15 text-purple-200'
                      : 'border-zinc-800 bg-zinc-950 text-zinc-400'
                  }`}
                >
                  {value === 'work' ? '💼 工作紀錄' : '🌱 個人學習／開發'}
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-zinc-400" />
                項目性質切換：
              </span>
              {category !== 'Leave' && (
                <div className="flex items-center p-0.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs">
                  <button
                    type="button"
                    onClick={() => handleTypeTabChange('project')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition flex items-center gap-1.5 ${
                      projectCategory === 'project'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                    title="有明確起訖與目標的專案 (排入甘特圖)"
                  >
                    <Target className="w-3 h-3" />
                    <span>專案 ({standardProjects.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTypeTabChange('maintenance')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition flex items-center gap-1.5 ${
                      projectCategory === 'maintenance'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                    title="常態維運任務 (Graylog、Zabbix、告警、持續優化等，不排入甘特圖)"
                  >
                    <Wrench className="w-3 h-3" />
                    <span>維運案 ({maintenanceProjects.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTypeTabChange('meeting')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition flex items-center gap-1.5 ${
                      projectCategory === 'meeting'
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                    title="日常行政、例行開會與內部溝通 (不排入甘特圖)"
                  >
                    <Users className="w-3 h-3" />
                    <span>會議</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTypeTabChange('routine')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition flex items-center gap-1.5 ${
                      projectCategory === 'routine'
                        ? 'bg-sky-600 text-white shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                    title="日常例行事務 (信件處理、報表整理、行政庶務等，免專案、免工作分類，不排入甘特圖)"
                  >
                    <ClipboardList className="w-3 h-3" />
                    <span>例行事務</span>
                  </button>
                </div>
              )}
            </div>

            {projectCategory === 'routine' ? (
              <div className="w-full p-3.5 bg-sky-950/25 border border-sky-800/40 rounded-xl flex items-center justify-between text-xs pt-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-300 flex items-center justify-center shrink-0">
                    <ClipboardList className="w-4 h-4 text-sky-400" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-sky-200 flex items-center gap-1.5">
                      <span>📋 例行事務 / 日常庶務</span>
                      <span className="text-[10px] bg-sky-500/20 text-sky-300 px-1.5 py-0.5 rounded border border-sky-500/30">
                        免專案 · 免工作分類
                      </span>
                    </div>
                    <p className="text-[11px] text-sky-400/80 mt-0.5">
                      快速登錄日常雜項（信件處理、週報、行政庶務等），自動歸納且不排入甘特圖
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-medium text-sky-300 bg-sky-500/15 border border-sky-500/30 px-2.5 py-1 rounded-md hidden sm:inline-block shrink-0">
                  ✨ 簡單快速
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* 所屬專案/維運案下拉 */}
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-zinc-400" />
                    {projectCategory === 'maintenance'
                      ? '所屬維運案'
                      : projectCategory === 'project'
                      ? '所屬專案'
                      : '行政項目'}
                  </label>
                  {category === 'Leave' ? (
                    <div className="w-full h-[42px] px-3.5 py-2 bg-zinc-950/90 border border-zinc-800 rounded-xl text-zinc-400 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span>🏖️</span>
                        <span className="text-zinc-200 font-medium">無專案</span>
                      </div>
                      <span className="text-zinc-500 text-[11px]">（休假不屬於任何專案）</span>
                    </div>
                  ) : projectCategory === 'maintenance' ? (
                    <div>
                      <select
                        value={project}
                        onChange={(e) => setProject(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-950 border border-emerald-500/50 focus:border-emerald-400 rounded-xl text-zinc-100 text-sm focus:outline-none transition shadow-sm"
                      >
                        {maintenanceProjects.length > 0 ? (
                          maintenanceProjects.map((p) => (
                            <option key={p.name} value={p.name}>
                              🛠️ {p.name}
                            </option>
                          ))
                        ) : (
                          <option value="" disabled>尚未建立維運案</option>
                        )}
                        {project &&
                          project !== '__custom__' &&
                          !maintenanceProjects.some((p) => p.name === project) && (
                            <option key={project} value={project}>
                              🛠️ {project}
                            </option>
                          )}
                        <option value="__custom__">＋ 自訂新維運案...</option>
                      </select>
                      {project === '__custom__' && (
                        <input
                          type="text"
                          required
                          placeholder="例如：Prometheus、K8s 集群維護"
                          value={customProject}
                          onChange={(e) => setCustomProject(e.target.value)}
                          className="mt-2 w-full px-3 py-2 bg-zinc-950 border border-emerald-500/50 rounded-xl text-zinc-100 text-xs focus:outline-none focus:border-emerald-400 placeholder-zinc-500"
                        />
                      )}
                      <p className="mt-1 text-[11px] text-emerald-400/90 flex items-center gap-1">
                        <span>🛠️ 常態維運案（無起訖，累計工時，不排入甘特圖）</span>
                      </p>
                    </div>
                  ) : projectCategory === 'project' ? (
                    <div>
                      <select
                        value={project}
                        onChange={(e) => setProject(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-950 border border-blue-500/50 focus:border-blue-400 rounded-xl text-zinc-100 text-sm focus:outline-none transition shadow-sm"
                      >
                        {standardProjects.length > 0 ? (
                          standardProjects.map((p) => (
                            <option key={p.name} value={p.name}>
                              📌 {p.name}
                            </option>
                          ))
                        ) : (
                          <option value="" disabled>尚未建立一般專案</option>
                        )}
                        {project &&
                          project !== '__custom__' &&
                          !standardProjects.some((p) => p.name === project) && (
                            <option key={project} value={project}>
                              📌 {project}
                            </option>
                          )}
                        <option value="__custom__">＋ 自訂新專案...</option>
                      </select>
                      {project === '__custom__' && (
                        <input
                          type="text"
                          required
                          placeholder="例如：會員系統 2.0 重構"
                          value={customProject}
                          onChange={(e) => setCustomProject(e.target.value)}
                          className="mt-2 w-full px-3 py-2 bg-zinc-950 border border-blue-500/50 rounded-xl text-zinc-100 text-xs focus:outline-none focus:border-blue-400 placeholder-zinc-500"
                        />
                      )}
                      <p className="mt-1 text-[11px] text-blue-400/90 flex items-center gap-1">
                        <span>📌 一般交付專案（有起訖目標，排入甘特圖）</span>
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="w-full h-[42px] px-3.5 py-2 bg-purple-950/20 border border-purple-800/40 rounded-xl text-purple-200 text-xs flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span>👥</span>
                          <span className="font-semibold text-purple-200">例行會議 / 內部溝通</span>
                        </div>
                        <span className="text-purple-400 text-[11px]">日常行政</span>
                      </div>
                      <p className="mt-1 text-[11px] text-purple-400/90 flex items-center gap-1">
                        <span>👥 例行會議與溝通（非專案，不排入甘特圖）</span>
                      </p>
                    </div>
                  )}
                </div>

                {/* 工作分類 (依專案 vs 維運案動態切換，隱藏休假與開會) */}
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-zinc-400" />
                    工作分類
                  </label>
                  {category === 'Leave' ? (
                    <div className="w-full h-[42px] px-3.5 py-2 bg-zinc-950/90 border border-zinc-800 rounded-xl text-zinc-400 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span>🏖️</span>
                        <span className="text-zinc-200 font-medium">個人休假 / 午休</span>
                      </div>
                      <span className="text-zinc-500 text-[11px]">（自動記錄）</span>
                    </div>
                  ) : projectCategory === 'meeting' ? (
                    <div className="w-full h-[42px] px-3.5 py-2 bg-purple-950/20 border border-purple-800/40 rounded-xl text-purple-200 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span>👥</span>
                        <span className="text-purple-200 font-medium">開會溝通 (Meeting)</span>
                      </div>
                      <span className="text-purple-400 text-[11px]">會議屬性</span>
                    </div>
                  ) : (
                    <select
                      value={category}
                      onChange={(e) => handleCategoryChange(e.target.value as CategoryType)}
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700/80 rounded-xl text-zinc-200 focus:outline-none focus:border-blue-500 transition text-sm"
                    >
                      {activeCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {CATEGORY_CONFIG[cat]?.label || cat} ({cat})
                        </option>
                      ))}
                    </select>
                  )}
                  <p className="mt-1 text-[11px] text-zinc-400">
                    {category === 'Leave'
                      ? '🏖️ 休假或午休登記'
                      : projectCategory === 'maintenance'
                      ? '🛠️ 維運工作性質 (建置導入、系統優化、告警排除、日常維護等)'
                      : projectCategory === 'meeting'
                      ? '👥 會議與內部溝通'
                      : '📌 專案研發性質 (Coding, Design, Review, Planning)'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 日期與時間起訖 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                  記錄日期
                </label>
                {date && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${selectedDayStatus.badgeColorClass}`}
                    title={
                      selectedDayStatus.isHoliday
                        ? `2026 國定假日：${selectedDayStatus.holidayName}`
                        : selectedDayStatus.isWeekend
                        ? '非上班日 (例休)'
                        : '上班工作日'
                    }
                  >
                    {selectedDayStatus.badgeLabel}
                  </span>
                )}
              </div>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700/80 rounded-xl text-zinc-100 text-xs focus:outline-none focus:border-blue-500"
              />
              {date && (
                <p className="mt-1 text-[11px] text-zinc-400">
                  {selectedDayStatus.isHoliday
                    ? `${selectedDayStatus.badgeEmoji} 2026 國假：${selectedDayStatus.holidayName}`
                    : selectedDayStatus.isWeekend
                    ? '🏖️ 週末非上班日（例休）'
                    : '💼 正常上班工作日'}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                起始時間
              </label>
              <select
                value={startTime}
                onChange={(e) => handleStartTimeChange(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700/80 rounded-xl text-zinc-200 text-xs focus:outline-none focus:border-blue-500"
              >
                {TIME_SLOTS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                結束時間
              </label>
              <select
                value={endTime}
                onChange={(e) => handleEndTimeChange(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700/80 rounded-xl text-zinc-200 text-xs focus:outline-none focus:border-blue-500"
              >
                {END_TIME_SLOTS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 工時與進度概覽條 */}
          <div className="p-3.5 bg-zinc-950/80 border border-zinc-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400">計算耗費工時 (顆粒度 0.5h)：</span>
              <span className="text-base font-bold text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-lg border border-blue-500/20">
                {hours.toFixed(1)} hr
              </span>
            </div>

            {isStandardProject ? (
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-zinc-400 flex items-center gap-1">
                    <Percent className="w-3 h-3 text-zinc-500" /> 任務完成進度
                  </span>
                  <span className="font-semibold text-zinc-200">{progress}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={progress}
                  onChange={(e) => setProgress(Number(e.target.value))}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            ) : (
              <div className="flex items-center justify-between pt-1 border-t border-zinc-800/60 text-[11px]">
                <span className="text-zinc-400 flex items-center gap-1.5">
                  {projectCategory === 'maintenance' ? (
                    <span className="text-emerald-400 font-medium">🛠️ 常態維運任務</span>
                  ) : projectCategory === 'meeting' ? (
                    <span className="text-purple-400 font-medium">👥 例行會議溝通</span>
                  ) : projectCategory === 'routine' ? (
                    <span className="text-sky-400 font-medium">📋 例行庶務雜項</span>
                  ) : (
                    <span className="text-amber-400 font-medium">🏖️ 個人休假 / 午休</span>
                  )}
                </span>
                <span className="text-zinc-500">以工時累計記錄，不設百分比進度</span>
              </div>
            )}
          </div>

          {/* 備註 */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">工作詳細備註 / PR 連結</label>
            <textarea
              rows={2}
              placeholder="記錄細部產出、面臨問題或相關連結..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-700/80 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition text-xs"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-zinc-800 mt-4">
            {isEditing && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm('確定要刪除此筆工時記錄嗎？')) {
                    onDelete(initialData!.id!);
                    onClose();
                  }
                }}
                className="px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                刪除
              </button>
            ) : (
              <div></div>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-xl transition"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 rounded-xl shadow-lg shadow-blue-600/20 transition flex items-center gap-1.5"
              >
                儲存工時
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
