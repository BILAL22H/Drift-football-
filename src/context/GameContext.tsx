import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserStats, Player } from '../types';
import { PLAYERS_DATABASE, INITIAL_UNLOCKED_PLAYERS } from '../data/players';
import { FORMATIONS } from '../data/formations';
import { soundFX } from '../utils/audio';
import { Language, TRANSLATIONS } from '../utils/translations';

interface GameContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof TRANSLATIONS['en'];
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  userStats: UserStats;
  recordAnswer: (isCorrect: boolean) => { pointsEarned: number; bonus: number; newStreak: number };
  spendCoins: (amount: number) => boolean;
  addCoins: (amount: number) => void;
  unlockPlayers: (playerIds: string[]) => void;
  updateDreamTeamSlot: (slotId: string, playerId: string | null) => void;
  setFormation: (formation: '4-3-3' | '4-2-3-1' | '3-5-2') => void;
  autoFillDreamTeam: () => void;
  clearDreamTeam: () => void;
  completeDailyChallenge: (score: number) => void;
  resetProgress: () => void;
  getUnlockedPlayers: () => Player[];
  allPlayers: Player[];
  saveDraftSquad: (squad: import('../types').DraftSquad) => void;
  deleteDraftSquad: (id: string) => void;
}

const STORAGE_KEY = 'football_cards_challenge_v2';

