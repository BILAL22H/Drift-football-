import React, { useState, useEffect } from 'react';
import { Challenge, Player } from '../types';
import { generateFourCardChallenge } from '../utils/challengeGenerator';
import { FootballCard } from './FootballCard';
import { useGame } from '../context/GameContext';
import { soundFX } from '../utils/audio';
import confetti from 'canvas-confetti';
import { Flame, Heart, RotateCcw, Trophy, ArrowRight, Zap, CheckCircle2, AlertCircle } from 'lucide-react';

export const EndlessMode: React.FC = () => {
  const { language, t, recordAnswer, userStats, addCoins } = useGame();

  const [lives, setLives] = useState(3);
  const maxLives = 3;
  const [roundNumber, setRoundNumber] = useState(1);
  const [sessionScore, setSessionScore] = useState(0);
  const [sessionStreak, setSessionStreak] = useState(0);
  const [sessionMaxStreak, setSessionMaxStreak] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [roundFeedback, setRoundFeedback] = useState<{
    isCorrect: boolean;
    points: number;
    bonus: number;
  } | null>(null);

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
    if (isAnswered || !challenge || isGameOver) return;

    const isCorrect = player.id === challenge.correctPlayerId;
    setSelectedPlayerId(player.id);
    setIsAnswered(true);

    const { pointsEarned, bonus, newStreak } = recordAnswer(isCorrect);

    if (isCorrect) {
      // Multiplier based on streak
      const multiplier = newStreak >= 10 ? 3 : newStreak >= 6 ? 2 : newStreak >= 3 ? 1.5 : 1;
      const totalPoints = Math.round(pointsEarned * multiplier) + bonus;

      setSessionScore(prev => prev + totalPoints);
      setSessionStreak(newStreak);
      setSessionMaxStreak(prev => Math.max(prev, newStreak));

      setRoundFeedback({
        isCorrect: true,
        points: totalPoints,
        bonus
      });
    } else {
      setSessionStreak(0);
      setRoundFeedback({
        isCorrect: false,
        points: -25,
        bonus: 0
      });

      const nextLives = lives - 1;
      setLives(nextLives);
      if (nextLives <= 0) {
        setIsGameOver(true);
        soundFX.playRefereeWhistle();
        if (sessionScore > userStats.highScore) {
          try {
            confetti({ particleCount: 120, spread: 80 });
          } catch {}
        }
      }
    }
  };

  const handleNextRound = () => {
    if (lives <= 0) {
      setIsGameOver(true);
      return;
    }
    setRoundNumber(prev => prev + 1);
    loadNewRound();
  };

  const restartEndless = () => {
    setLives(maxLives);
    setRoundNumber(1);
    setSessionScore(0);
    setSessionStreak(0);
    setSessionMaxStreak(0);
    setIsGameOver(false);
    loadNewRound();
  };

  if (!challenge) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4">
      {/* Top Endless Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0d1424] border border-orange-500/30 rounded-2xl p-3 sm:p-4 mb-4 backdrop-blur-md shadow-xl">
        
        {/* Lives Counter */}
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase font-bold text-slate-400 font-rajdhani">
            {language === 'ar' ? 'المحاولات' : 'Lives'}:
          </span>
          <div className="flex items-center gap-1">
            {Array.from({ length: maxLives }).map((_, i) => (
              <Heart
                key={i}
                className={`w-5 h-5 transition-transform ${
                  i < lives
                    ? 'text-rose-500 fill-rose-500 scale-110'
                    : 'text-slate-600 fill-slate-700/50 scale-90'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-3 sm:gap-6 font-rajdhani text-sm sm:text-base">
          <div>
            <span className="text-slate-400 block text-[11px] uppercase tracking-wider">
              {language === 'ar' ? 'الجولة' : 'Round'}
            </span>
            <span className="font-teko text-2xl sm:text-3xl font-black text-white leading-none">
              #{roundNumber}
            </span>
          </div>

          <div className="h-7 w-[1px] bg-white/10" />

          <div>
            <span className="text-slate-400 block text-[11px] uppercase tracking-wider">
              {t.challenge.score}
            </span>
            <span className="font-teko text-2xl sm:text-3xl font-black text-amber-300 leading-none">
              {sessionScore}
            </span>
          </div>

          <div className="h-7 w-[1px] bg-white/10" />

          <div>
            <span className="text-slate-400 block text-[11px] uppercase tracking-wider">
              {t.challenge.streak}
            </span>
            <span className="font-teko text-2xl sm:text-3xl font-bold text-orange-400 leading-none flex items-center gap-1">
              🔥 {sessionStreak}
            </span>
          </div>
        </div>

      </div>

      {/* Endless Challenge Question Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#17120a] via-[#241a0d] to-[#120f0a] border border-orange-500/40 p-4 sm:p-6 mb-6 shadow-2xl text-center">
        <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-orange-400 mb-1">
          <Flame className="w-4 h-4 fill-orange-400" />
          <span>{language === 'ar' ? 'تحدي البقاء اللانهائي' : 'Endless Survival Question'}</span>
          <Flame className="w-4 h-4 fill-orange-400" />
        </div>

        <h2 className="font-rajdhani text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight max-w-3xl mx-auto">
          {language === 'ar' ? challenge.questionAr : challenge.questionEn}
        </h2>

        <p className="text-xs sm:text-sm text-slate-400 mt-2 font-medium">
          {t.challenge.selectPrompt}
        </p>
      </div>

      {/* Answer Feedback Banner */}
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
              </div>
              <p className="text-xs text-slate-300 mt-0.5 font-sans">
                {language === 'ar' ? challenge.explanationAr : challenge.explanationEn}
              </p>
            </div>
          </div>

          {!isGameOver && (
            <button
              onClick={handleNextRound}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-rajdhani font-black text-base flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 transition active:scale-95 shrink-0"
            >
              <span>{t.challenge.nextRound}</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </button>
          )}
        </div>
      )}

      {/* 4 Football Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 justify-items-center">
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
                disabled={isAnswered || isGameOver}
                isArabic={language === 'ar'}
                onClick={() => handleCardClick(player)}
              />
            </div>
          );
        })}
      </div>

      {/* Game Over Modal */}
      {isGameOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-gradient-to-b from-[#1c1214] to-[#0d090a] border border-rose-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-center">
            
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-rose-500 to-red-400 flex items-center justify-center shadow-lg shadow-rose-500/30 mb-4 animate-bounce">
              <AlertCircle className="w-10 h-10 text-white" />
            </div>

            <h3 className="font-teko text-3xl sm:text-4xl font-black text-white uppercase tracking-wider mb-1">
              {language === 'ar' ? 'انتهت المحاولات!' : 'Game Over!'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mb-6 font-medium">
              {language === 'ar' ? `صمدت حتى الجولة ${roundNumber} وحققت ${sessionScore} نقطة` : `You survived ${roundNumber} rounds and scored ${sessionScore} points.`}
            </p>

            {/* Run Stats */}
            <div className="grid grid-cols-2 gap-3 mb-6 font-rajdhani">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-xs text-slate-400 block uppercase">{t.results.finalScore}</span>
                <span className="font-teko text-3xl font-black text-amber-300">{sessionScore}</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-xs text-slate-400 block uppercase">{t.results.maxStreak}</span>
                <span className="font-teko text-3xl font-black text-orange-400">🔥 {sessionMaxStreak}</span>
              </div>
            </div>

            <button
              onClick={restartEndless}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-rajdhani font-black text-base flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 active:scale-95 transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{t.results.playAgain}</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
