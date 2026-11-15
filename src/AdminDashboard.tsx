import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { Bell, BedDouble, CalendarDays, CheckCheck, ChevronDown, Clock3, DoorOpen, Eye, Images, LayoutDashboard, LogOut, Menu, Search, ShieldCheck, Volume2, VolumeX, X } from 'lucide-react'
import { api, imageUrl, type Booking, type GalleryImage, type Room } from './api'
import AdminGalleryPanel from './AdminGalleryPanel'
import AdminRoomPanel from './AdminRoomPanel'
import { LanguageSwitch, useLanguage } from './i18n'

type AdminRoom = Room & { isActive: boolean }
type Tab = 'overview' | 'bookings' | 'rooms' | 'gallery' | 'notifications'
const tokenKey = 'silent-villa-admin-token'

function alertTone() {
  try {
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioContextClass) return
    const context = new AudioContextClass()
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    oscillator.connect(gain)
    gain.connect(context.destination)
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(880, context.currentTime)
    oscillator.frequency.setValueAtTime(1046, context.currentTime + 0.14)
    gain.gain.setValueAtTime(0.0001, context.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.17, context.currentTime + 0.025)
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.42)
    oscillator.start()
    oscillator.stop(context.currentTime + 0.44)
    oscillator.onended = () => void context.close()
  } catch { /* Sound is a convenience; do not block dashboard use. */ }
}

function Login({ onLogin }: { onLogin: (token: string, email: string) => void }) {
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true); setError('')
    try { const result = await api.login(email, password); onLogin(result.token, result.email) } catch (err) { setError((err as Error).message) } finally { setBusy(false) }
  }
  return <main className="grid min-h-[100svh] place-items-center bg-[#f4f0e7] px-4 py-6 sm:px-5 sm:py-12"><div className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-5 shadow-[0_28px_90px_rgba(49,40,28,0.08)] sm:rounded-[2rem] sm:p-10"><div className="flex flex-wrap items-center justify-between gap-3"><img src="/media/silent-villa-logo.jpg" alt="Silent Villa Guest House" className="h-14 w-[9.5rem] rounded-lg object-cover sm:h-[4.5rem] sm:w-[13rem]" /><LanguageSwitch light /></div><p className="mt-7 text-[10px] uppercase tracking-[0.24em] text-[#665940] sm:mt-8 sm:text-xs">{t('Silent Villa · Management')}</p><h1 className="mt-2 font-serif text-3xl text-stone-900 sm:text-4xl">{t('Welcome back.')}</h1><p className="mt-3 text-sm leading-relaxed text-stone-500">{t('Sign in to manage your rooms, reservations, and guest notifications.')}</p><form onSubmit={submit} className="mt-7 space-y-4 sm:mt-8 sm:space-y-5"><label className="block text-sm font-medium text-stone-700">{t('Admin email')}<input className="mt-2 min-h-12 w-full rounded-xl border border-stone-200 px-4 py-3 text-base outline-none focus:border-[#756047] focus:ring-2 focus:ring-[#756047]/15 sm:text-sm" type="email" required autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin@silentvilla.com" /></label><label className="block text-sm font-medium text-stone-700">{t('Password')}<input className="mt-2 min-h-12 w-full rounded-xl border border-stone-200 px-4 py-3 text-base outline-none focus:border-[#756047] focus:ring-2 focus:ring-[#756047]/15 sm:text-sm" type="password" required autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Your password" /></label>{error && <p role="alert" className="break-words rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{t(error)}</p>}<button disabled={busy} className="min-h-12 w-full rounded-full bg-[#24342a] px-5 py-3.5 text-sm font-medium text-white transition hover:bg-[#35463b] disabled:opacity-60">{busy ? t('Signing in…') : t('Sign in to dashboard')}</button></form><p className="mt-6 flex items-center justify-center gap-2 text-xs text-stone-400"><ShieldCheck size={14} /> {t('Secure administrator access')}</p></div></main>
}

