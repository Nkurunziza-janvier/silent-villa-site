import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, CalendarDays, CheckCircle2, Clock3, LoaderCircle, MapPin, ShieldCheck, Users } from 'lucide-react'
import { api, imageUrl, type Room } from './api'

const today = new Date().toISOString().slice(0, 10)

export default function BookingPage() {
  const [searchParams] = useSearchParams()
  const [rooms, setRooms] = useState<Room[]>([])
  const [loadingRooms, setLoadingRooms] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [busy, setBusy] = useState(false)
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

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const result = await api.book({ ...form, roomId: Number(form.roomId), guests: Number(form.guests) })
      setSuccess(result.message)
      setForm((current) => ({ ...current, name: '', email: '', phone: '', checkIn: '', checkOut: '', guests: '1', specialRequests: '' }))
    } catch (err) { setError((err as Error).message) } finally { setBusy(false) }
  }

  const fieldClass = 'mt-2 w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-[#977956] focus:ring-2 focus:ring-[#977956]/15'

  return (
    <main className="min-h-screen bg-[#f5f1ea]">
      <div className="grid min-h-screen lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="relative hidden overflow-hidden bg-[#171712] text-white lg:block">
          <img src={selectedRoom ? imageUrl(selectedRoom.imageUrl) : '/media/room-1.jpg'} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#171712] via-[#171712]/45 to-[#171712]/20" />
          <div className="relative flex min-h-screen flex-col justify-between p-12 xl:p-16">
            <Link to="/" className="flex items-center gap-3 text-white"><span className="brand-mark grid h-11 w-11 place-items-center rounded-full border border-[#d4b37f]/60 text-sm text-[#f5e7cc]">SV</span><span className="font-serif text-xl">Silent Villa</span></Link>
            <div className="max-w-lg pb-6">
              <span className="text-xs uppercase tracking-[0.3em] text-[#e2c89a]">A quieter kind of stay</span>
              <h1 className="mt-5 font-serif text-6xl leading-[0.95] tracking-tight xl:text-7xl">Your room<br /><span className="italic text-[#e2c89a]">is waiting.</span></h1>
              <p className="mt-6 max-w-md leading-relaxed text-stone-300">Make a booking request for your Kigali visit. Our team will confirm your stay shortly.</p>
              <div className="mt-9 flex flex-wrap gap-5 text-xs text-stone-300"><span className="inline-flex items-center gap-2"><MapPin size={14} className="text-[#d4b37f]" /> Kigali, Rwanda</span><span className="inline-flex items-center gap-2"><ShieldCheck size={14} className="text-[#d4b37f]" /> No payment required</span></div>
            </div>
            <p className="text-xs tracking-wide text-stone-500">SILENT VILLA · WHERE COMFORT MEETS SILENCE</p>
          </div>
        </aside>

        <section className="flex min-h-screen flex-col px-5 py-7 sm:px-10 lg:px-14 xl:px-20">
          <div className="mx-auto w-full max-w-xl">
            <Link to="/rooms" className="inline-flex items-center gap-2 text-sm text-stone-500 transition hover:text-stone-900"><ArrowLeft size={16} /> Back to rooms</Link>
            <div className="mt-10 sm:mt-14">
              <p className="text-xs uppercase tracking-[0.28em] text-[#806342]">Reserve your stay</p>
              <h2 className="mt-3 font-serif text-4xl tracking-tight text-stone-900 sm:text-5xl">Booking request</h2>
              <p className="mt-3 text-sm leading-relaxed text-stone-500">Share a few details and we’ll get back to you to confirm availability.</p>
            </div>

            {loadingRooms ? <div className="mt-10 flex items-center gap-3 text-sm text-stone-500"><LoaderCircle size={18} className="animate-spin" /> Loading available rooms…</div> : rooms.length === 0 ? <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-5 text-sm text-stone-600">There are no rooms available to book yet. Please contact Silent Villa directly.</div> : (
              <form onSubmit={submit} className="mt-8 space-y-5">
                {selectedRoom && <div className="flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-3"><img src={imageUrl(selectedRoom.imageUrl)} alt={selectedRoom.name} className="h-20 w-24 rounded-xl object-cover" /><div className="min-w-0 flex-1"><p className="font-serif text-xl text-stone-900">{selectedRoom.name}</p><p className="mt-1 text-sm text-stone-500">RWF {Number(selectedRoom.price).toLocaleString()} <span className="text-xs">/ night</span></p></div></div>}
                <label className="block text-sm font-medium text-stone-700">Choose a room<select className={fieldClass} value={form.roomId} required onChange={(event) => setForm({ ...form, roomId: event.target.value })}><option value="" disabled>Select a room</option>{rooms.map((room) => <option key={room.id} value={room.id}>{room.name} · RWF {Number(room.price).toLocaleString()} / night</option>)}</select></label>
                <div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-medium text-stone-700">Full name<input className={fieldClass} autoComplete="name" required maxLength={120} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Your name" /></label><label className="block text-sm font-medium text-stone-700">Phone number<input className={fieldClass} autoComplete="tel" required maxLength={40} value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="+250 7xx xxx xxx" /></label></div>
                <label className="block text-sm font-medium text-stone-700">Email address<input className={fieldClass} type="email" autoComplete="email" required maxLength={190} value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="you@example.com" /></label>
                <div className="grid gap-4 sm:grid-cols-3"><label className="block text-sm font-medium text-stone-700"><span className="inline-flex items-center gap-1.5"><CalendarDays size={14} /> Check-in</span><input className={fieldClass} type="date" min={today} required value={form.checkIn} onChange={(event) => setForm({ ...form, checkIn: event.target.value })} /></label><label className="block text-sm font-medium text-stone-700"><span className="inline-flex items-center gap-1.5"><CalendarDays size={14} /> Check-out</span><input className={fieldClass} type="date" min={form.checkIn || today} required value={form.checkOut} onChange={(event) => setForm({ ...form, checkOut: event.target.value })} /></label><label className="block text-sm font-medium text-stone-700"><span className="inline-flex items-center gap-1.5"><Users size={14} /> Guests</span><select className={fieldClass} value={form.guests} onChange={(event) => setForm({ ...form, guests: event.target.value })}>{Array.from({ length: 10 }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1} {index === 0 ? 'guest' : 'guests'}</option>)}</select></label></div>
                <label className="block text-sm font-medium text-stone-700">Special requests <span className="font-normal text-stone-400">(optional)</span><textarea className={`${fieldClass} min-h-24 resize-y`} maxLength={2000} value={form.specialRequests} onChange={(event) => setForm({ ...form, specialRequests: event.target.value })} placeholder="Anything we should know before your stay?" /></label>
                {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
                {success && <div role="status" className="flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"><CheckCircle2 size={18} className="mt-0.5 shrink-0" /><div><p className="font-medium">Request received</p><p className="mt-1">{success}</p></div></div>}
                <button disabled={busy || rooms.length === 0} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#171712] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#38352e] disabled:cursor-not-allowed disabled:opacity-60">{busy ? <><LoaderCircle size={17} className="animate-spin" /> Sending request…</> : <>Request to book <ArrowLeft className="rotate-180" size={16} /></>}</button>
                <p className="flex items-center justify-center gap-2 pb-8 text-xs text-stone-400"><Clock3 size={13} /> Your reservation is pending until confirmed by our team.</p>
              </form>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
