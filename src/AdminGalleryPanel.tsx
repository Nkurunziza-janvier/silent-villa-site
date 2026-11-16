import { useEffect, useState, type FormEvent } from 'react'
import { ImagePlus, Images, LoaderCircle, Sparkles, Trash2, UploadCloud } from 'lucide-react'
import { api, imageUrl, type GalleryImage } from './api'
import { useLanguage } from './i18n'

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
  const { t } = useLanguage()
  const [title, setTitle] = useState('')
  const [altText, setAltText] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!file) {
      setPreview('')
      return
    }
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

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
      onNotice(t('Gallery image published.'))
    } catch (error) {
      onNotice(t((error as Error).message))
    } finally {
      setBusy(false)
    }
  }

  const remove = async (image: GalleryImage) => {
    if (!window.confirm(`${t('Remove this image from the gallery?')}\n${image.title}`)) return
    try {
      await api.deleteGalleryImage(token, image.id)
      await onRefresh()
      onNotice(t('Gallery image removed.'))
    } catch (error) {
      onNotice(t((error as Error).message))
    }
  }

  return (
    <section>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#665940]">{t('Property photography')}</p>
          <h1 className="mt-2 font-serif text-4xl sm:text-5xl">{t('Gallery')}</h1>
          <p className="mt-2 text-sm text-stone-500">{t('Images added here appear on the Rooms and Gallery pages.')}</p>
        </div>
        <span className="self-start rounded-full border border-stone-200 bg-white px-4 py-2.5 text-xs font-medium text-stone-600 shadow-2xs sm:self-auto">
          {images.length} {images.length === 1 ? 'image' : 'images'}
        </span>
      </div>

      <form
        onSubmit={submit}
        className="mt-7 overflow-hidden rounded-3xl border border-stone-200/90 bg-[#fcfaf6] shadow-xs"
      >
        <div className="flex items-center gap-3.5 bg-[#18251d] px-6 py-4 text-white sm:px-8 sm:py-5">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-[#d8c28f]/30 bg-[#bda06b]/15 text-[#d8c28f]">
            <ImagePlus size={18} />
          </span>
          <div>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#d8c28f]">
              <Sparkles size={10} /> {t('Property photography')}
            </span>
            <h2 className="font-serif text-2xl text-white">{t('Add gallery image')}</h2>
          </div>
        </div>

        <div className="grid gap-5 p-6 sm:grid-cols-2 sm:p-8">
          <div className="block">
            <label htmlFor="gallery-title-input" className="sv-label">
              <span>{t('Image title')}</span>
              <span className="text-[11px] font-normal text-stone-400">{title.length}/160</span>
            </label>
            <input
              id="gallery-title-input"
              required
              maxLength={160}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder={t('e.g. A quiet morning at the villa')}
              className="sv-input mt-2"
            />
          </div>

          <div className="block">
            <label htmlFor="gallery-alt-input" className="sv-label">
              <span>{t('Alternative text')}</span>
              <span className="rounded-full bg-stone-200/70 px-2.5 py-0.5 text-[10px] font-medium text-stone-600">
                {t('optional')}
              </span>
            </label>
            <input
              id="gallery-alt-input"
              maxLength={250}
              value={altText}
              onChange={(event) => setAltText(event.target.value)}
              placeholder={t('Describe the image for accessibility')}
              className="sv-input mt-2"
            />
          </div>

          <div className="sm:col-span-2">
            <div className="sv-label">
              <span>{t('Photo')}</span>
              <span className="text-[11px] font-normal text-stone-500">{t('JPG, PNG, WebP · up to 5 MB')}</span>
            </div>

            <div className={`mt-2 grid gap-4 ${preview ? 'sm:grid-cols-[1fr_190px]' : 'grid-cols-1'}`}>
              <label className="group relative flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#d5c8b0] bg-white p-5 text-center transition hover:border-[#9c8256] hover:bg-[#faf7f0]">
                <input
                  type="file"
                  required
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) => setFile(event.target.files?.[0] || null)}
                  className="sr-only"
                />
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#f3eee3] text-[#756047] transition group-hover:scale-105 group-hover:bg-[#24342a] group-hover:text-[#d8c28f]">
                  <UploadCloud size={22} />
                </span>
                <span className="mt-3 max-w-xs truncate text-sm font-semibold text-stone-800">
                  {file ? file.name : t('Upload property photos. JPG, PNG, and WebP files up to 5 MB are supported.')}
                </span>
                <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#24342a] px-4 py-1.5 text-xs font-medium text-white shadow-2xs transition group-hover:bg-[#35463b]">
                  <ImagePlus size={13} /> {file ? t('New photo') : t('Photo')}
                </span>
              </label>

              {preview && (
                <div className="relative h-40 overflow-hidden rounded-2xl border border-stone-200 bg-stone-100 sm:h-full">
                  <img src={preview} alt="Preview" className="h-full w-full object-cover" />
                  <span className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1 rounded-full bg-black/75 px-3 py-1 text-[10px] font-medium text-white">
                    <ImagePlus size={11} /> {t('New photo')}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end border-t border-stone-200/80 pt-4 sm:col-span-2">
            <button
              disabled={busy || !file}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[#24342a] px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#35463b] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {busy ? (
                <>
                  <LoaderCircle size={16} className="animate-spin" /> {t('Publishing…')}
                </>
              ) : (
                <>
                  <ImagePlus size={16} /> {t('Add to gallery')}
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {images.length === 0 ? (
        <div className="mt-7 rounded-3xl border border-dashed border-stone-300 bg-white px-6 py-14 text-center">
          <Images className="mx-auto text-stone-300" size={30} />
          <p className="mt-4 font-serif text-2xl">{t('Your gallery is ready for its first photo.')}</p>
          <p className="mt-2 text-sm text-stone-500">
            {t('Uploaded photos will show on the public Rooms and Gallery pages.')}
          </p>
        </div>
      ) : (
        <div className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {images.map((image) => (
            <article
              key={image.id}
              className="overflow-hidden rounded-3xl border border-stone-200/90 bg-white shadow-xs transition hover:shadow-md"
            >
              <div className="relative h-52 bg-stone-100">
                <img src={imageUrl(image.imageUrl)} alt={image.altText || image.title} className="h-full w-full object-cover" />
              </div>
              <div className="flex items-start justify-between gap-3 p-5">
                <div className="min-w-0">
                  <h3 className="truncate font-serif text-xl text-stone-900">{image.title}</h3>
                  {image.altText && <p className="mt-1 line-clamp-2 text-xs text-stone-500">{image.altText}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => void remove(image)}
                  aria-label={t('Remove image')}
                  title={t('Remove image')}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-stone-200 text-stone-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
