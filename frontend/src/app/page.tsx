import React from 'react';
import { Navbar } from '../components/Navbar';
import { ChatInterface } from '../components/ChatInterface';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-slate-100/60">
      <Navbar />
      <div className="flex-1 w-full max-w-6xl mx-auto px-3 sm:px-6 py-4 flex flex-col justify-center">
        <ChatInterface />
      </div>
      <footer className="text-center py-3 text-[11px] text-slate-400 border-t border-slate-200/60 bg-white/60">
        © {new Date().getFullYear()} The Grand Azure Resort & Spa · 742 Oceanview Blvd, Monterey Bay, CA · Direct Concierge line: (831) 555-0199
      </footer>
    </main>
  );
}
