'use client';

import React from 'react';
import { MessageSquare, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

interface AssistantCalloutProps {
  onOpenChat: (prefilledQuery?: string) => void;
}

export const AssistantCallout: React.FC<AssistantCalloutProps> = ({ onOpenChat }) => {
  return (
    <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
      {/* Subtle warm glow background accent */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-amber-300 text-xs font-semibold tracking-wider uppercase mb-5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>24/7 Virtual Concierge</span>
        </div>

        {/* Heading */}
        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-4 max-w-2xl">
          Need Help Planning Your Stay?
        </h2>

        {/* Text */}
        <p className="text-base sm:text-lg text-slate-300 max-w-2xl font-light leading-relaxed mb-8">
          Our Hotel Assistant can instantly answer questions about rooms, amenities,
          hotel policies, and availability.
        </p>

        {/* Value Checklist */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs sm:text-sm text-slate-300 mb-8 font-light">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
            <span>Check-in &amp; Check-out Times</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
            <span>Pool &amp; Spa Hours</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
            <span>Live Room Availability</span>
          </div>
        </div>

        {/* CTA Button */}
        <button
          type="button"
          onClick={() => onOpenChat()}
          className="px-8 py-4 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm sm:text-base tracking-wide shadow-xl shadow-amber-500/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2.5"
        >
          <MessageSquare className="w-5 h-5 text-slate-950" />
          <span>Chat with Hotel Assistant</span>
          <ArrowRight className="w-4 h-4 text-slate-950" />
        </button>
      </div>
    </section>
  );
};
