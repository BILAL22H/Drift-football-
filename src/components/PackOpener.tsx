import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { CARD_PACKS } from '../data/packs';
import { PackDefinition, Player } from '../types';
import { FootballCard } from './FootballCard';
import { soundFX } from '../utils/audio';
import confetti from 'canvas-confetti';
import { Coins, Sparkles, Package, Star, ArrowRight, ShieldCheck, Check } from 'lucide-react';

export const PackOpener: React.FC = () => {
  const { language, t, userStats, spendCoins, unlockPlayers, allPlayers } = useGame();

  const [activePack, setActivePack] = useState<PackDefinition | null>(null);
  const [isOpening, setIsOpening] = useState(false);
  const [revealedCards, setRevealedCards] = useState<Player[]>([]);
  const [openedPackModal, setOpenedPackModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleOpenPack = (pack: PackDefinition) => {
    if (userStats.coins < pack.cost) {
      setErrorMsg(t.packs.insufficientCoins);
      setTimeout(() => setErrorMsg(null), 3000);
      soundFX.playWrong();
      return;
    }

    const success = spendCoins(pack.cost);
    if (!success) return;

    setActivePack(pack);
    setIsOpening(true);
    soundFX.playPackOpen();

    // Generate cards from the pack definition
    setTimeout(() => {
      // Find candidate players
      const eligible = allPlayers.filter(p => p.rating >= pack.minRating);
      const otherPlayers = allPlayers.filter(p => p.rating < pack.minRating);

      const picked: Player[] = [];
      // Guarantee 1 high rated
      const guaranteedHigh = eligible[Math.floor(Math.random() * eligible.length)];
      picked.push(guaranteedHigh);

      // Remaining random picks
      const pool = allPlayers.filter(p => p.id !== guaranteedHigh.id);
      for (let i = 1; i < pack.cardCount; i++) {
        const randomCard = pool[Math.floor(Math.random() * pool.length)];
        if (!picked.some(p => p.id === randomCard.id)) {
          picked.push(randomCard);
        }
      }

      // Unlock these in game state
      unlockPlayers(picked.map(p => p.id));
      setRevealedCards(picked);
      setIsOpening(false);
      setOpenedPackModal(true);

      try {
        confetti({
          particleCount: 150,
          spread: 90,
          origin: { y: 0.55 }
        });
      } catch {}
    }, 1200);
  };

  const closeRevealModal = () => {
    setOpenedPackModal(false);
    setActivePack(null);
    setRevealedCards([]);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4">
      {/* Pack Store Header */}
      <div className="bg-[#0b1322] border border-white/10 rounded-2xl p-4 sm:p-6 mb-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="font-teko text-2xl sm:text-4xl font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Package className="w-8 h-8 text-amber-400" />
            <span>{t.packs.storeTitle}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            {t.packs.storeSubtitle}
          </p>
        </div>

        {/* Current Balance */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-amber-300 font-rajdhani">
          <Coins className="w-6 h-6 text-amber-400 fill-amber-400" />
          <div>
            <span className="text-[10px] text-amber-300 block uppercase font-bold">{t.packs.coinsAvailable}</span>
            <span className="font-teko text-3xl font-black leading-none">
              {userStats.coins.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Error alert if not enough coins */}
      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs sm:text-sm text-center mb-6 animate-shake">
          {errorMsg}
        </div>
      )}

      {/* Packs Showcase Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {CARD_PACKS.map(pack => {
          const canAfford = userStats.coins >= pack.cost;

          // Theme per pack tier
          const packThemes = {
            silver: {
              border: 'border-slate-400/40 hover:border-slate-300',
              bg: 'from-[#192130] via-[#0f1420] to-[#070b12]',
              accent: 'text-slate-300',
              btn: 'from-slate-400 to-slate-200 text-slate-950',
              tag: 'bg-slate-300/20 text-slate-200'
            },
            gold: {
              border: 'border-amber-400/50 hover:border-amber-300',
              bg: 'from-[#2a1d0d] via-[#14100b] to-[#07090f]',
              accent: 'text-amber-300',
              btn: 'from-amber-400 to-yellow-300 text-slate-950',
              tag: 'bg-amber-400/20 text-amber-300'
            },
            champions: {
              border: 'border-cyan-400/60 hover:border-cyan-300',
              bg: 'from-[#071f2b] via-[#08131d] to-[#04090f]',
              accent: 'text-cyan-300',
              btn: 'from-cyan-400 to-teal-300 text-slate-950',
              tag: 'bg-cyan-400/20 text-cyan-300'
            }
          }[pack.colorScheme];

          return (
            <div
              key={pack.id}
              className={`relative rounded-3xl p-6 bg-gradient-to-b ${packThemes.bg} border-2 ${packThemes.border} shadow-2xl flex flex-col justify-between transition-all duration-300 hover:-translate-y-2 group`}
            >
              {/* Top Tier Badge */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl">{pack.badge}</span>
                <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${packThemes.tag}`}>
                  {pack.cardCount} {language === 'ar' ? 'بطاقات' : 'Cards'}
                </span>
              </div>

              {/* Pack Graphic Illustration */}
              <div className="relative my-4 flex items-center justify-center">
                <div className="w-32 h-44 rounded-2xl bg-gradient-to-tr from-black/60 to-white/10 border-2 border-white/20 flex flex-col items-center justify-center p-3 shadow-inner card-shine group-hover:scale-105 transition-transform">
                  <Star className="w-10 h-10 text-amber-400 fill-amber-400 mb-2 animate-pulse" />
                  <span className="font-teko text-2xl font-black text-white uppercase text-center leading-none">
                    {language === 'ar' ? pack.nameAr : pack.nameEn}
                  </span>
                  <span className="text-[10px] text-amber-300 mt-1 font-mono font-bold">
                    MIN {pack.minRating}+ OVR
                  </span>
                </div>
              </div>

              {/* Title & Description */}
              <div className="text-center my-3">
                <h3 className="font-teko text-2xl font-black text-white uppercase tracking-wide">
                  {language === 'ar' ? pack.nameAr : pack.nameEn}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {language === 'ar' ? pack.descriptionAr : pack.descriptionEn}
                </p>
              </div>

              {/* Purchase Button */}
              <button
                onClick={() => handleOpenPack(pack)}
                disabled={isOpening}
                className={`w-full py-3 rounded-2xl font-rajdhani font-black text-base flex items-center justify-center gap-2 shadow-lg transition active:scale-95 ${
                  canAfford
                    ? `bg-gradient-to-r ${packThemes.btn} cursor-pointer`
                    : 'bg-white/10 text-slate-500 cursor-not-allowed border border-white/5'
                }`}
              >
                <Coins className="w-4 h-4 fill-current" />
                <span>{pack.cost} 🪙 - {language === 'ar' ? 'فتح الحزمة' : 'Open Pack'}</span>
              </button>

            </div>
          );
        })}
      </div>

      {/* Opening Animation Overlay */}
      {isOpening && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-lg">
          <div className="relative w-40 h-56 rounded-3xl bg-gradient-to-tr from-amber-500 to-yellow-300 border-4 border-white p-4 shadow-[0_0_50px_rgba(245,158,11,0.7)] flex flex-col items-center justify-center animate-bounce">
            <Sparkles className="w-12 h-12 text-slate-950 mb-2 animate-spin" />
            <span className="font-teko text-2xl font-black text-slate-950 uppercase text-center">
              {t.packs.opening}
            </span>
          </div>
          <p className="text-amber-300 font-rajdhani font-bold text-lg mt-6 animate-pulse">
            {language === 'ar' ? 'جاري كشف بطاقات النجوم...' : 'Revealing football stars...'}
          </p>
        </div>
      )}

      {/* Revealed Cards Modal */}
      {openedPackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-gradient-to-b from-[#121929] to-[#070c16] border border-amber-400/50 rounded-3xl p-6 sm:p-8 shadow-2xl text-center">
            
            <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400 mb-1">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{t.packs.congratulations}</span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>

            <h3 className="font-teko text-3xl sm:text-5xl font-black text-white uppercase tracking-wider mb-6">
              {language === 'ar' ? activePack?.nameAr : activePack?.nameEn}
            </h3>

            {/* Revealed Cards Row */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mb-8">
              {revealedCards.map(player => (
                <div key={player.id} className="animate-scale-in">
                  <FootballCard
                    player={player}
                    size="md"
                    isArabic={language === 'ar'}
                  />
                  <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                    <Check className="w-3 h-3" />
                    <span>{language === 'ar' ? 'تمت الإضافة للمجموعة' : 'Added to Binder'}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Confirm button */}
            <button
              onClick={closeRevealModal}
              className="px-8 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-rajdhani font-black text-lg shadow-xl shadow-emerald-500/20 transition active:scale-95"
            >
              {t.packs.collectAll}
            </button>

          </div>
        </div>
      )}

    </div>
  );
};
