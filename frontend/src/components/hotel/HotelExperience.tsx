'use client';

import React from 'react';
import { BedDouble, Utensils, Waves, ShieldCheck } from 'lucide-react';

const EXPERIENCE_PILLARS = [
  {
    icon: BedDouble,
    title: 'Comfortable Rooms & Suites',
    description:
      'Spacious layouts with plush pillow-top King and Queen beds, private ocean and garden balconies, marble rain showers, and expansive multi-room family villas.',
    highlight: 'From $220 / night',
  },
  {
    icon: Utensils,
    title: 'Dining & 24h In-Room Dining',
    description:
      'Gourmet breakfast buffet served daily in the Grand Salon from 7–11 AM, full 24-hour room service, and curated reservations at local Michelin-starred partners.',
    highlight: '24/7 Room Service',
  },
  {
    icon: Waves,
    title: 'Resort Amenities & Wellness',
    description:
      'Heated rooftop infinity pool open 7 AM–10 PM with ocean views, signature Hammam rituals at The Aurel Spa, and a 24/7 Technogym fitness centre with Peloton bikes.',
    highlight: 'Rooftop Heated Pool',
  },
  {
    icon: ShieldCheck,
    title: 'Dedicated Guest Services',
    description:
      'Personal concierge desk at ext. 0 for tours and dining, Prestige Chauffeur airport sedan transfers, and secure valet parking with Tesla EV charging.',
    highlight: '24/7 Concierge Care',
  },
];

export const HotelExperience: React.FC = () => {
  return (
    <section id="experience" className="py-20 bg-slate-50 border-y border-slate-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-widest font-semibold text-amber-700 bg-amber-100/60 px-3 py-1 rounded-full border border-amber-200">
            Resort Overview
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mt-3 mb-4">
            Everything You Need for a Comfortable Stay
          </h2>
          <p className="text-base sm:text-lg text-slate-600 font-light leading-relaxed">
            At Azure Grand Hotel, luxury meets tranquility. Our Monterey Bay oceanfront
            property is crafted to provide personalized hospitality, fine dining, and
            unrivaled relaxation for every guest.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {EXPERIENCE_PILLARS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-slate-100 group-hover:bg-slate-900 group-hover:text-amber-400 text-slate-800 flex items-center justify-center transition-colors mb-5 shadow-xs">
                    <Icon className="w-6 h-6 stroke-[1.8]" />
                  </div>
                  <h3 className="font-serif font-bold text-slate-900 text-lg sm:text-xl mb-2.5">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-light">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-semibold tracking-wider uppercase text-amber-700">
                    {item.highlight}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
