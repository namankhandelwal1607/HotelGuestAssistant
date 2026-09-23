import React from 'react';
import { Clock, Waves, Users, Coffee, ShieldAlert, CalendarSearch, Car } from 'lucide-react';

interface QuickPromptsProps {
  onSelectPrompt: (prompt: string) => void;
  disabled?: boolean;
}

const PROMPTS = [
  { label: 'Check-in & Check-out', query: 'What time is check-in and check-out?', icon: Clock },
  { label: 'Swimming Pool', query: 'Does the hotel have a swimming pool?', icon: Waves },
  { label: 'Rooms for 3 Guests', query: 'Which room is suitable for three guests?', icon: Users },
  { label: 'Check Availability', query: 'I want to check room availability', icon: CalendarSearch },
  { label: 'Breakfast Policy', query: 'Is breakfast included in the room rate?', icon: Coffee },
  { label: 'Cancellation Policy', query: 'What is the cancellation policy?', icon: ShieldAlert },
  { label: 'Parking & EV', query: 'Is parking available and how much does it cost?', icon: Car },
];

export const QuickPrompts: React.FC<QuickPromptsProps> = ({ onSelectPrompt, disabled = false }) => {
  return (
    <div className="py-2 overflow-x-auto custom-scrollbar">
      <div className="flex items-center gap-2 pb-1 min-w-max">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1">
          Quick Inquiries:
        </span>
        {PROMPTS.map((p, idx) => {
          const Icon = p.icon;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectPrompt(p.query)}
              disabled={disabled}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white hover:bg-sky-50 text-slate-700 hover:text-sky-700 border border-slate-200 hover:border-sky-300 shadow-sm transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              <Icon className="w-3.5 h-3.5 text-sky-600" />
              <span>{p.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
