"use client";

import { useState } from 'react';
import { ControlPanel } from '@/components/ControlPanel';
import { AvatarCanvas } from '@/components/AvatarCanvas';
import { ImageAvatar } from '@/components/ImageAvatar';
import { useAppStore } from '@/lib/store';

export default function Page() {
  const { mode } = useAppStore();
  const [amplitude, setAmplitude] = useState(0);

  return (
    <main className="min-h-screen pb-20">
      <header className="sticky top-0 z-20 backdrop-blur bg-black/30 border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="font-semibold tracking-wide">AI Lip?Sync Avatar Generator</div>
          <div className="text-sm text-[var(--muted)]">Real?time preview ? Export MP4</div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto p-4 grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <div id="render-surface" className="aspect-video w-full rounded-xl overflow-hidden border border-white/5 bg-[var(--panel)]/60">
            {mode === '3d' ? (
              <AvatarCanvas amplitude={amplitude} />
            ) : (
              <ImageAvatar amplitude={amplitude} />
            )}
          </div>
        </div>
        <div className="lg:col-span-1">
          <ControlPanel onAmplitude={setAmplitude} />
        </div>
      </div>

      <footer className="max-w-5xl mx-auto px-4 text-[var(--muted)] text-xs">
        <p>Tip: Try different emotions and voices. Upload audio to auto-generate the script.</p>
      </footer>
    </main>
  );
}
