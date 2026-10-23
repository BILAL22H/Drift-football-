import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Player, Position, League, CardRarity } from '../types';
import { FootballCard } from './FootballCard';
import { Lock, Search, Filter, X, Award, Shield, Star, Sparkles } from 'lucide-react';

export const CollectionBinder: React.FC = () => {
  const { language, t, allPlayers, userStats } = useGame();

  const [selectedLeague, setSelectedLeague] = useState<string>('all');
  const [selectedPosition, setSelectedPosition] = useState<string>('all');
  const [selectedRarity, setSelectedRarity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [inspectPlayer, setInspectPlayer] = useState<Player | null>(null);

  const unlockedIds = new Set(userStats.unlockedPlayerIds);
  const totalUnlocked = allPlayers.filter(p => unlockedIds.has(p.id)).length;
  const unlockPercentage = Math.round((totalUnlocked / allPlayers.length) * 100);

  // Filter players
  const filteredPlayers = allPlayers.filter(player => {
    const matchesLeague = selectedLeague === 'all' || player.league === selectedLeague;
    const matchesPosition = selectedPosition === 'all' || player.position === selectedPosition;
    const matchesRarity = selectedRarity === 'all' || player.rarity === selectedRarity;
    const matchesSearch =
      searchQuery === '' ||
      player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.club.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.nationality.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.nameAr.includes(searchQuery) ||
      player.clubAr.includes(searchQuery);

    return matchesLeague && matchesPosition && matchesRarity && matchesSearch;
  });

  const leaguesList: { id: string; nameEn: string; nameAr: string }[] = [
    { id: 'all', nameEn: 'All Leagues', nameAr: 'جميع الدوريات' },
    { id: 'Icons & Legends', nameEn: 'Icons & Legends', nameAr: 'الأساطير والكلاسيكو' },
    { id: 'Premier League', nameEn: 'Premier League', nameAr: 'الدوري الإنجليزي' },
    { id: 'La Liga', nameEn: 'La Liga', nameAr: 'الدوري الإسباني' },
    { id: 'Bundesliga', nameEn: 'Bundesliga', nameAr: 'الدوري الألماني' },
    { id: 'Serie A', nameEn: 'Serie A', nameAr: 'الدوري الإيطالي' },
    { id: 'Ligue 1', nameEn: 'Ligue 1', nameAr: 'الدوري الفرنسي' }
  ];

  const positionsList: { id: string; label: string }[] = [
    { id: 'all', label: 'All POS' },
    { id: 'GK', label: 'GK' },
    { id: 'DEF', label: 'DEF' },
    { id: 'MID', label: 'MID' },
    { id: 'FWD', label: 'FWD' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4">
      {/* Top Collection Summary Banner */}
      <div className="bg-[#0b1322] border border-white/10 rounded-2xl p-4 mb-4 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="font-teko text-2xl sm:text-3xl font-black text-white uppercase tracking-wider flex items-center gap-2">
            <span>{t.modes.collection.title}</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-rajdhani font-bold border border-amber-400/40">
              {totalUnlocked} / {allPlayers.length} ({unlockPercentage}%)
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            {language === 'ar' ? 'البطاقات التي جمعتها من التحديات وحزم البطاقات' : 'Browse your collected cards, player profiles, and season statistics'}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full md:w-64 flex flex-col gap-1.5">
          <div className="flex justify-between text-xs text-slate-300 font-rajdhani font-bold">
            <span>{language === 'ar' ? 'اكتمال الألبوم' : 'Album Completion'}</span>
            <span className="text-emerald-400">{unlockPercentage}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
              style={{ width: `${unlockPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#080d17] border border-white/5 rounded-2xl p-3 mb-6 flex flex-wrap items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rtl:right-3 rtl:left-auto" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'ar' ? 'ابحث باسم اللاعب، النادي، الجنسية...' : 'Search player, club, country...'}
            className="w-full pl-9 pr-3 rtl:pr-9 rtl:pl-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-emerald-500/60"
          />
        </div>

        {/* League Selector */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
          {leaguesList.map(item => (
            <button
              key={item.id}
              onClick={() => setSelectedLeague(item.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold font-rajdhani whitespace-nowrap transition ${
                selectedLeague === item.id
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white bg-white/5'
              }`}
            >
              {language === 'ar' ? item.nameAr : item.nameEn}
            </button>
          ))}
        </div>

        {/* Position Filter */}
        <div className="flex items-center gap-1">
          {positionsList.map(pos => (
            <button
              key={pos.id}
              onClick={() => setSelectedPosition(pos.id)}
              className={`px-2 py-1 rounded-lg text-xs font-bold font-rajdhani transition ${
                selectedPosition === pos.id
                  ? 'bg-amber-400 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white bg-white/5'
              }`}
            >
              {pos.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 justify-items-center">
        {filteredPlayers.map(player => {
          const isUnlocked = unlockedIds.has(player.id);

          if (isUnlocked) {
            return (
              <div
                key={player.id}
                onClick={() => setInspectPlayer(player)}
                className="w-full flex justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95"
              >
                <FootballCard
                  player={player}
                  size="sm"
                  isArabic={language === 'ar'}
                  showDetails={false}
                />
              </div>
            );
          } else {
            /* Locked Silhouette Card */
            return (
              <div
                key={player.id}
                className="w-32 min-h-[190px] rounded-2xl border border-white/10 bg-[#070b13]/80 p-3 flex flex-col justify-between items-center text-center opacity-60 hover:opacity-80 transition"
              >
                <div className="w-full flex justify-between text-slate-600 text-xs font-mono">
                  <span>??</span>
                  <span>{player.position}</span>
                </div>

                <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-600 my-auto">
                  <Lock className="w-6 h-6" />
                </div>

                <div className="w-full">
                  <span className="text-[11px] font-bold text-slate-400 block truncate">
                    {language === 'ar' ? 'لاعب مغلق' : 'Locked Card'}
                  </span>
                  <span className="text-[9px] text-slate-500 block truncate">
                    {player.league}
                  </span>
                </div>
              </div>
            );
          }
        })}
      </div>

      {/* Inspect Card Modal */}
      {inspectPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg bg-gradient-to-b from-[#11192a] to-[#070d18] border border-amber-400/50 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row items-center gap-6">
            
            {/* Close Button */}
            <button
              onClick={() => setInspectPlayer(null)}
              className="absolute top-4 right-4 rtl:left-4 rtl:right-auto p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Card preview */}
            <div className="shrink-0">
              <FootballCard
                player={inspectPlayer}
                size="md"
                isArabic={language === 'ar'}
              />
            </div>

            {/* Detailed Career Dossier */}
            <div className="flex-1 w-full text-slate-200">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{inspectPlayer.flag}</span>
                <span className="text-sm font-bold text-amber-300 uppercase tracking-wider">
                  {inspectPlayer.nationality}
                </span>
              </div>

              <h3 className="font-teko text-3xl font-black text-white leading-tight">
                {language === 'ar' ? inspectPlayer.nameAr : inspectPlayer.name}
              </h3>
              <p className="text-sm text-slate-400 mb-4 font-medium">
                {inspectPlayer.club} • {inspectPlayer.league}
              </p>

              {/* Bio Highlights */}
              <div className="space-y-2 text-xs font-rajdhani bg-white/5 p-3 rounded-2xl border border-white/10 mb-4">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">{t.stats.position}</span>
                  <span className="font-bold text-white">{inspectPlayer.detailedPosition} ({t.positions[inspectPlayer.position]})</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">{t.stats.age}</span>
                  <span className="font-bold text-white">{inspectPlayer.age} {language === 'ar' ? 'عاماً' : 'Years'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">{t.stats.goals}</span>
                  <span className="font-bold text-amber-300">{inspectPlayer.seasonStats.goals}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">{t.stats.assists}</span>
                  <span className="font-bold text-cyan-300">{inspectPlayer.seasonStats.assists}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-emerald-400">
                <Sparkles className="w-4 h-4" />
                <span>{language === 'ar' ? 'جاهز للاستخدام في تشكيلة الأحلام' : 'Ready to use in Dream Team builder'}</span>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
