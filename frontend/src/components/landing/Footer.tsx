'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUpRight, Terminal, Shield, FileText, Globe } from 'lucide-react';

interface FooterProps {
  monitoredNodes: number;
}

export const Footer: React.FC<FooterProps> = ({ monitoredNodes }) => {
  const router = useRouter();

  return (
    <footer className="w-full bg-[#030406] text-white border-t border-white/10 pt-20 pb-12 px-6 sm:px-12 md:px-16 font-mono text-xs select-none">
      <div className="max-w-7xl mx-auto flex flex-col gap-16">
        {/* Top Wordmark & Fast Dispatch Banner */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-12 border-b border-white/10 gap-6">
          <div className="space-y-2">
            <span className="font-serif tracking-tight lowercase text-3xl sm:text-4xl text-white font-normal block">
              veritas supply
            </span>
            <span className="text-neutral-500 text-xs block">
              AUTONOMOUS TIER-N SUPPLY CHAIN DISRUPTION &amp; ESG INTELLIGENCE
            </span>
          </div>

          <button
            onClick={() => router.push('/dashboard')}
            className="group px-6 py-3.5 bg-white text-black hover:bg-rose-400 font-mono text-xs font-bold rounded-full transition-all flex items-center gap-2 cursor-pointer shadow-lg active:scale-95"
          >
            <span>INITIALIZE TACTICAL COMMAND</span>
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>

        {/* 4-Column Directory Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 font-mono text-xs text-neutral-400">
          {/* Column 1: Product */}
          <div className="space-y-4">
            <div className="text-white font-semibold tracking-wider text-[11px] uppercase">
              [ 01 // PRODUCT ]
            </div>
            <ul className="space-y-2.5">
              <li>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="hover:text-rose-400 transition-colors text-left"
                >
                  Tactical Command Dashboard
                </button>
              </li>
              <li>
                <a href="#scene-03" className="hover:text-rose-400 transition-colors">
                  CTE Dependency Graph Engine
                </a>
              </li>
              <li>
                <a href="#scene-02" className="hover:text-rose-400 transition-colors">
                  Upstream Disruption Sentinel
                </a>
              </li>
              <li>
                <span className="text-neutral-600 cursor-not-allowed">Enterprise Pricing (Tier-4 Custom)</span>
              </li>
            </ul>
          </div>

          {/* Column 2: Company */}
          <div className="space-y-4">
            <div className="text-white font-semibold tracking-wider text-[11px] uppercase">
              [ 02 // COMPANY ]
            </div>
            <ul className="space-y-2.5">
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">About Veritas Intelligence</span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">Geopolitical Threat Research</span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">Careers (Distributed Systems)</span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">Security &amp; Vulnerability Disclosure</span>
              </li>
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div className="space-y-4">
            <div className="text-white font-semibold tracking-wider text-[11px] uppercase">
              [ 03 // RESOURCES ]
            </div>
            <ul className="space-y-2.5">
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">API Documentation (REST / GraphQL)</span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">Automated BOM Ingestion Guide</span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">Global Sanctions Feeds (UFLPA / OFAC)</span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">Scope-3 Carbon Avoidance Whitepaper</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal & Governance */}
          <div className="space-y-4">
            <div className="text-white font-semibold tracking-wider text-[11px] uppercase">
              [ 04 // LEGAL ]
            </div>
            <ul className="space-y-2.5">
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">Privacy Policy</span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">Terms of System Service</span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">Customs Regulatory Disclosures</span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">Sub-processor Transparency</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Persistent Live System Status Line */}
        <div className="pt-8 border-t border-white/10 flex items-center justify-between font-mono text-[11px] text-rose-400 bg-black/40 p-4 border border-white/10">
          <div className="flex items-center gap-3">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-400" />
            </span>
            <span className="tracking-wider">
              [ SYSTEM STATUS: OPERATIONAL // {monitoredNodes.toLocaleString()} NODES MONITORED // UPTIME 99.98% ]
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-neutral-500">
            <span>DATABASE: POSTGRES CTE ACTIVE</span>
            <span>ENCRYPTION: AES-256 GCM</span>
          </div>
        </div>

        {/* Bottom Narrative Epilogue & Copyright Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-neutral-500 text-[11px] pt-4 gap-4">
          <div className="flex items-center gap-3">
            <span className="text-white font-bold tracking-widest">EPILOGUE // END OF SEQUENCE</span>
            <span>{"//"}</span>
            <span>© 2026 VERITAS INTELLIGENCE INC.</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#scene-01" className="hover:text-white transition-colors">
              [ TOP OF TERMINAL ↑ ]
            </a>
            <button
              onClick={() => router.push('/dashboard')}
              className="hover:text-rose-400 transition-colors"
            >
              [ ENTER APEX DASHBOARD → ]
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
