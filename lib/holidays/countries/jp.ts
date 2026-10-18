import { CountryDefinition, HolidayInfo } from '../types';

export const JAPAN_2026_HOLIDAYS: Record<string, HolidayInfo> = {
  '2026-01-01': { date: '2026-01-01', name: '元日', isNationalHoliday: true, badgeEmoji: '🌅', description: '年のはじめを祝う' },
  '2026-01-12': { date: '2026-01-12', name: '成人の日', isNationalHoliday: true, badgeEmoji: '👘', description: 'おとなになったことを自覚し、みずから生き抜こうとする青年を祝いはげます' },
  '2026-02-11': { date: '2026-02-11', name: '建国記念の日', isNationalHoliday: true, badgeEmoji: '🎌', description: '建国をしのび、国を愛する心を養う' },
  '2026-02-23': { date: '2026-02-23', name: '天皇誕生日', isNationalHoliday: true, badgeEmoji: '👑', description: '天皇の誕生日を祝う' },
  '2026-03-20': { date: '2026-03-20', name: '春分の日', isNationalHoliday: true, badgeEmoji: '🌸', description: '自然をたたえ、生物をいつくしむ' },
  '2026-04-29': { date: '2026-04-29', name: '昭和の日', isNationalHoliday: true, badgeEmoji: '🌿', description: '激動の日々を経て、復興を遂げた昭和の時代を顧みる' },
  '2026-05-03': { date: '2026-05-03', name: '憲法記念日', isNationalHoliday: true, badgeEmoji: '📜', description: '日本国憲法の施行を記念する' },
  '2026-05-04': { date: '2026-05-04', name: 'みどりの日', isNationalHoliday: true, badgeEmoji: '🌲', description: '自然に親しむとともにその恩恵に感謝する' },
  '2026-05-05': { date: '2026-05-05', name: 'こどもの日', isNationalHoliday: true, badgeEmoji: '🎏', description: 'こどもの人格を重んじ、こどもの幸福をはかる' },
  '2026-05-06': { date: '2026-05-06', name: '振替休日 (憲法記念日)', isNationalHoliday: true, badgeEmoji: '🎏', description: '憲法記念日が日曜日にあたるため振替休日' },
  '2026-07-20': { date: '2026-07-20', name: '海の日', isNationalHoliday: true, badgeEmoji: '🌊', description: '海の恩恵に感謝するとともに、海洋国日本の繁栄を願う' },
  '2026-08-11': { date: '2026-08-11', name: '山の日', isNationalHoliday: true, badgeEmoji: '⛰️', description: '山に親しむ機会を得て、山の恩恵に感謝する' },
  '2026-09-21': { date: '2026-09-21', name: '敬老の日', isNationalHoliday: true, badgeEmoji: '👵', description: '多年にわたり社会につくしてきた老人を敬愛する' },
  '2026-09-22': { date: '2026-09-22', name: '国民の休日', isNationalHoliday: true, badgeEmoji: '🍁', description: '祝日に挟まれた国民の休日 (シルバーウィーク)' },
  '2026-09-23': { date: '2026-09-23', name: '秋分の日', isNationalHoliday: true, badgeEmoji: '🎑', description: '祖先をうやまい、なくなった人々をしのぶ' },
  '2026-10-12': { date: '2026-10-12', name: 'スポーツの日', isNationalHoliday: true, badgeEmoji: '🏃', description: 'スポーツにしたしみ、健康な心身をつちかう' },
  '2026-11-03': { date: '2026-11-03', name: '文化の日', isNationalHoliday: true, badgeEmoji: '🎨', description: '自由と平和を愛し、文化をすすめる' },
  '2026-11-23': { date: '2026-11-23', name: '勤労感謝の日', isNationalHoliday: true, badgeEmoji: '🌾', description: '勤労をたつとび、生産を祝い、国民たがいに感謝しあう' },
};

export const JAPAN_DEFINITION: CountryDefinition = {
  code: 'JP',
  name: '日本',
  nativeName: '日本',
  flag: '🇯🇵',
  sourceName: '日本內閣府「国民の祝日について」',
  sourceUrl: 'https://www8.cao.go.jp/chosei/shukujitsu/gaiyou.html',
  holidays2026: JAPAN_2026_HOLIDAYS,
};
