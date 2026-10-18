'use client';

import React, { useState, useRef } from 'react';
import { WorklogItem } from '@/types/worklog';
import {
  TIME_SLOTS,
  timeToMinutes,
  minutesToTime,
  calculateHours,
  getProjectStyle,
  CATEGORY_CONFIG,
} from '@/lib/constants';
import { format, addDays, isSameDay } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { CheckCircle2, Clock } from 'lucide-react';
import { getDayInfo, CountryCode } from '@/lib/holidays';

interface WeekGridProps {
  weekStart: Date;
  worklogs: WorklogItem[];
  country?: CountryCode;
  onOpenSlot: (dateStr: string, startTime: string, endTime?: string) => void;
  onEditItem: (item: WorklogItem) => void;
  onRescheduleItem?: (updatedItem: WorklogItem) => void;
}

// 每個 30 分鐘 slot 的像素高度 (共 48 格，00:00 至 24:00)
const SLOT_HEIGHT = 42;
const BASE_MINUTES = 0; // 00:00 為起始

export const WeekGrid: React.FC<WeekGridProps> = ({
  weekStart,
  worklogs,
  country = 'TW',
  onOpenSlot,
  onEditItem,
  onRescheduleItem,
}) => {
  const [dragState, setDragState] = useState<{
    dayDateStr: string;
    startSlot: string;
    currentSlot: string;
  } | null>(null);

  // 卡片拖曳改期 (Drag & Drop) 狀態
  const [draggedWorklogId, setDraggedWorklogId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{ dateStr: string; time: string } | null>(null);

  const isDragging = useRef(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 初次載入時自動滾動至 08:00 工作時段 (8 * 2 = 16 個 slot)
  React.useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 16 * SLOT_HEIGHT;
    }
  }, []);

  // 7 天的日期陣列 (週一至週日)
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const today = new Date();

  // 計算特定工作卡片在網格中的定位
  const getCardStyle = (item: WorklogItem) => {
    const startM = timeToMinutes(item.startTime);
    const endM = timeToMinutes(item.endTime);
    // 相對 00:00 的分鐘數
    const topMinutes = Math.max(0, startM - BASE_MINUTES);
    const durationMinutes = Math.max(30, endM - startM);

    // 每 30 分鐘 = SLOT_HEIGHT (42px) => 每分鐘 = SLOT_HEIGHT / 30
    const top = (topMinutes / 30) * SLOT_HEIGHT;
    const height = Math.max(36, (durationMinutes / 30) * SLOT_HEIGHT - 3);

    return {
      top: `${top}px`,
      height: `${height}px`,
    };
  };

  // 處理拖曳選取時間範圍
  const handleSlotMouseDown = (dateStr: string, time: string) => {
    // 若正在拖曳卡片則不觸發空格選取
    if (draggedWorklogId) return;
    isDragging.current = true;
    setDragState({
      dayDateStr: dateStr,
      startSlot: time,
      currentSlot: time,
    });
  };

  const handleSlotMouseEnter = (dateStr: string, time: string) => {
    if (isDragging.current && dragState && dragState.dayDateStr === dateStr) {
      setDragState((prev) => (prev ? { ...prev, currentSlot: time } : null));
    }
  };

  const handleMouseUp = () => {
    if (isDragging.current && dragState) {
      isDragging.current = false;
      const { dayDateStr, startSlot, currentSlot } = dragState;
      const m1 = timeToMinutes(startSlot);
      const m2 = timeToMinutes(currentSlot);
      const minM = Math.min(m1, m2);
      // 若單擊 12:30 午休槽位，預設開立 12:30~13:30 (1 小時午休區間)，其餘槽位預設 30 分鐘
      const isSingleClickLunch = startSlot === '12:30' && currentSlot === '12:30';
      const maxM = Math.max(m1, m2) + (isSingleClickLunch ? 60 : 30);

      const startFormatted = minutesToTime(minM);
      const endFormatted = minutesToTime(maxM);

      onOpenSlot(dayDateStr, startFormatted, endFormatted);
      setDragState(null);
    }
  };

  // 處理卡片拖曳放開 (Drop) 重新排程至特定日期的特定時間槽
  const handleDropCard = (targetDate: string, targetStartTime: string) => {
    if (!draggedWorklogId) return;
    const item = worklogs.find((w) => w.id === draggedWorklogId);
    if (!item) {
      setDraggedWorklogId(null);
      setDropTarget(null);
      return;
    }

    // 若拖到完全同一天的同一開始時間，則不變更
    if (item.date === targetDate && item.startTime === targetStartTime) {
      setDraggedWorklogId(null);
      setDropTarget(null);
      return;
    }

    // 計算卡片原本時長 (分鐘)
    const currentDuration = Math.max(30, timeToMinutes(item.endTime) - timeToMinutes(item.startTime));
    let newStartM = timeToMinutes(targetStartTime);

    // 若新結束時間超出 24:00 (1440 分鐘)，往前推齊於當天內
    if (newStartM + currentDuration > 24 * 60) {
      newStartM = Math.max(0, 24 * 60 - currentDuration);
    }

    const newEndM = newStartM + currentDuration;
    const newStartStr = minutesToTime(newStartM);
    const newEndStr = minutesToTime(newEndM);
    const calculatedHours = calculateHours(newStartStr, newEndStr);

    const updatedItem: WorklogItem = {
      ...item,
      date: targetDate,
      startTime: newStartStr,
      endTime: newEndStr,
      hours: calculatedHours,
      syncStatus: 'pending',
      updatedAt: new Date().toISOString(),
    };

    onRescheduleItem?.(updatedItem);
    setDraggedWorklogId(null);
    setDropTarget(null);
  };

  return (
    <div
      className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl select-none"
      onMouseUp={handleMouseUp}
    >
      {/* 頂部星期標題列 */}
      <div className="grid grid-cols-[70px_repeat(7,1fr)] border-b border-zinc-800 bg-zinc-950/70 sticky top-0 z-20">
        {/* 左上角時間軸留白 */}
        <div className="p-3 text-center text-xs font-semibold text-zinc-500 border-r border-zinc-800 flex items-center justify-center">
          <Clock className="w-3.5 h-3.5" />
        </div>

        {/* 7 天標題 */}
        {days.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const isCurrentDay = isSameDay(day, today);
          const dayWorklogs = worklogs.filter((w) => w.date === dateStr);
          const dayHours = dayWorklogs.reduce((sum, w) => sum + w.hours, 0);
          const dayStatus = getDayInfo(day, country);

          return (
            <div
              key={dateStr}
              className={`p-2.5 text-center border-r border-zinc-800/80 last:border-r-0 transition ${
                isCurrentDay
                  ? 'bg-blue-950/25 ring-1 ring-inset ring-blue-500/30'
                  : dayStatus.isHoliday
                  ? 'bg-rose-950/20'
                  : dayStatus.isWeekend
                  ? 'bg-zinc-950/40'
                  : ''
              }`}
            >
              <div className="flex items-center justify-center gap-1 flex-wrap">
                <span
                  className={`text-xs font-medium ${
                    isCurrentDay
                      ? 'text-blue-400 font-bold'
                      : dayStatus.isHoliday
                      ? 'text-rose-400 font-semibold'
                      : dayStatus.isWeekend
                      ? 'text-amber-400/80 font-medium'
                      : 'text-zinc-400'
                  }`}
                >
                  {format(day, 'EEEE', { locale: zhTW })}
                </span>
                {isCurrentDay && (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
                )}
                {/* 國定假日或例休標籤 */}
                {dayStatus.isHoliday ? (
                  <span
                    className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm"
                    title={`2026 國定假日：${dayStatus.holidayName}`}
                  >
                    {dayStatus.badgeEmoji} {dayStatus.holidayName?.replace(/（.*?）|\(.*?\)/g, '').trim()}
                  </span>
                ) : dayStatus.isWeekend ? (
                  <span className="px-1 py-0.2 rounded text-[9px] font-medium bg-zinc-800 text-zinc-400 border border-zinc-700">
                    休
                  </span>
                ) : null}
              </div>
              <div
                className={`text-sm font-bold mt-0.5 ${
                  isCurrentDay
                    ? 'text-blue-400'
                    : dayStatus.isHoliday
                    ? 'text-rose-300'
                    : dayStatus.isWeekend
                    ? 'text-amber-200/90'
                    : 'text-zinc-200'
                }`}
              >
                {format(day, 'MM/dd')}
              </div>
              <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                {dayHours > 0 ? `${dayHours.toFixed(1)}h` : '-'}
              </div>
            </div>
          );
        })}
      </div>

      {/* 主體時間槽網格 (00:00 至 24:00 共 48 個槽) */}
      <div
        ref={scrollContainerRef}
        className="relative overflow-x-auto max-h-[calc(100vh-210px)] overflow-y-auto"
      >
        <div className="grid grid-cols-[70px_repeat(7,1fr)] relative min-w-[840px]">
          {/* 左側時間標尺 */}
          <div className="border-r border-zinc-800 bg-zinc-950/40 divide-y divide-zinc-800/60">
            {TIME_SLOTS.map((time) => {
              const isHour = time.endsWith(':00');
              return (
                <div
                  key={time}
                  style={{ height: `${SLOT_HEIGHT}px` }}
                  className={`px-2 flex items-center justify-end text-[11px] font-mono select-none ${
                    isHour ? 'text-zinc-300 font-semibold' : 'text-zinc-500 text-[10px]'
                  }`}
                >
                  {time}
                </div>
              );
            })}
          </div>

          {/* 7 天的時間格與工時卡片 */}
          {days.map((day) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const dayWorklogs = worklogs.filter((w) => w.date === dateStr);
            const isCurrentDay = isSameDay(day, today);
            const dayStatus = getDayInfo(day, country);

            return (
              <div
                key={dateStr}
                className={`relative border-r border-zinc-800/60 last:border-r-0 ${
                  isCurrentDay
                    ? 'bg-blue-950/5'
                    : dayStatus.isHoliday
                    ? 'bg-rose-950/5'
                    : dayStatus.isWeekend
                    ? 'bg-zinc-950/25'
                    : ''
                }`}
              >
                {/* 網格槽底圖 (每 30 分鐘一個 cell) */}
                <div className="divide-y divide-zinc-800/40">
                  {TIME_SLOTS.map((time) => {
                    const isHour = time.endsWith(':00');
                    const isDropTarget = dropTarget?.dateStr === dateStr && dropTarget?.time === time;

                    // 檢查是否在拖曳範圍內 (框選新時段)
                    const isDragSelected =
                      dragState &&
                      dragState.dayDateStr === dateStr &&
                      timeToMinutes(time) >=
                        Math.min(
                          timeToMinutes(dragState.startSlot),
                          timeToMinutes(dragState.currentSlot)
                        ) &&
                      timeToMinutes(time) <=
                        Math.max(
                          timeToMinutes(dragState.startSlot),
                          timeToMinutes(dragState.currentSlot)
                        );

                    return (
                      <div
                        key={time}
                        style={{ height: `${SLOT_HEIGHT}px` }}
                        onMouseDown={() => handleSlotMouseDown(dateStr, time)}
                        onMouseEnter={() => handleSlotMouseEnter(dateStr, time)}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.dataTransfer.dropEffect = 'move';
                        }}
                        onDragEnter={(e) => {
                          e.preventDefault();
                          if (draggedWorklogId) {
                            setDropTarget({ dateStr, time });
                          }
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          handleDropCard(dateStr, time);
                        }}
                        className={`group cursor-pointer transition-colors relative ${
                          isHour ? 'bg-zinc-900/40' : 'bg-zinc-900/10'
                        } ${
                          isDropTarget
                            ? 'bg-blue-600/40 ring-2 ring-inset ring-blue-400 z-10'
                            : isDragSelected
                            ? 'bg-blue-600/30 ring-1 ring-inset ring-blue-500'
                            : 'hover:bg-blue-500/10'
                        }`}
                        title={
                          draggedWorklogId
                            ? `放開以將工時移至 ${dateStr} ${time}`
                            : `點擊或拖曳登記工時 (${dateStr} ${time})`
                        }
                      >
                        {/* 放置目標指示 */}
                        {isDropTarget && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                            <span className="text-[10px] font-bold text-white bg-blue-600 px-2 py-0.5 rounded shadow-lg border border-blue-400">
                              移至 {time}
                            </span>
                          </div>
                        )}

                        {/* 懸停快速新增提示按鈕 (未拖曳卡片時顯示) */}
                        {!draggedWorklogId && !isDropTarget && (
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span
                              className={`text-[10px] font-medium bg-zinc-900/90 border px-2 py-0.5 rounded shadow-sm ${
                                time === '12:30'
                                  ? 'text-amber-400 border-amber-500/40'
                                  : 'text-blue-400 border-blue-500/30'
                              }`}
                            >
                              {time === '12:30' ? '🍱 午休 1h' : '+ 0.5h'}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* 浮動工時卡片層 (Absolute Layer) */}
                <div className="absolute inset-0 pointer-events-none p-1">
                  {dayWorklogs.map((item) => {
                    const style = getCardStyle(item);
                    const projStyle = getProjectStyle(item.project);
                    const catInfo = CATEGORY_CONFIG[item.category];
                    const isLunch = item.taskName.includes('午休') || item.taskName.includes('午餐');
                    const isLeaveItem =
                      !isLunch && (
                        item.isLeave ||
                        item.category === 'Leave' ||
                        item.project === '休假' ||
                        item.project === '無' ||
                        item.project.includes('休假')
                      );
                    const isMeeting =
                      item.category === 'Meeting' ||
                      item.project === '例行會議' ||
                      item.project.includes('會議');
                    const isRoutine =
                      item.category === 'Routine' ||
                      item.projectType === 'routine' ||
                      item.project === '例行事務' ||
                      item.project.includes('庶務');
                    const isMaintenance =
                      item.projectType === 'maintenance' ||
                      item.category === 'Deploy' ||
                      /graylog|zabbix|維運|運維|監控/i.test(item.project);
                    const isStandardProject =
                      !isLunch && !isLeaveItem && !isMeeting && !isRoutine && !isMaintenance;
                    const isBeingDragged = draggedWorklogId === item.id;

                    const cardBackground = isLunch
                      ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.22) 0%, rgba(24, 24, 27, 0.96) 55%, rgba(18, 18, 20, 0.98) 100%)'
                      : isLeaveItem
                      ? 'rgba(39, 39, 42, 0.95)'
                      : `linear-gradient(135deg, ${projStyle.color}28 0%, rgba(24, 24, 27, 0.96) 55%, rgba(18, 18, 20, 0.98) 100%)`;

                    const cardBorderColor = isLunch
                      ? '#f59e0b60'
                      : isLeaveItem
                      ? '#52525b'
                      : `${projStyle.color}50`;
                    const leftBorderColor = isLunch
                      ? '#f59e0b'
                      : isLeaveItem
                      ? '#71717a'
                      : projStyle.color;

                    return (
                      <div
                        key={item.id}
                        draggable={true}
                        onDragStart={(e) => {
                          e.stopPropagation();
                          e.dataTransfer.setData('text/plain', item.id);
                          e.dataTransfer.effectAllowed = 'move';
                          setDraggedWorklogId(item.id);
                        }}
                        onDragEnd={() => {
                          setDraggedWorklogId(null);
                          setDropTarget(null);
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditItem(item);
                        }}
                        style={{
                          ...style,
                          background: cardBackground,
                          borderColor: cardBorderColor,
                          borderLeftColor: leftBorderColor,
                          borderLeftWidth: '4px',
                        }}
                        className={`absolute left-1 right-1 pointer-events-auto rounded-xl border p-2.5 overflow-hidden shadow-lg cursor-grab active:cursor-grabbing transition-all hover:scale-[1.01] hover:z-10 ${
                          isBeingDragged
                            ? 'opacity-30 scale-95 ring-2 ring-blue-500 shadow-none'
                            : isLunch
                            ? 'border-amber-500/40 text-amber-200'
                            : isLeaveItem
                            ? 'border-dashed text-zinc-300'
                            : 'text-zinc-100 hover:shadow-xl'
                        }`}
                        title={`${item.taskName} (${item.startTime} - ${item.endTime}, ${item.hours}h) - 點擊編輯或按住拖曳改期`}
                      >
                        {/* 1. 超短任務 (0.5h，高度約 39px) */}
                        {item.hours <= 0.5 ? (
                          <div className="flex items-center justify-between gap-1.5 h-full px-0.5">
                            <div className="flex items-center gap-1.5 min-w-0 flex-1">
                              {isLunch ? (
                                <span className="text-[10px] text-amber-400 font-bold flex-shrink-0">🍱</span>
                              ) : isLeaveItem ? (
                                <span className="text-[10px] text-zinc-300 font-bold flex-shrink-0">🏖️</span>
                              ) : (
                                <span
                                  className="w-2 h-2 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: projStyle.color }}
                                />
                              )}
                              <span className="text-xs font-bold text-zinc-100 truncate">
                                {item.taskName}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {item.syncStatus === 'synced' ? (
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                              )}
                              <span className="text-[10px] font-mono text-zinc-300 font-bold px-1.5 py-0.5 rounded bg-black/50 border border-white/5">
                                0.5h
                              </span>
                            </div>
                          </div>
                        ) : item.hours <= 1.0 ? (
                          /* 2. 中短任務 (1.0h，高度約 81px) */
                          <div className="flex flex-col justify-between h-full">
                            <div>
                              <div className="flex items-center justify-between gap-1 mb-1">
                                <div className="flex items-center gap-1 min-w-0">
                                  <span
                                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: isLunch ? '#f59e0b' : projStyle.color }}
                                  />
                                  <span className="text-[10px] font-bold truncate text-zinc-300">
                                    {isLunch ? '🍱 午休' : isLeaveItem ? '🏖️ 休假' : item.project === '無' ? '無專案' : item.project}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  {item.syncStatus === 'synced' ? (
                                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                  ) : (
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                                  )}
                                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-black/60 text-zinc-200 border border-white/5">
                                    {item.hours.toFixed(1)}h
                                  </span>
                                </div>
                              </div>
                              <div className="text-xs font-bold text-zinc-100 line-clamp-1 leading-snug">
                                {item.taskName}
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1 border-t border-white/5 font-mono">
                              <span>{item.startTime} - {item.endTime}</span>
                              {catInfo && (
                                <span className={`px-1 rounded text-[9px] ${catInfo.badgeClass}`}>
                                  {isLunch ? '用餐休息' : catInfo.label}
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          /* 3. 中長任務與全天長時段 (1.5h ~ 8.5h+，如使用者截圖中之長卡片) */
                          <div className="flex flex-col h-full justify-start overflow-hidden">
                            {/* 頂部標籤列：專案標籤、分類標籤、時數、同步狀態 */}
                            <div className="flex items-center justify-between gap-1.5 mb-1.5 flex-wrap">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span
                                  className="px-2 py-0.5 rounded-md text-[10px] font-bold truncate border"
                                  style={{
                                    backgroundColor: isLunch ? 'rgba(245, 158, 11, 0.2)' : `${projStyle.color}25`,
                                    color: isLunch ? '#f59e0b' : projStyle.color,
                                    borderColor: isLunch ? 'rgba(245, 158, 11, 0.5)' : `${projStyle.color}50`,
                                  }}
                                >
                                  {isLunch ? '🍱 中午午休' : isLeaveItem ? '🏖️ 個人休假' : item.project === '無' ? '無專案' : item.project}
                                </span>
                                {catInfo && !isLeaveItem && (
                                  <span className={`px-1.5 py-0.5 rounded-md text-[9px] border font-normal ${catInfo.badgeClass}`}>
                                    {isLunch ? '用餐休息' : catInfo.label}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-1 flex-shrink-0">
                                <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded-md bg-black/60 text-zinc-100 border border-zinc-700/60 shadow-sm">
                                  {item.hours.toFixed(1)}h
                                </span>
                              </div>
                            </div>

                            {/* 任務名稱：高對比大字，清晰易讀 */}
                            <div className="text-xs sm:text-sm font-bold text-zinc-100 leading-snug tracking-tight line-clamp-2 mb-1.5">
                              {item.taskName}
                            </div>

                            {/* 起訖時間晶片：緊隨任務名稱下方，一眼就能看清時間，不必滾到 700px 底下！ */}
                            <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-300 bg-black/40 px-2 py-1 rounded-lg border border-white/5 w-fit mb-2">
                              <Clock className="w-3 h-3 text-zinc-400" />
                              <span>{item.startTime} - {item.endTime}</span>
                              <span className="text-zinc-500 font-sans text-[10px]">({item.hours.toFixed(1)}h)</span>
                            </div>

                            {/* 進度條 (僅一般交付專案且工時 >= 1.5h 才顯示) */}
                            {isStandardProject && item.hours >= 1.5 && (
                              <div className="mb-2 bg-black/30 p-2 rounded-lg border border-white/5 space-y-1">
                                <div className="flex items-center justify-between text-[10px] text-zinc-400">
                                  <span>完成進度</span>
                                  <span className="font-bold text-zinc-200 font-mono">{item.progress}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-zinc-800/90 rounded-full overflow-hidden">
                                  <div
                                    className="h-full rounded-full transition-all duration-300"
                                    style={{
                                      width: `${item.progress}%`,
                                      backgroundColor: isLeaveItem ? '#10b981' : projStyle.color,
                                    }}
                                  />
                                </div>
                              </div>
                            )}

                            {/* 任務備註預覽 (填補長時段的巨大空白，豐富卡片內容) */}
                            {item.notes ? (
                              <div className="text-[11px] text-zinc-300/90 bg-black/40 p-2.5 rounded-lg border border-zinc-800 leading-relaxed overflow-hidden">
                                <div className="text-[10px] font-semibold text-zinc-400 mb-1 flex items-center gap-1">
                                  <span>📝 任務備註</span>
                                </div>
                                <p className="line-clamp-4 whitespace-pre-wrap">{item.notes}</p>
                              </div>
                            ) : item.hours >= 3.5 ? (
                              /* 若為超長任務但無填備註，顯示優雅的長時段時程區塊 */
                              <div className="p-2.5 rounded-lg bg-zinc-950/40 border border-dashed border-zinc-800 text-[11px] text-zinc-400/80 flex flex-col gap-1">
                                <div className="flex items-center justify-between text-[10px] text-zinc-500">
                                  <span>長時段工作區塊</span>
                                  <span className="font-mono">{item.startTime} ~ {item.endTime}</span>
                                </div>
                                <p className="text-[10px] text-zinc-500 leading-normal">
                                  已排定 {item.hours.toFixed(1)} 小時任務 · 點擊卡片可編輯或補充備註筆記
                                </p>
                              </div>
                            ) : null}

                            {/* 底部指示錨點 (長任務在底端提示結束時間與操作) */}
                            {item.hours >= 3.0 && (
                              <div className="mt-auto pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                                <span>結束於 {item.endTime}</span>
                                <span className="text-[9px] text-zinc-400 bg-zinc-800/80 px-1.5 py-0.5 rounded border border-zinc-700/50">
                                  點擊編輯 ✏️
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
