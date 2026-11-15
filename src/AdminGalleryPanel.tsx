import { useState, type FormEvent } from 'react'
import { ImagePlus, Images, LoaderCircle, Trash2 } from 'lucide-react'
import { api, imageUrl, type GalleryImage } from './api'

export default function AdminGalleryPanel({
  token,
  images,
  onRefresh,
  onNotice,
}: {
  token: string
  images: GalleryImage[]
  onRefresh: () => Promise<void>
  onNotice: (message: string) => void
}) {
  const [title, setTitle] = useState('')
  const [altText, setAltText] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!file) return
    setBusy(true)
    const form = new FormData()
    form.append('title', title)
    form.append('altText', altText)
    form.append('image', file)
    try {
      await api.addGalleryImage(token, form)
      setTitle('')
      setAltText('')
      setFile(null)
      await onRefresh()
      onNotice('Gallery image published.')
    } catch (error) {
      onNotice((error as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const remove = async (image: GalleryImage) => {
    if (!window.confirm(`Remove “${image.title}” from the gallery?`)) return
    try {
      await api.deleteGalleryImage(token, image.id)
      await onRefresh()
      onNotice('Gallery image removed.')
    } catch (error) {
      onNotice((error as Error).message)
    }
  }

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[#806342]">Property photography</p>
          <h1 className="mt-2 font-serif text-4xl sm:text-5xl">Gallery</h1>
          <p className="mt-2 text-sm text-stone-500">Images added here appear on the Rooms and Gallery pages.</p>
        </div>
        <span className="rounded-full border border-stone-200 bg-white px-3 py-2 text-xs text-stone-500">{images.length} {images.length === 1 ? 'image' : 'images'}</span>
      </div>

      <form onSubmit={submit} className="mt-7 grid gap-4 rounded-2xl border border-stone-200 bg-white p-5 sm:grid-cols-2 sm:p-7">
        <div className="sm:col-span-2">
          <h2 className="font-serif text-2xl">Add gallery image</h2>
          <p className="mt-1 text-xs text-stone-500">Upload property photos. JPG, PNG, and WebP files up to 5 MB are supported.</p>
        </div>
        <label className="text-sm font-medium text-stone-700">Image title<input required maxLength={160} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. A quiet morning at the villa" className="mt-2 w-full rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-[#977956]" /></label>
        <label className="text-sm font-medium text-stone-700">Alternative text <span className="font-normal text-stone-400">(optional)</span><input maxLength={250} value={altText} onChange={(event) => setAltText(event.target.value)} placeholder="Describe the image for accessibility" className="mt-2 w-full rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-[#977956]" /></label>
        <label className="text-sm font-medium text-stone-700 sm:col-span-2">Photo<input type="file" required accept="image/jpeg,image/png,image/webp" onChange={(event) => setFile(event.target.files?.[0] || null)} className="mt-2 block w-full rounded-xl border border-dashed border-stone-300 bg-[#faf9f6] p-3 text-sm file:mr-4 file:rounded-full file:border-0 file:bg-[#efeae0] file:px-4 file:py-2 file:text-xs file:font-medium file:text-stone-700" /></label>
        <div className="flex justify-end sm:col-span-2"><button disabled={busy || !file} className="inline-flex items-center gap-2 rounded-full bg-[#171712] px-5 py-3 text-sm text-white transition hover:bg-[#38352e] disabled:cursor-not-allowed disabled:opacity-50">{busy ? <><LoaderCircle size={15} className="animate-spin" /> Publishing…</> : <><ImagePlus size={15} /> Add to gallery</>}</button></div>
      </form>

      {images.length === 0 ? <div className="mt-7 rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-14 text-center"><Images className="mx-auto text-stone-300" size={30} /><p className="mt-4 font-serif text-2xl">Your gallery is ready for its first photo.</p><p className="mt-2 text-sm text-stone-500">Uploaded photos will show on the public Rooms and Gallery pages.</p></div> : <div className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{images.map((image) => <article key={image.id} className="overflow-hidden rounded-2xl border border-stone-200 bg-white"><div className="relative h-52 bg-stone-100"><img src={imageUrl(image.imageUrl)} alt={image.altText || image.title} className="h-full w-full object-cover" /></div><div className="flex items-start justify-between gap-3 p-4"><div className="min-w-0"><h3 className="truncate font-serif text-xl">{image.title}</h3>{image.altText && <p className="mt-1 line-clamp-2 text-xs text-stone-500">{image.altText}</p>}</div><button type="button" onClick={() => void remove(image)} aria-label={`Remove ${image.title}`} title="Remove image" className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-stone-200 text-stone-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"><Trash2 size={15} /></button></div></article>)}</div>}
    </section>
  )
}
