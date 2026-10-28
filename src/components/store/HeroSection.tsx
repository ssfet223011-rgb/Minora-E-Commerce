import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { storeService } from '../../services/storeService';
import { HeroSlide } from '../../types';

export const HeroSection: React.FC = () => {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const loadSlides = async () => {
      const data = await storeService.getHeroSlides();
      const active = data.filter((s) => s.active);
      if (active.length > 0) setSlides(active);
    };
    loadSlides();
  }, []);

  const nextSlide = () => {
    if (slides.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    if (slides.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Auto advance every 6 seconds
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) return null;

  const current = slides[currentIndex] || slides[0];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#FFFDF7] via-[#FFF8E8] to-[#FFF3D6] border-b border-amber/15 py-10 lg:py-16">
      {/* Subtle organic decorative elements in background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-honey/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-amber/10 rounded-full blur-2xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Brand & Copy */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            {/* Logo display matching mockup */}
            <div className="inline-flex flex-col items-center lg:items-start">
              <img
                src="/assets/minora-logo.png"
                alt="MINORA Pure Natural Healthy"
                className="h-16 sm:h-20 w-auto object-contain mb-1"
              />
              <span className="text-sm sm:text-base font-serif italic text-amber-dark font-medium tracking-wider">
                Pure • Natural • Healthy
              </span>
            </div>

            <div className="space-y-3">
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-chocolate tracking-tight leading-tight">
                {current.headline || 'Premium quality dry fruits & nuts for a healthier tomorrow.'}
              </h1>
              <p className="text-base sm:text-lg text-chocolate/80 max-w-xl mx-auto lg:mx-0 font-sans leading-relaxed">
                {current.description || 'Discover premium nuts, dry fruits, seeds and natural honey for a healthier lifestyle.'}
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                to={current.cta_url || '/shop'}
                className="px-8 py-3.5 rounded-full bg-amber hover:bg-amber-dark text-white font-bold text-sm tracking-wide shadow-warm transition-all flex items-center gap-2 group transform hover:-translate-y-0.5"
              >
                <span>{current.cta_text || 'Shop Now'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/categories"
                className="px-7 py-3.5 rounded-full bg-cream hover:bg-cream-300 text-chocolate border border-amber/30 font-semibold text-sm transition-all shadow-xs"
              >
                Explore Categories
              </Link>
            </div>

            {/* Natural guarantee pill */}
            <div className="pt-2 flex items-center justify-center lg:justify-start gap-2 text-xs font-semibold text-chocolate/70">
              <span className="inline-flex items-center gap-1 bg-white/80 px-3 py-1 rounded-full border border-amber/20 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-amber" /> 100% Farm Fresh & Preservative-Free
              </span>
            </div>
          </div>

          {/* Right Column: Hero Product Visual with Mini Honey Nuts reference */}
          <div className="lg:col-span-6 relative flex items-center justify-center">
            {/* Visual Frame */}
            <div className="relative w-full max-w-md lg:max-w-lg aspect-square">
              {/* Soft decorative glow */}
              <div className="absolute inset-4 rounded-3xl bg-gradient-to-tr from-amber/20 to-honey/30 blur-xl transform -rotate-3" />

              <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-warm-lg border-2 border-amber/30 bg-white/40 p-3 sm:p-4 backdrop-blur-xs flex items-center justify-center">
                <img
                  src={current.image_url || '/assets/mini-honey-nuts.jpg'}
                  alt={current.headline || 'Featured MINORA Product'}
                  className="w-full h-full object-cover rounded-2xl transform hover:scale-103 transition-transform duration-500"
                />

                {/* Floating badge for Mini Honey Nuts */}
                <div className="absolute bottom-6 left-6 bg-chocolate/90 backdrop-blur-md text-honey px-4 py-2 rounded-2xl border border-amber/40 shadow-lg">
                  <span className="text-[10px] uppercase tracking-wider text-cream/70 block">Featured Selection</span>
                  <span className="font-serif font-bold text-sm text-cream">Mini Honey Nuts</span>
                </div>
              </div>
            </div>

            {/* Carousel navigation arrows */}
            {slides.length > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute -left-2 sm:left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-chocolate/85 hover:bg-chocolate text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 z-10"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute -right-2 sm:right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-chocolate/85 hover:bg-chocolate text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 z-10"
                  aria-label="Next slide"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Carousel pagination indicators */}
        {slides.length > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2.5 rounded-full transition-all ${
                  idx === currentIndex ? 'w-8 bg-amber' : 'w-2.5 bg-chocolate/20 hover:bg-chocolate/40'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
