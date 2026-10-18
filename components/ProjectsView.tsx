'use client';

import React, { useState } from 'react';
import { ProjectItem } from '@/types/project';
import { WorklogItem } from '@/types/worklog';
import {
  FolderKanban,
  Plus,
  Clock,
  Edit2,
  Layers,
  Trash2,
  Wrench,
  Target,
} from 'lucide-react';

interface ProjectsViewProps {
  projects: ProjectItem[];
  worklogs: WorklogItem[];
  onOpenAddModal: () => void;
  onEditProject: (project: ProjectItem) => void;
  onDeleteProject?: (id: string) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  worklogs,
  onOpenAddModal,
  onEditProject,
  onDeleteProject,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'project' | 'maintenance'>('all');

  // 排除「休假」、「例行會議」與「例行事務」等非專案項目，專注於實質業務專案與常態維運案
  const displayProjects = projects.filter(
    (p) =>
      p.name !== '休假' &&
      !p.name.includes('休假') &&
      p.name !== '無' &&
      p.name !== '團隊會議' &&
      !p.name.includes('會議') &&
      p.name !== '例會' &&
      p.name !== '例行事務' &&
      !p.name.includes('例行事務') &&
      !p.name.includes('庶務')
  );
  const totalProjects = displayProjects.length;

  // 計算每個專案目前累計實際工時與任務數（自動忽略休假）
  const projectStats = React.useMemo(() => {
    return displayProjects.map((p) => {
      const isMaintenance =
        p.projectType === 'maintenance' ||
        /graylog|zabbix|維運|運維|監控/i.test(p.name);

      const relatedLogs = worklogs.filter(
        (w) =>
          (w.projectId ? w.projectId === p.id : w.project === p.name) &&
          !w.isLeave &&
          w.category !== 'Leave' &&
          w.category !== 'Routine' &&
          w.projectType !== 'routine' &&
          !w.project.includes('休假') &&
          !w.taskName.includes('休假')
      );
      const actualHours = relatedLogs.reduce((sum, w) => sum + w.hours, 0);
      const taskCount = relatedLogs.length;
      const progressPercent =
        p.estimatedHours > 0
          ? Math.min(100, Math.round((actualHours / p.estimatedHours) * 100))
          : 0;

      return {
        ...p,
        isMaintenance,
        actualHours,
        taskCount,
        progressPercent,
      };
    });
  }, [displayProjects, worklogs]);

  const maintenanceCount = projectStats.filter((p) => p.isMaintenance).length;
  const standardProjectCount = projectStats.filter((p) => !p.isMaintenance).length;
  const activeCount = projectStats.filter((p) => p.status === 'active').length;

  const totalActualHours = projectStats.reduce((sum, p) => sum + p.actualHours, 0);
  const totalEstimatedHours = projectStats
    .filter((p) => !p.isMaintenance)
    .reduce((sum, p) => sum + p.estimatedHours, 0);

