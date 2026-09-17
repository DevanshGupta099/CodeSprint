import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '../context/ThemeContext';
import { ThemeTransitionOverlay } from '../components/common/ThemeTransitionOverlay';

const sans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'VeritasSupply — Autonomous Tier-N Supply Chain Disruption Intelligence',
  description: 'Enterprise AI Tier-N Supply Chain Disruption & ESG Intelligence Platform',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    shortcut: '/icon.svg',
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${sans.variable} ${jetbrainsMono.variable}`}>
      <head>
        {/* Browser Tab Favicon Links */}
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="alternate icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
        {/* Preload critical self-hosted exact font binaries for instant zero-latency rendering */}
        <link rel="preload" href="/fonts/fraunces-900.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/instrumentserif-italic.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/jetbrainsmono-400.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        {/* Anti-FOUC immediate theme hydration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var stored = localStorage.getItem('veritas_theme');
                if (stored === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="bg-[#EAE7E1] dark:bg-[#07090E] text-[#1A1917] dark:text-slate-100 min-h-screen antialiased font-sans selection:bg-neutral-900 selection:text-white dark:selection:bg-cyan-500/30 dark:selection:text-cyan-200">
        <ThemeProvider>
          <ThemeTransitionOverlay />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
