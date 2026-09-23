import React from 'react';
import { Sparkles, Phone, Compass } from 'lucide-react';

export const Navbar: React.FC = () => {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-semibold text-slate-900 text-base sm:text-lg leading-tight flex items-center gap-2">
              The Grand Azure Resort & Spa
            </h1>
            <p className="text-xs text-slate-500 font-medium hidden sm:block">
              Jaipur, Rajasthan · 5-Star Luxury Resort
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              AI Concierge Live
            </span>
          </div>

          <a
            href="tel:+911234567890"
            className="hidden md:flex items-center gap-1.5 text-xs text-slate-600 hover:text-sky-700 font-medium py-1.5 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            Front Desk: +91 1234567890
          </a>
        </div>
      </div>
    </header>
  );
};
