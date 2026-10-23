import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { FORMATIONS } from '../data/formations';
import { Player, Position, FormationSlot } from '../types';
import { FootballCard } from './FootballCard';
import { soundFX } from '../utils/audio';
import { Shield, Sparkles, Trash2, X, Plus, Layers, UserCheck } from 'lucide-react';

export const DreamTeamBuilder: React.FC = () => {
  const {
    language,
    t,
    userStats,
    setFormation,
    updateDreamTeamSlot,
    autoFillDreamTeam,
    clearDreamTeam,
    getUnlockedPlayers,
    allPlayers
  } = useGame();

  const [activeSlot, setActiveSlot] = useState<FormationSlot | null>(null);
  const [filterRarity, setFilterRarity] = useState<string>('all');

  const currentSlots = FORMATIONS[userStats.formation];
  const unlocked = getUnlockedPlayers();

  // Map of playerId -> Player object
  const playerMap = new Map<string, Player>();
  allPlayers.forEach(p => playerMap.set(p.id, p));

  // Calculate Squad Rating
  const assignedPlayers: Player[] = currentSlots
    .map(slot => userStats.dreamTeam[slot.id])
    .filter((id): id is string => Boolean(id))
    .map(id => playerMap.get(id)!)
    .filter(Boolean);

  const squadRating = assignedPlayers.length > 0
    ? Math.round(assignedPlayers.reduce((acc, p) => acc + p.rating, 0) / assignedPlayers.length)
    : 0;

  // Calculate Team Chemistry (Club, League, Nationality links)
  let chemistryScore = 0;
  if (assignedPlayers.length > 1) {
    const clubCounts: Record<string, number> = {};
    const leagueCounts: Record<string, number> = {};
    const nationCounts: Record<string, number> = {};

    assignedPlayers.forEach(p => {
      clubCounts[p.club] = (clubCounts[p.club] || 0) + 1;
      leagueCounts[p.league] = (leagueCounts[p.league] || 0) + 1;
      nationCounts[p.nationality] = (nationCounts[p.nationality] || 0) + 1;
    });

    Object.values(clubCounts).forEach(c => { if (c >= 2) chemistryScore += (c - 1) * 4; });
    Object.values(leagueCounts).forEach(c => { if (c >= 2) chemistryScore += (c - 1) * 3; });
    Object.values(nationCounts).forEach(c => { if (c >= 2) chemistryScore += (c - 1) * 2; });
  }
  const squadChemistry = Math.min(33, chemistryScore);

  // Filter candidates for selected slot
  const slotCandidates = activeSlot
    ? unlocked.filter(p => p.position === activeSlot.allowedPosition)
    : [];

  const handleSelectPlayerForSlot = (player: Player) => {
    if (!activeSlot) return;
    updateDreamTeamSlot(activeSlot.id, player.id);
    soundFX.playCardSelect();
    setActiveSlot(null);
  };

  const handleRemovePlayerFromSlot = (slotId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    updateDreamTeamSlot(slotId, null);
    soundFX.playWrong();
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4">
      {/* Top Controls & Metrics */}
      <div className="bg-[#0b1220] border border-white/10 rounded-2xl p-4 mb-4 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Title & Formation Picker */}
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <h2 className="font-teko text-2xl sm:text-3xl font-black text-white tracking-wide uppercase">
              {t.dreamTeam.squadTitle}
            </h2>
            <p className="text-xs text-slate-400">
              {language === 'ar' ? 'عيّن لاعبيك في مراكزهم واحصل على أعلى تناغم وتقييم' : 'Assign collected cards to build the ultimate 11'}
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10">
            {(['4-3-3', '4-2-3-1', '3-5-2'] as const).map(fmt => (
              <button
                key={fmt}
                onClick={() => setFormation(fmt)}
                className={`px-3 py-1 rounded-lg font-rajdhani font-bold text-xs sm:text-sm transition ${
                  userStats.formation === fmt
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>
        </div>

        {/* Squad Rating & Chemistry Badges */}
        <div className="flex items-center gap-3 sm:gap-6 font-rajdhani">
          {/* Squad OVR */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-400/10 border border-amber-400/30">
            <Shield className="w-5 h-5 text-amber-400" />
            <div>
              <span className="text-[10px] text-amber-300 block uppercase font-bold">{t.dreamTeam.squadRating}</span>
              <span className="font-teko text-2xl font-black text-amber-300 leading-none">
                {squadRating > 0 ? squadRating : '--'}
              </span>
            </div>
          </div>

          {/* Chemistry */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-400/10 border border-cyan-400/30">
            <Layers className="w-5 h-5 text-cyan-400" />
            <div>
              <span className="text-[10px] text-cyan-300 block uppercase font-bold">{t.dreamTeam.chemistry}</span>
              <span className="font-teko text-2xl font-black text-cyan-300 leading-none">
                {squadChemistry} / 33
              </span>
            </div>
          </div>

          {/* Players Count */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
            <UserCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-bold">{language === 'ar' ? 'اللاعبين' : 'Starters'}</span>
              <span className="font-teko text-2xl font-black text-white leading-none">
                {assignedPlayers.length} / 11
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={autoFillDreamTeam}
              title={t.dreamTeam.autoBuild}
              className="px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold font-rajdhani flex items-center gap-1.5 transition active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.dreamTeam.autoBuild}</span>
            </button>
            <button
              onClick={clearDreamTeam}
              title={t.dreamTeam.clearSquad}
              className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs transition active:scale-95"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

      {/* The Football Pitch Canvas */}
      <div className="relative w-full max-w-4xl mx-auto rounded-3xl overflow-hidden border-2 border-emerald-500/40 shadow-2xl pitch-pattern min-h-[580px] sm:min-h-[660px] p-4 flex flex-col justify-between">
        
        {/* Pitch Lines (FIFA regulation style) */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Halfway line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/15 -translate-y-1/2" />
          {/* Center circle */}
          <div className="absolute top-1/2 left-1/2 w-32 h-32 sm:w-44 sm:h-44 rounded-full border border-white/15 -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-white/30 -translate-x-1/2 -translate-y-1/2" />
          {/* Top Penalty Area (Opponent) */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 sm:w-64 h-24 sm:h-28 border-b border-x border-white/15 rounded-b-xl" />
          {/* Bottom Penalty Area (Home) */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 sm:w-64 h-24 sm:h-28 border-t border-x border-white/15 rounded-t-xl" />
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white/30" />
        </div>

        {/* Formation Slots Placed Dynamically */}
        <div className="relative w-full h-full min-h-[540px] sm:min-h-[620px]">
          {currentSlots.map(slot => {
            const playerId = userStats.dreamTeam[slot.id];
            const player = playerId ? playerMap.get(playerId) : null;

            return (
              <div
                key={slot.id}
                onClick={() => setActiveSlot(slot)}
                style={{
                  left: `${slot.x}%`,
                  top: `${slot.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                className="absolute z-20 cursor-pointer group flex flex-col items-center transition-transform hover:scale-110 active:scale-95"
              >
                {player ? (
                  /* Filled Slot Card Badge */
                  <div className="relative flex flex-col items-center">
                    <div className="relative w-14 h-20 sm:w-18 sm:h-24 rounded-xl bg-gradient-to-b from-[#1f293d] to-[#0d131f] border border-amber-400/80 p-1 flex flex-col justify-between items-center shadow-lg group-hover:border-amber-300">
                      {/* Rating & Flag */}
                      <div className="w-full flex items-center justify-between text-[10px] leading-none px-0.5">
                        <span className="font-teko text-xs sm:text-sm font-black text-amber-300">{player.rating}</span>
                        <span className="text-[10px]">{player.flag}</span>
                      </div>

                      {/* Photo / Avatar */}
                      <img
                        src={player.photo}
                        alt={player.shortName}
                        className="w-8 h-8 sm:w-11 sm:h-11 object-cover rounded-full border border-amber-300/40"
                        onError={(e) => {
                          // Hide broken image
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />

                      {/* Position & Name */}
                      <div className="w-full text-center bg-black/60 rounded py-0.5 leading-none">
                        <span className="text-[9px] font-bold text-white block truncate px-0.5">
                          {language === 'ar' ? player.nameAr : player.shortName}
                        </span>
                      </div>

                      {/* Remove Button on Hover */}
                      <button
                        onClick={(e) => handleRemovePlayerFromSlot(slot.id, e)}
                        className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow"
                        title="Remove Player"
                      >
                        <X className="w-2.5 h-2.5 stroke-[3]" />
                      </button>
                    </div>

                    <span className="text-[10px] font-bold font-rajdhani text-emerald-300 bg-black/70 px-1.5 py-0.2 rounded-full mt-1 border border-white/10">
                      {slot.label}
                    </span>
                  </div>
                ) : (
                  /* Empty Slot Marker */
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-16 sm:w-14 sm:h-18 rounded-xl border-2 border-dashed border-emerald-400/50 bg-[#07130e]/80 flex flex-col items-center justify-center text-emerald-400 shadow-md group-hover:border-emerald-300 group-hover:bg-emerald-950/40 transition">
                      <Plus className="w-5 h-5 mb-0.5" />
                      <span className="font-rajdhani text-xs font-black uppercase text-emerald-300">
                        {slot.label}
                      </span>
                    </div>
                    <span className="text-[9px] font-medium text-slate-300 bg-black/50 px-1 rounded mt-0.5">
                      {slot.allowedPosition}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Select Player Modal for Active Slot */}
      {activeSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#111827] to-[#0a0e17] border border-emerald-500/40 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div>
                <h3 className="font-teko text-2xl sm:text-3xl font-black text-white uppercase tracking-wider">
                  {t.dreamTeam.selectPlayer.replace('{pos}', `${activeSlot.label} (${activeSlot.allowedPosition})`)}
                </h3>
                <p className="text-xs text-slate-400">
                  {language === 'ar' ? 'اختر لاعباً من بطاقاتك المفتوحة لتضعه في هذا المركز' : 'Pick an unlocked card from your binder for this position'}
                </p>
              </div>
              <button
                onClick={() => setActiveSlot(null)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Candidate Cards Grid */}
            <div className="flex-1 overflow-y-auto pr-1">
              {slotCandidates.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {slotCandidates.map(player => (
                    <div
                      key={player.id}
                      onClick={() => handleSelectPlayerForSlot(player)}
                      className="cursor-pointer group flex flex-col items-center rounded-2xl p-2.5 bg-white/5 hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-500/60 transition active:scale-95"
                    >
                      <FootballCard
                        player={player}
                        size="sm"
                        showDetails={false}
                        isArabic={language === 'ar'}
                      />
                      <button className="mt-2 w-full py-1 rounded-lg bg-emerald-500 group-hover:bg-emerald-400 text-slate-950 font-rajdhani font-black text-xs uppercase shadow transition">
                        {language === 'ar' ? 'اختر هذا اللاعب' : 'Select'}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 px-4">
                  <Shield className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-sm text-slate-400 max-w-md mx-auto">
                    {t.dreamTeam.noEligible}
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
