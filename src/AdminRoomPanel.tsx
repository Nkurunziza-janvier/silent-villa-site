import { useEffect, useState, type FormEvent } from 'react'
import { ImagePlus, Pencil, Plus, Trash2, X } from 'lucide-react'
import { api, imageUrl, type Room } from './api'
import { useLanguage } from './i18n'

type AdminRoom = Room & { isActive: boolean }
type RoomForm = { name: string; price: string; description: string; image: File | null; isActive: boolean }

const emptyForm: RoomForm = { name: '', price: '', description: '', image: null, isActive: true }

export default function AdminRoomPanel({
  token,
  rooms,
  onRefresh,
  onNotice,
}: {
  token: string
  rooms: AdminRoom[]
  onRefresh: () => Promise<void>
  onNotice: (message: string) => void
}) {
  const { t } = useLanguage()
  const [editing, setEditing] = useState<AdminRoom | null>(null)
  const [form, setForm] = useState<RoomForm>(emptyForm)
  const [formOpen, setFormOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [imagePreview, setImagePreview] = useState('')

  useEffect(() => {
    if (!form.image) {
      setImagePreview('')
      return
    }

    const previewUrl = URL.createObjectURL(form.image)
    setImagePreview(previewUrl)
    return () => URL.revokeObjectURL(previewUrl)
  }, [form.image])

  const openAdd = () => { setEditing(null); setForm(emptyForm); setFormOpen(true) }
  const openEdit = (room: AdminRoom) => {
    setEditing(room)
    setFormOpen(true)
    setForm({ name: room.name, price: String(room.price), description: room.description || '', image: null, isActive: Boolean(room.isActive) })
  }

  const saveRoom = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!editing && !form.image) {
      onNotice(t('Please choose a room image.'))
      return
    }

    setBusy(true)
    onNotice('')
    const data = new FormData()
    data.append('name', form.name.trim())
    data.append('price', form.price.trim())
    data.append('description', form.description.trim())
    data.append('isActive', String(form.isActive))
    if (form.image) data.append('image', form.image)
    try {
      if (editing) {
        await api.updateRoom(token, editing.id, data)
      } else {
        await api.addRoom(token, data)
      }
      setEditing(null)
      setForm(emptyForm)
      setFormOpen(false)
      await onRefresh()
      onNotice(t(editing ? 'Room updated successfully.' : 'Room added and ready for booking.'))
    } catch (error) {
      onNotice(t((error as Error).message))
    } finally { setBusy(false) }
  }

  const deleteRoom = async (room: AdminRoom) => {
    if (busy || deletingId !== null || !window.confirm(`${t('Delete this room permanently?')}\n${room.name}`)) return
    setDeletingId(room.id)
    try {
      await api.deleteRoom(token, room.id)
      onNotice(t('Room deleted.'))
      await onRefresh()
    } catch (error) { onNotice(t((error as Error).message)) }
    finally { setDeletingId(null) }
  }

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-xs uppercase tracking-[0.22em] text-[#665940]">{t('Property inventory')}</p><h1 className="mt-2 font-serif text-4xl sm:text-5xl">{t('Your rooms')}</h1><p className="mt-2 text-sm text-stone-500">{t('Manage what guests can discover and book.')}</p></div>
        <div className="flex items-center gap-3">
          <span className="rounded-full border border-stone-200 bg-white px-3.5 py-2.5 text-xs text-stone-500">{rooms.length} {t(rooms.length === 1 ? 'room' : 'rooms')}</span>
          <button type="button" onClick={openAdd} disabled={busy || deletingId !== null} className="inline-flex items-center gap-2 rounded-full bg-[#24342a] px-5 py-3 text-sm text-white transition hover:bg-[#35463b] disabled:cursor-not-allowed disabled:opacity-50"><Plus size={16} /> {t('Add a room')}</button>
        </div>
      </div>

      {formOpen && (
        <form onSubmit={saveRoom} onInvalidCapture={(event) => { const field = event.target as HTMLInputElement | HTMLTextAreaElement; onNotice(field.validationMessage || t('Please check the room details.')) }} aria-busy={busy} className="mt-6 grid gap-5 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:grid-cols-2 sm:p-7">
          <div className="sm:col-span-2 flex items-start justify-between gap-4"><div><p className="text-[10px] uppercase tracking-[0.2em] text-[#8a7658]">{t(editing ? 'Room settings' : 'New listing')}</p><h2 className="mt-1 font-serif text-2xl">{t(editing ? 'Edit room details' : 'Add room details')}</h2><p className="mt-1 text-xs text-stone-500">{t('A great photo helps guests picture their stay.')}</p></div><button type="button" disabled={busy} aria-label={t('Close')} onClick={() => { setEditing(null); setForm(emptyForm); setFormOpen(false) }} className="rounded-full p-2 text-stone-500 transition hover:bg-stone-100 disabled:opacity-50"><X size={18} /></button></div>
          <label className="text-sm font-medium text-stone-700">{t('Room name')}<input disabled={busy} required maxLength={120} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder={t('e.g. Garden suite')} className="mt-2 w-full rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-[#756047] disabled:bg-stone-50" /></label>
          <label className="text-sm font-medium text-stone-700">{t('Price per night (RWF)')}<input disabled={busy} type="number" required min="0.01" step="any" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} placeholder="85000" className="mt-2 w-full rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-[#756047] focus:ring-2 focus:ring-[#756047]/10 disabled:bg-stone-50" /></label>
          <label className="text-sm font-medium text-stone-700 sm:col-span-2">{t('Description')} <span className="font-normal text-stone-400">({t('optional')})</span><textarea disabled={busy} maxLength={2000} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder={t('Describe the room and what makes it special…')} className="mt-2 min-h-24 w-full resize-y rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-[#756047] disabled:bg-stone-50" /></label>
          <div className="sm:col-span-2 grid gap-4 sm:grid-cols-[minmax(0,1fr)_180px] sm:items-center">
            <label className="text-sm font-medium text-stone-700">{t('Room image')} <span className="font-normal text-stone-400">({t(editing ? 'Optional · JPG, PNG, WebP up to 5 MB' : 'JPG, PNG, WebP · up to 5 MB')})</span><span className="mt-2 flex items-center gap-2 rounded-xl border border-dashed border-stone-300 bg-[#faf9f6] p-3 text-sm text-stone-500"><ImagePlus size={17} /><input type="file" disabled={busy} required={!editing} accept="image/jpeg,image/png,image/webp" onChange={(event) => setForm({ ...form, image: event.target.files?.[0] || null })} className="block min-w-0 flex-1 text-xs file:mr-3 file:rounded-full file:border-0 file:bg-[#eee8dc] file:px-4 file:py-2 file:text-xs file:font-medium file:text-stone-700" /></span>{editing && <span className="mt-1 block text-xs text-stone-400">{t('Leave empty to keep the current photo.')}</span>}</label>
            {(imagePreview || editing) && <div className="relative h-28 overflow-hidden rounded-xl border border-stone-200 bg-stone-100"><img src={imagePreview || imageUrl(editing!.imageUrl)} alt={t(imagePreview ? 'Selected room photo preview' : 'Current room photo')} className="h-full w-full object-cover" /><span className="absolute bottom-2 left-2 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-medium text-stone-600">{t(imagePreview ? 'New photo' : 'Current photo')}</span></div>}
          </div>
          {editing && <label className="flex items-center gap-3 text-sm text-stone-700 sm:col-span-2"><input type="checkbox" disabled={busy} checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} className="h-4 w-4 accent-[#24342a]" />{t('Show this room to guests')}</label>}
          <div className="flex items-center justify-end gap-3 border-t border-stone-100 pt-4 sm:col-span-2"><button type="button" disabled={busy} onClick={() => { setEditing(null); setForm(emptyForm); setFormOpen(false) }} className="rounded-full px-4 py-2.5 text-sm text-stone-500 transition hover:bg-stone-50 disabled:opacity-50">{t('Cancel')}</button><button type="submit" disabled={busy} className="rounded-full bg-[#24342a] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#35463b] disabled:cursor-wait disabled:opacity-60">{busy ? t('Saving…') : t(editing ? 'Update room' : 'Save room')}</button></div>
        </form>
      )}

      {rooms.length === 0 ? <div className="mt-8 rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center"><p className="font-serif text-2xl">{t('Your room collection starts here.')}</p><p className="mt-2 text-sm text-stone-500">{t('Add your first room to let guests start booking.')}</p></div> : <div className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{rooms.map((room) => <article key={room.id} className="overflow-hidden rounded-2xl border border-stone-200 bg-white"><div className="relative h-52 bg-stone-100"><img src={imageUrl(room.imageUrl)} alt={room.name} className="h-full w-full object-cover" /><span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-stone-700">{t('Room')} #{room.id}</span><span className={`absolute right-3 top-3 rounded-full px-3 py-1.5 text-xs font-medium ${room.isActive ? 'bg-emerald-50 text-emerald-800' : 'bg-stone-100 text-stone-600'}`}>{t(room.isActive ? 'Visible' : 'Hidden')}</span></div><div className="p-5"><div className="flex items-start justify-between gap-3"><h2 className="font-serif text-2xl">{room.name}</h2><p className="shrink-0 text-sm font-medium">RWF {Number(room.price).toLocaleString()}<span className="block text-right text-[10px] font-normal text-stone-400">{t('per night')}</span></p></div><p className="mt-3 line-clamp-2 min-h-10 text-sm leading-relaxed text-stone-500">{room.description || t('A comfortable room for a peaceful stay.')}</p><div className="mt-5 flex gap-2"><button type="button" onClick={() => openEdit(room)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-stone-200 px-4 py-2.5 text-xs font-medium text-stone-700 transition hover:bg-stone-50"><Pencil size={14} /> {t('Edit')}</button><button type="button" onClick={() => void deleteRoom(room)} className="inline-flex items-center justify-center gap-2 rounded-full border border-red-100 px-4 py-2.5 text-xs font-medium text-red-700 transition hover:bg-red-50"><Trash2 size={14} /> {t('Delete')}</button></div></div></article>)}</div>}
    </section>
  )
}
