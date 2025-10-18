import React, {
  useRef,
  useState,
  useMemo,
  useCallback,
  useEffect,
} from "react";
import Link from 'next/link'


// Define the properties for each slide item, now including video and product data
interface SlideItem {
  id: number;
  videoUrl: string; // Placeholder for the video source
  productName: string;
  price: string;
  oldPrice?: string; // Optional original price for showing discounts
  discount?: string; // Optional discount percentage
  productImageUrl: string; // Small image for the product card below
  href: string; // destination path for Next.js Link
  colors?: string[];
}

// Extended interface to include the current index in the infinite array
interface IndexedSlideItem extends SlideItem {
  key: string;
  // NOTE: Changed 'index' to 'arrayIndex' for clarity and to match implementation logic
  arrayIndex: number;
}

// --- Video Slider Component (ImageSlider) ---
const ImageSlider: React.FC = () => {
  // Ensure any provided YouTube embed URL is always muted and looped
  const ensureYouTubeMuted = useCallback((src: string): string => {
    try {
      const u = new URL(src);
      if (u.hostname.includes('youtube.com')) {
        const sp = u.searchParams;
        sp.set('autoplay', '1');
        sp.set('mute', '1');
        sp.set('controls', '0');
        sp.set('playsinline', '1');
        sp.set('loop', '1');
        sp.set('rel', '0');
        sp.set('modestbranding', '1');
        sp.set('enablejsapi', '1');
        if (!sp.get('playlist')) {
          const parts = u.pathname.split('/');
          const vid = parts[parts.length - 1] || '';
          if (vid) sp.set('playlist', vid);
        }
        u.search = sp.toString();
        return u.toString();
      }
    } catch {}
    // Fallback: at least append mute=1
    return src.includes('mute=1') ? src : `${src}${src.includes('?') ? '&' : '?'}mute=1`;
  }, []);
  // Static showcase data, will be replaced with real links later
  const slides = useMemo<SlideItem[]>(() => ([
    {
      id: 1,
      // YT Shorts: 8om21YNqiM4
      videoUrl: 'https://www.youtube.com/embed/8om21YNqiM4?autoplay=1&mute=1&controls=0&playsinline=1&loop=1&rel=0&modestbranding=1&playlist=8om21YNqiM4',
      productName: 'Heritage Duffel',
      price: '₹24,999',
      productImageUrl: 'https://placehold.co/400x400/1f1f1f/ffffff?text=Duffel',
      href: '/leather-goods/bags/duffel',
      colors: ['#000000', '#7f5539', '#a7825e'],
    },
    {
      id: 2,
      // YT Shorts: ltkt0CBVSQA
      videoUrl: 'https://www.youtube.com/embed/ltkt0CBVSQA?autoplay=1&mute=1&controls=0&playsinline=1&loop=1&rel=0&modestbranding=1&playlist=ltkt0CBVSQA',
      productName: 'Signature Tote',
      price: '₹18,499',
      productImageUrl: 'https://placehold.co/400x400/262626/ffffff?text=Tote',
      href: '/leather-goods/bags/tote',
      colors: ['#3a3a3a', '#d4af37', '#ffffff'],
    },
    {
      id: 3,
      // YT Shorts: D2wbl79T-yQ
      videoUrl: 'https://www.youtube.com/embed/D2wbl79T-yQ?autoplay=1&mute=1&controls=0&playsinline=1&loop=1&rel=0&modestbranding=1&playlist=D2wbl79T-yQ',
      productName: 'Weekender Pack',
      price: '₹21,299',
      productImageUrl: 'https://placehold.co/400x400/2f2f2f/ffffff?text=Weekender',
      href: '/leather-goods/bags/weekender',
      colors: ['#1e1e1e', '#8b5a2b', '#c0c0c0'],
    },
    {
      id: 4,
      // YT Shorts: zzlVaq2_Q4I
      videoUrl: 'https://www.youtube.com/embed/zzlVaq2_Q4I?autoplay=1&mute=1&controls=0&playsinline=1&loop=1&rel=0&modestbranding=1&playlist=zzlVaq2_Q4I',
      productName: 'Explorer Backpack',
      price: '₹19,999',
      productImageUrl: 'https://placehold.co/400x400/353535/ffffff?text=Explorer',
      href: '/leather-goods/bags/backpack',
      colors: ['#2c2c2c', '#a67c52', '#f5f5dc'],
    },
    {
      id: 5,
      // YT Shorts: 672MZqurQm8
      videoUrl: 'https://www.youtube.com/embed/672MZqurQm8?autoplay=1&mute=1&controls=0&playsinline=1&loop=1&rel=0&modestbranding=1&playlist=672MZqurQm8',
      productName: 'Classic Briefcase',
      price: '₹27,499',
      productImageUrl: 'https://placehold.co/400x400/404040/ffffff?text=Briefcase',
      href: '/leather-goods/bags/briefcase',
      colors: ['#1a1a1a', '#b87333', '#d7cec7'],
    },
    {
      id: 6,
      // YT Shorts: 0CaKnwBcD4Y
      videoUrl: 'https://www.youtube.com/embed/0CaKnwBcD4Y?autoplay=1&mute=1&controls=0&playsinline=1&loop=1&rel=0&modestbranding=1&playlist=0CaKnwBcD4Y',
      productName: 'Daytrip Sling',
      price: '₹14,299',
      productImageUrl: 'https://placehold.co/400x400/444444/ffffff?text=Sling',
      href: '/leather-goods/bags/sling',
      colors: ['#1f1f1f', '#6f4e37', '#f3f0ea'],
    },
  ]), [])

  const trackRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(() => (slides.length ? slides.length : 0));
  const [isTransitioning, setIsTransitioning] = useState(true);

  // --- Configuration Constants (Video Slider) ---
  const ITEM_GAP = 25; // px between items
  // Base dimensions requested for large screens
  const BASE_CARD_WIDTH = 318;
  const BASE_VIDEO_HEIGHT = 503;
  const [itemWidth, setItemWidth] = useState(BASE_CARD_WIDTH);
  const [itemHeight, setItemHeight] = useState(BASE_VIDEO_HEIGHT);
   const TRANSITION_DURATION_MS = 450; // Transition duration for slider
  const AUTOSCROLL_DURATION_MS = 2500; // Slower scroll for better video viewing

  useEffect(() => {
    // Force all videos in the slider to autoplay and remain playing
    const container = trackRef.current;
    if (!container) return;
    const vids = Array.from(container.querySelectorAll('video')) as HTMLVideoElement[];
    const ensurePlay = (v: HTMLVideoElement) => {
      try {
        v.muted = true;
        // Some browsers require calling play() after a user gesture; we try anyway
        const p = v.play();
        if (p && typeof p.catch === 'function') p.catch(() => {});
      } catch {}
    };
    vids.forEach((v) => {
      ensurePlay(v);
      const onPause = () => ensurePlay(v);
      const onSuspend = () => ensurePlay(v);
      const onStalled = () => ensurePlay(v);
      v.addEventListener('pause', onPause);
      v.addEventListener('suspend', onSuspend);
      v.addEventListener('stalled', onStalled);
      // cleanup for each video
      (v as any).__handlers = { onPause, onSuspend, onStalled };
    });
    const onVis = () => { if (document.visibilityState === 'visible') vids.forEach(ensurePlay); };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      vids.forEach((v) => {
        const h = (v as any).__handlers;
        if (h) {
          v.removeEventListener('pause', h.onPause);
          v.removeEventListener('suspend', h.onSuspend);
          v.removeEventListener('stalled', h.onStalled);
        }
      });
    };
  }, [slides.length]);

  useEffect(() => {
    const updateSizes = () => {
      if (typeof window === 'undefined') return
      const cw = scrollerRef.current?.clientWidth ?? window.innerWidth
      let visibleCount: number
      if (cw < 640) visibleCount = 1.5
      else if (cw < 1024) visibleCount = 2
      else if (cw < 1280) visibleCount = 3
      else visibleCount = 4

      let targetWidth: number
      if (cw >= 1280) {
        // Fixed width on large screens as requested
        targetWidth = BASE_CARD_WIDTH
      } else {
        const totalGap = ITEM_GAP * (visibleCount - 1)
        const available = Math.max(cw - totalGap, 0)
        targetWidth = Math.floor(available / visibleCount)
        // Never exceed the base card width to keep look consistent
        targetWidth = Math.min(targetWidth, BASE_CARD_WIDTH)
      }

      setItemWidth(targetWidth)
      // Scale video height proportionally from the base height
      const scaledHeight = Math.round(BASE_VIDEO_HEIGHT * (targetWidth / BASE_CARD_WIDTH))
  setItemHeight(scaledHeight)
    }

    updateSizes()
    window.addEventListener('resize', updateSizes)
    return () => window.removeEventListener('resize', updateSizes)
  }, [])

  const loopSlides: IndexedSlideItem[] = useMemo(() => {
    if (!slides.length) return []
    const copies = 3
    const duplicated: IndexedSlideItem[] = []
    for (let copy = 0; copy < copies; copy += 1) {
      slides.forEach((slide, idx) => {
        duplicated.push({
          ...slide,
          key: `copy-${copy}-${idx}-${slide.id}`,
          arrayIndex: copy * slides.length + idx,
        })
      })
    }
    return duplicated
  }, [slides])

  useEffect(() => {
    if (!slides.length) {
      setCurrentIndex(0)
    } else {
      setCurrentIndex(slides.length)
    }
  }, [slides.length])

  const stepSize = itemWidth + ITEM_GAP

  const goToNext = useCallback(() => {
    if (!loopSlides.length) return
    setIsTransitioning(true)
    setCurrentIndex((prev) => {
      if (prev >= loopSlides.length - 1) return prev
      return prev + 1
    })
  }, [loopSlides.length])

  const goToPrev = useCallback(() => {
    if (!loopSlides.length) return
    setIsTransitioning(true)
    setCurrentIndex((prev) => {
      if (prev <= 0) return prev
      return prev - 1
    })
  }, [loopSlides.length])

  useEffect(() => {
    if (isPaused || !loopSlides.length) return
    const id = setInterval(() => {
      goToNext()
    }, AUTOSCROLL_DURATION_MS)
    return () => clearInterval(id)
  }, [isPaused, loopSlides.length, goToNext, AUTOSCROLL_DURATION_MS])

  useEffect(() => {
    if (!loopSlides.length || !slides.length) return
    const firstIndex = slides.length
    const lastIndex = slides.length * 2 - 1
    if (currentIndex > lastIndex) {
      const timeout = setTimeout(() => {
        setIsTransitioning(false)
        setCurrentIndex((prev) => prev - slides.length)
      }, TRANSITION_DURATION_MS)
      return () => clearTimeout(timeout)
    }
    if (currentIndex < firstIndex) {
      const timeout = setTimeout(() => {
        setIsTransitioning(false)
        setCurrentIndex((prev) => prev + slides.length)
      }, TRANSITION_DURATION_MS)
      return () => clearTimeout(timeout)
    }
  }, [currentIndex, loopSlides.length, slides.length, TRANSITION_DURATION_MS])

  useEffect(() => {
    if (!isTransitioning) {
      const id = requestAnimationFrame(() => setIsTransitioning(true))
      return () => cancelAnimationFrame(id)
    }
  }, [isTransitioning])

  const translateX = Math.max(0, currentIndex * stepSize)
  const trackStyle = useMemo(() => ({
    display: 'flex',
    gap: `${ITEM_GAP}px`,
    transform: `translateX(-${translateX}px)`,
    transition: isTransitioning ? `transform ${TRANSITION_DURATION_MS}ms ease` : 'none',
  }), [translateX, isTransitioning, TRANSITION_DURATION_MS])

  const handleMouseEnter = () => setIsPaused(true)
  const handleMouseLeave = () => setIsPaused(false)

  return (
    <div
      className="w-full max-w-full mx-auto overflow-hidden"
      
    >
      {/* =================================================================
          1. VIDEO SLIDER (Original Component Logic) 
      ================================================================= */}
      <div
        className="relative py-4 sm:py-8"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Scrollable Video Content Container */}
        <div ref={scrollerRef} className="px-4 sm:px-6 overflow-hidden pb-4 sm:pb-8">
          <div
            ref={trackRef}
            className="flex items-stretch"
            style={trackStyle}
          >
      {loopSlides.map((slide, index) => {
            // Calculate distance from the active center (currentIndex)
            const distance = Math.abs(index - currentIndex);

            // Determine scale factor: 1.03 for active, 1.01 for immediate neighbors, 1 for others
            let scaleFactor = 1.0;
            if (distance === 0) {
              scaleFactor = 1.03;
            } else if (distance === 1) {
              scaleFactor = 1.01;
            }

            return (
              <div
                key={slide.key}
                className="group flex-none relative overflow-visible snap-center transition-transform duration-300 hover:-translate-y-0.5"
                style={{ width: `${itemWidth}px` }}
              >
                {/* 1. Video Frame (YouTube Shorts embed) */}
                <div className="block relative overflow-visible rounded-none" style={{ height: `${itemHeight}px` }}>
                  <div
                    className="absolute inset-0 will-change-transform transition-transform duration-300 group-hover:scale-[1.04] bg-black"
                    style={{ transform: `scale(${scaleFactor})`, transformOrigin: 'top center' }}
                  >
                    <iframe
                      src={ensureYouTubeMuted(slide.videoUrl)}
                      className="absolute inset-0 w-full h-full"
                      frameBorder="0"
                      allow="autoplay; encrypted-media; picture-in-picture"
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                      loading="eager"
                      title={`video-${slide.id}`}
                    />
                    <div className="absolute inset-0 pointer-events-none ring-1 ring-black/10 dark:ring-white/10" />
                  </div>
                </div>

                {/* 2. Mini Product Card directly below the video: thumbnail left, details right */}
                <Link href={slide.href} className="block mt-2 p-2 sm:p-2 transition duration-200 hover:scale-[1.01]">
                  <div className="flex items-start gap-2 bg-[#f7f5f0] rounded-md p-2">
                    <img src={slide.productImageUrl} alt={slide.productName} className="w-14 h-14 object-cover rounded" />
                    <div className="flex-1">
                      <h4 className="text-[14px] font-medium tracking-wide truncate">
                        {`Shop For ${slide.productName}`}
                      </h4>
                      <div className="mt-0.5">
                        <p className="text-[13px] font-semibold">{`From ${slide.price}`}</p>
                        {/* Colors: render only the colors provided by the product API */}
                        <div className="flex items-center gap-1.5 mt-1.5">
                          {Array.isArray(slide.colors) && slide.colors.length > 0 ? (
                            slide.colors.slice(0, 6).map((c, ci) => {
                              const isHex = /^#?[0-9A-Fa-f]{6}$/.test(c)
                              const bg = isHex ? (c.startsWith('#') ? c : `#${c}`) : (c.toLowerCase() === 'black' ? '#000' : c.toLowerCase() === 'white' ? '#fff' : undefined)
                              const style = bg ? { backgroundColor: bg } : undefined
                              return (
                                <span key={`col-${ci}`} className="w-4 h-4 rounded-full border" style={style} title={c} />
                              )
                            })
                          ) : (
                            <>
                              <span className="w-4 h-4 rounded-full bg-black border" />
                              <span className="w-4 h-4 rounded-full bg-gray-400" />
                              <span className="w-4 h-4 rounded-full bg-red-500" />
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
                {/* Thumbnails/card removed as per request */}
              </div>
            );
          })}
          </div>
        </div>

        {/* Navigation Buttons (Positioned relative to the slider container) */}
        <button
          onClick={goToPrev}
          aria-label="Scroll left"
          className="absolute left-4 top-[50%] transform -translate-y-1/2 bg-black/50 text-white w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 z-20 opacity-80 hover:opacity-100 hover:bg-black/70 focus:outline-none shadow-lg"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <button
          onClick={goToNext}
          aria-label="Scroll right"
          className="absolute right-4 top-[50%] transform -translate-y-1/2 bg-black/50 text-white w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 z-20 opacity-80 hover:opacity-100 hover:bg-black/70 focus:outline-none shadow-lg"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* =================================================================
          2. SQUARE PRODUCT SLIDER (New Component) 
      ================================================================= */}
      
  <ProductSlider products={slides} />
    </div>
  );
};

