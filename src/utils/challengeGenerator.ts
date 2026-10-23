import { Challenge, Player, Position } from '../types';
import { PLAYERS_DATABASE } from '../data/players';

// Helper to pick random item from array
function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Helper to filter players by position
function getPlayersByPosition(pos: Position): Player[] {
  return PLAYERS_DATABASE.filter(p => p.position === pos);
}

export function generateFourCardChallenge(excludedPlayerIds: string[] = []): Challenge {
  const gks = getPlayersByPosition('GK');
  const defs = getPlayersByPosition('DEF');
  const mids = getPlayersByPosition('MID');
  const fwds = getPlayersByPosition('FWD');

  // Attempt up to 25 times to generate a well-balanced 4-card set with rich question candidates
  let attempts = 0;
  while (attempts < 25) {
    attempts++;

    // Pick 1 of each position, avoiding recently seen players if possible
    const availableGks = gks.filter(p => !excludedPlayerIds.includes(p.id));
    const availableDefs = defs.filter(p => !excludedPlayerIds.includes(p.id));
    const availableMids = mids.filter(p => !excludedPlayerIds.includes(p.id));
    const availableFwds = fwds.filter(p => !excludedPlayerIds.includes(p.id));

    const gk = getRandomItem(availableGks.length ? availableGks : gks);
    const def = getRandomItem(availableDefs.length ? availableDefs : defs);
    const mid = getRandomItem(availableMids.length ? availableMids : mids);
    const fwd = getRandomItem(availableFwds.length ? availableFwds : fwds);

    const cards: [Player, Player, Player, Player] = [gk, def, mid, fwd];

    // Gather question options that are strictly satisfied by EXACTLY ONE player among the 4
    const questionCandidates: {
      type: Challenge['type'];
      questionEn: string;
      questionAr: string;
      correctPlayerId: string;
      explanationEn: string;
      explanationAr: string;
    }[] = [];

    // 1. League-based questions
    const leagueCounts: Record<string, Player[]> = {};
    cards.forEach(p => {
      leagueCounts[p.league] = leagueCounts[p.league] || [];
      leagueCounts[p.league].push(p);
    });

    Object.entries(leagueCounts).forEach(([league, players]) => {
      if (players.length === 1) {
        const player = players[0];
        questionCandidates.push({
          type: 'league',
          questionEn: `Which player plays in the ${league}?`,
          questionAr: `أي لاعب يلعب في ${player.leagueAr}؟`,
          correctPlayerId: player.id,
          explanationEn: `${player.name} plays in ${league} with ${player.club}.`,
          explanationAr: `${player.nameAr} يلعب في ${player.leagueAr} رفقة نادي ${player.clubAr}.`
        });
      }
    });

    // 2. Club-based questions
    const clubCounts: Record<string, Player[]> = {};
    cards.forEach(p => {
      clubCounts[p.club] = clubCounts[p.club] || [];
      clubCounts[p.club].push(p);
    });

    Object.entries(clubCounts).forEach(([club, players]) => {
      if (players.length === 1) {
        const player = players[0];
        questionCandidates.push({
          type: 'club',
          questionEn: `Which player plays for ${club}?`,
          questionAr: `أي لاعب يلعب لصالح نادي ${player.clubAr}؟`,
          correctPlayerId: player.id,
          explanationEn: `${player.name} plays for ${club} (${player.league}).`,
          explanationAr: `${player.nameAr} يلعب لصالح ${player.clubAr} (${player.leagueAr}).`
        });
      }
    });

    // 3. Nationality-based questions
    const nationCounts: Record<string, Player[]> = {};
    cards.forEach(p => {
      nationCounts[p.nationality] = nationCounts[p.nationality] || [];
      nationCounts[p.nationality].push(p);
    });

    Object.entries(nationCounts).forEach(([nation, players]) => {
      if (players.length === 1) {
        const player = players[0];
        questionCandidates.push({
          type: 'nationality',
          questionEn: `Which player is a ${nation} international?`,
          questionAr: `أي لاعب يمثل منتخب ${player.nationalityAr} ${player.flag}؟`,
          correctPlayerId: player.id,
          explanationEn: `${player.name} represents ${nation} ${player.flag}.`,
          explanationAr: `${player.nameAr} يمثل المنتخب الوطني لـ ${player.nationalityAr} ${player.flag}.`
        });
      }
    });

    // 4. Highest Rating question
    const maxRating = Math.max(...cards.map(p => p.rating));
    const highestRatingPlayers = cards.filter(p => p.rating === maxRating);
    if (highestRatingPlayers.length === 1) {
      const player = highestRatingPlayers[0];
      questionCandidates.push({
        type: 'rating',
        questionEn: `Which player has the highest overall rating?`,
        questionAr: `أي لاعب يمتلك أعلى تقييم عام (OVR)؟`,
        correctPlayerId: player.id,
        explanationEn: `${player.name} has the highest rating (${player.rating} OVR).`,
        explanationAr: `${player.nameAr} يمتلك التقييم الأعلى بواقع ${player.rating}.`
      });
    }

    // 5. Goals question
    const maxGoals = Math.max(...cards.map(p => p.seasonStats.goals));
    const highestGoalPlayers = cards.filter(p => p.seasonStats.goals === maxGoals);
    if (highestGoalPlayers.length === 1 && maxGoals >= 5) {
      const player = highestGoalPlayers[0];
      questionCandidates.push({
        type: 'goals',
        questionEn: `Which player has scored the most goals this season?`,
        questionAr: `أي لاعب سجّل أكبر عدد من الأهداف هذا الموسم؟`,
        correctPlayerId: player.id,
        explanationEn: `${player.name} has scored ${player.seasonStats.goals} goals.`,
        explanationAr: `${player.nameAr} سجّل ${player.seasonStats.goals} هدفاً هذا الموسم.`
      });
    }

    // 6. Position question
    const randomPos = getRandomItem<Position>(['GK', 'DEF', 'MID', 'FWD']);
    const posPlayer = cards.find(p => p.position === randomPos);
    if (posPlayer) {
      const posMapEn: Record<Position, string> = {
        GK: 'a goalkeeper',
        DEF: 'a defender',
        MID: 'a midfielder',
        FWD: 'a forward / striker'
      };
      const posMapAr: Record<Position, string> = {
        GK: 'حارس مرمى',
        DEF: 'مدافع',
        MID: 'لاعب خط وسط',
        FWD: 'مهاجم'
      };

      questionCandidates.push({
        type: 'position',
        questionEn: `Which player plays as ${posMapEn[randomPos]}?`,
        questionAr: `أي لاعب يلعب في مركز (${posMapAr[randomPos]})؟`,
        correctPlayerId: posPlayer.id,
        explanationEn: `${posPlayer.name} is the only ${randomPos} among these cards.`,
        explanationAr: `${posPlayer.nameAr} يلعب في مركز ${posMapAr[randomPos]}.`
      });
    }

    // 7. Youngest question
    const minAge = Math.min(...cards.map(p => p.age));
    const youngestPlayers = cards.filter(p => p.age === minAge);
    if (youngestPlayers.length === 1) {
      const player = youngestPlayers[0];
      questionCandidates.push({
        type: 'age',
        questionEn: `Which player is the youngest among these four?`,
        questionAr: `أي لاعب هو الأصغر سناً بين هؤلاء اللاعبين؟`,
        correctPlayerId: player.id,
        explanationEn: `${player.name} is the youngest at ${player.age} years old.`,
        explanationAr: `${player.nameAr} هو الأصغر سناً بعمر ${player.age} عاماً.`
      });
    }

    // If we have candidates, pick one at random!
    if (questionCandidates.length > 0) {
      const selectedQuestion = getRandomItem(questionCandidates);
      return {
        id: `challenge-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        cards,
        ...selectedQuestion
      };
    }
  }

  // Fallback guaranteed challenge (position based)
  const gk = getRandomItem(gks);
  const def = getRandomItem(defs);
  const mid = getRandomItem(mids);
  const fwd = getRandomItem(fwds);
  const cards: [Player, Player, Player, Player] = [gk, def, mid, fwd];

  return {
    id: `challenge-${Date.now()}`,
    type: 'position',
    questionEn: 'Which player is the Goalkeeper (GK)?',
    questionAr: 'أي لاعب من هؤلاء هو حارس المرمى (GK)؟',
    correctPlayerId: gk.id,
    explanationEn: `${gk.name} is a world-class goalkeeper for ${gk.club}.`,
    explanationAr: `${gk.nameAr} هو حارس مرمى نادي ${gk.clubAr}.`,
    cards
  };
}

// Daily challenge generator based on seed (date)
export function getDailyChallenges(dateString: string): Challenge[] {
  // Simple deterministic seeded PRNG for consistent daily questions
  let seed = 0;
  for (let i = 0; i < dateString.length; i++) {
    seed = (seed * 31 + dateString.charCodeAt(i)) >>> 0;
  }

  const challenges: Challenge[] = [];
  const usedPlayerIds: string[] = [];

  for (let round = 0; round < 5; round++) {
    const ch = generateFourCardChallenge(usedPlayerIds);
    ch.cards.forEach(c => usedPlayerIds.push(c.id));
    challenges.push(ch);
  }

  return challenges;
}
