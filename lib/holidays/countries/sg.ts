import { CountryDefinition, HolidayInfo } from '../types';

export const SINGAPORE_2026_HOLIDAYS: Record<string, HolidayInfo> = {
  '2026-01-01': { date: '2026-01-01', name: "New Year's Day (元旦)", isNationalHoliday: true, badgeEmoji: '🎆', description: "New Year's Day" },
  '2026-02-17': { date: '2026-02-17', name: 'Chinese New Year (農曆初一)', isNationalHoliday: true, badgeEmoji: '🧨', description: 'Chinese New Year Day 1' },
  '2026-02-18': { date: '2026-02-18', name: 'Chinese New Year (農曆初二)', isNationalHoliday: true, badgeEmoji: '🏮', description: 'Chinese New Year Day 2' },
  '2026-03-21': { date: '2026-03-21', name: 'Hari Raya Puasa (開齋節)', isNationalHoliday: true, badgeEmoji: '🌙', description: 'Hari Raya Puasa' },
  '2026-04-03': { date: '2026-04-03', name: 'Good Friday (受難日)', isNationalHoliday: true, badgeEmoji: '✝️', description: 'Good Friday' },
  '2026-05-01': { date: '2026-05-01', name: 'Labour Day (勞動節)', isNationalHoliday: true, badgeEmoji: '🛠️', description: 'Labour Day' },
  '2026-05-28': { date: '2026-05-28', name: 'Hari Raya Haji (哈芝節)', isNationalHoliday: true, badgeEmoji: '🕌', description: 'Hari Raya Haji' },
  '2026-05-31': { date: '2026-05-31', name: 'Vesak Day (衛塞節)', isNationalHoliday: true, badgeEmoji: '☸️', description: 'Vesak Day' },
  '2026-06-01': { date: '2026-06-01', name: 'Vesak Day Observed (衛塞節補假)', isNationalHoliday: true, badgeEmoji: '☸️', description: 'Vesak Day Observed' },
  '2026-08-09': { date: '2026-08-09', name: 'National Day (國慶日)', isNationalHoliday: true, badgeEmoji: '🇸🇬', description: 'National Day' },
  '2026-08-10': { date: '2026-08-10', name: 'National Day Observed (國慶日補假)', isNationalHoliday: true, badgeEmoji: '🇸🇬', description: 'National Day Observed' },
  '2026-11-08': { date: '2026-11-08', name: 'Deepavali (屠妖節)', isNationalHoliday: true, badgeEmoji: '🪔', description: 'Deepavali' },
  '2026-11-09': { date: '2026-11-09', name: 'Deepavali Observed (屠妖節補假)', isNationalHoliday: true, badgeEmoji: '🪔', description: 'Deepavali Observed' },
  '2026-12-25': { date: '2026-12-25', name: 'Christmas Day (聖誕節)', isNationalHoliday: true, badgeEmoji: '🎄', description: 'Christmas Day' },
};

export const SINGAPORE_DEFINITION: CountryDefinition = {
  code: 'SG',
  name: '新加坡',
  nativeName: 'Singapore',
  flag: '🇸🇬',
  sourceName: '新加坡人力部 (MOM Public Holidays)',
  sourceUrl: 'https://www.mom.gov.sg/employment-practices/public-holidays',
  holidays2026: SINGAPORE_2026_HOLIDAYS,
};
