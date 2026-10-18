// 行政院人事行政總處（DGPA）中華民國 115 年（2026年）政府行政機關辦公日曆表
// 本模組已升級並整合至多國行事曆模組 '@/lib/holidays'
// 保留本檔以確保所有既有匯入完全向下相容

import {
  getDayInfo,
  getWeekHolidaySummary as getSummary,
  TAIWAN_2026_HOLIDAYS,
  DayStatusResult,
  HolidayInfo,
} from './holidays';

export type TaiwanHolidayInfo = HolidayInfo;
export type { DayStatusResult };
export { TAIWAN_2026_HOLIDAYS };

/**
 * 依據行政院人事行政總處（DGPA）2026 年辦公日曆表判斷特定日期性質
 */
export function getTaiwanDayInfo(dateInput: Date | string): DayStatusResult {
  return getDayInfo(dateInput, 'TW');
}

/**
 * 判斷當週是否包含國定假日，供 Header 連假標題顯示
 */
export function getWeekHolidaySummary(weekStart: Date): string | null {
  return getSummary(weekStart, 'TW');
}
