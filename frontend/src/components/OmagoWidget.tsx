'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Paperclip,
  Smile,
  Search,
  RotateCw,
  Mic,
  MessageSquare,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { OmagoLogo } from './OmagoLogo';

export interface WidgetMessage {
  id: string;
  sender: 'bot' | 'user';
  senderName: string;
  senderAvatar?: string;
  time: string;
  text: string;
  subtext?: string;
  actionLinks?: { label: string; url?: string; action?: string }[];
  showSecondaryButtons?: boolean;
}

export interface OmagoWidgetProps {
  initialOpen?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
  botName?: string;
  userAvatar?: string;
  userName?: string;
  apiEndpoint?: string;
  className?: string;
}

const DEFAULT_MESSAGES: WidgetMessage[] = [
  {
    id: 'msg-1',
    sender: 'bot',
    senderName: 'Omago',
    time: '10:30 PM',
    text: 'Hi 👋 King Mak! We help companies provide instant, accurate, and on-brand responses to their clients 24/7.',
    subtext: 'Here are a few ways I can assist you right now:',
    actionLinks: [
      { label: 'Learn your products & policies 🔗', action: 'learn_policies' },
      { label: 'Chat with Omago services 🗨️', action: 'chat_services' },
    ],
    showSecondaryButtons: true,
  },
  {
    id: 'msg-2',
    sender: 'user',
    senderName: 'King Mak',
    time: '10:32 PM',
    text: 'Yes, I am ready to chat with Omago Service.',
  },
];

