import React, { useState } from 'react';
import { RoomAvailabilityResult } from '../types';
import { Users, BedDouble, CheckCircle2, XCircle, Sparkles, Check } from 'lucide-react';

interface AvailabilityCardProps {
  room: RoomAvailabilityResult;
}

export const AvailabilityCard: React.FC<AvailabilityCardProps> = ({ room }) => {
  const [reserved, setReserved] = useState(false);

  return (
    <div
      className={`rounded-xl border p-4 transition-all duration-200 shadow-sm ${
        room.available
          ? 'bg-white border-slate-200 hover:border-sky-300 hover:shadow-md'
          : 'bg-slate-50/70 border-slate-200/60 opacity-80'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-slate-900 text-base">{room.name}</h4>
            {room.available ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Available
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800">
                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                Unavailable
              </span>
            )}
          </div>

          <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
            {room.description}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>Up to {room.maxOccupancy} Guests</span>
            </div>
            <div className="flex items-center gap-1">
              <BedDouble className="w-3.5 h-3.5 text-slate-400" />
              <span>{room.bedConfig}</span>
            </div>
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 min-w-[130px]">
          <div className="text-left sm:text-right">
            <div className="text-lg font-bold text-slate-900">
              ${room.pricePerNight}
              <span className="text-xs font-normal text-slate-500"> / night</span>
            </div>
            {room.nights > 1 && (
              <div className="text-xs text-slate-500">
                ${room.totalPrice} total ({room.nights} nights)
              </div>
            )}
          </div>

          <div className="mt-2">
            {room.available ? (
              <button
                type="button"
                onClick={() => setReserved(true)}
                disabled={reserved}
                className={`text-xs font-medium px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                  reserved
                    ? 'bg-emerald-600 text-white cursor-default'
                    : 'bg-sky-600 hover:bg-sky-700 text-white shadow-sm'
                }`}
              >
                {reserved ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Hold Placed
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Select Room
                  </>
                )}
              </button>
            ) : (
              <span className="text-xs text-rose-600 font-medium bg-rose-50 px-2 py-1 rounded border border-rose-100 block text-center">
                {room.reasonIfNotAvailable || 'Unavailable'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Feature Tags */}
      {room.features && room.features.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3 pt-2.5 border-t border-slate-100">
          {room.features.map((feature, idx) => (
            <span
              key={idx}
              className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium"
            >
              {feature}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
