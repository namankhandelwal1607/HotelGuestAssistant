'use client';

import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  RefreshCw,
  AlertCircle,
  Compass,
} from 'lucide-react';
import { Message } from '../../types';
import { sendChatMessage } from '../../services/api';
import { MessageList } from '../MessageList';

export interface FloatingHotelAssistantHandle {
  openChat: (initialQuery?: string) => void;
}

interface FloatingHotelAssistantProps {
  initialOpen?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
}

const SUGGESTED_QUESTIONS = [
  'What time is check-in?',
  'Does the hotel have a pool?',
  'Is breakfast included?',
  'What rooms are available?',
  'What is the cancellation policy?',
];

export const FloatingHotelAssistant = forwardRef<
  FloatingHotelAssistantHandle,
  FloatingHotelAssistantProps
>(({ initialOpen = false, isOpen: controlledIsOpen, onToggle }, ref) => {
  const [internalIsOpen, setInternalIsOpen] = useState(initialOpen);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content:
        "Hi! I'm your Hotel Assistant. I can help with rooms, amenities, policies, and availability.",
      timestamp: new Date().toISOString(),
      intent: 'faq',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);
  const [bannerError, setBannerError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const toggleOpen = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalIsOpen(!internalIsOpen);
    }
  };

  const handleSendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    setBannerError(null);
    setLastFailedMessage(null);

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await sendChatMessage(trimmed, conversationId, updatedMessages);

      if (response.conversationId) {
        setConversationId(response.conversationId);
      }

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.reply,
        timestamp: new Date().toISOString(),
        intent: response.intent,
        data: response.data,
        missingFields: response.missingFields,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      setLastFailedMessage(trimmed);
      setBannerError(err.message || 'Failed to reach the concierge server.');

      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `I'm sorry, I encountered an issue: ${
          err.message || 'Unable to connect to the hotel concierge backend.'
        }`,
        timestamp: new Date().toISOString(),
        isError: true,
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    if (lastFailedMessage) {
      handleSendMessage(lastFailedMessage);
    }
  };

  const handleAvailabilityFormSubmit = (
    checkIn: string,
    checkOut: string,
    adults: number
  ) => {
    const message = `Check room availability from ${checkIn} to ${checkOut} for ${adults} guest${
      adults > 1 ? 's' : ''
    }`;
    handleSendMessage(message);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage(inputValue);
    }
  };

  // Expose imperative handle so external buttons (Hero, BookingBar, Callout) can trigger the assistant
  useImperativeHandle(ref, () => ({
    openChat: (initialQuery?: string) => {
      if (!isOpen) {
        if (onToggle) {
          onToggle();
        } else {
          setInternalIsOpen(true);
        }
      }
      if (initialQuery) {
        setTimeout(() => {
          handleSendMessage(initialQuery);
        }, 150);
      } else {
        setTimeout(() => {
          inputRef.current?.focus();
        }, 200);
      }
    },
  }));

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen]);

  return (
    <aside
      aria-label="Hotel Assistant"
      className="fixed z-50 flex flex-col items-end gap-3 bottom-5 right-5 sm:bottom-6 sm:right-6 pointer-events-none"
    >
      {/* Floating Chat Window */}
      <div
        className={`w-[calc(100vw-2.5rem)] sm:w-[420px] md:w-[440px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col transition-all duration-300 ease-out origin-bottom-right pointer-events-auto ${
          isOpen
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-90 translate-y-6 pointer-events-none'
        }`}
        style={{ height: 'min(620px, calc(100vh - 110px))' }}
      >
        {/* Header */}
        <div className="px-4 py-3.5 bg-slate-900 text-white flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 text-amber-400 flex items-center justify-center shrink-0">
              <Compass className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold tracking-wide text-white truncate">
                  Hotel Assistant
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <span className="text-[11px] text-slate-300 font-light truncate">
                Azure Grand Hotel · 24/7 Concierge
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleOpen}
            aria-label="Close Hotel Assistant"
            className="w-7 h-7 rounded-full hover:bg-white/10 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Error Banner */}
        {bannerError && (
          <div className="bg-rose-50 border-b border-rose-200 px-3 py-2 flex items-center justify-between text-xs text-rose-800">
            <div className="flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span className="truncate max-w-[260px]">{bannerError}</span>
            </div>
            {lastFailedMessage && (
              <button
                type="button"
                onClick={handleRetry}
                className="inline-flex items-center gap-1 font-semibold text-rose-700 hover:text-rose-900 underline text-[11px]"
              >
                <RefreshCw className="w-2.5 h-2.5" />
                Retry
              </button>
            )}
          </div>
        )}

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto bg-slate-50/50 flex flex-col">
          <MessageList
            messages={messages}
            isLoading={isLoading}
            onRetry={handleRetry}
            onSubmitAvailability={handleAvailabilityFormSubmit}
          />
        </div>

        {/* Suggested Questions Chips */}
        <div className="px-3 py-2 bg-slate-100/90 border-t border-slate-200/80 overflow-x-auto custom-scrollbar">
          <div className="flex items-center gap-1.5 min-w-max">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mr-0.5">
              Ask:
            </span>
            {SUGGESTED_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                type="button"
                disabled={isLoading}
                onClick={() => handleSendMessage(q)}
                className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-white hover:bg-slate-200/80 text-slate-700 border border-slate-200 hover:border-slate-300 transition-colors shadow-2xs disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input Form */}
        <div className="p-3 bg-white border-t border-slate-200">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              placeholder="Ask about rooms, pool, breakfast, policies..."
              className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 text-slate-900 placeholder-slate-400 transition-colors"
            />

            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              aria-label="Send message to Hotel Assistant"
              className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white flex items-center justify-center transition-all shadow-xs shrink-0 active:scale-95"
            >
              <Send className="w-3.5 h-3.5 text-amber-400" />
            </button>
          </form>
        </div>
      </div>

      {/* Floating Bottom-Right Launcher Button */}
      <button
        type="button"
        onClick={toggleOpen}
        aria-label={isOpen ? 'Close Hotel Assistant' : 'Open Hotel Assistant'}
        className="pointer-events-auto w-14 h-14 rounded-full bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center shadow-xl shadow-slate-900/30 transition-all duration-200 hover:scale-105 active:scale-95 border-2 border-amber-400/40 select-none group"
      >
        {isOpen ? (
          <X className="w-6 h-6 stroke-[2.5] text-amber-300" />
        ) : (
          <div className="relative flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-amber-400" />
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-slate-900" />
          </div>
        )}
      </button>
    </aside>
  );
});

FloatingHotelAssistant.displayName = 'FloatingHotelAssistant';
