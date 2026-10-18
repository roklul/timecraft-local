import { NextRequest, NextResponse } from 'next/server';
import {
  COUNTRIES,
  CountryCode,
  fetchRemotePublicHolidays,
  getAvailableCountries,
} from '@/lib/holidays';

/**
 * GET /api/calendar/holidays
 * 支援多國行事曆查詢與線上更新
 * 參數:
 * - country: 國家代碼 (如 TW, JP, US, SG, GB, DE, KR, CA, AU 等)
 * - year: 年份 (預設 2026)
 * - remote: 是否強制從公眾開放 API (Nager.Date) 獲取最新國定假日
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const country = (searchParams.get('country') || 'TW').toUpperCase();
    const year = parseInt(searchParams.get('year') || '2026', 10);
    const remote = searchParams.get('remote') === 'true';

    // 1. 若未指定特定國家，回傳目前系統內建支援的所有國家清單
    if (searchParams.has('list')) {
      const list = getAvailableCountries().map((c) => ({
        code: c.code,
        name: c.name,
        nativeName: c.nativeName,
        flag: c.flag,
        sourceName: c.sourceName,
        sourceUrl: c.sourceUrl,
        holidayCount: Object.keys(c.holidays2026).length,
      }));
      return NextResponse.json({ success: true, countries: list });
    }

    // 2. 若為內建國家且未要求強制遠端更新，直接回傳經官方核定之標準日曆
    if (!remote && COUNTRIES[country as CountryCode]) {
      const def = COUNTRIES[country as CountryCode];
      return NextResponse.json({
        success: true,
        source: 'local_verified',
        country: def.name,
        code: def.code,
        flag: def.flag,
        sourceName: def.sourceName,
        sourceUrl: def.sourceUrl,
        year,
        holidays: def.holidays2026,
      });
    }

    // 3. 遠端開放 API 查詢（支援全球 100+ 國家如 英國 GB、南韓 KR、德國 DE、澳洲 AU 等）
    const remoteHolidays = await fetchRemotePublicHolidays(year, country);
    return NextResponse.json({
      success: true,
      source: 'remote_api',
      country,
      year,
      holidays: remoteHolidays,
      count: Object.keys(remoteHolidays).length,
    });
  } catch (error: unknown) {
    console.error('Calendar holidays API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to retrieve holidays',
      },
      { status: 500 }
    );
  }
}
