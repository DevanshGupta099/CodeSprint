'use client';

import React from 'react';
import { ShieldCheck, CheckCircle2, Lock, FileCheck } from 'lucide-react';

const COMPLIANCE_MARKS = [
  {
    code: 'ISO 28000:2022',
    name: 'SECURITY MANAGEMENT SYSTEMS FOR SUPPLY CHAINS',
    scope: 'Continuous Tier-N verification and multi-hop anomaly response protocols.',
    status: 'AUDITED & ACTIVE',
  },
  {
    code: 'SOC 2 TYPE II',
    name: 'DATA INTEGRITY & SECURITY PROTOCOL',
    scope: 'Enterprise ERP read-only connectors with zero persistent BOM credential storage.',
    status: 'ANNUAL ATTESTATION',
  },
  {
    code: 'UFLPA SECTION 307',
    name: 'FORCED LABOR SANCTIONS COMPLIANCE',
    scope: 'Automated entity-list cross-referencing down to Tier-4 raw material smelters.',
    status: 'REAL-TIME SENTINEL',
  },
  {
    code: 'GHG PROTOCOL CAT 1 & 4',
    name: 'SCOPE-3 EMISSIONS MEASUREMENT',
    scope: 'Deterministic multi-modal routing calculations with verified emissions credits.',
    status: 'ISO 14064 COMPLIANT',
  },
];

export const TrustCompliance: React.FC = () => {
  return (
    <section className="relative w-full bg-[#05070A] text-white py-24 px-6 sm:px-12 md:px-16 border-t border-white/10 overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col gap-12">
        {/* Header Telemetry */}
        <div className="flex flex-wrap items-center justify-between border-b border-white/10 pb-4 font-mono text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="text-white font-semibold">VERIFICATION // SCENE 06</span>
            <span className="text-neutral-600">{"//"}</span>
            <span className="text-neutral-400">GOVERNANCE &amp; GLOBAL REGULATORY STANDARDS</span>
          </div>
          <div className="text-[11px] text-neutral-500 uppercase tracking-wider">
            UNITED NATIONS SUSTAINABLE DEVELOPMENT GOALS
          </div>
        </div>

        {/* Section Headline */}
        <div className="max-w-3xl">
          <h2 className="font-headline font-black text-4xl sm:text-6xl md:text-7xl leading-[0.92] tracking-[-0.04em] text-white">
            Stated as{' '}
            <span className="font-serif italic text-white font-normal inline-block px-1">
              fact,
            </span>{' '}
            not slogan.
          </h2>
          <p className="font-sans text-base sm:text-lg text-neutral-400 mt-4 leading-relaxed font-light">
            Veritas does not issue vague sustainability pledges. Our CTE graph engine executes automated regulatory proof obligations required under cross-border trade directives.
          </p>
        </div>

        {/* SDG Impact Blocks (Stated as Fact) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 sm:p-8 bg-white/[0.02] border border-white/10 flex flex-col justify-between">
            <div className="flex items-center justify-between font-mono text-xs text-neutral-400 mb-4">
              <span className="text-white font-bold">[ UNITED NATIONS SDG 8.7 ]</span>
              <span className="text-[11px] text-neutral-500">MANDATORY EXCLUSION</span>
            </div>
            <h3 className="font-headline font-bold text-2xl text-white">
              Decent Work &amp; Forced Labor Sanctions Defense
            </h3>
            <p className="font-sans text-sm text-neutral-300 mt-3 leading-relaxed">
              Every ingested bill of materials is recursively parsed against the Uyghur Forced Labor Prevention Act (UFLPA) entity catalog. Any smelter or refinery within 4 hops carrying sanction flags triggers automated exclusion warnings within 240 milliseconds.
            </p>
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-2 font-mono text-xs text-neutral-300">
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>100% AUDIT TRAIL PRESERVED FOR CUSTOMS ENFORCEMENT</span>
            </div>
          </div>

          <div className="p-6 sm:p-8 bg-white/[0.02] border border-rose-500/20 flex flex-col justify-between">
            <div className="flex items-center justify-between font-mono text-xs text-neutral-400 mb-4">
              <span className="text-rose-400 font-bold">[ UNITED NATIONS SDG 12.2 ]</span>
              <span className="text-[11px] text-neutral-500">CARBON OPTIMIZATION</span>
            </div>
            <h3 className="font-headline font-bold text-2xl text-white">
              Responsible Production &amp; Avoided Scope-3 Carbon
            </h3>
            <p className="font-sans text-sm text-neutral-300 mt-3 leading-relaxed">
              When physical disruptions necessitate supplier rerouting, Veritas calculates the exact delta in Scope-3 Category 4 transportation emissions. Manufacturers select alternatives that minimize carbon intensity while preserving delivery lead time.
            </p>
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-2 font-mono text-xs text-rose-300">
              <CheckCircle2 className="w-4 h-4 text-rose-400" />
              <span>GHG PROTOCOL CERTIFIED MULTI-MODAL LOGISTICS EMISSION COEFFICIENTS</span>
            </div>
          </div>
        </div>

        {/* 4 Compliance Certification Marks (HUD Monospace Style) */}
        <div className="mt-4 pt-8 border-t border-white/10">
          <div className="font-mono text-xs text-neutral-500 uppercase tracking-widest mb-6">
            [ CERTIFIED ACCREDITATIONS &amp; REGULATORY ATTESTATIONS ]
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {COMPLIANCE_MARKS.map((mark) => (
              <div
                key={mark.code}
                className="p-4 bg-neutral-950 border border-white/15 flex flex-col justify-between hover:border-white/35 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between font-mono text-xs mb-2">
                    <span className="text-white font-bold">{mark.code}</span>
                    <span className="text-[10px] text-rose-400 font-semibold">{mark.status}</span>
                  </div>
                  <h4 className="font-mono text-xs font-semibold text-white tracking-tight uppercase">
                    {mark.name}
                  </h4>
                  <p className="text-[11px] text-neutral-400 font-sans mt-2 leading-relaxed">
                    {mark.scope}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/10 font-mono text-[9px] text-neutral-500">
                  VERIFIED AUDIT IDENTIFIER: VRT-{mark.code.replace(/[^A-Z0-9]/g, '')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustCompliance;
