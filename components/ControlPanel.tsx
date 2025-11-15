"use client";

import React, { useRef, useState } from 'react';
import { Emotion, useAppStore } from '@/lib/store';
import { useAudioEngine } from '@/lib/useAudioEngine';
import { recordCanvasWithAudio, webmToMp4 } from '@/lib/exporter';

const EMOTIONS: Emotion[] = ['neutral', 'happy', 'sad', 'angry', 'surprised'];
const VOICES = [
  { id: 'alloy', name: 'Alloy' },
  { id: 'verse', name: 'Verse' },
  { id: 'aria', name: 'Aria' },
];

export function ControlPanel({ onAmplitude }: { onAmplitude: (v: number) => void }) {
  const { mode, setMode, emotion, setEmotion, voice, setVoice, text, setText, imageObjectUrl, setImageObjectUrl } = useAppStore();
  const { tts, stt, playAudioBuffer, getAmplitude } = useAudioEngine();
  const [busy, setBusy] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Animation tick -> notify mouth amplitude
  // Run only on client after mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => {
    let raf = 0;
    const tick = () => {
      onAmplitude(getAmplitude());
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [getAmplitude, onAmplitude]);

  const handleImage = (file: File) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (imageObjectUrl) URL.revokeObjectURL(imageObjectUrl);
    setImageObjectUrl(url);
    setMode('image');
  };

  const handleAudioUpload = async (file: File) => {
    setBusy(true);
    try {
      const transcript = await stt(file);
      setText(transcript);
    } finally {
      setBusy(false);
    }
  };

  const handlePreview = async () => {
    if (!text.trim()) return;
    setBusy(true);
    try {
      const blob = await tts(text, voice, 'mp3');
      const { audio } = await playAudioBuffer(blob);
      audioRef.current = audio;
    } finally {
      setBusy(false);
    }
  };

  const handleExport = async () => {
    if (!audioRef.current) return;
    setBusy(true);
    try {
      // Find the render surface
      const node = document.getElementById('render-surface') as HTMLElement;
      const canvas = node.querySelector('canvas') as HTMLCanvasElement;
      const audio = audioRef.current;
      const duration = Math.ceil(audio.duration * 1000);
      const webm = await recordCanvasWithAudio(canvas, audio, duration);
      let mp4: Blob | null = null;
      try {
        mp4 = await webmToMp4(webm);
      } catch {
        mp4 = null;
      }
      const out = mp4 ?? webm;
      const url = URL.createObjectURL(out);
      const a = document.createElement('a');
      a.href = url;
      a.download = mp4 ? 'avatar.mp4' : 'avatar.webm';
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between bg-[var(--panel)]/70 border border-white/5 rounded-xl p-3">
          <div className="flex items-center gap-2">
            <button onClick={() => setMode('image')} className={`px-3 py-2 rounded-lg transition ${mode==='image'?'bg-white/10':'hover:bg-white/5'}`}>Image</button>
            <button onClick={() => setMode('3d')} className={`px-3 py-2 rounded-lg transition ${mode==='3d'?'bg-white/10':'hover:bg-white/5'}`}>3D Avatar</button>
          </div>
          <div className="flex items-center gap-2">
            {EMOTIONS.map((e) => (
              <button key={e} onClick={() => setEmotion(e)} className={`px-3 py-2 rounded-lg capitalize transition ${emotion===e?'bg-[var(--accent-2)]/30':'hover:bg-white/5'}`}>{e}</button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-[var(--panel)]/70 border border-white/5 rounded-xl p-4">
            <label className="text-sm text-[var(--muted)]">Script</label>
            <textarea value={text} onChange={(e)=>setText(e.target.value)} placeholder="Type what your avatar should say..." className="mt-2 w-full h-36 bg-black/20 rounded-lg p-3 outline-none" />
            <div className="mt-3 flex items-center gap-3">
              <select value={voice} onChange={(e)=>setVoice(e.target.value)} className="bg-black/20 rounded-lg p-2">
                {VOICES.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
              <label className="cursor-pointer px-3 py-2 bg-white/5 rounded-lg hover:bg-white/10">
                Upload audio
                <input type="file" accept="audio/*" className="hidden" onChange={(e)=> e.target.files && handleAudioUpload(e.target.files[0])} />
              </label>
              <button onClick={handlePreview} disabled={busy} className="px-4 py-2 rounded-lg bg-[var(--accent)]/20 hover:bg-[var(--accent)]/30 disabled:opacity-50">Preview</button>
              <button onClick={handleExport} disabled={busy} className="px-4 py-2 rounded-lg bg-[var(--accent-2)]/30 hover:bg-[var(--accent-2)]/40 disabled:opacity-50">Export MP4</button>
            </div>
          </div>

          <div className="bg-[var(--panel)]/70 border border-white/5 rounded-xl p-4 flex flex-col gap-3 items-center justify-center">
            <label className="cursor-pointer px-3 py-2 bg-white/5 rounded-lg hover:bg-white/10">
              Upload image
              <input type="file" accept="image/*" className="hidden" onChange={(e)=> e.target.files && handleImage(e.target.files[0])} />
            </label>
            {imageObjectUrl && <span className="text-xs text-[var(--muted)]">Image selected</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
