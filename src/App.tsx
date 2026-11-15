import { type ReactNode, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { api, imageUrl, type GalleryImage, type Room } from './api'
import AdminDashboard from './AdminDashboard'
import BookingPage from './BookingPage'
import { LanguageSwitch, useLanguage } from './i18n'
import {
  ArrowRight,
  CalendarDays,
  ChevronDown,
  Menu,
  MessageCircle,
  Phone,
  Play,
  X,
} from 'lucide-react'

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Rooms', href: '/rooms' },
  { label: 'Gallery', href: '/gallery' },
]

const villaVideo = '/media/WhatsApp%20Video%202026-11-10%20at%2019.53.06.mp4'

function RoomsPage() {
  const { t } = useLanguage()
  const [rooms, setRooms] = useState<Room[]>([])
  const [roomsError, setRoomsError] = useState('')
  useEffect(() => {
    let active = true
    const loadRooms = () => {
      if (document.visibilityState === 'hidden') return
      api.rooms().then((items) => {
        if (active) { setRooms(items); setRoomsError('') }
      }).catch((error: Error) => {
        if (active) setRoomsError(error.message)
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
  }, [])

  return (
    <main>
      <section className="relative overflow-hidden bg-[#24342a] px-4 pb-14 pt-20 text-white sm:px-6 sm:pb-20 sm:pt-28 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.32em] text-[#cdb782]">{t('Silent Villa · Rooms')}</p>
            <div className="mt-6 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
              <h1 className="max-w-4xl font-serif text-6xl leading-[0.92] tracking-[-0.05em] sm:text-7xl lg:text-8xl">
                {t('Make yourself')}<br /><span className="italic text-[#d8c28f]">{t('at home.')}</span>
              </h1>
              <div className="max-w-md pb-2">
                <p className="text-base leading-relaxed text-stone-300">
                  {t('Browse our rooms and send a booking request directly to the Silent Villa team.')}
                </p>
                  <Link to="/book" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#bda06b] px-5 py-3 text-sm font-medium text-[#24342a] transition hover:bg-[#dfcc9f]">
                  <CalendarDays size={15} /> {t('Book your stay')} <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-[#24342a] px-4 py-16 text-white sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div><p className="text-xs uppercase tracking-[0.28em] text-[#cdb782]">{t('Find your fit')}</p><h2 className="mt-2 font-serif text-4xl sm:text-5xl">{t('Rooms made for rest.')}</h2></div>
            <p className="max-w-sm text-sm leading-relaxed text-stone-400">{t('Choose a room and send us your dates. Our team will confirm your reservation.')}</p>
          </div>
          {roomsError && <p role="alert" className="mt-7 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-stone-300">{t('Rooms could not be loaded. Please try again in a moment.')}</p>}
          {!roomsError && rooms.length === 0 && <p className="mt-7 rounded-xl border border-white/10 bg-white/5 p-5 text-sm text-stone-300">{t('Room listings are being prepared. Please contact us by phone to arrange your stay.')}</p>}
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => <article key={room.id} className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
              <div className="relative h-56 overflow-hidden"><img src={imageUrl(room.imageUrl)} alt={room.name} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" /><span className="absolute inset-0 bg-gradient-to-t from-[#24342a]/40 to-transparent" /></div>
              <div className="p-5"><div className="flex items-start justify-between gap-3"><h3 className="font-serif text-2xl">{room.name}</h3><p className="shrink-0 text-sm text-[#d8c28f]">RWF {Number(room.price).toLocaleString()}<span className="block text-right text-[10px] text-stone-400">{t('per night')}</span></p></div><p className="mt-3 min-h-10 text-sm leading-relaxed text-stone-400">{room.description || t('A comfortable, welcoming room for a peaceful stay.')}</p><Link to={`/book?room=${room.id}`} className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#bda06b] px-4 py-2.5 text-xs font-medium text-[#24342a] transition hover:bg-[#dfcc9f]">{t('Book this room')} <ArrowRight size={14} /></Link></div>
            </article>)}
          </div>
        </div>
      </section>

      <section className="bg-[#eee8dc] px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-[#665940]">{t('Planning a visit?')}</p>
            <h2 className="mt-2 font-serif text-3xl text-stone-900">{t('We’ll help you find the right stay.')}</h2>
          </div>
          <Link to="/book" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#24342a] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#35332d]">{t('Book a room')} <ArrowRight size={15} /></Link>
        </div>
      </section>
    </main>
  )
}

function GalleryPage({
  gallery,
  galleryLoading,
  galleryError,
  onSelectImage,
}: {
  gallery: GalleryImage[]
  galleryLoading: boolean
  galleryError: string
  onSelectImage: (index: number) => void
}) {
  const { t } = useLanguage()
  return (
    <main>
      <section className="bg-[#f3eee4] px-4 pb-12 pt-16 sm:px-6 sm:pb-16 sm:pt-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.32em] text-[#665940]">{t('Silent Villa · Gallery')}</p>
            <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_0.55fr] lg:items-end">
              <h1 className="max-w-4xl font-serif text-6xl leading-[0.92] tracking-[-0.05em] text-stone-900 sm:text-7xl lg:text-8xl">
                {t('A glimpse of')}<br /><span className="italic text-[#756047]">{t('your stay.')}</span>
              </h1>
              <p className="max-w-md pb-2 text-base leading-relaxed text-stone-700">
                {t('Explore photographs added by the Silent Villa team. Select any image to view it up close.')}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-7 flex items-center justify-between border-b border-stone-300 pb-4">
            <p className="text-xs uppercase tracking-[0.25em] text-[#665940]">{t('The villa, in real life')}</p>
            <p className="text-sm text-stone-500">{gallery.length} {t('photographs')}</p>
          </div>
              {galleryError ? <p role="alert" className="rounded-xl border border-stone-200 bg-white p-5 text-sm text-stone-600">{t('The gallery could not be loaded. Please try again later.')}</p> : galleryLoading ? <p role="status" className="rounded-xl border border-stone-200 bg-white p-5 text-sm text-stone-500">{t('Loading gallery…')}</p> : gallery.length === 0 ? <p className="rounded-xl border border-stone-200 bg-white p-10 text-center text-sm text-stone-600">{t('No photos have been added to the gallery yet.')}</p> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-12 lg:auto-rows-[230px]">
            {gallery.map((image, index) => (
              <button
                key={image.id}
                type="button"
                onClick={() => onSelectImage(index)}
                aria-label={`Open full-size image: ${image.altText || image.title}`}
                className={`group relative overflow-hidden rounded-2xl bg-stone-200 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#756047] ${index === 0 ? 'h-[360px] sm:col-span-2 sm:h-[440px] lg:col-span-7 lg:row-span-2 lg:h-full' : 'h-[250px] lg:col-span-5 lg:h-full'}`}
              >
                <img src={imageUrl(image.imageUrl)} alt={image.altText || image.title} loading="lazy" className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.035]" />
                <span className="absolute inset-0 bg-gradient-to-t from-[#24342a]/65 via-transparent to-transparent opacity-75 transition group-hover:opacity-100" />
                <span className="absolute bottom-4 left-4 text-white">
                  <span className="block text-[10px] uppercase tracking-[0.25em] text-[#d8c28f]">Silent Villa · 0{index + 1}</span>
                  <span className="mt-1 block font-serif text-2xl">{image.title}</span>
                </span>
              </button>
            ))}
          </div>}
          <div className="mt-12 flex flex-col gap-4 border-t border-stone-300 pt-7 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-serif text-2xl text-stone-800">{t('Seen enough to imagine your stay?')}</p>
            <a href="tel:0788324736" className="inline-flex items-center gap-2 text-sm font-medium text-stone-900 transition hover:text-[#665940]">
              {t('Contact the villa')} <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}

function FaqSection() {
  const { t } = useLanguage()
  const shouldReduceMotion = useReducedMotion()
  const [openQuestion, setOpenQuestion] = useState<number | null>(0)
  const questions = [
    ['How do I book a room?', 'Choose a room and submit the booking request form. The Silent Villa team will contact you to confirm your stay.'],
    ['Do I pay online when I book?', 'No. This website does not process payments. Confirm the amount and payment details directly with Silent Villa.'],
    ['Where is Silent Villa located?', 'Silent Villa is on KN 288 St in Kigali. You can also use the Google Maps Plus Code 227V+FJ Kigali.'],
    ['How can I contact the team?', 'Call 0788 324 736 or start a conversation on WhatsApp at +250 788 324 736.'],
    ['Can I change or cancel my request?', 'Please contact Silent Villa directly by phone or WhatsApp, and the team will help with your request.'],
  ]

  return (
    <section id="faqs" className="bg-[#f4f0e7] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
        <Reveal>
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#7d644d] sm:text-xs">{t('A little help')}</p>
          <h2 className="mt-3 max-w-md font-serif text-4xl leading-tight tracking-[-0.035em] text-stone-900 sm:text-5xl">{t('Your questions, answered.')}</h2>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-stone-600 sm:text-base">{t('Find the details you need before choosing your room.')}</p>
          <a href="tel:0788324736" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full border border-stone-300 px-4 py-2.5 text-sm font-medium text-stone-800 transition hover:border-[#24342a] hover:bg-white">
            {t('Still have a question?')} <Phone size={15} />
          </a>
        </Reveal>
        <div className="divide-y divide-stone-300 border-y border-stone-300">
          {questions.map(([question, answer], index) => {
            const isOpen = openQuestion === index
            const answerId = `faq-answer-${index}`
            return (
              <motion.article key={question} initial={false} className="py-1">
                <button type="button" aria-expanded={isOpen} aria-controls={answerId} onClick={() => setOpenQuestion(isOpen ? null : index)} className="flex min-h-16 w-full items-center justify-between gap-4 py-4 text-left sm:min-h-[72px] sm:py-5">
                  <span className="font-serif text-xl leading-snug text-stone-900 sm:text-2xl">{t(question)}</span>
                  <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: shouldReduceMotion ? 0 : 0.22 }} className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-stone-300 text-[#665940]"><ChevronDown size={17} /></motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && <motion.div id={answerId} initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: shouldReduceMotion ? 0 : 0.25, ease: 'easeInOut' }} className="overflow-hidden"><p className="max-w-2xl pb-5 pr-10 text-sm leading-relaxed text-stone-600 sm:pb-6 sm:text-base">{t(answer)}</p></motion.div>}
                </AnimatePresence>
              </motion.article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function Reveal({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function VillaSite() {
  const { t } = useLanguage()
  const location = useLocation()
  const currentPath = location.pathname.replace(/\/+$/, '') || '/'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<number | null>(null)
  const [villaVideoStarted, setVillaVideoStarted] = useState(false)
  const [villaVideoError, setVillaVideoError] = useState('')
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  const [rooms, setRooms] = useState<Room[]>([])
  const [roomsLoading, setRoomsLoading] = useState(true)
  const [roomsError, setRoomsError] = useState('')
  const [gallery, setGallery] = useState<GalleryImage[]>([])
  const [galleryLoading, setGalleryLoading] = useState(true)
  const [galleryError, setGalleryError] = useState('')
  const villaVideoRef = useRef<HTMLVideoElement>(null)
  const shouldReduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll()
  const scrollProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 })

  useEffect(() => {
    let active = true
    const loadRooms = () => {
      if (document.visibilityState === 'hidden') return
      api.rooms()
        .then((items) => { if (active) { setRooms(items); setRoomsError('') } })
        .catch((error: Error) => { if (active) setRoomsError(error.message) })
        .finally(() => { if (active) setRoomsLoading(false) })
    }
    loadRooms()
    const interval = window.setInterval(loadRooms, 10000)
    window.addEventListener('focus', loadRooms)
    return () => {
      active = false
      window.clearInterval(interval)
      window.removeEventListener('focus', loadRooms)
    }
  }, [])

  useEffect(() => {
    let active = true
    const loadGallery = () => {
      if (document.visibilityState === 'hidden') return
      api.gallery()
        .then((items) => { if (active) { setGallery(items); setGalleryError('') } })
        .catch((error: Error) => { if (active) setGalleryError(error.message) })
        .finally(() => { if (active) setGalleryLoading(false) })
    }
    loadGallery()
    const interval = window.setInterval(loadGallery, 10000)
    window.addEventListener('focus', loadGallery)
    return () => {
      active = false
      window.clearInterval(interval)
      window.removeEventListener('focus', loadGallery)
    }
  }, [])

  useEffect(() => {
    if (location.hash) {
      requestAnimationFrame(() => document.getElementById(location.hash.slice(1))?.scrollIntoView())
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
    setActiveSection(currentPath === '/rooms' ? 'rooms' : currentPath === '/gallery' ? 'gallery' : 'home')
    const updateScrollState = () => setIsScrolled(window.scrollY > 24)
    updateScrollState()
    window.addEventListener('scroll', updateScrollState, { passive: true })

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleSection = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visibleSection) setActiveSection(visibleSection.target.id)
      },
      { rootMargin: '-20% 0px -65% 0px', threshold: [0, 0.2, 0.5] },
    )
    document.querySelectorAll('main section[id]').forEach((section) => observer.observe(section))

    return () => {
      window.removeEventListener('scroll', updateScrollState)
      observer.disconnect()
    }
  }, [currentPath, location.hash])

  useEffect(() => {
    if (selectedImage === null || gallery.length === 0) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedImage(null)
      if (event.key === 'ArrowRight') {
        setSelectedImage((current) => (current === null ? 0 : (current + 1) % gallery.length))
      }
      if (event.key === 'ArrowLeft') {
        setSelectedImage((current) => (current === null ? 0 : (current - 1 + gallery.length) % gallery.length))
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gallery.length, selectedImage])

  const playVillaVideo = async () => {
    const video = villaVideoRef.current
    if (!video) return
    setVillaVideoError('')
    try {
      await video.play()
      setVillaVideoStarted(true)
    } catch {
      setVillaVideoError('The video could not be played. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-[#f4f0e7] text-stone-900">
      <motion.div
        className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-[#c4a16d]"
        style={{ scaleX: scrollProgress }}
        aria-hidden="true"
      />
      <header className={`sticky top-0 z-50 border-b border-white/10 bg-[#24342a]/90 backdrop-blur-xl transition-shadow duration-300 ${isScrolled ? 'shadow-[0_12px_35px_rgba(0,0,0,0.2)]' : ''}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-3.5 lg:px-8">
          <Link
            to="/"
            className="inline-flex shrink-0 rounded-xl border border-[#d8c28f]/35 bg-[#f4f0e7] p-1 shadow-[0_6px_20px_rgba(0,0,0,0.14)] transition duration-300 hover:border-[#d8c28f]/60 hover:shadow-[0_8px_24px_rgba(0,0,0,0.2)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d8c28f]"
            aria-label="Silent Villa home"
            onClick={() => setMobileMenuOpen(false)}
          >
            <img
              src="/media/silent-villa-logo.jpg"
              alt="Silent Villa Guest House — Where Comfort Meets Silence"
              className="h-auto w-[9.25rem] rounded-lg object-contain sm:w-[12rem] xl:w-[14rem]"
            />
          </Link>

          <nav aria-label="Main navigation" className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                aria-current={
                  (item.href === '/' && currentPath === '/') ||
                  (item.href === '/rooms' && currentPath === '/rooms') ||
                  (item.href === '/gallery' && currentPath === '/gallery') ||
                  (item.href.startsWith('/#') && currentPath === '/' && activeSection === item.href.slice(2))
                    ? 'page'
                    : undefined
                }
                className={`nav-link relative rounded-full px-3 py-2 text-[13px] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#bda06b] ${
                  (item.href === '/rooms' && currentPath === '/rooms') ||
                  (item.href === '/' && currentPath === '/') ||
                  (item.href === '/gallery' && currentPath === '/gallery') ||
                  (item.href.startsWith('/#') && currentPath === '/' && activeSection === item.href.slice(2))
                    ? 'text-[#f2ddb5]'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                {t(item.label)}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <LanguageSwitch />
            <a href="tel:0788324736" className="inline-flex items-center gap-2 rounded-full bg-[#bda06b] px-5 py-2.5 text-sm font-medium text-[#24342a] transition duration-300 hover:bg-[#dfcc9f] hover:shadow-[0_8px_24px_rgba(212,179,127,0.2)]">
              {t('Call to enquire')} <Phone size={15} />
            </a>
          </div>

          <button
            type="button"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/5 text-stone-100 lg:hidden"
            onClick={() => setMobileMenuOpen((current) => !current)}
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: -12 }}
              animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? {} : { opacity: 0, y: -8 }}
              id="mobile-navigation"
              className="absolute inset-x-0 top-full border-t border-white/10 bg-[#1b1b17]/95 shadow-[0_18px_32px_rgba(0,0,0,0.25)] lg:hidden"
            >
              <nav aria-label="Mobile navigation" className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4 sm:px-6">
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    to={item.href}
                    aria-current={
                      (item.href === '/' && currentPath === '/') ||
                      (item.href === '/rooms' && currentPath === '/rooms') ||
                      (item.href === '/gallery' && currentPath === '/gallery') ||
                      (item.href.startsWith('/#') && currentPath === '/' && activeSection === item.href.slice(2))
                        ? 'page'
                        : undefined
                    }
                    className={`rounded-full px-4 py-3 text-sm transition ${
                      (item.href === '/rooms' && currentPath === '/rooms') ||
                      (item.href === '/' && currentPath === '/') ||
                      (item.href === '/gallery' && currentPath === '/gallery') ||
                      (item.href.startsWith('/#') && currentPath === '/' && activeSection === item.href.slice(2))
                        ? 'bg-white/10 text-[#f2ddb5]'
                        : 'text-stone-200 hover:bg-white/5'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t(item.label)}
                  </Link>
                ))}
                <div className="mt-3 flex justify-center"><LanguageSwitch /></div>
                <a href="tel:0788324736" className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-[#bda06b] px-4 py-3 text-sm font-medium text-[#24342a]" onClick={() => setMobileMenuOpen(false)}>
                  {t('Call to enquire')} <Phone size={15} />
                </a>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {currentPath === '/rooms' ? (
        <RoomsPage />
      ) : currentPath === '/gallery' ? (
        <GalleryPage gallery={gallery} galleryLoading={galleryLoading} galleryError={galleryError} onSelectImage={setSelectedImage} />
      ) : (
      <main>
        <section id="home" className="relative isolate flex min-h-[min(760px,calc(100svh-76px))] items-center overflow-hidden bg-[#18251d] text-white">
          <video className="absolute inset-0 -z-20 h-full w-full object-cover" autoPlay={!shouldReduceMotion} loop muted playsInline preload="metadata" poster="/media/WhatsApp%20Image%202026-11-10%20at%2019.54.25.jpeg" aria-hidden="true">
            <source src={villaVideo} type="video/mp4" />
          </video>
          <div className="absolute inset-0 -z-10 bg-[#17241c]/45" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#17241c]/90 via-[#17241c]/55 to-[#17241c]/20" />
          <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
            <motion.div initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }} animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }} transition={{ duration: 0.75, ease: 'easeOut' }} className="max-w-3xl">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/15 px-4 py-2 text-[10px] font-medium uppercase tracking-[0.24em] text-[#e5cc9b] backdrop-blur-md sm:text-xs"><span className="h-1.5 w-1.5 rounded-full bg-[#d8c28f]" />{t('Guest house · Kigali')}</p>
              <h1 className="mt-6 font-serif text-5xl leading-[0.98] tracking-[-0.045em] sm:text-6xl md:text-7xl lg:text-[5.5rem]">{t('A stay made for Kigali.')}</h1>
              <p className="mt-5 max-w-xl text-sm leading-relaxed text-stone-200 sm:text-base md:text-lg">{t('Find your room at Silent Villa and book directly with our team.')}</p>
              <div className="mt-8 flex flex-col gap-3 min-[420px]:flex-row">
                <a href="#rooms" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#c9aa73] px-6 py-3 text-sm font-semibold text-[#1e2d23] shadow-lg shadow-black/15 transition hover:-translate-y-0.5 hover:bg-[#dfc48e]">{t('Explore rooms')} <ArrowRight size={16} /></a>
                <Link to="/book" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/40 bg-white/5 px-6 py-3 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/15">{t('Book your stay')} <CalendarDays size={16} /></Link>
              </div>
              <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-stone-200 sm:text-sm">
                <span className="inline-flex items-center gap-2"><Phone size={14} className="text-[#d8c28f]" />0788 324 736</span>
                <span className="hidden h-4 w-px bg-white/30 min-[420px]:block" />
                <span className="text-stone-300">KN 288 St · Kigali, Rwanda</span>
              </div>
            </motion.div>
          </div>
          <a href="#rooms" aria-label={t('Scroll to available rooms')} className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[9px] uppercase tracking-[0.22em] text-white/70 transition hover:text-white sm:flex">{t('Scroll to explore')}<span className="h-8 w-px origin-top animate-pulse bg-[#d8c28f]" /></a>
        </section>

        <section id="rooms" className="scroll-mt-20 bg-[#f4f0e7] px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-7xl">
            <div className="mb-7 flex flex-col gap-4 sm:mb-9 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#806947] sm:text-xs">{t('Find your fit')}</p>
                <h2 className="mt-2 font-serif text-4xl leading-tight tracking-[-0.035em] text-stone-900 sm:text-5xl">{t('Available rooms')}</h2>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-stone-600 sm:text-base">{t('Choose a room and send us your dates. Our team will confirm your reservation.')}</p>
              </div>
              <a href="tel:0788324736" className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full border border-stone-300 px-4 py-2.5 text-sm font-medium text-stone-700 transition hover:border-[#24342a] hover:bg-white">
                {t('Ask about a room')} <Phone size={15} />
              </a>
            </div>

            {roomsError ? (
              <p role="alert" className="rounded-2xl border border-stone-200 bg-white p-5 text-sm text-stone-600 sm:p-7">{t('Rooms could not be loaded right now. Please try again shortly.')}</p>
            ) : roomsLoading ? (
              <p role="status" className="rounded-2xl border border-stone-200 bg-white p-5 text-sm text-stone-500 sm:p-7">{t('Loading available rooms…')}</p>
            ) : rooms.length === 0 ? (
              <p className="rounded-2xl border border-stone-200 bg-white p-5 text-sm text-stone-600 sm:p-7">{t('There are no rooms listed right now. Please check back soon or contact Silent Villa.')}</p>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
                {rooms.slice(0, 3).map((room, index) => (
                  <motion.article
                    key={room.id}
                    initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
                    whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.12 }}
                    transition={{ delay: shouldReduceMotion ? 0 : index * 0.09, duration: 0.45 }}
                    className="group overflow-hidden rounded-[1.35rem] border border-stone-200/80 bg-white shadow-[0_8px_24px_rgba(36,52,42,0.04)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(36,52,42,0.12)]"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-stone-200 sm:aspect-[5/4]">
                      <img src={imageUrl(room.imageUrl)} alt={room.name} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.045]" />
                      <span className="absolute inset-0 bg-gradient-to-t from-[#17241c]/25 via-transparent to-transparent opacity-70" />
                    </div>
                    <div className="p-5 sm:p-6">
                      <h3 className="font-serif text-2xl leading-tight text-stone-900 sm:text-3xl">{room.name}</h3>
                      <p className="mt-2 min-h-10 text-sm leading-relaxed text-stone-600">{room.description || t('A comfortable room for a peaceful stay.')}</p>
                      <div className="mt-5 flex flex-wrap items-end justify-between gap-3 border-t border-stone-100 pt-4">
                        <p className="text-sm font-semibold text-[#665940]">RWF {Number(room.price).toLocaleString()}<span className="mt-0.5 block text-xs font-normal text-stone-500">{t('per night')}</span></p>
                        <Link to={`/book?room=${room.id}`} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-[#24342a] px-4 py-2.5 text-center text-sm font-medium text-white transition hover:bg-[#35463b] sm:flex-none">
                          {t('Book this room')} <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            )}
            {!roomsError && !roomsLoading && rooms.length > 0 && <div className="mt-8 flex justify-center sm:mt-10"><Link to="/rooms" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#24342a] px-6 py-3 text-sm font-semibold text-[#24342a] transition hover:bg-[#24342a] hover:text-white">{t('View all rooms')} <ArrowRight size={16} /></Link></div>}
          </div>
        </section>

        <section id="villa-video" className="bg-[#24342a] px-4 py-16 text-white sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
              <Reveal>
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#d8c28f] sm:text-xs">{t('A look around')}</p>
                <h2 className="mt-3 max-w-2xl font-serif text-4xl leading-tight tracking-[-0.035em] sm:text-5xl md:text-6xl">{t('See Silent Villa for yourself.')}</h2>
              </Reveal>
              <p className="max-w-md text-sm leading-relaxed text-stone-300 sm:text-base">{t('Take a short look at the villa and picture your stay in Kigali.')}</p>
            </div>
            <Reveal>
              <div className="group relative aspect-video min-h-[220px] overflow-hidden rounded-2xl border border-white/10 bg-black shadow-[0_24px_70px_rgba(0,0,0,0.28)] sm:rounded-3xl">
                <video ref={villaVideoRef} className="absolute inset-0 h-full w-full object-cover" controls={villaVideoStarted} playsInline preload="metadata" poster="/media/WhatsApp%20Image%202026-11-10%20at%2019.54.25.jpeg" aria-label={t('Video tour of Silent Villa')} onPlay={() => setVillaVideoStarted(true)} onError={() => setVillaVideoError('The video could not be loaded. Please try again later.')}>
                  <source src={villaVideo} type="video/mp4" />
                </video>
                {!villaVideoStarted && <button type="button" onClick={() => void playVillaVideo()} className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gradient-to-t from-black/55 via-black/20 to-black/20 text-white transition hover:from-black/65" aria-label={t('Play the Silent Villa video')}><span className="grid h-16 w-16 place-items-center rounded-full border border-white/70 bg-[#c9aa73] text-[#24342a] shadow-xl transition duration-300 group-hover:scale-110 sm:h-20 sm:w-20"><Play size={26} fill="currentColor" className="ml-1" /></span><span className="rounded-full border border-white/30 bg-black/25 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] backdrop-blur sm:text-xs">{t('Play villa video')}</span></button>}
                {villaVideoError && <p role="alert" className="absolute inset-x-3 bottom-3 rounded-xl bg-black/75 px-4 py-3 text-center text-xs text-white sm:inset-x-6 sm:bottom-6 sm:text-sm">{t(villaVideoError)}</p>}
              </div>
            </Reveal>
          </div>
        </section>

        <FaqSection />
      </main>
      )}

      <footer className="border-t border-stone-200 bg-[#24342a] px-4 pb-28 pt-12 text-stone-200 sm:px-6 sm:py-12 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <div className="flex items-center gap-3">
                <img src="/media/silent-villa-logo.jpg" alt="Silent Villa Guest House — Where Comfort Meets Silence" className="h-14 w-[10.5rem] rounded-lg object-cover" />
              </div>
              <p className="mt-5 max-w-xs text-sm leading-relaxed text-stone-300">
                Guest rooms in Kigali. Choose a room and book directly with Silent Villa.
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-[#cdb782]">Explore</p>
              <ul className="mt-5 space-y-3 text-sm text-stone-300">
                <li><Link to="/" className="transition hover:text-white">Home</Link></li>
                <li><Link to="/rooms" className="transition hover:text-white">Rooms</Link></li>
                <li><Link to="/gallery" className="transition hover:text-white">Gallery</Link></li>
                <li><Link to="/book" className="transition hover:text-white">Book a room</Link></li>
              </ul>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-[#cdb782]">Contact & location</p>
              <ul className="mt-5 space-y-3 text-sm text-stone-300">
                <li>KN 288 St, Kigali · 227V+FJ</li>
                <li><a href="tel:0788324736" className="transition hover:text-white">0788 324 736</a></li>
                <li><a href="https://wa.me/250788324736" target="_blank" rel="noreferrer" className="transition hover:text-white">WhatsApp</a></li>
                <li><a href="https://maps.google.com/?q=227V%2BFJ+Kigali" target="_blank" rel="noreferrer" className="transition hover:text-white">Get directions</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-sm text-stone-400 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} Silent Villa. All rights reserved.</p>
            <div className="inline-flex items-center gap-2 text-[#cdb782]">
              <Phone size={15} />
              <a href="tel:0788324736" className="transition hover:text-white">Call to enquire</a>
            </div>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {isScrolled && !mobileMenuOpen && selectedImage === null && (
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
            animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? {} : { opacity: 0, y: 18 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="pointer-events-none fixed inset-x-0 bottom-0 z-[45] px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden"
          >
            <nav
              aria-label="Quick contact"
              className="pointer-events-auto mx-auto flex max-w-lg gap-2 rounded-2xl border border-white/10 bg-[#24342a]/95 p-2 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl"
            >
              <a
                href="https://wa.me/250788324736"
                target="_blank"
                rel="noreferrer"
                className="flex min-h-14 flex-1 items-center justify-center gap-2 rounded-xl bg-[#236c50] px-3 text-white transition hover:bg-[#2c805e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <MessageCircle size={19} strokeWidth={1.8} />
                <span className="text-sm font-medium">WhatsApp</span>
              </a>
              <a
                href="tel:0788324736"
                className="flex min-h-14 flex-1 items-center justify-center gap-2 rounded-xl bg-[#bda06b] px-3 text-[#24342a] transition hover:bg-[#d8c28f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <Phone size={18} strokeWidth={1.8} />
                <span className="text-sm font-semibold">Call · 0788 324 736</span>
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedImage !== null && gallery[selectedImage] && (
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0 }}
            animate={shouldReduceMotion ? {} : { opacity: 1 }}
            exit={shouldReduceMotion ? {} : { opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label="Photo gallery"
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#24342a]/85 p-4 backdrop-blur-sm"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={shouldReduceMotion ? false : { scale: 0.96, opacity: 0 }}
              animate={shouldReduceMotion ? {} : { scale: 1, opacity: 1 }}
              exit={shouldReduceMotion ? {} : { scale: 0.96, opacity: 0 }}
              className="relative w-full max-w-4xl overflow-hidden rounded-[1.75rem] border border-white/10 bg-stone-900"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                aria-label="Close image"
                className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#24342a]/70 text-white backdrop-blur-sm"
                onClick={() => setSelectedImage(null)}
              >
                <X size={18} />
              </button>

              <img src={imageUrl(gallery[selectedImage].imageUrl)} alt={gallery[selectedImage].altText || gallery[selectedImage].title} className="h-[70vh] w-full bg-black object-contain" />

              <div className="flex items-center justify-between gap-4 bg-stone-950 px-5 py-3 text-sm text-stone-200">
                <p>
                  {gallery[selectedImage].title}
                  <span className="ml-2 text-xs text-stone-500">
                    {String(selectedImage + 1).padStart(2, '0')} / {gallery.length}
                  </span>
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label="Previous image"
                    className="rounded-full border border-white/10 px-3 py-1.5"
                    onClick={() => setSelectedImage((current) => (current === null ? 0 : (current - 1 + gallery.length) % gallery.length))}
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    aria-label="Next image"
                    className="rounded-full border border-white/10 px-3 py-1.5"
                    onClick={() => setSelectedImage((current) => (current === null ? 0 : (current + 1) % gallery.length))}
                  >
                    Next
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function App() {
  const location = useLocation()
  const currentPath = location.pathname.replace(/\/+$/, '') || '/'
  if (currentPath === '/admin') return <AdminDashboard />
  if (currentPath === '/book') return <BookingPage />
  return <VillaSite />
}