export const OmagoWidget: React.FC<OmagoWidgetProps> = ({
  initialOpen = true,
  isOpen: controlledIsOpen,
  onToggle,
  botName = 'Omago Digital Teammate',
  userAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80',
  userName = 'King Mak',
  apiEndpoint = '/api/chat',
  className = '',
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(initialOpen);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  const [messages, setMessages] = useState<WidgetMessage[]>(DEFAULT_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isDeepSearch, setIsDeepSearch] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const toggleOpen = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalIsOpen(!internalIsOpen);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const currentTime = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    const userMsg: WidgetMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      senderName: userName,
      time: currentTime,
      text: text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      // Call backend route handler
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      if (response.ok) {
        const data = await response.json();
        const replyText =
          data.reply ||
          data.message ||
          "I'd be thrilled to assist you with that! Our team is standing by to deliver flawless on-brand customer experiences.";

        const botReply: WidgetMessage = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          senderName: 'Omago',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: replyText,
        };

        setMessages((prev) => [...prev, botReply]);
      } else {
        throw new Error('API returned status ' + response.status);
      }
    } catch {
      // Graceful on-brand response fallback
      const fallbackReply: WidgetMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        senderName: 'Omago',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `Got it! I am ready to assist with "${text}". Whether you need customer onboarding, product FAQs, or live workflow automation, I've got you covered.`,
        actionLinks: [
          { label: 'Schedule an Omago integration demo ⚡', action: 'demo' },
        ],
      };
      setMessages((prev) => [...prev, fallbackReply]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleActionClick = (actionLabel: string) => {
    handleSendMessage(actionLabel.replace(/[^\w\s&]/gi, '').trim());
  };

  return (
    <aside
      aria-label="Omago Chat Assistant"
      className={`fixed z-50 flex flex-col items-end gap-3 bottom-5 right-5 sm:bottom-6 sm:right-6 ${className}`}
    >
      {/* Floating Popup Card */}
      <div
        className={`w-[calc(100vw-2.5rem)] sm:w-[350px] md:w-[365px] bg-white/95 backdrop-blur-xl rounded-[22px] shadow-[0_20px_60px_-10px_rgba(20,15,35,0.22),0_4px_16px_rgba(124,58,237,0.06)] border border-white/80 overflow-hidden flex flex-col transition-all duration-300 ease-out origin-bottom-right ${
          isOpen
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 scale-90 translate-y-4 pointer-events-none'
        }`}
        style={{ maxHeight: 'calc(100vh - 100px)' }}
      >
        {/* Header Row */}
        <div className="px-4 py-3 flex items-center justify-between border-b border-neutral-100/80 bg-white/70">
          <div className="flex items-center gap-2.5 min-w-0">
            <OmagoLogo size={28} showGlow={false} />
            <div className="flex flex-col min-w-0">
              <span className="text-xs sm:text-[13px] font-bold text-neutral-900 tracking-tight leading-tight truncate">
                {botName}
              </span>
              <span className="text-[10px] text-neutral-400 font-normal leading-tight truncate">
                We help companies provide instant...
              </span>
            </div>
          </div>

          {/* Dark Circular "X" Close Button */}
          <button
            type="button"
            onClick={toggleOpen}
            aria-label="Close chat widget"
            className="w-6 h-6 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white flex items-center justify-center transition-colors flex-shrink-0"
          >
            <X className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto px-4 py-3.5 space-y-4 max-h-[360px] custom-scrollbar bg-gradient-to-b from-transparent to-purple-50/20">
          {messages.map((msg) => {
            const isBot = msg.sender === 'bot';

            if (isBot) {
              return (
                <div key={msg.id} className="flex flex-col items-start space-y-1.5 max-w-[95%]">
                  {/* Sender Header with timestamp */}
                  <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 font-medium pl-1">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-purple-600 to-fuchsia-500 flex items-center justify-center text-white">
                      <span className="text-[8px] font-bold">O</span>
                    </div>
                    <span className="text-neutral-700 font-semibold">{msg.senderName}</span>
                    <span>•</span>
                    <span>{msg.time}</span>
                  </div>

                  {/* Lavender Tinted Rounded Message Bubble */}
                  <div className="rounded-[18px] rounded-tl-sm bg-[#F7F4FD] border border-purple-100/80 p-3 shadow-xs text-neutral-800 space-y-2">
                    <p className="text-xs leading-relaxed font-normal">{msg.text}</p>
                    {msg.subtext && (
                      <p className="text-xs leading-relaxed text-neutral-600 font-normal">
                        {msg.subtext}
                      </p>
                    )}

                    {/* Interactive Purple Links */}
                    {msg.actionLinks && msg.actionLinks.length > 0 && (
                      <div className="pt-1 flex flex-col gap-1.5">
                        {msg.actionLinks.map((link, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleActionClick(link.label)}
                            className="text-left text-xs font-semibold text-purple-700 hover:text-purple-900 hover:underline transition flex items-center gap-1 group py-0.5"
                          >
                            <span>{link.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Secondary Action Buttons (Chat & Voice) */}
                  {msg.showSecondaryButtons && (
                    <div className="pt-1 flex items-center gap-2 pl-0.5">
                      <button
                        type="button"
                        onClick={() => handleSendMessage('Let us chat')}
                        className="rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-[11px] font-medium px-3 py-1.5 flex items-center gap-1.5 transition active:scale-95 border border-neutral-200/40"
                      >
                        <RotateCw className="w-3 h-3 text-neutral-500" />
                        <span>Chat</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSendMessage('Voice assistance')}
                        className="rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-[11px] font-medium px-3 py-1.5 flex items-center gap-1.5 transition active:scale-95 border border-neutral-200/40"
                      >
                        <Mic className="w-3 h-3 text-neutral-500" />
                        <span>Voice</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            }

            // User Message
            return (
              <div key={msg.id} className="flex flex-col items-end space-y-1 w-full">
                {/* User Header */}
                <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 font-medium pr-1">
                  <span>{msg.senderName}</span>
                  <span>•</span>
                  <span>{msg.time}</span>
                  <img
                    src={userAvatar}
                    alt={msg.senderName}
                    className="w-4 h-4 rounded-full object-cover ring-1 ring-neutral-200"
                  />
                </div>

                {/* Right-Aligned Dark Charcoal Bubble */}
                <div className="rounded-[18px] rounded-tr-sm bg-neutral-900 text-white p-3 text-xs leading-relaxed max-w-[85%] shadow-sm">
                  {msg.text}
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 pl-1">
              <div className="w-4 h-4 rounded-full bg-purple-600 flex items-center justify-center text-white text-[8px] font-bold">
                O
              </div>
              <div className="bg-[#F7F4FD] border border-purple-100 rounded-full px-3 py-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Footer / Input Row */}
        <div className="border-t border-neutral-100/90 px-3.5 pt-2.5 pb-3 bg-white/90">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type message..."
            className="w-full bg-transparent border-none text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none mb-2 px-1"
          />

          {/* Icons Row: Paperclip, Smiley, Deep Search, and Purple Send Button */}
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                aria-label="Attach file"
                className="w-6 h-6 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition"
              >
                <Paperclip className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                aria-label="Insert emoji"
                className="w-6 h-6 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition"
              >
                <Smile className="w-3.5 h-3.5" />
              </button>

              {/* Deep Search Pill */}
              <button
                type="button"
                onClick={() => setIsDeepSearch(!isDeepSearch)}
                className={`rounded-full px-2 py-0.5 text-[10px] font-medium flex items-center gap-1 transition ${
                  isDeepSearch
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-neutral-500 hover:text-neutral-800 bg-neutral-100/80 hover:bg-neutral-100'
                }`}
              >
                <Search className="w-2.5 h-2.5" />
                <span>Deep Search</span>
              </button>
            </div>

            {/* Circular Purple Send Button */}
            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim()}
              aria-label="Send message"
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                inputText.trim()
                  ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-sm shadow-purple-500/30 scale-100 active:scale-95'
                  : 'bg-purple-600/70 text-white/80 cursor-not-allowed'
              }`}
            >
              <Send className="w-3 h-3 -translate-x-[0.5px] translate-y-[0.5px]" />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Circular Launcher Button (Sitting below/beside the widget panel) */}
      <button
        type="button"
        onClick={toggleOpen}
        aria-label={isOpen ? 'Close chat' : 'Open Omago AI assistant'}
        className="w-11 h-11 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white flex items-center justify-center shadow-xl shadow-neutral-900/25 transition-all duration-200 hover:scale-105 active:scale-95 border border-white/20 select-none group"
      >
        {isOpen ? (
          <X className="w-5 h-5 stroke-[2.5] text-white" />
        ) : (
          <div className="relative flex items-center justify-center">
            <OmagoLogo size={24} showGlow={false} />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-fuchsia-400 ring-2 ring-neutral-900" />
          </div>
        )}
      </button>
    </aside>
  );
};
