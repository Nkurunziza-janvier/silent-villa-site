import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  ArrowLeft,
  BedDouble,
  CalendarDays,
  Check,
  Clock3,
  Copy,
  CreditCard,
  LoaderCircle,
  Mail,
  MapPin,
  MessageCircle,
  MessageSquare,
  Phone,
  ShieldCheck,
  Sparkles,
  Timer,
  User,
  Users,
  X,
} from 'lucide-react'
import { api, imageUrl, type BookingSlot, type Room } from './api'
import BrandLogo from './BrandLogo'
import { LanguageSwitch, useLanguage } from './i18n'

const MOMO_USSD_DISPLAY = '*182*8*1*23000737#'
const MOMO_USSD_TEL = 'tel:*182*8*1*23000737%23'

function getLocalToday(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function addDays(dateStr: string, days: number): string {
  const parsed = new Date(`${dateStr}T00:00:00Z`)
  if (Number.isNaN(parsed.getTime())) return dateStr
  parsed.setUTCDate(parsed.getUTCDate() + days)
  return parsed.toISOString().slice(0, 10)
}

function computeCheckOutTime(checkInDate: string, checkInTime: string, durationHours: number) {
  const [hh, mm] = (checkInTime || '10:00').split(':').map(Number)
  const baseMs = Date.parse(`${checkInDate}T00:00:00Z`)
  if (Number.isNaN(baseMs)) {
    return { checkOutDate: checkInDate, checkOutTime: '13:00', crossesMidnight: false }
  }
  const startMs = baseMs + ((hh || 0) * 60 + (mm || 0)) * 60_000
  const endMs = startMs + durationHours * 3_600_000
  const endDate = new Date(endMs)
  const checkOutDate = endDate.toISOString().slice(0, 10)
  const checkOutTime = endDate.toISOString().slice(11, 16)
  return {
    checkOutDate,
    checkOutTime,
    crossesMidnight: checkOutDate !== checkInDate,
  }
}

const TIME_SLOTS = [
  '06:00',
  '07:00',
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
  '21:00',
  '22:00',
]

const HOUR_DURATIONS = [1, 2, 3, 4, 6, 8, 12]

export type StayType = 'short_stay' | 'long_stay'

type BookingConfirmation = {
  id: number
  guestName: string
  phone: string
  message: string
  roomName: string
  roomPrice: number
  stayType: StayType
  checkIn: string
  checkOut: string
  checkInTime: string
  checkOutTime: string
  durationHours: number | null
  nights: number
  totalEstimate: number
  guests: number
}

export default function BookingPage() {
  const { t } = useLanguage()
  const [searchParams] = useSearchParams()
  const today = useMemo(() => getLocalToday(), [])

  const initialStayType: StayType =
    searchParams.get('stayType') === 'short_stay' ? 'short_stay' : 'long_stay'
  const initialCheckIn = searchParams.get('checkIn') || today
  const initialGuests = searchParams.get('guests') || '1'
  const initialHours = searchParams.get('hours') || '3'

  const [rooms, setRooms] = useState<Room[]>([])
  const [loadingRooms, setLoadingRooms] = useState(true)
  const [reservedSlots, setReservedSlots] = useState<BookingSlot[]>([])
  const [error, setError] = useState('')
  const [bookingSuccess, setBookingSuccess] = useState<BookingConfirmation | null>(null)
  const [copiedUssd, setCopiedUssd] = useState(false)
  const [busy, setBusy] = useState(false)
  const closeSuccessRef = useRef<HTMLButtonElement>(null)
  const shouldReduceMotion = useReducedMotion()

  const [form, setForm] = useState({
    roomId: searchParams.get('room') || '',
    stayType: initialStayType,
    name: '',
    email: '',
    phone: '',
    checkIn: initialCheckIn,
    checkOut: initialStayType === 'short_stay' ? initialCheckIn : addDays(initialCheckIn, 1),
    checkInTime: initialStayType === 'short_stay' ? '10:00' : '14:00',
    durationHours: initialHours,
    guests: initialGuests,
    specialRequests: '',
  })

  const selectedRoom = useMemo(
    () => rooms.find((room) => String(room.id) === form.roomId),
    [form.roomId, rooms],
  )
  const heroRoom = selectedRoom ?? rooms[0]
  const heroImage = heroRoom ? imageUrl(heroRoom.imageUrl) : '/media/room-1.jpg'

  const shortStayComputed = useMemo(
    () =>
      computeCheckOutTime(
        form.checkIn || today,
        form.checkInTime || '10:00',
        Number(form.durationHours) || 3,
      ),
    [form.checkIn, form.checkInTime, form.durationHours, today],
  )

  const nightsCount = useMemo(() => {
    if (form.stayType === 'short_stay') return 1
    if (!form.checkIn || !form.checkOut) return 1
    const diff =
      (Date.parse(`${form.checkOut}T00:00:00Z`) - Date.parse(`${form.checkIn}T00:00:00Z`)) /
      86_400_000
    return diff > 0 ? Math.round(diff) : 1
  }, [form.checkIn, form.checkOut, form.stayType])

  const estimatedAmount = useMemo(() => {
    const unitPrice = Number(selectedRoom?.price || 0)
    if (!unitPrice) return 0
    return form.stayType === 'short_stay' ? unitPrice : unitPrice * nightsCount
  }, [form.stayType, nightsCount, selectedRoom?.price])

  // Keep the selection in sync when URL parameters change
  useEffect(() => {
    const roomParam = searchParams.get('room')
    if (roomParam) {
      setForm((current) => (current.roomId === roomParam ? current : { ...current, roomId: roomParam }))
    }
  }, [searchParams])

  useEffect(() => {
    let active = true
    const loadRooms = () => {
      if (document.visibilityState === 'hidden') return
      api
        .rooms()
        .then((items) => {
          if (!active) return
          setRooms(items)
          setError('')
          setForm((current) => {
            if (current.roomId && items.some((room) => String(room.id) === current.roomId)) return current
            return items[0] ? { ...current, roomId: String(items[0].id) } : current
          })
        })
        .catch((err: Error) => {
          if (active) setError(err.message)
        })
        .finally(() => {
          if (active) setLoadingRooms(false)
        })
    }
    loadRooms()
    const interval = window.setInterval(loadRooms, 10000)
    window.addEventListener('focus', loadRooms)
    return () => {
      active = false
      window.clearInterval(interval)
      window.removeEventListener('focus', loadRooms)
    }
  }, [searchParams])

  // Load same-day reserved time windows for the selected room and check-in date
  useEffect(() => {
    let active = true
    const roomIdNum = Number(form.roomId)
    if (!roomIdNum || !form.checkIn) {
      setReservedSlots([])
      return
    }
    api.availability(roomIdNum, form.checkIn).then((slots) => {
      if (active) setReservedSlots(slots)
    })
    return () => {
      active = false
    }
  }, [form.roomId, form.checkIn, bookingSuccess])

  useEffect(() => {
    if (!bookingSuccess) return
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previousOverflow = document.body.style.overflow
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setBookingSuccess(null)
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', closeOnEscape)
    closeSuccessRef.current?.focus()
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
      previousFocus?.focus()
    }
  }, [bookingSuccess])

  const switchStayType = (nextType: StayType) => {
    setError('')
    setForm((current) => {
      if (current.stayType === nextType) return current
      const baseCheckIn = current.checkIn || today
      if (nextType === 'short_stay') {
        return {
          ...current,
          stayType: 'short_stay',
          checkIn: baseCheckIn,
          checkOut: baseCheckIn,
          checkInTime: current.checkInTime || '10:00',
          durationHours: current.durationHours || '3',
        }
      }
      return {
        ...current,
        stayType: 'long_stay',
        checkIn: baseCheckIn,
        checkOut: current.checkOut > baseCheckIn ? current.checkOut : addDays(baseCheckIn, 1),
        checkInTime: '14:00',
      }
    })
  }

  const copyUssdCode = async () => {
    try {
      await navigator.clipboard.writeText(MOMO_USSD_DISPLAY)
      setCopiedUssd(true)
      window.setTimeout(() => setCopiedUssd(false), 2500)
    } catch {
      setCopiedUssd(false)
    }
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!form.roomId || !rooms.some((room) => String(room.id) === form.roomId)) {
      setError(t('Please choose a room for your stay.'))
      return
    }
    if (!form.checkIn) {
      setError(t('Please select a check-in date.'))
      return
    }
    if (form.stayType === 'long_stay' && (!form.checkOut || form.checkOut <= form.checkIn)) {
      setError(
        t(
          'For overnight or long stays, please choose a check-out date after check-in, or select Short Stay (Hourly) for a same-day visit.',
        ),
      )
      return
    }

    const effectiveCheckOut =
      form.stayType === 'short_stay' ? shortStayComputed.checkOutDate : form.checkOut
    const effectiveCheckOutTime =
      form.stayType === 'short_stay' ? shortStayComputed.checkOutTime : '11:00'
    const durationNum = form.stayType === 'short_stay' ? Number(form.durationHours) || 3 : null

    const scheduleNote =
      form.stayType === 'short_stay'
        ? `[Short Stay: ${form.checkInTime} – ${effectiveCheckOutTime} (${durationNum}h)]`
        : `[Nightly/Long Stay: Arrival ${form.checkInTime || '14:00'}]`

    const combinedRequests = form.specialRequests.trim()
      ? `${scheduleNote} ${form.specialRequests.trim()}`
      : scheduleNote

    setBusy(true)
    setError('')
    try {
      const result = await api.book({
        roomId: Number(form.roomId),
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        stayType: form.stayType,
        checkIn: form.checkIn,
        checkOut: effectiveCheckOut,
        checkInTime: form.checkInTime,
        checkOutTime: effectiveCheckOutTime,
        durationHours: durationNum,
        guests: Number(form.guests),
        specialRequests: combinedRequests,
      })
      setBookingSuccess({
        id: result.id,
        guestName: form.name.trim(),
        phone: form.phone.trim(),
        message: result.message,
        roomName: selectedRoom?.name || 'Selected Room',
        roomPrice: Number(selectedRoom?.price || 0),
        stayType: form.stayType,
        checkIn: form.checkIn,
        checkOut: effectiveCheckOut,
        checkInTime: form.checkInTime,
        checkOutTime: effectiveCheckOutTime,
        durationHours: durationNum,
        nights: nightsCount,
        totalEstimate: estimatedAmount,
        guests: Number(form.guests),
      })
      setForm((current) => ({
        ...current,
        name: '',
        email: '',
        phone: '',
        specialRequests: '',
      }))
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const fieldClass = 'sv-input sv-input-icon mt-2'
  const selectClass = 'sv-input sv-input-icon sv-select mt-2'

  return (
    <main className="min-h-screen bg-[#f4f0e7]">
      <div className="grid min-h-screen lg:grid-cols-[0.92fr_1.08fr]">
        {/* Left Luxury Editorial Suite Showcase */}
        <aside className="relative hidden min-h-screen overflow-hidden bg-[#111d16] text-white lg:block">
          <AnimatePresence initial={false}>
            <motion.img
              key={heroImage}
              src={heroImage}
              alt={heroRoom ? `${heroRoom.name} at Silent Villa` : 'Silent Villa room'}
              initial={shouldReduceMotion ? false : { opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </AnimatePresence>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0b1510] via-[#0e1b13]/55 to-[#0a1410]/40" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-[#09120e]/85 to-transparent" />

          <div className="relative flex min-h-screen flex-col justify-between p-10 xl:p-14">
            <div className="flex items-center justify-between gap-4">
              <Link
                to="/"
                className="inline-flex items-center gap-3 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#bda06b]"
              >
                <BrandLogo variant="dark" size="md" showTagline />
              </Link>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#d8c28f]/35 bg-black/40 px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#e5cc9b] backdrop-blur-md">
                <BedDouble size={12} /> {t('Selected Suite')}
              </span>
            </div>

            <div className="my-auto max-w-lg py-10">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#e5cc9b] backdrop-blur-sm">
                <Sparkles size={11} /> {t('Short Stay & Extended Stays Available')}
              </span>
              {heroRoom ? (
                <>
                  <h1 className="mt-4 font-serif text-5xl leading-[0.95] tracking-tight xl:text-6xl">
                    {heroRoom.name}
                  </h1>
                  <p className="mt-4 flex flex-wrap items-baseline gap-2.5">
                    <span className="font-serif text-3xl tracking-tight text-[#f2dfb4]">
                      RWF {Number(heroRoom.price).toLocaleString()}
                    </span>
                    <span className="text-xs uppercase tracking-[0.18em] text-stone-300">
                      / {form.stayType === 'short_stay' ? t('short stay') : t('night')}
                    </span>
                  </p>
                  {heroRoom.description && (
                    <p className="mt-4 max-w-md text-sm leading-relaxed text-stone-200">
                      {heroRoom.description}
                    </p>
                  )}
                </>
              ) : (
                <h1 className="mt-4 font-serif text-5xl leading-[0.95] tracking-tight xl:text-6xl">
                  {t('Your room')}
                  <br />
                  <span className="italic text-[#d8c28f]">{t('is waiting.')}</span>
                </h1>
              )}

              {/* Payment & Location Highlights */}
              <div className="mt-8 space-y-3 rounded-2xl border border-white/15 bg-black/45 p-5 backdrop-blur-md">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#bda06b]/20 text-[#f2dfb4]">
                    <CreditCard size={15} />
                  </span>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#d8c28f]">
                      {t('Booking Confirmation via MTN MoMo Pay')}
                    </p>
                    <p className="mt-1 font-mono text-base font-bold tracking-wide text-white">
                      {MOMO_USSD_DISPLAY}
                    </p>
                    <p className="mt-0.5 text-xs text-stone-300">
                      {t('Submit your booking request below, then dial the MoMo Pay code to confirm.')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 border-t border-white/10 pt-3">
                  <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#bda06b]/20 text-[#f2dfb4]">
                    <MapPin size={15} />
                  </span>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#d8c28f]">
                      {t('Address & Location')}
                    </p>
                    <p className="mt-0.5 text-xs font-medium text-stone-200">
                      Nyamirambo / Kivugiza · KN 288 St, Kigali, Rwanda
                    </p>
                    <p className="text-[11px] text-stone-400">Plus Code: 227V+FJ Kigali · Tel: 0796 899 937</p>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-xs tracking-[0.2em] text-stone-400">
              SILENT VILLA GUEST HOUSE · NYAMIRAMBO / KIVUGIZA, KIGALI
            </p>
          </div>
        </aside>

        {/* Right Booking Form Section */}
        <section className="flex min-h-screen flex-col px-4 py-6 sm:px-8 sm:py-10 lg:px-12 xl:px-16">
          <div className="mx-auto w-full max-w-xl">
            <div className="flex items-center justify-between gap-3">
              <Link
                to="/rooms"
                className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-xs font-medium text-stone-600 shadow-xs transition hover:border-stone-300 hover:text-stone-900"
              >
                <ArrowLeft size={15} /> {t('Back to rooms')}
              </Link>
              <LanguageSwitch light />
            </div>

            <div className="mt-7 sm:mt-9">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#665940]">
                {t('Silent Villa · Direct Reservation')}
              </p>
              <h2 className="mt-2 font-serif text-4xl tracking-tight text-stone-900 sm:text-5xl">
                {t('Reserve your stay')}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">
                {t(
                  'Choose Short Stay (by the hour on the same day) or Nightly / Long Stay. Multiple guests can book the same room on the same day for different hours.',
                )}
              </p>
            </div>

            {loadingRooms ? (
              <div className="mt-8 flex items-center gap-3 rounded-2xl border border-stone-200 bg-white p-6 text-sm text-stone-500 shadow-xs">
                <LoaderCircle size={18} className="animate-spin text-[#756047]" />{' '}
                {t('Loading available rooms…')}
              </div>
            ) : rooms.length === 0 ? (
              <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-6 text-sm text-stone-600 shadow-xs">
                {t('There are no rooms available to book yet. Please contact Silent Villa directly.')}
              </div>
            ) : (
              <form
                onSubmit={submit}
                className="mt-6 space-y-5 rounded-3xl border border-stone-200/90 bg-[#fcfaf6] p-5 shadow-[0_18px_50px_rgba(36,52,42,0.06)] sm:p-8"
              >
                {/* Stay Type Selector: Short Stay (Hourly / Same-Day) vs Nightly / Long Stay */}
                <div>
                  <span className="sv-label">{t('Select stay type')}</span>
                  <div className="mt-2 grid grid-cols-2 gap-2.5 rounded-2xl border border-stone-200/90 bg-[#f3efe6] p-1.5">
                    <button
                      type="button"
                      onClick={() => switchStayType('short_stay')}
                      className={`flex flex-col items-start rounded-xl px-3.5 py-3 text-left transition ${
                        form.stayType === 'short_stay'
                          ? 'bg-[#24342a] text-white shadow-sm'
                          : 'text-stone-700 hover:bg-white/70'
                      }`}
                    >
                      <span className="flex items-center gap-1.5 text-xs font-semibold">
                        <Timer size={14} className={form.stayType === 'short_stay' ? 'text-[#d8c28f]' : 'text-[#756047]'} />
                        {t('Short Stay (Hourly)')}
                      </span>
                      <span
                        className={`mt-0.5 text-[11px] ${
                          form.stayType === 'short_stay' ? 'text-stone-300' : 'text-stone-500'
                        }`}
                      >
                        {t('Same-day visit · Choose hours')}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => switchStayType('long_stay')}
                      className={`flex flex-col items-start rounded-xl px-3.5 py-3 text-left transition ${
                        form.stayType === 'long_stay'
                          ? 'bg-[#24342a] text-white shadow-sm'
                          : 'text-stone-700 hover:bg-white/70'
                      }`}
                    >
                      <span className="flex items-center gap-1.5 text-xs font-semibold">
                        <CalendarDays
                          size={14}
                          className={form.stayType === 'long_stay' ? 'text-[#d8c28f]' : 'text-[#756047]'}
                        />
                        {t('Nightly / Long Stay')}
                      </span>
                      <span
                        className={`mt-0.5 text-[11px] ${
                          form.stayType === 'long_stay' ? 'text-stone-300' : 'text-stone-500'
                        }`}
                      >
                        {t('Overnight or multi-day stay')}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Selected Room Preview Card */}
                {selectedRoom && (
                  <div className="overflow-hidden rounded-2xl border border-[#e5dec9] bg-white shadow-xs sm:flex sm:items-center sm:gap-4 sm:p-3.5">
                    <img
                      src={imageUrl(selectedRoom.imageUrl)}
                      alt={selectedRoom.name}
                      className="h-44 w-full object-cover sm:h-20 sm:w-24 sm:shrink-0 sm:rounded-xl"
                    />
                    <div className="p-4 sm:min-w-0 sm:flex-1 sm:p-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-block rounded-full bg-[#f4f0e7] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#756047]">
                          {t('Your selected room')}
                        </span>
                        <span className="inline-block rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                          {form.stayType === 'short_stay' ? t('Same-day hourly booking enabled') : t('Overnight stay')}
                        </span>
                      </div>
                      <p className="mt-1 truncate font-serif text-xl text-stone-900 sm:text-2xl">
                        {selectedRoom.name}
                      </p>
                      <p className="mt-0.5 text-sm font-semibold text-[#665940]">
                        RWF {Number(selectedRoom.price).toLocaleString()}{' '}
                        <span className="text-xs font-normal text-stone-500">
                          {form.stayType === 'short_stay' ? `/ ${t('stay')}` : t('/ night')}
                        </span>
                      </p>
                    </div>
                  </div>
                )}

                {/* Room Dropdown */}
                <label className="block">
                  <span className="sv-label">{t('Choose a room')}</span>
                  <div className="relative">
                    <BedDouble
                      size={16}
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#756047]"
                    />
                    <select
                      className={selectClass}
                      value={form.roomId}
                      required
                      onChange={(event) => setForm({ ...form, roomId: event.target.value })}
                    >
                      <option value="" disabled>
                        {t('Select a room')}
                      </option>
                      {rooms.map((room) => (
                        <option key={room.id} value={room.id}>
                          {room.name} · RWF {Number(room.price).toLocaleString()}
                        </option>
                      ))}
                    </select>
                  </div>
                </label>

                {/* Date & Hours Section depending on Short Stay vs Nightly / Long Stay */}
                {form.stayType === 'short_stay' ? (
                  <div className="space-y-4 rounded-2xl border border-[#e5dec9] bg-white p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#665940]">
                        {t('Short Stay · Date & Hours')}
                      </p>
                      <span className="rounded-full bg-[#f4f0e7] px-2.5 py-1 text-[11px] font-medium text-[#665940]">
                        {form.checkInTime} → {shortStayComputed.checkOutTime} ({form.durationHours}{' '}
                        {Number(form.durationHours) === 1 ? t('hour') : t('hours')})
                      </span>
                    </div>

                    <div className="grid gap-3.5 sm:grid-cols-3">
                      <label className="block">
                        <span className="sv-label">{t('Date of visit')}</span>
                        <div className="relative">
                          <CalendarDays
                            size={16}
                            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#756047]"
                          />
                          <input
                            className={fieldClass}
                            type="date"
                            min={today}
                            required
                            value={form.checkIn}
                            onChange={(event) =>
                              setForm({
                                ...form,
                                checkIn: event.target.value,
                                checkOut: event.target.value,
                              })
                            }
                          />
                        </div>
                      </label>

                      <label className="block">
                        <span className="sv-label">{t('Check-in hour')}</span>
                        <div className="relative">
                          <Clock3
                            size={16}
                            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#756047]"
                          />
                          <select
                            className={selectClass}
                            value={form.checkInTime}
                            onChange={(event) => setForm({ ...form, checkInTime: event.target.value })}
                          >
                            {TIME_SLOTS.map((slot) => (
                              <option key={slot} value={slot}>
                                {slot}
                              </option>
                            ))}
                          </select>
                        </div>
                      </label>

                      <label className="block">
                        <span className="sv-label">{t('Duration (hours)')}</span>
                        <div className="relative">
                          <Timer
                            size={16}
                            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#756047]"
                          />
                          <select
                            className={selectClass}
                            value={form.durationHours}
                            onChange={(event) => setForm({ ...form, durationHours: event.target.value })}
                          >
                            {HOUR_DURATIONS.map((hrs) => (
                              <option key={hrs} value={hrs}>
                                {hrs} {hrs === 1 ? t('hour') : t('hours')}
                              </option>
                            ))}
                          </select>
                        </div>
                      </label>
                    </div>

                    {/* Quick Hour Pills */}
                    <div>
                      <p className="text-[11px] font-medium text-stone-500">
                        {t('Quick select arrival hour:')}
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'].map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setForm({ ...form, checkInTime: slot })}
                            className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                              form.checkInTime === slot
                                ? 'border-[#24342a] bg-[#24342a] text-white'
                                : 'border-stone-200 bg-[#faf8f3] text-stone-700 hover:border-[#bda06b]'
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>

                    {reservedSlots.length > 0 && (
                      <div className="rounded-xl border border-amber-200/80 bg-amber-50/70 px-3.5 py-2.5 text-xs text-amber-900">
                        <p className="font-semibold">
                          {t('Already reserved time windows on this date:')}
                        </p>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {reservedSlots.map((slot) => (
                            <span
                              key={slot.id}
                              className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-0.5 text-[11px] font-medium text-amber-800 shadow-2xs"
                            >
                              <Clock3 size={11} />
                              {slot.checkInTime || '14:00'} → {slot.checkOutTime || '11:00'}
                            </span>
                          ))}
                        </div>
                        <p className="mt-1 text-[11px] text-amber-700">
                          {t('You can book this same room on the same day for any other non-overlapping hours.')}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4 rounded-2xl border border-[#e5dec9] bg-white p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#665940]">
                        {t('Nightly / Long Stay · Dates & Arrival Time')}
                      </p>
                      <span className="rounded-full bg-[#f4f0e7] px-2.5 py-1 text-[11px] font-medium text-[#665940]">
                        {nightsCount} {nightsCount === 1 ? t('night') : t('nights')}
                      </span>
                    </div>

                    <div className="grid gap-3.5 sm:grid-cols-3">
                      <label className="block">
                        <span className="sv-label">{t('Check-in date')}</span>
                        <div className="relative">
                          <CalendarDays
                            size={16}
                            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#756047]"
                          />
                          <input
                            className={fieldClass}
                            type="date"
                            min={today}
                            required
                            value={form.checkIn}
                            onChange={(event) => {
                              const nextIn = event.target.value
                              setForm((current) => ({
                                ...current,
                                checkIn: nextIn,
                                checkOut:
                                  current.checkOut && current.checkOut > nextIn
                                    ? current.checkOut
                                    : addDays(nextIn, 1),
                              }))
                            }}
                          />
                        </div>
                      </label>

                      <label className="block">
                        <span className="sv-label">{t('Check-out date')}</span>
                        <div className="relative">
                          <CalendarDays
                            size={16}
                            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#756047]"
                          />
                          <input
                            className={fieldClass}
                            type="date"
                            min={addDays(form.checkIn || today, 1)}
                            required
                            value={form.checkOut}
                            onChange={(event) => setForm({ ...form, checkOut: event.target.value })}
                          />
                        </div>
                      </label>

                      <label className="block">
                        <span className="sv-label">{t('Arrival time')}</span>
                        <div className="relative">
                          <Clock3
                            size={16}
                            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#756047]"
                          />
                          <select
                            className={selectClass}
                            value={form.checkInTime}
                            onChange={(event) => setForm({ ...form, checkInTime: event.target.value })}
                          >
                            {TIME_SLOTS.map((slot) => (
                              <option key={slot} value={slot}>
                                {slot}
                              </option>
                            ))}
                          </select>
                        </div>
                      </label>
                    </div>
                  </div>
                )}

                {/* Guest Details */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="sv-label">{t('Full name')}</span>
                    <div className="relative">
                      <User
                        size={16}
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#756047]"
                      />
                      <input
                        className={fieldClass}
                        autoComplete="name"
                        required
                        maxLength={120}
                        value={form.name}
                        onChange={(event) => setForm({ ...form, name: event.target.value })}
                        placeholder={t('Your name')}
                      />
                    </div>
                  </label>
                  <label className="block">
                    <span className="sv-label">{t('Phone number')}</span>
                    <div className="relative">
                      <Phone
                        size={16}
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#756047]"
                      />
                      <input
                        className={fieldClass}
                        autoComplete="tel"
                        required
                        maxLength={40}
                        value={form.phone}
                        onChange={(event) => setForm({ ...form, phone: event.target.value })}
                        placeholder="+250 7xx xxx xxx"
                      />
                    </div>
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-[1.35fr_0.65fr]">
                  <label className="block">
                    <span className="sv-label">
                      {t('Email address')}{' '}
                      <span className="font-normal lowercase text-stone-400">({t('optional')})</span>
                    </span>
                    <div className="relative">
                      <Mail
                        size={16}
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#756047]"
                      />
                      <input
                        className={fieldClass}
                        type="email"
                        autoComplete="email"
                        maxLength={190}
                        value={form.email}
                        onChange={(event) => setForm({ ...form, email: event.target.value })}
                        placeholder="you@example.com"
                      />
                    </div>
                  </label>

                  <label className="block">
                    <span className="sv-label">{t('Guests')}</span>
                    <div className="relative">
                      <Users
                        size={16}
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#756047]"
                      />
                      <select
                        className={selectClass}
                        value={form.guests}
                        onChange={(event) => setForm({ ...form, guests: event.target.value })}
                      >
                        {Array.from({ length: 10 }, (_, index) => (
                          <option key={index + 1} value={index + 1}>
                            {index + 1} {t(index === 0 ? 'guest' : 'guests')}
                          </option>
                        ))}
                      </select>
                    </div>
                  </label>
                </div>

                <label className="block">
                  <span className="sv-label">
                    {t('Special requests')}{' '}
                    <span className="font-normal lowercase text-stone-400">({t('optional')})</span>
                  </span>
                  <div className="relative">
                    <MessageSquare
                      size={16}
                      className="pointer-events-none absolute left-3.5 top-4 text-[#756047]"
                    />
                    <textarea
                      className={`${fieldClass} min-h-24 resize-y pt-3`}
                      maxLength={2000}
                      value={form.specialRequests}
                      onChange={(event) => setForm({ ...form, specialRequests: event.target.value })}
                      placeholder={t('Anything we should know before your stay?')}
                    />
                  </div>
                </label>

                {/* Pre-submission Payment & Summary Banner */}
                <div className="rounded-2xl border border-[#e0d4bc] bg-[#f7f2e7] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#756047]">
                        {t('Confirm your booking with MoMo Pay')}
                      </p>
                      <p className="mt-0.5 text-xs text-stone-700">
                        {t('After submitting, pay on')}{' '}
                        <span className="font-mono font-bold text-[#18251d]">{MOMO_USSD_DISPLAY}</span>{' '}
                        {t('to confirm.')}
                      </p>
                    </div>
                    {estimatedAmount > 0 && (
                      <div className="text-right">
                        <span className="block text-[10px] uppercase tracking-[0.16em] text-stone-500">
                          {t('Estimated total')}
                        </span>
                        <span className="font-serif text-xl font-semibold text-[#18251d]">
                          RWF {estimatedAmount.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {error && (
                  <p
                    role="alert"
                    className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                  >
                    {error}
                  </p>
                )}

                <button
                  disabled={busy || rooms.length === 0}
                  className="inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-full bg-[#24342a] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(36,52,42,0.22)] transition hover:bg-[#35463b] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {busy ? (
                    <>
                      <LoaderCircle size={17} className="animate-spin" /> {t('Sending request…')}
                    </>
                  ) : (
                    <>
                      {t('Complete booking request')} <ArrowLeft className="rotate-180" size={16} />
                    </>
                  )}
                </button>
                <p className="flex items-center justify-center gap-2 pt-1 text-center text-xs text-stone-500">
                  <MapPin size={13} className="shrink-0 text-[#756047]" /> Nyamirambo / Kivugiza · KN 288 St,
                  Kigali · Tel: 0796 899 937
                </p>
              </form>
            )}
          </div>
        </section>
      </div>

      {/* Professional Booking Confirmation & MoMo Pay Modal */}
      <AnimatePresence>
        {bookingSuccess && (
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] grid place-items-center overflow-y-auto bg-[#15221a]/75 px-4 py-8 backdrop-blur-md"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setBookingSuccess(null)
            }}
          >
            <motion.section
              initial={shouldReduceMotion ? false : { opacity: 0, y: 24, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 280, damping: 24 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="booking-success-title"
              aria-describedby="booking-success-description"
              className="relative my-auto w-full max-w-xl overflow-hidden rounded-[2rem] border border-white/70 bg-[#fcfaf6] px-5 pb-6 pt-8 text-center shadow-[0_35px_100px_rgba(0,0,0,0.4)] sm:px-9 sm:pb-8 sm:pt-10"
            >
              <button
                ref={closeSuccessRef}
                type="button"
                onClick={() => setBookingSuccess(null)}
                aria-label="Close booking confirmation"
                className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border border-stone-200 bg-white text-stone-500 transition hover:bg-stone-100 hover:text-stone-900"
              >
                <X size={17} />
              </button>

              <div className="relative mx-auto grid h-20 w-20 place-items-center">
                <motion.div
                  initial={shouldReduceMotion ? false : { scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 18 }}
                  className="relative grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-[#24342a] to-[#18251d] text-[#f2dfb4] shadow-[0_12px_30px_rgba(24,37,29,0.28)]"
                >
                  <Check size={28} strokeWidth={2.5} />
                </motion.div>
              </div>

              <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#665940]">
                {t('Reservation Request Received')} · #{String(bookingSuccess.id).padStart(6, '0')}
              </p>

              <h2
                id="booking-success-title"
                className="mt-2 font-serif text-3xl leading-tight tracking-tight text-stone-900 sm:text-4xl"
              >
                {t('Thank you for booking with Silent Villa!')}
              </h2>

              <p
                id="booking-success-description"
                className="mx-auto mt-2.5 max-w-md text-sm leading-relaxed text-stone-600"
              >
                {t('To confirm your booking, please complete your payment using our MTN MoMo Pay code below:')}
              </p>

              {/* Prominent MTN MoMo Pay Action Box */}
              <div className="mt-5 overflow-hidden rounded-2xl border-2 border-[#bda06b] bg-[#18251d] p-5 text-white shadow-lg">
                <div className="flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#d8c28f]">
                  <CreditCard size={14} />
                  <span>{t('MTN MoMo Pay Confirmation Code')}</span>
                </div>

                <p className="mt-2.5 font-mono text-2xl font-bold tracking-wider text-[#f7e7c4] sm:text-3xl">
                  {MOMO_USSD_DISPLAY}
                </p>

                {bookingSuccess.totalEstimate > 0 && (
                  <p className="mt-1.5 text-xs text-stone-300">
                    {t('Amount to pay:')}{' '}
                    <span className="font-semibold text-white">
                      RWF {bookingSuccess.totalEstimate.toLocaleString()}
                    </span>{' '}
                    ({bookingSuccess.roomName})
                  </p>
                )}

                <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
                  <a
                    href={MOMO_USSD_TEL}
                    className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-[#bda06b] px-5 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-[#18251d] transition hover:bg-[#dfcc9f]"
                  >
                    <Phone size={14} /> {t('Dial')} {MOMO_USSD_DISPLAY}
                  </a>
                  <button
                    type="button"
                    onClick={() => void copyUssdCode()}
                    className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-white/20"
                  >
                    {copiedUssd ? (
                      <>
                        <Check size={14} className="text-emerald-300" /> {t('Copied!')}
                      </>
                    ) : (
                      <>
                        <Copy size={14} /> {t('Copy code')}
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Booking Details Recap */}
              <div className="mt-5 rounded-2xl border border-stone-200 bg-white p-4 text-left">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#f3efe8] text-[#665940]">
                      <CalendarDays size={18} />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-stone-900">{bookingSuccess.roomName}</p>
                      <p className="text-xs text-stone-500">
                        {bookingSuccess.guestName} · {bookingSuccess.guests}{' '}
                        {bookingSuccess.guests === 1 ? t('guest') : t('guests')}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-[#f4f0e7] px-3 py-1 text-[11px] font-semibold text-[#665940]">
                    {bookingSuccess.stayType === 'short_stay'
                      ? `${t('Short Stay')} · ${bookingSuccess.durationHours || 3}h`
                      : `${t('Nightly Stay')} · ${bookingSuccess.nights} ${
                          bookingSuccess.nights === 1 ? t('night') : t('nights')
                        }`}
                  </span>
                </div>

                <div className="mt-3 grid gap-2 text-xs text-stone-600 sm:grid-cols-2">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                      {t('Schedule')}
                    </span>
                    {bookingSuccess.stayType === 'short_stay' ? (
                      <p className="mt-0.5 font-medium text-stone-800">
                        {bookingSuccess.checkIn} · {bookingSuccess.checkInTime} →{' '}
                        {bookingSuccess.checkOutTime}
                      </p>
                    ) : (
                      <p className="mt-0.5 font-medium text-stone-800">
                        {bookingSuccess.checkIn} ({bookingSuccess.checkInTime}) → {bookingSuccess.checkOut}
                      </p>
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                      {t('Location')}
                    </span>
                    <p className="mt-0.5 font-medium text-stone-800">
                      Nyamirambo / Kivugiza, KN 288 St, Kigali
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
                <a
                  href={`https://wa.me/250796899937?text=${encodeURIComponent(
                    `Hello Silent Villa, I have booked ${bookingSuccess.roomName} (Booking #${bookingSuccess.id}) for ${
                      bookingSuccess.stayType === 'short_stay'
                        ? `Short Stay on ${bookingSuccess.checkIn} (${bookingSuccess.checkInTime} - ${bookingSuccess.checkOutTime})`
                        : `${bookingSuccess.checkIn} to ${bookingSuccess.checkOut}`
                    } under the name ${bookingSuccess.guestName}. I am confirming my payment via *182*8*1*23000737#.`,
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#236c50] px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-[#1d5b43]"
                >
                  <MessageCircle size={15} /> {t('Confirm on WhatsApp')}
                </a>
                <button
                  type="button"
                  onClick={() => setBookingSuccess(null)}
                  className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#24342a] px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-[#35463b]"
                >
                  {t('Done')}
                </button>
              </div>

              <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-stone-400">
                <ShieldCheck size={13} className="text-[#756047]" />
                Silent Villa · Nyamirambo / Kivugiza, KN 288 St, Kigali · 0796 899 937
              </p>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
