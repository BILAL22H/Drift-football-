import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { Player, DraftSlotDef, DraftSquad, MatchSimulationResult, DraftMultiplayerMode } from '../types';
import { DRAFT_STAGES, generateDraftFourCards, calculateSquadMetrics, simulateDraftMatch, encodeSquadCode, decodeSquadCode } from '../utils/draftEngine';
import { FORMATIONS } from '../data/formations';
import { MysteryDraftCard } from './MysteryDraftCard';
import { soundFX } from '../utils/audio';
import confetti from 'canvas-confetti';
import {
  Users,
  Bot,
  Globe,
  Swords,
  Shield,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Check,
  Award,
  Flame,
  Share2,
  Trash2,
  Bookmark,
  Layers,
  HelpCircle,
  Eye,
  CheckCircle2
} from 'lucide-react';

export const DraftBattleView: React.FC = () => {
  const { language, t, userStats, saveDraftSquad, deleteDraftSquad } = useGame();

  // Screen stages: 'setup' | 'pass-prompt' | 'drafting' | 'summary-battle' | 'match-sim' | 'saved-list'
  const [gameState, setGameState] = useState<'setup' | 'pass-prompt' | 'drafting' | 'summary-battle' | 'match-sim' | 'saved-list'>('setup');

  // Multiplayer settings
  const [battleMode, setBattleMode] = useState<DraftMultiplayerMode>('pass-and-play');
  const [player1Name, setPlayer1Name] = useState('Player 1');
  const [player2Name, setPlayer2Name] = useState('Player 2');

  // Draft progression
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [activeTurnPlayer, setActiveTurnPlayer] = useState<1 | 2>(1);
  const [team1Players, setTeam1Players] = useState<Record<string, Player>>({});
  const [team2Players, setTeam2Players] = useState<Record<string, Player>>({});

  // 4 Current Hidden Cards for the active position
  const [currentCards, setCurrentCards] = useState<[Player, Player, Player, Player] | null>(null);

  // The 2-Card Reveal Tracker for current position (indices 0..3)
  const [revealedCardIndices, setRevealedCardIndices] = useState<number[]>([]);

  // Match Simulation & Finished Squads
  const [finalSquad1, setFinalSquad1] = useState<DraftSquad | null>(null);
  const [finalSquad2, setFinalSquad2] = useState<DraftSquad | null>(null);
  const [simulationResult, setSimulationResult] = useState<MatchSimulationResult | null>(null);

  // Import code state
  const [importCodeInput, setImportCodeInput] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [squadSavedNotice, setSquadSavedNotice] = useState(false);

  const currentSlotDef: DraftSlotDef = DRAFT_STAGES[currentStageIdx] || DRAFT_STAGES[0];
  const formationSlots = FORMATIONS['4-3-3'];

  // Current active team's drafted players
  const currentActiveTeamPlayers = activeTurnPlayer === 1 ? team1Players : team2Players;
  const currentActivePlayerName = activeTurnPlayer === 1 ? player1Name : (battleMode === 'solo-vs-ai' ? t.draftBattle.aiName : player2Name);

  // Global tracker for all drafted player IDs in the current session to strictly prevent ANY player repetition
  const sessionDraftedIdsRef = useRef<Set<string>>(new Set());

  // Refresh 4 cards for a new slot strictly matching detailed position and excluding already drafted players
  const loadCardsForStage = (stageDef: DraftSlotDef, p1: Record<string, Player>, p2: Record<string, Player>) => {
    // Collect all drafted IDs from both teams plus the session ref
    const alreadyDrafted = Array.from(new Set([
      ...Object.values(p1).map(p => p.id),
      ...Object.values(p2).map(p => p.id),
      ...Array.from(sessionDraftedIdsRef.current)
    ]));

    const fourCards = generateDraftFourCards(stageDef, alreadyDrafted);
    setCurrentCards(fourCards);
    setRevealedCardIndices([]); // Reset reveals for new stage
  };

  // Start new draft
  const handleStartDraft = () => {
    setCurrentStageIdx(0);
    setActiveTurnPlayer(1);
    setTeam1Players({});
    setTeam2Players({});
    setSimulationResult(null);
    sessionDraftedIdsRef.current.clear();

    loadCardsForStage(DRAFT_STAGES[0], {}, {});
    setGameState('drafting');
    soundFX.playRefereeWhistle();
  };

  // Flip a mystery card (rule: max 2 cards revealed per position!)
  const handleFlipCard = (index: number) => {
    if (revealedCardIndices.includes(index)) return;
    if (revealedCardIndices.length >= 2) return;

    const nextRevealed = [...revealedCardIndices, index];
    setRevealedCardIndices(nextRevealed);
    soundFX.playCardSelect();
  };

  // Player chooses 1 of the revealed players
  const handleSelectRevealedPlayer = (player: Player) => {
    soundFX.playStreakBonus();
    sessionDraftedIdsRef.current.add(player.id);

    if (battleMode === 'pass-and-play') {
      if (activeTurnPlayer === 1) {
        // Player 1 picked
        const newTeam1 = { ...team1Players, [currentSlotDef.slotId]: player };
        setTeam1Players(newTeam1);

        // Turn moves to Player 2 for the same position
        setActiveTurnPlayer(2);
        loadCardsForStage(currentSlotDef, newTeam1, team2Players);
        setGameState('pass-prompt');
      } else {
        // Player 2 picked
        const newTeam2 = { ...team2Players, [currentSlotDef.slotId]: player };
        setTeam2Players(newTeam2);

        // Check if finished 11 positions
        if (currentStageIdx + 1 >= DRAFT_STAGES.length) {
          finishDraft(team1Players, newTeam2);
        } else {
          const nextStage = currentStageIdx + 1;
          setCurrentStageIdx(nextStage);
          setActiveTurnPlayer(1);
          loadCardsForStage(DRAFT_STAGES[nextStage], team1Players, newTeam2);
          setGameState('pass-prompt');
        }
      }
    } else {
      // Solo vs AI
      const newTeam1 = { ...team1Players, [currentSlotDef.slotId]: player };
      setTeam1Players(newTeam1);

      // AI reveals 2 cards and picks the best one without repeating any drafted player
      const alreadyDraftedForAI = Array.from(new Set([
        ...Object.values(newTeam1).map(p => p.id),
        ...Object.values(team2Players).map(p => p.id),
        ...Array.from(sessionDraftedIdsRef.current)
      ]));

      const aiCards = generateDraftFourCards(currentSlotDef, alreadyDraftedForAI);
      const aiPicked = aiCards.sort((a, b) => b.rating - a.rating)[0];
      sessionDraftedIdsRef.current.add(aiPicked.id);

      const newTeam2 = { ...team2Players, [currentSlotDef.slotId]: aiPicked };
      setTeam2Players(newTeam2);

      if (currentStageIdx + 1 >= DRAFT_STAGES.length) {
        finishDraft(newTeam1, newTeam2);
      } else {
        const nextStage = currentStageIdx + 1;
        setCurrentStageIdx(nextStage);
        loadCardsForStage(DRAFT_STAGES[nextStage], newTeam1, newTeam2);
      }
    }
  };

  // Build final squad objects and transition to Battle summary
  const finishDraft = (t1: Record<string, Player>, t2: Record<string, Player>) => {
    const metrics1 = calculateSquadMetrics(t1);
    const metrics2 = calculateSquadMetrics(t2);

    const s1: DraftSquad = {
      id: `draft-${Date.now()}-1`,
      playerName: player1Name.trim() || t.draftBattle.player1Name,
      formation: '4-3-3',
      players: t1,
      ...metrics1,
      createdAt: new Date().toISOString()
    };

    const s2: DraftSquad = {
      id: `draft-${Date.now()}-2`,
      playerName: battleMode === 'solo-vs-ai' ? t.draftBattle.aiName : (player2Name.trim() || t.draftBattle.player2Name),
      formation: '4-3-3',
      players: t2,
      ...metrics2,
      createdAt: new Date().toISOString()
    };

    setFinalSquad1(s1);
    setFinalSquad2(s2);
    setGameState('summary-battle');
    soundFX.playPackOpen();

    try {
      confetti({ particleCount: 150, spread: 85 });
    } catch {}
  };

  // Simulate match
  const handleSimulateMatch = () => {
    if (!finalSquad1 || !finalSquad2) return;
    setGameState('match-sim');
    soundFX.playRefereeWhistle();

    setTimeout(() => {
      const result = simulateDraftMatch(finalSquad1, finalSquad2);
      setSimulationResult(result);
      if (result.winnerTeam > 0) {
        soundFX.playStreakBonus();
        try {
          confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
        } catch {}
      }
    }, 1000);
  };

  const handleSaveSquad = (squad: DraftSquad) => {
    saveDraftSquad(squad);
    setSquadSavedNotice(true);
    setTimeout(() => setSquadSavedNotice(false), 2500);
    soundFX.playStreakBonus();
  };

  const handleCopyCode = (squad: DraftSquad) => {
    const code = encodeSquadCode(squad);
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleImportSquad = () => {
    if (!importCodeInput.trim()) return;
    const imported = decodeSquadCode(importCodeInput);
    if (imported) {
      setImportError(null);
      if (finalSquad1) {
        setFinalSquad2(imported);
        setGameState('summary-battle');
      } else {
        setFinalSquad2(imported);
        setPlayer2Name(imported.playerName);
        setBattleMode('solo-vs-ai');
        handleStartDraft();
      }
    } else {
      setImportError(t.draftBattle.invalidCode);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-6 py-4">
      {/* 1. SETUP SCREEN */}
      {gameState === 'setup' && (
        <div className="space-y-6 animate-fade-in">
          {/* Header Hero */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0b1424] via-[#102038] to-[#07101e] border-2 border-emerald-500/40 p-6 sm:p-10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold font-rajdhani uppercase tracking-widest mb-3 border border-emerald-500/30">
                <Swords className="w-4 h-4" />
                <span>{language === 'ar' ? 'لعبة درفت كرة القدم الرسمية' : 'Official Football Draft Game'}</span>
              </div>
              <h1 className="font-teko text-4xl sm:text-6xl font-black text-white leading-none uppercase mb-2">
                Football Draft
              </h1>
              <p className="text-sm text-slate-300 font-medium leading-relaxed">
                {language === 'ar'
                  ? 'ابنِ أفضل تشكيلة من 11 لاعب مع أصدقائك: تشكيلة خاوية على الملعب، 4 بطاقات مقلوبة ومرقمة تحتها، اكشف بطاقتين فقط في كل مركز واختر نجمك المفضل!'
                  : 'Build the ultimate 11-man squad: Empty tactical pitch on top, 4 face-down numbered cards below. Reveal only 2 cards per position and pick your star!'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setGameState('saved-list')}
                className="px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white font-rajdhani font-bold text-xs sm:text-sm flex items-center gap-2 transition"
              >
                <Bookmark className="w-4 h-4 text-amber-400" />
                <span>{t.draftBattle.savedSquadsTitle} ({userStats.savedDrafts?.length || 0})</span>
              </button>
            </div>
          </div>

          {/* Mode Selection Cards */}
          <div>
            <h3 className="font-teko text-2xl text-white uppercase tracking-wider mb-3">
              {t.draftBattle.selectMode}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Option 1: Pass & Play on same phone */}
              <div
                onClick={() => setBattleMode('pass-and-play')}
                className={`cursor-pointer rounded-3xl p-5 border-2 transition-all flex flex-col justify-between ${
                  battleMode === 'pass-and-play'
                    ? 'bg-gradient-to-b from-[#091a18] to-[#040d0c] border-emerald-400 shadow-xl shadow-emerald-500/10'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                    <Users className="w-6 h-6" />
                  </div>
                  <h4 className="font-teko text-2xl font-black text-white uppercase">
                    {t.draftBattle.passAndPlay}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    {t.draftBattle.passAndPlayDesc}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-bold font-rajdhani text-emerald-400">
                  <span>{language === 'ar' ? 'التناوب على الهاتف' : 'Turn-by-turn'}</span>
                  <span>11 Rounds</span>
                </div>
              </div>

              {/* Option 2: Solo vs AI */}
              <div
                onClick={() => setBattleMode('solo-vs-ai')}
                className={`cursor-pointer rounded-3xl p-5 border-2 transition-all flex flex-col justify-between ${
                  battleMode === 'solo-vs-ai'
                    ? 'bg-gradient-to-b from-[#1a150c] to-[#0d0905] border-amber-400 shadow-xl shadow-amber-500/10'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-400/20 text-amber-400 flex items-center justify-center mb-4">
                    <Bot className="w-6 h-6" />
                  </div>
                  <h4 className="font-teko text-2xl font-black text-white uppercase">
                    {t.draftBattle.soloVsAi}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    {t.draftBattle.soloVsAiDesc}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-bold font-rajdhani text-amber-400">
                  <span>{language === 'ar' ? 'تحدي الكمبيوتر' : 'AI Coach'}</span>
                  <span>Fast Pace</span>
                </div>
              </div>

              {/* Option 3: Online Room / Share Code */}
              <div
                onClick={() => setBattleMode('online-room')}
                className={`cursor-pointer rounded-3xl p-5 border-2 transition-all flex flex-col justify-between ${
                  battleMode === 'online-room'
                    ? 'bg-gradient-to-b from-[#091a29] to-[#040e17] border-cyan-400 shadow-xl shadow-cyan-500/10'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-cyan-400/20 text-cyan-400 flex items-center justify-center mb-4">
                    <Globe className="w-6 h-6" />
                  </div>
                  <h4 className="font-teko text-2xl font-black text-white uppercase">
                    {t.draftBattle.onlineRoom}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    {t.draftBattle.onlineRoomDesc}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-bold font-rajdhani text-cyan-400">
                  <span>{language === 'ar' ? 'كود التحدي' : 'Share Code'}</span>
                  <span>Anywhere</span>
                </div>
              </div>
            </div>
          </div>

          {/* Names Input Section */}
          <div className="bg-[#0b1322] border border-white/10 rounded-3xl p-6 shadow-xl">
            <h4 className="font-teko text-xl text-white uppercase tracking-wider mb-4">
              {language === 'ar' ? 'أسماء المتنافسين' : 'Competitor Names'}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1.5 font-bold font-rajdhani">
                  {language === 'ar' ? 'اسم اللاعب الأول' : 'Player 1 Name'}:
                </label>
                <input
                  type="text"
                  value={player1Name}
                  onChange={(e) => setPlayer1Name(e.target.value)}
                  placeholder="e.g. Amine"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm focus:outline-none focus:border-emerald-400"
                />
              </div>

              {battleMode === 'pass-and-play' && (
                <div>
                  <label className="text-xs text-slate-400 block mb-1.5 font-bold font-rajdhani">
                    {language === 'ar' ? 'اسم اللاعب الثاني (صديقك)' : 'Player 2 Name (Friend)'}:
                  </label>
                  <input
                    type="text"
                    value={player2Name}
                    onChange={(e) => setPlayer2Name(e.target.value)}
                    placeholder="e.g. Bilal"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm focus:outline-none focus:border-emerald-400"
                  />
                </div>
              )}
            </div>

            {/* Import Squad Section if Online Room */}
            {battleMode === 'online-room' && (
              <div className="mt-6 pt-5 border-t border-white/10">
                <label className="text-xs text-slate-400 block mb-1.5 font-bold font-rajdhani">
                  {t.draftBattle.importSquad}:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={importCodeInput}
                    onChange={(e) => setImportCodeInput(e.target.value)}
                    placeholder={t.draftBattle.enterCode}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs sm:text-sm font-mono focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    onClick={handleImportSquad}
                    className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-rajdhani font-black text-sm uppercase transition active:scale-95"
                  >
                    {t.draftBattle.importBtn}
                  </button>
                </div>
                {importError && (
                  <p className="text-xs text-rose-400 mt-2 font-bold">{importError}</p>
                )}
              </div>
            )}

            {/* Start Button */}
            <button
              onClick={handleStartDraft}
              className="mt-6 w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-rajdhani font-black text-xl uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 active:scale-95 transition"
            >
              <Swords className="w-5 h-5" />
              <span>{language === 'ar' ? 'بدء درفت التشكيلة (11 مركز)' : 'Start 11-Position Football Draft'}</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. PASS TO FRIEND SUSPENSE SCREEN */}
      {gameState === 'pass-prompt' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fade-in text-center">
          <div className="relative w-full max-w-md bg-gradient-to-b from-[#111c30] to-[#070d18] border-2 border-emerald-400/50 rounded-3xl p-8 shadow-2xl">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400/50 text-emerald-400 mx-auto flex items-center justify-center text-3xl mb-4 animate-bounce">
              👥
            </div>

            <span className="text-xs uppercase font-bold tracking-widest text-emerald-400 font-rajdhani">
              {currentSlotDef.labelAr} ({currentSlotDef.detailedPosition})
            </span>

            <h3 className="font-teko text-3xl sm:text-4xl font-black text-white uppercase my-2">
              {t.draftBattle.passDevicePrompt.replace('{player}', activeTurnPlayer === 1 ? player1Name : player2Name)}
            </h3>

            <p className="text-xs sm:text-sm text-slate-400 mb-6 font-medium">
              {language === 'ar'
                ? `حان دورك لاختيار لاعب لمركز ${currentSlotDef.labelAr}! اختر بطاقتين فقط من أصل 4 لكشفهما.`
                : `It’s your turn to draft a ${currentSlotDef.label}. Reveal 2 mystery cards and pick your star!`}
            </p>

            <button
              onClick={() => setGameState('drafting')}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-rajdhani font-black text-lg uppercase shadow-xl shadow-emerald-500/25 active:scale-95 transition"
            >
              {t.draftBattle.readyButton}
            </button>
          </div>
        </div>
      )}

      {/* 3. DRAFTING STAGE SCREEN: PITCH ON TOP + 4 NUMBERED MYSTERY CARDS BELOW */}
      {gameState === 'drafting' && currentSlotDef && (
        <div className="space-y-4 animate-fade-in">
          
          {/* Top Status & Turn Bar */}
          <div className="bg-[#0b1424] border border-white/10 rounded-2xl p-3.5 shadow-xl flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="px-3.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 font-teko text-2xl font-bold tracking-wide uppercase border border-emerald-500/30">
                {language === 'ar' ? `المركز ${currentStageIdx + 1} من 11: ${currentSlotDef.labelAr}` : `Slot ${currentStageIdx + 1} of 11: ${currentSlotDef.label}`}
              </span>

              <div className={`px-3 py-1 rounded-xl font-rajdhani font-black text-xs sm:text-sm uppercase flex items-center gap-1.5 ${
                activeTurnPlayer === 1
                  ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                  : 'bg-cyan-400/20 text-cyan-300 border border-cyan-400/40'
              }`}>
                <Flame className="w-4 h-4 fill-current" />
                <span>
                  {language === 'ar' ? `دور: ${currentActivePlayerName}` : `${currentActivePlayerName}'s Turn`}
                </span>
              </div>
            </div>

            {/* Reveal Count Badge */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-white/5 border border-white/10 font-rajdhani">
              <Eye className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-slate-300">
                {language === 'ar' ? 'البطاقات المكشوفة:' : 'Revealed:'}{' '}
                <strong className="text-amber-400 text-sm">{revealedCardIndices.length} / 2</strong>
              </span>
            </div>
          </div>

          {/* ======================================================== */}
          {/* THE GREEN TACTICAL FOOTBALL PITCH (COMPACT & DIRECT)     */}
          {/* ======================================================== */}
          <div className="relative w-full max-w-4xl mx-auto rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-emerald-500/40 shadow-2xl pitch-pattern min-h-[285px] xs:min-h-[310px] sm:min-h-[370px] p-2 sm:p-3 flex flex-col justify-between">
            
            {/* Pitch Markings Overlay */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Halfway line */}
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/15 -translate-y-1/2" />
              {/* Center circle */}
              <div className="absolute top-1/2 left-1/2 w-20 h-20 sm:w-32 sm:h-32 rounded-full border border-white/15 -translate-x-1/2 -translate-y-1/2" />
              {/* Top Penalty Area */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 sm:w-48 h-12 sm:h-16 border-b border-x border-white/15 rounded-b-xl" />
              {/* Bottom Penalty Area */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 sm:w-48 h-12 sm:h-16 border-t border-x border-white/15 rounded-t-xl" />
            </div>

            {/* 11 Position Slots Laid Out on the Pitch */}
            <div className="relative w-full h-full min-h-[265px] xs:min-h-[290px] sm:min-h-[350px]">
              {formationSlots.map(slot => {
                const draftedPlayer = currentActiveTeamPlayers[slot.id];
                const isCurrentActiveSlot = slot.id === currentSlotDef.slotId;

                return (
                  <div
                    key={slot.id}
                    style={{
                      left: `${slot.x}%`,
                      top: `${slot.y}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                    className={`absolute z-20 flex flex-col items-center transition-all duration-300 ${
                      isCurrentActiveSlot ? 'scale-110 z-30' : ''
                    }`}
                  >
                    {draftedPlayer ? (
                      /* Filled Slot with Drafted Player Card Miniature */
                      <div className="relative flex flex-col items-center animate-scale-in">
                        <div className="w-9 h-13 xs:w-11 xs:h-15 sm:w-14 sm:h-18 rounded-lg sm:rounded-xl bg-gradient-to-b from-[#1f293d] to-[#0d131f] border border-amber-400 p-0.5 sm:p-1 flex flex-col justify-between items-center shadow-lg">
                          <div className="w-full flex items-center justify-between text-[8px] sm:text-[9px] leading-none px-0.5">
                            <span className="font-teko text-xs sm:text-sm font-black text-amber-300">{draftedPlayer.rating}</span>
                            <span className="text-[8px] sm:text-[9px]">{draftedPlayer.flag}</span>
                          </div>

                          <img
                            src={draftedPlayer.photo}
                            alt={draftedPlayer.shortName}
                            className="w-5 h-5 xs:w-6 xs:h-6 sm:w-8 sm:h-8 object-cover rounded-full border border-amber-300/40"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />

                          <div className="w-full text-center bg-black/60 rounded py-0.2 leading-none">
                            <span className="text-[7px] xs:text-[8px] sm:text-[9px] font-bold text-white block truncate px-0.5">
                              {language === 'ar' ? draftedPlayer.nameAr : draftedPlayer.shortName}
                            </span>
                          </div>
                        </div>

                        <span className="text-[8px] sm:text-[9px] font-bold font-rajdhani text-emerald-300 bg-black/80 px-1 rounded mt-0.5 border border-emerald-500/30">
                          {slot.label}
                        </span>
                      </div>
                    ) : (
                      /* Empty Slot */
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-8 h-11 xs:w-9 xs:h-13 sm:w-12 sm:h-16 rounded-lg sm:rounded-xl border flex flex-col items-center justify-center transition-all ${
                            isCurrentActiveSlot
                              ? 'border-amber-400 bg-amber-400/25 shadow-[0_0_15px_rgba(251,191,36,0.7)] animate-pulse scale-110'
                              : 'border-dashed border-white/20 bg-black/40 text-slate-400'
                          }`}
                        >
                          <span className={`font-rajdhani text-[10px] xs:text-xs sm:text-sm font-black uppercase ${
                            isCurrentActiveSlot ? 'text-amber-300' : 'text-slate-400'
                          }`}>
                            {slot.label}
                          </span>
                        </div>
                        <span className={`text-[7px] sm:text-[8px] font-medium px-1 rounded mt-0.5 ${
                          isCurrentActiveSlot ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-black/50 text-slate-400'
                        }`}>
                          {slot.allowedPosition}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>

          {/* ======================================================== */}
          {/* THE 4 COMPACT CARDS DIRECTLY UNDER THE PITCH (SINGLE ROW) */}
          {/* ======================================================== */}
          <div className="mt-2.5 sm:mt-3">
            
            {/* Dynamic Instruction Banner */}
            <div className="text-center py-1.5 px-3 rounded-xl bg-[#091120] border border-white/10 max-w-xl mx-auto mb-2.5">
              <p className="font-rajdhani text-xs sm:text-sm font-bold text-white flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>
                  {revealedCardIndices.length === 0 && (language === 'ar' ? `المطلوب: ${currentSlotDef.labelAr}. اكشف بطاقتين من أصل 4 بالضغط على الرقم` : `Drafting: ${currentSlotDef.label}. Tap 2 cards to reveal`)}
                  {revealedCardIndices.length === 1 && (language === 'ar' ? `كشفت 1/2! اضغط على اللاعب لاختياره فوراً، أو اكشف بطاقة ثانية` : `Revealed 1/2! Tap card to pick immediately, or flip a 2nd card`)}
                  {revealedCardIndices.length === 2 && (language === 'ar' ? `كشفت بطاقتين! اضغط على اللاعب لاختياره وضمه للملعب فوراً` : `2 cards revealed! Tap any player to add directly to squad`)}
                </span>
              </p>
            </div>

            {/* 4 Compact Cards Row directly below pitch */}
            {currentCards && (
              <div className="grid grid-cols-4 gap-1.5 xs:gap-2 sm:gap-4 max-w-3xl mx-auto justify-items-center px-1">
                {currentCards.map((player, idx) => {
                  const isFlipped = revealedCardIndices.includes(idx);
                  const canFlip = !isFlipped && revealedCardIndices.length < 2;

                  return (
                    <div key={idx} className="w-full flex justify-center">
                      <MysteryDraftCard
                        cardIndex={idx}
                        player={player}
                        isFlipped={isFlipped}
                        canFlip={canFlip}
                        onFlip={() => handleFlipCard(idx)}
                        onSelectPlayer={() => handleSelectRevealedPlayer(player)}
                        isArabic={language === 'ar'}
                      />
                    </div>
                  );
                })}
              </div>
            )}

          </div>

        </div>
      )}

      {/* 4. SQUAD COMPARISON & BATTLE SUMMARY SCREEN */}
      {gameState === 'summary-battle' && finalSquad1 && finalSquad2 && (
        <div className="space-y-6 animate-fade-in">
          {/* Header Title */}
          <div className="bg-[#0b1424] border border-amber-400/40 rounded-3xl p-6 text-center shadow-2xl">
            <h2 className="font-teko text-3xl sm:text-5xl font-black text-white uppercase tracking-wider flex items-center justify-center gap-3">
              <Swords className="w-8 h-8 text-amber-400" />
              <span>{t.draftBattle.battleTitle}</span>
              <Swords className="w-8 h-8 text-amber-400" />
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 font-medium">
              {language === 'ar' ? 'اكتملت تشكيلتا الفريقين! قارن بين القوة الإجمالية ومختلف الخطوط، وانطلق للمباراة!' : 'Both 11-player squads are completed! Compare ratings and launch the pitch simulation.'}
            </p>
          </div>

          {/* Head-to-Head Comparison Bars Card */}
          <div className="bg-[#080e18] border border-white/10 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between font-teko text-2xl sm:text-3xl font-black mb-4 px-2">
              <span className="text-amber-400">{finalSquad1.playerName}</span>
              <span className="text-slate-500 text-lg">VS</span>
              <span className="text-cyan-400">{finalSquad2.playerName}</span>
            </div>

            <div className="space-y-4 font-rajdhani">
              {/* Total OVR */}
              <div>
                <div className="flex justify-between text-xs sm:text-sm font-bold text-slate-300 mb-1">
                  <span className="text-amber-300 font-teko text-xl">{finalSquad1.totalRating}</span>
                  <span className="uppercase text-slate-400">{t.draftBattle.totalRating}</span>
                  <span className="text-cyan-300 font-teko text-xl">{finalSquad2.totalRating}</span>
                </div>
                <div className="h-3 rounded-full bg-white/10 flex overflow-hidden">
                  <div
                    className="h-full bg-amber-400 transition-all duration-700"
                    style={{ width: `${(finalSquad1.totalRating / (finalSquad1.totalRating + finalSquad2.totalRating)) * 100}%` }}
                  />
                  <div
                    className="h-full bg-cyan-400 transition-all duration-700"
                    style={{ width: `${(finalSquad2.totalRating / (finalSquad1.totalRating + finalSquad2.totalRating)) * 100}%` }}
                  />
                </div>
              </div>

              {/* Attack Comparison */}
              <div>
                <div className="flex justify-between text-xs sm:text-sm font-bold text-slate-300 mb-1">
                  <span className="text-amber-300 font-teko text-xl">{finalSquad1.attackRating}</span>
                  <span className="uppercase text-slate-400">{t.draftBattle.attack} (FWD)</span>
                  <span className="text-cyan-300 font-teko text-xl">{finalSquad2.attackRating}</span>
                </div>
                <div className="h-2 rounded-full bg-white/10 flex overflow-hidden">
                  <div
                    className="h-full bg-amber-400 transition-all duration-700"
                    style={{ width: `${(finalSquad1.attackRating / (finalSquad1.attackRating + finalSquad2.attackRating)) * 100}%` }}
                  />
                  <div
                    className="h-full bg-cyan-400 transition-all duration-700"
                    style={{ width: `${(finalSquad2.attackRating / (finalSquad1.attackRating + finalSquad2.attackRating)) * 100}%` }}
                  />
                </div>
              </div>

              {/* Midfield Comparison */}
              <div>
                <div className="flex justify-between text-xs sm:text-sm font-bold text-slate-300 mb-1">
                  <span className="text-amber-300 font-teko text-xl">{finalSquad1.midfieldRating}</span>
                  <span className="uppercase text-slate-400">{t.draftBattle.midfield} (MID)</span>
                  <span className="text-cyan-300 font-teko text-xl">{finalSquad2.midfieldRating}</span>
                </div>
                <div className="h-2 rounded-full bg-white/10 flex overflow-hidden">
                  <div
                    className="h-full bg-amber-400 transition-all duration-700"
                    style={{ width: `${(finalSquad1.midfieldRating / (finalSquad1.midfieldRating + finalSquad2.midfieldRating)) * 100}%` }}
                  />
                  <div
                    className="h-full bg-cyan-400 transition-all duration-700"
                    style={{ width: `${(finalSquad2.midfieldRating / (finalSquad1.midfieldRating + finalSquad2.midfieldRating)) * 100}%` }}
                  />
                </div>
              </div>

              {/* Defense Comparison */}
              <div>
                <div className="flex justify-between text-xs sm:text-sm font-bold text-slate-300 mb-1">
                  <span className="text-amber-300 font-teko text-xl">{finalSquad1.defenseRating}</span>
                  <span className="uppercase text-slate-400">{t.draftBattle.defense} (DEF)</span>
                  <span className="text-cyan-300 font-teko text-xl">{finalSquad2.defenseRating}</span>
                </div>
                <div className="h-2 rounded-full bg-white/10 flex overflow-hidden">
                  <div
                    className="h-full bg-amber-400 transition-all duration-700"
                    style={{ width: `${(finalSquad1.defenseRating / (finalSquad1.defenseRating + finalSquad2.defenseRating)) * 100}%` }}
                  />
                  <div
                    className="h-full bg-cyan-400 transition-all duration-700"
                    style={{ width: `${(finalSquad2.defenseRating / (finalSquad1.defenseRating + finalSquad2.defenseRating)) * 100}%` }}
                  />
                </div>
              </div>

              {/* Chemistry Comparison */}
              <div>
                <div className="flex justify-between text-xs sm:text-sm font-bold text-slate-300 mb-1">
                  <span className="text-amber-300 font-teko text-xl">{finalSquad1.chemistry} / 33</span>
                  <span className="uppercase text-slate-400">{t.draftBattle.chemistry}</span>
                  <span className="text-cyan-300 font-teko text-xl">{finalSquad2.chemistry} / 33</span>
                </div>
                <div className="h-2 rounded-full bg-white/10 flex overflow-hidden">
                  <div
                    className="h-full bg-amber-400 transition-all duration-700"
                    style={{ width: `${(finalSquad1.chemistry / (finalSquad1.chemistry + finalSquad2.chemistry || 1)) * 100}%` }}
                  />
                  <div
                    className="h-full bg-cyan-400 transition-all duration-700"
                    style={{ width: `${(finalSquad2.chemistry / (finalSquad1.chemistry + finalSquad2.chemistry || 1)) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={handleSimulateMatch}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-rajdhani font-black text-lg uppercase flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 active:scale-95 transition"
              >
                <span>⚽ {t.draftBattle.simulateMatch}</span>
              </button>

              <button
                onClick={() => handleSaveSquad(finalSquad1)}
                className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-rajdhani font-bold text-sm flex items-center justify-center gap-2 transition active:scale-95"
              >
                <Bookmark className="w-4 h-4 text-amber-400" />
                <span>{squadSavedNotice ? t.draftBattle.squadSaved : t.draftBattle.saveSquad}</span>
              </button>

              <button
                onClick={() => handleCopyCode(finalSquad1)}
                className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-rajdhani font-bold text-sm flex items-center justify-center gap-2 transition active:scale-95"
              >
                <Share2 className="w-4 h-4 text-cyan-400" />
                <span>{copiedCode ? t.draftBattle.codeCopied : t.draftBattle.shareSquadCode}</span>
              </button>
            </div>
          </div>

          {/* 11 Players Grid for Both Squads */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Squad 1 Roster */}
            <div className="bg-[#0a1120] border border-amber-400/30 rounded-3xl p-5 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                <h3 className="font-teko text-2xl font-black text-amber-400 uppercase">
                  {finalSquad1.playerName}’s Starting XI
                </h3>
                <span className="font-rajdhani font-bold text-xs px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300">
                  {finalSquad1.totalRating} OVR
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {DRAFT_STAGES.map(s => {
                  const p = finalSquad1.players[s.slotId];
                  return p ? (
                    <div key={s.slotId} className="p-2 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2">
                      <span className="text-base">{p.flag}</span>
                      <div className="truncate">
                        <span className="text-[10px] text-amber-400 font-bold block">{s.detailedPosition}</span>
                        <span className="text-xs font-bold text-white truncate block">{p.shortName}</span>
                      </div>
                    </div>
                  ) : null;
                })}
              </div>
            </div>

            {/* Squad 2 Roster */}
            <div className="bg-[#0a1120] border border-cyan-400/30 rounded-3xl p-5 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                <h3 className="font-teko text-2xl font-black text-cyan-400 uppercase">
                  {finalSquad2.playerName}’s Starting XI
                </h3>
                <span className="font-rajdhani font-bold text-xs px-2.5 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300">
                  {finalSquad2.totalRating} OVR
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {DRAFT_STAGES.map(s => {
                  const p = finalSquad2.players[s.slotId];
                  return p ? (
                    <div key={s.slotId} className="p-2 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2">
                      <span className="text-base">{p.flag}</span>
                      <div className="truncate">
                        <span className="text-[10px] text-cyan-400 font-bold block">{s.detailedPosition}</span>
                        <span className="text-xs font-bold text-white truncate block">{p.shortName}</span>
                      </div>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. MATCH SIMULATION SCREEN */}
      {gameState === 'match-sim' && finalSquad1 && finalSquad2 && (
        <div className="space-y-6 animate-fade-in">
          {/* Live Scoreboard */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0a1322] via-[#0f2136] to-[#070e1a] border-2 border-emerald-400/50 p-6 sm:p-10 text-center shadow-2xl">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 font-rajdhani mb-2 block">
              {simulationResult ? 'FULL TIME' : t.draftBattle.simulating}
            </span>

            <div className="flex items-center justify-center gap-6 sm:gap-12 my-4">
              <div className="text-center">
                <h3 className="font-teko text-3xl sm:text-4xl font-black text-amber-300 uppercase">
                  {finalSquad1.playerName}
                </h3>
                <span className="text-xs text-slate-400 font-mono">Rating: {finalSquad1.totalRating}</span>
              </div>

              <div className="px-6 py-2 rounded-2xl bg-black/60 border border-white/20 font-teko text-5xl sm:text-7xl font-black text-white tracking-widest shadow-inner">
                {simulationResult ? `${simulationResult.team1Score} - ${simulationResult.team2Score}` : '0 - 0'}
              </div>

              <div className="text-center">
                <h3 className="font-teko text-3xl sm:text-4xl font-black text-cyan-300 uppercase">
                  {finalSquad2.playerName}
                </h3>
                <span className="text-xs text-slate-400 font-mono">Rating: {finalSquad2.totalRating}</span>
              </div>
            </div>

            {/* Winner Banner if simulated */}
            {simulationResult && (
              <div className="mt-4 inline-flex items-center gap-2 px-6 py-2 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-rajdhani font-black text-lg animate-bounce">
                <Award className="w-5 h-5 text-amber-400" />
                <span>
                  {simulationResult.winnerTeam === 1
                    ? `${t.draftBattle.winner}: ${finalSquad1.playerName}!`
                    : simulationResult.winnerTeam === 2
                    ? `${t.draftBattle.winner}: ${finalSquad2.playerName}!`
                    : t.draftBattle.draw}
                </span>
                {simulationResult.penaltyShootout && (
                  <span className="text-xs text-amber-300">
                    (Penalties: {simulationResult.penaltyShootout.team1} - {simulationResult.penaltyShootout.team2})
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Match Timeline Events */}
          {simulationResult && (
            <div className="bg-[#091120] border border-white/10 rounded-3xl p-6 shadow-xl">
              <h4 className="font-teko text-2xl font-black text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <span>{t.draftBattle.matchEvents}</span>
              </h4>

              <div className="space-y-3 font-rajdhani">
                {simulationResult.events.map((event, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-2xl border flex items-center gap-3 transition ${
                      event.type === 'goal'
                        ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                        : 'bg-white/5 border-white/5 text-slate-300'
                    }`}
                  >
                    <span className="px-2.5 py-1 rounded-xl bg-black/40 text-xs font-mono font-black text-amber-400 border border-white/10">
                      {event.minute}'
                    </span>

                    <span className="text-xl">
                      {event.type === 'goal' ? '⚽' : event.type === 'save' ? '🧤' : '⚡'}
                    </span>

                    <span className="text-xs sm:text-sm font-medium">
                      {language === 'ar' ? event.textAr : event.textEn}
                    </span>
                  </div>
                ))}
              </div>

              {/* Player of the Match Spotlight */}
              {simulationResult.motm && (
                <div className="mt-6 p-4 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🌟</span>
                    <div>
                      <span className="text-[10px] text-amber-300 block uppercase font-bold">{t.draftBattle.motm}</span>
                      <span className="font-teko text-2xl font-black text-white leading-none">
                        {language === 'ar' ? simulationResult.motm.nameAr : simulationResult.motm.name}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-amber-300 font-rajdhani">
                    {simulationResult.motm.club} ({simulationResult.motm.rating} OVR)
                  </span>
                </div>
              )}

              {/* Rematch & Home buttons */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={handleStartDraft}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-rajdhani font-black text-base uppercase transition active:scale-95 shadow-lg shadow-emerald-500/20"
                >
                  <RotateCcw className="w-4 h-4 inline mr-1" />
                  <span>{t.draftBattle.newDraft}</span>
                </button>

                <button
                  onClick={() => setGameState('summary-battle')}
                  className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-rajdhani font-bold text-base transition active:scale-95"
                >
                  <span>{language === 'ar' ? 'العودة لمقارنة التشكيلتين' : 'Back to Squad Comparison'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 6. SAVED DRAFTS HISTORY SCREEN */}
      {gameState === 'saved-list' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-4">
            <div>
              <h2 className="font-teko text-3xl font-black text-white uppercase tracking-wider">
                {t.draftBattle.savedSquadsTitle}
              </h2>
              <p className="text-xs text-slate-400">
                {language === 'ar' ? 'استعرض تشكيلات الدرفت السابقة وقارنها أو شاركها مع أصدقائك' : 'Review past drafted teams and replay battles anytime'}
              </p>
            </div>

            <button
              onClick={() => setGameState('setup')}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-rajdhani font-bold text-xs transition"
            >
              {language === 'ar' ? 'الرجوع' : 'Back to Setup'}
            </button>
          </div>

          {userStats.savedDrafts && userStats.savedDrafts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userStats.savedDrafts.map(squad => (
                <div
                  key={squad.id}
                  className="p-5 rounded-3xl bg-[#091120] border border-white/10 flex flex-col justify-between shadow-xl"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-teko text-2xl font-black text-amber-300 uppercase">
                        {squad.playerName}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold font-rajdhani text-xs border border-emerald-500/30">
                        {squad.totalRating} OVR
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-center text-xs font-rajdhani mb-4">
                      <div className="p-1.5 rounded-xl bg-white/5">
                        <span className="text-[10px] text-slate-400 block">{t.draftBattle.attack}</span>
                        <span className="font-bold text-white">{squad.attackRating}</span>
                      </div>
                      <div className="p-1.5 rounded-xl bg-white/5">
                        <span className="text-[10px] text-slate-400 block">{t.draftBattle.midfield}</span>
                        <span className="font-bold text-white">{squad.midfieldRating}</span>
                      </div>
                      <div className="p-1.5 rounded-xl bg-white/5">
                        <span className="text-[10px] text-slate-400 block">{t.draftBattle.defense}</span>
                        <span className="font-bold text-white">{squad.defenseRating}</span>
                      </div>
                      <div className="p-1.5 rounded-xl bg-white/5">
                        <span className="text-[10px] text-slate-400 block">{t.draftBattle.chemistry}</span>
                        <span className="font-bold text-cyan-300">{squad.chemistry}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {Object.values(squad.players).map(p => (
                        <span key={p.id} className="text-[10px] text-slate-300 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                          {p.shortName}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                    <button
                      onClick={() => handleCopyCode(squad)}
                      className="text-xs font-bold font-rajdhani text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>{t.draftBattle.shareSquadCode}</span>
                    </button>

                    <button
                      onClick={() => deleteDraftSquad(squad.id)}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition"
                      title="Delete Squad"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-white/5 rounded-3xl border border-white/5">
              <p className="text-sm text-slate-400">
                {t.draftBattle.noSavedSquads}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
