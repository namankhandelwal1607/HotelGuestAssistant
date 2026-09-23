import React from 'react';
import { Message, AvailabilityField } from '../types';
import { AvailabilityCard } from './AvailabilityCard';
import { AvailabilityForm } from './AvailabilityForm';
import { Bot, User, AlertCircle, RefreshCw, Sparkles } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  onRetry?: () => void;
  onSubmitAvailability?: (checkIn: string, checkOut: string, adults: number) => void;
  disabled?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  onRetry,
  onSubmitAvailability,
  disabled = false
}) => {
  const isUser = message.role === 'user';
  const hasRooms = Boolean(message.data?.rooms && Array.isArray(message.data.rooms));
  const hasMissingFields = Boolean(message.missingFields && message.missingFields.length > 0);

  return (
    <div className={`flex gap-3 my-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {/* Assistant Avatar */}
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-600 to-indigo-700 flex items-center justify-center text-white shrink-0 shadow-sm mt-1">
          <Bot className="w-4 h-4" />
        </div>
      )}

      <div className={`flex flex-col max-w-[90%] sm:max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Message Container */}
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? 'bg-slate-900 text-white rounded-br-sm shadow-sm'
              : message.isError
              ? 'bg-rose-50 border border-rose-200 text-rose-900 rounded-bl-sm shadow-sm'
              : 'bg-white border border-slate-200/90 text-slate-800 rounded-bl-sm shadow-sm'
          }`}
        >
          {/* Intent Tag for Assistant */}
          {!isUser && message.intent && (
            <div className="flex items-center gap-1.5 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-sky-700">
              <Sparkles className="w-3 h-3" />
              <span>
                {message.intent === 'availability'
                  ? 'Room Inventory Service'
                  : message.intent === 'faq'
                  ? 'Concierge Knowledge Base'
                  : 'Assistant Assistance'}
              </span>
            </div>
          )}

          {/* Main Content Text */}
          <div className="whitespace-pre-line space-y-2">
            {message.content}
          </div>

          {/* Error & Retry */}
          {message.isError && onRetry && (
            <div className="mt-3 pt-2 border-t border-rose-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 text-xs text-rose-700">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>Message delivery failed</span>
              </div>
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center gap-1 px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-xs font-medium transition-colors shadow-sm"
              >
                <RefreshCw className="w-3 h-3" />
                Retry
              </button>
            </div>
          )}
        </div>

        {/* Inline Stay Date & Guest Picker Form */}
        {hasMissingFields && onSubmitAvailability && (
          <div className="w-full mt-2">
            <AvailabilityForm
              missingFields={message.missingFields}
              prefilled={message.data?.provided || message.data?.providedFields}
              onSubmit={onSubmitAvailability}
              disabled={disabled}
            />
          </div>
        )}

        {/* Availability Room Cards List */}
        {hasRooms && message.data?.rooms && (
          <div className="w-full mt-3 space-y-2.5">
            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
              <span>
                Stay: {message.data.checkIn} to {message.data.checkOut} ({message.data.nights} night
                {message.data.nights > 1 ? 's' : ''})
              </span>
              <span className="font-medium text-slate-700">
                {message.data.totalAvailableCount} of {message.data.rooms.length} room types available
              </span>
            </div>

            {message.data.rooms.map((room: any) => (
              <AvailabilityCard key={room.roomTypeId} room={room} />
            ))}
          </div>
        )}

        {/* Timestamp */}
        <span className="text-[10px] text-slate-400 mt-1 px-1">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 shrink-0 shadow-sm mt-1">
          <User className="w-4 h-4" />
        </div>
      )}
    </div>
  );
};
