import React, { useState, useEffect } from 'react';
import { Challenge, Player } from '../types';
import { getDailyChallenges } from '../utils/challengeGenerator';
import { FootballCard } from './FootballCard';
import { useGame } from '../context/GameContext';
import { soundFX } from '../utils/audio';
import confetti from 'canvas-confetti';
import { Calendar, Flame, CheckCircle, ArrowRight, Award, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

export const DailyChallengeView: React.FC = () => {
  const { language, t, userStats, recordAnswer, completeDailyChallenge } = useGame();

  const todayStr = new Date().toISOString().split('T')[0];
  const alreadyCompleted = userStats.lastDailyDate === todayStr;

  const [dailyChallenges, setDailyChallenges] = useState<Challenge[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [dailyScore, setDailyScore] = useState(0);
  const [roundFeedback, setRoundFeedback] = useState<{
    isCorrect: boolean;
    points: number;
  } | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    const list = getDailyChallenges(todayStr);
    setDailyChallenges(list);
  }, [todayStr]);

  const currentChallenge = dailyChallenges[currentIdx];

  const handleCardClick = (player: Player) => {
    if (isAnswered || !currentChallenge || isFinished) return;

    const isCorrect = player.id === currentChallenge.correctPlayerId;
    setSelectedPlayerId(player.id);
    setIsAnswered(true);

    const { pointsEarned, bonus } = recordAnswer(isCorrect);
    const earned = isCorrect ? pointsEarned + bonus : -25;

    setDailyScore(prev => Math.max(0, prev + earned));
    setRoundFeedback({
      isCorrect,
      points: earned
    });
  };

  const handleNextRound = () => {
    if (currentIdx + 1 >= dailyChallenges.length) {
      setIsFinished(true);
      completeDailyChallenge(250); // Daily bonus coins!
      soundFX.playPackOpen();
      try {
        confetti({ particleCount: 120, spread: 80 });
      } catch {}
    } else {
      setCurrentIdx(prev => prev + 1);
      setSelectedPlayerId(null);
      setIsAnswered(false);
      setRoundFeedback(null);
    }
  };

  const formattedDate = new Date().toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4">
      {/* Daily Banner Bar */}
      <div className="bg-[#0b1424] border border-emerald-500/30 rounded-2xl p-4 mb-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-teko text-2xl sm:text-3xl font-black text-white uppercase leading-none">
                {t.daily.todayStatus}
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                {formattedDate}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {language === 'ar' ? 'أكمل تحدي اليوم لتعزيز سلسلتك والحصول على 250 كوينز إضافية!' : 'Complete today’s 5 rounds to boost your streak & earn 250 coins!'}
            </p>
          </div>
        </div>

        {/* Daily Streak Indicator */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 font-rajdhani font-bold">
          <Flame className="w-5 h-5 text-orange-400 fill-orange-400" />
          <div>
            <span className="text-[10px] text-orange-300 block uppercase leading-none">{language === 'ar' ? 'سلسلة الأيام' : 'Daily Streak'}</span>
            <span className="font-teko text-2xl font-black text-orange-400 leading-none">
              {userStats.dailyStreak} {language === 'ar' ? 'أيام متتالية' : 'Days'}
            </span>
          </div>
        </div>
      </div>

      {alreadyCompleted && !isFinished ? (
        /* Completed state */
        <div className="bg-gradient-to-b from-[#0b1915] to-[#06100c] border border-emerald-500/40 rounded-3xl p-8 text-center max-w-xl mx-auto shadow-2xl my-8">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 mx-auto flex items-center justify-center mb-4">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h3 className="font-teko text-3xl font-black text-white uppercase tracking-wider mb-2">
            {t.daily.completedToday}
          </h3>
          <p className="text-sm text-slate-300 mb-6 font-medium">
            {t.daily.comeBackTomorrow.replace('{days}', userStats.dailyStreak.toString())}
          </p>
          <button
            onClick={() => {
              setCurrentIdx(0);
              setSelectedPlayerId(null);
              setIsAnswered(false);
              setRoundFeedback(null);
              setIsFinished(false);
            }}
            className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-rajdhani font-bold text-sm border border-white/20 transition active:scale-95"
          >
            {language === 'ar' ? 'إعادة اللعب للتمرن' : 'Replay For Practice'}
          </button>
        </div>
      ) : isFinished ? (
        /* Completion celebration */
        <div className="bg-gradient-to-b from-[#111e19] to-[#07130f] border border-emerald-400/50 rounded-3xl p-8 text-center max-w-md mx-auto shadow-2xl my-8 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-emerald-400 text-slate-950 mx-auto flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/30 animate-bounce">
            <Award className="w-10 h-10" />
          </div>
          <h3 className="font-teko text-3xl font-black text-white uppercase tracking-wider mb-2">
            {language === 'ar' ? 'أحسنت! أتممت تحدي اليوم' : 'Daily Challenge Completed!'}
          </h3>
          <p className="text-sm text-slate-300 mb-4">
            {language === 'ar' ? `حققت ${dailyScore} نقطة وتمت إضافة +250 كوينز إلى رصيدك!` : `You earned ${dailyScore} points and +250 bonus coins were added to your account!`}
          </p>
          <div className="p-3 rounded-xl bg-amber-400/15 border border-amber-400/30 text-amber-300 font-bold mb-6 flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>+250 {t.results.coinsEarned}</span>
          </div>
        </div>
      ) : currentChallenge ? (
        /* Active daily round */
        <div>
          {/* Progress round header */}
          <div className="flex items-center justify-between mb-4 px-2">
            <span className="font-teko text-xl text-emerald-400 font-bold uppercase tracking-wider">
              {t.challenge.round} {currentIdx + 1} / {dailyChallenges.length}
            </span>
            <span className="font-rajdhani font-bold text-amber-300 text-sm">
              {t.challenge.score}: {dailyScore}
            </span>
          </div>

          {/* Question Banner */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0b1922] via-[#0d222e] to-[#0a171d] border border-emerald-400/40 p-4 sm:p-6 mb-6 shadow-2xl text-center">
            <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-400 mb-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'سؤال اليوم' : 'Daily Question'}</span>
            </div>

            <h2 className="font-rajdhani text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight max-w-3xl mx-auto">
              {language === 'ar' ? currentChallenge.questionAr : currentChallenge.questionEn}
            </h2>

            <p className="text-xs sm:text-sm text-slate-400 mt-2 font-medium">
              {t.challenge.selectPrompt}
            </p>
          </div>

          {/* Feedback Banner */}
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
                  <p className="text-xs text-slate-300 mt-0.5">
                    {language === 'ar' ? currentChallenge.explanationAr : currentChallenge.explanationEn}
                  </p>
                </div>
              </div>

              <button
                onClick={handleNextRound}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-rajdhani font-black text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition active:scale-95 shrink-0"
              >
                <span>{currentIdx + 1 >= dailyChallenges.length ? t.challenge.finishRound : t.challenge.nextRound}</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </button>
            </div>
          )}

          {/* 4 Cards Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 justify-items-center">
            {currentChallenge.cards.map(player => {
              let cardStatus: 'default' | 'selected' | 'correct' | 'wrong' | 'revealed' = 'default';

              if (isAnswered) {
                if (player.id === currentChallenge.correctPlayerId) {
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
        </div>
      ) : null}
    </div>
  );
};
