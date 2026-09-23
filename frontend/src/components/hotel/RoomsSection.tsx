'use client';

import React from 'react';
import { Users, BedDouble, ArrowRight, Sparkles, Check } from 'lucide-react';

interface RoomTypeData {
  id: string;
  name: string;
  maxOccupancy: number;
  bedConfig: string;
  pricePerNight: number;
  description: string;
  features: string[];
  imageUrl: string;
  badge?: string;
}

const ROOMS_DATA: RoomTypeData[] = [
  {
    id: 'deluxe_king',
    name: 'Deluxe King Room',
    maxOccupancy: 2,
    bedConfig: '1 King Bed',
    pricePerNight: 220,
    description:
      'Spacious 380 sq ft room featuring an ultra-comfortable plush King pillow-top bed, private balcony with garden views, marble walk-in rain shower, 55-inch smart 4K TV, and Nespresso machine.',
    features: ['Balcony', 'Garden View', 'Walk-in Rain Shower', 'Nespresso Machine', '55" 4K TV'],
    imageUrl:
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
    badge: 'Popular for Couples',
  },
  {
    id: 'deluxe_double_queen',
    name: 'Deluxe Double Queen Room',
    maxOccupancy: 4,
    bedConfig: '2 Queen Beds',
    pricePerNight: 260,
    description:
      'Generous 450 sq ft room designed for families or traveling groups of up to 4 guests (also ideal for 3 guests). Includes two plush Queen beds, spacious seating area, dual-sink vanity bathroom, and mini-refrigerator.',
    features: ['2 Queen Beds', 'Dual Sink Vanity', 'Mini-Fridge', 'Work Desk', '55" 4K TV'],
    imageUrl:
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
    badge: 'Ideal for 3–4 Guests',
  },
  {
    id: 'executive_harbor_suite',
    name: 'Executive Harbor Suite',
    maxOccupancy: 3,
    bedConfig: '1 King Bed + 1 Queen Pullout Sofa Bed',
    pricePerNight: 380,
    description:
      'Luxurious 620 sq ft suite featuring a separate master bedroom with 1 King bed and a living parlor with a premium Queen pullout sleeper sofa, comfortably accommodating 3 adult guests. Includes ocean/harbor views, deep soaking tub, complimentary daily breakfast, and late checkout priority.',
    features: [
      'Ocean Harbor View',
      'Separate Living Room',
      'Soaking Tub',
      'Complimentary Daily Breakfast',
      'Priority Late Checkout',
    ],
    imageUrl:
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80',
    badge: 'Luxury Suite with Breakfast',
  },
  {
    id: 'two_bedroom_family_villa',
    name: 'Two-Bedroom Family Villa',
    maxOccupancy: 6,
    bedConfig: '1 King Bed + 2 Twin Beds + 1 Queen Sleeper Sofa',
    pricePerNight: 520,
    description:
      'Expansive 950 sq ft multi-room villa ideal for larger families and groups up to 6 guests. Features 2 private bedrooms, 2 full bathrooms, fully-equipped kitchenette with dining area, private furnished ocean-facing patio, and complimentary daily breakfast.',
    features: [
      'Kitchenette',
      'Private Ocean Patio',
      '2 Full Bathrooms',
      'Complimentary Daily Breakfast',
      'Dining Area',
    ],
    imageUrl:
      'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?auto=format&fit=crop&w=800&q=80',
    badge: 'Ultimate Family Villa',
  },
];

interface RoomsSectionProps {
  onSelectRoom?: (roomName: string) => void;
}

export const RoomsSection: React.FC<RoomsSectionProps> = ({ onSelectRoom }) => {
  return (
    <section id="rooms" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-widest font-semibold text-amber-700 bg-amber-100/60 px-3 py-1 rounded-full border border-amber-200">
            Accommodations
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mt-3 mb-4">
            Rooms &amp; Suites
          </h2>
          <p className="text-base sm:text-lg text-slate-600 font-light leading-relaxed">
            Every room and suite at Azure Grand Hotel is tailored for peaceful rest, featuring
            luxurious bedding, expansive layouts, and ocean or garden vistas.
          </p>
        </div>

        {/* Room Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {ROOMS_DATA.map((room) => (
            <div
              key={room.id}
              className="bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col group"
            >
              {/* Room Image */}
              <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-slate-100">
                <img
                  src={room.imageUrl}
                  alt={room.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />

                {/* Badge if present */}
                {room.badge && (
                  <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-amber-300 text-xs font-semibold border border-white/10 shadow-sm">
                    {room.badge}
                  </span>
                )}

                {/* Nightly Price Tag */}
                <div className="absolute bottom-4 right-4 px-3.5 py-1.5 rounded-xl bg-white/95 backdrop-blur-md text-slate-900 shadow-md">
                  <span className="text-lg font-bold font-serif">${room.pricePerNight}</span>
                  <span className="text-xs text-slate-500 font-normal"> / night</span>
                </div>
              </div>

              {/* Room Details Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-serif text-2xl font-bold text-slate-900 mb-2">
                    {room.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-light">
                    {room.description}
                  </p>
                </div>

                {/* Capacity & Bed Config */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-700">
                  <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200/60">
                    <Users className="w-3.5 h-3.5 text-amber-600" />
                    <span>Up to {room.maxOccupancy} Guests</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200/60">
                    <BedDouble className="w-3.5 h-3.5 text-amber-600" />
                    <span>{room.bedConfig}</span>
                  </div>
                </div>

                {/* Included Features Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {room.features.map((feature, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-md font-medium"
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                {/* Card CTA */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">
                    Best Rate Guaranteed
                  </span>
                  <button
                    type="button"
                    onClick={() => onSelectRoom && onSelectRoom(room.name)}
                    className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold tracking-wide transition-all flex items-center gap-1.5 group-hover:bg-amber-600 group-hover:text-white"
                  >
                    <span>Check Availability</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
