import { useEffect, useState, type FormEvent } from 'react'
import { BedDouble, Check, FileText, ImagePlus, Pencil, Plus, Trash2, UploadCloud, X } from 'lucide-react'
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
  onRoomUpdated,
}: {
  token: string
  rooms: AdminRoom[]
  onRefresh: () => Promise<void>
  onNotice: (message: string) => void
  onRoomUpdated: (room: AdminRoom) => void
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

  useEffect(() => {
    if (!formOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !busy) {
        setEditing(null)
        setForm(emptyForm)
        setFormOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [formOpen, busy])

  const openAdd = () => {
    setEditing(null)
    setForm(emptyForm)
    setFormOpen(true)
  }

  const openEdit = (room: AdminRoom) => {
    setEditing(room)
    setFormOpen(true)
    setForm({
      name: room.name,
      price: String(room.price),
      description: room.description || '',
      image: null,
      isActive: Boolean(room.isActive),
    })
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
        const updatedRoom = await api.updateRoom(token, editing.id, data)
        onRoomUpdated(updatedRoom)
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
    } finally {
      setBusy(false)
    }
  }

  const deleteRoom = async (room: AdminRoom) => {
    if (busy || deletingId !== null || !window.confirm(`${t('Delete this room permanently?')}\n${room.name}`)) return
    setDeletingId(room.id)
    try {
      await api.deleteRoom(token, room.id)
      onNotice(t('Room deleted.'))
      await onRefresh()
    } catch (error) {
      onNotice(t((error as Error).message))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <section>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#665940]">{t('Property inventory')}</p>
          <h1 className="mt-2 font-serif text-4xl sm:text-5xl">{t('Your rooms')}</h1>
          <p className="mt-2 text-sm text-stone-500">{t('Manage what guests can discover and book.')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full border border-stone-200 bg-white px-4 py-2.5 text-xs font-medium text-stone-600 shadow-2xs">
            {rooms.length} {t(rooms.length === 1 ? 'room' : 'rooms')}
          </span>
          <button
            type="button"
            onClick={openAdd}
            disabled={busy || deletingId !== null}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#24342a] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#35463b] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={16} /> {t('Add a room')}
          </button>
        </div>
      </div>

      {formOpen && (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center overflow-y-auto bg-[#17241c]/70 p-0 backdrop-blur-md sm:items-center sm:p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !busy) {
              setEditing(null)
              setForm(emptyForm)
              setFormOpen(false)
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="room-form-title"
            className="my-0 max-h-[94svh] w-full overflow-y-auto rounded-t-3xl border border-stone-200/80 bg-[#fcfaf6] shadow-2xl sm:my-auto sm:max-w-2xl sm:rounded-3xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <form
              onSubmit={saveRoom}
              onInvalidCapture={(event) => {
                const field = event.target as HTMLInputElement | HTMLTextAreaElement
                onNotice(field.validationMessage || t('Please check the room details.'))
              }}
              aria-busy={busy}
              className="grid gap-5 p-5 sm:grid-cols-2 sm:p-8"
            >
              <div className="sticky top-0 z-10 -mx-5 -mt-5 flex items-start justify-between gap-4 border-b border-stone-200 bg-[#fcfaf6]/95 px-5 py-4 backdrop-blur sm:col-span-2 sm:-mx-8 sm:-mt-8 sm:px-8 sm:py-5">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8a7658]">
                    {t(editing ? 'Room settings' : 'New listing')}
                  </p>
                  <h2 id="room-form-title" className="mt-1 font-serif text-2xl text-stone-900 sm:text-3xl">
                    {t(editing ? 'Edit room details' : 'Add room details')}
                  </h2>
                  <p className="mt-1 text-xs text-stone-500">{t('A great photo helps guests picture their stay.')}</p>
                </div>
                <button
                  type="button"
                  autoFocus
                  disabled={busy}
                  aria-label={t('Close')}
                  onClick={() => {
                    setEditing(null)
                    setForm(emptyForm)
                    setFormOpen(false)
                  }}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-stone-200 bg-white text-stone-500 transition hover:bg-stone-100 hover:text-stone-900 disabled:opacity-50"
                >
                  <X size={18} />
                </button>
              </div>

              <label className="block">
                <span className="sv-label">{t('Room name')}</span>
                <div className="relative">
                  <BedDouble size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#756047]" />
                  <input
                    disabled={busy}
                    required
                    maxLength={120}
                    value={form.name}
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                    placeholder={t('e.g. Garden suite')}
                    className="sv-input mt-2 pl-10"
                  />
                </div>
              </label>

              <label className="block">
                <span className="sv-label">{t('Price per night (RWF)')}</span>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold tracking-wider text-[#756047]">
                    RWF
                  </span>
                  <input
                    disabled={busy}
                    type="number"
                    required
                    min="0.01"
                    step="any"
                    value={form.price}
                    onChange={(event) => setForm({ ...form, price: event.target.value })}
                    placeholder="85000"
                    className="sv-input mt-2 pl-13"
                  />
                </div>
              </label>

              <label className="block sm:col-span-2">
                <span className="sv-label">
                  {t('Description')} <span className="font-normal lowercase text-stone-400">({t('optional')})</span>
                </span>
                <div className="relative">
                  <FileText size={16} className="pointer-events-none absolute left-3.5 top-4 text-[#756047]" />
                  <textarea
                    disabled={busy}
                    maxLength={2000}
                    value={form.description}
                    onChange={(event) => setForm({ ...form, description: event.target.value })}
                    placeholder={t('Describe the room and what makes it special…')}
                    className="sv-input mt-2 min-h-28 resize-y pl-10 pt-3"
                  />
                </div>
              </label>

              <div className="grid gap-4 sm:col-span-2 sm:grid-cols-[minmax(0,1fr)_190px] sm:items-stretch">
                <div>
                  <span className="sv-label">
                    {t('Room image')}{' '}
                    <span className="font-normal lowercase text-stone-400">
                      ({t(editing ? 'Optional · JPG, PNG, WebP up to 5 MB' : 'JPG, PNG, WebP · up to 5 MB')})
                    </span>
                  </span>
                  <label className="mt-2 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#d8ccb8] bg-white p-5 text-center transition hover:border-[#9c8256] hover:bg-[#faf8f3]">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#f4f0e7] text-[#756047]">
                      <UploadCloud size={20} />
                    </span>
                    <span className="text-xs font-medium text-stone-700">
                      {form.image ? form.image.name : t('Please choose a room image.')}
                    </span>
                    <input
                      type="file"
                      disabled={busy}
                      required={!editing}
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(event) => setForm({ ...form, image: event.target.files?.[0] || null })}
                      className="mt-1 block w-full max-w-xs text-xs text-stone-500 file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-[#24342a] file:px-4 file:py-2 file:text-xs file:font-medium file:text-white hover:file:bg-[#35463b]"
                    />
                  </label>
                  {editing && (
                    <span className="mt-1.5 block text-xs text-stone-400">
                      {t('Leave empty to keep the current photo.')}
                    </span>
                  )}
                </div>

                {(imagePreview || editing) && (
                  <div className="relative h-36 overflow-hidden rounded-2xl border border-stone-200 bg-stone-100 sm:h-auto">
                    <img
                      src={imagePreview || imageUrl(editing!.imageUrl)}
                      alt={t(imagePreview ? 'Selected room photo preview' : 'Current room photo')}
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur-xs">
                      <ImagePlus size={11} /> {t(imagePreview ? 'New photo' : 'Current photo')}
                    </span>
                  </div>
                )}
              </div>

              {editing && (
                <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-stone-200 bg-white p-4 sm:col-span-2">
                  <div>
                    <p className="text-sm font-medium text-stone-800">{t('Show this room to guests')}</p>
                    <p className="text-xs text-stone-500">{t(form.isActive ? 'Visible' : 'Hidden')}</p>
                  </div>
                  <span className="relative inline-flex items-center">
                    <input
                      type="checkbox"
                      disabled={busy}
                      checked={form.isActive}
                      onChange={(event) => setForm({ ...form, isActive: event.target.checked })}
                      className="peer sr-only"
                    />
                    <span className="flex h-7 w-12 items-center rounded-full bg-stone-300 p-1 transition peer-checked:bg-[#24342a]">
                      <span className="h-5 w-5 rounded-full bg-white shadow-xs transition peer-checked:translate-x-5" />
                    </span>
                  </span>
                </label>
              )}

              <div className="flex flex-col-reverse gap-2.5 border-t border-stone-200 pt-5 sm:col-span-2 sm:flex-row sm:justify-end sm:gap-3">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    setEditing(null)
                    setForm(emptyForm)
                    setFormOpen(false)
                  }}
                  className="min-h-11 rounded-full border border-stone-200 bg-white px-5 py-2.5 text-sm font-medium text-stone-600 transition hover:bg-stone-100 disabled:opacity-50"
                >
                  {t('Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#24342a] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#35463b] disabled:cursor-wait disabled:opacity-60"
                >
                  <Check size={16} /> {busy ? t('Saving…') : t(editing ? 'Update room' : 'Save room')}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {rooms.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center">
          <p className="font-serif text-2xl">{t('Your room collection starts here.')}</p>
          <p className="mt-2 text-sm text-stone-500">{t('Add your first room to let guests start booking.')}</p>
        </div>
      ) : (
        <div className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {rooms.map((room) => (
            <article
              key={room.id}
              className="flex flex-col justify-between overflow-hidden rounded-3xl border border-stone-200/90 bg-white shadow-xs transition hover:shadow-md"
            >
              <div>
                <div className="relative h-52 bg-stone-100">
                  <img src={imageUrl(room.imageUrl)} alt={room.name} className="h-full w-full object-cover" />
                  <span className="absolute bottom-3 left-3 rounded-full bg-black/65 px-3 py-1 text-xs font-medium text-white backdrop-blur-xs">
                    {t('Room')} #{room.id}
                  </span>
                  <span
                    className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-semibold ${
                      room.isActive
                        ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200'
                        : 'bg-stone-100 text-stone-600 ring-1 ring-stone-200'
                    }`}
                  >
                    {t(room.isActive ? 'Visible' : 'Hidden')}
                  </span>
                </div>
                <div className="p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="font-serif text-2xl text-stone-900">{room.name}</h2>
                    <p className="shrink-0 text-sm font-semibold text-[#665940]">
                      RWF {Number(room.price).toLocaleString()}
                      <span className="block text-right text-[10px] font-normal text-stone-400">{t('per night')}</span>
                    </p>
                  </div>
                  <p className="mt-3 line-clamp-2 min-h-10 text-sm leading-relaxed text-stone-500">
                    {room.description || t('A comfortable room for a peaceful stay.')}
                  </p>
                </div>
              </div>
              <div className="flex gap-2.5 border-t border-stone-100 px-5 pb-5 pt-4 sm:px-6">
                <button
                  type="button"
                  onClick={() => openEdit(room)}
                  className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-full border border-stone-200 bg-stone-50/70 px-4 py-2 text-xs font-semibold text-stone-700 transition hover:border-stone-300 hover:bg-stone-100"
                >
                  <Pencil size={14} /> {t('Edit')}
                </button>
                <button
                  type="button"
                  onClick={() => void deleteRoom(room)}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-red-100 bg-red-50/40 px-4 py-2 text-xs font-semibold text-red-700 transition hover:border-red-200 hover:bg-red-50"
                >
                  <Trash2 size={14} /> {t('Delete')}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
