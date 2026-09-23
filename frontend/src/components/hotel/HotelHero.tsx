'use client';

import React from 'react';
import { ArrowDown, CalendarCheck, Compass, Sparkles } from 'lucide-react';

interface HotelHeroProps {
  onCheckAvailabilityClick?: () => void;
  onExploreRoomsClick?: () => void;
}

export const HotelHero: React.FC<HotelHeroProps> = ({
  onCheckAvailabilityClick,
  onExploreRoomsClick,
}) => {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative w-full min-h-[620px] lg:min-h-[700px] flex items-center justify-center overflow-hidden bg-slate-900 text-white">
      {/* Background Resort Image with Subtle Ken Burns / Zoom Effect */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transform scale-105 transition-transform duration-1000 ease-out"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2000&q=85")',
        }}
        aria-hidden="true"
      />

      {/* Multi-layer Gradient Overlay for Optimal Text Contrast */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/50 to-slate-950/60"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-slate-950/25 backdrop-brightness-[0.88]"
        aria-hidden="true"
      />

      {/* Hero Content Container */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center flex flex-col items-center">
        {/* Welcome Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-amber-300 text-xs sm:text-[13px] font-semibold tracking-wider uppercase mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>WELCOME TO AZURE GRAND HOTEL</span>
        </div>

        {/* Main Heading */}
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1] max-w-3xl mb-6 drop-shadow-md">
          Stay Beautifully.
          <span className="block font-normal italic text-slate-100 font-serif">
            Relax Effortlessly.
          </span>
        </h1>

        {/* Supporting Text */}
        <p className="text-base sm:text-lg md:text-xl text-slate-200/95 max-w-2xl font-light leading-relaxed mb-10 drop-shadow">
          Experience comfortable rooms, thoughtful amenities, and a seamless stay
          with our Hotel Assistant available whenever you need it.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <button
            type="button"
            onClick={onCheckAvailabilityClick || (() => scrollTo('booking-bar'))}
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm sm:text-base font-bold tracking-wide shadow-lg shadow-amber-500/25 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2.5"
          >
            <CalendarCheck className="w-5 h-5 text-slate-950" />
            <span>Check Availability</span>
          </button>

          <button
            type="button"
            onClick={onExploreRoomsClick || (() => scrollTo('rooms'))}
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/15 hover:bg-white/25 text-white backdrop-blur-md border border-white/30 text-sm sm:text-base font-semibold tracking-wide transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
          >
            <Compass className="w-5 h-5 text-amber-300" />
            <span>Explore Rooms</span>
          </button>
        </div>

        {/* Small Scroll Prompt */}
        <div className="hidden md:flex flex-col items-center mt-12 text-slate-400 text-xs font-medium gap-1 opacity-80 hover:opacity-100 transition-opacity">
          <span>Scroll to explore property</span>
          <ArrowDown className="w-3.5 h-3.5 animate-bounce mt-0.5" />
        </div>
      </div>
    </section>
  );
};
