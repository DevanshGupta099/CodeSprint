'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: (e?: React.MouseEvent) => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  // Apply theme class to <html> and <body>
  const applyThemeToDOM = (newTheme: Theme) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    if (newTheme === 'dark') {
      root.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  };

  // Sync on mount
  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('veritas_theme') as Theme | null;
    if (stored === 'dark' || stored === 'light') {
      setThemeState(stored);
      applyThemeToDOM(stored);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initialTheme: Theme = prefersDark ? 'dark' : 'light';
      setThemeState(initialTheme);
      applyThemeToDOM(initialTheme);
    }
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    applyThemeToDOM(newTheme);
    try {
      localStorage.setItem('veritas_theme', newTheme);
    } catch {
      // ignore
    }
  }, []);

  const toggleTheme = useCallback((e?: React.MouseEvent) => {
    const nextTheme: Theme = theme === 'light' ? 'dark' : 'light';

    // Get origin coordinates for the radial expansion
    const x = e ? e.clientX : window.innerWidth - 100;
    const y = e ? e.clientY : 30;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    // Trigger overlay ripple event for guaranteed custom shockwave effect
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('veritas-theme-ripple', {
          detail: { x, y, theme: nextTheme, radius: endRadius },
        })
      );
    }

    // Check if View Transitions API is available
    const doc = document as any;
    if (typeof doc.startViewTransition === 'function') {
      const transition = doc.startViewTransition(() => {
        setTheme(nextTheme);
      });

      transition.ready?.then(() => {
        const clipPath = [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${endRadius}px at ${x}px ${y}px)`,
        ];
        document.documentElement.animate(
          {
            clipPath: nextTheme === 'dark' ? clipPath : [...clipPath].reverse(),
          },
          {
            duration: 450,
            easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
            pseudoElement:
              nextTheme === 'dark'
                ? '::view-transition-new(root)'
                : '::view-transition-old(root)',
          }
        );
      }).catch(() => {
        setTheme(nextTheme);
      });
    } else {
      // Fallback
      setTheme(nextTheme);
    }
  }, [theme, setTheme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark: theme === 'dark',
        toggleTheme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
