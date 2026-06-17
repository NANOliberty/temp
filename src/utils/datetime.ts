// 백엔드는 openAt 등을 타임존 표기 없이 UTC(LocalDateTime, 예: "2026-06-30T01:40:00")로 내려준다.
// JS의 new Date()는 표기가 없으면 로컬 시간으로 해석하므로, UTC로 보정한 뒤 Date를 만든다.
export function parseServerDate(iso: string): Date {
  const utc = /([zZ]|[+-]\d{2}:?\d{2})$/.test(iso) ? iso : `${iso}Z`
  return new Date(utc)
}

// 서버 UTC 시간 → <input type="datetime-local"> 값(로컬 벽시계 시간 "YYYY-MM-DDTHH:mm")
export function toDatetimeLocal(iso: string): string {
  const d = parseServerDate(iso)
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
}

// 서버 UTC 시간 → 한국어 로컬 표시 문자열
export function formatServerDate(iso: string | null, fallback = '즉시 시작'): string {
  if (!iso) return fallback
  return parseServerDate(iso).toLocaleString('ko-KR', { dateStyle: 'short', timeStyle: 'short' })
}
