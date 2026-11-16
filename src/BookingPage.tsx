import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowLeft, BedDouble, CalendarDays, Check, Clock3, LoaderCircle, Mail, MapPin, MessageSquare, Phone, ShieldCheck, Sparkles, User, Users, X } from 'lucide-react'
import { api, imageUrl, type Room } from './api'
import BrandLogo from './BrandLogo'
import { LanguageSwitch, useLanguage } from './i18n'
import VillaScene3D from './VillaScene3D'

const today = new Date().toISOString().slice(0, 10)

export default function BookingPage() {
  const { t } = useLanguage()
  const [searchParams] = useSearchParams()
  const [rooms, setRooms] = useState<Room[]>([])
  const [loadingRooms, setLoadingRooms] = useState(true)
  const [error, setError] = useState('')
  const [bookingSuccess, setBookingSuccess] = useState<{ id: number; message: string; roomName: string; checkIn: string; checkOut: string; guests: number } | null>(null)
  const [busy, setBusy] = useState(false)
  const closeSuccessRef = useRef<HTMLButtonElement>(null)
  const shouldReduceMotion = useReducedMotion()
  const [form, setForm] = useState({ roomId: searchParams.get('room') || '', name: '', email: '', phone: '', checkIn: '', checkOut: '', guests: '1', specialRequests: '' })
  const selectedRoom = useMemo(() => rooms.find((room) => String(room.id) === form.roomId), [form.roomId, rooms])

  useEffect(() => {
    let active = true
    const loadRooms = () => {
      if (document.visibilityState === 'hidden') return
      api.rooms().then((items) => {
        if (!active) return
        setRooms(items)
        setError('')
        if (!searchParams.get('room') && items[0]) setForm((current) => current.roomId ? current : ({ ...current, roomId: String(items[0].id) }))
      }).catch((err: Error) => {
        if (active) setError(err.message)
      }).finally(() => {
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

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const result = await api.book({ ...form, roomId: Number(form.roomId), guests: Number(form.guests) })
      setBookingSuccess({
        id: result.id,
        message: result.message,
        roomName: selectedRoom?.name || 'Your selected room',
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        guests: Number(form.guests),
      })
      setForm((current) => ({ ...current, name: '', email: '', phone: '', checkIn: '', checkOut: '', guests: '1', specialRequests: '' }))
    } catch (err) { setError((err as Error).message) } finally { setBusy(false) }
  }

  const fieldClass = 'sv-input sv-input-icon mt-2'
  const selectClass = 'sv-input sv-input-icon sv-select mt-2'

  return (
    <main className="min-h-screen bg-[#f4f0e7]">
      <div className="grid min-h-screen lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="relative hidden overflow-hidden bg-[#18251d] text-white lg:block">
          <img src={selectedRoom ? imageUrl(selectedRoom.imageUrl) : '/media/room-1.jpg'} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />
          <VillaScene3D activeHotspot="suites" mood="starlight" interactive className="absolute inset-0 h-full w-full opacity-85" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#142018] via-[#18251d]/45 to-[#18251d]/30" />
          <div className="pointer-events-none relative flex min-h-screen flex-col justify-between p-12 xl:p-16">
            <div className="pointer-events-auto flex items-center justify-between">
              <Link to="/" className="inline-flex items-center gap-3 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#bda06b]">
                <BrandLogo variant="dark" size="md" showTagline />
              </Link>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#d8c28f]/30 bg-black/30 px-3 py-1.5 text-[10px] uppercase tracking-[0.22em] text-[#d8c28f] backdrop-blur-md">
                <Sparkles size={12} /> 3D Interactive View
              </span>
            </div>
            <div className="max-w-lg pb-6">
              <span className="text-xs uppercase tracking-[0.3em] text-[#d8c28f]">{t('A quieter kind of stay')}</span>
              <h1 className="mt-5 font-serif text-6xl leading-[0.95] tracking-tight xl:text-7xl">{t('Your room')}<br /><span className="italic text-[#d8c28f]">{t('is waiting.')}</span></h1>
              <p className="mt-6 max-w-md leading-relaxed text-stone-300">{t('Make a booking request for your Kigali visit. Our team will confirm your stay shortly.')}</p>
              <div className="mt-9 flex flex-wrap gap-5 text-xs text-stone-300"><span className="inline-flex items-center gap-2"><MapPin size={14} className="text-[#bda06b]" /> KN 288 St · Kigali, Rwanda</span><span className="inline-flex items-center gap-2"><ShieldCheck size={14} className="text-[#bda06b]" /> {t('No payment required')}</span></div>
            </div>
            <p className="text-xs tracking-wide text-stone-400">SILENT VILLA · WHERE COMFORT MEETS SILENCE</p>
          </div>
        </aside>

        <section className="flex min-h-screen flex-col px-4 py-6 sm:px-8 sm:py-10 lg:px-14 xl:px-20">
          <div className="mx-auto w-full max-w-xl">
            <div className="flex items-center justify-between gap-3">
              <Link to="/rooms" className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-xs font-medium text-stone-600 shadow-xs transition hover:border-stone-300 hover:text-stone-900">
                <ArrowLeft size={15} /> {t('Back to rooms')}
              </Link>
              <LanguageSwitch light />
            </div>

            <div className="mt-8 sm:mt-10">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#665940]">{t('Reserve your stay')}</p>
              <h2 className="mt-2 font-serif text-4xl tracking-tight text-stone-900 sm:text-5xl">{t('Booking request')}</h2>
              <p className="mt-2.5 text-sm leading-relaxed text-stone-500">{t('Share a few details and we’ll get back to you to confirm availability.')}</p>
            </div>

            {loadingRooms ? (
              <div className="mt-10 flex items-center gap-3 rounded-2xl border border-stone-200 bg-white p-6 text-sm text-stone-500 shadow-xs">
                <LoaderCircle size={18} className="animate-spin text-[#756047]" /> {t('Loading available rooms…')}
              </div>
            ) : rooms.length === 0 ? (
              <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-6 text-sm text-stone-600 shadow-xs">
                {t('There are no rooms available to book yet. Please contact Silent Villa directly.')}
              </div>
            ) : (
              <form onSubmit={submit} className="mt-7 space-y-5 rounded-3xl border border-stone-200/90 bg-[#fcfaf6] p-5 shadow-[0_18px_50px_rgba(36,52,42,0.06)] sm:p-8">
                {selectedRoom && (
                  <div className="flex items-center gap-4 rounded-2xl border border-[#e5dec9] bg-white p-3.5 shadow-xs">
                    <img src={imageUrl(selectedRoom.imageUrl)} alt={selectedRoom.name} className="h-20 w-24 shrink-0 rounded-xl object-cover" />
                    <div className="min-w-0 flex-1">
                      <span className="inline-block rounded-full bg-[#f4f0e7] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#756047]">
                        {t('Your selected room')}
                      </span>
                      <p className="mt-1 truncate font-serif text-xl text-stone-900 sm:text-2xl">{selectedRoom.name}</p>
                      <p className="mt-0.5 text-sm font-semibold text-[#665940]">
                        RWF {Number(selectedRoom.price).toLocaleString()} <span className="text-xs font-normal text-stone-500">{t('/ night')}</span>
                      </p>
                    </div>
                  </div>
                )}

                <label className="block">
                  <span className="sv-label">{t('Choose a room')}</span>
                  <div className="relative">
                    <BedDouble size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#756047]" />
                    <select className={selectClass} value={form.roomId} required onChange={(event) => setForm({ ...form, roomId: event.target.value })}>
                      <option value="" disabled>{t('Select a room')}</option>
                      {rooms.map((room) => (
                        <option key={room.id} value={room.id}>
                          {room.name} · RWF {Number(room.price).toLocaleString()} / night
                        </option>
                      ))}
                    </select>
                  </div>
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="sv-label">{t('Full name')}</span>
                    <div className="relative">
                      <User size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#756047]" />
                      <input className={fieldClass} autoComplete="name" required maxLength={120} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder={t('Your name')} />
                    </div>
                  </label>
                  <label className="block">
                    <span className="sv-label">{t('Phone number')}</span>
                    <div className="relative">
                      <Phone size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#756047]" />
                      <input className={fieldClass} autoComplete="tel" required maxLength={40} value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="+250 7xx xxx xxx" />
                    </div>
                  </label>
                </div>

                <label className="block">
                  <span className="sv-label">
                    {t('Email address')} <span className="font-normal lowercase text-stone-400">({t('optional')})</span>
                  </span>
                  <div className="relative">
                    <Mail size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#756047]" />
                    <input className={fieldClass} type="email" autoComplete="email" maxLength={190} value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="you@example.com" />
                  </div>
                </label>

                <div className="grid gap-4 sm:grid-cols-3">
                  <label className="block">
                    <span className="sv-label">{t('Check-in')}</span>
                    <div className="relative">
                      <CalendarDays size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#756047]" />
                      <input className={fieldClass} type="date" min={today} required value={form.checkIn} onChange={(event) => setForm({ ...form, checkIn: event.target.value })} />
                    </div>
                  </label>
                  <label className="block">
                    <span className="sv-label">{t('Check-out')}</span>
                    <div className="relative">
                      <CalendarDays size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#756047]" />
                      <input className={fieldClass} type="date" min={form.checkIn || today} required value={form.checkOut} onChange={(event) => setForm({ ...form, checkOut: event.target.value })} />
                    </div>
                  </label>
                  <label className="block">
                    <span className="sv-label">{t('Guests')}</span>
                    <div className="relative">
                      <Users size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#756047]" />
                      <select className={selectClass} value={form.guests} onChange={(event) => setForm({ ...form, guests: event.target.value })}>
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
                    {t('Special requests')} <span className="font-normal lowercase text-stone-400">({t('optional')})</span>
                  </span>
                  <div className="relative">
                    <MessageSquare size={16} className="pointer-events-none absolute left-3.5 top-4 text-[#756047]" />
                    <textarea className={`${fieldClass} min-h-28 resize-y pt-3`} maxLength={2000} value={form.specialRequests} onChange={(event) => setForm({ ...form, specialRequests: event.target.value })} placeholder={t('Anything we should know before your stay?')} />
                  </div>
                </label>

                {error && <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

                <button disabled={busy || rooms.length === 0} className="inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-full bg-[#24342a] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(36,52,42,0.22)] transition hover:bg-[#35463b] disabled:cursor-not-allowed disabled:opacity-60">
                  {busy ? (
                    <>
                      <LoaderCircle size={17} className="animate-spin" /> {t('Sending request…')}
                    </>
                  ) : (
                    <>
                      {t('Request to book')} <ArrowLeft className="rotate-180" size={16} />
                    </>
                  )}
                </button>
                <p className="flex items-center justify-center gap-2 pt-1 text-center text-xs text-stone-500">
                  <Clock3 size={13} className="shrink-0 text-[#756047]" /> {t('Your reservation is pending until confirmed by our team.')}
                </p>
              </form>
            )}
          </div>
        </section>
      </div>

      <AnimatePresence>
        {bookingSuccess && (
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] grid place-items-center overflow-y-auto bg-[#24342a]/65 px-4 py-8 backdrop-blur-md"
            onMouseDown={(event) => { if (event.target === event.currentTarget) setBookingSuccess(null) }}
          >
            <motion.section
              initial={shouldReduceMotion ? false : { opacity: 0, y: 24, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 280, damping: 24 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="booking-success-title"
              aria-describedby="booking-success-description"
              className="relative my-auto w-full max-w-lg overflow-hidden rounded-[2rem] border border-white/70 bg-[#fcfaf6] px-6 pb-6 pt-9 text-center shadow-[0_35px_100px_rgba(0,0,0,0.3)] sm:px-10 sm:pb-9 sm:pt-11"
            >
              <button ref={closeSuccessRef} type="button" onClick={() => setBookingSuccess(null)} aria-label="Close booking confirmation" className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border border-stone-200 bg-white text-stone-500 transition hover:bg-stone-100 hover:text-stone-900"><X size={17} /></button>

              <div className="relative mx-auto grid h-24 w-24 place-items-center">
                {!shouldReduceMotion && <>
                  <motion.span initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1.65, opacity: 0 }} transition={{ duration: 0.9, ease: 'easeOut' }} className="absolute inset-2 rounded-full border border-[#bda06b]/80" />
                  <motion.span initial={{ scale: 0.55, opacity: 0 }} animate={{ scale: 1.3, opacity: 0 }} transition={{ duration: 0.85, delay: 0.12, ease: 'easeOut' }} className="absolute inset-1 rounded-full border border-emerald-300/80" />
                </>}
                <motion.div initial={shouldReduceMotion ? false : { scale: 0, rotate: -18 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 340, damping: 18, delay: 0.08 }} className="relative grid h-[4.25rem] w-[4.25rem] place-items-center rounded-full bg-gradient-to-br from-[#bda06b] to-[#b18a52] text-white shadow-[0_12px_30px_rgba(177,138,82,0.3)]">
                  <motion.span initial={shouldReduceMotion ? false : { scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.3, delay: 0.28 }}><Check size={30} strokeWidth={2.5} /></motion.span>
                </motion.div>
                <motion.span initial={shouldReduceMotion ? false : { scale: 0 }} animate={{ scale: [0, 1.15, 1] }} transition={{ duration: 0.42, delay: 0.35 }} className="absolute right-1 top-2 grid h-7 w-7 place-items-center rounded-full border-2 border-[#fcfaf6] bg-emerald-500 text-white"><Check size={13} strokeWidth={3} /></motion.span>
              </div>

              <motion.p initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} className="mt-5 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#665940]">{t('Request received')} · #{String(bookingSuccess.id).padStart(6, '0')}</motion.p>
              <motion.h2 initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }} id="booking-success-title" className="mt-3 font-serif text-4xl leading-tight tracking-tight text-stone-900 sm:text-5xl">{t('You’re one step')}<br className="hidden sm:block" />{t(' closer to a ')}<span className="italic text-[#756047]">{t('calmer stay.')}</span></motion.h2>
              <p id="booking-success-description" className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-stone-600">{bookingSuccess.message}</p>

              <div className="mt-7 rounded-2xl border border-stone-200 bg-white p-4 text-left sm:p-5">
                <div className="flex items-center gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#f3efe8] text-[#665940]"><CalendarDays size={18} /></span><div className="min-w-0"><p className="truncate text-sm font-medium text-stone-900">{bookingSuccess.roomName}</p><p className="mt-1 text-xs text-stone-500">{bookingSuccess.checkIn} <span className="px-1">→</span> {bookingSuccess.checkOut} <span className="px-1">·</span> {bookingSuccess.guests} {bookingSuccess.guests === 1 ? 'guest' : 'guests'}</p></div></div>
                <div className="mt-4 flex items-start gap-2.5 border-t border-stone-100 pt-4 text-xs leading-relaxed text-stone-500"><Clock3 size={15} className="mt-0.5 shrink-0 text-[#756047]" /><p>{t('Your request is pending. The Silent Villa team will contact you to confirm availability.')}</p></div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button type="button" onClick={() => setBookingSuccess(null)} className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#24342a] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#35463b]">{t('Done')}</button>
                <Link to="/rooms" onClick={() => setBookingSuccess(null)} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-stone-300 px-5 py-3 text-sm font-medium text-stone-700 transition hover:border-stone-500 hover:bg-stone-50">{t('Explore rooms')} <ArrowLeft size={15} className="rotate-180" /></Link>
              </div>
              <p className="mt-5 text-[10px] uppercase tracking-[0.16em] text-stone-400">Silent Villa · Kigali, Rwanda</p>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
