import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'VeritasSupply // Autonomous Tier-N Intel Engine',
  description: 'Autonomous AI Tier-N Supply Chain Disruption & Sanctions/ESG Intelligence Engine',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#07090E] text-slate-100 min-h-screen antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
        {children}
      </body>
    </html>
  );
}