export default function AdminDashboard() {
  const { t } = useLanguage()
  const [token, setToken] = useState(() => localStorage.getItem(tokenKey) || '')
  const [email, setEmail] = useState('')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [rooms, setRooms] = useState<AdminRoom[]>([])
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([])
  const [tab, setTab] = useState<Tab>('overview')
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [soundOn, setSoundOn] = useState(() => localStorage.getItem('silent-villa-alert-sound') === 'on')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notice, setNotice] = useState('')
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const knownIds = useRef<Set<number> | null>(null)
  const audioEnabled = useRef(soundOn)

  useEffect(() => { audioEnabled.current = soundOn; localStorage.setItem('silent-villa-alert-sound', soundOn ? 'on' : 'off') }, [soundOn])
  const logout = useCallback(() => { localStorage.removeItem(tokenKey); setToken(''); setBookings([]); setRooms([]); setGalleryImages([]); knownIds.current = null }, [])
  const refresh = useCallback(async (announce = false) => {
    if (!token) return
    try {
      const [newBookings, newRooms, newGallery] = await Promise.all([api.bookings(token), api.adminRooms(token), api.adminGallery(token)])
      if (knownIds.current && announce && newBookings.some((booking) => !knownIds.current?.has(booking.id)) && audioEnabled.current) alertTone()
      knownIds.current = new Set(newBookings.map((booking) => booking.id))
      setBookings(newBookings); setRooms(newRooms); setGalleryImages(newGallery)
    } catch (err) {
      if ((err as Error).message.includes('session') || (err as Error).message.includes('sign in')) logout()
      else setNotice((err as Error).message)
    } finally { setLoading(false) }
  }, [logout, token])

  useEffect(() => {
    if (!token) { setLoading(false); return }
    void refresh()
    const interval = window.setInterval(() => void refresh(true), 12000)
    return () => window.clearInterval(interval)
  }, [refresh, token])

  const onLogin = (newToken: string, adminEmail: string) => { localStorage.setItem(tokenKey, newToken); setEmail(adminEmail); setToken(newToken); setLoading(true) }
  const unread = bookings.filter((booking) => !booking.notificationRead).length
  const pending = bookings.filter((booking) => booking.status === 'pending').length
  const confirmed = bookings.filter((booking) => booking.status === 'confirmed').length
  const displayed = useMemo(() => bookings.filter((booking) => (filter === 'all' || booking.status === filter) && `${booking.name} ${booking.email} ${booking.roomName}`.toLowerCase().includes(search.toLowerCase())), [bookings, filter, search])

  const changeStatus = async (booking: Booking, status: Booking['status']) => {
    try { await api.updateBooking(token, booking.id, status); await refresh(); setNotice(t('Booking status updated.')) } catch (err) { setNotice((err as Error).message) }
  }
  const markNotificationsRead = async () => { const ids = bookings.filter((booking) => !booking.notificationRead).map((booking) => booking.id); if (!ids.length) return; try { await api.markRead(token, ids); await refresh() } catch (err) { setNotice((err as Error).message) } }

  if (!token) return <Login onLogin={onLogin} />

  const nav: { id: Tab; label: string; icon: typeof LayoutDashboard; badge?: number }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard }, { id: 'bookings', label: 'Bookings', icon: CalendarDays, badge: pending }, { id: 'rooms', label: 'Rooms', icon: BedDouble }, { id: 'gallery', label: 'Gallery', icon: Images }, { id: 'notifications', label: 'Notifications', icon: Bell, badge: unread },
  ]
  const statusStyle: Record<Booking['status'], string> = { pending: 'bg-amber-50 text-amber-700 ring-amber-200', confirmed: 'bg-emerald-50 text-emerald-700 ring-emerald-200', cancelled: 'bg-stone-100 text-stone-500 ring-stone-200' }

  const bookingTable = (items: Booking[]) => (
    <>
      <div className="space-y-3 xl:hidden">
        {items.length === 0 ? <div className="rounded-2xl border border-stone-200 bg-white px-5 py-12 text-center"><CalendarDays className="mx-auto text-stone-300" size={25} /><p className="mt-3 text-sm text-stone-500">{t('No bookings to show yet.')}</p></div> : items.map((booking) => (
          <article key={booking.id} className="min-w-0 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex min-w-0 items-start justify-between gap-3">
              <div className="min-w-0"><p className="truncate font-semibold text-stone-900">{booking.name}</p><a href={`mailto:${booking.email}`} className="mt-1 block break-all text-xs text-stone-500 hover:text-[#665940]">{booking.email}</a><a href={`tel:${booking.phone}`} className="mt-1 block text-xs text-stone-400">{booking.phone}</a></div>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] capitalize ring-1 ring-inset ${statusStyle[booking.status]}`}>{t(booking.status)}</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-stone-100 pt-3 text-sm">
              <div className="min-w-0"><p className="text-[10px] uppercase tracking-wider text-stone-400">{t('Room & dates')}</p><p className="mt-1 truncate font-medium text-stone-800">{booking.roomName}</p><p className="mt-0.5 text-xs text-stone-500">{booking.checkIn} → {booking.checkOut}</p></div>
              <div><p className="text-[10px] uppercase tracking-wider text-stone-400">{t('Guests')}</p><p className="mt-1 text-stone-700">{booking.guests}</p></div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 border-t border-stone-100 pt-3">
              <button type="button" onClick={() => setSelectedBooking(booking)} className="min-h-10 flex-1 rounded-full border border-stone-200 px-3 py-2 text-xs text-stone-600 hover:bg-stone-50"><Eye size={14} className="mr-1 inline" />{t('Details')}</button>
              {booking.status === 'pending' ? <><button type="button" onClick={() => void changeStatus(booking, 'confirmed')} className="min-h-10 flex-1 rounded-full bg-[#24342a] px-3 py-2 text-xs text-white hover:bg-[#35463b]">{t('Confirm')}</button><button type="button" onClick={() => void changeStatus(booking, 'cancelled')} className="min-h-10 flex-1 rounded-full border border-stone-200 px-3 py-2 text-xs text-stone-600 hover:border-red-200 hover:text-red-600">{t('Decline')}</button></> : <select aria-label={t('Update booking status')} value={booking.status} onChange={(event) => void changeStatus(booking, event.target.value as Booking['status'])} className="min-h-10 flex-1 rounded-full border border-stone-200 bg-white px-3 py-2 text-xs capitalize text-stone-600"><option value="confirmed">{t('confirmed')}</option><option value="pending">{t('pending')}</option><option value="cancelled">{t('cancelled')}</option></select>}
            </div>
          </article>
        ))}
      </div>
      <div className="hidden overflow-hidden rounded-2xl border border-stone-200 bg-white xl:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead className="bg-[#faf9f6] text-[10px] uppercase tracking-[0.16em] text-stone-400"><tr><th className="px-4 py-4 font-medium 2xl:px-5">{t('Guest')}</th><th className="px-4 py-4 font-medium 2xl:px-5">{t('Room & dates')}</th><th className="px-4 py-4 font-medium 2xl:px-5">{t('Guests')}</th><th className="px-4 py-4 font-medium 2xl:px-5">{t('Status')}</th><th className="px-4 py-4 font-medium 2xl:px-5">{t('Manage')}</th></tr></thead>
            <tbody className="divide-y divide-stone-100">{items.map((booking) => (
              <tr key={booking.id} className="transition hover:bg-[#fcfbf9]">
                <td className="max-w-[220px] px-4 py-4 2xl:px-5"><p className="truncate font-medium text-stone-900">{booking.name}</p><a href={`mailto:${booking.email}`} className="mt-1 block break-all text-xs text-stone-500 hover:text-[#665940]">{booking.email}</a><a href={`tel:${booking.phone}`} className="mt-0.5 block text-xs text-stone-400">{booking.phone}</a></td>
                <td className="px-4 py-4 2xl:px-5"><p className="font-medium text-stone-800">{booking.roomName}</p><p className="mt-1 whitespace-nowrap text-xs text-stone-500">{booking.checkIn} <span className="px-1">→</span> {booking.checkOut}</p></td>
                <td className="px-4 py-4 text-sm text-stone-600 2xl:px-5">{booking.guests}</td>
                <td className="px-4 py-4 2xl:px-5"><span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] capitalize ring-1 ring-inset ${statusStyle[booking.status]}`}>{t(booking.status)}</span></td>
                <td className="px-4 py-4 2xl:px-5"><div className="flex flex-wrap items-center gap-2"><button type="button" onClick={() => setSelectedBooking(booking)} aria-label={t('View details')} className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 px-3 py-2 text-xs text-stone-600 hover:bg-stone-50"><Eye size={14} /> {t('Details')}</button>{booking.status === 'pending' ? <><button type="button" onClick={() => void changeStatus(booking, 'confirmed')} className="rounded-full bg-[#24342a] px-3 py-2 text-xs text-white transition hover:bg-[#35463b]">{t('Confirm')}</button><button type="button" onClick={() => void changeStatus(booking, 'cancelled')} className="rounded-full border border-stone-200 px-3 py-2 text-xs text-stone-500 transition hover:border-red-200 hover:text-red-600">{t('Decline')}</button></> : <select aria-label={t('Update booking status')} value={booking.status} onChange={(event) => void changeStatus(booking, event.target.value as Booking['status'])} className="rounded-lg border border-stone-200 bg-white px-2 py-2 text-xs capitalize text-stone-600"><option value="confirmed">{t('confirmed')}</option><option value="pending">{t('pending')}</option><option value="cancelled">{t('cancelled')}</option></select>}</div></td>
              </tr>
            ))}</tbody>
          </table>
          {items.length === 0 && <div className="px-6 py-14 text-center"><CalendarDays className="mx-auto text-stone-300" size={25} /><p className="mt-3 text-sm text-stone-500">{t('No bookings to show yet.')}</p></div>}
        </div>
      </div>
    </>
  )

  return <div className="min-h-screen bg-[#f7f6f3] text-stone-900">
    {sidebarOpen && <button className="fixed inset-0 z-40 bg-black/35 lg:hidden" aria-label={t('Close menu')} onClick={() => setSidebarOpen(false)} />}
    <aside className={`fixed inset-y-0 left-0 z-50 flex w-[min(270px,calc(100vw-2rem))] flex-col overflow-y-auto bg-[#24342a] px-4 py-5 text-white transition-transform sm:px-5 sm:py-6 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex items-center justify-between px-2"><a href="/" className="flex items-center gap-3"><img src="/media/silent-villa-logo.jpg" alt="Silent Villa Guest House" className="h-12 w-[9.5rem] rounded-md object-cover" /></a><button className="text-stone-400 lg:hidden" onClick={() => setSidebarOpen(false)} aria-label={t('Close sidebar')}><X size={18} /></button></div>
      <p className="mb-3 mt-11 px-3 text-[10px] uppercase tracking-[0.22em] text-stone-500">{t('Workspace')}</p><nav className="space-y-1">{nav.map(({ id, label, icon: Icon, badge }) => <button key={id} onClick={() => { setTab(id); setSidebarOpen(false); if (id === 'notifications') void markNotificationsRead() }} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition ${tab === id ? 'bg-[#bda06b] text-[#24342a]' : 'text-stone-300 hover:bg-white/5 hover:text-white'}`}><Icon size={17} /><span className="flex-1">{t(label)}</span>{Boolean(badge) && <span className={`grid h-5 min-w-5 place-items-center rounded-full px-1 text-[10px] ${tab === id ? 'bg-[#24342a] text-[#d8c28f]' : 'bg-white/10 text-stone-200'}`}>{badge}</span>}</button>)}</nav>
      <div className="mt-auto rounded-2xl border border-white/10 bg-white/[0.04] p-4"><div className="flex items-center gap-2 text-xs font-medium text-[#d8c28f]"><span className="h-2 w-2 rounded-full bg-emerald-400" /> {t('All systems operational')}</div><p className="mt-2 text-[11px] leading-relaxed text-stone-500">{t('Bookings sync automatically with your database.')}</p></div>
      <button onClick={logout} className="mt-4 flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-stone-400 transition hover:bg-white/5 hover:text-white"><LogOut size={17} /> {t('Sign out')}</button>
    </aside>

    <div className="min-w-0 lg:pl-[270px]">
      <header className="sticky top-0 z-30 flex min-h-[68px] flex-wrap items-center justify-between gap-x-2 gap-y-1 border-b border-stone-200/80 bg-[#f7f6f3]/90 px-3 py-2 backdrop-blur-xl sm:min-h-[76px] sm:flex-nowrap sm:px-6 sm:py-0 lg:px-10">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <button className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-stone-600 hover:bg-stone-200/70 lg:hidden" onClick={() => setSidebarOpen(true)} aria-label={t('Open menu')}><Menu size={19} /></button>
          <div className="min-w-0">
            <p className="truncate text-[10px] uppercase tracking-[0.16em] text-stone-400 sm:tracking-[0.2em]"><span className="hidden sm:inline">Silent Villa / </span><span className="text-[#665940]">{t(tab)}</span></p>
            <p className="mt-0.5 max-w-[42vw] truncate text-xs font-medium sm:max-w-none sm:text-sm">{t('Good day')}{email ? `, ${email.split('@')[0]}` : ''}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
          <div className="hidden min-[380px]:block"><LanguageSwitch light /></div>
          <button onClick={() => { const next = !soundOn; setSoundOn(next); if (next) alertTone() }} className={`inline-flex h-10 w-10 items-center justify-center gap-2 rounded-full border p-0 text-xs transition sm:h-auto sm:w-auto sm:px-3 sm:py-2 ${soundOn ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-stone-200 bg-white text-stone-500 hover:border-stone-300'}`} title={t('Sound is only available while the dashboard is open')}><span className={`h-1.5 w-1.5 rounded-full ${soundOn ? 'bg-emerald-500' : 'bg-stone-300'}`} />{soundOn ? <><Volume2 size={14} /><span className="hidden sm:inline">{t('Sound on')}</span></> : <><VolumeX size={14} /><span className="hidden sm:inline">{t('Enable sound')}</span></>}</button>
          <button onClick={() => { setTab('notifications'); void markNotificationsRead() }} className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full border border-stone-200 bg-white text-stone-600 hover:text-stone-900" aria-label={t('Unread notifications')}><Bell size={17} />{unread > 0 && <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full border-2 border-[#f7f6f3] bg-[#b67a3d]" />}</button>
          <span className="hidden h-9 w-9 place-items-center rounded-full bg-[#e8dfd0] font-serif text-sm text-[#725738] sm:grid">{email ? email[0].toUpperCase() : 'A'}</span>
        </div>
      </header>

    <main className="mx-auto min-w-0 max-w-[1500px] px-3 py-5 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
      {notice && <div role="status" className="mb-5 flex min-w-0 items-start justify-between gap-3 rounded-xl border border-[#e6dcc8] bg-[#fbf8f1] px-3 py-3 text-sm text-[#725738] sm:px-4"><span className="min-w-0 break-words">{notice}</span><button className="shrink-0 rounded p-1" onClick={() => setNotice('')} aria-label={t('Dismiss message')}><X size={15} /></button></div>}
      {tab === 'overview' && <><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.22em] text-[#665940]">{t('Your property at a glance')}</p><h1 className="mt-2 font-serif text-4xl tracking-tight sm:text-5xl">{t('Overview')}</h1><p className="mt-2 text-sm text-stone-500">{t('Here’s what’s happening at Silent Villa today.')}</p></div><button onClick={() => setTab('bookings')} className="inline-flex items-center gap-2 rounded-full bg-[#24342a] px-5 py-3 text-sm text-white transition hover:bg-[#35463b]">{t('View bookings')} <CalendarDays size={15} /></button></div>
        <div className="mt-6 grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 sm:mt-8 sm:gap-4 xl:grid-cols-4">{[{ label: 'Total bookings', value: bookings.length, icon: CalendarDays, note: 'All time' }, { label: 'Needs attention', value: pending, icon: Clock3, note: 'Awaiting your response' }, { label: 'Confirmed stays', value: confirmed, icon: CheckCheck, note: 'Ready to welcome' }, { label: 'Rooms listed', value: rooms.length, icon: DoorOpen, note: 'Available to guests' }].map(({ label, value, icon: Icon, note }, index) => <div key={label} className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6"><div className="flex items-center justify-between"><p className="text-sm text-stone-500">{t(label)}</p><span className={`grid h-10 w-10 place-items-center rounded-xl ${index === 1 && value ? 'bg-amber-50 text-amber-700' : 'bg-[#f3efe8] text-[#665940]'}`}><Icon size={18} /></span></div><p className="mt-5 font-serif text-4xl">{value}</p><p className="mt-1 text-xs text-stone-400">{t(note)}</p></div>)}</div>
        <div className="mt-8 grid gap-5 xl:grid-cols-[1.55fr_0.8fr]"><section><div className="mb-4 flex items-center justify-between"><div><h2 className="font-serif text-2xl">{t('Recent bookings')}</h2><p className="mt-1 text-xs text-stone-500">{t('Latest activity from your guests')}</p></div><button onClick={() => setTab('bookings')} className="text-xs font-medium text-[#665940] hover:text-stone-900">{t('See all →')}</button></div>{loading ? <div className="rounded-2xl border border-stone-200 bg-white p-10 text-center text-sm text-stone-400">{t('Loading bookings…')}</div> : bookingTable(bookings.slice(0, 5))}</section><aside className="rounded-2xl bg-[#24342a] p-6 text-white sm:p-7"><div className="flex items-center justify-between"><span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-[#d8c28f]"><Bell size={18} /></span>{unread > 0 && <span className="rounded-full bg-[#bda06b] px-2.5 py-1 text-[10px] font-medium text-[#24342a]">{unread} {t('new')}</span>}</div><h2 className="mt-6 font-serif text-3xl">{t('Stay in the loop.')}</h2><p className="mt-2 text-sm leading-relaxed text-stone-400">{t('Get a sound alert as soon as a new booking request arrives. Keep this dashboard open and enable sound.')}</p><button onClick={() => setSoundOn(true)} className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#bda06b] px-4 py-2.5 text-xs font-medium text-[#24342a] transition hover:bg-[#dfcc9f]"><Volume2 size={15} /> {soundOn ? t('Sound alerts enabled') : t('Enable sound alerts')}</button><div className="mt-6 border-t border-white/10 pt-5"><p className="text-[10px] uppercase tracking-[0.2em] text-stone-500">{t('Notification status')}</p><p className="mt-2 text-sm">{unread ? `${unread} ${t('Bookings need your attention')}` : t('You’re all caught up.')}</p></div></aside></div>
      </>}

      {tab === 'bookings' && <><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.22em] text-[#665940]">{t('Guest management')}</p><h1 className="mt-2 font-serif text-4xl sm:text-5xl">{t('Bookings')}</h1><p className="mt-2 text-sm text-stone-500">{t('Review guest details and manage reservation requests.')}</p></div><span className="rounded-full border border-stone-200 bg-white px-3 py-2 text-xs text-stone-500">{bookings.length} {t('total')}</span></div><div className="my-5 flex flex-col gap-3 sm:my-6 sm:flex-row sm:items-center"><div className="relative w-full sm:min-w-[220px] sm:flex-1 sm:max-w-sm"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t('Search guest or room')} className="w-full rounded-full border border-stone-200 bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:border-[#756047]" /></div><div className="flex w-full flex-wrap gap-1 rounded-2xl border border-stone-200 bg-white p-1 sm:w-auto sm:rounded-full">{['all', 'pending', 'confirmed', 'cancelled'].map((value) => <button key={value} onClick={() => setFilter(value)} className={`rounded-full px-3 py-2 text-xs capitalize transition ${filter === value ? 'bg-[#24342a] text-white' : 'text-stone-500 hover:bg-stone-100'}`}>{t(value)}</button>)}</div></div>{bookingTable(displayed)}</>}

      {tab === 'rooms' && <AdminRoomPanel token={token} rooms={rooms} onRefresh={refresh} onNotice={setNotice} onRoomUpdated={(updatedRoom) => setRooms((current) => current.map((room) => room.id === updatedRoom.id ? updatedRoom : room))} />}
      {tab === 'gallery' && <AdminGalleryPanel token={token} images={galleryImages} onRefresh={refresh} onNotice={setNotice} />}

      {tab === 'notifications' && <><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.22em] text-[#665940]">{t('Activity center')}</p><h1 className="mt-2 font-serif text-4xl sm:text-5xl">{t('Notifications')}</h1><p className="mt-2 text-sm text-stone-500">{t('New booking requests appear here automatically.')}</p></div>{unread > 0 && <button onClick={() => void markNotificationsRead()} className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2.5 text-xs text-stone-600 hover:bg-stone-50"><CheckCheck size={15} /> {t('Mark all read')}</button>}</div><div className="mt-7 space-y-3">{bookings.length === 0 ? <div className="rounded-2xl border border-stone-200 bg-white p-14 text-center"><Bell className="mx-auto text-stone-300" size={28} /><p className="mt-4 font-serif text-2xl">{t('Nothing new just yet.')}</p><p className="mt-2 text-sm text-stone-500">{t('We’ll let you know when a guest makes a booking.')}</p></div> : bookings.map((booking) => <button key={booking.id} onClick={() => setTab('bookings')} className={`flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition hover:border-stone-300 sm:p-5 ${booking.notificationRead ? 'border-stone-200 bg-white' : 'border-[#e8d9bb] bg-[#fcfaf5]'}`}><span className={`mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-xl ${booking.notificationRead ? 'bg-stone-100 text-stone-500' : 'bg-[#efe4d1] text-[#665940]'}`}><CalendarDays size={17} /></span><span className="min-w-0 flex-1"><span className="flex flex-wrap items-center gap-2"><span className="font-medium text-stone-900">{t('New booking request from')} {booking.name}</span>{!booking.notificationRead && <span className="rounded-full bg-[#bda06b]/30 px-2 py-0.5 text-[10px] font-medium text-[#665940]">{t('New')}</span>}</span><span className="mt-1 block text-sm text-stone-500">{booking.roomName} · {booking.checkIn} {t('to')} {booking.checkOut} · {booking.guests} {t(booking.guests === 1 ? 'guest' : 'guests')}</span><span className="mt-2 block text-xs text-stone-400">{new Date(booking.createdAt).toLocaleString()}</span></span><ChevronDown className="mt-3 -rotate-90 shrink-0 text-stone-400" size={16} /></button>)}</div></>}
    </main>
    {selectedBooking && <div role="dialog" aria-modal="true" aria-labelledby="booking-detail-title" className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-[#17241c]/70 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedBooking(null) }}><section className="my-auto w-full max-w-2xl overflow-hidden rounded-3xl bg-[#fcfaf6] shadow-2xl"><div className="flex items-start justify-between gap-4 border-b border-stone-200 px-6 py-5 sm:px-8"><div><p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#665940]">{t('Booking details')} · #{selectedBooking.id}</p><h2 id="booking-detail-title" className="mt-2 font-serif text-3xl text-stone-900">{selectedBooking.name}</h2></div><button type="button" onClick={() => setSelectedBooking(null)} aria-label={t('Close')} className="rounded-full border border-stone-200 bg-white p-2 text-stone-500 hover:bg-stone-100"><X size={17} /></button></div><div className="grid gap-6 p-6 sm:grid-cols-[150px_1fr] sm:p-8"><img src={imageUrl(selectedBooking.roomImage)} alt={selectedBooking.roomName} className="h-36 w-full rounded-2xl object-cover sm:h-36" /><div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">{[[t('Email address'), selectedBooking.email], [t('Phone number'), selectedBooking.phone], [t('Room'), selectedBooking.roomName], [t('Status'), t(selectedBooking.status)], [t('Check-in'), selectedBooking.checkIn], [t('Check-out'), selectedBooking.checkOut], [t('Guests'), String(selectedBooking.guests)], [t('Room rate'), `RWF ${Number(selectedBooking.roomPrice).toLocaleString()} / ${t('per night')}`]].map(([label, value]) => <div key={label}><p className="text-[10px] uppercase tracking-[0.16em] text-stone-400">{label}</p><p className="mt-1 break-words text-sm font-medium text-stone-800">{value}</p></div>)}<div className="sm:col-span-2"><p className="text-[10px] uppercase tracking-[0.16em] text-stone-400">{t('Special requests')}</p><p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-stone-700">{selectedBooking.specialRequests || t('No special requests provided.')}</p></div><div className="sm:col-span-2"><p className="text-[10px] uppercase tracking-[0.16em] text-stone-400">{t('Request received')}</p><p className="mt-1 text-sm text-stone-700">{new Date(selectedBooking.createdAt).toLocaleString()}</p></div></div></div><div className="flex justify-end border-t border-stone-200 px-6 py-4 sm:px-8"><button type="button" onClick={() => setSelectedBooking(null)} className="rounded-full bg-[#24342a] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#35463b]">{t('Close')}</button></div></section></div>}
    <footer className="border-t border-stone-200 px-5 py-5 text-center text-[11px] text-stone-400 sm:px-8 lg:px-10">{t('Silent Villa admin · Booking updates refresh automatically every 12 seconds')}</footer></div>
  </div>
}
