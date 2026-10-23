import React from 'react';
import { GameMode } from '../types';
import { useGame } from '../context/GameContext';
import { Swords, Target, Users, Flame, Calendar, BookOpen, Package } from 'lucide-react';

interface NavigationProps {
  currentMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentMode, onSelectMode }) => {
  const { language } = useGame();

  const navItems: { mode: GameMode; labelEn: string; labelAr: string; icon: React.ReactNode; badge?: string }[] = [
    {
      mode: 'draft-battle',
      labelEn: 'Draft Battle',
      labelAr: 'معركة الدرفت',
      icon: <Swords className="w-4 h-4 text-amber-400" />,
      badge: 'PvP'
    },
    {
      mode: 'guess',
      labelEn: '4-Cards Quiz',
      labelAr: 'تحدي البطاقات',
      icon: <Target className="w-4 h-4" />
    },
    {
      mode: 'dream-team',
      labelEn: 'Dream Team',
      labelAr: 'تشكيلة الأحلام',
      icon: <Users className="w-4 h-4" />
    },
    {
      mode: 'endless',
      labelEn: 'Endless Run',
      labelAr: 'التحدي اللانهائي',
      icon: <Flame className="w-4 h-4 text-orange-400" />
    },
    {
      mode: 'daily',
      labelEn: 'Daily Challenge',
      labelAr: 'التحدي اليومي',
      icon: <Calendar className="w-4 h-4 text-emerald-400" />,
      badge: 'Daily'
    },
    {
      mode: 'collection',
      labelEn: 'Card Binder',
      labelAr: 'مكتبة البطاقات',
      icon: <BookOpen className="w-4 h-4" />
    },
    {
      mode: 'packs',
      labelEn: 'Packs Store',
      labelAr: 'متجر الحزم',
      icon: <Package className="w-4 h-4 text-amber-400" />
    }
  ];

  return (
    <nav className="w-full bg-[#0a0f1d]/90 backdrop-blur-md border-b border-white/5 py-1.5 px-2 sm:px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-start sm:justify-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth">
        {navItems.map(item => {
          const isActive = currentMode === item.mode;
          return (
            <button
              key={item.mode}
              onClick={() => onSelectMode(item.mode)}
              className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 active:scale-95 ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
              }`}
            >
              <span className={isActive ? 'text-emerald-400' : 'text-slate-400'}>
                {item.icon}
              </span>
              <span>{language === 'ar' ? item.labelAr : item.labelEn}</span>
              {item.badge && !isActive && (
                <span className="ml-1 text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
