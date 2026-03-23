import React, { useState, useEffect } from 'react';
import { Setup } from './components/Setup';
import { Dashboard } from './components/Dashboard';

export type CultivationType = 'pot' | 'field';
export type ThemeType = 'light' | 'dark' | 'system';

export interface AppState {
  location: string;
  type: CultivationType;
  potDiameter: number | null;
}

export default function App() {
  const [appState, setAppState] = useState<AppState | null>(null);
  const [theme, setTheme] = useState<ThemeType>('system');

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  return (
    <div className="min-h-screen bg-[#F9FBF9] text-[#2D3436] dark:bg-[#121212] dark:text-[#E0E0E0] font-sans transition-colors duration-300">
      {!appState ? (
        <Setup onComplete={setAppState} />
      ) : (
        <Dashboard appState={appState} onReset={() => setAppState(null)} theme={theme} setTheme={setTheme} />
      )}
    </div>
  );
}
