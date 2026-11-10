import { type ReactNode, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import {
  ArrowRight,
  Building2,
  Camera,
  HeartPulse,
  Home,
  MapPin,
  Menu,
  MessageCircle,
  Navigation,
  Phone,
  Play,
  ShieldCheck,
  Sparkles,
  Star,
  UtensilsCrossed,
  Users,
  X,
} from 'lucide-react'

const navItems = [
  { label: 'The villa', href: '/#about' },
  { label: 'Rooms', href: '/rooms' },
  { label: 'Experiences', href: '/#services' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Find us', href: '/#location' },
  { label: 'Payment', href: '/#payment' },
]

const roomOptions = [
  {
    name: 'Restful room interior',
    image: '/media/room-1.jpg',
    detail: 'A look inside one of the guest rooms at Silent Villa.',
  },
  {
    name: 'A second room view',
    image: '/media/room-2.jpg',
    detail: 'Explore another of the villa’s real room interiors.',
  },
]

const services = [
  {
    title: 'Short Stay',
    icon: Home,
    description: 'Comfortable accommodation for shorter visits and quick weekend escapes.',
  },
  {
    title: 'Long Stays',
    icon: Building2,
    description: 'Long-term stays with kitchen services and a calm, comfortable setting.',
  },
  {
    title: 'Family Stays',
    icon: Users,
    description: 'Flexible family-friendly accommodation designed for comfort, privacy, and ease.',
  },
  {
    title: 'Food & Beverages',
    icon: UtensilsCrossed,
    description: 'Simple, satisfying food and beverage options to make every stay feel cared for.',
  },
  {
    title: 'Massage & Wellness',
    icon: HeartPulse,
    description: 'Massage and wellness services to help you relax and reset.',
  },
]

const galleryImages = [
  { src: '/media/room-1.jpg', alt: 'Quiet room interior at Silent Villa', caption: 'Restful interiors' },
  { src: '/media/room-2.jpg', alt: 'Comfortable bedroom setup with warm tones', caption: 'Private comfort' },
  { src: '/media/si.jpeg', alt: 'Bedroom at Silent Villa with a comfortable bed and warm details', caption: 'A place to exhale' },
  { src: '/media/WhatsApp%20Image%202026-11-10%20at%2019.54.25.jpeg', alt: 'Pink bed and carved wooden headboard in a Silent Villa room', caption: 'A restful room' },
  { src: '/media/aaka.jpeg', alt: 'Guest room with pink bedding and a quiet, welcoming feel', caption: 'Made for a slower stay' },
]

const journeyVideo = '/media/WhatsApp%20Video%202026-11-10%20at%2019.53.06.mp4'

function RoomsPage({ onSelectImage }: { onSelectImage: (index: number) => void }) {
  return (
    <main>
      <section className="relative overflow-hidden bg-[#171712] px-4 pb-14 pt-20 text-white sm:px-6 sm:pb-20 sm:pt-28 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.32em] text-[#d9c1a0]">Silent Villa · Rooms</p>
            <div className="mt-6 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
              <h1 className="max-w-4xl font-serif text-6xl leading-[0.92] tracking-[-0.05em] sm:text-7xl lg:text-8xl">
                Make yourself<br /><span className="italic text-[#e2c89a]">at home.</span>
              </h1>
              <div className="max-w-md pb-2">
                <p className="text-base leading-relaxed text-stone-300">
                  A closer look at the rooms at Silent Villa. Browse the real photographs, then contact us to confirm the room and dates that suit you.
                </p>
                <a href="tel:0788324736" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#d4b37f] px-5 py-3 text-sm font-medium text-[#171712] transition hover:bg-[#e6ca96]">
                  <Phone size={15} /> Ask about availability <ArrowRight size={15} />
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-stone-300 pb-5">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-[#806342]">Room photography</p>
              <h2 className="mt-2 font-serif text-3xl text-stone-900 sm:text-4xl">A quiet place to return to.</h2>
            </div>
            <p className="text-sm text-stone-600">{galleryImages.length} photographs</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
            {galleryImages.map((image, index) => (
              <button
                key={image.src}
                type="button"
                onClick={() => onSelectImage(index)}
                aria-label={`View room photo: ${image.alt}`}
                className={`group relative overflow-hidden rounded-2xl bg-stone-200 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#977956] ${index === 0 ? 'sm:col-span-2 lg:col-span-4 lg:row-span-2' : 'lg:col-span-2'}`}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  className={`w-full object-cover transition duration-700 ease-out group-hover:scale-[1.03] ${index === 0 ? 'h-[340px] sm:h-[440px] lg:h-full lg:min-h-[590px]' : 'h-[260px] sm:h-[300px]'}`}
                />
                <span className="absolute inset-0 bg-gradient-to-t from-[#171712]/65 via-transparent to-transparent opacity-80 transition group-hover:opacity-100" />
                <span className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3 text-white">
                  <span>
                    <span className="block text-[10px] uppercase tracking-[0.24em] text-[#e2c89a]">Room view · 0{index + 1}</span>
                    <span className="mt-1 block font-serif text-xl sm:text-2xl">{image.caption}</span>
                  </span>
                  <span className="mb-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/40 bg-black/10 transition group-hover:bg-[#d4b37f] group-hover:text-[#171712]">
                    <ArrowRight size={15} />
                  </span>
                </span>
              </button>
            ))}
          </div>
          <p className="mt-6 text-xs leading-relaxed text-stone-500">
            Photographs show the property. Please contact Silent Villa directly to confirm room availability, rates, and specific amenities.
          </p>
        </div>
      </section>

      <section className="bg-[#efeae0] px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-[#806342]">Planning a visit?</p>
            <h2 className="mt-2 font-serif text-3xl text-stone-900">We’ll help you find the right stay.</h2>
          </div>
          <a href="tel:0788324736" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#171712] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#35332d]">
            Call Silent Villa <Phone size={15} />
          </a>
        </div>
      </section>
    </main>
  )
}

function GalleryPage({ onSelectImage }: { onSelectImage: (index: number) => void }) {
  return (
    <main>
      <section className="bg-[#f1ebdf] px-4 pb-12 pt-16 sm:px-6 sm:pb-16 sm:pt-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.32em] text-[#806342]">Silent Villa · Gallery</p>
            <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_0.55fr] lg:items-end">
              <h1 className="max-w-4xl font-serif text-6xl leading-[0.92] tracking-[-0.05em] text-stone-900 sm:text-7xl lg:text-8xl">
                A glimpse of<br /><span className="italic text-[#977956]">your stay.</span>
              </h1>
              <p className="max-w-md pb-2 text-base leading-relaxed text-stone-700">
                Explore the rooms and details in photographs from Silent Villa. Select any image to view it up close.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-7 flex items-center justify-between border-b border-stone-300 pb-4">
            <p className="text-xs uppercase tracking-[0.25em] text-[#806342]">The villa, in real life</p>
            <p className="text-sm text-stone-500">{galleryImages.length} photographs</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-12 lg:auto-rows-[230px]">
            {galleryImages.map((image, index) => (
              <button
                key={image.src}
                type="button"
                onClick={() => onSelectImage(index)}
                aria-label={`Open full-size image: ${image.alt}`}
                className={`group relative overflow-hidden rounded-2xl bg-stone-200 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#977956] ${index === 0 ? 'h-[360px] sm:col-span-2 sm:h-[440px] lg:col-span-7 lg:row-span-2 lg:h-full' : 'h-[250px] lg:col-span-5 lg:h-full'}`}
              >
                <img src={image.src} alt={image.alt} loading="lazy" className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.035]" />
                <span className="absolute inset-0 bg-gradient-to-t from-[#171712]/65 via-transparent to-transparent opacity-75 transition group-hover:opacity-100" />
                <span className="absolute bottom-4 left-4 text-white">
                  <span className="block text-[10px] uppercase tracking-[0.25em] text-[#e2c89a]">Silent Villa · 0{index + 1}</span>
                  <span className="mt-1 block font-serif text-2xl">{image.caption}</span>
                </span>
              </button>
            ))}
          </div>
          <div className="mt-12 flex flex-col gap-4 border-t border-stone-300 pt-7 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-serif text-2xl text-stone-800">Seen enough to imagine your stay?</p>
            <a href="tel:0788324736" className="inline-flex items-center gap-2 text-sm font-medium text-stone-900 transition hover:text-[#806342]">
              Contact the villa <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>
    </main>
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

function App() {
  const location = useLocation()
  const currentPath = location.pathname.replace(/\/+$/, '') || '/'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<number | null>(null)
  const [journeyStarted, setJourneyStarted] = useState(false)
  const [journeyError, setJourneyError] = useState('')
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  const journeyVideoRef = useRef<HTMLVideoElement>(null)
  const shouldReduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll()
  const scrollProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 })

  const playJourney = async () => {
    const video = journeyVideoRef.current
    if (!video) return

    setJourneyError('')
    try {
      await video.play()
    } catch {
      setJourneyError('The video could not start. Use the player controls to try again.')
    }
  }

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
    if (selectedImage === null) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedImage(null)
      if (event.key === 'ArrowRight') {
        setSelectedImage((current) => (current === null ? 0 : (current + 1) % galleryImages.length))
      }
      if (event.key === 'ArrowLeft') {
        setSelectedImage((current) => (current === null ? 0 : (current - 1 + galleryImages.length) % galleryImages.length))
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedImage])

  return (
    <div className="min-h-screen bg-[#f5f1ea] text-stone-900">
      <motion.div
        className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-[#c4a16d]"
        style={{ scaleX: scrollProgress }}
        aria-hidden="true"
      />
      <header className={`sticky top-0 z-50 border-b border-white/10 bg-[#171712]/90 backdrop-blur-xl transition-shadow duration-300 ${isScrolled ? 'shadow-[0_12px_35px_rgba(0,0,0,0.2)]' : ''}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3" aria-label="Silent Villa home" onClick={() => setMobileMenuOpen(false)}>
            <div className="brand-mark flex h-11 w-11 items-center justify-center rounded-full border border-[#d4b37f]/70 text-sm font-semibold text-[#f5e7cc]">
              <span>SV</span>
            </div>
            <div>
              <p className="font-serif text-lg leading-tight tracking-wide text-white">Silent Villa</p>
              <p className="mt-0.5 text-[10px] uppercase tracking-[0.22em] text-[#d9c1a0]">Where comfort meets silence</p>
            </div>
          </Link>

          <nav aria-label="Main navigation" className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                aria-current={
                  (item.href === '/rooms' && currentPath === '/rooms') ||
                  (item.href === '/gallery' && currentPath === '/gallery') ||
                  (item.href.startsWith('/#') && currentPath === '/' && activeSection === item.href.slice(2))
                    ? 'page'
                    : undefined
                }
                className={`nav-link relative rounded-full px-3 py-2 text-[13px] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d4b37f] ${
                  (item.href === '/rooms' && currentPath === '/rooms') ||
                  (item.href === '/gallery' && currentPath === '/gallery') ||
                  (item.href.startsWith('/#') && currentPath === '/' && activeSection === item.href.slice(2))
                    ? 'text-[#f2ddb5]'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <a href="tel:0788324736" className="inline-flex items-center gap-2 rounded-full bg-[#d4b37f] px-5 py-2.5 text-sm font-medium text-[#171712] transition duration-300 hover:bg-[#e6ca96] hover:shadow-[0_8px_24px_rgba(212,179,127,0.2)]">
              Call to enquire <Phone size={15} />
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
                      (item.href === '/rooms' && currentPath === '/rooms') ||
                      (item.href === '/gallery' && currentPath === '/gallery') ||
                      (item.href.startsWith('/#') && currentPath === '/' && activeSection === item.href.slice(2))
                        ? 'page'
                        : undefined
                    }
                    className={`rounded-full px-4 py-3 text-sm transition ${
                      (item.href === '/rooms' && currentPath === '/rooms') ||
                      (item.href === '/gallery' && currentPath === '/gallery') ||
                      (item.href.startsWith('/#') && currentPath === '/' && activeSection === item.href.slice(2))
                        ? 'bg-white/10 text-[#f2ddb5]'
                        : 'text-stone-200 hover:bg-white/5'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                <a href="tel:0788324736" className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-[#d4b37f] px-4 py-3 text-sm font-medium text-[#171712]" onClick={() => setMobileMenuOpen(false)}>
                  Call to enquire <Phone size={15} />
                </a>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {currentPath === '/rooms' ? (
        <RoomsPage onSelectImage={setSelectedImage} />
      ) : currentPath === '/gallery' ? (
        <GalleryPage onSelectImage={setSelectedImage} />
      ) : (
      <main>
        <section id="home" className="relative isolate min-h-[78svh] overflow-hidden bg-[#171712] text-white sm:min-h-[82svh]">
          <video
            className="absolute inset-0 z-[-2] h-full w-full object-cover"
            autoPlay={!shouldReduceMotion}
            loop
            muted
            playsInline
            preload="metadata"
            aria-hidden="true"
          >
            <source src={journeyVideo} type="video/mp4" />
          </video>
          <div className="absolute inset-0 z-0 bg-[#171712]/70" />
          <div className="absolute inset-0 z-0 bg-gradient-to-r from-[#171712]/75 via-[#171712]/55 to-[#171712]/40" />
          <div className="relative z-10 mx-auto flex min-h-[78svh] max-w-7xl items-center px-4 py-16 sm:min-h-[82svh] sm:px-6 sm:py-20 lg:px-8">
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
              animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
              transition={{ duration: 0.75, ease: 'easeOut' }}
              className="max-w-3xl"
            >
              <div className="mb-7 flex flex-wrap items-center gap-x-5 gap-y-3">
                <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-[#e2c89a]">
                  <Sparkles size={13} />
                  Guest house · Kigali
                </span>
                <span className="inline-flex items-center gap-1.5 border-l border-white/20 pl-5 text-xs text-stone-300">
                  <Star size={13} className="fill-[#d4b37f] text-[#d4b37f]" />
                  <span className="font-medium text-white">5.0</span>
                  <span>· 1 review</span>
                </span>
              </div>
              <h1 className="max-w-2xl font-serif text-6xl leading-[0.9] tracking-[-0.055em] sm:text-7xl lg:text-[92px]">
                Find your<br />
                <span className="italic text-[#e2c89a]">quiet place.</span>
              </h1>
              <p className="mt-6 font-serif text-2xl text-[#f0dfc0] sm:text-3xl">
                Silent Villa, Kigali
              </p>
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-stone-300 sm:text-base">
                A peaceful escape where comfort meets calm. Settle into a quiet, welcoming space made for rest and refreshment.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#contact"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#d4b37f] px-6 py-3 text-sm font-medium text-[#1b1b17] transition hover:bg-[#e2c89a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e2c89a]"
                >
                  Enquire about a stay
                  <ArrowRight size={16} />
                </a>
                <Link
                  to="/rooms"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-medium text-white transition hover:border-white/40 hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e2c89a]"
                >
                  Explore rooms
                  <ArrowRight size={16} />
                </Link>
              </div>
              <div className="mt-9 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-stone-400">
                <MapPin size={14} className="text-[#d4b37f]" />
                KN 288 St · Kigali, Rwanda
              </div>
            </motion.div>
          </div>
        </section>

        <section id="about" className="px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[1fr_0.92fr] lg:items-center lg:gap-24">
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
              whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6 }}
            >
              <p className="mb-5 text-xs font-medium uppercase tracking-[0.35em] text-[#7d644d]">A slower kind of stay</p>
              <h2 className="max-w-xl font-serif text-5xl leading-[1.02] tracking-[-0.04em] text-stone-900 sm:text-6xl">Space to settle.<br /><span className="italic text-[#977956]">Room to breathe.</span></h2>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-stone-700">
                Welcome to Silent Villa, a peaceful escape where comfort meets calm. Enjoy your stay in a quiet, relaxing environment designed for rest and refreshment.
              </p>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-stone-700">
                Escape the noise of the city and discover true comfort. Every detail is designed for relaxation, privacy, and peace of mind — your perfect home away from home in Kigali.
              </p>
              <div className="mt-10 flex flex-wrap gap-x-8 gap-y-4 border-t border-stone-300 pt-6">
                {[
                  { label: 'Calm surroundings', value: '01' },
                  { label: 'Warm hospitality', value: '02' },
                  { label: 'A Kigali welcome', value: '03' },
                ].map((item) => (
                  <div key={item.value} className="flex items-center gap-3">
                    <span className="font-serif text-sm italic text-[#977956]">{item.value}</span>
                    <p className="text-sm text-stone-700">{item.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.97 }}
              whileInView={shouldReduceMotion ? {} : { opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6 }}
              className="relative mx-auto w-full max-w-[540px] pb-5 pr-5 lg:mr-0"
            >
              <div className="absolute inset-5 rounded-[1.5rem] border border-[#bca47f]/55" />
              <div className="relative overflow-hidden rounded-[1.5rem] bg-stone-200 shadow-[0_24px_60px_rgba(30,25,18,0.12)]">
                <img
                  src="/media/WhatsApp%20Image%202026-11-10%20at%2019.54.25.jpeg"
                  alt="Pink bed and carved wooden headboard in a Silent Villa room"
                  loading="lazy"
                  className="h-[420px] w-full object-cover object-center sm:h-[560px]"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#171712]/80 via-[#171712]/25 to-transparent px-5 pb-5 pt-20 sm:px-7 sm:pb-7">
                  <div className="flex items-end justify-between gap-4 text-white">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.25em] text-[#e2c89a]">The Silent Villa feeling</p>
                      <p className="mt-2 font-serif text-2xl sm:text-3xl">A little more room for calm.</p>
                    </div>
                    <div className="hidden shrink-0 rounded-full border border-white/40 p-3 text-[#f0dfc0] sm:block">
                      <ShieldCheck size={20} strokeWidth={1.5} />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section id="rooms" className="bg-[#efeae0] px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.35em] text-[#7d644d]">Your room to unwind</p>
                <h2 className="mt-4 max-w-2xl font-serif text-5xl leading-[1.02] tracking-[-0.04em] text-stone-900 sm:text-6xl">Rest comes naturally here.</h2>
              </div>
              <div className="flex flex-wrap gap-5">
                <Link to="/rooms" className="inline-flex items-center gap-2 text-sm font-medium text-stone-900 transition hover:text-[#806342]">
                  View all rooms <ArrowRight size={16} />
                </Link>
                <a href="tel:0788324736" className="inline-flex items-center gap-2 text-sm font-medium text-stone-900 transition hover:text-[#806342]">
                  Ask about a room <Phone size={15} />
                </a>
              </div>
            </div>

            <div className="grid gap-7 md:grid-cols-2">
              {roomOptions.map((room, index) => (
                <motion.article
                  key={room.name}
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
                  whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ delay: index * 0.08, duration: 0.45 }}
                  className={`group overflow-hidden ${index === 1 ? 'md:mt-16' : ''}`}
                >
                  <div className="relative overflow-hidden rounded-[1.5rem] bg-stone-200">
                    <img src={room.image} alt={room.detail} loading="lazy" className={`w-full object-cover transition duration-700 ease-out group-hover:scale-[1.035] ${index === 0 ? 'h-[340px] sm:h-[440px]' : 'h-[340px] sm:h-[400px]'}`} />
                    <span className="absolute bottom-4 left-4 rounded-full border border-white/30 bg-[#171712]/65 px-3 py-1.5 text-[10px] uppercase tracking-[0.25em] text-white backdrop-blur-md">
                      Silent Villa · Room photograph
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-6 px-1 pt-5">
                    <div>
                      <h3 className="font-serif text-3xl text-stone-900">{room.name}</h3>
                      <p className="mt-2 max-w-sm text-sm leading-relaxed text-stone-600">{room.detail}</p>
                    </div>
                    <a href="tel:0788324736" aria-label={`Call to ask about ${room.name}`} className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-stone-300 transition group-hover:border-[#171712] group-hover:bg-[#171712] group-hover:text-white">
                      <ArrowRight size={16} />
                    </a>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section id="services" className="px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <Reveal className="lg:sticky lg:top-36 lg:self-start">
              <p className="text-xs font-medium uppercase tracking-[0.35em] text-[#7d644d]">Made for your kind of stay</p>
              <h2 className="mt-5 font-serif text-5xl leading-[1.02] tracking-[-0.04em] text-stone-900 sm:text-6xl">Stay a night.<br /><span className="italic text-[#977956]">Stay a while.</span></h2>
              <p className="mt-6 max-w-md text-base leading-relaxed text-stone-700">
                Whether you are visiting briefly or making Kigali home for a little longer, Silent Villa offers a welcoming place to slow down.
              </p>
              <a href="tel:0788324736" className="mt-8 inline-flex items-center gap-3 text-sm font-medium text-stone-900">
                Talk to our team <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#171712] text-white"><ArrowRight size={15} /></span>
              </a>
            </Reveal>

            <div className="border-t border-stone-300">
              {services.map(({ title, icon: Icon, description }, index) => (
                <Reveal key={title} delay={index * 0.045}>
                  <article className="group grid grid-cols-[44px_1fr_auto] items-start gap-4 border-b border-stone-300 py-6 sm:grid-cols-[56px_1fr_auto] sm:gap-6 sm:py-7">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full border border-stone-300 text-[#806342] transition duration-300 group-hover:border-[#171712] group-hover:bg-[#171712] group-hover:text-[#f2ddb5]">
                      <Icon size={18} strokeWidth={1.6} />
                    </span>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-[#806342]">0{index + 1} / Service</p>
                      <h3 className="mt-1 font-serif text-2xl text-stone-900 sm:text-3xl">{title}</h3>
                      <p className="mt-2 max-w-lg text-sm leading-relaxed text-stone-600">{description}</p>
                    </div>
                    <ArrowRight size={17} className="mt-3 text-stone-400 transition duration-300 group-hover:translate-x-1 group-hover:text-stone-900" />
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="journey" className="overflow-hidden bg-[#171712] px-4 py-20 text-white sm:px-6 sm:py-28 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-end lg:gap-16">
              <Reveal>
                <p className="text-xs font-medium uppercase tracking-[0.35em] text-[#d9c1a0]">Before you arrive</p>
                <h2 className="mt-5 font-serif text-5xl leading-[1.02] tracking-[-0.04em] sm:text-6xl">The journey is part of the stay.</h2>
              </Reveal>
              <Reveal delay={0.1}>
                <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                  <p className="max-w-md text-base leading-relaxed text-stone-300">
                    See the approach to Silent Villa before you set off, then open directions for your arrival in Kigali.
                  </p>
                  <a href="https://maps.google.com/?q=227V%2BFJ+Kigali" target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center gap-2 text-sm text-[#f0dfc0] transition hover:text-white">
                    Get directions <ArrowRight size={15} />
                  </a>
                </div>
              </Reveal>
            </div>

            <Reveal>
              <div className="group relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#090908] shadow-[0_30px_90px_rgba(0,0,0,0.35)]">
                <video
                  ref={journeyVideoRef}
                  className="aspect-video max-h-[680px] w-full bg-black object-contain"
                  controls={journeyStarted || Boolean(journeyError)}
                  playsInline
                  preload="metadata"
                  poster="/media/WhatsApp%20Image%202026-11-10%20at%2019.54.25.jpeg"
                  aria-label="Journey video to Silent Villa"
                  onPlay={() => setJourneyStarted(true)}
                  onError={() => setJourneyError('The journey video could not be loaded. Please try again later.')}
                >
                  <source src={journeyVideo} type="video/mp4" />
                  Your browser does not support video playback.
                </video>
                {!journeyStarted && !journeyError && (
                  <button
                    type="button"
                    onClick={playJourney}
                    className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gradient-to-t from-black/50 via-black/10 to-black/20 text-white transition hover:from-black/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#d4b37f]"
                    aria-label="Play the journey video to Silent Villa"
                  >
                    <span className="flex h-20 w-20 items-center justify-center rounded-full border border-white/50 bg-[#d4b37f] text-[#171712] shadow-[0_10px_45px_rgba(0,0,0,0.35)] transition duration-300 group-hover:scale-105 group-hover:bg-[#e6ca96]">
                      <Play size={28} fill="currentColor" className="ml-1" />
                    </span>
                    <span className="rounded-full border border-white/20 bg-[#171712]/65 px-5 py-2 text-xs font-medium uppercase tracking-[0.2em] backdrop-blur-md">
                      Play the journey
                    </span>
                  </button>
                )}
                {journeyError && (
                  <p role="alert" className="absolute bottom-4 left-4 right-4 rounded-lg bg-[#171712]/90 px-4 py-3 text-center text-sm text-white">
                    {journeyError}
                  </p>
                )}
              </div>
            </Reveal>
          </div>
        </section>

        <section id="gallery" className="px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.35em] text-[#7d644d]">A glimpse inside</p>
                <h2 className="mt-4 max-w-2xl font-serif text-5xl leading-[1.02] tracking-[-0.04em] text-stone-900 sm:text-6xl">Made for the moments in between.</h2>
              </div>
              <div className="inline-flex items-center gap-2 text-sm text-stone-600">
                <Camera size={16} />
                Explore the rooms
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-12 md:grid-rows-[260px_260px_230px]">
              {galleryImages.map((image, index) => (
                <button
                  key={`${image.src}-${index}`}
                  type="button"
                  aria-label={`Open ${image.alt}`}
                  onClick={() => setSelectedImage(index)}
                  className={`group relative overflow-hidden rounded-[1.5rem] bg-stone-200 text-left ${index === 0 ? 'md:col-span-7 md:row-span-2' : index < 3 ? 'md:col-span-5' : 'md:col-span-6'} ${index === 0 ? 'h-[360px] md:h-full' : 'h-[250px] md:h-full'}`}
                >
                  <img src={image.src} alt={image.alt} loading="lazy" className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.035]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#171712]/75 via-transparent to-transparent opacity-90 transition group-hover:opacity-100" />
                  <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                    <p className="text-[10px] uppercase tracking-[0.25em] text-[#e2c89a]">Silent Villa · 0{index + 1}</p>
                    <p className="mt-2 font-serif text-2xl sm:text-3xl">{image.caption}</p>
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-8 flex justify-end">
              <Link to="/gallery" className="inline-flex items-center gap-2 rounded-full border border-stone-300 px-5 py-3 text-sm font-medium text-stone-900 transition hover:border-stone-900 hover:bg-stone-900 hover:text-white">
                Explore the full gallery <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        <section id="location" className="bg-[#f1ebdf] px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-20">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.35em] text-[#7d644d]">Find your way</p>
              <h2 className="mt-5 font-serif text-5xl leading-[1.02] tracking-[-0.04em] text-stone-900 sm:text-6xl">A Kigali welcome awaits.</h2>
              <p className="mt-5 max-w-lg text-lg text-stone-700">
                Find Silent Villa on KN 288 St in Kigali, or use its Google Maps Plus Code to navigate directly.
              </p>
              <div className="mt-8 border-y border-stone-300 py-5">
                <div className="flex items-start gap-4">
                  <MapPin className="mt-1 shrink-0 text-[#806342]" size={20} strokeWidth={1.6} />
                  <div>
                    <p className="font-medium text-stone-900">Silent Villa Guest House</p>
                    <p className="mt-1 text-sm text-stone-600">KN 288 St, Kigali</p>
                    <p className="mt-1 text-sm text-stone-600">227V+FJ Kigali</p>
                  </div>
                </div>
              </div>
              <a href="https://maps.google.com/?q=227V%2BFJ+Kigali" target="_blank" rel="noreferrer" className="mt-7 inline-flex items-center gap-3 rounded-full bg-[#171712] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#35332d]">
                <Navigation size={16} /> Get directions <ArrowRight size={15} />
              </a>
            </div>

            <a
              href="https://maps.google.com/?q=227V%2BFJ+Kigali"
              target="_blank"
              rel="noreferrer"
              aria-label="Open directions to Silent Villa in Google Maps"
              className="group relative flex min-h-[380px] flex-col justify-between overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#1d1c1a] p-7 text-white sm:min-h-[500px] sm:p-10"
            >
              <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full border border-[#d4b37f]/20 transition duration-700 group-hover:scale-110" />
              <div className="pointer-events-none absolute -right-9 -top-9 h-52 w-52 rounded-full border border-[#d4b37f]/20" />
              <div className="pointer-events-none absolute -bottom-28 -left-20 h-72 w-72 rounded-full border border-white/10" />
              <div className="relative flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-[0.3em] text-[#d9c1a0]">Your destination</span>
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[#d4b37f]/50 text-[#e2c89a] transition group-hover:bg-[#d4b37f] group-hover:text-[#171712]">
                  <MapPin size={20} strokeWidth={1.5} />
                </span>
              </div>
              <div className="relative py-12">
                <p className="text-xs uppercase tracking-[0.3em] text-stone-400">Kigali · Rwanda</p>
                <p className="mt-4 break-words font-serif text-5xl leading-none tracking-[-0.04em] text-white sm:text-7xl">227V+FJ</p>
                <p className="mt-4 text-sm text-stone-300">KN 288 St, Kigali</p>
              </div>
              <div className="relative flex items-center justify-between border-t border-white/15 pt-5">
                <span className="text-sm text-stone-300">Open the location in Google Maps</span>
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d4b37f] text-[#171712] transition group-hover:translate-x-1">
                  <ArrowRight size={17} />
                </span>
              </div>
            </a>
          </div>
        </section>

        <section id="payment" className="px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#171712] shadow-[0_26px_60px_rgba(17,17,17,0.12)]">
            <div className="grid lg:grid-cols-[0.8fr_1.2fr]">
              <div className="flex flex-col justify-between p-7 sm:p-10">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.35em] text-[#d9c1a0]">Payment</p>
                  <h2 className="mt-5 font-serif text-4xl leading-tight text-white sm:text-5xl">A simple way to pay.</h2>
                  <p className="mt-4 max-w-sm text-sm leading-relaxed text-stone-300">
                    Use the Silent Villa USSD code to make your payment. Please confirm the amount directly with the guest house.
                  </p>
                </div>
                <a href="tel:0788324736" className="mt-8 inline-flex items-center gap-2 text-sm text-[#e2c89a] transition hover:text-white">
                  Questions? Call 0788 324 736 <ArrowRight size={15} />
                </a>
              </div>

              <div className="relative flex min-h-64 flex-col justify-center overflow-hidden border-t border-white/10 bg-[#24221d] p-7 sm:p-10 lg:border-l lg:border-t-0">
                <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full border border-[#d4b37f]/15" />
                <div className="pointer-events-none absolute -right-2 -top-10 h-44 w-44 rounded-full border border-[#d4b37f]/15" />
                <div className="relative">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-stone-400">Dial this USSD code</p>
                  <p className="mt-5 break-all font-serif text-4xl leading-tight tracking-wide text-[#f0dfc0] sm:text-5xl md:text-6xl">
                    *182*8*1*23000737#
                  </p>
                  <div className="mt-7 flex items-start gap-3 border-t border-white/10 pt-5 text-sm leading-relaxed text-stone-300">
                    <ShieldCheck size={18} className="mt-0.5 shrink-0 text-[#d4b37f]" />
                    <p>Manual USSD payment. This website does not process payments automatically.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="bg-[#efeae0] px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.35em] text-[#7d644d]">A warm welcome starts here</p>
              <h2 className="mt-5 font-serif text-5xl leading-[1.02] tracking-[-0.04em] text-stone-900 sm:text-6xl">We’re here to help you feel at home.</h2>
              <p className="mt-5 max-w-md text-base leading-relaxed text-stone-700">
                Speak with Silent Villa directly about your stay, directions, or any questions before you arrive.
              </p>
              <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-stone-300 bg-[#f7f3eb] px-4 py-2 text-sm text-stone-700">
                <span className="flex items-center gap-1 text-[#9b7545]"><Star size={14} fill="currentColor" /> 5.0</span>
                <span className="h-4 w-px bg-stone-300" />
                <span>Guest house · Kigali</span>
              </div>
            </div>

            <div className="divide-y divide-stone-300 border-y border-stone-300">
              {[
                { title: 'Call the villa', value: '0788 324 736', icon: Phone, href: 'tel:0788324736', action: 'Call now' },
                { title: 'WhatsApp', value: 'Start a conversation', icon: MessageCircle, href: 'https://wa.me/250788324736', action: 'Message us' },
                { title: 'Visit Silent Villa', value: 'KN 288 St, Kigali · 227V+FJ', icon: MapPin, href: 'https://maps.google.com/?q=227V%2BFJ+Kigali', action: 'Get directions' },
              ].map(({ title, value, icon: Icon, href, action }) => (
                <a key={title} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noreferrer' : undefined} className="group flex items-center gap-4 py-5 transition sm:gap-6 sm:py-6">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-stone-300 text-[#806342] transition duration-300 group-hover:border-[#171712] group-hover:bg-[#171712] group-hover:text-[#f2ddb5]">
                    <Icon size={19} strokeWidth={1.6} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[10px] uppercase tracking-[0.22em] text-[#806342]">{title}</span>
                    <span className="mt-1 block text-base font-medium text-stone-900 sm:text-lg">{value}</span>
                  </span>
                  <span className="inline-flex shrink-0 items-center gap-2 text-xs text-stone-500 transition group-hover:text-stone-900">
                    <span className="hidden sm:inline">{action}</span>
                    <ArrowRight size={16} className="transition group-hover:translate-x-1" />
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>
      )}

      <footer className="border-t border-stone-200 bg-[#171712] px-4 py-12 text-stone-200 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr_1fr_1fr]">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#d4b37f] bg-[#f7efe3] text-sm font-semibold text-[#1b1b17]">
                  SV
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.32em] text-[#d9c1a0]">Silent Villa</p>
                  <p className="text-sm text-stone-200">Where comfort meets silence.</p>
                </div>
              </div>
              <p className="mt-5 max-w-xs text-sm leading-relaxed text-stone-300">
                A peaceful escape where comfort meets calm — designed for rest, privacy, and warm hospitality in Kigali.
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-[#d9c1a0]">Explore</p>
              <ul className="mt-5 space-y-3 text-sm text-stone-300">
                <li><Link to="/" className="transition hover:text-white">Home</Link></li>
                <li><Link to="/#about" className="transition hover:text-white">About</Link></li>
                <li><Link to="/rooms" className="transition hover:text-white">Rooms</Link></li>
                <li><Link to="/#services" className="transition hover:text-white">Services</Link></li>
                <li><Link to="/gallery" className="transition hover:text-white">Gallery</Link></li>
              </ul>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-[#d9c1a0]">Visit</p>
              <ul className="mt-5 space-y-3 text-sm text-stone-300">
                <li>KN 288 St, Kigali</li>
                <li>227V+FJ Kigali</li>
                <li><a href="https://maps.google.com/?q=KN+288+St,+Kigali" target="_blank" rel="noreferrer" className="transition hover:text-white">Directions</a></li>
              </ul>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-[#d9c1a0]">Contact</p>
              <ul className="mt-5 space-y-3 text-sm text-stone-300">
                <li><a href="tel:0788324736" className="transition hover:text-white">0788 324 736</a></li>
                <li><a href="https://wa.me/250788324736" target="_blank" rel="noreferrer" className="transition hover:text-white">WhatsApp</a></li>
                <li><Link to="/#contact" className="transition hover:text-white">Enquire about a stay</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-sm text-stone-400 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} Silent Villa. All rights reserved.</p>
            <div className="inline-flex items-center gap-2 text-[#d9c1a0]">
              <Phone size={15} />
              <a href="tel:0788324736" className="transition hover:text-white">Call to enquire</a>
            </div>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {selectedImage !== null && (
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0 }}
            animate={shouldReduceMotion ? {} : { opacity: 1 }}
            exit={shouldReduceMotion ? {} : { opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label="Photo gallery"
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#171712]/85 p-4 backdrop-blur-sm"
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
                className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#171712]/70 text-white backdrop-blur-sm"
                onClick={() => setSelectedImage(null)}
              >
                <X size={18} />
              </button>

              <img src={galleryImages[selectedImage].src} alt={galleryImages[selectedImage].alt} className="h-[70vh] w-full object-cover" />

              <div className="flex items-center justify-between gap-4 bg-stone-950 px-5 py-3 text-sm text-stone-200">
                <p>{galleryImages[selectedImage].caption}</p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label="Previous image"
                    className="rounded-full border border-white/10 px-3 py-1.5"
                    onClick={() => setSelectedImage((current) => (current === null ? 0 : (current - 1 + galleryImages.length) % galleryImages.length))}
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    aria-label="Next image"
                    className="rounded-full border border-white/10 px-3 py-1.5"
                    onClick={() => setSelectedImage((current) => (current === null ? 0 : (current + 1) % galleryImages.length))}
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

export default App
