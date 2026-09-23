import React, { useEffect, useRef } from 'react';
import { Message } from '../types';
import { MessageBubble } from './MessageBubble';
import { Bot, Sparkles } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  onRetry: (messageId: string) => void;
  onSubmitAvailability: (checkIn: string, checkOut: string, adults: number) => void;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isLoading,
  onRetry,
  onSubmitAvailability
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 custom-scrollbar">
      {/* Welcome Card if no messages */}
      {messages.length === 0 && (
        <div className="my-8 text-center max-w-md mx-auto p-6 bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-700 flex items-center justify-center text-white mx-auto mb-3 shadow-md shadow-sky-500/20">
            <Bot className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 mb-1">
            Welcome to The Grand Azure
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed mb-4">
            I am your dedicated AI guest concierge. Ask me anything about our oceanfront amenities, check-in policies, room suitability, or check live room availability for your stay.
          </p>
          <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Strictly grounded in verified hotel facts & real-time inventory</span>
          </div>
        </div>
      )}

      {/* Render Messages */}
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          onRetry={() => onRetry(message.id)}
          onSubmitAvailability={onSubmitAvailability}
          disabled={isLoading}
        />
      ))}

      {/* Loading Indicator */}
      {isLoading && (
        <div className="flex gap-3 my-4 items-start">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-600 to-indigo-700 flex items-center justify-center text-white shrink-0 shadow-sm mt-1">
            <Bot className="w-4 h-4" />
          </div>
          <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-2">
            <span className="text-xs text-slate-600 font-medium">Concierge is checking...</span>
            <div className="flex space-x-1 items-center">
              <div className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <div className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <div className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-bounce" />
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
};
