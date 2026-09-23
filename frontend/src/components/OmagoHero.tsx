'use client';

import React, { useState } from 'react';
import {
  Paperclip,
  Search,
  Globe,
  Zap,
  Lightbulb,
  GitFork,
  Box,
} from 'lucide-react';
import { OmagoLogo } from './OmagoLogo';

interface OmagoHeroProps {
  onSubmitPrompt?: (prompt: string, mode: string) => void;
}

export const OmagoHero: React.FC<OmagoHeroProps> = ({ onSubmitPrompt }) => {
  const [inputValue, setInputValue] = useState('');
  const [selectedMode, setSelectedMode] = useState<string>('fast');
  const [isDeepSearchActive, setIsDeepSearchActive] = useState<boolean>(true);

  const quickModes = [
    { id: 'fast', label: 'Fast', icon: Zap },
    { id: 'in-depth-1', label: 'In-depth', icon: Lightbulb },
    { id: 'in-depth-2', label: 'In-depth', icon: GitFork },
    { id: 'holistic', label: 'Holistic', icon: Box },
  ];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;
    onSubmitPrompt?.(inputValue.trim(), selectedMode);
    setInputValue('');
  };

  return (
    <div className="relative w-full flex flex-col items-center justify-center px-4 py-10 sm:py-16 select-none">
      {/* Center White Omago Emblem with Luminous Purple Glow Aura */}
      <div className="mb-3 transform hover:scale-105 transition-transform duration-300">
        <OmagoLogo size={50} showGlow={true} variant="white" />
      </div>

      {/* Main Heading & Subheading matching screenshot typography */}
      <h1 className="text-2xl sm:text-3xl md:text-[34px] font-bold text-white tracking-tight text-center drop-shadow-sm">
        Hi, I&apos;m Omago AI
      </h1>
      <p className="mt-1 text-sm sm:text-base text-white/80 font-normal text-center drop-shadow-xs">
        How can I help you today?
      </p>

      {/* Large Rounded Frosted Glass Input Bar */}
      <div className="w-full max-w-[660px] mt-6 sm:mt-7">
        <div className="relative rounded-[28px] bg-white/25 hover:bg-white/30 focus-within:bg-white/35 backdrop-blur-2xl border border-white/50 shadow-[0_12px_40px_rgba(124,58,237,0.1),0_2px_8px_rgba(0,0,0,0.03)] focus-within:ring-2 focus-within:ring-white/80 focus-within:border-white transition-all duration-200 overflow-hidden">
          {/* Text input area */}
          <div className="pt-3.5 px-5 pb-2">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything..."
              rows={2}
              className="w-full bg-transparent resize-none border-none text-sm sm:text-[15px] text-white placeholder-white/70 focus:outline-none custom-scrollbar"
            />
          </div>

          {/* Bottom controls row inside the input bar */}
          <div className="px-4 pb-3 flex items-center justify-between gap-2">
            {/* Left side: Paperclip + Deep search pill */}
            <div className="flex items-center gap-2">
              {/* Paperclip attach icon */}
              <button
                type="button"
                aria-label="Attach file"
                className="w-7 h-7 rounded-full flex items-center justify-center text-white/80 hover:text-white bg-white/15 hover:bg-white/25 border border-white/30 transition"
              >
                <Paperclip className="w-3.5 h-3.5" />
              </button>

              {/* Deep search pill */}
              <button
                type="button"
                onClick={() => setIsDeepSearchActive(!isDeepSearchActive)}
                className={`rounded-full px-3.5 py-1 text-xs font-medium flex items-center gap-1.5 transition border backdrop-blur-md ${
                  isDeepSearchActive
                    ? 'bg-white/40 text-white border-white/60 shadow-sm'
                    : 'bg-white/15 text-white/80 border-white/30 hover:bg-white/25'
                }`}
              >
                <Search className="w-3 h-3 text-current" />
                <span>Deep search</span>
              </button>
            </div>

            {/* Right side: Search globe button */}
            <div>
              <button
                type="button"
                onClick={handleSend}
                className="rounded-full px-3.5 py-1 text-xs font-medium flex items-center gap-1.5 bg-white/25 hover:bg-white/40 text-white border border-white/50 backdrop-blur-md shadow-sm transition active:scale-95"
              >
                <Globe className="w-3.5 h-3.5 text-white/90" />
                <span>Search</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick-mode Frosted Pills Row */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mt-4">
          {quickModes.map((mode) => {
            const Icon = mode.icon;
            const isSelected = selectedMode === mode.id;

            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => setSelectedMode(mode.id)}
                className={`rounded-full px-4 py-1.5 text-xs sm:text-sm font-medium flex items-center gap-2 backdrop-blur-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/80 ${
                  isSelected
                    ? 'bg-white/45 text-white border border-white/70 shadow-sm ring-1 ring-white/60'
                    : 'bg-white/20 hover:bg-white/35 text-white/90 border border-white/35 shadow-xs'
                }`}
              >
                <Icon className="w-3.5 h-3.5 text-current" />
                <span>{mode.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