  // 依選取的分類過濾顯示清單
  const filteredProjects = projectStats.filter((p) => {
    if (filterType === 'project') return !p.isMaintenance;
    if (filterType === 'maintenance') return p.isMaintenance;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* 頂部操作與看板列 */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <FolderKanban className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-zinc-100">專案與常態維運看板 (Projects & Maintenance)</h2>
          </div>
          <p className="text-xs text-zinc-400">
            支援「一般專案 (目標起訖)」與「常態維運案 (無固定起訖，如 Graylog、Zabbix 監控告警)」，累計工時清晰對齊。
          </p>
        </div>

        {/* 動作按鈕群 */}
        <div className="flex items-center flex-wrap gap-3">
          <span className="text-[11px] text-zinc-400 bg-zinc-850 px-2.5 py-1.5 rounded-xl border border-zinc-800 flex items-center gap-1.5">
            🏖️ 已自動過濾休假與會議工時
          </span>


          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>新增項目</span>
          </button>
        </div>
      </div>

      {/* KPI 指標卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-xl">
          <div className="text-xs text-zinc-400 mb-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            總項目數
          </div>
          <div className="text-2xl font-bold text-zinc-100 font-mono">
            {totalProjects}{' '}
            <span className="text-xs text-zinc-400 font-normal">
              ({standardProjectCount} 專案 / {maintenanceCount} 維運)
            </span>
          </div>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-xl">
          <div className="text-xs text-zinc-400 mb-1 flex items-center gap-1">
            <Wrench className="w-3.5 h-3.5 text-emerald-400" />
            常態維運案
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">
            {maintenanceCount}{' '}
            <span className="text-xs text-zinc-500 font-normal">個 (無固定起訖)</span>
          </div>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-xl">
          <div className="text-xs text-zinc-400 mb-1 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            累計投入工時
          </div>
          <div className="text-2xl font-bold text-blue-400 font-mono">
            {totalActualHours.toFixed(1)} <span className="text-xs text-zinc-500 font-normal">hr</span>
          </div>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-xl">
          <div className="text-xs text-zinc-400 mb-1 flex items-center gap-1">
            <Target className="w-3.5 h-3.5 text-indigo-400" />
            專案目標總預估
          </div>
          <div className="text-2xl font-bold text-indigo-400 font-mono">
            {totalEstimatedHours.toFixed(1)}{' '}
            <span className="text-xs text-zinc-500 font-normal">hr ({activeCount} 進行中)</span>
          </div>
        </div>
      </div>

      {/* 類別切換篩選列 */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition ${
              filterType === 'all'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
            }`}
          >
            全部項目 ({totalProjects})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('project')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1.5 ${
              filterType === 'project'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>📌 一般專案 ({standardProjectCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterType('maintenance')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1.5 ${
              filterType === 'maintenance'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>🛠️ 常態維運案 ({maintenanceCount})</span>
          </button>
        </div>

        <span className="text-[11px] text-zinc-500 hidden sm:inline">
          顯示 {filteredProjects.length} 個項目
        </span>
      </div>

      {/* 專案卡片列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProjects.map((p) => {
          const isOverHours = !p.isMaintenance && p.estimatedHours > 0 && p.actualHours > p.estimatedHours;

          return (
            <div
              key={p.id}
              className={`bg-zinc-900 border rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all group ${
                p.isMaintenance ? 'border-zinc-800 hover:border-emerald-500/40' : 'border-zinc-800 hover:border-zinc-700/80'
              }`}
            >
              <div>
                {/* 頂部標題與狀態 */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-3.5 h-3.5 rounded-lg flex-shrink-0"
                      style={{ backgroundColor: p.color }}
                    />
                    <h3 className="font-semibold text-sm text-zinc-100 truncate group-hover:text-blue-300 transition">
                      {p.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium border flex items-center gap-1 ${
                        p.isMaintenance
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                          : 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                      }`}
                    >
                      {p.isMaintenance ? <Wrench className="w-2.5 h-2.5" /> : <Target className="w-2.5 h-2.5" />}
                      <span>{p.isMaintenance ? '常態維運' : '一般專案'}</span>
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-md border ${
                      p.scope === 'personal'
                        ? 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                        : 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                    }`}>
                      {p.scope === 'personal' ? '🌱 個人' : '💼 工作'}
                    </span>

                    <button
                      onClick={() => onEditProject(p)}
                      className="p-1 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition"
                      title={p.isMaintenance ? '編輯維運案' : '編輯專案'}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {onDeleteProject && (
                      <button
                        onClick={() => {
                          const typeLabel = p.isMaintenance ? '維運案' : '專案';
                          if (
                            confirm(
                              `確定要刪除${typeLabel}「${p.name}」嗎？\n\n⚠️ 注意：此${typeLabel}關聯的所有每日工時記錄 (${p.taskCount} 筆) 將會一併徹底刪除！`
                            )
                          ) {
                            onDeleteProject(p.id);
                          }
                        }}
                        className="p-1 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                        title={`刪除${p.isMaintenance ? '維運案' : '專案'} (含關聯工時)`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* 說明文字 */}
                <p className="text-xs text-zinc-400 line-clamp-2 mb-4 min-h-[32px]">
                  {p.description || (p.isMaintenance ? '無固定起訖限制，持續優化與日常告警監控' : '無詳細專案說明')}
                </p>

                {/* 工時資訊呈現：維運案專注於累計工時，專案呈現進度與預估時數 */}
                {p.isMaintenance ? (
                  <div className="bg-zinc-950/70 border border-emerald-500/20 rounded-xl p-3 mb-4 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400">已累計投入工時：</span>
                      <span className="font-mono font-bold text-emerald-400 text-sm">
                        {p.actualHours.toFixed(1)} <span className="text-xs text-zinc-500 font-normal">hr</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1.5 border-t border-zinc-800/60">
                      <span className="flex items-center gap-1.5 text-zinc-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        常態運作 (無起訖限制)
                      </span>
                      {p.estimatedHours > 0 && (
                        <span className="font-mono text-zinc-500">基準 {p.estimatedHours}h</span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-xl p-3 mb-4 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400">已投入工時 / 預估：</span>
                      <span className="font-mono font-bold text-zinc-200">
                        <span className={isOverHours ? 'text-red-400' : 'text-blue-400'}>
                          {p.actualHours.toFixed(1)}h
                        </span>{' '}
                        / {p.estimatedHours}h
                      </span>
                    </div>

                    <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          isOverHours ? 'bg-red-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${Math.min(100, p.progressPercent)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-zinc-500">
                      <span>達成率</span>
                      <span className={`font-mono ${isOverHours ? 'text-red-400 font-bold' : ''}`}>
                        {p.progressPercent}% {isOverHours && '(超出預估)'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* 底部數據 */}
              <div className="pt-3 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-500">
                <span>關聯工時：{p.taskCount} 筆記錄</span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
