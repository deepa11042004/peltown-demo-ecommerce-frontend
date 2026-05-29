"use client";
import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, PanInfo } from "framer-motion";
import Image from "next/image";
import { ArrowRight, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import Link from "next/link";
import { heroBannerApi } from "@/lib/api";

type HeroSlide = {
  id: number | string;
  title: string;
  subtitle?: string | null;
  link?: string | null;
  image: string;
  isActive?: boolean;
};

const FALLBACK_SLIDES: HeroSlide[] = [
  {
    id: "fallback-1",
    title: "ADVENTURE AWAITS YOU.",
    subtitle: "Experience the peak of quality with our new seasonal collection.",
    link: "/shop",
    image: "/Img/hero.webp",
  },
  {
    id: "fallback-2",
    title: "HARVEST THE RUSH.",
    subtitle: "Limited batches from the valley vaults. Taste the rarest picks.",
    link: "/products?category=dry-fruits",
    image: "/Img/walnuts.jpg",
  },
];

const resolveImageSrc = (value: string) => {
  if (!value) {
    return "/Img/hero.webp";
  }

  if (value.startsWith("http")) {
    return value;
  }

  if (value.startsWith("/")) {
    return value;
  }

  return `/${value}`;
};

const HeroSec = () => {
  const [slides, setSlides] = useState<HeroSlide[]>(FALLBACK_SLIDES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadSlides = async () => {
      setIsLoading(true);
      setLoadError("");

      try {
        const response = await heroBannerApi.listPublic();
        const items = (response.data?.data || []) as HeroSlide[];

        if (!mounted) {
          return;
        }

        if (Array.isArray(items) && items.length > 0) {
          setSlides(items);
          setCurrentIndex(0);
        }
      } catch {
        if (mounted) {
          setLoadError("Unable to load hero banners right now.");
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadSlides();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (slides.length <= 1) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 7000);

    return () => window.clearInterval(intervalId);
  }, [slides.length]);

  useEffect(() => {
    if (currentIndex >= slides.length) {
      setCurrentIndex(0);
    }
  }, [currentIndex, slides.length]);

  const activeSlide = useMemo(() => {
    return slides[currentIndex] || FALLBACK_SLIDES[0];
  }, [currentIndex, slides]);

  const nextSlide = () => {
    if (slides.length === 0) {
      return;
    }

    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    if (slides.length === 0) {
      return;
    }

    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleDragEnd = (_event: unknown, info: PanInfo) => {
    if (info.offset.x < -80) {
      nextSlide();
    } else if (info.offset.x > 80) {
      prevSlide();
    }
  };

  return (
    <section className="relative min-h-screen w-full overflow-hidden flex items-center">
      {/* Background slider */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlide.id}
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.01 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="relative w-full h-full"
          >
            <Image
              src={resolveImageSrc(activeSlide.image)}
              alt={activeSlide.title}
              fill
              sizes="100vw"
              priority={currentIndex === 0}
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Overlay for text readability */}
      <div className="absolute inset-0 bg-black/30 z-10" />

      {/* Content Container */}
      <div className="relative z-20 container mx-auto px-6 sm:px-12">
        <div className="max-w-3xl text-white mx-auto flex flex-col items-center text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={`hero-copy-${activeSlide.id}`}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex flex-col items-center"
            >
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md border border-white/30 text-white px-4 py-1.5 rounded-full mb-6 w-fit shadow-lg">
                <Clock size={16} className="text-[#facc15]" />
                <span className="text-xs font-black uppercase tracking-tighter">
                  Limited Time Offer
                </span>
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black mb-6 drop-shadow-2xl">
                {activeSlide.title}
              </h1>

              {activeSlide.subtitle ? (
                <p className="text-sm sm:text-lg font-medium mb-8 text-gray-100 max-w-xl">
                  {activeSlide.subtitle}
                </p>
              ) : null}

              <Link href={activeSlide.link?.trim() || "/shop"} className="flex justify-center gap-4">
                <button className="bg-[#facc15] text-black px-10 py-5 rounded-full font-black text-xs sm:text-sm uppercase tracking-widest flex items-center gap-2 hover:bg-white transition-colors shadow-2xl group">
                  Shop Now
                  <ArrowRight
                    size={18}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </button>
              </Link>
            </motion.div>
          </AnimatePresence>

          <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
            className="mt-35 flex flex-col items-center gap-6 sm:mt-32 lg:mt-36"
          >
            <div className="flex items-center gap-4">
              <button
                type="button"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={prevSlide}
                className="h-9 w-9 p-2 border border-white/40 bg-white/10 rounded-full hover:bg-white hover:text-black transition-all duration-300"
                aria-label="Previous slide"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="flex items-center gap-2">
                {slides.map((slide, index) => (
                  <button
                    type="button"
                    key={`hero-dot-${slide.id}`}
                    onClick={() => setCurrentIndex(index)}
                    className={`h-2 rounded-full transition-all duration-500 ${
                      index === currentIndex
                        ? "w-10 bg-[#facc15]"
                        : "w-2 bg-white/40"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>

              <button
                type="button"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={nextSlide}
                className="h-9 w-9 p-2 border border-[#facc15] bg-[#facc15] text-black rounded-full hover:bg-white transition-all duration-300"
                aria-label="Next slide"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {loadError && !isLoading ? (
              <p className="text-xs font-bold uppercase tracking-widest text-red-200">
                {loadError}
              </p>
            ) : null}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSec;
