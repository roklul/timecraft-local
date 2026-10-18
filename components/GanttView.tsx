'use client';

import React, { useState } from 'react';
import { WorklogItem } from '@/types/worklog';
import { ProjectItem } from '@/types/project';
import { getProjectStyle, CATEGORY_CONFIG } from '@/lib/constants';
import { format, addDays, isSameDay, parseISO } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { BarChart3, Info, Wrench, Target, Users, ClipboardList } from 'lucide-react';

interface GanttViewProps {
  weekStart: Date;
  worklogs: WorklogItem[];
  onEditItem: (item: WorklogItem) => void;
  projects?: ProjectItem[];
}

export const GanttView: React.FC<GanttViewProps> = ({
  weekStart,
  worklogs,
  onEditItem,
  projects = [],
}) => {
  const [hoveredItem, setHoveredItem] = useState<WorklogItem | null>(null);

  // 7 天
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const today = new Date();

  // 依專案 (Project) 聚合分組工時
  // 規範：專案有明確起訖與進度；常態維運案（無固定起訖）與會議（非專案交付任務）均自動過濾，不列入甘特圖
  const projectGroups = React.useMemo(() => {
    const map = new Map<string, WorklogItem[]>();
    worklogs.forEach((w) => {
      // 1. 忽略休假排程進度
      if (w.isLeave || w.category === 'Leave' || w.project === '休假' || w.taskName.includes('休假')) {
        return;
      }
      // 2. 忽略會議（會議不是專案，也不用甘特圖）
      const isMeeting =
        w.category === 'Meeting' ||
        w.project === '團隊會議' ||
        w.project === '例會' ||
        w.project.includes('會議') ||
        w.taskName.includes('會議') ||
        w.taskName.includes('月會') ||
        w.taskName.includes('週會');
      if (isMeeting) {
        return;
      }
      // 3. 忽略例行事務（日常庶務非交付型專案，不用甘特圖）
      const isRoutine =
        w.category === 'Routine' ||
        w.projectType === 'routine' ||
        w.project === '例行事務' ||
        w.project.includes('例行事務') ||
        w.project.includes('庶務');
      if (isRoutine) {
        return;
      }
      // 4. 忽略常態維運案（維運案無明顯固定起訖，不列入甘特圖排程）
      const isMaint =
        projects.find((p) => (w.projectId ? p.id === w.projectId : p.name === w.project))?.projectType === 'maintenance' ||
        /graylog|zabbix|維運|運維|監控/i.test(w.project);
      if (isMaint) {
        return;
      }

      const projectKey = w.projectId || `${w.scope || 'work'}:${w.project}`;
      const list = map.get(projectKey) || [];
      list.push(w);
      map.set(projectKey, list);
    });

    return Array.from(map.entries()).map(([, items]) => {
      const projectName = items[0]?.project || '未命名專案';
      const totalHours = items.reduce((acc, curr) => acc + curr.hours, 0);
      const avgProgress = Math.round(
        items.reduce((acc, curr) => acc + curr.progress, 0) / (items.length || 1)
      );

      return {
        projectName,
        items,
        totalHours,
        avgProgress,
        style: getProjectStyle(projectName, undefined, 'project'),
      };
    });
  }, [worklogs, projects]);

  // 本週常態維運案工時統計 (維運案無固定起訖，不繪入甘特排程，於頂部客觀提示本週投入時間)
  const maintenanceStats = React.useMemo(() => {
    const maintLogs = worklogs.filter((w) => {
      if (w.isLeave || w.category === 'Leave' || w.project === '休假' || w.taskName.includes('休假')) return false;
      return (
        projects.find((p) => (w.projectId ? p.id === w.projectId : p.name === w.project))?.projectType === 'maintenance' ||
        /graylog|zabbix|維運|運維|監控/i.test(w.project)
      );
    });
    const hours = maintLogs.reduce((acc, curr) => acc + curr.hours, 0);
    return {
      count: maintLogs.length,
      hours,
    };
  }, [worklogs, projects]);

  // 本週例行會議工時統計（會議非專案任務，不繪入甘特排程）
  const meetingStats = React.useMemo(() => {
    const meetingLogs = worklogs.filter((w) => {
      if (w.isLeave || w.category === 'Leave' || w.project === '休假') return false;
      return (
        w.category === 'Meeting' ||
        w.project === '團隊會議' ||
        w.project === '例會' ||
        w.project.includes('會議') ||
        w.taskName.includes('會議') ||
        w.taskName.includes('月會') ||
        w.taskName.includes('週會')
      );
    });
    return {
      count: meetingLogs.length,
      hours: meetingLogs.reduce((acc, curr) => acc + curr.hours, 0),
    };
  }, [worklogs]);

  // 本週例行事務工時統計（日常庶務非專案任務，不繪入甘特排程）
  const routineStats = React.useMemo(() => {
    const routineLogs = worklogs.filter((w) => {
      if (w.isLeave || w.category === 'Leave' || w.project === '休假') return false;
      return (
        w.category === 'Routine' ||
        w.projectType === 'routine' ||
        w.project === '例行事務' ||
        w.project.includes('例行事務') ||
        w.project.includes('庶務')
      );
    });
    return {
      count: routineLogs.length,
      hours: routineLogs.reduce((acc, curr) => acc + curr.hours, 0),
    };
  }, [worklogs]);

  // 計算特定工作項目在該週 7 天橫軸上的位置與寬度百分比
  const getItemGanttPosition = (item: WorklogItem) => {
    const itemDate = parseISO(item.date);
    const dayIndex = days.findIndex((d) => isSameDay(d, itemDate));
    if (dayIndex === -1) return null; // 不在當週

    // 每天切為 24 小時（或 08:00 - 22:00 = 14 小時）
    // 為求甘特圖橫軸比例自然，以全天為 100% / 7 = 14.28%
    const [startH, startM] = item.startTime.split(':').map(Number);
    const [endH, endM] = item.endTime.split(':').map(Number);

    const dayStartFraction = (startH + startM / 60) / 24;
    const dayEndFraction = (endH + endM / 60) / 24;
    const durationFraction = Math.max(0.04, dayEndFraction - dayStartFraction);

    const dayWidthPercent = 100 / 7;
    const leftPercent = dayIndex * dayWidthPercent + dayStartFraction * dayWidthPercent;
    // 確保長條寬度既符合時長比例，又有足夠最小寬度供視覺閱讀
    const widthPercent = Math.max(5.5, Math.min(dayWidthPercent * 0.95, durationFraction * dayWidthPercent * 1.6));

    return {
      left: `${leftPercent}%`,
      width: `${widthPercent}%`,
      leftNum: leftPercent,
      widthNum: widthPercent,
    };
  };

  // 計算專案整體在該週的起始與結束跨度
  const getProjectGanttSpan = (items: WorklogItem[]) => {
    const positions = items
      .map((it) => getItemGanttPosition(it))
      .filter((p): p is NonNullable<typeof p> => p !== null);
    if (positions.length === 0) return null;

    const minLeft = Math.min(...positions.map((p) => p.leftNum));
    const maxRight = Math.max(...positions.map((p) => p.leftNum + p.widthNum));
    const spanWidth = Math.max(8, maxRight - minLeft);

    return {
      left: `${minLeft}%`,
      width: `${spanWidth}%`,
    };
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
      {/* 頂部說明條 */}
      <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-950/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-zinc-100">專案進度甘特圖 (Gantt View)</h2>
            <p className="text-xs text-zinc-400">專案具明確起訖與進度 %；常態維運案、例行會議與例行事務因非交付專案已自動排除</p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2.5 text-xs text-zinc-400">
          <span className="text-[11px] text-zinc-400 bg-zinc-800/60 px-2.5 py-1 rounded-lg border border-zinc-700/60 flex items-center gap-1.5">
            <span>🏖️ 已自動過濾休假、常態維運、例行會議與庶務</span>
          </span>
          {maintenanceStats.hours > 0 && (
            <span
              className="text-[11px] text-emerald-400/90 bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-500/30 flex items-center gap-1.5"
              title="維運案無固定起訖，請至「專案與維運」看板檢視累計投入工時"
            >
              <Wrench className="w-3 h-3" />
              <span>維運: {maintenanceStats.hours.toFixed(1)}h</span>
            </span>
          )}
          {meetingStats.hours > 0 && (
            <span
              className="text-[11px] text-purple-400/90 bg-purple-950/40 px-2.5 py-1 rounded-lg border border-purple-500/30 flex items-center gap-1.5"
              title="會議非交付型專案任務，不繪入甘特圖"
            >
              <Users className="w-3 h-3" />
              <span>會議: {meetingStats.hours.toFixed(1)}h</span>
            </span>
          )}
          {routineStats.hours > 0 && (
            <span
              className="text-[11px] text-sky-400/90 bg-sky-950/40 px-2.5 py-1 rounded-lg border border-sky-500/30 flex items-center gap-1.5"
              title="例行事務非交付型專案任務，不繪入甘特圖"
            >
              <ClipboardList className="w-3 h-3" />
              <span>庶務: {routineStats.hours.toFixed(1)}h</span>
            </span>
          )}
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-2 bg-blue-500 rounded-sm" />
            <span>實際工時</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-2 bg-emerald-500/50 rounded-sm" />
            <span>進度 %</span>
          </div>
        </div>
      </div>

      {/* 甘特圖主容器 */}
      <div className="overflow-x-auto">
        <div className="min-w-[900px]">
          {/* 甘特圖時間軸 Header (橫軸) */}
          <div className="grid grid-cols-[240px_1fr] border-b border-zinc-800 bg-zinc-950 text-xs">
            <div className="p-3 font-semibold text-zinc-400 border-r border-zinc-800 flex items-center gap-2">
              <span>專案與任務列表</span>
            </div>
            {/* 7 天刻度 */}
            <div className="grid grid-cols-7 divide-x divide-zinc-800/80">
              {days.map((day) => {
                const isCurrentDay = isSameDay(day, today);
                return (
                  <div
                    key={day.toISOString()}
                    className={`p-2.5 text-center transition ${isCurrentDay ? 'bg-blue-950/25' : ''}`}
                  >
                    <div
                      className={`text-[11px] font-medium ${
                        isCurrentDay ? 'text-blue-400 font-bold' : 'text-zinc-400'
                      }`}
                    >
                      {format(day, 'EEE', { locale: zhTW })}
                    </div>
                    <div
                      className={`text-xs font-bold font-mono ${
                        isCurrentDay ? 'text-blue-400' : 'text-zinc-200'
                      }`}
                    >
                      {format(day, 'MM/dd')}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 甘特內容列 */}
          {projectGroups.length === 0 ? (
            <div className="py-16 text-center text-zinc-500 text-sm space-y-2">
              <div className="text-zinc-200 font-semibold text-base">本週尚無目標型「專案」排程！</div>
              <div className="text-xs text-zinc-400 max-w-lg mx-auto leading-relaxed">
                專案甘特圖專注於有明確起訖與進度之專案。
                {(maintenanceStats.hours > 0 || meetingStats.hours > 0 || routineStats.hours > 0) && (
                  <span className="block mt-1 text-zinc-400">
                    本週已登入之
                    {maintenanceStats.hours > 0 && ` 常態維運工時 (${maintenanceStats.hours.toFixed(1)}h)`}
                    {maintenanceStats.hours > 0 && (meetingStats.hours > 0 || routineStats.hours > 0) && '、'}
                    {meetingStats.hours > 0 && ` 例行會議溝通 (${meetingStats.hours.toFixed(1)}h)`}
                    {meetingStats.hours > 0 && routineStats.hours > 0 && ' 與'}
                    {routineStats.hours > 0 && ` 例行事務 (${routineStats.hours.toFixed(1)}h)`}
                    因非交付型專案任務，已自動過濾，不排入甘特圖。
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800/60">
              {projectGroups.map((group) => {
                const projectSpan = getProjectGanttSpan(group.items);
                return (
                  <div key={group.projectName} className="group/proj">
                    {/* 專案層級列 (聚合) */}
                    <div className="grid grid-cols-[240px_1fr] bg-zinc-900/60 hover:bg-zinc-850/60 transition border-b border-zinc-800/30">
                      <div className="p-3 border-r border-zinc-800 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: group.style.color }}
                          />
                          <span className="font-semibold text-xs text-zinc-100 truncate">
                            {group.projectName}
                          </span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded font-medium border flex-shrink-0 flex items-center gap-0.5 bg-blue-500/10 text-blue-300 border-blue-500/30">
                            <Target className="w-2 h-2" />
                            <span>專案</span>
                          </span>
                        </div>
                        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded border text-blue-400 bg-blue-500/10 border-blue-500/20">
                          {group.totalHours.toFixed(1)}h
                        </span>
                      </div>

                      {/* 專案時間跨度背景與專案週跨度長條 */}
                      <div className="grid grid-cols-7 divide-x divide-zinc-800/40 relative">
                        {days.map((day) => (
                          <div
                            key={day.toISOString()}
                            className={`h-full ${isSameDay(day, today) ? 'bg-blue-950/10' : ''}`}
                          />
                        ))}
                        {projectSpan && (
                          <div
                            style={{ left: projectSpan.left, width: projectSpan.width }}
                            className="absolute top-1/2 -translate-y-1/2 h-4 rounded-full overflow-hidden shadow-sm border border-zinc-700/60 bg-zinc-800/90 flex items-center z-10"
                            title={`${group.projectName} 本週排程跨度（平均進度 ${group.avgProgress}%，總計 ${group.totalHours.toFixed(1)}h）`}
                          >
                            <div
                              style={{
                                width: `${group.avgProgress}%`,
                                backgroundColor: group.style.color,
                              }}
                              className="h-full opacity-80 transition-all"
                            />
                            <span className="absolute inset-0 flex items-center px-2 text-[9px] font-mono text-zinc-200 drop-shadow-sm font-semibold truncate pointer-events-none">
                              {group.avgProgress}% 均進度 ({group.totalHours.toFixed(1)}h)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                  {/* 任務細項列 (Tasks) */}
                  {group.items.map((item) => {
                    const pos = getItemGanttPosition(item);
                    const catInfo = CATEGORY_CONFIG[item.category];

                    return (
                      <div
                        key={item.id}
                        className="grid grid-cols-[240px_1fr] hover:bg-zinc-800/40 transition relative group/item"
                      >
                        {/* 左側任務名稱與狀態 */}
                        <div
                          onClick={() => onEditItem(item)}
                          className="p-2.5 pl-6 border-r border-zinc-800 flex items-center justify-between cursor-pointer"
                        >
                          <div className="min-w-0 pr-2">
                            <div className="text-xs text-zinc-300 font-medium truncate group-hover/item:text-blue-300">
                              {item.taskName}
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-mono">
                              <span>{item.date}</span>
                              <span>•</span>
                              <span>{item.hours.toFixed(1)}h</span>
                              <span>•</span>
                              <span className="text-zinc-400">{item.progress}%</span>
                              {catInfo && (
                                <>
                                  <span>•</span>
                                  <span className="text-zinc-400">{catInfo.label}</span>
                                </>
                              )}
                            </div>
                          </div>

                        </div>

                        {/* 右側甘特條呈現區 */}
                        <div className="relative py-2.5 px-1 flex items-center">
                          {/* 7 天格線底層 */}
                          <div className="absolute inset-0 grid grid-cols-7 divide-x divide-zinc-800/40 pointer-events-none">
                            {days.map((day) => (
                              <div
                                key={day.toISOString()}
                                className={`h-full ${isSameDay(day, today) ? 'bg-blue-950/10' : ''}`}
                              />
                            ))}
                          </div>

                          {/* 甘特長條 (Gantt Bar) */}
                          {pos && (
                            <div
                              onClick={() => onEditItem(item)}
                              onMouseEnter={() => setHoveredItem(item)}
                              onMouseLeave={() => setHoveredItem(null)}
                              style={{ left: pos.left, width: pos.width, minWidth: '70px' }}
                              className="absolute h-7 rounded-lg shadow-md cursor-pointer transition-transform hover:scale-y-110 flex items-center overflow-hidden border border-blue-400/40 bg-blue-600/30 z-10"
                            >
                              {/* 進度填充條 (Progress bar within Gantt bar) */}
                              <div
                                style={{ width: `${item.progress}%` }}
                                className="h-full bg-blue-500/70 transition-all flex items-center px-2"
                              />

                              {/* 甘特長條文字標籤 */}
                              <span className="absolute inset-0 flex items-center px-2 text-[11px] font-medium text-white truncate drop-shadow-sm pointer-events-none">
                                {item.taskName} ({item.hours.toFixed(1)}h)
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
          )}
        </div>
      </div>

      {/* 底部 Hover 詳細 Tooltip / 說明列 */}
      <div className="px-6 py-3 border-t border-zinc-800 bg-zinc-950/90 flex items-center justify-between text-xs text-zinc-400">
        {hoveredItem ? (
          <div className="flex items-center gap-3 animate-in fade-in duration-150">
            <span className="font-semibold text-zinc-200">🔍 {hoveredItem.taskName}</span>
            <span>專案: <strong className="text-blue-400">{hoveredItem.project}</strong></span>
            <span>時段: <strong className="font-mono text-zinc-300">{hoveredItem.startTime} - {hoveredItem.endTime}</strong> ({hoveredItem.hours.toFixed(1)}h)</span>
            <span>進度: <strong className="text-emerald-400">{hoveredItem.progress}%</strong></span>
            {hoveredItem.notes && <span className="text-zinc-500 truncate max-w-xs">備註: {hoveredItem.notes}</span>}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-zinc-500">
            <Info className="w-3.5 h-3.5" />
            <span>提示：將滑鼠移至甘特條上方可檢視詳細工時；點擊任一長條即可快速進入編輯。</span>
          </div>
        )}
      </div>
    </div>
  );
};
