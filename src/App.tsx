import { type ReactNode, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring } from 'framer-motion'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { api, imageUrl, type GalleryImage, type Room } from './api'
import AdminDashboard from './AdminDashboard'
import BookingPage from './BookingPage'
import BrandLogo from './BrandLogo'
import { LanguageSwitch, useLanguage } from './i18n'
import TiltCard3D from './TiltCard3D'
import VillaScene3D from './VillaScene3D'
import {
  ArrowRight,
  BedDouble,
  CalendarDays,
  ChevronDown,
  Compass,
  Coffee,
  Eye,
  HeartHandshake,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  Play,
  ShieldCheck,
  Sparkles,
  Users,
  Wifi,
  X,
} from 'lucide-react'

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Rooms', href: '/rooms' },
  { label: 'Experiences', href: '/#experiences' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Find us', href: '/#location' },
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
      api
        .rooms()
        .then((items) => {
          if (active) {
            setRooms(items)
            setRoomsError('')
          }
        })
        .catch((error: Error) => {
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
      <section className="relative min-h-[520px] overflow-hidden bg-[#15221a] px-4 pb-16 pt-20 text-white sm:px-6 sm:pb-24 sm:pt-28 lg:px-8">
        <VillaScene3D
          activeHotspot="suites"
          mood="starlight"
          autoRotate
          interactive
          className="absolute inset-0 h-full w-full opacity-85"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#121e17]/95 via-[#15221a]/75 to-transparent" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#15221a] via-transparent to-transparent" />

        <div className="relative z-10 mx-auto max-w-7xl">
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#d8c28f]/30 bg-black/30 px-4 py-1.5 text-xs uppercase tracking-[0.28em] text-[#d8c28f] backdrop-blur-md">
              <Sparkles size={13} /> {t('Silent Villa · Rooms')}
            </div>
            <div className="mt-6 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
              <h1 className="max-w-4xl font-serif text-6xl leading-[0.92] tracking-[-0.05em] sm:text-7xl lg:text-8xl">
                {t('Make yourself')}
                <br />
                <span className="italic text-[#d8c28f]">{t('at home.')}</span>
              </h1>
              <div className="max-w-md pb-2">
                <p className="text-base leading-relaxed text-stone-200">
                  {t('Browse our rooms and send a booking request directly to the Silent Villa team.')}
                </p>
                <Link
                  to="/book"
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#bda06b] px-6 py-3.5 text-sm font-semibold text-[#18251d] shadow-lg transition hover:bg-[#dfcc9f]"
                >
                  <CalendarDays size={15} /> {t('Book your stay')} <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-[#18251d] px-4 py-16 text-white sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-[#cdb782]">{t('Find your fit')}</p>
              <h2 className="mt-2 font-serif text-4xl sm:text-5xl">{t('Rooms made for rest.')}</h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-stone-300">
              {t('Choose a room and send us your dates. Our team will confirm your reservation.')}
            </p>
          </div>

          {roomsError && (
            <p role="alert" className="mt-7 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-stone-300">
              {t('Rooms could not be loaded. Please try again in a moment.')}
            </p>
          )}
          {!roomsError && rooms.length === 0 && (
            <p className="mt-7 rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-stone-300">
              {t('Room listings are being prepared. Please contact us by phone to arrange your stay.')}
            </p>
          )}
          {!roomsError && rooms.length > 0 && (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {rooms.map((room) => (
                <TiltCard3D key={room.id} className="rounded-3xl">
                  <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-white/15 bg-white/[0.05] backdrop-blur-md transition duration-500 hover:border-[#d8c28f]/50">
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={imageUrl(room.imageUrl)}
                        alt={room.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      />
                      <span className="absolute inset-0 bg-gradient-to-t from-[#18251d] via-transparent to-transparent" />
                      <span className="absolute right-4 top-4 rounded-full border border-white/20 bg-black/45 px-3 py-1 text-xs font-medium text-[#f2dfb4] backdrop-blur-md">
                        RWF {Number(room.price).toLocaleString()} / {t('per night')}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col justify-between p-6">
                      <div>
                        <h3 className="font-serif text-3xl text-white">{room.name}</h3>
                        <p className="mt-3 text-sm leading-relaxed text-stone-300">
                          {room.description || t('A comfortable, welcoming room for a peaceful stay.')}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-[#d8c28f]">
                          <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-1">
                            <Wifi size={12} /> High-speed Wi-Fi
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-1">
                            <Coffee size={12} /> Breakfast & Coffee
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-1">
                            <ShieldCheck size={12} /> Private Sanctuary
                          </span>
                        </div>
                      </div>
                      <Link
                        to={`/book?room=${room.id}`}
                        className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-[#bda06b] px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#18251d] transition hover:bg-[#dfcc9f]"
                      >
                        {t('Book this room')} <ArrowRight size={14} />
                      </Link>
                    </div>
                  </article>
                </TiltCard3D>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-[#eee8dc] px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-[#665940]">{t('Planning a visit?')}</p>
            <h2 className="mt-2 font-serif text-3xl text-stone-900">{t('We’ll help you find the right stay.')}</h2>
          </div>
          <Link
            to="/book"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#24342a] px-6 py-3.5 text-sm font-medium text-white transition hover:bg-[#35332d]"
          >
            {t('Book a room')} <ArrowRight size={15} />
          </Link>
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
      <section className="relative overflow-hidden bg-[#18251d] px-4 pb-14 pt-16 text-white sm:px-6 sm:pb-20 sm:pt-24 lg:px-8">
        <VillaScene3D activeHotspot="pool" mood="sunset" interactive className="absolute inset-0 h-full w-full opacity-75" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#15221a]/95 via-[#18251d]/75 to-transparent" />
        <div className="relative z-10 mx-auto max-w-7xl">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.32em] text-[#d8c28f]">{t('Silent Villa · Gallery')}</p>
            <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_0.55fr] lg:items-end">
              <h1 className="max-w-4xl font-serif text-6xl leading-[0.92] tracking-[-0.05em] text-white sm:text-7xl lg:text-8xl">
                {t('A glimpse of')}
                <br />
                <span className="italic text-[#d8c28f]">{t('your stay.')}</span>
              </h1>
              <p className="max-w-md pb-2 text-base leading-relaxed text-stone-200">
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
            <p className="text-sm text-stone-500">
              {gallery.length} {t('photographs')}
            </p>
          </div>
          {galleryError ? (
            <p role="alert" className="rounded-xl border border-stone-200 bg-white p-5 text-sm text-stone-600">
              {t('The gallery could not be loaded. Please try again later.')}
            </p>
          ) : galleryLoading ? (
            <p role="status" className="rounded-xl border border-stone-200 bg-white p-5 text-sm text-stone-500">
              {t('Loading gallery…')}
            </p>
          ) : gallery.length === 0 ? (
            <p className="rounded-xl border border-stone-200 bg-white p-10 text-center text-sm text-stone-600">
              {t('No photos have been added to the gallery yet.')}
            </p>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-12 lg:auto-rows-[250px]">
              {gallery.map((image, index) => (
                <TiltCard3D
                  key={image.id}
                  intensity={5}
                  className={`rounded-3xl ${
                    index === 0
                      ? 'h-[360px] sm:col-span-2 sm:h-[440px] lg:col-span-7 lg:row-span-2 lg:h-full'
                      : 'h-[250px] lg:col-span-5 lg:h-full'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onSelectImage(index)}
                    aria-label={`Open full-size image: ${image.altText || image.title}`}
                    className="group relative h-full w-full overflow-hidden rounded-3xl bg-stone-200 text-left shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#756047]"
                  >
                    <img
                      src={imageUrl(image.imageUrl)}
                      alt={image.altText || image.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105"
                    />
                    <span className="absolute inset-0 bg-gradient-to-t from-[#18251d]/80 via-transparent to-transparent opacity-80 transition group-hover:opacity-100" />
                    <span className="absolute bottom-5 left-5 text-white">
                      <span className="block text-[10px] uppercase tracking-[0.25em] text-[#d8c28f]">
                        Silent Villa · 0{index + 1}
                      </span>
                      <span className="mt-1 block font-serif text-2xl">{image.title}</span>
                    </span>
                  </button>
                </TiltCard3D>
              ))}
            </div>
          )}
          <div className="mt-12 flex flex-col gap-4 border-t border-stone-300 pt-7 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-serif text-2xl text-stone-800">{t('Seen enough to imagine your stay?')}</p>
            <a
              href="tel:0788324736"
              className="inline-flex items-center gap-2 text-sm font-medium text-stone-900 transition hover:text-[#665940]"
            >
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
          <h2 className="mt-3 max-w-md font-serif text-4xl leading-tight tracking-[-0.035em] text-stone-900 sm:text-5xl">
            {t('Your questions, answered.')}
          </h2>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-stone-600 sm:text-base">
            {t('Find the details you need before choosing your room.')}
          </p>
          <a
            href="tel:0788324736"
            className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full border border-stone-300 px-4 py-2.5 text-sm font-medium text-stone-800 transition hover:border-[#24342a] hover:bg-white"
          >
            {t('Still have a question?')} <Phone size={15} />
          </a>
        </Reveal>
        <div className="divide-y divide-stone-300 border-y border-stone-300">
          {questions.map(([question, answer], index) => {
            const isOpen = openQuestion === index
            const answerId = `faq-answer-${index}`
            return (
              <motion.article key={question} initial={false} className="py-1">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={answerId}
                  onClick={() => setOpenQuestion(isOpen ? null : index)}
                  className="flex min-h-16 w-full items-center justify-between gap-4 py-4 text-left sm:min-h-[72px] sm:py-5"
                >
                  <span className="font-serif text-xl leading-snug text-stone-900 sm:text-2xl">{t(question)}</span>
                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: shouldReduceMotion ? 0 : 0.22 }}
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-stone-300 text-[#665940]"
                  >
                    <ChevronDown size={17} />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={answerId}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: shouldReduceMotion ? 0 : 0.25, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <p className="max-w-2xl pb-5 pr-10 text-sm leading-relaxed text-stone-600 sm:pb-6 sm:text-base">
                        {t(answer)}
                      </p>
                    </motion.div>
                  )}
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
  const navigate = useNavigate()
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
  const [quickBook, setQuickBook] = useState({
    checkIn: new Date().toISOString().slice(0, 10),
    guests: '2',
  })

  const villaVideoRef = useRef<HTMLVideoElement>(null)
  const shouldReduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll()
  const scrollProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 })

  useEffect(() => {
    let active = true
    const loadRooms = () => {
      if (document.visibilityState === 'hidden') return
      api
        .rooms()
        .then((items) => {
          if (active) {
            setRooms(items)
            setRoomsError('')
          }
        })
        .catch((error: Error) => {
          if (active) setRoomsError(error.message)
        })
        .finally(() => {
          if (active) setRoomsLoading(false)
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

  useEffect(() => {
    let active = true
    const loadGallery = () => {
      if (document.visibilityState === 'hidden') return
      api
        .gallery()
        .then((items) => {
          if (active) {
            setGallery(items)
            setGalleryError('')
          }
        })
        .catch((error: Error) => {
          if (active) setGalleryError(error.message)
        })
        .finally(() => {
          if (active) setGalleryLoading(false)
        })
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
      requestAnimationFrame(() => document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }))
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
        setSelectedImage((current) =>
          current === null ? 0 : (current - 1 + gallery.length) % gallery.length,
        )
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

  const services = [
    {
      title: 'Short Stay',
      desc: 'A comfortable base for short visits and weekend escapes.',
      icon: Compass,
      tag: 'Flexible Nightly',
    },
    {
      title: 'Long Stays',
      desc: 'A calm, comfortable setting for longer stays, with kitchen services.',
      icon: BedDouble,
      tag: 'Extended Comfort',
    },
    {
      title: 'Family Stays',
      desc: 'Flexible stays with comfort and privacy for the whole family.',
      icon: Users,
      tag: 'Private Suites',
    },
    {
      title: 'Food & Beverages',
      desc: 'Food and beverage options during your stay.',
      icon: Coffee,
      tag: 'In-Villa Dining',
    },
    {
      title: 'Massage & Wellness',
      desc: 'Massage and wellness to help you unwind.',
      icon: HeartHandshake,
      tag: 'Restorative Care',
    },
  ]

  return (
    <div className="min-h-screen bg-[#f4f0e7] text-stone-900">
      <motion.div
        className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-gradient-to-r from-[#bda06b] via-[#f2dfb4] to-[#bda06b]"
        style={{ scaleX: scrollProgress }}
        aria-hidden="true"
      />

      <header
        className={`sticky top-0 z-50 border-b border-white/10 bg-[#15221a]/90 backdrop-blur-xl transition-all duration-300 ${
          isScrolled ? 'shadow-[0_14px_40px_rgba(0,0,0,0.32)]' : ''
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-3.5 lg:px-8">
          <Link
            to="/"
            className="inline-flex shrink-0 rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d8c28f]"
            aria-label="Silent Villa home"
            onClick={() => setMobileMenuOpen(false)}
          >
            <BrandLogo variant="dark" size="md" />
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
                className={`nav-link relative rounded-full px-3.5 py-2 text-[13px] font-medium tracking-wide transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#bda06b] ${
                  (item.href === '/rooms' && currentPath === '/rooms') ||
                  (item.href === '/' && currentPath === '/' && activeSection === 'home') ||
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
            <Link
              to="/book"
              className="inline-flex items-center gap-2 rounded-full border border-[#d8c28f]/40 bg-white/5 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-[#f2dfb4] transition duration-300 hover:border-[#d8c28f] hover:bg-white/10"
            >
              <CalendarDays size={14} /> {t('Book your stay')}
            </Link>
            <a
              href="tel:0788324736"
              className="inline-flex items-center gap-2 rounded-full bg-[#bda06b] px-5 py-2.5 text-sm font-semibold text-[#18251d] transition duration-300 hover:bg-[#dfcc9f] hover:shadow-[0_8px_24px_rgba(212,179,127,0.28)]"
            >
              {t('Call to enquire')} <Phone size={15} />
            </a>
          </div>

          <div className="flex shrink-0 items-center gap-2 lg:hidden">
            <LanguageSwitch compact />
            <button
              type="button"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/5 text-stone-100"
              onClick={() => setMobileMenuOpen((current) => !current)}
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: -12 }}
              animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? {} : { opacity: 0, y: -8 }}
              id="mobile-navigation"
              className="absolute inset-x-0 top-full border-t border-white/10 bg-[#142018]/98 shadow-[0_18px_32px_rgba(0,0,0,0.35)] lg:hidden"
            >
              <nav aria-label="Mobile navigation" className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4 sm:px-6">
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    to={item.href}
                    className={`rounded-full px-4 py-3 text-sm transition ${
                      (item.href === '/rooms' && currentPath === '/rooms') ||
                      (item.href === '/' && currentPath === '/') ||
                      (item.href === '/gallery' && currentPath === '/gallery')
                        ? 'bg-white/10 text-[#f2ddb5]'
                        : 'text-stone-200 hover:bg-white/5'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t(item.label)}
                  </Link>
                ))}
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <Link
                    to="/book"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-[#d8c28f]/40 bg-white/5 px-4 py-3 text-sm font-medium text-[#f2ddb5]"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('Book your stay')}
                  </Link>
                  <a
                    href="tel:0788324736"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#bda06b] px-4 py-3 text-sm font-semibold text-[#18251d]"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('Call to enquire')} <Phone size={15} />
                  </a>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {currentPath === '/rooms' ? (
        <RoomsPage />
      ) : currentPath === '/gallery' ? (
        <GalleryPage
          gallery={gallery}
          galleryLoading={galleryLoading}
          galleryError={galleryError}
          onSelectImage={setSelectedImage}
        />
      ) : (
        <main>
          {/* 3D INTERACTIVE HERO SECTION */}
          <section
            id="home"
            className="relative isolate flex min-h-[min(860px,calc(100svh-72px))] flex-col justify-between overflow-hidden bg-[#131f18] text-white"
          >
            {/* Subtle background video layer blended beneath the interactive Three.js 3D sanctuary */}
            <video
              className="absolute inset-0 -z-30 h-full w-full object-cover opacity-20 mix-blend-screen"
              autoPlay={!shouldReduceMotion}
              loop
              muted
              playsInline
              preload="metadata"
              poster="/media/WhatsApp%20Image%202026-11-10%20at%2019.54.25.jpeg"
              aria-hidden="true"
            >
              <source src={villaVideo} type="video/mp4" />
            </video>

            {/* Interactive Three.js 3D Architectural Canvas (Auto-Rotating) */}
            <VillaScene3D
              activeHotspot="courtyard"
              mood="sunset"
              autoRotate
              interactive
              className="absolute inset-0 -z-10 h-full w-full"
            />

            {/* Cinematic vignette gradients for crisp PC & mobile typography */}
            <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-[#111c15]/90 via-[#131f18]/50 to-transparent" />
            <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-[#111c15] via-transparent to-[#111c15]/35" />

            <div className="pointer-events-none mx-auto flex w-full max-w-7xl flex-1 items-center px-4 pb-12 pt-14 sm:px-6 sm:pt-20 lg:px-8 lg:py-24">
              {/* Hero Copy & CTAs */}
              <motion.div
                initial={shouldReduceMotion ? false : { opacity: 0, y: 26 }}
                animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="pointer-events-auto max-w-2xl"
              >
                <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-[#d8c28f]/35 bg-black/35 px-4 py-2 text-[10px] font-medium uppercase tracking-[0.24em] text-[#e5cc9b] backdrop-blur-md sm:text-xs">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-[#d8c28f]" />
                  {t('Guest house · Kigali')} · {t('Where comfort meets silence')}
                </div>

                <h1 className="mt-6 font-serif text-5xl leading-[0.94] tracking-[-0.045em] sm:text-6xl md:text-7xl lg:text-[5.5rem]">
                  {t('A stay made for Kigali.')}
                </h1>

                <p className="mt-5 max-w-xl text-sm leading-relaxed text-stone-200 sm:text-base md:text-lg">
                  {t(
                    'Welcome to Silent Villa, a peaceful escape where comfort meets calm. Enjoy your stay in a quiet, relaxing environment designed for rest and refreshment.',
                  )}
                </p>

                <div className="mt-8 flex flex-col gap-3 min-[430px]:flex-row">
                  <a
                    href="#rooms"
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#c9aa73] px-7 py-3.5 text-sm font-semibold text-[#18251d] shadow-[0_14px_34px_rgba(201,170,115,0.3)] transition hover:-translate-y-0.5 hover:bg-[#dfc48e]"
                  >
                    {t('Explore rooms')} <ArrowRight size={16} />
                  </a>
                  <Link
                    to="/book"
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/35 bg-white/10 px-7 py-3.5 text-sm font-medium text-white backdrop-blur-md transition hover:border-[#d8c28f] hover:bg-white/15"
                  >
                    {t('Book your stay')} <CalendarDays size={16} />
                  </Link>
                </div>

                {/* Desktop & Mobile Quick Availability Bar */}
                <form
                  onSubmit={(event) => {
                    event.preventDefault()
                    navigate('/book')
                  }}
                  className="mt-9 grid gap-2.5 rounded-3xl border border-white/20 bg-[#142018]/75 p-2.5 shadow-[0_24px_60px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:grid-cols-[1fr_0.85fr_auto] sm:items-center sm:rounded-full sm:p-2"
                >
                  <label className="group flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 transition hover:border-[#d8c28f]/40 hover:bg-white/[0.08] focus-within:border-[#d8c28f] focus-within:bg-white/[0.08] sm:rounded-full">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#bda06b]/20 text-[#d8c28f]">
                      <CalendarDays size={16} />
                    </span>
                    <span className="min-w-0 flex-1 text-left">
                      <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#d8c28f]">
                        {t('Check-in')}
                      </span>
                      <input
                        type="date"
                        value={quickBook.checkIn}
                        min={new Date().toISOString().slice(0, 10)}
                        onChange={(e) => setQuickBook({ ...quickBook, checkIn: e.target.value })}
                        className="mt-0.5 w-full cursor-pointer bg-transparent text-xs font-medium text-white outline-none [color-scheme:dark]"
                      />
                    </span>
                  </label>
                  <label className="group flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 transition hover:border-[#d8c28f]/40 hover:bg-white/[0.08] focus-within:border-[#d8c28f] focus-within:bg-white/[0.08] sm:rounded-full">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#bda06b]/20 text-[#d8c28f]">
                      <Users size={16} />
                    </span>
                    <span className="min-w-0 flex-1 text-left">
                      <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#d8c28f]">
                        {t('Guests')}
                      </span>
                      <select
                        value={quickBook.guests}
                        onChange={(e) => setQuickBook({ ...quickBook, guests: e.target.value })}
                        className="mt-0.5 w-full cursor-pointer bg-transparent text-xs font-medium text-white outline-none [&>option]:bg-[#18251d]"
                      >
                        {[1, 2, 3, 4, 5, 6].map((n) => (
                          <option key={n} value={n}>
                            {n} {t(n === 1 ? 'guest' : 'guests')}
                          </option>
                        ))}
                      </select>
                    </span>
                  </label>
                  <button
                    type="submit"
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#d8c28f] px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#18251d] shadow-lg transition hover:bg-[#f2dfb4] sm:rounded-full"
                  >
                    {t('Reserve your stay')} <ArrowRight size={14} />
                  </button>
                </form>
              </motion.div>
            </div>

            {/* Bottom Hero Status Bar */}
            <div className="border-t border-white/10 bg-black/35 backdrop-blur-md">
              <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3.5 text-xs text-stone-300 sm:px-6 lg:px-8">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                  <span className="inline-flex items-center gap-2">
                    <Phone size={14} className="text-[#d8c28f]" /> 0788 324 736
                  </span>
                  <span className="hidden h-3.5 w-px bg-white/25 sm:block" />
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin size={14} className="text-[#d8c28f]" /> KN 288 St · 227V+FJ Kigali, Rwanda
                  </span>
                </div>
                <div className="flex items-center gap-4 text-[11px] uppercase tracking-[0.2em] text-[#d8c28f]">
                  <span>{t('Calm surroundings')}</span>
                  <span>·</span>
                  <span>{t('Warm hospitality')}</span>
                </div>
              </div>
            </div>
          </section>

          {/* AVAILABLE ROOMS SECTION WITH 3D TILT CARDS */}
          <section id="rooms" className="scroll-mt-20 bg-[#f4f0e7] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
            <div className="mx-auto max-w-7xl">
              <div className="mb-8 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#806947] sm:text-xs">
                    {t('Find your fit')}
                  </p>
                  <h2 className="mt-2 font-serif text-4xl leading-tight tracking-[-0.035em] text-stone-900 sm:text-5xl lg:text-6xl">
                    {t('Available rooms')}
                  </h2>
                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-stone-600 sm:text-base">
                    {t('Choose a room and send us your dates. Our team will confirm your reservation.')}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    to="/rooms"
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#24342a] bg-[#24342a] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#35463b]"
                  >
                    {t('View all rooms')} <ArrowRight size={15} />
                  </Link>
                  <a
                    href="tel:0788324736"
                    className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 transition hover:border-[#24342a]"
                  >
                    {t('Ask about a room')} <Phone size={15} />
                  </a>
                </div>
              </div>

              {roomsError ? (
                <p role="alert" className="rounded-2xl border border-stone-200 bg-white p-5 text-sm text-stone-600 sm:p-7">
                  {t('Rooms could not be loaded right now. Please try again shortly.')}
                </p>
              ) : roomsLoading ? (
                <p role="status" className="rounded-2xl border border-stone-200 bg-white p-5 text-sm text-stone-500 sm:p-7">
                  {t('Loading available rooms…')}
                </p>
              ) : rooms.length === 0 ? (
                <p className="rounded-2xl border border-stone-200 bg-white p-5 text-sm text-stone-600 sm:p-7">
                  {t('There are no rooms listed right now. Please check back soon or contact Silent Villa.')}
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {rooms.slice(0, 3).map((room, index) => (
                    <motion.div
                      key={room.id}
                      initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
                      whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.12 }}
                      transition={{ delay: shouldReduceMotion ? 0 : index * 0.09, duration: 0.5 }}
                    >
                      <TiltCard3D className="h-full rounded-[1.5rem]">
                        <article className="group flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-stone-200/90 bg-white shadow-[0_12px_32px_rgba(36,52,42,0.06)] transition duration-300 hover:shadow-[0_24px_60px_rgba(36,52,42,0.14)]">
                          <div className="relative aspect-[4/3] overflow-hidden bg-stone-200">
                            <img
                              src={imageUrl(room.imageUrl)}
                              alt={room.name}
                              loading="lazy"
                              className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                            />
                            <span className="absolute inset-0 bg-gradient-to-t from-[#17241c]/45 via-transparent to-transparent" />
                            <span className="absolute left-4 top-4 rounded-full bg-[#18251d]/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#e5cc9b] backdrop-blur-md">
                              Suite 0{index + 1}
                            </span>
                          </div>
                          <div className="flex flex-1 flex-col justify-between p-6">
                            <div>
                              <h3 className="font-serif text-2xl leading-tight text-stone-900 sm:text-3xl">
                                {room.name}
                              </h3>
                              <p className="mt-2.5 min-h-10 text-sm leading-relaxed text-stone-600">
                                {room.description || t('A comfortable room for a peaceful stay.')}
                              </p>
                            </div>
                            <div className="mt-6 flex flex-wrap items-end justify-between gap-3 border-t border-stone-100 pt-4">
                              <p className="text-base font-semibold text-[#665940]">
                                RWF {Number(room.price).toLocaleString()}
                                <span className="mt-0.5 block text-xs font-normal text-stone-500">{t('per night')}</span>
                              </p>
                              <Link
                                to={`/book?room=${room.id}`}
                                className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-[#24342a] px-5 py-2.5 text-center text-sm font-medium text-white transition hover:bg-[#35463b] sm:flex-none"
                              >
                                {t('Book this room')} <ArrowRight size={14} />
                              </Link>
                            </div>
                          </div>
                        </article>
                      </TiltCard3D>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* EXPERIENCES & SERVICES SECTION */}
          <section id="experiences" className="scroll-mt-20 bg-[#ebe4d6] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
            <div className="mx-auto max-w-7xl">
              <Reveal>
                <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#756047]">
                      {t('Made for your kind of stay')}
                    </p>
                    <h2 className="mt-3 font-serif text-4xl leading-tight tracking-[-0.035em] text-stone-900 sm:text-5xl lg:text-6xl">
                      {t('Stay a night.')} <span className="italic text-[#756047]">{t('Stay a while.')}</span>
                    </h2>
                  </div>
                  <p className="max-w-md text-sm leading-relaxed text-stone-600 sm:text-base">
                    {t(
                      'Escape the noise of the city and discover true comfort. Every detail is designed for relaxation, privacy, and peace of mind — your perfect home away from home in Kigali.',
                    )}
                  </p>
                </div>
              </Reveal>

              <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
                {services.map(({ title, desc, icon: Icon, tag }) => (
                  <TiltCard3D key={title} intensity={6} className="h-full rounded-2xl">
                    <div className="flex h-full flex-col justify-between rounded-2xl border border-stone-300/80 bg-[#f9f6f0] p-6 shadow-sm transition hover:border-[#bda06b] hover:bg-white">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#24342a] text-[#d8c28f]">
                            <Icon size={20} />
                          </span>
                          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#756047]">
                            {tag}
                          </span>
                        </div>
                        <h3 className="mt-5 font-serif text-2xl text-stone-900">{t(title)}</h3>
                        <p className="mt-2 text-xs leading-relaxed text-stone-600 sm:text-sm">{t(desc)}</p>
                      </div>
                      <div className="mt-5 border-t border-stone-200/80 pt-3 text-[11px] font-medium text-[#665940]">
                        Silent Villa Sanctuary
                      </div>
                    </div>
                  </TiltCard3D>
                ))}
              </div>
            </div>
          </section>

          {/* VIDEO TOUR SECTION */}
          <section id="villa-video" className="bg-[#18251d] px-4 py-16 text-white sm:px-6 sm:py-20 lg:px-8 lg:py-24">
            <div className="mx-auto max-w-7xl">
              <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
                <Reveal>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#d8c28f] sm:text-xs">
                    {t('A look around')}
                  </p>
                  <h2 className="mt-3 max-w-2xl font-serif text-4xl leading-tight tracking-[-0.035em] sm:text-5xl md:text-6xl">
                    {t('See Silent Villa for yourself.')}
                  </h2>
                </Reveal>
                <p className="max-w-md text-sm leading-relaxed text-stone-300 sm:text-base">
                  {t('Take a short look at the villa and picture your stay in Kigali.')}
                </p>
              </div>
              <Reveal>
                <div className="group relative aspect-video min-h-[240px] overflow-hidden rounded-2xl border border-white/15 bg-black shadow-[0_24px_70px_rgba(0,0,0,0.35)] sm:rounded-3xl">
                  <video
                    ref={villaVideoRef}
                    className="absolute inset-0 h-full w-full object-cover"
                    controls={villaVideoStarted}
                    playsInline
                    preload="metadata"
                    poster="/media/WhatsApp%20Image%202026-11-10%20at%2019.54.25.jpeg"
                    aria-label={t('Video tour of Silent Villa')}
                    onPlay={() => setVillaVideoStarted(true)}
                    onError={() => setVillaVideoError('The video could not be loaded. Please try again later.')}
                  >
                    <source src={villaVideo} type="video/mp4" />
                  </video>
                  {!villaVideoStarted && (
                    <button
                      type="button"
                      onClick={() => void playVillaVideo()}
                      className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gradient-to-t from-black/60 via-black/25 to-black/20 text-white transition hover:from-black/70"
                      aria-label={t('Play the Silent Villa video')}
                    >
                      <span className="grid h-16 w-16 place-items-center rounded-full border border-white/70 bg-[#c9aa73] text-[#18251d] shadow-xl transition duration-300 group-hover:scale-110 sm:h-20 sm:w-20">
                        <Play size={26} fill="currentColor" className="ml-1" />
                      </span>
                      <span className="rounded-full border border-white/30 bg-black/35 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] backdrop-blur sm:text-xs">
                        {t('Play villa video')}
                      </span>
                    </button>
                  )}
                  {villaVideoError && (
                    <p
                      role="alert"
                      className="absolute inset-x-3 bottom-3 rounded-xl bg-black/75 px-4 py-3 text-center text-xs text-white sm:inset-x-6 sm:bottom-6 sm:text-sm"
                    >
                      {t(villaVideoError)}
                    </p>
                  )}
                </div>
              </Reveal>
            </div>
          </section>

          {/* GALLERY PREVIEW SECTION */}
          <section className="bg-[#f4f0e7] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#756047]">{t('A glimpse inside')}</p>
                  <h2 className="mt-2 font-serif text-4xl text-stone-900 sm:text-5xl">
                    {t('Made for the moments in between.')}
                  </h2>
                </div>
                <Link
                  to="/gallery"
                  className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-5 py-2.5 text-sm font-medium text-stone-800 transition hover:border-[#24342a]"
                >
                  {t('Explore the full gallery')} <ArrowRight size={15} />
                </Link>
              </div>
              {galleryError ? (
                <p role="alert" className="rounded-2xl border border-stone-200 bg-white p-5 text-sm text-stone-600">
                  {t('The gallery could not be loaded right now.')}
                </p>
              ) : galleryLoading ? (
                <p role="status" className="rounded-2xl border border-stone-200 bg-white p-5 text-sm text-stone-500">
                  {t('Loading gallery…')}
                </p>
              ) : gallery.length === 0 ? (
                <p className="rounded-2xl border border-stone-200 bg-white p-6 text-sm text-stone-600">
                  {t('Gallery photos will appear here when they are added by the Silent Villa team.')}
                </p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {gallery.slice(0, 4).map((item, idx) => (
                    <TiltCard3D key={item.id} intensity={6} className="rounded-2xl">
                      <button
                        type="button"
                        onClick={() => setSelectedImage(idx)}
                        className="group relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-stone-200 text-left"
                      >
                        <img
                          src={imageUrl(item.imageUrl)}
                          alt={item.altText || item.title}
                          loading="lazy"
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                        />
                        <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80" />
                        <span className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                          <span className="truncate font-serif text-lg">{item.title}</span>
                          <Eye size={15} className="shrink-0 text-[#d8c28f]" />
                        </span>
                      </button>
                    </TiltCard3D>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* LOCATION & DIRECTIONS SECTION */}
          <section id="location" className="scroll-mt-20 bg-[#24342a] px-4 py-16 text-white sm:px-6 sm:py-20 lg:px-8">
            <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_1fr] lg:items-center">
              <Reveal>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d8c28f]">{t('Find your way')}</p>
                <h2 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">{t('A Kigali welcome awaits.')}</h2>
                <p className="mt-4 max-w-lg text-sm leading-relaxed text-stone-300 sm:text-base">
                  {t('Find Silent Villa on KN 288 St in Kigali, or use its Google Maps Plus Code to navigate directly.')}
                </p>
                <div className="mt-7 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[#d8c28f]">{t('Your destination')}</p>
                    <p className="mt-1 font-serif text-xl">KN 288 St, Kigali</p>
                    <p className="mt-1 text-xs text-stone-300">Plus Code: 227V+FJ Kigali</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[#d8c28f]">{t('Payment')}</p>
                    <p className="mt-1 font-serif text-xl">{t('No payment required')}</p>
                    <p className="mt-1 text-xs text-stone-300">Reserve online · Confirm directly with our team</p>
                  </div>
                </div>
                <div className="mt-7 flex flex-wrap gap-3">
                  <a
                    href="https://maps.google.com/?q=227V%2BFJ+Kigali"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-[#bda06b] px-6 py-3 text-sm font-semibold text-[#18251d] transition hover:bg-[#dfcc9f]"
                  >
                    <MapPin size={16} /> {t('Get directions')}
                  </a>
                  <a
                    href="https://wa.me/250788324736"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/15"
                  >
                    <MessageCircle size={16} /> WhatsApp +250 788 324 736
                  </a>
                </div>
              </Reveal>

              <Reveal delay={0.1}>
                <div className="overflow-hidden rounded-3xl border border-white/15 bg-[#18251d] p-2 shadow-2xl">
                  <iframe
                    title="Silent Villa Kigali Map"
                    src="https://www.google.com/maps?q=227V%2BFJ+Kigali&output=embed"
                    className="h-80 w-full rounded-2xl border-0 sm:h-96"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </Reveal>
            </div>
          </section>

          <FaqSection />
        </main>
      )}

      <footer className="border-t border-white/10 bg-[#15221a] px-4 pb-28 pt-14 text-stone-200 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <BrandLogo variant="dark" size="lg" />
              <p className="mt-5 max-w-xs text-sm leading-relaxed text-stone-300">
                Guest rooms in Kigali. Choose a room and book directly with Silent Villa.
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-[#cdb782]">Explore</p>
              <ul className="mt-5 space-y-3 text-sm text-stone-300">
                <li>
                  <Link to="/" className="transition hover:text-white">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/rooms" className="transition hover:text-white">
                    Rooms
                  </Link>
                </li>
                <li>
                  <Link to="/gallery" className="transition hover:text-white">
                    Gallery
                  </Link>
                </li>
                <li>
                  <Link to="/book" className="transition hover:text-white">
                    Book a room
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-[#cdb782]">Contact & location</p>
              <ul className="mt-5 space-y-3 text-sm text-stone-300">
                <li>KN 288 St, Kigali · 227V+FJ</li>
                <li>
                  <a href="tel:0788324736" className="transition hover:text-white">
                    0788 324 736
                  </a>
                </li>
                <li>
                  <a href="https://wa.me/250788324736" target="_blank" rel="noreferrer" className="transition hover:text-white">
                    WhatsApp
                  </a>
                </li>
                <li>
                  <a
                    href="https://maps.google.com/?q=227V%2BFJ+Kigali"
                    target="_blank"
                    rel="noreferrer"
                    className="transition hover:text-white"
                  >
                    Get directions
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-sm text-stone-400 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} Silent Villa. All rights reserved.</p>
            <div className="inline-flex items-center gap-2 text-[#cdb782]">
              <Phone size={15} />
              <a href="tel:0788324736" className="transition hover:text-white">
                Call to enquire
              </a>
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
              className="pointer-events-auto mx-auto flex max-w-lg gap-2 rounded-2xl border border-white/10 bg-[#18251d]/95 p-2 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl"
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
                className="flex min-h-14 flex-1 items-center justify-center gap-2 rounded-xl bg-[#bda06b] px-3 text-[#18251d] transition hover:bg-[#d8c28f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
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
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#15221a]/88 p-4 backdrop-blur-md"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={shouldReduceMotion ? false : { scale: 0.96, opacity: 0 }}
              animate={shouldReduceMotion ? {} : { scale: 1, opacity: 1 }}
              exit={shouldReduceMotion ? {} : { scale: 0.96, opacity: 0 }}
              className="relative w-full max-w-4xl overflow-hidden rounded-[1.75rem] border border-white/15 bg-stone-900 shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                aria-label="Close image"
                className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#18251d]/80 text-white backdrop-blur-sm transition hover:bg-[#18251d]"
                onClick={() => setSelectedImage(null)}
              >
                <X size={18} />
              </button>

              <img
                src={imageUrl(gallery[selectedImage].imageUrl)}
                alt={gallery[selectedImage].altText || gallery[selectedImage].title}
                className="h-[70vh] w-full bg-black object-contain"
              />

              <div className="flex items-center justify-between gap-4 bg-stone-950 px-5 py-3.5 text-sm text-stone-200">
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
                    className="rounded-full border border-white/15 px-3.5 py-1.5 text-xs transition hover:bg-white/10"
                    onClick={() =>
                      setSelectedImage((current) =>
                        current === null ? 0 : (current - 1 + gallery.length) % gallery.length,
                      )
                    }
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    aria-label="Next image"
                    className="rounded-full border border-white/15 px-3.5 py-1.5 text-xs transition hover:bg-white/10"
                    onClick={() =>
                      setSelectedImage((current) => (current === null ? 0 : (current + 1) % gallery.length))
                    }
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
