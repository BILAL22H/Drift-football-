import React from 'react';
import { useGame } from '../context/GameContext';
import { GameMode } from '../types';
import { Swords, Target, Users, Flame, Calendar, BookOpen, Package, Trophy, Sparkles, Play, Shield } from 'lucide-react';

interface WelcomeViewProps {
  onSelectMode: (mode: GameMode) => void;
}

export const WelcomeView: React.FC<WelcomeViewProps> = ({ onSelectMode }) => {
  const { language, t, userStats, allPlayers } = useGame();

  const totalUnlocked = allPlayers.filter(p => userStats.unlockedPlayerIds.includes(p.id)).length;
  const accuracy = userStats.totalAnswered > 0
    ? Math.round((userStats.totalCorrect / userStats.totalAnswered) * 100)
    : 100;

  const modeCards: {
    mode: GameMode;
    title: string;
    desc: string;
    btn: string;
    icon: React.ReactNode;
    color: string;
    border: string;
    badge?: string;
  }[] = [
    {
      mode: 'draft-battle',
      title: t.modes.draftBattle.title,
      desc: t.modes.draftBattle.desc,
      btn: t.modes.draftBattle.btn,
      icon: <Swords className="w-6 h-6 text-amber-400" />,
      color: 'from-amber-950/60 via-[#181208] to-[#0a0c14]',
      border: 'border-amber-400/60 hover:border-amber-300 ring-1 ring-amber-400/20',
      badge: 'PvP & Online'
    },
    {
      mode: 'guess',
      title: t.modes.guess.title,
      desc: t.modes.guess.desc,
      btn: t.modes.guess.btn,
      icon: <Target className="w-6 h-6 text-emerald-400" />,
      color: 'from-emerald-950/50 via-[#0a151b] to-[#060e14]',
      border: 'border-emerald-500/40 hover:border-emerald-400',
      badge: 'Popular'
    },
    {
      mode: 'dream-team',
      title: t.modes.dreamTeam.title,
      desc: t.modes.dreamTeam.desc,
      btn: t.modes.dreamTeam.btn,
      icon: <Users className="w-6 h-6 text-cyan-400" />,
      color: 'from-cyan-950/50 via-[#0a1420] to-[#060c16]',
      border: 'border-cyan-500/40 hover:border-cyan-400',
      badge: 'Tactical'
    },
    {
      mode: 'endless',
      title: t.modes.endless.title,
      desc: t.modes.endless.desc,
      btn: t.modes.endless.btn,
      icon: <Flame className="w-6 h-6 text-orange-400" />,
      color: 'from-orange-950/50 via-[#18110b] to-[#0c0805]',
      border: 'border-orange-500/40 hover:border-orange-400',
      badge: 'High Score'
    },
    {
      mode: 'daily',
      title: t.modes.daily.title,
      desc: t.modes.daily.desc,
      btn: t.modes.daily.btn,
      icon: <Calendar className="w-6 h-6 text-amber-400" />,
      color: 'from-amber-950/50 via-[#17130b] to-[#0d0a06]',
      border: 'border-amber-500/40 hover:border-amber-400',
      badge: `Streak: ${userStats.dailyStreak}d`
    },
    {
      mode: 'collection',
      title: t.modes.collection.title,
      desc: t.modes.collection.desc,
      btn: t.modes.collection.btn,
      icon: <BookOpen className="w-6 h-6 text-purple-400" />,
      color: 'from-purple-950/50 via-[#140e1e] to-[#0b0712]',
      border: 'border-purple-500/40 hover:border-purple-400',
      badge: `${totalUnlocked}/${allPlayers.length}`
    },
    {
      mode: 'packs',
      title: t.modes.packs.title,
      desc: t.modes.packs.desc,
      btn: t.modes.packs.btn,
      icon: <Package className="w-6 h-6 text-yellow-400" />,
      color: 'from-yellow-950/50 via-[#19150b] to-[#0e0c06]',
      border: 'border-yellow-500/40 hover:border-yellow-400',
      badge: 'Store'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* Hero Showcase Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#071322] via-[#0b1c2b] to-[#08121d] border-2 border-emerald-500/30 p-6 sm:p-10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
        
        {/* Glow ambient background elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Hero Left Content */}
        <div className="relative z-10 max-w-xl text-center md:text-start rtl:md:text-right">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold font-rajdhani uppercase tracking-widest mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'الدوريات الخمس الكبرى في أوروبا' : 'Europe’s Big 5 Leagues'}</span>
          </div>

          <h1 className="font-teko text-4xl sm:text-6xl font-black text-white leading-none tracking-wide uppercase mb-3">
            {t.appTitle}
          </h1>

          <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed mb-6">
            {t.appSubtitle}
          </p>

          {/* Quick Play CTA */}
          <div className="flex flex-wrap items-center justify-center md:justify-start rtl:md:justify-start gap-3">
            <button
              onClick={() => onSelectMode('draft-battle')}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-yellow-200 text-slate-950 font-rajdhani font-black text-lg flex items-center gap-2 shadow-xl shadow-amber-400/25 active:scale-95 transition"
            >
              <Swords className="w-5 h-5 fill-current" />
              <span>{language === 'ar' ? 'معركة الدرفت (Draft Battle)' : 'Draft Battle (PvP)'}</span>
            </button>

            <button
              onClick={() => onSelectMode('guess')}
              className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-rajdhani font-bold text-base flex items-center gap-2 transition active:scale-95"
            >
              <Play className="w-4 h-4 fill-current text-emerald-400" />
              <span>{t.playNow}</span>
            </button>
          </div>
        </div>

        {/* Hero Right: Modern Triple Card Stack Visual */}
        <div className="relative z-10 flex items-center justify-center">
          <div className="relative w-64 h-72 sm:w-72 sm:h-80 flex items-center justify-center">
            {/* Card 1 - Background Left */}
            <div className="absolute -left-4 top-2 w-44 h-64 rounded-2xl bg-gradient-to-b from-[#211b10] to-[#0a0f18] border border-amber-400/50 shadow-2xl -rotate-12 transform scale-90 opacity-80 card-shine flex flex-col justify-between p-3">
              <div className="flex justify-between items-start">
                <span className="font-teko text-2xl font-black text-amber-300">91</span>
                <span className="text-sm">🇧🇷</span>
              </div>
              <div className="text-center font-rajdhani font-bold text-xs text-white uppercase">
                Vinícius Jr
              </div>
            </div>

            {/* Card 2 - Background Right */}
            <div className="absolute -right-4 top-2 w-44 h-64 rounded-2xl bg-gradient-to-b from-[#101e2c] to-[#070b13] border border-cyan-400/50 shadow-2xl rotate-12 transform scale-90 opacity-80 card-shine flex flex-col justify-between p-3">
              <div className="flex justify-between items-start">
                <span className="font-teko text-2xl font-black text-cyan-300">91</span>
                <span className="text-sm">🇳🇴</span>
              </div>
              <div className="text-center font-rajdhani font-bold text-xs text-white uppercase">
                Haaland
              </div>
            </div>

            {/* Card 3 - Main Centerpiece */}
            <div className="relative z-20 w-48 h-68 sm:w-52 sm:h-74 rounded-2xl bg-gradient-to-b from-[#2a2012] via-[#101726] to-[#080d19] border-2 border-amber-400 shadow-2xl card-shine flex flex-col justify-between p-4 transform hover:scale-105 transition-transform">
              <div className="flex justify-between items-start">
                <div className="leading-none">
                  <span className="font-teko text-3xl font-black text-amber-300">91</span>
                  <span className="block text-[10px] font-bold text-amber-400">ST</span>
                </div>
                <span className="text-base">🇫🇷</span>
              </div>
              <div className="text-center my-auto">
                <div className="w-16 h-16 rounded-full bg-amber-400/20 border border-amber-400/50 mx-auto flex items-center justify-center text-2xl shadow-inner">
                  ⚽
                </div>
              </div>
              <div className="text-center bg-black/60 rounded-lg p-1">
                <span className="font-rajdhani font-black text-sm text-white block uppercase">
                  Mbappé
                </span>
                <span className="text-[10px] text-amber-300">Real Madrid</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Quick Player Career Statistics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 font-rajdhani">
        <div className="p-4 rounded-2xl bg-[#0a1120] border border-white/5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block uppercase">{language === 'ar' ? 'الرقم القياسي' : 'High Score'}</span>
            <span className="font-teko text-2xl sm:text-3xl font-black text-white">{userStats.highScore}</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0a1120] border border-white/5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-400/10 border border-orange-400/20 flex items-center justify-center text-orange-400">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block uppercase">{language === 'ar' ? 'أعلى سلسلة' : 'Best Streak'}</span>
            <span className="font-teko text-2xl sm:text-3xl font-black text-orange-400">🔥 {userStats.bestStreak}</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0a1120] border border-white/5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center text-emerald-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block uppercase">{language === 'ar' ? 'دقة الإجابات' : 'Accuracy'}</span>
            <span className="font-teko text-2xl sm:text-3xl font-black text-emerald-400">{accuracy}%</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0a1120] border border-white/5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-400/10 border border-purple-400/20 flex items-center justify-center text-purple-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block uppercase">{language === 'ar' ? 'البطاقات المفتوحة' : 'Cards Unlocked'}</span>
            <span className="font-teko text-2xl sm:text-3xl font-black text-purple-300">
              {totalUnlocked} / {allPlayers.length}
            </span>
          </div>
        </div>
      </div>

      {/* Game Modes Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-teko text-2xl sm:text-3xl font-black text-white uppercase tracking-wider">
            {t.gameModes}
          </h2>
          <span className="text-xs text-slate-400">
            {language === 'ar' ? 'اختر نمط اللعب المفضل لديك' : 'Select any game mode to begin'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {modeCards.map(item => (
            <div
              key={item.mode}
              onClick={() => onSelectMode(item.mode)}
              className={`relative rounded-3xl p-5 bg-gradient-to-b ${item.color} border ${item.border} shadow-xl flex flex-col justify-between cursor-pointer group transition-all duration-300 hover:-translate-y-1.5`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-bold font-rajdhani uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/10 text-slate-300 border border-white/10">
                      {item.badge}
                    </span>
                  )}
                </div>

                <h3 className="font-teko text-2xl font-black text-white uppercase tracking-wide group-hover:text-emerald-300 transition">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  {item.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                <span className="text-xs font-bold font-rajdhani text-slate-300 group-hover:text-white transition">
                  {item.btn}
                </span>
                <span className="w-7 h-7 rounded-full bg-white/5 group-hover:bg-emerald-500 group-hover:text-slate-950 text-slate-400 flex items-center justify-center transition">
                  <Play className="w-3.5 h-3.5 fill-current rtl:rotate-180" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
