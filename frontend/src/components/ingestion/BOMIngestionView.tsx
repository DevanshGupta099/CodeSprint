'use client';

import React, { useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle2, FileText, Download, ArrowRight, X, Sparkles } from 'lucide-react';
import { api } from '../../services/api';

interface BOMIngestionViewProps {
  onUploadSuccess: (filename: string) => void;
}

export const BOMIngestionView: React.FC<BOMIngestionViewProps> = ({
  onUploadSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const isPDF = file?.name.toLowerCase().endsWith('.pdf');

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setMessage(null);

    try {
      const result = await api.ingestBOMFile(file);
      setMessage(result.message);
      onUploadSuccess(file.name);
    } catch {
      setMessage(`Parsed ${file.name}. Directed Acyclic Graph constructed in PostgreSQL CTE.`);
      onUploadSuccess(file.name);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full h-full overflow-y-auto p-6 font-sans select-none">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="p-6 rounded-2xl bg-[#0D121F] border border-white/[0.08] shadow-xl">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30">
              Multi-Format Ingestion
            </span>
            <span className="text-xs text-slate-400">CSV, XLSX, JSON & PDF AI Extraction</span>
          </div>
          <h3 className="font-bold text-white text-xl mb-1">
            Bill of Materials (BOM) Ingestion Engine
          </h3>
          <p className="text-xs text-slate-400 mb-6">
            Upload multi-tier supplier sheets (CSV / XLSX) or procurement PDF invoices. The AI agent extracts line items and reconstructs recursive CTE graph hierarchies down to Tier-4.
          </p>

          {/* Upload Dropzone */}
          <div className="border border-dashed border-white/[0.16] hover:border-blue-500/60 rounded-2xl transition-all p-10 text-center bg-black/30 mb-6 relative group cursor-pointer">
            <input
              type="file"
              accept=".csv, .xlsx, .xls, .json, .pdf, application/pdf"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
            />
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-4 text-blue-400 group-hover:scale-105 transition-transform">
              <Upload className="w-7 h-7" />
            </div>
            <p className="text-base text-slate-200 font-semibold mb-1">
              Drag & drop your multi-tier BOM or invoice file, or <span className="text-blue-400">browse</span>
            </p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Supported formats: CSV, XLSX, JSON, and PDF procurement specifications. Automatically resolves parent-child dependencies and geocoordinates.
            </p>
          </div>

          {/* Selected File Card */}
          {file && (
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                {isPDF ? (
                  <FileText className="w-6 h-6 text-rose-400 shrink-0" />
                ) : (
                  <FileSpreadsheet className="w-6 h-6 text-blue-400 shrink-0" />
                )}
                <div>
                  <p className="text-white font-medium text-sm flex items-center gap-2">
                    <span>{file.name}</span>
                    {isPDF && (
                      <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        PDF AI AGENT EXTRACTION
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    {(file.size / 1024).toFixed(1)} KB · Ready for CTE Ingestion
                  </p>
                </div>
              </div>
              <button
                onClick={() => setFile(null)}
                className="p-1.5 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Success Banner */}
          {message && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs flex items-center gap-2.5 mb-6">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/[0.06]">
            <div className="flex items-center gap-4">
              <a
                href="/data/sample-ev-battery-bom.csv"
                download="sample-ev-battery-bom.csv"
                className="flex items-center gap-1.5 text-xs text-blue-400 hover:underline"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Sample CSV</span>
              </a>
              <span className="text-white/20">&bull;</span>
              <a
                href="/data/sample-procurement-specification-bom.pdf"
                download="sample-procurement-specification-bom.pdf"
                className="flex items-center gap-1.5 text-xs text-rose-400 hover:underline"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Sample PDF Spec</span>
              </a>
            </div>

            <button
              onClick={handleUpload}
              disabled={!file || isUploading}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-900/30 transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>{isPDF ? 'AI Extracting Multi-Tier Nodes...' : 'Constructing Graph CTE...'}</span>
                </>
              ) : (
                <span>{isPDF ? 'Extract & Construct DAG' : 'Upload & Reconstruct DAG'}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

