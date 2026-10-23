import React from 'react';
import { Player } from '../types';
import { soundFX } from '../utils/audio';
import { Lock, Sparkles, Check, HelpCircle, Star, Shield } from 'lucide-react';

interface MysteryDraftCardProps {
  cardIndex: number; // 0, 1, 2, 3 -> displays as 1, 2, 3, 4
  player: Player;
  isFlipped: boolean;
  canFlip: boolean;
  onFlip: () => void;
  onSelectPlayer: () => void;
  isArabic?: boolean;
}

export const MysteryDraftCard: React.FC<MysteryDraftCardProps> = ({
  cardIndex,
  player,
  isFlipped,
  canFlip,
  onFlip,
  onSelectPlayer,
  isArabic = false,
}) => {
  const cardNumber = cardIndex + 1;

  // Single-tap handler: if not flipped and can flip -> flip; if already flipped -> immediately select!
  const handleCardClick = () => {
    if (!isFlipped) {
      if (canFlip) {
        soundFX.playCardHover();
        onFlip();
      }
    } else {
      // Direct instant selection by tapping on the revealed card!
      soundFX.playCardSelect();
      onSelectPlayer();
    }
  };

  const rarityThemes = {
    legendary: 'from-amber-400 to-yellow-300 text-slate-950',
    totw: 'from-yellow-400 to-amber-500 text-black',
    gold: 'from-amber-300 to-yellow-200 text-black',
    silver: 'from-slate-300 to-slate-100 text-slate-900'
  }[player.rarity];

  return (
    <div
      onClick={handleCardClick}
      className="w-full max-w-[110px] xs:max-w-[125px] sm:max-w-[160px] md:max-w-[180px] h-[160px] xs:h-[185px] sm:h-[230px] md:h-[260px] perspective-1000 select-none cursor-pointer group"
    >
      <div
        className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* ======================================================== */}
        {/* FRONT FACE (COMPACT FACE-DOWN CARD NUMBERED 1, 2, 3, 4)  */}
        {/* ======================================================== */}
        <div
          className={`absolute inset-0 backface-hidden rounded-xl sm:rounded-2xl p-[2px] border transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-lg ${
            canFlip
              ? 'border-amber-400/80 hover:border-amber-300 hover:scale-[1.03] shadow-[0_0_15px_rgba(251,191,36,0.25)]'
              : 'border-white/10 opacity-40 cursor-not-allowed'
          }`}
          style={{
            background: 'linear-gradient(135deg, rgba(245,158,11,0.5) 0%, rgba(16,185,129,0.3) 50%, rgba(15,23,42,0.9) 100%)'
          }}
        >
          <div className="w-full h-full rounded-[10px] sm:rounded-[14px] bg-gradient-to-b from-[#141d2f] via-[#0b1320] to-[#050910] p-2 sm:p-3 flex flex-col justify-between items-center text-center card-back-pattern border border-white/10 relative overflow-hidden card-shine">
            
            {/* Top Badge: Number */}
            <div className="w-full flex items-center justify-between z-10 leading-none">
              <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-amber-400 text-slate-950 font-teko text-base sm:text-lg font-black flex items-center justify-center shadow">
                {cardNumber}
              </span>
              <span className="text-[8px] sm:text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-white/10 text-amber-300">
                FUT
              </span>
            </div>

            {/* Center Big Number */}
            <div className="relative my-auto flex flex-col items-center justify-center z-10">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-amber-400/10 border border-amber-400/40 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                <span className="font-teko text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-300 via-yellow-200 to-amber-500">
                  {cardNumber}
                </span>
              </div>
            </div>

            {/* Bottom Status Prompt */}
            <div className="w-full z-10 leading-none">
              {canFlip ? (
                <div className="w-full py-1 px-1 rounded-lg bg-amber-400/20 text-amber-300 font-rajdhani font-black text-[9px] sm:text-xs uppercase tracking-wider flex items-center justify-center gap-1 border border-amber-400/40 animate-pulse">
                  <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  <span>{isArabic ? 'كشف' : 'Flip'}</span>
                </div>
              ) : (
                <div className="w-full py-1 px-1 rounded-lg bg-white/5 text-slate-500 font-rajdhani font-bold text-[9px] sm:text-xs uppercase flex items-center justify-center gap-1">
                  <Lock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  <span>{isArabic ? 'مغلقة' : 'Locked'}</span>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* ======================================================== */}
        {/* BACK FACE (COMPACT REVEALED PLAYER - TAP TO CHOOSE!)     */}
        {/* ======================================================== */}
        <div
          className={`absolute inset-0 backface-hidden rotate-y-180 rounded-xl sm:rounded-2xl p-[2px] border-2 transition-transform ${
            player.rarity === 'legendary'
              ? 'border-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.5)] bg-gradient-to-b from-[#241a06] via-[#101726] to-[#060a12]'
              : 'border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)] bg-gradient-to-b from-[#1b2537] via-[#0d1624] to-[#060b13]'
          } flex flex-col justify-between overflow-hidden hover:scale-[1.03]`}
        >
          {/* Top Row: Rating, Flag, Club */}
          <div className="p-1.5 sm:p-2 flex items-start justify-between z-10 leading-none">
            <div className="flex flex-col items-center">
              <span className="font-teko text-xl sm:text-3xl font-black text-amber-300 drop-shadow">
                {player.rating}
              </span>
              <span className="font-rajdhani font-bold text-[8px] sm:text-[10px] text-white -mt-1 uppercase">
                {player.detailedPosition || player.position}
              </span>
            </div>

            <div className="flex flex-col items-end gap-0.5">
              <span className="text-sm sm:text-base leading-none">{player.flag}</span>
              <span className="text-xs leading-none">{player.clubLogo}</span>
              {player.rarity === 'legendary' && (
                <span className="text-[7px] sm:text-[8px] px-1 py-0.5 rounded bg-amber-400 text-slate-950 font-black font-rajdhani tracking-wider uppercase shadow">
                  ICON
                </span>
              )}
            </div>
          </div>

          {/* Center: Player Portrait */}
          <div className="relative flex-1 flex items-center justify-center my-0.5 overflow-hidden">
            <img
              src={player.photo}
              alt={player.shortName}
              loading="eager"
              className="max-h-[60px] xs:max-h-[75px] sm:max-h-[105px] md:max-h-[120px] w-auto max-w-[90%] object-contain rounded-lg drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (!target.dataset.triedFallback) {
                  target.dataset.triedFallback = 'true';
                  target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=1e293b&color=fbbf24&bold=true&size=160`;
                }
              }}
            />
          </div>

          {/* Player Name Banner */}
          <div className="px-1 py-0.5 bg-black/60 text-center z-10 leading-tight">
            <h4 className="font-rajdhani font-bold text-[10px] sm:text-xs text-white truncate uppercase">
              {isArabic ? player.nameAr : player.shortName}
            </h4>
            <span className="text-[8px] sm:text-[9px] text-amber-300/80 truncate block">
              {isArabic ? player.clubAr : player.club}
            </span>
          </div>

          {/* Bottom Tap to Pick Indicator */}
          <div className="w-full py-1 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-rajdhani font-black text-[9px] sm:text-xs uppercase text-center flex items-center justify-center gap-1 shadow">
            <Check className="w-3 h-3 stroke-[3]" />
            <span>{isArabic ? 'اضغط لاختياره' : 'Tap to Pick'}</span>
          </div>
        </div>

      </div>
    </div>
  );
};
