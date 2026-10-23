import { useCallback, useEffect, useMemo, useState } from 'react'
import { Button, Icon, useToast } from '@/shared/ui'
import { createCheckIn, fetchCheckInCalendar } from '../api/checkInApi'

function currentMonthInVietnam() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit',
  }).formatToParts(new Date())
  const value = Object.fromEntries(parts.map(part => [part.type, part.value]))
  return `${value.year}-${value.month}`
}

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const messageOf = error => error?.requestId ? `${error.message} Reference: ${error.requestId}` : error?.message

function shiftMonth(value, offset) {
  const [year, month] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1 + offset, 1))
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`
}

function monthLabel(value) {
  const [year, month] = value.split('-').map(Number)
  return new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric', timeZone: 'UTC' })
    .format(new Date(Date.UTC(year, month - 1, 1)))
}

function calendarCells(month, days) {
  const [year, monthNumber] = month.split('-').map(Number)
  const firstDay = new Date(Date.UTC(year, monthNumber - 1, 1)).getUTCDay()
  const totalDays = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate()
  const byDate = new Map(days.map(day => [day.date, day]))
  return [
    ...Array.from({ length: firstDay }, (_, index) => ({ key: `empty-${index}` })),
    ...Array.from({ length: totalDays }, (_, index) => {
      const date = `${month}-${String(index + 1).padStart(2, '0')}`
      return { key: date, dayNumber: index + 1, record: byDate.get(date) }
    }),
  ]
}

function DayCell({ cell, today }) {
  if (!cell.dayNumber) return <span aria-hidden="true" />
  const record = cell.record
  const isToday = cell.key === today
  const statusClass = record?.rewardStatus === 'REWARDED'
    ? 'border-success/50 bg-success/15 text-success'
    : record ? 'border-tertiary/50 bg-tertiary-container/15 text-tertiary' : 'border-outline-variant/30 bg-surface-container-lowest text-on-surface-variant'
  return <div className={`min-h-16 rounded-lg border p-2 ${statusClass} ${isToday ? 'ring-2 ring-primary' : ''}`}>
    <div className="flex items-start justify-between"><span className="text-xs font-semibold">{cell.dayNumber}</span>{record && <Icon name={record.rewardStatus === 'REWARDED' ? 'check_circle' : 'schedule'} filled className="text-base" />}</div>
    {record && <p className="mt-1 text-[10px] font-semibold">+{record.rewardCoins} coins</p>}
  </div>
}

export default function DailyCheckInModal({ onClose }) {
  const notify = useToast()
  const [month, setMonth] = useState(currentMonthInVietnam)
  const [calendar, setCalendar] = useState(null)
  const [loading, setLoading] = useState(true)
  const [claiming, setClaiming] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async (targetMonth, signal) => {
    setLoading(true); setError('')
    try {
      const result = await fetchCheckInCalendar(targetMonth, signal)
      setCalendar(result)
      return result
    } catch (failure) {
      if (failure.name !== 'AbortError') setError(messageOf(failure) || 'Unable to load the check-in calendar.')
      return null
    } finally { if (!signal?.aborted) setLoading(false) }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    fetchCheckInCalendar(month, controller.signal)
      .then(setCalendar)
      .catch(failure => { if (failure.name !== 'AbortError') setError(messageOf(failure) || 'Unable to load the check-in calendar.') })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [month])

  const browse = offset => {
    setLoading(true); setError('')
    setMonth(current => shiftMonth(current, offset))
  }

  const cells = useMemo(() => calendarCells(month, calendar?.days || []), [month, calendar?.days])

  const claim = async () => {
    setClaiming(true); setError('')
    try {
      const result = await createCheckIn()
      const targetMonth = result.date.slice(0, 7)
      if (targetMonth !== month) { setLoading(true); setMonth(targetMonth) }
      else await load(targetMonth)
      notify(result.rewardStatus === 'REWARDED'
        ? `Check-in complete. ${result.rewardCoins} coins awarded.`
        : 'Check-in recorded. Your reward is still pending.')
    } catch (failure) {
      const refreshed = await load(month)
      if (failure.code === 'AUTH_CHECKIN_ALREADY_EXISTS' || refreshed?.checkedInToday) {
        notify('Today’s check-in was already recorded.')
      } else setError(messageOf(failure) || 'Unable to check in today.')
    } finally { setClaiming(false) }
  }

  return <div className="fixed inset-0 z-modal flex items-center justify-center bg-surface-container-lowest/80 p-space-md backdrop-blur-xl" role="dialog" aria-modal="true" aria-label="Daily check-in calendar">
    <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col gap-space-md overflow-y-auto rounded-2xl bg-surface-container-low/95 p-space-lg shadow-dialog">
      <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl"></div>
      <header className="relative z-10 flex items-start justify-between gap-space-md">
        <div className="flex items-center gap-space-sm"><span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-container to-secondary-container"><Icon name="calendar_month" filled className="text-2xl text-tertiary" /></span><div><h2 className="font-headline-lg text-headline-lg text-primary">DAILY CHECK-IN</h2><p className="text-body-sm text-on-surface-variant">One reward per day · Asia/Ho_Chi_Minh</p></div></div>
        <button type="button" aria-label="Close" onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant hover:text-on-surface"><Icon name="close" /></button>
      </header>

      {error && <div className="relative z-10 rounded-xl border border-error/35 bg-error-container/20 p-3 text-sm text-on-error-container" role="alert">{error}</div>}

      <section className="relative z-10 rounded-xl bg-surface-container p-space-md">
        <div className="mb-space-md flex items-center justify-between">
          <button type="button" aria-label="Previous month" onClick={() => browse(-1)} className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-container-high hover:bg-surface-variant"><Icon name="chevron_left" /></button>
          <h3 className="font-headline-sm text-headline-sm">{monthLabel(month)}</h3>
          <button type="button" aria-label="Next month" onClick={() => browse(1)} className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-container-high hover:bg-surface-variant"><Icon name="chevron_right" /></button>
        </div>
        <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-wider text-outline">{weekDays.map(day => <span key={day}>{day}</span>)}</div>
        {loading ? <div className="py-space-xl text-center text-sm text-on-surface-variant" role="status">Loading calendar…</div>
          : <div className="grid grid-cols-7 gap-1">{cells.map(cell => <DayCell key={cell.key} cell={cell} today={calendar?.today} />)}</div>}
      </section>

      <footer className="relative z-10 flex flex-col gap-space-md sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-on-surface-variant">
          {calendar?.checkedInToday
            ? <span className="inline-flex items-center gap-1.5 text-success"><Icon name="check_circle" filled />Today’s check-in is recorded.</span>
            : <span className="inline-flex items-center gap-1.5"><Icon name="info" className="text-tertiary" />The server determines today and the reward amount.</span>}
        </div>
        <div className="flex gap-space-sm"><Button onClick={onClose}>Close</Button><Button variant="primary" onClick={claim} disabled={loading || claiming || calendar?.checkedInToday}>{claiming ? 'Checking in…' : calendar?.checkedInToday ? 'Checked in today' : 'Check in now'}</Button></div>
      </footer>
    </div>
  </div>
}
