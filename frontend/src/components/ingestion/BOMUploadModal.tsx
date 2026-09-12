'use client';

import React, { useState } from 'react';
import { Upload, X, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

interface BOMUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (filename: string) => void;
}

export const BOMUploadModal: React.FC<BOMUploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!file) return;
    setIsUploading(true);
    setMessage(null);

    // Simulate fast BOM ingestion and CTE graph construction
    setTimeout(() => {
      setIsUploading(false);
      setMessage(`Successfully ingested ${file.name}. Directed Acyclic Graph constructed in PostgreSQL CTE.`);
      onUploadSuccess(file.name);
      setTimeout(() => {
        onClose();
      }, 1200);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-xl z-50 flex items-center justify-center p-3 sm:p-6">
      <div className="relative w-full max-w-lg zero-card rounded-2xl p-4 sm:p-6 shadow-[0_16px_50px_rgba(0,0,0,0.85)] font-mono border-cyan-500/30">
        {/* Top Specular Micro-Bevel */}
        <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div>
            <span className="text-[10px] text-cyan-400 tracking-widest uppercase hud-shimmer-text">
              [INGESTION_SERVICE // BOM_PARSER]
            </span>
            <h2 className="font-display font-black text-base sm:text-lg text-white uppercase">
              Ingest Bill of Materials (BOM)
            </h2>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-2 rounded-full border border-white/10 hover:border-cyan-400/60 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer z-10 shrink-0"
            aria-label="Close Modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dropzone */}
        <div className="border-2 border-dashed border-white/20 hover:border-cyan-400/60 transition-colors p-6 text-center bg-black/40 mb-4">
          <Upload className="w-8 h-8 text-cyan-400 mx-auto mb-2 opacity-80" />
          <p className="text-xs text-slate-300 font-semibold mb-1">
            Drag & drop BOM CSV or click to browse
          </p>
          <p className="text-[10px] text-slate-500 mb-3">
            Supports multi-tier hierarchy: Parent ID, Child ID, Component, Spend, Lead Time
          </p>
          <label className="inline-block px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/60 text-cyan-300 text-xs cursor-pointer">
            Select File
            <input
              type="file"
              accept=".csv,.xlsx"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>

        {/* Selected file preview */}
        {file && (
          <div className="flex items-center gap-2 p-2.5 bg-cyan-950/20 border border-cyan-500/30 text-xs text-cyan-300 mb-4">
            <FileText className="w-4 h-4 shrink-0" />
            <span className="truncate flex-1">{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
            <span className="text-[10px] text-emerald-400">READY</span>
          </div>
        )}

        {/* Feedback message */}
        {message && (
          <div className="flex items-center gap-2 p-2 bg-emerald-950/30 border border-emerald-500/40 text-xs text-emerald-300 mb-4">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {/* Action button */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 border border-white/10 text-slate-400 hover:text-white text-xs cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-black font-display font-bold text-xs uppercase tracking-wider cursor-pointer disabled:opacity-50"
          >
            {isUploading ? 'Parsing & Building CTE...' : 'Ingest & Reconstruct DAG'}
          </button>
        </div>
      </div>
    </div>
  );
};
