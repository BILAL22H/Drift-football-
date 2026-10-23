import React, { useState } from 'react';
import { Player } from '../types';
import { soundFX } from '../utils/audio';
import { Check, X, Shield, Star } from 'lucide-react';

interface FootballCardProps {
  player: Player;
  onClick?: () => void;
  status?: 'default' | 'selected' | 'correct' | 'wrong' | 'revealed';
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  isArabic?: boolean;
  showDetails?: boolean;
}

export const FootballCard: React.FC<FootballCardProps> = ({
  player,
  onClick,
  status = 'default',
  disabled = false,
  size = 'md',
  isArabic = false,
  showDetails = true,
}) => {
  const [imgError, setImgError] = useState(false);

  const handleMouseEnter = () => {
    if (!disabled && onClick) {
      soundFX.playCardHover();
    }
  };

  const handleClick = () => {
    if (!disabled && onClick) {
      soundFX.playCardSelect();
      onClick();
    }
  };

  // Visual theming based on card rarity
  const rarityStyles = {
    legendary: {
      border: 'border-amber-400/80',
      bg: 'bg-gradient-to-b from-[#1c1809] via-[#0b141e] to-[#040810]',
      badgeBg: 'bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950',
      accent: 'text-amber-300',
      glow: 'shadow-[0_0_25px_rgba(251,191,36,0.25)]',
      statHeader: 'text-amber-300/80',
      label: 'LEGENDARY'
    },
    totw: {
      border: 'border-yellow-500/70',
      bg: 'bg-gradient-to-b from-[#181512] via-[#090b0e] to-[#000000]',
      badgeBg: 'bg-yellow-400 text-black',
      accent: 'text-yellow-400',
      glow: 'shadow-[0_0_20px_rgba(234,179,8,0.2)]',
      statHeader: 'text-yellow-400/80',
      label: 'IN-FORM'
    },
    gold: {
      border: 'border-amber-300/60',
      bg: 'bg-gradient-to-b from-[#251f14] via-[#12161f] to-[#0a0d14]',
      badgeBg: 'bg-amber-300 text-black',
      accent: 'text-amber-200',
      glow: 'shadow-[0_0_15px_rgba(245,158,11,0.15)]',
      statHeader: 'text-amber-200/80',
      label: 'RARE GOLD'
    },
    silver: {
      border: 'border-slate-300/60',
      bg: 'bg-gradient-to-b from-[#1e2430] via-[#111622] to-[#080b11]',
      badgeBg: 'bg-slate-200 text-slate-900',
      accent: 'text-slate-200',
      glow: 'shadow-[0_0_15px_rgba(148,163,184,0.15)]',
      statHeader: 'text-slate-300/80',
      label: 'SILVER'
    }
  }[player.rarity];

  // Sizing definitions
  const sizeClasses = {
    sm: 'w-32 min-h-[190px] text-xs',
    md: 'w-full max-w-[240px] sm:max-w-[260px] min-h-[360px] sm:min-h-[390px] text-sm',
    lg: 'w-full max-w-[290px] min-h-[440px] text-base'
  }[size];

  // Dynamic feedback status classes
  let statusBorder = rarityStyles.border;
  let statusClass = '';
  if (status === 'correct') {
    statusBorder = 'border-emerald-400 ring-4 ring-emerald-400/70 shadow-[0_0_35px_rgba(16,185,129,0.7)] scale-[1.03]';
    statusClass = 'glow-success';
  } else if (status === 'wrong') {
    statusBorder = 'border-rose-500 ring-4 ring-rose-500/70 shadow-[0_0_35px_rgba(244,63,94,0.7)] animate-shake';
    statusClass = 'glow-danger';
  } else if (status === 'revealed') {
    statusBorder = 'border-emerald-400/80 ring-2 ring-emerald-400/40 opacity-90';
  }

  const displayName = isArabic ? player.nameAr : player.shortName;
  const displayClub = isArabic ? player.clubAr : player.club;
  const displayLeague = isArabic ? player.leagueAr : player.league;

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onClick={handleClick}
      className={`relative select-none transition-all duration-300 ${sizeClasses} rounded-2xl p-[3px] ${statusBorder} ${statusClass} ${
        !disabled && onClick ? 'cursor-pointer hover:-translate-y-2 hover:shadow-2xl active:scale-95' : ''
      }`}
      style={{
        background: `linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.02) 100%)`
      }}
    >
      {/* Outer Card Shell */}
      <div className={`w-full h-full rounded-[14px] ${rarityStyles.bg} flex flex-col justify-between overflow-hidden card-shine border border-white/10 p-3 sm:p-4 backdrop-blur-md`}>
        
        {/* Status Indicators overlay */}
        {status === 'correct' && (
          <div className="absolute top-3 right-3 z-30 bg-emerald-500 text-white rounded-full p-1.5 shadow-lg flex items-center justify-center animate-bounce">
            <Check className="w-5 h-5 stroke-[3]" />
          </div>
        )}
        {status === 'wrong' && (
          <div className="absolute top-3 right-3 z-30 bg-rose-500 text-white rounded-full p-1.5 shadow-lg flex items-center justify-center">
            <X className="w-5 h-5 stroke-[3]" />
          </div>
        )}

        {/* Top Header Row: Rating, Position, Nationality, Club */}
        <div className="flex items-start justify-between z-10">
          <div className="flex flex-col items-center leading-none">
            <span className="font-teko text-3xl sm:text-4xl font-black tracking-tight text-white drop-shadow">
              {player.rating}
            </span>
            <span className="font-rajdhani font-bold text-xs sm:text-sm uppercase tracking-wider text-amber-300 -mt-1">
              {player.detailedPosition || player.position}
            </span>
            <div className="w-4 h-0.5 bg-white/20 my-1 rounded" />
            <span className="text-base sm:text-lg" title={player.nationality}>
              {player.flag}
            </span>
            <span className="text-sm mt-0.5" title={player.club}>
              {player.clubLogo}
            </span>
          </div>

          {/* Rarity & League Ribbon */}
          <div className="flex flex-col items-end text-right">
            <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-white/10 text-slate-300 border border-white/10">
              <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
              {rarityStyles.label}
            </span>
            <span className="text-[11px] font-medium text-slate-400 mt-1 truncate max-w-[120px]">
              {displayLeague}
            </span>
          </div>
        </div>

        {/* Center: Player Portrait or Illustrated Fallback Avatar */}
        <div className="relative my-1 flex-1 flex items-center justify-center min-h-[120px] sm:min-h-[150px]">
          {/* Subtle back illumination glow */}
          <div className="absolute inset-0 bg-radial from-amber-400/10 to-transparent blur-xl pointer-events-none" />

          {!imgError ? (
            <img
              src={player.photo}
              alt={player.name}
              onError={() => setImgError(true)}
              loading="lazy"
              className="relative z-10 max-h-[140px] sm:max-h-[175px] w-auto object-cover rounded-xl shadow-lg transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="relative z-10 w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-tr from-slate-800 to-slate-700 flex flex-col items-center justify-center border-2 border-amber-400/40 shadow-inner">
              <Shield className="w-10 h-10 text-amber-400/60 mb-1" />
              <span className="font-rajdhani font-black text-xl text-white">
                {player.shortName.substring(0, 2).toUpperCase()}
              </span>
              <span className="text-[10px] text-slate-300 font-mono mt-0.5">
                {player.club}
              </span>
            </div>
          )}
        </div>

        {/* Name Banner */}
        <div className="z-10 text-center my-1">
          <div className="relative py-1 px-2 rounded-lg bg-black/40 border border-white/10 backdrop-blur-sm">
            <h3 className="font-rajdhani font-bold text-sm sm:text-base text-white tracking-wide truncate uppercase">
              {displayName}
            </h3>
            <p className="text-[10px] sm:text-xs text-amber-300/90 font-medium truncate">
              {displayClub}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        {showDetails && (
          <div className="z-10 pt-2 border-t border-white/10">
            {/* 6 Core FUT Stats */}
            <div className="grid grid-cols-3 gap-x-2 gap-y-1 text-center font-rajdhani">
              <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-white/5">
                <span className="text-[10px] font-bold text-slate-400">PAC</span>
                <span className="text-xs font-black text-white">{player.stats.pace}</span>
              </div>
              <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-white/5">
                <span className="text-[10px] font-bold text-slate-400">SHO</span>
                <span className="text-xs font-black text-white">{player.stats.shooting}</span>
              </div>
              <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-white/5">
                <span className="text-[10px] font-bold text-slate-400">PAS</span>
                <span className="text-xs font-black text-white">{player.stats.passing}</span>
              </div>
              <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-white/5">
                <span className="text-[10px] font-bold text-slate-400">DRI</span>
                <span className="text-xs font-black text-white">{player.stats.dribbling}</span>
              </div>
              <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-white/5">
                <span className="text-[10px] font-bold text-slate-400">DEF</span>
                <span className="text-xs font-black text-white">{player.stats.defending}</span>
              </div>
              <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-white/5">
                <span className="text-[10px] font-bold text-slate-400">PHY</span>
                <span className="text-xs font-black text-white">{player.stats.physical}</span>
              </div>
            </div>

            {/* Quick Season Highlights */}
            <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 px-1">
              <span>⚽ {player.seasonStats.goals} {isArabic ? 'هدف' : 'Goals'}</span>
              <span>🎯 {player.seasonStats.assists} {isArabic ? 'تمريرة' : 'Asts'}</span>
              <span>🎂 {player.age} {isArabic ? 'سنة' : 'yo'}</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
