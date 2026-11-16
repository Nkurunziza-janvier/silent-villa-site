import { useEffect, useState, type FormEvent } from 'react'
import { BedDouble, Check, ImagePlus, Pencil, Plus, Sparkles, Trash2, UploadCloud, X } from 'lucide-react'
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
          className="fixed inset-0 z-[80] flex items-end justify-center overflow-y-auto bg-[#121e17]/75 p-0 backdrop-blur-md sm:items-center sm:p-4"
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
            className="my-0 flex max-h-[94svh] w-full flex-col overflow-hidden rounded-t-[2rem] border border-stone-200/80 bg-[#fcfaf6] shadow-[0_32px_90px_rgba(0,0,0,0.38)] sm:my-auto sm:max-w-2xl sm:rounded-[2rem]"
            onMouseDown={(event) => event.stopPropagation()}
          >
            {/* Dark Luxury Modal Banner Header */}
            <div className="relative flex items-start justify-between gap-4 bg-[#18251d] px-6 py-5 text-white sm:px-8 sm:py-6">
              <div className="flex items-start gap-3.5">
                <span className="mt-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-[#d8c28f]/30 bg-[#bda06b]/15 text-[#d8c28f]">
                  <BedDouble size={20} />
                </span>
                <div>
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#d8c28f]">
                    <Sparkles size={11} /> {t(editing ? 'Room settings' : 'New listing')}
                  </span>
                  <h2 id="room-form-title" className="mt-1 font-serif text-2xl leading-tight text-white sm:text-3xl">
                    {t(editing ? 'Edit room details' : 'Add room details')}
                  </h2>
                  <p className="mt-1 text-xs text-stone-300">{t('A great photo helps guests picture their stay.')}</p>
                </div>
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
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/15 bg-white/10 text-stone-200 transition hover:bg-white/20 hover:text-white disabled:opacity-50"
              >
                <X size={17} />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form
              onSubmit={saveRoom}
              onInvalidCapture={(event) => {
                const field = event.target as HTMLInputElement | HTMLTextAreaElement
                onNotice(field.validationMessage || t('Please check the room details.'))
              }}
              aria-busy={busy}
              className="grid gap-5 overflow-y-auto p-6 sm:grid-cols-2 sm:p-8"
            >
              {/* Room Name */}
              <div className="block">
                <label htmlFor="room-name-input" className="sv-label">
                  <span>{t('Room name')}</span>
                  <span className="text-[11px] font-normal text-stone-400">{form.name.length}/120</span>
                </label>
                <input
                  id="room-name-input"
                  disabled={busy}
                  required
                  maxLength={120}
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  placeholder={t('e.g. Garden suite')}
                  className="sv-input mt-2"
                />
              </div>

              {/* Price per night (RWF) with clean non-overlapping prefix */}
              <div className="block">
                <label htmlFor="room-price-input" className="sv-label">
                  <span>{t('Price per night (RWF)')}</span>
                  <span className="text-[11px] font-normal text-[#756047]">{t('per night')}</span>
                </label>
                <div className="sv-input-group mt-2">
                  <span className="flex h-12 shrink-0 select-none items-center border-r border-[#e8e1d3] bg-[#f6f3ec] px-3.5 text-xs font-bold tracking-wider text-[#665940]">
                    RWF
                  </span>
                  <input
                    id="room-price-input"
                    disabled={busy}
                    type="number"
                    required
                    min="0.01"
                    step="any"
                    value={form.price}
                    onChange={(event) => setForm({ ...form, price: event.target.value })}
                    placeholder="85000"
                    className="h-12 w-full border-0 bg-transparent px-3.5 text-sm font-medium text-stone-900 outline-none placeholder:font-normal placeholder:text-[#9b9387] disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="block sm:col-span-2">
                <label htmlFor="room-desc-input" className="sv-label">
                  <span>{t('Description')}</span>
                  <span className="rounded-full bg-stone-200/70 px-2.5 py-0.5 text-[10px] font-medium text-stone-600">
                    {t('optional')}
                  </span>
                </label>
                <textarea
                  id="room-desc-input"
                  disabled={busy}
                  maxLength={2000}
                  value={form.description}
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                  placeholder={t('Describe the room and what makes it special…')}
                  className="sv-input mt-2 min-h-28 resize-y leading-relaxed"
                />
              </div>

              {/* Room Image Upload Zone */}
              <div className="sm:col-span-2">
                <div className="sv-label">
                  <span>{t('Room image')}</span>
                  <span className="text-[11px] font-normal text-stone-500">
                    {t(editing ? 'Optional · JPG, PNG, WebP up to 5 MB' : 'JPG, PNG, WebP · up to 5 MB')}
                  </span>
                </div>

                <div
                  className={`mt-2 grid gap-4 ${
                    imagePreview || editing ? 'sm:grid-cols-[1fr_190px]' : 'grid-cols-1'
                  }`}
                >
                  <label className="group relative flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#d5c8b0] bg-white p-5 text-center transition hover:border-[#9c8256] hover:bg-[#faf7f0]">
                    <input
                      type="file"
                      disabled={busy}
                      required={!editing}
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(event) => setForm({ ...form, image: event.target.files?.[0] || null })}
                      className="sr-only"
                    />
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#f3eee3] text-[#756047] transition group-hover:scale-105 group-hover:bg-[#24342a] group-hover:text-[#d8c28f]">
                      <UploadCloud size={22} />
                    </span>
                    <span className="mt-3 max-w-xs truncate text-sm font-semibold text-stone-800">
                      {form.image ? form.image.name : t('Please choose a room image.')}
                    </span>
                    <span className="mt-1 text-xs text-stone-500">
                      {form.image
                        ? `${(form.image.size / (1024 * 1024)).toFixed(2)} MB · Click to replace`
                        : t('JPG, PNG, WebP · up to 5 MB')}
                    </span>
                    <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#24342a] px-4 py-1.5 text-xs font-medium text-white shadow-2xs transition group-hover:bg-[#35463b]">
                      <ImagePlus size={13} /> {form.image ? t('New photo') : t('Room image')}
                    </span>
                  </label>

                  {(imagePreview || editing) && (
                    <div className="relative h-40 overflow-hidden rounded-2xl border border-stone-200 bg-stone-100 sm:h-full">
                      <img
                        src={imagePreview || imageUrl(editing!.imageUrl)}
                        alt={t(imagePreview ? 'Selected room photo preview' : 'Current room photo')}
                        className="h-full w-full object-cover"
                      />
                      <span className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1 rounded-full bg-black/75 px-3 py-1 text-[10px] font-medium text-white backdrop-blur-xs">
                        <ImagePlus size={11} /> {t(imagePreview ? 'New photo' : 'Current photo')}
                      </span>
                    </div>
                  )}
                </div>

                {editing && (
                  <span className="mt-2 block text-xs text-stone-400">
                    {t('Leave empty to keep the current photo.')}
                  </span>
                )}
              </div>

              {/* Room Visibility Switch when editing */}
              {editing && (
                <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-2xs sm:col-span-2">
                  <div>
                    <p className="text-sm font-semibold text-stone-800">{t('Show this room to guests')}</p>
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

              {/* Modal Actions Footer */}
              <div className="flex flex-col-reverse gap-2.5 border-t border-stone-200/90 pt-5 sm:col-span-2 sm:flex-row sm:justify-end sm:gap-3">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    setEditing(null)
                    setForm(emptyForm)
                    setFormOpen(false)
                  }}
                  className="min-h-11 rounded-full border border-stone-300 bg-white px-6 py-2.5 text-sm font-semibold text-stone-700 transition hover:bg-stone-100 disabled:opacity-50"
                >
                  {t('Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#24342a] px-7 py-2.5 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(36,52,42,0.22)] transition hover:bg-[#35463b] disabled:cursor-wait disabled:opacity-60"
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
