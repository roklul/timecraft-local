export type CountryCode = 'TW' | 'JP' | 'US' | 'SG';

export interface HolidayInfo {
  date: string; // YYYY-MM-DD
  name: string; // 節日名稱
  isNationalHoliday: boolean; // 是否為國定假日/紀念日/補假日
  description?: string;
  badgeEmoji?: string;
}

export interface DayStatusResult {
  dateStr: string;
  country: CountryCode;
  isHoliday: boolean; // 是否為國定假日/紀念日/補假日
  isWeekend: boolean; // 是否為週末 (週六/週日)
  isWorkday: boolean; // 是否為上班工作日
  isRestDay: boolean; // 是否為非上班日 / 休息日 (週末或國假)
  holidayName?: string; // 假日名稱
  badgeEmoji?: string;
  badgeLabel: string; // 簡短徽章文字 (如 "🇹🇼 國慶日" 或 "🏖️ 例休" 或 "💼 工作日")
  badgeColorClass: string;
}

export interface CountryDefinition {
  code: CountryCode;
  name: string;
  nativeName: string;
  flag: string;
  sourceName: string;
  sourceUrl?: string;
  holidays2026: Record<string, HolidayInfo>;
}
