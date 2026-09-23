'use client';

import React, { useState } from 'react';
import { Message } from '../types';
import { sendChatMessage } from '../services/api';
import { MessageList } from './MessageList';
import { QuickPrompts } from './QuickPrompts';
import { Send, AlertCircle, RefreshCw } from 'lucide-react';

export const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content: 'Welcome to The Grand Azure Resort & Spa! How may I assist you with your stay today? You can ask about our oceanfront amenities, dining, check-in policies, or check live room availability for specific dates.',
      timestamp: new Date().toISOString(),
      intent: 'faq'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);
  const [bannerError, setBannerError] = useState<string | null>(null);

  const handleSendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    setBannerError(null);
    setLastFailedMessage(null);

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date().toISOString()
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
        missingFields: response.missingFields
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      setLastFailedMessage(trimmed);
      setBannerError(err.message || 'Failed to reach the concierge server.');

      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `I'm sorry, I encountered an issue: ${err.message || 'Unable to connect to the hotel concierge backend.'}`,
        timestamp: new Date().toISOString(),
        isError: true
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

  const handleAvailabilityFormSubmit = (checkIn: string, checkOut: string, adults: number) => {
    const message = `Check room availability from ${checkIn} to ${checkOut} for ${adults} guest${adults > 1 ? 's' : ''}`;
    handleSendMessage(message);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputValue);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-5xl mx-auto bg-slate-50/50 rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
      {/* Top Banner Alert on Error */}
      {bannerError && (
        <div className="bg-rose-50 border-b border-rose-200 px-4 py-2.5 flex items-center justify-between text-xs text-rose-800">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{bannerError}</span>
          </div>
          {lastFailedMessage && (
            <button
              onClick={handleRetry}
              className="inline-flex items-center gap-1 font-semibold text-rose-700 hover:text-rose-900 underline"
            >
              <RefreshCw className="w-3 h-3" />
              Retry Now
            </button>
          )}
        </div>
      )}

      {/* Message List */}
      <MessageList
        messages={messages}
        isLoading={isLoading}
        onRetry={handleRetry}
        onSubmitAvailability={handleAvailabilityFormSubmit}
      />

      {/* Quick Prompts Bar */}
      <div className="px-4 sm:px-6 bg-white/90 border-t border-slate-200/80">
        <QuickPrompts onSelectPrompt={handleSendMessage} disabled={isLoading} />
      </div>

      {/* Chat Input Container */}
      <div className="p-4 sm:px-6 sm:pb-6 bg-white">
        <form onSubmit={handleSubmit} className="relative flex items-end gap-2">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            rows={1}
            placeholder="Ask about pool hours, check-in, 3-guest rooms, or check room dates..."
            className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent disabled:bg-slate-100 min-h-[46px] max-h-32 shadow-inner"
          />

          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="shrink-0 h-[46px] px-4 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 disabled:opacity-40 text-white font-medium flex items-center justify-center gap-1.5 transition-all shadow-md shadow-sky-600/20 active:scale-95"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline text-xs font-semibold">Send</span>
          </button>
        </form>
        <p className="text-[11px] text-slate-400 mt-2 text-center">
          Press <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded text-[10px]">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded text-[10px]">Shift+Enter</kbd> for a new line
        </p>
      </div>
    </div>
  );
};
