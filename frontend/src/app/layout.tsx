import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'VeritasSupply — Autonomous Tier-N Supply Chain Disruption Intelligence',
  description: 'Bespoke editorial intelligence engine for Tier-N supply chain disruption & sanctions monitoring.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#EAE7E1] text-[#1A1917] min-h-screen antialiased selection:bg-neutral-900 selection:text-white">
        {children}
      </body>
    </html>
  );
}