const defaultStats: UserStats = {
  score: 0,
  highScore: 0,
  streak: 0,
  bestStreak: 0,
  totalAnswered: 0,
  totalCorrect: 0,
  coins: 500, // starting bonus to let them open a pack!
  dailyStreak: 0,
  lastDailyDate: null,
  unlockedPlayerIds: INITIAL_UNLOCKED_PLAYERS,
  dreamTeam: {},
  formation: '4-3-3',
  savedDrafts: []
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('fcc_lang');
    return (saved === 'ar' || saved === 'en') ? saved : 'en';
  });

  const [soundEnabled, setSoundEnabledState] = useState<boolean>(() => {
    const saved = localStorage.getItem('fcc_sound');
    return saved !== null ? saved === 'true' : true;
  });

  const [userStats, setUserStats] = useState<UserStats>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...defaultStats,
          ...parsed,
          unlockedPlayerIds: Array.from(new Set([...(parsed.unlockedPlayerIds || []), ...INITIAL_UNLOCKED_PLAYERS]))
        };
      }
    } catch (e) {
      console.error('Failed to load user state from localStorage', e);
    }
    return defaultStats;
  });

  // Keep soundFX class in sync
  useEffect(() => {
    soundFX.setEnabled(soundEnabled);
    localStorage.setItem('fcc_sound', soundEnabled.toString());
  }, [soundEnabled]);

  // Handle document direction for Arabic / English
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    localStorage.setItem('fcc_lang', language);
  }, [language]);

  // Persist userStats
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userStats));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }, [userStats]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const setSoundEnabled = (val: boolean) => {
    setSoundEnabledState(val);
  };

  const recordAnswer = (isCorrect: boolean) => {
    let pointsEarned = 0;
    let bonus = 0;
    let newStreak = 0;

    if (isCorrect) {
      pointsEarned = 100;
      newStreak = userStats.streak + 1;

      // Streak milestones
      if (newStreak === 3) {
        bonus = 50;
        soundFX.playStreakBonus();
      } else if (newStreak === 10) {
        bonus = 250;
        soundFX.playStreakBonus();
      } else if (newStreak > 10 && newStreak % 5 === 0) {
        bonus = 100;
        soundFX.playStreakBonus();
      } else {
        soundFX.playCorrect();
      }

      const coinsToAdd = 15 + Math.floor(bonus / 5);

      setUserStats(prev => {
        const newScore = prev.score + pointsEarned + bonus;
        return {
          ...prev,
          score: newScore,
          highScore: Math.max(prev.highScore, newScore),
          streak: newStreak,
          bestStreak: Math.max(prev.bestStreak, newStreak),
          totalAnswered: prev.totalAnswered + 1,
          totalCorrect: prev.totalCorrect + 1,
          coins: prev.coins + coinsToAdd
        };
      });
    } else {
      pointsEarned = -25;
      newStreak = 0;
      soundFX.playWrong();

      setUserStats(prev => ({
        ...prev,
        score: Math.max(0, prev.score - 25),
        streak: 0,
        totalAnswered: prev.totalAnswered + 1
      }));
    }

    return { pointsEarned, bonus, newStreak };
  };

  const spendCoins = (amount: number): boolean => {
    if (userStats.coins < amount) return false;
    setUserStats(prev => ({ ...prev, coins: prev.coins - amount }));
    return true;
  };

  const addCoins = (amount: number) => {
    setUserStats(prev => ({ ...prev, coins: prev.coins + amount }));
  };

  const unlockPlayers = (newIds: string[]) => {
    setUserStats(prev => ({
      ...prev,
      unlockedPlayerIds: Array.from(new Set([...prev.unlockedPlayerIds, ...newIds]))
    }));
  };

  const updateDreamTeamSlot = (slotId: string, playerId: string | null) => {
    setUserStats(prev => ({
      ...prev,
      dreamTeam: {
        ...prev.dreamTeam,
        [slotId]: playerId
      }
    }));
  };

  const setFormation = (formation: '4-3-3' | '4-2-3-1' | '3-5-2') => {
    setUserStats(prev => ({ ...prev, formation }));
  };

  const autoFillDreamTeam = () => {
    const slots = FORMATIONS[userStats.formation];
    const unlocked = getUnlockedPlayers().sort((a, b) => b.rating - a.rating);
    const assignedIds = new Set<string>();
    const newTeam: Record<string, string | null> = {};

    slots.forEach(slot => {
      // Find highest rated available player matching the allowed position
      const candidate = unlocked.find(
        p => p.position === slot.allowedPosition && !assignedIds.has(p.id)
      );

      if (candidate) {
        newTeam[slot.id] = candidate.id;
        assignedIds.add(candidate.id);
      } else {
        newTeam[slot.id] = null;
      }
    });

    setUserStats(prev => ({ ...prev, dreamTeam: newTeam }));
    soundFX.playStreakBonus();
  };

  const clearDreamTeam = () => {
    setUserStats(prev => ({ ...prev, dreamTeam: {} }));
  };

  const completeDailyChallenge = (bonusCoins: number) => {
    const today = new Date().toISOString().split('T')[0];
    setUserStats(prev => {
      const isConsecutive = prev.lastDailyDate
        ? new Date(today).getTime() - new Date(prev.lastDailyDate).getTime() <= 86400000 * 2
        : true;
      const newDailyStreak = isConsecutive ? prev.dailyStreak + 1 : 1;

      return {
        ...prev,
        dailyStreak: newDailyStreak,
        lastDailyDate: today,
        coins: prev.coins + bonusCoins
      };
    });
  };

  const resetProgress = () => {
    setUserStats(defaultStats);
    localStorage.removeItem(STORAGE_KEY);
  };

  const saveDraftSquad = (squad: import('../types').DraftSquad) => {
    setUserStats(prev => ({
      ...prev,
      savedDrafts: [squad, ...(prev.savedDrafts || []).filter(s => s.id !== squad.id)].slice(0, 20)
    }));
  };

  const deleteDraftSquad = (id: string) => {
    setUserStats(prev => ({
      ...prev,
      savedDrafts: (prev.savedDrafts || []).filter(s => s.id !== id)
    }));
  };

  const getUnlockedPlayers = (): Player[] => {
    return PLAYERS_DATABASE.filter(p => userStats.unlockedPlayerIds.includes(p.id));
  };

  const t = TRANSLATIONS[language];

  return (
    <GameContext.Provider
      value={{
        language,
        setLanguage,
        t,
        soundEnabled,
        setSoundEnabled,
        userStats,
        recordAnswer,
        spendCoins,
        addCoins,
        unlockPlayers,
        updateDreamTeamSlot,
        setFormation,
        autoFillDreamTeam,
        clearDreamTeam,
        completeDailyChallenge,
        resetProgress,
        getUnlockedPlayers,
        allPlayers: PLAYERS_DATABASE,
        saveDraftSquad,
        deleteDraftSquad
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
