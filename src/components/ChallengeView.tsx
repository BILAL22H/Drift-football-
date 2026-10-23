import React, { useState, useEffect } from 'react';
import { Challenge, Player } from '../types';
import { generateFourCardChallenge } from '../utils/challengeGenerator';
import { FootballCard } from './FootballCard';
import { useGame } from '../context/GameContext';
import { soundFX } from '../utils/audio';
import confetti from 'canvas-confetti';
import { Award, ArrowRight, RotateCcw, Zap, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

interface ChallengeViewProps {
  onOpenPackStore?: () => void;
}

export const ChallengeView: React.FC<ChallengeViewProps> = ({ onOpenPackStore }) => {
  const { language, t, recordAnswer, userStats, addCoins } = useGame();

  const [currentRound, setCurrentRound] = useState(1);
  const totalRounds = 10;
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [roundFeedback, setRoundFeedback] = useState<{
    isCorrect: boolean;
    points: number;
    bonus: number;
    streak: number;
  } | null>(null);

  // Match statistics for summary
  const [matchScore, setMatchScore] = useState(0);
  const [matchCorrect, setMatchCorrect] = useState(0);
  const [matchMaxStreak, setMatchMaxStreak] = useState(0);
  const [isMatchOver, setIsMatchOver] = useState(false);

  // Initialize first challenge
  useEffect(() => {
    loadNewRound();
  }, []);

  const loadNewRound = () => {
    const newChallenge = generateFourCardChallenge();
    setChallenge(newChallenge);
    setSelectedPlayerId(null);
    setIsAnswered(false);
    setRoundFeedback(null);
  };

  const handleCardClick = (player: Player) => {
    if (isAnswered || !challenge) return;

    const isCorrect = player.id === challenge.correctPlayerId;
    setSelectedPlayerId(player.id);
    setIsAnswered(true);

    const { pointsEarned, bonus, newStreak } = recordAnswer(isCorrect);

    if (isCorrect) {
      setMatchScore(prev => prev + pointsEarned + bonus);
      setMatchCorrect(prev => prev + 1);
      setMatchMaxStreak(prev => Math.max(prev, newStreak));
    } else {
      setMatchScore(prev => Math.max(0, prev - 25));
    }

    setRoundFeedback({
      isCorrect,
      points: pointsEarned,
      bonus,
      streak: newStreak
    });
  };

  const handleNextRound = () => {
    if (currentRound >= totalRounds) {
      // Finish Match
      setIsMatchOver(true);
      soundFX.playRefereeWhistle();
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {}
    } else {
      setCurrentRound(prev => prev + 1);
      loadNewRound();
    }
  };

  const restartMatch = () => {
    setCurrentRound(1);
    setMatchScore(0);
    setMatchCorrect(0);
    setMatchMaxStreak(0);
    setIsMatchOver(false);
    loadNewRound();
  };

  if (!challenge) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Calculate live accuracy
  const totalAttempted = userStats.totalAnswered;
  const overallAccuracy = totalAttempted > 0 ? Math.round((userStats.totalCorrect / totalAttempted) * 100) : 100;
  const matchAccuracy = Math.round((matchCorrect / Math.max(1, currentRound - (isAnswered ? 0 : 1))) * 100);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4">
      {/* Top Match Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0c1222] border border-white/10 rounded-2xl p-3 sm:p-4 mb-4 backdrop-blur-md shadow-xl">
        {/* Round Progress Indicator */}
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-teko text-xl tracking-wider uppercase">
            {t.challenge.round} {currentRound} / {totalRounds}
          </span>
          <div className="hidden sm:flex gap-1">
            {Array.from({ length: totalRounds }).map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all ${
                  i < currentRound - 1
                    ? 'w-4 bg-emerald-500'
                    : i === currentRound - 1
                    ? 'w-6 bg-amber-400'
                    : 'w-2 bg-white/10'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Live Match Stats */}
        <div className="flex items-center gap-3 sm:gap-6 font-rajdhani text-sm sm:text-base">
          <div>
            <span className="text-slate-400 block text-[11px] uppercase tracking-wider">{t.challenge.score}</span>
            <span className="font-teko text-2xl sm:text-3xl font-black text-amber-300 leading-none">
              {matchScore}
            </span>
          </div>

          <div className="h-7 w-[1px] bg-white/10" />

          <div>
            <span className="text-slate-400 block text-[11px] uppercase tracking-wider">{t.results.accuracy}</span>
            <span className="font-teko text-2xl sm:text-3xl font-bold text-white leading-none">
              {matchAccuracy}%
            </span>
          </div>

          <div className="h-7 w-[1px] bg-white/10" />

          <div>
            <span className="text-slate-400 block text-[11px] uppercase tracking-wider">{t.challenge.streak}</span>
            <span className="font-teko text-2xl sm:text-3xl font-bold text-orange-400 leading-none flex items-center gap-1">
              🔥 {userStats.streak}
            </span>
          </div>
        </div>
      </div>

      {/* The Big Stadium Challenge Question Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0e172a] via-[#102238] to-[#0c1825] border border-amber-400/30 p-4 sm:p-6 mb-6 shadow-2xl text-center">
        {/* Glow ambient light */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-2 bg-gradient-to-r from-transparent via-amber-400/50 to-transparent blur-sm" />

        <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400/90 mb-1">
          <Zap className="w-3.5 h-3.5 fill-amber-400" />
          <span>{language === 'ar' ? 'سؤال التحدي' : 'Match Question'}</span>
          <Zap className="w-3.5 h-3.5 fill-amber-400" />
        </div>

        <h2 className="font-rajdhani text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight max-w-3xl mx-auto">
          {language === 'ar' ? challenge.questionAr : challenge.questionEn}
        </h2>

        <p className="text-xs sm:text-sm text-slate-400 mt-2 font-medium">
          {t.challenge.selectPrompt}
        </p>
      </div>

      {/* Answer Feedback Banner (shows immediately upon card selection) */}
      {roundFeedback && (
        <div className={`p-4 rounded-2xl mb-6 border flex flex-col sm:flex-row items-center justify-between gap-3 animate-fade-in ${
          roundFeedback.isCorrect
            ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
            : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
        }`}>
          <div className="flex items-center gap-3">
            {roundFeedback.isCorrect ? (
              <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-8 h-8 text-rose-400 shrink-0" />
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-teko text-2xl font-black tracking-wide">
                  {roundFeedback.isCorrect ? t.challenge.correct : t.challenge.incorrect}
                </span>
                <span className={`px-2 py-0.5 rounded text-xs font-black font-rajdhani ${
                  roundFeedback.isCorrect ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                }`}>
                  {roundFeedback.isCorrect ? `+${roundFeedback.points} PTS` : `-25 PTS`}
                </span>
                {roundFeedback.bonus > 0 && (
                  <span className="px-2 py-0.5 rounded text-xs font-black bg-amber-400/20 text-amber-300 border border-amber-400/40">
                    🔥 {t.challenge.streakBonus.replace('{pts}', roundFeedback.bonus.toString())}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 mt-0.5 font-sans">
                {language === 'ar' ? challenge.explanationAr : challenge.explanationEn}
              </p>
            </div>
          </div>

          <button
            onClick={handleNextRound}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-rajdhani font-black text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition active:scale-95 shrink-0"
          >
            <span>{currentRound >= totalRounds ? t.challenge.finishRound : t.challenge.nextRound}</span>
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </button>
        </div>
      )}

      {/* The 4 Football Cards Grid (GK, DEF, MID, FWD) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10 justify-items-center py-4 px-2">
        {challenge.cards.map(player => {
          let cardStatus: 'default' | 'selected' | 'correct' | 'wrong' | 'revealed' = 'default';

          if (isAnswered) {
            if (player.id === challenge.correctPlayerId) {
              cardStatus = 'correct';
            } else if (player.id === selectedPlayerId) {
              cardStatus = 'wrong';
            } else {
              cardStatus = 'revealed';
            }
          }

          return (
            <div key={player.id} className="w-full flex justify-center">
              <FootballCard
                player={player}
                status={cardStatus}
                disabled={isAnswered}
                isArabic={language === 'ar'}
                onClick={() => handleCardClick(player)}
              />
            </div>
          );
        })}
      </div>

      {/* Position Legend bar */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400 font-rajdhani">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <strong>1. GK:</strong> {t.positions.GK}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <strong>2. DEF:</strong> {t.positions.DEF}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-400" />
          <strong>3. MID:</strong> {t.positions.MID}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-400" />
          <strong>4. FWD:</strong> {t.positions.FWD}
        </span>
      </div>

      {/* Match Completed Modal */}
      {isMatchOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-gradient-to-b from-[#111a2f] to-[#080d17] border border-amber-400/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-center">
            
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-200 flex items-center justify-center shadow-lg shadow-amber-400/30 mb-4 animate-bounce">
              <Award className="w-10 h-10 text-slate-950" />
            </div>

            <h3 className="font-teko text-3xl sm:text-4xl font-black text-white uppercase tracking-wider mb-1">
              {t.results.gameComplete}
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mb-6 font-medium">
              {language === 'ar' ? 'أنهيت جميع جولات التحدي بنجاح!' : 'You have completed all 10 challenge rounds!'}
            </p>

            {/* Match Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6 font-rajdhani">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-xs text-slate-400 block uppercase">{t.results.finalScore}</span>
                <span className="font-teko text-3xl font-black text-amber-300">{matchScore}</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-xs text-slate-400 block uppercase">{t.results.accuracy}</span>
                <span className="font-teko text-3xl font-black text-emerald-400">{matchAccuracy}%</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-xs text-slate-400 block uppercase">{t.results.correctAnswers}</span>
                <span className="font-teko text-3xl font-black text-white">{matchCorrect} / {totalRounds}</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-xs text-slate-400 block uppercase">{t.results.maxStreak}</span>
                <span className="font-teko text-3xl font-black text-orange-400">🔥 {matchMaxStreak}</span>
              </div>
            </div>

            {/* Coins Earned Banner */}
            <div className="p-3 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center gap-2 text-amber-300 font-bold mb-6">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>+{Math.max(100, Math.floor(matchScore / 4))} {t.results.coinsEarned}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2.5">
              <button
                onClick={restartMatch}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-rajdhani font-black text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{t.results.playAgain}</span>
              </button>

              {onOpenPackStore && (
                <button
                  onClick={() => {
                    setIsMatchOver(false);
                    onOpenPackStore();
                  }}
                  className="w-full py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-rajdhani font-bold text-sm flex items-center justify-center gap-2 transition"
                >
                  <span>{t.results.openPack}</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
