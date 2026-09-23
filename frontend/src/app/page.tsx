'use client';

import React, { useState } from 'react';
import { OmagoNavbar } from '../components/OmagoNavbar';
import { OmagoHero } from '../components/OmagoHero';
import { OmagoWidget } from '../components/OmagoWidget';
import { Code2, Check, Copy } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('Instant Chat');
  const [isWidgetOpen, setIsWidgetOpen] = useState(true);
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  const handleHeroSubmit = (prompt: string, mode: string) => {
    setIsWidgetOpen(true);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'Embed Chatbot') {
      setShowEmbedModal(true);
    } else if (tab === 'Instant Chat') {
      setIsWidgetOpen(true);
    }
  };

  const embedScriptSnippet = `<!-- Omago AI Chatbot Embed Widget -->
<script
  src="https://cdn.omago.ai/widget.js"
  data-bot-id="omago-digital-teammate"
  data-primary-color="#7C3AED"
  data-position="bottom-right"
  async>
</script>`;

  const copyToClipboard = () => {
    navigator.clipboard?.writeText(embedScriptSnippet);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  return (
    <div
      className="min-h-screen w-full relative selection:bg-purple-300 selection:text-purple-900 overflow-x-hidden flex flex-col justify-between"
      style={{
        background:
          'radial-gradient(ellipse 70% 65% at 50% 36%, #B686F7 0%, #C8A3FA 24%, #DABFFB 46%, #ECE0FD 70%, #F8F5FE 90%, #FAF9FE 100%)',
      }}
    >
      {/* Ambient background blur accent */}
      <div
        className="absolute top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[550px] bg-purple-500/20 rounded-full blur-[130px] pointer-events-none -z-10"
        aria-hidden="true"
      />

      {/* Top Navigation Bar */}
      <OmagoNavbar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onOpenWidget={() => setIsWidgetOpen(true)}
      />

      {/* Main Hero / Center Canvas Area */}
      <main className="flex-1 w-full flex flex-col justify-center items-center relative z-10 px-4">
        <div className="w-full max-w-4xl mx-auto">
          <OmagoHero onSubmitPrompt={handleHeroSubmit} />
        </div>
      </main>

      {/* Floating Chat Widget Docked Bottom-Right */}
      <OmagoWidget
        isOpen={isWidgetOpen}
        onToggle={() => setIsWidgetOpen(!isWidgetOpen)}
        botName="Omago Digital Teammate"
      />

      {/* Footer subtle attribution / spacer */}
      <footer className="w-full text-center py-3 text-[11px] text-neutral-500/60 font-medium">
        Omago AI Platform &bull; Instant Knowledge &bull; Embeddable Teammate
      </footer>

      {/* Embed Modal Dialog for 'Embed Chatbot' nav tab */}
      {showEmbedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[24px] max-w-lg w-full p-6 shadow-2xl border border-neutral-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2 text-purple-700">
                <Code2 className="w-5 h-5" />
                <h3 className="font-bold text-neutral-900 text-base">Embed Omago Chat Widget</h3>
              </div>
              <button
                onClick={() => setShowEmbedModal(false)}
                className="text-neutral-400 hover:text-neutral-700 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed">
              Add the following snippet directly before the closing{' '}
              <code className="bg-neutral-100 px-1 py-0.5 rounded text-purple-700 font-mono">
                &lt;/body&gt;
              </code>{' '}
              tag of your website or app to deploy the Omago Digital Teammate widget anywhere.
            </p>

            <div className="relative">
              <pre className="bg-neutral-900 text-neutral-100 p-3.5 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed">
                {embedScriptSnippet}
              </pre>
              <button
                onClick={copyToClipboard}
                className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium flex items-center gap-1 transition"
              >
                {copiedSnippet ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowEmbedModal(false)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full text-xs font-semibold shadow-sm transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
