'use client';

import React from 'react';

interface RollingCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
  digitClassName?: string;
}

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

export const RollingCounter: React.FC<RollingCounterProps> = ({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = '',
  digitClassName = '',
}) => {
  const formattedString = value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  const characters = formattedString.split('');

  return (
    <span className={`inline-flex items-center font-mono font-bold tracking-tight ${className}`}>
      {prefix && <span className="mr-0.5 opacity-80">{prefix}</span>}
      <span className="inline-flex items-center overflow-hidden h-[1.25em] leading-none">
        {characters.map((char, index) => {
          const isDigit = /\d/.test(char);
          if (!isDigit) {
            return (
              <span key={`char-${index}`} className="opacity-80 px-0.5">
                {char}
              </span>
            );
          }

          const num = parseInt(char, 10);

          return (
            <span
              key={`digit-${index}`}
              className="inline-block h-[1.25em] w-[0.62em] overflow-hidden relative"
              style={{
                maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
              }}
            >
              <span
                className="flex flex-col transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{
                  transform: `translateY(-${num * 10}%)`,
                }}
              >
                {DIGITS.map((d) => (
                  <span
                    key={d}
                    className={`h-[1.25em] flex items-center justify-center text-center select-none ${digitClassName}`}
                  >
                    {d}
                  </span>
                ))}
              </span>
            </span>
          );
        })}
      </span>
      {suffix && <span className="ml-1 opacity-80 text-[0.8em] font-normal">{suffix}</span>}
    </span>
  );
};
