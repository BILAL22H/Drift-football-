import React from 'react';
import { useGame } from '../context/GameContext';
import { Volume2, VolumeX, Globe, Settings, Coins, Flame, Trophy } from 'lucide-react';

interface HeaderProps {
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings }) => {
  const { language, setLanguage, soundEnabled, setSoundEnabled, userStats, t } = useGame();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#090e1a]/90 backdrop-blur-md border-b border-white/10 px-3 sm:px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-emerald-500 to-cyan-500 p-[2px] shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full bg-[#060a12] rounded-[10px] flex items-center justify-center">
              <span className="text-lg">⚽</span>
            </div>
          </div>
          <div>
            <h1 className="font-teko text-xl sm:text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-emerald-400 leading-none uppercase">
              {t.appTitle}
            </h1>
            <p className="text-[10px] sm:text-xs text-slate-400 font-medium tracking-wide hidden xs:block">
              {language === 'ar' ? 'أقوى تحدي لبطاقات نجوم أوروبا' : 'Europe’s Big 5 Leagues Challenge'}
            </p>
          </div>
        </div>

        {/* Center/Right Stats Indicators */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Coins Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs sm:text-sm font-bold font-rajdhani">
            <Coins className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>{userStats.coins.toLocaleString()}</span>
          </div>

          {/* Current Streak Badge */}
          {userStats.streak > 0 && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs sm:text-sm font-bold font-rajdhani animate-pulse">
              <Flame className="w-4 h-4 text-orange-400 fill-orange-400" />
              <span>{userStats.streak} {language === 'ar' ? 'متتالي' : 'Streak'}</span>
            </div>
          )}

          {/* High Score Badge (Desktop/Tablet) */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs font-rajdhani">
            <Trophy className="w-3.5 h-3.5 text-yellow-400" />
            <span>{language === 'ar' ? 'الرقم القياسي' : 'Best'}: <strong className="text-white font-bold">{userStats.highScore}</strong></span>
          </div>

          {/* Language Switch Button */}
          <button
            onClick={toggleLanguage}
            title={language === 'en' ? 'Switch to العربية' : 'Switch to English'}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-200 transition active:scale-95"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>{language === 'en' ? 'العربية' : 'EN'}</span>
          </button>

          {/* Sound Toggle Button */}
          <button
            onClick={toggleSound}
            title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 transition active:scale-95"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            title="Settings"
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 transition active:scale-95"
          >
            <Settings className="w-4 h-4 hover:rotate-45 transition-transform" />
          </button>
        </div>
      </div>
    </header>
  );
};
