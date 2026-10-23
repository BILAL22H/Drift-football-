/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { GameMode } from './types';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { WelcomeView } from './components/WelcomeView';
import { DraftBattleView } from './components/DraftBattleView';
import { ChallengeView } from './components/ChallengeView';
import { DreamTeamBuilder } from './components/DreamTeamBuilder';
import { EndlessMode } from './components/EndlessMode';
import { DailyChallengeView } from './components/DailyChallengeView';
import { CollectionBinder } from './components/CollectionBinder';
import { PackOpener } from './components/PackOpener';
import { SettingsModal } from './components/SettingsModal';
import { Home } from 'lucide-react';

function MainApp() {
  const [currentMode, setCurrentMode] = useState<GameMode | 'home'>('draft-battle');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { language, t } = useGame();

  return (
    <div className="min-h-screen flex flex-col bg-[#070b14] text-slate-100 selection:bg-emerald-500 selection:text-black">
      {/* Top Header */}
      <Header onOpenSettings={() => setIsSettingsOpen(true)} />

      {/* Sub Navigation Bar */}
      <div className="sticky top-[53px] z-30 flex items-center bg-[#0a0f1d]/90 backdrop-blur-md border-b border-white/5">
        <button
          onClick={() => setCurrentMode('home')}
          title="Home"
          className={`px-3 py-2 text-xs font-bold font-rajdhani flex items-center gap-1.5 border-r border-white/10 rtl:border-l rtl:border-r-0 transition ${
            currentMode === 'home'
              ? 'text-emerald-400 bg-emerald-500/10'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Home className="w-4 h-4" />
          <span className="hidden xs:inline">{t.mainMenu}</span>
        </button>

        <Navigation
          currentMode={currentMode === 'home' ? 'draft-battle' : currentMode}
          onSelectMode={(mode) => setCurrentMode(mode)}
        />
      </div>

      {/* Dynamic Content Views */}
      <main className="flex-1 pb-16">
        {currentMode === 'home' && (
          <WelcomeView onSelectMode={(mode) => setCurrentMode(mode)} />
        )}

        {currentMode === 'draft-battle' && (
          <DraftBattleView />
        )}

        {currentMode === 'guess' && (
          <ChallengeView onOpenPackStore={() => setCurrentMode('packs')} />
        )}

        {currentMode === 'dream-team' && (
          <DreamTeamBuilder />
        )}

        {currentMode === 'endless' && (
          <EndlessMode />
        )}

        {currentMode === 'daily' && (
          <DailyChallengeView />
        )}

        {currentMode === 'collection' && (
          <CollectionBinder />
        )}

        {currentMode === 'packs' && (
          <PackOpener />
        )}
      </main>

      {/* Bottom Global Status & European Leagues Footer */}
      <footer className="border-t border-white/5 bg-[#05080e] py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-base">⚽</span>
            <span className="font-teko text-lg text-slate-300 font-bold uppercase tracking-wider">
              {t.appTitle}
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-[11px] text-slate-400">
              {language === 'ar' ? 'بيانات وإحصائيات واقعية' : 'Real Player Statistics & Trading Cards'}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-slate-400 font-mono">
            <span>Premier League</span>
            <span>•</span>
            <span>La Liga</span>
            <span>•</span>
            <span>Bundesliga</span>
            <span>•</span>
            <span>Serie A</span>
            <span>•</span>
            <span>Ligue 1</span>
          </div>

          <div className="text-[11px] text-slate-500">
            © 2026 Football Cards Challenge. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <GameProvider>
      <MainApp />
    </GameProvider>
  );
}
