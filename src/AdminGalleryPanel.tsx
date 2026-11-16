import { useEffect, useState, type FormEvent } from 'react'
import { FileText, ImagePlus, Images, LoaderCircle, Sparkles, Trash2, UploadCloud } from 'lucide-react'
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
        className="mt-7 grid gap-5 rounded-3xl border border-stone-200/90 bg-white p-5 shadow-xs sm:grid-cols-2 sm:p-8"
      >
        <div className="sm:col-span-2">
          <h2 className="font-serif text-2xl text-stone-900 sm:text-3xl">{t('Add gallery image')}</h2>
          <p className="mt-1 text-xs text-stone-500">
            {t('Upload property photos. JPG, PNG, and WebP files up to 5 MB are supported.')}
          </p>
        </div>

        <label className="block">
          <span className="sv-label">{t('Image title')}</span>
          <div className="relative">
            <Sparkles size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#756047]" />
            <input
              required
              maxLength={160}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder={t('e.g. A quiet morning at the villa')}
              className="sv-input mt-2 pl-10"
            />
          </div>
        </label>

        <label className="block">
          <span className="sv-label">
            {t('Alternative text')} <span className="font-normal lowercase text-stone-400">({t('optional')})</span>
          </span>
          <div className="relative">
            <FileText size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#756047]" />
            <input
              maxLength={250}
              value={altText}
              onChange={(event) => setAltText(event.target.value)}
              placeholder={t('Describe the image for accessibility')}
              className="sv-input mt-2 pl-10"
            />
          </div>
        </label>

        <div className="grid gap-4 sm:col-span-2 sm:grid-cols-[minmax(0,1fr)_180px] sm:items-stretch">
          <div>
            <span className="sv-label">{t('Photo')}</span>
            <label className="mt-2 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#d8ccb8] bg-[#faf8f4] p-5 text-center transition hover:border-[#9c8256] hover:bg-white">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#efe9dc] text-[#756047]">
                <UploadCloud size={20} />
              </span>
              <span className="text-xs font-medium text-stone-700">
                {file ? file.name : t('Upload property photos. JPG, PNG, and WebP files up to 5 MB are supported.')}
              </span>
              <input
                type="file"
                required
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => setFile(event.target.files?.[0] || null)}
                className="mt-1 block w-full max-w-xs text-xs text-stone-500 file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-[#24342a] file:px-4 file:py-2 file:text-xs file:font-medium file:text-white hover:file:bg-[#35463b]"
              />
            </label>
          </div>

          {preview && (
            <div className="relative h-36 overflow-hidden rounded-2xl border border-stone-200 bg-stone-100 sm:h-auto">
              <img src={preview} alt="Preview" className="h-full w-full object-cover" />
              <span className="absolute bottom-2 left-2 rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-medium text-white">
                Preview
              </span>
            </div>
          )}
        </div>

        <div className="flex justify-end border-t border-stone-100 pt-4 sm:col-span-2">
          <button
            disabled={busy || !file}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[#24342a] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#35463b] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
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
