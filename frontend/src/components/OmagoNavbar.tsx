'use client';

import React, { useState } from 'react';
import { Sparkles, Search, Bell, Menu, X } from 'lucide-react';
import { OmagoLogo } from './OmagoLogo';

interface OmagoNavbarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onOpenWidget?: () => void;
}

export const OmagoNavbar: React.FC<OmagoNavbarProps> = ({
  activeTab = 'Instant Chat',
  onTabChange,
  onOpenWidget,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navItems = [
    { name: 'Training Data' },
    { name: 'Instant Chat', isAction: true },
    { name: 'Embed Chatbot' },
    { name: 'Leads' },
  ];

  return (
    <header className="w-full bg-transparent sticky top-0 z-40 transition-colors pt-3 px-4 sm:px-8">
      <div className="max-w-[1380px] mx-auto flex items-center justify-between">
        {/* Left: Brand Logo & Wordmark */}
        <div className="flex items-center gap-8 lg:gap-12">
          <div className="flex items-center gap-3 cursor-pointer select-none group">
            <OmagoLogo size={42} showGlow={true} />
            <span className="text-xl font-bold tracking-tight text-neutral-900 group-hover:text-purple-700 transition">
              Omago AI
            </span>
          </div>

          {/* Center-Left: Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium">
            {navItems.map((item) => {
              const isActive = activeTab === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    onTabChange?.(item.name);
                    if (item.name === 'Instant Chat') {
                      onOpenWidget?.();
                    }
                  }}
                  className={`flex items-center gap-1.5 transition-all py-1.5 relative select-none ${
                    isActive
                      ? 'text-purple-600 font-semibold'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  {item.name === 'Instant Chat' && (
                    <Sparkles className="w-3.5 h-3.5 text-purple-600 animate-pulse" />
                  )}
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Side: Unified Pill with Search, Bell, and User Avatar */}
        <div className="hidden sm:flex items-center">
          <div className="flex items-center gap-3 bg-white/45 hover:bg-white/60 focus-within:bg-white/75 backdrop-blur-xl border border-white/70 rounded-full pl-4 pr-1.5 py-1.5 shadow-[0_4px_16px_rgba(124,58,237,0.04)] transition-all">
            {/* Search Input */}
            <div className="flex items-center gap-2 w-36 md:w-44">
              <Search className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search.."
                className="bg-transparent border-none text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none w-full"
              />
            </div>

            {/* Bell Notification Icon */}
            <button
              aria-label="Notifications"
              className="w-7 h-7 rounded-full flex items-center justify-center text-neutral-600 hover:text-neutral-900 hover:bg-white/50 transition relative"
            >
              <Bell className="w-3.5 h-3.5" />
            </button>

            {/* Circular User Avatar Photo */}
            <div className="w-7 h-7 rounded-full overflow-hidden shadow-xs ring-1 ring-white/80 cursor-pointer">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80"
                alt="User Profile - King Mak"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-full bg-white/50 backdrop-blur-md text-neutral-700 hover:text-neutral-900"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden mt-2 rounded-2xl border border-white/60 bg-white/90 backdrop-blur-xl p-4 space-y-3 shadow-xl">
          <div className="flex items-center bg-white/70 rounded-full px-3 py-1.5 border border-neutral-200/50">
            <Search className="w-4 h-4 text-neutral-400 mr-2" />
            <input
              type="text"
              placeholder="Search.."
              className="bg-transparent border-none text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none w-full"
            />
          </div>

          <div className="flex flex-col space-y-1">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  onTabChange?.(item.name);
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium ${
                  activeTab === item.name
                    ? 'bg-purple-100/60 text-purple-700'
                    : 'text-neutral-600 hover:bg-white/50'
                }`}
              >
                {item.name === 'Instant Chat' && <Sparkles className="w-4 h-4 text-purple-600" />}
                {item.name}
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80"
                alt="User Profile"
                className="w-7 h-7 rounded-full object-cover ring-1 ring-purple-200"
              />
              <span className="text-xs font-semibold text-neutral-800">King Mak</span>
            </div>
            <button className="p-1.5 text-neutral-500 hover:text-neutral-800">
              <Bell className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
