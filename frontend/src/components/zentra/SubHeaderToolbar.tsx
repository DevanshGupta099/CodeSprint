'use client';

import React, { useState } from 'react';
import { Calendar, ChevronDown, Plus, Link as LinkIcon } from 'lucide-react';

interface SubHeaderToolbarProps {
  title?: string;
  onAddWidget?: () => void;
}

export const SubHeaderToolbar: React.FC<SubHeaderToolbarProps> = ({
  title = 'Overview',
  onAddWidget,
}) => {
  const [range1, setRange1] = useState('Jan 01 - July 31');
  const [range2, setRange2] = useState('Aug 01 - Dec 31');
  const [granularity, setGranularity] = useState('Daily');

  return (
    <div className="w-full max-w-[1440px] mx-auto px-6 sm:px-10 pt-6 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4 select-none font-sans">
      {/* LEFT: "Overview" in 36px font-semibold with small circular link icon button */}
      <div className="flex items-center gap-3">
        <h1 className="text-[36px] font-semibold tracking-tight text-neutral-900 leading-none">
          {title}
        </h1>
        <button
          onClick={() => {
            if (typeof navigator !== 'undefined' && navigator.clipboard) {
              navigator.clipboard.writeText(window.location.href);
            }
          }}
          className="h-7 w-7 rounded-full bg-white border border-black/10 flex items-center justify-center text-neutral-500 hover:text-neutral-900 shadow-sm hover:bg-neutral-50 transition-colors cursor-pointer"
          title="Copy dashboard link"
        >
          <LinkIcon className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* RIGHT SEGMENTED DATE SELECTOR */}
      <div className="flex items-center flex-wrap gap-2 text-xs">
        {/* Pill 1: [ 🗓 Jan 01 - July 31 ▾ ] */}
        <button className="tactile-pill-btn px-3.5 py-2 flex items-center gap-2 text-neutral-800 font-medium cursor-pointer">
          <Calendar className="w-3.5 h-3.5 text-neutral-500" />
          <span>{range1}</span>
          <ChevronDown className="w-3 h-3 text-neutral-400" />
        </button>

        {/* Text: compared to */}
        <span className="text-neutral-500 text-xs font-normal px-1">
          compared to
        </span>

        {/* Pill 2: [ 🗓 Aug 01 - Dec 31 ▾ ] */}
        <button className="tactile-pill-btn px-3.5 py-2 flex items-center gap-2 text-neutral-800 font-medium cursor-pointer">
          <Calendar className="w-3.5 h-3.5 text-neutral-500" />
          <span>{range2}</span>
          <ChevronDown className="w-3 h-3 text-neutral-400" />
        </button>

        {/* Dropdown: [ Daily ▾ ] */}
        <button className="tactile-pill-btn px-3.5 py-2 flex items-center gap-1.5 text-neutral-800 font-medium cursor-pointer">
          <span>{granularity}</span>
          <ChevronDown className="w-3 h-3 text-neutral-400" />
        </button>

        {/* Button: [ Add widget + ] */}
        <button
          onClick={onAddWidget}
          className="tactile-pill-btn px-4 py-2 flex items-center gap-1.5 text-neutral-900 font-semibold cursor-pointer shadow-sm hover:bg-neutral-50 ml-1"
        >
          <span>Add widget</span>
          <Plus className="w-3.5 h-3.5 text-neutral-700" />
        </button>
      </div>
    </div>
  );
};
