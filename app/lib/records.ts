export interface BodyRecord {
  date: string   // 'YYYY-MM-DD'
  weight: number
  bodyFat?: number
}

export const BODY_RECORDS_KEY = 'mworld_body_records'
export const TARGET_WEIGHT_KEY = 'mworld_target_weight'
export const SKIP_RECORD_KEY = 'mworld_skip_record_date'

export function loadRecords(): BodyRecord[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(BODY_RECORDS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

export function saveRecords(records: BodyRecord[]): void {
  localStorage.setItem(BODY_RECORDS_KEY, JSON.stringify(records))
}

export function upsertRecord(record: BodyRecord): BodyRecord[] {
  const records = loadRecords()
  const idx = records.findIndex((r) => r.date === record.date)
  if (idx >= 0) records[idx] = record
  else records.push(record)
  records.sort((a, b) => a.date.localeCompare(b.date))
  saveRecords(records)
  return records
}

export function loadTargetWeight(): number | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(TARGET_WEIGHT_KEY)
  const v = raw ? parseFloat(raw) : NaN
  return isNaN(v) ? null : v
}
