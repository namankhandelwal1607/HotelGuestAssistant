'use client';

import React from 'react';
import { Compass, Phone, Mail, MapPin } from 'lucide-react';

interface HotelFooterProps {
  onCheckAvailabilityClick?: () => void;
}

export const HotelFooter: React.FC<HotelFooterProps> = ({ onCheckAvailabilityClick }) => {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Col 1: Brand & Tagline */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 text-amber-400 flex items-center justify-center shadow-md">
                <Compass className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="font-serif tracking-wider font-bold text-white text-xl">
                Azure Grand Hotel
              </span>
            </div>
            <p className="font-serif italic text-amber-300/90 text-sm">
              &ldquo;Your stay, made effortless.&rdquo;
            </p>
            <p className="text-xs text-slate-400 leading-relaxed font-light">
              A luxury oceanfront resort situated on the coastline of Monterey Bay,
              offering timeless hospitality, fine dining, and modern guest service.
            </p>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-widest font-semibold text-white">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs font-light">
              <li>
                <button
                  type="button"
                  onClick={() => scrollTo('rooms')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Rooms &amp; Suites
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollTo('amenities')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Amenities
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollTo('dining')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Dining
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollTo('experience')}
                  className="hover:text-amber-400 transition-colors"
                >
                  About Azure Grand
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onCheckAvailabilityClick || (() => scrollTo('booking-bar'))}
                  className="hover:text-amber-400 transition-colors"
                >
                  Check Availability
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Contact & Hours */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-widest font-semibold text-white">
              Property &amp; Contact
            </h4>
            <div className="space-y-2.5 text-xs text-slate-400 font-light">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>742 Oceanview Boulevard, Monterey Bay, CA 93940</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-500 shrink-0" />
                <a href="tel:+18315550199" className="hover:text-white transition-colors">
                  +1 (831) 555-0199 (Front Desk)
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-500 shrink-0" />
                <a
                  href="mailto:concierge@grandazureresort.com"
                  className="hover:text-white transition-colors"
                >
                  concierge@grandazureresort.com
                </a>
              </div>
            </div>
          </div>

          {/* Col 4: Key Policies */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-widest font-semibold text-white">
              Guest Policies
            </h4>
            <div className="space-y-2 text-xs text-slate-400 font-light">
              <p>
                <strong className="text-slate-300 font-medium">Check-in:</strong> 3:00 PM
              </p>
              <p>
                <strong className="text-slate-300 font-medium">Check-out:</strong> 11:00 AM (Late checkout priority for Suites)
              </p>
              <p>
                <strong className="text-slate-300 font-medium">Cancellation:</strong> Free up to 48 hours prior to arrival
              </p>
              <p>
                <strong className="text-slate-300 font-medium">Pet Policy:</strong> Up to 2 dogs under 25 lbs ($75 stay fee)
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Azure Grand Hotel &amp; Spa. All rights reserved.</p>
          <p className="text-[11px] text-slate-500">
            Monterey Bay, California · 5-Star Oceanfront Hospitality
          </p>
        </div>
      </div>
    </footer>
  );
};
