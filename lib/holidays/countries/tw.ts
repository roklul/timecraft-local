import { CountryDefinition, HolidayInfo } from '../types';

export const TAIWAN_2026_HOLIDAYS: Record<string, HolidayInfo> = {
  // 1. 元旦（中華民國開國紀念日）
  '2026-01-01': { date: '2026-01-01', name: '元旦 (開國紀念日)', isNationalHoliday: true, badgeEmoji: '🎆', description: '中華民國開國紀念日' },

  // 2. 農曆除夕及春節假期（2/14～2/22 共 9 天連假）
  '2026-02-14': { date: '2026-02-14', name: '春節連假', isNationalHoliday: true, badgeEmoji: '🏮', description: '農曆春節連假 (週六)' },
  '2026-02-15': { date: '2026-02-15', name: '春節連假', isNationalHoliday: true, badgeEmoji: '🏮', description: '農曆春節連假 (週日)' },
  '2026-02-16': { date: '2026-02-16', name: '農曆除夕', isNationalHoliday: true, badgeEmoji: '🧧', description: '農曆除夕' },
  '2026-02-17': { date: '2026-02-17', name: '春節 (初一)', isNationalHoliday: true, badgeEmoji: '🧨', description: '農曆大年初一' },
  '2026-02-18': { date: '2026-02-18', name: '春節 (初二)', isNationalHoliday: true, badgeEmoji: '🏮', description: '農曆大年初二' },
  '2026-02-19': { date: '2026-02-19', name: '春節 (初三)', isNationalHoliday: true, badgeEmoji: '🏮', description: '農曆大年初三' },
  '2026-02-20': { date: '2026-02-20', name: '春節補假 (初四)', isNationalHoliday: true, badgeEmoji: '🏮', description: '春節初四補假' },
  '2026-02-21': { date: '2026-02-21', name: '春節補假 (初五)', isNationalHoliday: true, badgeEmoji: '🏮', description: '春節初五補假' },
  '2026-02-22': { date: '2026-02-22', name: '春節連假', isNationalHoliday: true, badgeEmoji: '🏮', description: '農曆春節連假 (週日)' },

  // 3. 和平紀念日（2/27～3/1 共 3 天連假，2/28 週六補 2/27 週五）
  '2026-02-27': { date: '2026-02-27', name: '228 和平紀念日補假', isNationalHoliday: true, badgeEmoji: '🕊️', description: '和平紀念日適逢週六補假' },
  '2026-02-28': { date: '2026-02-28', name: '228 和平紀念日', isNationalHoliday: true, badgeEmoji: '🕊️', description: '二二八和平紀念日' },
  '2026-03-01': { date: '2026-03-01', name: '和平紀念日連假', isNationalHoliday: true, badgeEmoji: '🕊️', description: '和平紀念日連假 (週日)' },

  // 4. 兒童節與清明節（4/3～4/6 共 4 天連假，4/4 逢六補 4/3，4/5 逢日補 4/6）
  '2026-04-03': { date: '2026-04-03', name: '兒童節補假', isNationalHoliday: true, badgeEmoji: '🎈', description: '兒童節適逢週六，於週五補假' },
  '2026-04-04': { date: '2026-04-04', name: '兒童節', isNationalHoliday: true, badgeEmoji: '🎈', description: '兒童節' },
  '2026-04-05': { date: '2026-04-05', name: '清明節 (民族掃墓節)', isNationalHoliday: true, badgeEmoji: '🌱', description: '民族掃墓節 (清明節)' },
  '2026-04-06': { date: '2026-04-06', name: '清明節補假', isNationalHoliday: true, badgeEmoji: '🌱', description: '清明節適逢週日，於週一補假' },

  // 5. 勞動節（5/1～5/3 共 3 天連假）
  '2026-05-01': { date: '2026-05-01', name: '勞動節', isNationalHoliday: true, badgeEmoji: '🛠️', description: '五一勞動節' },
  '2026-05-02': { date: '2026-05-02', name: '勞動節連假', isNationalHoliday: true, badgeEmoji: '🛠️', description: '勞動節連假 (週六)' },
  '2026-05-03': { date: '2026-05-03', name: '勞動節連假', isNationalHoliday: true, badgeEmoji: '🛠️', description: '勞動節連假 (週日)' },

  // 6. 端午節（6/19～6/21 共 3 天連假）
  '2026-06-19': { date: '2026-06-19', name: '端午節', isNationalHoliday: true, badgeEmoji: '🚣', description: '農曆五月初五端午節' },
  '2026-06-20': { date: '2026-06-20', name: '端午節連假', isNationalHoliday: true, badgeEmoji: '🚣', description: '端午節連假 (週六)' },
  '2026-06-21': { date: '2026-06-21', name: '端午節連假', isNationalHoliday: true, badgeEmoji: '🚣', description: '端午節連假 (週日)' },

  // 7. 中秋節與教師節（9/25～9/28 共 4 天連假）
  '2026-09-25': { date: '2026-09-25', name: '中秋節', isNationalHoliday: true, badgeEmoji: '🥮', description: '農曆八月十五中秋節' },
  '2026-09-26': { date: '2026-09-26', name: '中秋節連假', isNationalHoliday: true, badgeEmoji: '🥮', description: '中秋節連假 (週六)' },
  '2026-09-27': { date: '2026-09-27', name: '中秋節連假', isNationalHoliday: true, badgeEmoji: '🥮', description: '中秋節連假 (週日)' },
  '2026-09-28': { date: '2026-09-28', name: '孔子誕辰紀念日 (教師節)', isNationalHoliday: true, badgeEmoji: '📚', description: '孔子誕辰紀念日（教師節）' },

  // 8. 國慶日（10/9～10/11 共 3 天連假，10/10 逢六補 10/9 週五）
  '2026-10-09': { date: '2026-10-09', name: '國慶日補假', isNationalHoliday: true, badgeEmoji: '🇹🇼', description: '國慶日適逢週六，於週五補假' },
  '2026-10-10': { date: '2026-10-10', name: '國慶日 (雙十節)', isNationalHoliday: true, badgeEmoji: '🇹🇼', description: '中華民國國慶日' },
  '2026-10-11': { date: '2026-10-11', name: '國慶日連假', isNationalHoliday: true, badgeEmoji: '🇹🇼', description: '國慶日連假 (週日)' },

  // 9. 臺灣光復節（10/24～10/26 共 3 天連假，10/25 逢日補 10/26 週一）
  '2026-10-24': { date: '2026-10-24', name: '光復節連假', isNationalHoliday: true, badgeEmoji: '🇹🇼', description: '臺灣光復節連假 (週六)' },
  '2026-10-25': { date: '2026-10-25', name: '臺灣光復節', isNationalHoliday: true, badgeEmoji: '🇹🇼', description: '臺灣光復紀念日' },
  '2026-10-26': { date: '2026-10-26', name: '光復節補假', isNationalHoliday: true, badgeEmoji: '🇹🇼', description: '臺灣光復節適逢週日，於週一補假' },

  // 10. 行憲紀念日（12/25～12/27 共 3 天連假）
  '2026-12-25': { date: '2026-12-25', name: '行憲紀念日', isNationalHoliday: true, badgeEmoji: '📜', description: '行憲紀念日' },
  '2026-12-26': { date: '2026-12-26', name: '行憲紀念日連假', isNationalHoliday: true, badgeEmoji: '📜', description: '行憲紀念日連假 (週六)' },
  '2026-12-27': { date: '2026-12-27', name: '行憲紀念日連假', isNationalHoliday: true, badgeEmoji: '📜', description: '行憲紀念日連假 (週日)' },
};

export const TAIWAN_DEFINITION: CountryDefinition = {
  code: 'TW',
  name: '台灣',
  nativeName: '臺灣',
  flag: '🇹🇼',
  sourceName: '行政院人事行政總處 (DGPA)',
  sourceUrl: 'https://www.dgpa.gov.tw/information?uid=41&pid=12573',
  holidays2026: TAIWAN_2026_HOLIDAYS,
};
