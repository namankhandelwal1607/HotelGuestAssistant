'use client';

import React, { useState } from 'react';
import { Compass, Menu, X, CalendarCheck, Phone } from 'lucide-react';

interface HotelNavbarProps {
  onCheckAvailabilityClick?: () => void;
}

export const HotelNavbar: React.FC<HotelNavbarProps> = ({ onCheckAvailabilityClick }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCtaClick = () => {
    setMobileMenuOpen(false);
    if (onCheckAvailabilityClick) {
      onCheckAvailabilityClick();
    } else {
      scrollToSection('booking-bar');
    }
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200/80 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <a
          href="#"
          className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-amber-500 rounded-lg p-1"
        >
          <div className="w-10 h-10 rounded-xl bg-slate-900 group-hover:bg-slate-800 text-amber-400 flex items-center justify-center shadow-md transition-colors">
            <Compass className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif tracking-wider font-bold text-slate-900 text-lg sm:text-xl leading-none">
              Azure Grand Hotel
            </span>
            <span className="text-[10px] tracking-widest uppercase font-medium text-amber-700/90 mt-0.5">
              Resort &amp; Spa · Monterey Bay
            </span>
          </div>
        </a>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center space-x-8">
          <button
            type="button"
            onClick={() => scrollToSection('rooms')}
            className="text-sm font-medium text-slate-700 hover:text-slate-950 transition-colors py-1"
          >
            Rooms &amp; Suites
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('amenities')}
            className="text-sm font-medium text-slate-700 hover:text-slate-950 transition-colors py-1"
          >
            Amenities
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('dining')}
            className="text-sm font-medium text-slate-700 hover:text-slate-950 transition-colors py-1"
          >
            Dining
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('experience')}
            className="text-sm font-medium text-slate-700 hover:text-slate-950 transition-colors py-1"
          >
            About
          </button>
        </div>

        {/* Right Side CTA & Phone */}
        <div className="hidden sm:flex items-center gap-4">
          <a
            href="tel:+18315550199"
            className="hidden lg:flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium py-2 px-2.5 rounded-md hover:bg-slate-100 transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-amber-600" />
            <span>(831) 555-0199</span>
          </a>

          <button
            type="button"
            onClick={handleCtaClick}
            className="px-5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-medium tracking-wide shadow-sm hover:shadow transition-all flex items-center gap-2 active:scale-95"
          >
            <CalendarCheck className="w-4 h-4 text-amber-400" />
            <span>Check Availability</span>
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            type="button"
            onClick={handleCtaClick}
            className="sm:hidden px-3 py-1.5 rounded-full bg-slate-900 text-white text-xs font-medium flex items-center gap-1.5"
          >
            <CalendarCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Book</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150 shadow-lg">
          <div className="flex flex-col space-y-2">
            <button
              type="button"
              onClick={() => scrollToSection('rooms')}
              className="text-left py-2 px-3 rounded-lg text-sm font-medium text-slate-800 hover:bg-slate-100"
            >
              Rooms &amp; Suites
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('amenities')}
              className="text-left py-2 px-3 rounded-lg text-sm font-medium text-slate-800 hover:bg-slate-100"
            >
              Amenities
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('dining')}
              className="text-left py-2 px-3 rounded-lg text-sm font-medium text-slate-800 hover:bg-slate-100"
            >
              Dining
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('experience')}
              className="text-left py-2 px-3 rounded-lg text-sm font-medium text-slate-800 hover:bg-slate-100"
            >
              About Azure Grand
            </button>
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <button
              type="button"
              onClick={handleCtaClick}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold flex items-center justify-center gap-2"
            >
              <CalendarCheck className="w-4 h-4 text-amber-400" />
              <span>Check Availability</span>
            </button>
            <a
              href="tel:+18315550199"
              className="w-full py-2 text-center text-xs text-slate-600 font-medium"
            >
              Front Desk: (831) 555-0199
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};
