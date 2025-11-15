import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Lip-Sync Avatar Generator',
  description: 'Generate lip-synced talking avatars from text or audio',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen text-[var(--text)] selection:bg-[var(--accent)]/30 antialiased">
        {children}
      </body>
    </html>
  );
}
