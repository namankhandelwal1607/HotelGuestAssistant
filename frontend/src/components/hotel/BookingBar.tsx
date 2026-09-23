'use client';

import React, { useState } from 'react';
import { Calendar, Users, Search, AlertCircle } from 'lucide-react';

interface BookingBarProps {
  onSearch: (checkIn: string, checkOut: string, adults: number) => void;
  isLoading?: boolean;
}

export const BookingBar: React.FC<BookingBarProps> = ({ onSearch, isLoading = false }) => {
  // Compute smart defaults: tomorrow and 3 days later
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultCheckIn = tomorrow.toISOString().split('T')[0];

  const threeDaysLater = new Date();
  threeDaysLater.setDate(threeDaysLater.getDate() + 4);
  const defaultCheckOut = threeDaysLater.toISOString().split('T')[0];

  const [checkIn, setCheckIn] = useState<string>(defaultCheckIn);
  const [checkOut, setCheckOut] = useState<string>(defaultCheckOut);
  const [adults, setAdults] = useState<number>(2);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!checkIn || !checkOut) {
      setErrorMsg('Please select both check-in and check-out dates.');
      return;
    }

    if (new Date(checkOut) <= new Date(checkIn)) {
      setErrorMsg('Check-out date must be strictly after the check-in date.');
      return;
    }

    onSearch(checkIn, checkOut, adults);
  };

  return (
    <div
      id="booking-bar"
      className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 -mt-10 sm:-mt-14 mb-16"
    >
      <div className="bg-white rounded-2xl shadow-xl shadow-slate-900/10 border border-slate-200/90 p-4 sm:p-6 transition-all">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            {/* Check-in Date */}
            <div className="space-y-1.5">
              <label
                htmlFor="hero-check-in"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5 text-amber-600" />
                <span>Check-in Date</span>
              </label>
              <input
                id="hero-check-in"
                type="date"
                value={checkIn}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full text-sm font-medium px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 text-slate-900 transition-colors"
                required
              />
            </div>

            {/* Check-out Date */}
            <div className="space-y-1.5">
              <label
                htmlFor="hero-check-out"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5 text-amber-600" />
                <span>Check-out Date</span>
              </label>
              <input
                id="hero-check-out"
                type="date"
                value={checkOut}
                min={checkIn || new Date().toISOString().split('T')[0]}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full text-sm font-medium px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 text-slate-900 transition-colors"
                required
              />
            </div>

            {/* Guests Selector */}
            <div className="space-y-1.5">
              <label
                htmlFor="hero-guests"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5"
              >
                <Users className="w-3.5 h-3.5 text-amber-600" />
                <span>Guests</span>
              </label>
              <select
                id="hero-guests"
                value={adults}
                onChange={(e) => setAdults(parseInt(e.target.value, 10))}
                className="w-full text-sm font-medium px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 text-slate-900 transition-colors"
              >
                <option value={1}>1 Adult</option>
                <option value={2}>2 Adults</option>
                <option value={3}>3 Adults (Family/Suite)</option>
                <option value={4}>4 Adults (Double Queen)</option>
                <option value={5}>5 Adults (Villa)</option>
                <option value={6}>6 Adults (Family Villa)</option>
              </select>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-[46px] rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2 group active:scale-95 disabled:opacity-50"
              >
                <Search className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                <span>Check Availability</span>
              </button>
            </div>
          </div>

          {/* Validation Error Message */}
          {errorMsg && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-50 text-rose-700 text-xs border border-rose-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
