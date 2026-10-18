import { CountryDefinition, HolidayInfo } from '../types';

export const US_2026_HOLIDAYS: Record<string, HolidayInfo> = {
  '2026-01-01': { date: '2026-01-01', name: "New Year's Day (元旦)", isNationalHoliday: true, badgeEmoji: '🎆', description: "New Year's Day" },
  '2026-01-19': { date: '2026-01-19', name: 'MLK Jr. Day (馬丁路德金紀念日)', isNationalHoliday: true, badgeEmoji: '🕊️', description: 'Birthday of Martin Luther King, Jr.' },
  '2026-02-16': { date: '2026-02-16', name: "Presidents' Day (總統日)", isNationalHoliday: true, badgeEmoji: '🏛️', description: "Washington's Birthday" },
  '2026-05-25': { date: '2026-05-25', name: 'Memorial Day (陣亡將士紀念日)', isNationalHoliday: true, badgeEmoji: '🎖️', description: 'Memorial Day' },
  '2026-06-19': { date: '2026-06-19', name: 'Juneteenth (六月節獨立日)', isNationalHoliday: true, badgeEmoji: '✊', description: 'Juneteenth National Independence Day' },
  '2026-07-03': { date: '2026-07-03', name: 'Independence Day Observed (獨立日補假)', isNationalHoliday: true, badgeEmoji: '🇺🇸', description: 'Independence Day (Observed for July 4 Saturday)' },
  '2026-07-04': { date: '2026-07-04', name: 'Independence Day (美國獨立日)', isNationalHoliday: true, badgeEmoji: '🇺🇸', description: 'Independence Day' },
  '2026-09-07': { date: '2026-09-07', name: 'Labor Day (勞動節)', isNationalHoliday: true, badgeEmoji: '🛠️', description: 'Labor Day' },
  '2026-10-12': { date: '2026-10-12', name: 'Columbus Day (哥倫布日)', isNationalHoliday: true, badgeEmoji: '⛵', description: 'Columbus Day' },
  '2026-11-11': { date: '2026-11-11', name: 'Veterans Day (退伍軍人節)', isNationalHoliday: true, badgeEmoji: '🎖️', description: 'Veterans Day' },
  '2026-11-26': { date: '2026-11-26', name: 'Thanksgiving Day (感恩節)', isNationalHoliday: true, badgeEmoji: '🦃', description: 'Thanksgiving Day' },
  '2026-12-25': { date: '2026-12-25', name: 'Christmas Day (聖誕節)', isNationalHoliday: true, badgeEmoji: '🎄', description: 'Christmas Day' },
};

export const US_DEFINITION: CountryDefinition = {
  code: 'US',
  name: '美國',
  nativeName: 'United States',
  flag: '🇺🇸',
  sourceName: '美國聯邦人事管理局 (OPM Federal Holidays)',
  sourceUrl: 'https://www.opm.gov/policy-data-oversight/pay-leave/federal-holidays/',
  holidays2026: US_2026_HOLIDAYS,
};
