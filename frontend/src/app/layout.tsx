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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${sans.variable} ${jetbrainsMono.variable}`}>
      <head>
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
