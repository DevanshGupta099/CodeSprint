'use client';

import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  ReferenceLine,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { PortfolioBreakdownResponse } from '../../types/supply-chain';
import { 
  Globe2, 
  Layers, 
  Award, 
  TrendingUp, 
  FileDown, 
  Download, 
  Check, 
  ShieldCheck, 
  Leaf
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { INITIAL_DAG_DATA } from '../../data/seed-graph';

interface ReportsViewProps {
  data?: PortfolioBreakdownResponse | null;
  isDisrupted?: boolean;
  avoidedCo2Total?: number;
  spendAtRiskUSD?: number;
  onSimulateDisruption?: () => void;
  onResetBaseline?: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  data,
  isDisrupted = false,
  avoidedCo2Total = 1420.5,
}) => {
  const { isDark } = useTheme();
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'CRITICAL' | 'SPOF'>('ALL');

  // Fallback telemetry dataset for instant render
  const fallbackBreakdown: PortfolioBreakdownResponse = {
    orgId: '00000000-0000-0000-0000-000000000001',
    timestamp: new Date().toISOString(),
    byCountry: [
      { country: 'United States', countryCode: 'USA', spendUSD: 450, supplierCount: 1, atRiskSpendUSD: 0, highestRiskScore: 0.05, status: 'NOMINAL' },
      { country: 'Germany', countryCode: 'DEU', spendUSD: 220, supplierCount: 2, atRiskSpendUSD: 24.8, highestRiskScore: 0.72, status: 'CRITICAL' },
      { country: 'Japan', countryCode: 'JPN', spendUSD: 117, supplierCount: 2, atRiskSpendUSD: 0, highestRiskScore: 0.09, status: 'NOMINAL' },
      { country: 'South Korea', countryCode: 'KOR', spendUSD: 95, supplierCount: 1, atRiskSpendUSD: 16.5, highestRiskScore: 0.65, status: 'CRITICAL' },
      { country: 'Chile', countryCode: 'CHL', spendUSD: 48, supplierCount: 1, atRiskSpendUSD: 0, highestRiskScore: 0.14, status: 'NOMINAL' },
      { country: 'Australia', countryCode: 'AUS', spendUSD: 35, supplierCount: 1, atRiskSpendUSD: 0, highestRiskScore: 0.11, status: 'NOMINAL' },
      { country: 'Yemen (Red Sea)', countryCode: 'YEM', spendUSD: 28, supplierCount: 1, atRiskSpendUSD: 28.0, highestRiskScore: 0.94, status: 'CRITICAL' },
      { country: 'China', countryCode: 'CHN', spendUSD: 22, supplierCount: 1, atRiskSpendUSD: 0, highestRiskScore: 0.18, status: 'NOMINAL' },
      { country: 'DR Congo', countryCode: 'COD', spendUSD: 18, supplierCount: 1, atRiskSpendUSD: 0, highestRiskScore: 0.20, status: 'NOMINAL' },
    ],
    byTier: [
      { tier: 0, tierLabel: 'Tier 0 (Assembly)', spendUSD: 450, supplierCount: 1, atRiskSpendUSD: 0 },
      { tier: 1, tierLabel: 'Tier 1 (Subsystems)', spendUSD: 265, supplierCount: 2, atRiskSpendUSD: 24.8 },
      { tier: 2, tierLabel: 'Tier 2 (Modules & Cells)', spendUSD: 167, supplierCount: 3, atRiskSpendUSD: 16.5 },
      { tier: 3, tierLabel: 'Tier 3 (Smelting & Refining)', spendUSD: 98, supplierCount: 3, atRiskSpendUSD: 28.0 },
      { tier: 4, tierLabel: 'Tier 4 (Mines & Chokepoints)', spendUSD: 53, supplierCount: 2, atRiskSpendUSD: 0 },
    ],
    esgCompliance: {
      totalSuppliers: 11,
      certifiedSuppliersCount: 11,
      compliancePercentage: 100.0,
      laborStandardsCertifiedCount: 11,
      environmentalCertifiedCount: 11,
    },
  };

  const activeData = data || fallbackBreakdown;

  const countryChartData = activeData.byCountry.map((c) => ({
    country: c.countryCode || c.country.substring(0, 3).toUpperCase(),
    totalSpend: c.spendUSD,
    atRiskSpend: isDisrupted ? c.atRiskSpendUSD : (c.status === 'CRITICAL' ? c.atRiskSpendUSD * 0.4 : 0),
    status: c.status,
  }));

  const tierChartData = activeData.byTier.map((t) => ({
    tier: t.tierLabel,
    spend: t.spendUSD,
    atRisk: isDisrupted ? t.atRiskSpendUSD : (t.tier >= 3 ? t.atRiskSpendUSD * 0.3 : 0),
  }));

  // 30-Day Historical Risk Progression Data (Day 1-25: baseline ~$12M, Day 26: spike to $34.2M, Day 30: $41.5M)
  const historicalTimelineData = [
    { day: 'D01', dayNumber: 1, label: 'Day 1', riskM: 11.8, baseline: 12.0, status: 'NOMINAL', note: 'Standard Operations' },
    { day: 'D03', dayNumber: 3, label: 'Day 3', riskM: 12.1, baseline: 12.0, status: 'NOMINAL', note: 'Routine Baltic Transit' },
    { day: 'D05', dayNumber: 5, label: 'Day 5', riskM: 11.9, baseline: 12.0, status: 'NOMINAL', note: 'Nominal Port Throughput' },
    { day: 'D07', dayNumber: 7, label: 'Day 7', riskM: 12.3, baseline: 12.0, status: 'NOMINAL', note: 'Taiwan Foundry Dispatch' },
    { day: 'D09', dayNumber: 9, label: 'Day 9', riskM: 12.0, baseline: 12.0, status: 'NOMINAL', note: 'Rotterdam Customs Cleared' },
    { day: 'D11', dayNumber: 11, label: 'Day 11', riskM: 12.2, baseline: 12.0, status: 'NOMINAL', note: 'Chile Lithium Brine Nominal' },
    { day: 'D13', dayNumber: 13, label: 'Day 13', riskM: 11.7, baseline: 12.0, status: 'NOMINAL', note: 'DRC Audited Corridor' },
    { day: 'D15', dayNumber: 15, label: 'Day 15', riskM: 12.0, baseline: 12.0, status: 'NOMINAL', note: 'German Battery Module Splicing' },
    { day: 'D17', dayNumber: 17, label: 'Day 17', riskM: 12.4, baseline: 12.0, status: 'NOMINAL', note: 'Suez Maritime Normal Transit' },
    { day: 'D19', dayNumber: 19, label: 'Day 19', riskM: 12.1, baseline: 12.0, status: 'NOMINAL', note: 'Air Freight Corridors Nominal' },
    { day: 'D21', dayNumber: 21, label: 'Day 21', riskM: 12.5, baseline: 12.0, status: 'NOMINAL', note: 'Tier-3 Smelter Buffer Intact' },
    { day: 'D23', dayNumber: 23, label: 'Day 23', riskM: 12.2, baseline: 12.0, status: 'NOMINAL', note: 'Red Sea Security Advisory Level 1' },
    { day: 'D25', dayNumber: 25, label: 'Day 25', riskM: 12.8, baseline: 12.0, status: 'ELEVATED', note: 'Bab-el-Mandeb Tension Escalating' },
    { day: 'D26', dayNumber: 26, label: 'Day 26', riskM: 34.2, baseline: 12.0, status: 'CRITICAL', note: 'CHOKEPOINT ATTACK // BAB-EL-MANDEB' },
    { day: 'D27', dayNumber: 27, label: 'Day 27', riskM: 37.8, baseline: 12.0, status: 'CRITICAL', note: '0.7x CTE Propagation to Tier-2 Cells' },
    { day: 'D28', dayNumber: 28, label: 'Day 28', riskM: 39.9, baseline: 12.0, status: 'CRITICAL', note: 'Tier-1 Subsystem Integration Cascade' },
    { day: 'D29', dayNumber: 29, label: 'Day 29', riskM: 41.2, baseline: 12.0, status: 'CRITICAL', note: 'Full Enterprise OEM Exposure' },
    { day: 'D30', dayNumber: 30, label: 'Day 30', riskM: 41.5, baseline: 12.0, status: 'CRITICAL', note: 'Peak Disruption // Autonomous Reroute Engaged' },
  ];

  // Download Report Handlers
  const handleDownloadReport = (format: 'md' | 'csv') => {
    let content = '';
    let mimeType = '';
    let filename = '';

    if (format === 'md') {
      filename = `VeritasSupply_Executive_Audit_${new Date().toISOString().slice(0, 10)}.md`;
      mimeType = 'text/markdown;charset=utf-8;';
      content = `# VERITAS SUPPLY CHAIN EXECUTIVE AUDIT & COMPLIANCE REPORT
Generated: ${new Date().toUTCString()}
Standard: UN SDG 8 (Forced Labor / Decent Work) & UN SDG 12 (Avoided Scope-3 Carbon)
Engine: PostgreSQL Recursive CTE (0.7x Upward Decay)

---

## 1. EXECUTIVE SUMMARY
- Monitored Tier-0 to Tier-4 Nodes: ${INITIAL_DAG_DATA.nodes.length}
- Screened Jurisdictions: Chile, DRC, China, Japan, Germany, USA, Yemen
- Cumulative Value-at-Risk: $41,540,000 USD
- Avoided Scope-3 Footprint: +1,420.5 tCO2e

---

## 2. TIER-N SUPPLIER ROSTER & PROVENANCE
${INITIAL_DAG_DATA.nodes.map(n => `### ${n.name} (${n.code})
- Tier: ${n.tier} | Country: ${n.country} (${n.countryCode})
- Material: ${n.materialCategory}
- Spend: $${n.spend}M USD | Lead Time: ${n.leadTimeDays} days
- Status: ${n.status} | CTE Risk Exposure: ${Math.round(n.riskScore * 100)}%
- SPOF Bottleneck: ${n.isSPOF ? 'YES (CRITICAL)' : 'NO'}
- Certifications: ${n.certifications.join(', ') || 'Standard Trade Protocol'}
`).join('\n')}

---

## 3. COMPLIANCE & SANCTIONS CLEARANCE
- UFLPA Section 307: Rebuttable presumption screening active on regional smelters.
- IMO Maritime Security: Bab-el-Mandeb bypass protocols validated.
- SEC / CSRD Scope-3 GHG Disclosure: Audited mass-balance custody chain verified.
`;
    } else {
      filename = `VeritasSupply_Suppliers_${new Date().toISOString().slice(0, 10)}.csv`;
      mimeType = 'text/csv;charset=utf-8;';
      const headers = ['ID', 'Name', 'Code', 'Tier', 'Country', 'Category', 'Spend_M_USD', 'LeadTime_Days', 'Status', 'RiskScore', 'IsSPOF'];
      const rows = INITIAL_DAG_DATA.nodes.map(n => [
        n.id,
        `"${n.name}"`,
        n.code,
        n.tier,
        n.country,
        `"${n.materialCategory}"`,
        n.spend,
        n.leadTimeDays,
        n.status,
        n.riskScore,
        n.isSPOF ? 'TRUE' : 'FALSE'
      ]);
      content = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(format.toUpperCase());
    setTimeout(() => setDownloadSuccess(null), 2500);
  };

  const handleExportPDF = () => {
    const totalSpendAll = activeData.byTier.reduce((acc, t) => acc + t.spendUSD, 0) || 980;
    const totalAtRisk = isDisrupted ? 41.5 : 12.0;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>VeritasSupply_Executive_Risk_Report_${new Date().toISOString().slice(0, 10)}</title>
          <meta charset="utf-8" />
          <style>
            @page {
              size: A4;
              margin: 18mm 15mm;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              color: #0F172A;
              line-height: 1.45;
              background: #FFF;
              margin: 0;
              padding: 20px;
            }
            .header-bar {
              border-bottom: 2px solid #0F172A;
              padding-bottom: 12px;
              margin-bottom: 16px;
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
            }
            .brand {
              font-size: 20px;
              font-weight: 900;
              letter-spacing: -0.5px;
            }
            .meta {
              font-size: 11px;
              color: #475569;
              font-family: monospace;
            }
            h1 {
              font-size: 18px;
              font-weight: 800;
              margin: 12px 0 6px 0;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .kpi-row {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 12px;
              margin: 16px 0 20px 0;
            }
            .kpi-card {
              border: 1px solid #CBD5E1;
              border-radius: 8px;
              padding: 10px 12px;
              background: #F8FAFC;
            }
            .kpi-label {
              font-size: 10px;
              text-transform: uppercase;
              color: #64748B;
              font-weight: 700;
            }
            .kpi-val {
              font-size: 18px;
              font-weight: 800;
              font-family: monospace;
              color: #0F172A;
              margin-top: 4px;
            }
            .kpi-val.risk {
              color: #E11D48;
            }
            h2 {
              font-size: 13px;
              font-weight: 700;
              margin: 18px 0 8px 0;
              border-left: 3px solid #0284C7;
              padding-left: 8px;
              text-transform: uppercase;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 16px;
              font-size: 11px;
            }
            th, td {
              border: 1px solid #CBD5E1;
              padding: 7px 10px;
              text-align: left;
            }
            th {
              background: #F1F5F9;
              font-weight: 700;
              text-transform: uppercase;
              font-size: 10px;
            }
            .risk-high {
              color: #E11D48;
              font-weight: 700;
            }
            .compliance-card {
              border: 1px solid #10B981;
              background: #ECFDF5;
              padding: 12px;
              border-radius: 8px;
              font-size: 11px;
              margin-top: 14px;
              line-height: 1.5;
            }
            .signatures {
              margin-top: 36px;
              padding-top: 20px;
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 40px;
              font-size: 11px;
            }
            .sig-line {
              border-top: 1px solid #475569;
              margin-bottom: 4px;
              width: 180px;
            }
          </style>
        </head>
        <body>
          <div class="header-bar">
            <div>
              <div class="brand">VERITAS // AUTONOMOUS SUPPLY INTELLIGENCE</div>
              <div class="meta">EXECUTIVE AUDIT DOSSIER · UN SDG 8 &amp; SDG 12 CERTIFIED</div>
            </div>
            <div class="meta" style="text-align: right;">
              DATE: ${new Date().toISOString().slice(0, 10)}<br />
              HASH: 0x7E3F...9B21<br />
              ENGINE: POSTGRESQL CTE 0.7x
            </div>
          </div>

          <h1>Executive Risk &amp; ESG Compliance Audit Report</h1>
          <p style="font-size: 12px; color: #334155; margin-bottom: 12px;">
            Recursive multi-tier supply chain disruption telemetry generated for enterprise manufacturing authority. Reflects real-time risk wave propagation following maritime security blockades at Bab-el-Mandeb Strait.
          </p>

          <div class="kpi-row">
            <div class="kpi-card">
              <div class="kpi-label">Cumulative Value-at-Risk</div>
              <div class="kpi-val risk">$${totalAtRisk}M USD</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Avoided Scope-3 Carbon</div>
              <div class="kpi-val" style="color: #059669;">+1,420.5 tCO2e</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">UFLPA Sanctions Clearance</div>
              <div class="kpi-val">98.4% Passed</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Monitored Tier Depth</div>
              <div class="kpi-val">Tier 0 → Tier 4</div>
            </div>
          </div>

          <h2>1. Monitored Geographic Spend Exposure ($M)</h2>
          <table>
            <thead>
              <tr>
                <th>Region / Country</th>
                <th>Total Procurement Spend</th>
                <th>At-Risk Spend</th>
                <th>Risk Classification</th>
              </tr>
            </thead>
            <tbody>
              ${countryChartData.map(c => `
                <tr>
                  <td><strong>${c.country}</strong></td>
                  <td>$${c.totalSpend}M USD</td>
                  <td class="${c.atRiskSpend > 0 ? 'risk-high' : ''}">$${c.atRiskSpend}M USD</td>
                  <td>${c.status || 'NOMINAL'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <h2>2. Value-at-Risk by Tier Depth ($M)</h2>
          <table>
            <thead>
              <tr>
                <th>Supply Chain Depth Tier</th>
                <th>Total Allocation</th>
                <th>Propagated Risk (0.7x CTE Decay)</th>
              </tr>
            </thead>
            <tbody>
              ${tierChartData.map(t => `
                <tr>
                  <td><strong>${t.tier}</strong></td>
                  <td>$${t.spend}M USD</td>
                  <td class="${t.atRisk > 0 ? 'risk-high' : ''}">$${t.atRisk}M USD</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <h2>3. UN SDG 8 &amp; 12 ESG Compliance Statement</h2>
          <div class="compliance-card">
            <strong>United Nations Sustainability &amp; Human Rights Standards:</strong><br />
            Audited mass-balance chain-of-custody protocol active under Uyghur Forced Labor Prevention Act (UFLPA) Section 307 and EU Corporate Sustainability Due Diligence Directive (CSDDD). Real-time carbon rerouting active: avoiding +1,420.5 tCO2e bunker fuel emissions.
          </div>

          <div class="signatures">
            <div>
              <div class="sig-line"></div>
              <strong>Chief Risk Officer (CRO)</strong><br />
              <span style="color: #64748B;">Enterprise Supply Chain Resilience</span>
            </div>
            <div>
              <div class="sig-line"></div>
              <strong>Chief Procurement Officer (CPO)</strong><br />
              <span style="color: #64748B;">Autonomous Procurement Authority</span>
            </div>
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank', 'width=850,height=900');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(printContent);
      printWindow.document.close();
    } else {
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      document.body.appendChild(iframe);
      const doc = iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(printContent);
        doc.close();
        setTimeout(() => {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          setTimeout(() => document.body.removeChild(iframe), 1000);
        }, 300);
      }
    }
  };

  const filteredNodes = INITIAL_DAG_DATA.nodes.filter(n => {
    if (selectedFilter === 'CRITICAL') return n.status === 'CRITICAL' || n.status === 'ELEVATED';
    if (selectedFilter === 'SPOF') return n.isSPOF;
    return true;
  });

  return (
    <div className="w-full flex flex-col gap-6 select-none font-sans pb-16">
      {/* 1. TOP HERO ACTION & EXPORT BANNER CARD */}
      <div className="tactile-card p-6 sm:p-7 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="tactile-badge px-3 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 border-blue-500/20 bg-blue-50/80 dark:bg-blue-950/40">
              [SYS_AUDIT // REC_CTE_0.7x]
            </span>
            <span className="text-xs text-neutral-500 dark:text-slate-400 font-mono font-medium">
              UN SDG 8 &amp; SDG 12 Certified Audit Roster
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white mb-2">
            Executive Compliance, Provenance &amp; Disruption Reports
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-slate-400 max-w-3xl leading-relaxed">
            Continuous multi-tier supply chain surveillance from Tier-0 assembly down to Tier-4 mines and maritime chokepoints.
            Traces recursive 0.7x attenuation decay, UFLPA Section 307 rebuttable presumptions, and audited Scope-3 avoided emissions.
          </p>
        </div>

        {/* Action Export Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={handleExportPDF}
            className="tactile-pill-btn px-4 py-2.5 text-xs font-mono font-bold flex items-center gap-2 cursor-pointer transition-all active:scale-95 shadow-xs"
            title="Export printable executive audit dossier as PDF"
          >
            <FileDown className="w-4 h-4 text-blue-500 dark:text-blue-400" />
            <span>[EXPORT_PDF]</span>
          </button>

          <button
            onClick={() => handleDownloadReport('md')}
            className="tactile-pill-btn px-4 py-2.5 text-xs font-mono font-bold flex items-center gap-2 cursor-pointer transition-all active:scale-95 shadow-xs"
            title="Download full executive report in Markdown"
          >
            <Download className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
            <span>[EXPORT_MD]</span>
          </button>

          <button
            onClick={() => handleDownloadReport('csv')}
            className="tactile-pill-btn px-4 py-2.5 text-xs font-mono font-bold flex items-center gap-2 cursor-pointer transition-all active:scale-95 shadow-xs"
            title="Download complete 14-node supplier roster spreadsheet"
          >
            <Download className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            <span>[EXPORT_CSV]</span>
          </button>
        </div>
      </div>

      {/* Download Alert Toast */}
      {downloadSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in duration-200 shadow-xs">
          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Executive audit file ({downloadSuccess}) successfully generated and exported!</span>
        </div>
      )}

      {/* 2. FOUR KEY METRICS BENTO ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        {/* Metric 1: Total Value at Risk */}
        <div className="tactile-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-slate-400 font-mono">
              Value at Risk
            </span>
            <div className={`tactile-badge px-2.5 py-0.5 text-[10px] font-mono font-bold ${
              isDisrupted 
                ? 'text-rose-600 dark:text-rose-400 border-rose-500/30 bg-rose-50 dark:bg-rose-950/40 animate-pulse' 
                : 'text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/40'
            }`}>
              {isDisrupted ? '+245% SPIKE' : 'NOMINAL'}
            </div>
          </div>
          <div className="my-2">
            <span className={`text-2xl xs:text-3xl xl:text-4xl font-extrabold font-mono tracking-tight block truncate ${
              isDisrupted ? 'text-rose-600 dark:text-rose-400' : 'text-neutral-900 dark:text-white'
            }`}>
              {isDisrupted ? '$41,540,000' : '$12,000,000'}
            </span>
            <span className="text-xs text-neutral-500 dark:text-slate-400 font-medium mt-1 block truncate">
              {isDisrupted 
                ? 'Active CTE cascade across Bab-el-Mandeb' 
                : 'Standard baseline operational exposure'}
            </span>
          </div>
          <div className="pt-3 border-t border-neutral-100 dark:border-white/10 flex items-center justify-between text-[11px] text-neutral-400 dark:text-slate-500 font-mono">
            <span>Decay Rate</span>
            <span className="font-bold text-neutral-700 dark:text-slate-300">0.7x Upward Hop</span>
          </div>
        </div>

        {/* Metric 2: Avoided Scope-3 Carbon */}
        <div className="tactile-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-slate-400 font-mono">
              Avoided Scope-3
            </span>
            <div className="tactile-badge px-2.5 py-0.5 text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/40">
              UN SDG 12
            </div>
          </div>
          <div className="my-2">
            <span className="text-2xl xs:text-3xl xl:text-4xl font-extrabold font-mono tracking-tight text-emerald-600 dark:text-emerald-400 block truncate">
              +{avoidedCo2Total.toLocaleString()} tCO2e
            </span>
            <span className="text-xs text-neutral-500 dark:text-slate-400 font-medium mt-1 block truncate">
              Bunker fuel idle burn eliminated on Cape bypass
            </span>
          </div>
          <div className="pt-3 border-t border-neutral-100 dark:border-white/10 flex items-center justify-between text-[11px] text-neutral-400 dark:text-slate-500 font-mono">
            <span>Dual-Fuel Rate</span>
            <span className="font-bold text-neutral-700 dark:text-slate-300">78.5% Maritime</span>
          </div>
        </div>

        {/* Metric 3: Forced Labor Clearance Rate */}
        <div className="tactile-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-slate-400 font-mono">
              UFLPA Clearance
            </span>
            <div className="tactile-badge px-2.5 py-0.5 text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 border-blue-500/30 bg-blue-50 dark:bg-blue-950/40">
              UN SDG 8
            </div>
          </div>
          <div className="my-2">
            <span className="text-2xl xs:text-3xl xl:text-4xl font-extrabold font-mono tracking-tight text-neutral-900 dark:text-white block truncate">
              98.4%
            </span>
            <span className="text-xs text-neutral-500 dark:text-slate-400 font-medium mt-1 block truncate">
              14 of 14 nodes provenance screened
            </span>
          </div>
          <div className="pt-3 border-t border-neutral-100 dark:border-white/10 flex items-center justify-between text-[11px] text-neutral-400 dark:text-slate-500 font-mono">
            <span>Screening Speed</span>
            <span className="font-bold text-neutral-700 dark:text-slate-300">0.42s Recursive</span>
          </div>
        </div>

        {/* Metric 4: Monitored Tier Depth & SPOF */}
        <div className="tactile-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-slate-400 font-mono">
              Multi-Tier Depth
            </span>
            <div className="tactile-badge px-2.5 py-0.5 text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 border-indigo-500/30 bg-indigo-50 dark:bg-indigo-950/40">
              {INITIAL_DAG_DATA.nodes.length} NODES
            </div>
          </div>
          <div className="my-2">
            <span className="text-2xl xs:text-3xl xl:text-4xl font-extrabold font-mono tracking-tight text-neutral-900 dark:text-white block truncate">
              Tier 0 → 4
            </span>
            <span className="text-xs text-neutral-500 dark:text-slate-400 font-medium mt-1 block truncate">
              Gigafactory down to brine &amp; mines
            </span>
          </div>
          <div className="pt-3 border-t border-neutral-100 dark:border-white/10 flex items-center justify-between text-[11px] text-neutral-400 dark:text-slate-500 font-mono">
            <span>SPOF Bottlenecks</span>
            <span className="font-bold text-rose-600 dark:text-rose-400 font-mono">2 Critical Nodes</span>
          </div>
        </div>
      </div>

      {/* 3. PRIMARY VISUALIZER ROW (65% / 35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* 30-Day Historical Risk Progression (Area Chart) */}
        <div className="lg:col-span-8 tactile-card p-6 sm:p-7 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-rose-500 dark:text-rose-400" />
                <h3 className="font-bold text-base text-neutral-900 dark:text-white">
                  30-Day Historical Value-at-Risk Progression
                </h3>
              </div>
              <p className="text-xs text-neutral-500 dark:text-slate-400">
                Simulated shockwave tracing baseline $12.0M to peak $41.5M exposure at Day 26 Bab-el-Mandeb maritime crisis onset
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="tactile-badge px-2.5 py-1 text-[10px] font-mono font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 border-rose-500/30 flex items-center gap-1.5 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                CRISIS ONSET: DAY 26
              </span>
              <span className="text-xs font-mono font-bold text-neutral-700 dark:text-slate-300">
                +245%
              </span>
            </div>
          </div>

          <div className="h-72 sm:h-80 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historicalTimelineData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="reportsRiskGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F43F5E" stopOpacity={isDark ? 0.65 : 0.45} />
                    <stop offset="65%" stopColor="#EA580C" stopOpacity={isDark ? 0.2 : 0.12} />
                    <stop offset="95%" stopColor="#EA580C" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} vertical={false} />
                <XAxis dataKey="day" stroke={isDark ? '#64748B' : '#94A3B8'} fontSize={11} tickLine={false} />
                <YAxis 
                  stroke={isDark ? '#64748B' : '#94A3B8'} 
                  fontSize={11} 
                  tickLine={false} 
                  width={48}
                  domain={[0, 48]}
                  tickFormatter={(val) => `$${val}M`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;
                    const item = payload[0].payload;
                    const isSpike = item.dayNumber >= 26;
                    return (
                      <div className="rounded-2xl bg-white dark:bg-[#0B0F19] border border-neutral-200 dark:border-white/10 p-3.5 shadow-2xl font-sans text-xs min-w-[220px]">
                        <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-neutral-100 dark:border-white/10">
                          <span className="font-mono font-bold text-neutral-900 dark:text-white">{item.label}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold ${
                            isSpike 
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30' 
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                        <div className="flex items-baseline justify-between mb-1">
                          <span className="text-neutral-500 dark:text-slate-400 text-[11px]">Spend at Risk:</span>
                          <span className={`font-mono font-bold text-sm ${isSpike ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                            ${item.riskM}M USD
                          </span>
                        </div>
                        <div className="flex items-baseline justify-between mb-1 text-[10px] text-neutral-500 dark:text-slate-400">
                          <span>Baseline Target:</span>
                          <span className="font-mono font-semibold">${item.baseline.toFixed(1)}M USD</span>
                        </div>
                        <p className="text-[10px] text-neutral-600 dark:text-slate-300 mt-1.5 pt-1.5 border-t border-neutral-100 dark:border-white/5 font-mono leading-tight">
                          {item.note}
                        </p>
                      </div>
                    );
                  }}
                />
                <ReferenceLine 
                  x="D26" 
                  stroke="#F43F5E" 
                  strokeDasharray="4 4" 
                  strokeWidth={2}
                  label={{ 
                    value: 'Day 26 Attack', 
                    fill: isDark ? '#FDA4AF' : '#E11D48', 
                    fontSize: 10, 
                    position: 'insideTopLeft' 
                  }} 
                />
                <ReferenceLine 
                  y={12.0} 
                  stroke="#10B981" 
                  strokeDasharray="2 2" 
                  strokeWidth={1}
                  strokeOpacity={0.7}
                />
                <Area
                  type="monotone"
                  dataKey="riskM"
                  stroke="#F43F5E"
                  strokeWidth={2.5}
                  fill="url(#reportsRiskGradient)"
                  name="Risk Exposure ($M)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Spend Exposure by Geography ($M) */}
        <div className="lg:col-span-4 tactile-card p-6 sm:p-7 flex flex-col justify-between">
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              <Globe2 className="w-4 h-4 text-blue-500 dark:text-blue-400" />
              <h3 className="font-bold text-base text-neutral-900 dark:text-white">
                Spend Exposure by Geography
              </h3>
            </div>
            <p className="text-xs text-neutral-500 dark:text-slate-400">
              Total procurement vs at-risk allocation ($M) across 7 corridors
            </p>
          </div>

          <div className="h-72 sm:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={countryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} vertical={false} />
                <XAxis dataKey="country" stroke={isDark ? '#64748B' : '#94A3B8'} fontSize={11} tickLine={false} />
                <YAxis 
                  stroke={isDark ? '#64748B' : '#94A3B8'} 
                  fontSize={11} 
                  tickLine={false} 
                  width={48}
                  tickFormatter={(val) => `$${val}M`}
                />
                <Tooltip
                  formatter={(value: any) => [`$${value}M`, '']}
                  contentStyle={{
                    backgroundColor: isDark ? '#0B0F19' : '#FFFFFF',
                    borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
                    borderRadius: '0.85rem',
                    boxShadow: isDark ? '0 20px 40px -15px rgba(0,0,0,0.8)' : '0 20px 40px -15px rgba(0,0,0,0.1)',
                    fontSize: 12,
                    color: isDark ? '#F8FAFC' : '#18181B',
                  }}
                />
                <Bar dataKey="totalSpend" fill="#3B82F6" stroke={isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)'} strokeWidth={1} radius={[4, 4, 0, 0]} name="Total Spend" opacity={0.65} />
                <Bar dataKey="atRiskSpend" fill="#F43F5E" stroke="#FDA4AF" strokeWidth={1.5} radius={[4, 4, 0, 0]} name="At-Risk Spend" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. TIER VALUE-AT-RISK & UN SDG COMPLIANCE STATEMENT (50% / 50%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Tier Depth Spend & Risk */}
        <div className="lg:col-span-6 tactile-card p-6 sm:p-7 flex flex-col justify-between">
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              <Layers className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
              <h3 className="font-bold text-base text-neutral-900 dark:text-white">
                Value-at-Risk by Tier Depth ($M)
              </h3>
            </div>
            <p className="text-xs text-neutral-500 dark:text-slate-400">
              Recursive CTE 0.7x upward decay across Tier 4 (Mines &amp; Chokepoints) to Tier 0 (Assembly)
            </p>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tierChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} vertical={false} />
                <XAxis dataKey="tier" stroke={isDark ? '#64748B' : '#94A3B8'} fontSize={11} tickLine={false} />
                <YAxis 
                  stroke={isDark ? '#64748B' : '#94A3B8'} 
                  fontSize={11} 
                  tickLine={false} 
                  width={48}
                  tickFormatter={(val) => `$${val}M`}
                />
                <Tooltip
                  formatter={(value: any) => [`$${value}M`, '']}
                  contentStyle={{
                    backgroundColor: isDark ? '#0B0F19' : '#FFFFFF',
                    borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
                    borderRadius: '0.85rem',
                    boxShadow: isDark ? '0 20px 40px -15px rgba(0,0,0,0.8)' : '0 20px 40px -15px rgba(0,0,0,0.1)',
                    fontSize: 12,
                    color: isDark ? '#F8FAFC' : '#18181B',
                  }}
                />
                <Bar dataKey="spend" fill="#6366F1" stroke={isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)'} strokeWidth={1} radius={[4, 4, 0, 0]} name="Tier Spend" opacity={0.65} />
                <Bar dataKey="atRisk" fill="#F43F5E" stroke="#FDA4AF" strokeWidth={1.5} radius={[4, 4, 0, 0]} name="At-Risk Spend" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* UN SDG 8 & 12 ESG Compliance Statement */}
        <div className="lg:col-span-6 tactile-card p-6 sm:p-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center text-emerald-700 dark:text-emerald-400 shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base text-neutral-900 dark:text-white">
                  UN SDG 8 &amp; 12 Compliance Index
                </h3>
              </div>
              <span className="tactile-badge px-3 py-1 text-xs font-mono font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-500/15 border-emerald-300 dark:border-emerald-500/30 shadow-xs">
                98.4% VERIFIED
              </span>
            </div>

            <p className="text-xs sm:text-sm text-neutral-600 dark:text-slate-300 leading-relaxed mb-4">
              Autonomous chain-of-custody surveillance enforces strict compliance with the Uyghur Forced Labor Prevention Act (UFLPA) Section 307 rebuttable presumption and EU Corporate Sustainability Due Diligence Directive (CSDDD).
            </p>

            <div className="space-y-3 mb-4">
              <div className="p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/40 text-xs text-emerald-950 dark:text-emerald-200 flex items-start gap-3">
                <Leaf className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block mb-0.5">Scope-3 Carbon Tracking (UN SDG 12)</strong>
                  Real-time GHG protocol calculation across maritime routes avoiding bunker fuel burn.
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-800/40 text-xs text-blue-950 dark:text-blue-200 flex items-start gap-3">
                <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block mb-0.5">Labor Standards &amp; Sanctions Clearance (UN SDG 8)</strong>
                  Full mass-balance provenance verified for regional polysilicon smelters and lithium extractors.
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-100 dark:border-white/10 flex items-center justify-between text-xs text-neutral-500 dark:text-slate-400">
            <span>Audit Standard: ISO 14001 / IATF 16949</span>
            <span className="font-mono font-semibold text-neutral-700 dark:text-slate-300">Audited SEC / CSRD Disclosure</span>
          </div>
        </div>
      </div>

      {/* 5. MULTI-TIER SUPPLIER ROSTER & AUDIT REGISTRY TABLE CARD */}
      <div className="tactile-card p-6 sm:p-7 flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-lg text-neutral-900 dark:text-white">
              Multi-Tier Monitored Supplier Roster &amp; Audit Registry
            </h3>
            <p className="text-xs text-neutral-500 dark:text-slate-400">
              {INITIAL_DAG_DATA.nodes.length} screened supplier entities with spend allocation, lead time, CTE risk exposure, and SPOF flags
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedFilter('ALL')}
              className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
                selectedFilter === 'ALL'
                  ? 'bg-neutral-900 dark:bg-white text-white dark:text-slate-950 shadow-xs'
                  : 'tactile-pill-btn text-neutral-600 dark:text-slate-300'
              }`}
            >
              ALL ({INITIAL_DAG_DATA.nodes.length})
            </button>
            <button
              onClick={() => setSelectedFilter('CRITICAL')}
              className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
                selectedFilter === 'CRITICAL'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'tactile-pill-btn text-rose-600 dark:text-rose-400'
              }`}
            >
              CRITICAL / AT RISK
            </button>
            <button
              onClick={() => setSelectedFilter('SPOF')}
              className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
                selectedFilter === 'SPOF'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'tactile-pill-btn text-amber-600 dark:text-amber-400'
              }`}
            >
              SPOF BOTTLENECKS
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="w-full overflow-x-auto rounded-2xl border border-neutral-200/80 dark:border-white/10">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 dark:bg-slate-900/80 border-b border-neutral-200/80 dark:border-white/10 font-mono text-[10px] uppercase text-neutral-500 dark:text-slate-400">
              <tr>
                <th className="py-3.5 px-4">Entity / Code</th>
                <th className="py-3.5 px-3">Tier</th>
                <th className="py-3.5 px-3">Country</th>
                <th className="py-3.5 px-3">Material Category</th>
                <th className="py-3.5 px-3 text-right">Spend</th>
                <th className="py-3.5 px-3 text-right">Lead Time</th>
                <th className="py-3.5 px-3 text-center">Risk Score</th>
                <th className="py-3.5 px-3 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">SPOF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200/60 dark:divide-white/[0.06] bg-white dark:bg-transparent">
              {filteredNodes.map((node) => (
                <tr 
                  key={node.id} 
                  className="hover:bg-neutral-50/80 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-neutral-900 dark:text-white block">
                      {node.name}
                    </span>
                    <span className="font-mono text-[10px] text-neutral-400 dark:text-slate-500">
                      {node.code}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 font-mono">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 dark:bg-slate-800 text-neutral-700 dark:text-slate-300">
                      Tier {node.tier}
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="font-medium text-neutral-700 dark:text-slate-300">
                      {node.country}
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400 dark:text-slate-500 ml-1">
                      ({node.countryCode})
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-neutral-600 dark:text-slate-400">
                    {node.materialCategory}
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono font-bold text-neutral-900 dark:text-white">
                    ${node.spend}M
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono text-neutral-700 dark:text-slate-300">
                    {node.leadTimeDays}d
                  </td>
                  <td className="py-3.5 px-3 text-center font-mono font-bold">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                      node.riskScore >= 0.7 
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400'
                        : node.riskScore >= 0.35 
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                    }`}>
                      {Math.round(node.riskScore * 100)}%
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <span className={`text-[10px] font-mono font-bold uppercase ${
                      node.status === 'CRITICAL' 
                        ? 'text-rose-600 dark:text-rose-400' 
                        : node.status === 'ELEVATED' 
                        ? 'text-amber-600 dark:text-amber-400' 
                        : 'text-emerald-600 dark:text-emerald-400'
                    }`}>
                      {node.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {node.isSPOF ? (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 shadow-xs">
                        SPOF
                      </span>
                    ) : (
                      <span className="text-neutral-400 dark:text-slate-600 text-[11px] font-mono">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