// ----------------------------------------------------------------------
// NEW COMPONENT: ProductSlider
// A static, 1:1 ratio product slider with dynamic focus effect.
// ----------------------------------------------------------------------

interface ProductSliderProps {
  products: SlideItem[];
}

const ProductSlider: React.FC<ProductSliderProps> = ({ products }) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [itemWidth, setItemWidth] = useState<number>(180);
  const ITEM_GAP = 16; // must match space-x-4
  const [paused, setPaused] = useState(false);
  const [gallery, setGallery] = useState<SlideItem[]>(products);

  // Load gallery from API (most recent products with showInGallery)
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/public/gallery?take=24', { cache: 'no-store' })
        if (!res.ok) throw new Error('gallery failed')
        const j = await res.json()
        if (!cancelled && Array.isArray(j.items) && j.items.length) {
          const mapped: SlideItem[] = j.items.map((x: any, i: number) => ({
            id: x.id ?? i,
            videoUrl: '',
            productName: x.title ?? '',
            price: x.price ?? '',
            productImageUrl: x.productImageUrl ?? '',
            href: x.href ?? '#',
          }))
          setGallery(mapped)
        }
      } catch {
        // fallback: keep initial products
        setGallery(products)
      }
    })()
    return () => { cancelled = true }
  }, [products])

  // Extend to allow longer auto-scroll
  const extendedProducts = useMemo(() => {
    if (!gallery || !gallery.length) return [] as SlideItem[];
    return gallery.concat(gallery)
  }, [gallery])

  // Responsive item width based on container width
  useEffect(() => {
    const updateSizes = () => {
      const cw = sliderRef.current?.clientWidth ?? (typeof window !== 'undefined' ? window.innerWidth : 360);
      let visibleCount: number;
      if (cw < 640) visibleCount = 2.5; // show 2.5 cards on mobile
      else if (cw < 1024) visibleCount = 3.5; // tablet
      else visibleCount = 5; // desktop
      const totalGap = ITEM_GAP * (visibleCount - 1);
      const available = Math.max(cw - totalGap, 0);
      let w = Math.floor(available / visibleCount);
      w = Math.min(w, 220); // cap width to keep compact and within 262px height budget
      setItemWidth(w);
    };
    updateSizes();
    window.addEventListener('resize', updateSizes);
    return () => window.removeEventListener('resize', updateSizes);
  }, []);

  // Calculate active index on scroll (for scale effect)
  const handleScroll = useCallback(() => {
    if (!sliderRef.current) return;
    const amount = itemWidth + ITEM_GAP;
    const newIndex = Math.round(sliderRef.current.scrollLeft / amount);
    setActiveIndex(newIndex);
  }, [itemWidth, ITEM_GAP]);

  // Auto-scroll similar to the video slider above
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      const el = sliderRef.current;
      if (!el) return;
      const amount = itemWidth + ITEM_GAP;
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (Math.ceil(el.scrollLeft + amount + 2) >= maxScroll) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: amount, behavior: 'smooth' });
      }
    }, 2500);
    return () => clearInterval(id);
  }, [itemWidth, paused]);

  const scrollLeft = () => {
    const el = sliderRef.current; if (!el) return;
    const amount = itemWidth + ITEM_GAP;
    el.scrollBy({ left: -amount, behavior: 'smooth' });
  };
  const scrollRight = () => {
    const el = sliderRef.current; if (!el) return;
    const amount = itemWidth + ITEM_GAP;
    el.scrollBy({ left: amount, behavior: 'smooth' });
  };

  // Row height to mimic the reference (variable image widths, fixed height)
  const [rowHeight, setRowHeight] = useState<number>(262)
  const containerRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const updateRow = () => {
      const cw = sliderRef.current?.clientWidth ?? (typeof window !== 'undefined' ? window.innerWidth : 1024)
      // Baseline desired heights by breakpoint (before capping)
      let desired = 300
      if (cw < 640) desired = 220
      else if (cw < 1024) desired = 260
      else desired = 300

      // Compute how much vertical space is available under a 262px cap
      const MAX_SECTION = 262
      let chrome = 0
      const cont = containerRef.current
      const titleEl = titleRef.current
      if (cont) {
        const cs = window.getComputedStyle(cont)
        const pt = parseFloat(cs.paddingTop || '0')
        const pb = parseFloat(cs.paddingBottom || '0')
        chrome += pt + pb
      }
      if (sliderRef.current) {
        const ss = window.getComputedStyle(sliderRef.current)
        const spb = parseFloat(ss.paddingBottom || '0')
        chrome += spb
      }
      if (titleEl) {
        chrome += titleEl.getBoundingClientRect().height
      }
      // Also account for bottom padding of the scroller area (~8-12px from pb already); add a small safety gap
      const SAFETY = 4
      const available = Math.max(100, MAX_SECTION - chrome - SAFETY)

      const capped = Math.min(desired, available, MAX_SECTION)
      setRowHeight(capped)
    }
    updateRow()
    window.addEventListener('resize', updateRow)
    return () => window.removeEventListener('resize', updateRow)
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative py-3 sm:py-4 overflow-hidden max-h-[262px] bg-white dark:bg-black"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Title exactly as reference */}
      <div ref={titleRef} className="text-center mb-2 sm:mb-3">
        <p className=" text-xl sm:text-2xl font-medium tracking-wide">From our gallery</p>
      </div>

      {/* Scrollable Product Content Container (variable width tiles, fixed height) */}
      <div
        ref={sliderRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto gap-4 px-3 sm:px-4 scroll-smooth snap-x snap-mandatory pb-6 no-scrollbar"
        style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {extendedProducts.map((product, index) => {
          const distance = Math.abs(index - activeIndex)
          let scaleFactor = 1.0
          if (distance === 0) scaleFactor = 1.01
          else if (distance === 1) scaleFactor = 1.005
          return (
            <Link
              key={`prod-${index}-${product.id}`}
              href={product.href}
              className="group flex-none snap-start transition-transform duration-300"
              style={{ transform: `scale(${scaleFactor})`, transformOrigin: 'center center' }}
            >
              {/* Image: fixed row height, natural width, no rounding to match reference */}
              <div className="relative overflow-hidden rounded-none flex items-center justify-center" style={{ height: `${rowHeight}px`, maxHeight: '262px' }}>
                <img
                  src={product.productImageUrl}
                  alt={product.productName}
                  className="h-full w-auto max-w-[262px] object-cover object-center select-none mx-auto"
                  draggable={false}
                />
              </div>
            </Link>
          )
        })}
      </div>

      {/* Navigation Buttons (white circles, gray icons) */}
      <button
        onClick={scrollLeft}
        aria-label="Scroll products left"
        className="absolute left-3 top-[50%] -translate-y-1/2 bg-white text-gray-700 border border-gray-200 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all duration-200 z-20 shadow-sm hover:shadow md:hover:scale-[1.03]"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
      </button>
      <button
        onClick={scrollRight}
        aria-label="Scroll products right"
        className="absolute right-3 top-[50%] -translate-y-1/2 bg-white text-gray-700 border border-gray-200 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all duration-200 z-20 shadow-sm hover:shadow md:hover:scale-[1.03]"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
      </button>
    </div>
  )
};

export default ImageSlider;
