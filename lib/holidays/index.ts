import { CountryCode, CountryDefinition, DayStatusResult, HolidayInfo } from './types';
import { TAIWAN_DEFINITION, TAIWAN_2026_HOLIDAYS } from './countries/tw';
import { JAPAN_DEFINITION } from './countries/jp';
import { US_DEFINITION } from './countries/us';
import { SINGAPORE_DEFINITION } from './countries/sg';

export * from './types';
export { TAIWAN_2026_HOLIDAYS };

// 支援的國家日曆註冊表
export const COUNTRIES: Record<CountryCode, CountryDefinition> = {
  TW: TAIWAN_DEFINITION,
  JP: JAPAN_DEFINITION,
  US: US_DEFINITION,
  SG: SINGAPORE_DEFINITION,
};

export const DEFAULT_COUNTRY: CountryCode = 'TW';

// 執行階段自訂/擴充國家註冊表 (供未來動態載入其他國家行事曆)
const dynamicCountries: Record<string, CountryDefinition> = {};

/**
 * 註冊或擴充其他國家的行事曆定義 (未來可由此注入英國、德國、韓國、香港等)
 */
export function registerCountryCalendar(definition: CountryDefinition) {
  dynamicCountries[definition.code] = definition;
}

/**
 * 取得特定國家的日曆定義
 */
export function getCountryDefinition(countryCode: CountryCode = DEFAULT_COUNTRY): CountryDefinition {
  return dynamicCountries[countryCode] || COUNTRIES[countryCode] || COUNTRIES.TW;
}

/**
 * 取得所有可選的國家日曆列表
 */
export function getAvailableCountries(): CountryDefinition[] {
  const builtIn = Object.values(COUNTRIES);
  const dynamic = Object.values(dynamicCountries).filter(
    (d) => !COUNTRIES[d.code as CountryCode]
  );
  return [...builtIn, ...dynamic];
}

/**
 * 依據指定國家的 2026 辦公日曆表判斷特定日期性質
 */
export function getDayInfo(
  dateInput: Date | string,
  countryCode: CountryCode = DEFAULT_COUNTRY
): DayStatusResult {
  let d: Date;
  let dateStr: string;

  if (typeof dateInput === 'string') {
    dateStr = dateInput.substring(0, 10);
    const [y, m, day] = dateStr.split('-').map(Number);
    d = new Date(y, (m || 1) - 1, day || 1);
  } else {
    d = dateInput;
    const y = d.getFullYear();
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    dateStr = `${y}-${m}-${day}`;
  }

  const countryDef = getCountryDefinition(countryCode);
  const dayOfWeek = d.getDay(); // 0 is Sunday, 6 is Saturday
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  const holiday: HolidayInfo | undefined = countryDef.holidays2026[dateStr];
  const isHoliday = !!holiday;

  // 休息日 = 國定假日或週末例休
  const isRestDay = isHoliday || isWeekend;
  const isWorkday = !isRestDay;

  let badgeLabel = '💼 工作日';
  let badgeColorClass = 'text-blue-400 bg-blue-500/10 border-blue-500/20';

  if (isHoliday) {
    badgeLabel = `${holiday.badgeEmoji || countryDef.flag} ${holiday.name}`;
    badgeColorClass = 'text-rose-400 bg-rose-500/15 border-rose-500/30';
  } else if (isWeekend) {
    badgeLabel = dayOfWeek === 6 ? '🏖️ 週六例休' : '🏖️ 週日例休';
    badgeColorClass = 'text-amber-400/90 bg-amber-500/10 border-amber-500/20';
  }

  return {
    dateStr,
    country: countryCode,
    isHoliday,
    isWeekend,
    isWorkday,
    isRestDay,
    holidayName: holiday?.name,
    badgeEmoji: holiday?.badgeEmoji || countryDef.flag,
    badgeLabel,
    badgeColorClass,
  };
}

/**
 * 判斷當週是否包含國定假日，供 Header 連假標題顯示
 */
export function getWeekHolidaySummary(
  weekStart: Date,
  countryCode: CountryCode = DEFAULT_COUNTRY
): string | null {
  const holidaysInWeek: string[] = [];
  const current = new Date(weekStart);
  const countryDef = getCountryDefinition(countryCode);

  for (let i = 0; i < 7; i++) {
    const y = current.getFullYear();
    const m = (current.getMonth() + 1).toString().padStart(2, '0');
    const d = current.getDate().toString().padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;
    const h = countryDef.holidays2026[dateStr];
    if (h && !holidaysInWeek.includes(h.name)) {
      holidaysInWeek.push(h.name);
    }
    current.setDate(current.getDate() + 1);
  }

  if (holidaysInWeek.length === 0) return null;
  return holidaysInWeek[0];
}

/**
 * 未來線上更新/擴充其他國家與年份之行事曆 API 連接器
 * (支援 Nager.Date 開放公開假日 API 或 Google/Notion 行事曆 iCal 同步)
 */
export async function fetchRemotePublicHolidays(
  year: number,
  isoCountryCode: string
): Promise<Record<string, HolidayInfo>> {
  try {
    const response = await fetch(
      `https://date.nager.at/api/v3/PublicHolidays/${year}/${isoCountryCode}`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch remote holidays: ${response.status}`);
    }
    const data: Array<{ date: string; localName: string; name: string }> = await response.json();
    const holidays: Record<string, HolidayInfo> = {};
    data.forEach((item) => {
      holidays[item.date] = {
        date: item.date,
        name: item.localName || item.name,
        isNationalHoliday: true,
        badgeEmoji: '🎉',
        description: item.name,
      };
    });
    return holidays;
  } catch (error) {
    console.warn(`Remote holiday fetch failed for ${isoCountryCode} ${year}:`, error);
    return {};
  }
}
