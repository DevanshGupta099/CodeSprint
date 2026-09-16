'use client';

import React, { useState, useEffect } from 'react';
import { MitigationMemo } from '../../types/supply-chain';
import { api } from '../../services/api';
import { 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  X, 
  CheckCircle2, 
  RotateCcw,
  Copy,
  Check,
  ChevronDown,
  Leaf,
  FileDown,
  Printer
} from 'lucide-react';

interface ProcurementSwitchMemoProps {
  memo: MitigationMemo | null;
  onExecuteReroute: () => Promise<void>;
  isExecuting: boolean;
  onClose?: () => void;
}

export const ProcurementSwitchMemo: React.FC<ProcurementSwitchMemoProps> = ({
  memo,
  onExecuteReroute,
  isExecuting,
  onClose,
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [copied, setCopied] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [isAiExpanded, setIsAiExpanded] = useState(false);

  useEffect(() => {
    if (!memo) {
      setDisplayedText('');
      setIsTypingComplete(false);
      setAiExplanation(null);
      setIsAiExpanded(false);
      return;
    }

    const fullText = memo.executiveSummary;
    let index = 0;
    setDisplayedText('');
    setIsTypingComplete(false);

    const interval = setInterval(() => {
      index += 5;
      if (index <= fullText.length) {
        setDisplayedText(fullText.substring(0, index));
      } else {
        setDisplayedText(fullText);
        setIsTypingComplete(true);
        clearInterval(interval);
      }
    }, 12);

    return () => clearInterval(interval);
  }, [memo]);

  const handleCopyMemo = () => {
    if (memo && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(memo.executiveSummary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleExportPDF = () => {
    if (!memo) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>VeritasSupply_Executive_Memo_${memo.id.slice(0, 8)}</title>
          <meta charset="utf-8" />
          <style>
            @page {
              size: A4;
              margin: 20mm 15mm 20mm 15mm;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              color: #0F172A;
              line-height: 1.5;
              background: #FFF;
              margin: 0;
              padding: 24px;
            }
            .header-bar {
              border-bottom: 2px solid #0F172A;
              padding-bottom: 12px;
              margin-bottom: 20px;
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
            }
            .brand {
              font-size: 22px;
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
              margin-top: 4px;
            }
            .meta-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 10px;
              font-size: 11px;
              font-family: monospace;
              background: #F8FAFC;
              padding: 12px;
              border: 1px solid #E2E8F0;
              border-radius: 6px;
              margin-bottom: 20px;
            }
            .meta-item {
              display: flex;
              justify-content: space-between;
            }
            .meta-label {
              color: #64748B;
            }
            .meta-val {
              font-weight: bold;
              color: #0F172A;
            }
            h2 {
              font-size: 13px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              color: #0F172A;
              border-bottom: 1px solid #CBD5E1;
              padding-bottom: 4px;
              margin-top: 20px;
              margin-bottom: 10px;
            }
            .directive-box {
              background: #0F172A;
              color: #F8FAFC;
              font-family: monospace;
              font-size: 11px;
              padding: 14px;
              border-radius: 6px;
              white-space: pre-wrap;
              line-height: 1.6;
              margin-bottom: 20px;
            }
            .metrics-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
              font-size: 11px;
            }
            .metrics-table th {
              background: #F1F5F9;
              text-align: left;
              padding: 8px 10px;
              border: 1px solid #CBD5E1;
              text-transform: uppercase;
              color: #475569;
            }
            .metrics-table td {
              padding: 8px 10px;
              border: 1px solid #CBD5E1;
              font-family: monospace;
              font-weight: bold;
            }
            .positive {
              color: #059669;
            }
            .compliance-card {
              border-left: 4px solid #10B981;
              background: #F0FDF4;
              padding: 12px 14px;
              font-size: 11px;
              color: #166534;
              margin-bottom: 28px;
            }
            .signatures {
              margin-top: 36px;
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 40px;
              border-top: 1px solid #E2E8F0;
              padding-top: 20px;
              font-size: 11px;
            }
            .sig-line {
              border-bottom: 1px dashed #94A3B8;
              height: 26px;
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
              <div style="font-size: 11px; color: #64748B;">AUTONOMOUS RISK PROPAGATION & PROCUREMENT MEMORANDUM</div>
            </div>
            <div style="text-align: right;">
              <div class="badge">CONFIDENTIAL // EXECUTIVE MITIGATION</div>
              <div style="font-size: 10px; font-family: monospace; color: #64748B; margin-top: 4px;">
                DOC: VSC-${memo.id.slice(0, 8).toUpperCase()}
              </div>
            </div>
          </div>

          <div class="meta-grid">
            <div class="meta-item"><span class="meta-label">TIMESTAMP:</span><span class="meta-val">${new Date(memo.generatedAt).toUTCString()}</span></div>
            <div class="meta-item"><span class="meta-label">CLASSIFICATION:</span><span class="meta-val">RESTRICTED C-SUITE</span></div>
            <div class="meta-item"><span class="meta-label">DISRUPTED NODE:</span><span class="meta-val">${memo.disruptedSupplierId}</span></div>
            <div class="meta-item"><span class="meta-label">REPLACEMENT NODE:</span><span class="meta-val">${memo.alternateName}</span></div>
            <div class="meta-item"><span class="meta-label">CTE PROPAGATION:</span><span class="meta-val">0.7x ATTENUATION UPWARD</span></div>
            <div class="meta-item"><span class="meta-label">SDG COMPLIANCE:</span><span class="meta-val">UN SDG 8 & SDG 12 VERIFIED</span></div>
          </div>

          <h2>1. Executive Sourcing Directive // AI Sentinel Synthesis</h2>
          <div class="directive-box">${memo.executiveSummary}</div>

          <h2>2. Sourcing Trade-Off & ESG Audit Matrix</h2>
          <table class="metrics-table">
            <thead>
              <tr>
                <th>Decision Vector</th>
                <th>Target Baseline</th>
                <th>Recommended Alternate (${memo.alternateName})</th>
                <th>Variance Delta</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Unit Procurement Cost</td>
                <td>Standard Contract</td>
                <td>Premium Dual-Fuel Route</td>
                <td class="positive">+${memo.priceVariancePct}% (Contained)</td>
              </tr>
              <tr>
                <td>Lead Time Transit</td>
                <td>Baseline Schedule</td>
                <td>Pre-cleared Corridor</td>
                <td class="positive">${memo.leadTimeDeltaDays} Business Days</td>
              </tr>
              <tr>
                <td>Scope-3 Decarbonization</td>
                <td>Standard Bunker Fuel</td>
                <td>SBTi-Certified Clean Fleet</td>
                <td class="positive">+${memo.avoidedScope3Tco2e} tCO2e Avoided</td>
              </tr>
            </tbody>
          </table>

          <h2>3. Regulatory & Sustainability Adherence</h2>
          <div class="compliance-card">
            <strong>UN SDG 8 & SDG 12 Compliance Index:</strong><br />
            ${memo.complianceRationale}<br />
            Audited chain-of-custody mass-balance protocol active under UFLPA Section 307 and EU Corporate Sustainability Due Diligence Directive (CSDDD).
          </div>

          <div class="signatures">
            <div>
              <div class="sig-line"></div>
              <strong>Chief Procurement Officer (CPO)</strong><br />
              <span style="color: #64748B;">Veritas Autonomous Procurement Authority</span>
            </div>
            <div>
              <div class="sig-line"></div>
              <strong>Autonomous Sentinel Verification</strong><br />
              <span style="color: #64748B;">Cryptographic Audit ID: ${memo.id}</span>
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
    }
  };

  const handleExplainTradeoffs = async () => {
    if (!memo) return;
    if (aiExplanation) {
      setIsAiExpanded(!isAiExpanded);
      return;
    }

    setIsLoadingAi(true);
    setIsAiExpanded(true);
    try {
      const explanation = await api.explainMitigationTradeoffsWithAI(memo);
      setAiExplanation(explanation);
    } catch (err) {
      console.error('AI explanation error:', err);
    } finally {
      setIsLoadingAi(false);
    }
  };

  if (!memo) return null;

  return (
    <aside className="fixed inset-x-0 bottom-0 sm:inset-x-auto sm:top-20 sm:right-6 sm:bottom-6 w-full sm:w-[440px] max-h-[85vh] sm:max-h-none z-50 rounded-t-[32px] sm:rounded-[28px] bg-white dark:bg-[#0B0F19] border border-black/[0.08] dark:border-white/10 p-5 sm:p-7 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.22)] dark:shadow-[0_24px_60px_-15px_rgba(0,0,0,0.8)] flex flex-col justify-between overflow-y-auto animate-in fade-in slide-in-from-bottom-6 sm:slide-in-from-right-6 duration-200 select-none font-sans text-neutral-900 dark:text-slate-100">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-black/[0.06] dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-orange-500 flex items-center justify-center text-white shadow-xs shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-neutral-900 dark:text-white tracking-tight leading-none">
                  Autonomous Mitigation Directive
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-neutral-100 dark:bg-slate-800 text-neutral-700 dark:text-slate-300 border border-black/[0.06] dark:border-white/10">
                  AI SENTINEL
                </span>
              </div>
              <span className="text-xs text-neutral-400 dark:text-slate-500 font-medium block mt-1">
                {new Date(memo.generatedAt).toLocaleTimeString()} · Closed-Loop Reroute Synthesis
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* [EXPORT_PDF] Executive PDF Export Button */}
            <button
              onClick={handleExportPDF}
              className="px-2.5 py-1 rounded-full bg-neutral-100 hover:bg-neutral-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-neutral-700 dark:text-slate-200 text-[11px] font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-black/[0.05] dark:border-white/10 shadow-xs"
              title="Export Executive PDF Memorandum"
            >
              <FileDown className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span className="hidden sm:inline">[EXPORT_PDF]</span>
              <span className="sm:hidden">PDF</span>
            </button>

            <button
              onClick={handleCopyMemo}
              className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-slate-800 text-neutral-400 hover:text-neutral-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer"
              title="Copy memo text"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>

            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-slate-800 text-neutral-400 hover:text-neutral-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Executive Sourcing Directive Terminal (Obsidian Console) */}
        <div className="my-4 p-4 rounded-2xl bg-[#0F172A] border border-slate-800 text-xs shadow-inner">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
            <span className="text-[10px] uppercase font-bold tracking-wider font-mono text-sky-400">
              EXECUTIVE SOURCING DIRECTIVE // RECURSIVE CTE
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              {isTypingComplete ? '[SYNTHESIS COMPLETE]' : '[SYNTHESIZING...]'}
            </span>
          </div>

          <pre className="font-mono text-[11px] sm:text-xs text-slate-200 whitespace-pre-wrap leading-relaxed min-h-[90px]">
            {displayedText}
            {!isTypingComplete && (
              <span className="inline-block w-2 h-4 bg-sky-400 animate-pulse ml-0.5" />
            )}
          </pre>
        </div>

        {/* Trade-off Variance Cards */}
        <div className="grid grid-cols-3 gap-2 mb-4 text-center">
          <div className="p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40">
            <span className="text-[10px] uppercase font-bold font-mono text-amber-700 dark:text-amber-400 block">
              Price Delta
            </span>
            <span className="font-extrabold font-mono text-amber-900 dark:text-amber-200 text-sm sm:text-base mt-0.5 block">
              +{memo.priceVariancePct}%
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40">
            <span className="text-[10px] uppercase font-bold font-mono text-blue-700 dark:text-blue-400 block">
              Transit Lead Time
            </span>
            <span className="font-extrabold font-mono text-blue-900 dark:text-blue-200 text-sm sm:text-base mt-0.5 block">
              {memo.leadTimeDeltaDays} Days
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40">
            <span className="text-[10px] uppercase font-bold font-mono text-emerald-700 dark:text-emerald-400 block">
              Scope-3 CO2
            </span>
            <span className="font-extrabold font-mono text-emerald-900 dark:text-emerald-200 text-sm sm:text-base mt-0.5 block">
              +{memo.avoidedScope3Tco2e} t
            </span>
          </div>
        </div>

        {/* AI Trade-Off Explanation Accordion */}
        <div className="mb-4">
          <button
            onClick={handleExplainTradeoffs}
            disabled={isLoadingAi}
            className="w-full px-3.5 py-2 rounded-xl bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-900/50 text-sky-900 dark:text-sky-200 text-xs font-semibold flex items-center justify-between border border-sky-200 dark:border-sky-800/60 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-1.5">
              <Sparkles className={`w-3.5 h-3.5 text-sky-600 dark:text-sky-400 ${isLoadingAi ? 'animate-spin' : ''}`} />
              <span>{isLoadingAi ? 'Analyzing Trade-Offs...' : 'Ask AI to Explain Trade-Off Rationale'}</span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-sky-600 dark:text-sky-400 transition-transform ${isAiExpanded ? 'rotate-180' : ''}`} />
          </button>

          {isAiExpanded && aiExplanation && (
            <div className="mt-2 p-3.5 rounded-2xl bg-slate-900 dark:bg-black/80 text-slate-200 text-xs font-mono leading-relaxed border border-slate-700 dark:border-slate-800 animate-in fade-in duration-150">
              <pre className="whitespace-pre-wrap text-[11px]">{aiExplanation}</pre>
            </div>
          )}
        </div>

        {/* Compliance Rationale Badge */}
        <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-slate-900/60 border border-black/[0.05] dark:border-white/10 text-xs text-neutral-600 dark:text-slate-300 leading-relaxed mb-4 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <span>{memo.complianceRationale}</span>
        </div>
      </div>

      {/* The Execute Reroute Action Button */}
      <button
        onClick={onExecuteReroute}
        disabled={isExecuting}
        className="w-full py-3.5 px-5 rounded-2xl bg-[#18181B] dark:bg-amber-500 dark:text-black dark:hover:bg-amber-400 hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-[1.01] cursor-pointer disabled:opacity-50 mt-2"
      >
        {isExecuting ? (
          <>
            <RotateCcw className="w-4 h-4 animate-spin text-amber-400 dark:text-black" />
            <span>COMMITTING AUTONOMOUS REROUTE (POSTGRES CTE)...</span>
          </>
        ) : (
          <>
            <span>[EXECUTE_REROUTE] &bull; COMMIT AUTOMATED MITIGATION</span>
            <ArrowRight className="w-4 h-4 text-amber-400 dark:text-black" />
          </>
        )}
      </button>
    </aside>
  );
};
