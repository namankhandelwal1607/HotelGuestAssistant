'use client';

import React from 'react';
import {
  Waves,
  Sparkles,
  Dumbbell,
  UtensilsCrossed,
  Wifi,
  Car,
  Plane,
  Compass,
} from 'lucide-react';

const AMENITIES_DATA = [
  {
    icon: Waves,
    name: 'Rooftop Heated Infinity Pool',
    hours: '7:00 AM – 10:00 PM',
    description:
      'Heated oceanfront rooftop pool offering panoramic Monterey Bay views, poolside cocktail and light bite service (10 AM–8 PM), and reservable private cabanas.',
  },
  {
    icon: Sparkles,
    name: 'The Aurel Spa & Hammam',
    hours: '8:00 AM – 9:00 PM',
    description:
      'Signature wellness sanctuary featuring the 90-minute Grand Hammam ritual ($280), therapeutic deep tissue massages ($195), and bespoke botanical facials ($240).',
  },
  {
    icon: Dumbbell,
    name: '24/7 Fitness Centre',
    hours: '24 Hours Daily',
    description:
      'State-of-the-art Technogym workout studio, cycling studio with Peloton bikes, keycard access around the clock, and certified personal trainers upon request.',
  },
  {
    icon: UtensilsCrossed,
    name: '24-Hour Dining & Grand Salon',
    hours: '24 Hours Daily',
    description:
      'Gourmet breakfast buffet in the Grand Salon from 7–11 AM, continuous in-room dining 24/7, and an elevated late-night menu featuring light fare and craft cocktails.',
  },
  {
    icon: Wifi,
    name: 'Complimentary High-Speed Wi-Fi',
    hours: 'Always Available',
    description:
      'Seamless high-speed wireless connectivity throughout all guest rooms, suites, meeting parlors, and poolside grounds with zero password friction.',
  },
  {
    icon: Car,
    name: 'Secure Valet & Tesla EV Charging',
    hours: '24-Hour Valet',
    description:
      'Convenient valet parking ($35/overnight) with unlimited in-and-out privileges and complimentary Level 2 Tesla and universal electric vehicle charging stations.',
  },
  {
    icon: Plane,
    name: 'Airport Chauffeur Service',
    hours: 'On Request',
    description:
      'Private luxury sedan transfers in partnership with Prestige Chauffeur for effortless, stress-free arrivals and departures to all regional airports.',
  },
  {
    icon: Compass,
    name: 'Dedicated Concierge Desk',
    hours: 'Dial Ext. 0',
    description:
      'Our seasoned concierge team arranges private winery tours, coastal excursions, florist orders, and guaranteed reservations at Michelin-starred restaurants.',
  },
];

export const AmenitiesSection: React.FC = () => {
  return (
    <section id="amenities" className="py-24 bg-slate-50 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-widest font-semibold text-amber-700 bg-amber-100/60 px-3 py-1 rounded-full border border-amber-200">
            Resort Facilities
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mt-3 mb-4">
            Hotel Amenities &amp; Services
          </h2>
          <p className="text-base sm:text-lg text-slate-600 font-light leading-relaxed">
            From sunrise rooftop swims to midnight in-room dining, every amenity at Azure Grand
            is designed to elevate your stay with effortless comfort.
          </p>
        </div>

        {/* Amenities Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {AMENITIES_DATA.map((amenity, idx) => {
            const Icon = amenity.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center mb-4 shadow-xs">
                    <Icon className="w-5 h-5 stroke-[1.8] text-amber-600" />
                  </div>
                  <h3 className="font-serif font-bold text-slate-900 text-base sm:text-lg mb-1.5 leading-snug">
                    {amenity.name}
                  </h3>
                  <span className="inline-block text-[11px] font-semibold text-amber-700 uppercase tracking-wider mb-2.5">
                    {amenity.hours}
                  </span>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-light">
                    {amenity.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
