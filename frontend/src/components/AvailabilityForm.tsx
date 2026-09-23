import React, { useState } from 'react';
import { AvailabilityField } from '../types';
import { Calendar, Users, ArrowRight } from 'lucide-react';

interface AvailabilityFormProps {
  missingFields?: AvailabilityField[];
  prefilled?: {
    checkIn?: string;
    checkOut?: string;
    adults?: number;
  };
  onSubmit: (checkIn: string, checkOut: string, adults: number) => void;
  disabled?: boolean;
}

export const AvailabilityForm: React.FC<AvailabilityFormProps> = ({
  missingFields = [],
  prefilled = {},
  onSubmit,
  disabled = false
}) => {
  // Default check-in to tomorrow and check-out to 3 days after tomorrow if not provided
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultCheckIn = tomorrow.toISOString().split('T')[0];

  const threeDaysLater = new Date();
  threeDaysLater.setDate(threeDaysLater.getDate() + 4);
  const defaultCheckOut = threeDaysLater.toISOString().split('T')[0];

  const [checkIn, setCheckIn] = useState<string>(prefilled.checkIn || defaultCheckIn);
  const [checkOut, setCheckOut] = useState<string>(prefilled.checkOut || defaultCheckOut);
  const [adults, setAdults] = useState<number>(prefilled.adults || 2);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!checkIn || !checkOut) {
      setFormError('Please select both check-in and check-out dates.');
      return;
    }

    if (new Date(checkOut) <= new Date(checkIn)) {
      setFormError('Check-out date must be strictly after the check-in date.');
      return;
    }

    if (adults < 1) {
      setFormError('Please select at least 1 guest.');
      return;
    }

    onSubmit(checkIn, checkOut, adults);
  };

  return (
    <div className="mt-3 bg-white rounded-xl border border-sky-200 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
        <Calendar className="w-4 h-4 text-sky-600" />
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
          Specify Stay Details
        </h4>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Check-in Date */}
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1 flex items-center justify-between">
              <span>Check-in Date</span>
              {missingFields.includes('checkIn') && (
                <span className="text-amber-600 font-semibold text-[10px]">Required</span>
              )}
            </label>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              disabled={disabled}
              className={`w-full text-xs px-2.5 py-1.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white ${
                missingFields.includes('checkIn')
                  ? 'border-amber-400 bg-amber-50/20'
                  : 'border-slate-200'
              }`}
              required
            />
          </div>

          {/* Check-out Date */}
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1 flex items-center justify-between">
              <span>Check-out Date</span>
              {missingFields.includes('checkOut') && (
                <span className="text-amber-600 font-semibold text-[10px]">Required</span>
              )}
            </label>
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              disabled={disabled}
              className={`w-full text-xs px-2.5 py-1.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white ${
                missingFields.includes('checkOut')
                  ? 'border-amber-400 bg-amber-50/20'
                  : 'border-slate-200'
              }`}
              required
            />
          </div>

          {/* Guests */}
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3 text-slate-400" />
                Guests (Adults)
              </span>
              {missingFields.includes('adults') && (
                <span className="text-amber-600 font-semibold text-[10px]">Required</span>
              )}
            </label>
            <select
              value={adults}
              onChange={(e) => setAdults(parseInt(e.target.value, 10))}
              disabled={disabled}
              className={`w-full text-xs px-2.5 py-1.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white ${
                missingFields.includes('adults')
                  ? 'border-amber-400 bg-amber-50/20'
                  : 'border-slate-200'
              }`}
            >
              <option value={1}>1 Guest</option>
              <option value={2}>2 Guests</option>
              <option value={3}>3 Guests</option>
              <option value={4}>4 Guests</option>
              <option value={5}>5 Guests</option>
              <option value={6}>6 Guests</option>
            </select>
          </div>
        </div>

        {formError && (
          <p className="text-xs text-rose-600 bg-rose-50 px-2.5 py-1 rounded border border-rose-100">
            {formError}
          </p>
        )}

        <button
          type="submit"
          disabled={disabled}
          className="w-full sm:w-auto px-4 py-2 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
        >
          <span>Check Live Room Availability</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
