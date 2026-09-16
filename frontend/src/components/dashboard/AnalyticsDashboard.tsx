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
import { X, Globe2, Layers, Award, TrendingUp, FileDown, Download, Check } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { INITIAL_DAG_DATA } from '../../data/seed-graph';

interface AnalyticsDashboardProps {
  isOpen: boolean;
  data: PortfolioBreakdownResponse | null;
  onClose: () => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  isOpen,
  data,
  onClose,
}) => {
  const { isDark } = useTheme();
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const fallbackBreakdown: PortfolioBreakdownResponse = {
    orgId: '00000000-0000-0000-0000-000000000001',
    timestamp: new Date().toISOString(),
    byCountry: [
      { country: 'Germany', countryCode: 'DEU', spendUSD: 180, supplierCount: 2, atRiskSpendUSD: 24.8, highestRiskScore: 0.72, status: 'CRITICAL' },
      { country: 'China', countryCode: 'CHN', spendUSD: 120, supplierCount: 2, atRiskSpendUSD: 16.5, highestRiskScore: 0.96, status: 'CRITICAL' },
      { country: 'Japan', countryCode: 'JPN', spendUSD: 85, supplierCount: 1, atRiskSpendUSD: 0, highestRiskScore: 0.12, status: 'NOMINAL' },
      { country: 'Chile', countryCode: 'CHL', spendUSD: 45, supplierCount: 1, atRiskSpendUSD: 0, highestRiskScore: 0.15, status: 'NOMINAL' },
      { country: 'Yemen (Red Sea)', countryCode: 'YEM', spendUSD: 25, supplierCount: 1, atRiskSpendUSD: 25.0, highestRiskScore: 0.94, status: 'CRITICAL' },
      { country: 'DRC', countryCode: 'COD', spendUSD: 18, supplierCount: 1, atRiskSpendUSD: 0, highestRiskScore: 0.22, status: 'NOMINAL' },
      { country: 'United States', countryCode: 'USA', spendUSD: 450, supplierCount: 1, atRiskSpendUSD: 0, highestRiskScore: 0.05, status: 'NOMINAL' },
    ],
    byTier: [
      { tier: 0, tierLabel: 'Tier 0 (Assembly)', spendUSD: 450, supplierCount: 1, atRiskSpendUSD: 0 },
      { tier: 1, tierLabel: 'Tier 1 (Subsystems)', spendUSD: 180, supplierCount: 3, atRiskSpendUSD: 24.8 },
      { tier: 2, tierLabel: 'Tier 2 (Modules & Cells)', spendUSD: 205, supplierCount: 4, atRiskSpendUSD: 16.5 },
      { tier: 3, tierLabel: 'Tier 3 (Smelting & Refining)', spendUSD: 95, supplierCount: 3, atRiskSpendUSD: 12.2 },
      { tier: 4, tierLabel: 'Tier 4 (Mines & Chokepoints)', spendUSD: 50, supplierCount: 3, atRiskSpendUSD: 25.0 },
    ],
    esgCompliance: {
      totalSuppliers: 14,
      certifiedSuppliersCount: 13,
      compliancePercentage: 98.4,
      laborStandardsCertifiedCount: 13,
      environmentalCertifiedCount: 14,
    },
  };

  const activeData = data || fallbackBreakdown;

  const countryChartData = activeData.byCountry.map((c) => ({
    country: c.countryCode || c.country.substring(0, 3).toUpperCase(),
    totalSpend: c.spendUSD,
    atRiskSpend: c.atRiskSpendUSD,
    status: c.status,
  }));

  const tierChartData = activeData.byTier.map((t) => ({
    tier: t.tierLabel,
    spend: t.spendUSD,
    atRisk: t.atRiskSpendUSD,
  }));

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

  const handleExportPDF = () => {
    const totalSpendAll = activeData.byTier.reduce((acc, t) => acc + t.spendUSD, 0) || 980;
    const totalAtRisk = activeData.byTier.reduce((acc, t) => acc + t.atRiskSpendUSD, 0) || 41.5;

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
              color: #0F172A;
            }
            .badge {
              display: inline-block;
              font-size: 10px;
              font-weight: 700;
              background: #FEE2E2;
              color: #991B1B;
              padding: 3px 8px;
              border-radius: 4px;
              text-transform: uppercase;
              font-family: monospace;
            }
            .meta-grid {
              display: grid;
              grid-template-columns: 1fr 1fr 1fr;
              gap: 10px;
              font-size: 11px;
              font-family: monospace;
              background: #F8FAFC;
              padding: 10px 12px;
              border: 1px solid #E2E8F0;
              border-radius: 6px;
              margin-bottom: 18px;
            }
            .meta-item {
              display: flex;
              flex-direction: column;
            }
            .meta-label {
              color: #64748B;
              font-size: 10px;
            }
            .meta-val {
              font-weight: bold;
              color: #0F172A;
              font-size: 12px;
            }
            h2 {
              font-size: 12px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              color: #0F172A;
              border-bottom: 1px solid #CBD5E1;
              padding-bottom: 3px;
              margin-top: 16px;
              margin-bottom: 8px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 14px;
              font-size: 10px;
            }
            th {
              background: #F1F5F9;
              text-align: left;
              padding: 6px 8px;
              border: 1px solid #CBD5E1;
              text-transform: uppercase;
              color: #475569;
            }
            td {
              padding: 5px 8px;
              border: 1px solid #CBD5E1;
              font-family: monospace;
            }
            .risk-high {
              color: #E11D48;
              font-weight: bold;
            }
            .compliance-card {
              border-left: 4px solid #10B981;
              background: #F0FDF4;
              padding: 10px 12px;
              font-size: 10.5px;
              color: #166534;
              margin-bottom: 16px;
            }
            .signatures {
              margin-top: 24px;
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 40px;
              border-top: 1px solid #E2E8F0;
              padding-top: 14px;
              font-size: 10px;
            }
            .sig-line {
              border-bottom: 1px dashed #94A3B8;
              height: 22px;
              margin-bottom: 4px;
            }
            @media print {
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="header-bar">
            <div>
              <div class="brand">VERITAS SUPPLY CHAIN INTELLIGENCE</div>
              <div style="font-size: 11px; color: #64748B;">EXECUTIVE RISK AUDIT &amp; 30-DAY PROGRESSION DOSSIER</div>
            </div>
            <div style="text-align: right;">
              <div class="badge">CONFIDENTIAL // C-SUITE RISK AUDIT</div>
              <div style="font-size: 10px; font-family: monospace; color: #64748B; margin-top: 4px;">
                AUDIT REF: VSC-REP-${new Date().getFullYear()}-001
              </div>
            </div>
          </div>

          <div class="meta-grid">
            <div class="meta-item"><span class="meta-label">TOTAL SPEND MONITORED:</span><span class="meta-val">$${totalSpendAll}M USD</span></div>
            <div class="meta-item"><span class="meta-label">SPEND AT IMMEDIATE RISK:</span><span class="meta-val risk-high">$${totalAtRisk}M USD</span></div>
            <div class="meta-item"><span class="meta-label">SDG COMPLIANCE INDEX:</span><span class="meta-val" style="color:#059669;">98.4% AUDITED</span></div>
          </div>

          <h2>1. 30-Day Historical Risk Progression (Chokepoint Crisis Surge)</h2>
          <table>
            <thead>
              <tr>
                <th>Timeline Day</th>
                <th>Status</th>
                <th>Spend at Risk ($M)</th>
                <th>Baseline Target ($M)</th>
                <th>Event Horizon / Intelligence Log</th>
              </tr>
            </thead>
            <tbody>
              ${historicalTimelineData.map(d => `
                <tr>
                  <td><strong>${d.label}</strong> (${d.day})</td>
                  <td class="${d.status === 'CRITICAL' ? 'risk-high' : ''}">[${d.status}]</td>
                  <td class="${d.status === 'CRITICAL' ? 'risk-high' : ''}">$${d.riskM}M</td>
                  <td>$${d.baseline.toFixed(1)}M</td>
                  <td>${d.note}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <h2>2. Spend Exposure by Geography ($M)</h2>
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

          <h2>3. Value-at-Risk by Tier Depth ($M)</h2>
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

          <h2>4. UN SDG 8 &amp; 12 ESG Compliance Statement</h2>
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
      // Fallback if popup blocker active: use hidden iframe
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

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 bg-neutral-900/60 dark:bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-5xl rounded-[28px] sm:rounded-[32px] bg-[#FAF9F5] dark:bg-[#0B0F19] text-neutral-900 dark:text-slate-100 border border-neutral-200/90 dark:border-white/10 p-5 sm:p-8 shadow-2xl dark:shadow-[0_25px_60px_rgba(0,0,0,0.85)] font-sans max-h-[90vh] overflow-y-auto transition-colors duration-300 select-none">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-neutral-200/80 dark:border-white/[0.08] mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30 shadow-xs">
                Executive Risk Audit
              </span>
              <span className="text-xs text-neutral-500 dark:text-slate-400 font-medium font-mono">
                Tier-N Value-at-Risk // UN SDG 8 &amp; 12
              </span>
            </div>
            <h2 className="font-extrabold text-xl sm:text-2xl text-neutral-900 dark:text-white tracking-tight">
              Portfolio Disruption &amp; ESG Exposure
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* [EXPORT_PDF] */}
            <button
              onClick={handleExportPDF}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-white/[0.08] hover:bg-neutral-100 dark:hover:bg-white/[0.14] text-neutral-800 dark:text-slate-200 text-xs font-mono font-bold flex items-center gap-1.5 border border-neutral-200/90 dark:border-white/10 transition-all cursor-pointer shadow-xs active:scale-95"
              title="Print/Export Executive Risk Audit as PDF"
            >
              <FileDown className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
              <span>[EXPORT_PDF]</span>
            </button>

            {/* [EXPORT_MD] */}
            <button
              onClick={() => handleDownloadReport('md')}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-white/[0.08] hover:bg-neutral-100 dark:hover:bg-white/[0.14] text-neutral-800 dark:text-slate-200 text-xs font-mono font-bold flex items-center gap-1.5 border border-neutral-200/90 dark:border-white/10 transition-all cursor-pointer shadow-xs active:scale-95"
              title="Download Executive Markdown Report"
            >
              <Download className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
              <span>[EXPORT_MD]</span>
            </button>

            {/* [EXPORT_CSV] */}
            <button
              onClick={() => handleDownloadReport('csv')}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-white/[0.08] hover:bg-neutral-100 dark:hover:bg-white/[0.14] text-neutral-800 dark:text-slate-200 text-xs font-mono font-bold flex items-center gap-1.5 border border-neutral-200/90 dark:border-white/10 transition-all cursor-pointer shadow-xs active:scale-95"
              title="Download Tier-N Supplier Roster as CSV"
            >
              <Download className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
              <span>[EXPORT_CSV]</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-neutral-200/60 dark:hover:bg-white/[0.08] text-neutral-400 hover:text-neutral-800 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer ml-1"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Download Success Banner */}
        {downloadSuccess && (
          <div className="mb-5 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-medium flex items-center gap-2 animate-in fade-in duration-200 shadow-xs">
            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Executive report ({downloadSuccess}) successfully generated and downloaded!</span>
          </div>
        )}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          {/* Chart 1: Spend at Risk by Geography */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-neutral-200/80 dark:border-white/10 shadow-xs">
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2 text-neutral-800 dark:text-slate-200 text-xs font-bold font-sans">
                <Globe2 className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                <span>Spend Exposure by Geography ($M)</span>
              </div>
              <span className="text-[10px] font-mono font-medium text-neutral-400 dark:text-slate-500">
                7 Sovereign Corridors
              </span>
            </div>
            <div className="h-56 w-full">
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

          {/* Chart 2: Spend & Risk by Tier */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-neutral-200/80 dark:border-white/10 shadow-xs">
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2 text-neutral-800 dark:text-slate-200 text-xs font-bold font-sans">
                <Layers className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                <span>Value-at-Risk by Tier Depth ($M)</span>
              </div>
              <span className="text-[10px] font-mono font-medium text-neutral-400 dark:text-slate-500">
                Tier 0 to Tier 4
              </span>
            </div>
            <div className="h-56 w-full">
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

          {/* Chart 3: 30-Day Historical Risk Progression (Full Width Recharts Area Chart) */}
          <div className="col-span-1 md:col-span-2 p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-neutral-200/80 dark:border-white/10 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2 text-neutral-800 dark:text-slate-200 text-xs font-bold font-sans">
                <TrendingUp className="w-4 h-4 text-rose-500 dark:text-rose-400" />
                <span>30-Day Historical Risk Progression (Bab-el-Mandeb Surge Event)</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-rose-100 dark:bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30 flex items-center gap-1.5 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                  CRISIS ONSET: DAY 26
                </span>
                <span className="text-[11px] font-mono text-neutral-500 dark:text-slate-400 font-semibold">
                  $12.0M &rarr; $41.5M (+245%)
                </span>
              </div>
            </div>

            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historicalTimelineData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="riskAreaGradient" x1="0" y1="0" x2="0" y2="1">
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
                        <div className="rounded-2xl bg-white dark:bg-[#0F1422] border border-neutral-200 dark:border-white/10 p-3.5 shadow-2xl font-sans text-xs min-w-[220px]">
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
                    fill="url(#riskAreaGradient)"
                    name="Risk Exposure ($M)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ESG & Sanctions Compliance Card */}
        <div className="p-5 rounded-2xl bg-emerald-50/90 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center text-emerald-700 dark:text-emerald-400 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-neutral-900 dark:text-white text-sm">
                United Nations SDG 8 &amp; 12 Compliance Index
              </h4>
              <p className="text-xs text-neutral-600 dark:text-emerald-400/90 mt-0.5">
                Forced Labor Prevention (UFLPA) active · Scope-3 Autonomous Tracking enabled (+1,420.5 tCO2e avoided)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <div className="px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-bold font-mono shadow-xs">
              98.4% VERIFIED
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
