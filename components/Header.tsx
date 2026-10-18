'use client';

import React from 'react';
import { format, getISOWeek } from 'date-fns';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  BarChart3,
  Plus,
  Clock,
  FolderKanban,
  Globe,
  Settings,
} from 'lucide-react';
import {
  CountryCode,
  getWeekHolidaySummary,
  getAvailableCountries,
  getCountryDefinition,
} from '@/lib/holidays';
import type { ProjectScope } from '@/types/project';

interface HeaderProps {
  currentDate: Date;
  weekStart: Date;
  weekEnd: Date;
  viewMode: 'grid' | 'gantt' | 'projects';
  totalHours: number;
  workHours: number;
  personalHours: number;
  selectedScope: ProjectScope | 'all';
  onSelectScope: (scope: ProjectScope | 'all') => void;
  selectedCountry?: CountryCode;
  onSelectCountry?: (country: CountryCode) => void;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
  onViewChange: (mode: 'grid' | 'gantt' | 'projects') => void;
  onOpenAddModal: () => void;
  onOpenLeaveModal?: () => void;
  onOpenLunchModal?: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  weekStart,
  weekEnd,
  viewMode,
  totalHours,
  workHours,
  personalHours,
  selectedScope,
  onSelectScope,
  selectedCountry = 'TW',
  onSelectCountry,
  onPrevWeek,
  onNextWeek,
  onToday,
  onViewChange,
  onOpenAddModal,
  onOpenLeaveModal,
  onOpenLunchModal,
  onOpenSettings,
}) => {
  const countryDef = getCountryDefinition(selectedCountry);
  const availableCountries = getAvailableCountries();
  const weekNumber = getISOWeek(weekStart);
  const weekDateRangeStr = `${format(weekStart, 'yyyy-MM-dd')} ～ ${format(weekEnd, 'yyyy-MM-dd')} (第 ${weekNumber} 週)`;
  const weekHoliday = getWeekHolidaySummary(weekStart, selectedCountry);

  return (
    <header className="bg-zinc-900/90 backdrop-blur-md border-b border-zinc-800 sticky top-0 z-30 px-4 lg:px-8 py-3.5 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* 左側：品牌標誌與週次跳轉 */}
        <div className="flex items-center flex-wrap gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base font-bold text-zinc-100 tracking-tight">TimeCraft</h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                  Local only
                </span>
                {/* 國家/地區行事曆切換器 */}
                {onSelectCountry && (
                  <div className="flex items-center gap-1 bg-zinc-950/80 border border-zinc-700/80 hover:border-zinc-500 rounded-lg px-2 py-0.5 transition shadow-sm">
                    <Globe className="w-3 h-3 text-zinc-400" />
                    <select
                      value={selectedCountry}
                      onChange={(e) => onSelectCountry(e.target.value as CountryCode)}
                      className="text-[11px] font-medium bg-transparent text-zinc-200 focus:outline-none cursor-pointer"
                      title={`目前行事曆：${countryDef.name} (${countryDef.sourceName})`}
                    >
                      {availableCountries.map((c) => (
                        <option key={c.code} value={c.code} className="bg-zinc-900 text-zinc-100">
                          {c.flag} {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <p className="text-[11px] text-zinc-400">
                輕量化個人工時工作台 ({countryDef.flag} {countryDef.name}行事曆 · 0.5hr 顆粒度)
              </p>
            </div>
          </div>

          <div className="h-6 w-px bg-zinc-800 hidden sm:block" />

          {/* 週次控制器 */}
          <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-xl p-1 gap-1">
            <button
              onClick={onPrevWeek}
              className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition"
              title="上一週"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={onToday}
              className="px-2.5 py-1 text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition"
            >
              今天
            </button>
            <button
              onClick={onNextWeek}
              className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition"
              title="下一週"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <span className="text-xs font-medium text-zinc-300 px-2 font-mono">
              {weekDateRangeStr}
            </span>
            {weekHoliday && (
              <span className="hidden md:inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-300 border border-rose-500/30">
                {countryDef.flag} {weekHoliday}
              </span>
            )}
          </div>
        </div>

        {/* 右側：狀態統計、視圖切換與動作按鈕 */}
        <div className="flex items-center flex-wrap gap-2.5 sm:gap-3">
          <div className="flex bg-zinc-950 border border-zinc-800 p-1 rounded-xl">
            {([
              ['work', '💼 工作'],
              ['personal', '🌱 個人'],
              ['all', '全部'],
            ] as const).map(([value, label]) => (
              <button
                key={value}
                onClick={() => onSelectScope(value)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                  selectedScope === value ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            onClick={onOpenSettings}
            className="p-2 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded-xl transition"
            title="應用程式設定"
          >
            <Settings className="w-4 h-4" />
          </button>
          {/* KPI 指標條 */}
          <div className="hidden lg:flex items-center bg-zinc-950/80 border border-zinc-800 rounded-xl px-3 py-1.5 gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-400">本週工時:</span>
              <span className="font-bold text-blue-400 font-mono text-sm">{totalHours.toFixed(1)}h</span>
            </div>
            <div className="w-px h-3.5 bg-zinc-800" />
            <div className="text-[11px] text-zinc-400 whitespace-nowrap">
              💼 {workHours.toFixed(1)}h · 🌱 {personalHours.toFixed(1)}h
            </div>
          </div>

          {/* 視圖切換器 (週網格 ⟷ 甘特圖) */}
          <div className="flex bg-zinc-950 border border-zinc-800 p-1 rounded-xl">
            <button
              onClick={() => onViewChange('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                viewMode === 'grid'
                  ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>週網格視圖</span>
            </button>
            <button
              onClick={() => onViewChange('gantt')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                viewMode === 'gantt'
                  ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>專案甘特圖</span>
            </button>
            <button
              onClick={() => onViewChange('projects')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                viewMode === 'projects'
                  ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <FolderKanban className="w-3.5 h-3.5" />
              <span>專案與維運</span>
            </button>
          </div>

          {/* 中午午休快捷鍵按鈕 */}
          {onOpenLunchModal && (
            <button
              onClick={onOpenLunchModal}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 hover:text-white transition"
              title="快速登記中午午休 12:30~13:30 (1小時，工作日/非上班日均可，快速鍵: Alt+U)"
            >
              <span>🍱 午休</span>
              <kbd className="hidden sm:inline text-[10px] text-amber-400/80 bg-zinc-900 px-1 py-0.5 rounded border border-amber-500/30 font-mono">Alt+U</kbd>
            </button>
          )}

          {/* 休假快捷鍵按鈕 */}
          {onOpenLeaveModal && (
            <button
              onClick={onOpenLeaveModal}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl border border-zinc-700 bg-zinc-850 hover:bg-zinc-800 text-zinc-200 hover:text-white transition"
              title="快速登記休假 (快速鍵: Alt+L)"
            >
              <span>🏖️ 休假</span>
              <kbd className="hidden sm:inline text-[10px] text-zinc-400 bg-zinc-900 px-1 py-0.5 rounded border border-zinc-700 font-mono">Alt+L</kbd>
            </button>
          )}

          {/* 新增工時按鈕 */}
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white shadow-lg shadow-blue-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>登記工時</span>
          </button>
        </div>
      </div>
    </header>
  );
};
