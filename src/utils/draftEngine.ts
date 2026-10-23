import { Player, Position, DetailedPosition, DraftSlotDef, DraftSquad, MatchEvent, MatchSimulationResult } from '../types';
import { PLAYERS_DATABASE } from '../data/players';

export const DRAFT_STAGES: DraftSlotDef[] = [
  { slotId: 'gk', label: 'Goalkeeper', labelAr: 'حارس المرمى', position: 'GK', detailedPosition: 'GK' },
  { slotId: 'lb', label: 'Left Back', labelAr: 'ظهير أيسر', position: 'DEF', detailedPosition: 'LB' },
  { slotId: 'cb1', label: 'Center Back 1', labelAr: 'قلب دفاع 1', position: 'DEF', detailedPosition: 'CB' },
  { slotId: 'cb2', label: 'Center Back 2', labelAr: 'قلب دفاع 2', position: 'DEF', detailedPosition: 'CB' },
  { slotId: 'rb', label: 'Right Back', labelAr: 'ظهير أيمن', position: 'DEF', detailedPosition: 'RB' },
  { slotId: 'cm1', label: 'Center Midfield 1', labelAr: 'لاعب وسط 1', position: 'MID', detailedPosition: 'CM' },
  { slotId: 'cdm', label: 'Defensive Midfield', labelAr: 'وسط دفاعي (ارتكاز)', position: 'MID', detailedPosition: 'CDM' },
  { slotId: 'cm2', label: 'Center Midfield 2', labelAr: 'لاعب وسط 2', position: 'MID', detailedPosition: 'CM' },
  { slotId: 'lw', label: 'Left Winger', labelAr: 'جناح أيسر', position: 'FWD', detailedPosition: 'LW' },
  { slotId: 'st', label: 'Striker', labelAr: 'مهاجم صريح', position: 'FWD', detailedPosition: 'ST' },
  { slotId: 'rw', label: 'Right Winger', labelAr: 'جناح أيمن', position: 'FWD', detailedPosition: 'RW' },
];

// Generate 4 unique random player options for a given draft slot
export function generateDraftFourCards(
  stage: DraftSlotDef,
  excludedPlayerIds: string[] = []
): [Player, Player, Player, Player] {
  const excludedSet = new Set(excludedPlayerIds);

  // 1. Strict primary pool: candidates matching the exact detailed position (LB, CB, RB, CDM, CM, LW, ST, RW, GK)
  // and NOT already drafted anywhere in the game session
  const strictPool = PLAYERS_DATABASE.filter(
    p => p.detailedPosition === stage.detailedPosition && !excludedSet.has(p.id)
  );

  // Shuffle available candidates
  const shuffledStrict = [...strictPool].sort(() => Math.random() - 0.5);

  const selected: Player[] = [];
  const chosenIds = new Set<string>();

  for (const player of shuffledStrict) {
    if (!chosenIds.has(player.id)) {
      chosenIds.add(player.id);
      selected.push(player);
      if (selected.length === 4) break;
    }
  }

  // If pool was exhausted (e.g. at extreme edge cases), fill remaining slots strictly from the same detailedPosition
  if (selected.length < 4) {
    const backupPool = PLAYERS_DATABASE
      .filter(p => p.detailedPosition === stage.detailedPosition && !chosenIds.has(p.id))
      .sort(() => Math.random() - 0.5);

    for (const player of backupPool) {
      chosenIds.add(player.id);
      selected.push(player);
      if (selected.length === 4) break;
    }
  }

  // Guarantees exactly 4 distinct players
  return [selected[0], selected[1], selected[2], selected[3]];
}

// Calculate team rating and chemistry
export function calculateSquadMetrics(playersRecord: Record<string, Player>): {
  totalRating: number;
  attackRating: number;
  midfieldRating: number;
  defenseRating: number;
  gkRating: number;
  chemistry: number;
} {
  const players = Object.values(playersRecord);
  if (players.length === 0) {
    return { totalRating: 0, attackRating: 0, midfieldRating: 0, defenseRating: 0, gkRating: 0, chemistry: 0 };
  }

  const avg = (arr: Player[]) =>
    arr.length ? Math.round(arr.reduce((acc, p) => acc + p.rating, 0) / arr.length) : 0;

  const totalRating = avg(players);

  // Group by lines
  const attackPlayers = [playersRecord['lw'], playersRecord['st'], playersRecord['rw']].filter(Boolean);
  const midPlayers = [playersRecord['cm1'], playersRecord['cdm'], playersRecord['cm2']].filter(Boolean);
  const defPlayers = [playersRecord['lb'], playersRecord['cb1'], playersRecord['cb2'], playersRecord['rb']].filter(Boolean);
  const gkPlayer = playersRecord['gk'];

  const attackRating = avg(attackPlayers);
  const midfieldRating = avg(midPlayers);
  const defenseRating = avg(defPlayers);
  const gkRating = gkPlayer ? gkPlayer.rating : 0;

  // Chemistry calculation
  let chem = 0;
  if (players.length > 1) {
    const clubs: Record<string, number> = {};
    const leagues: Record<string, number> = {};
    const nations: Record<string, number> = {};

    players.forEach(p => {
      clubs[p.club] = (clubs[p.club] || 0) + 1;
      leagues[p.league] = (leagues[p.league] || 0) + 1;
      nations[p.nationality] = (nations[p.nationality] || 0) + 1;
    });

    Object.values(clubs).forEach(c => { if (c >= 2) chem += (c - 1) * 4; });
    Object.values(leagues).forEach(c => { if (c >= 2) chem += (c - 1) * 3; });
    Object.values(nations).forEach(c => { if (c >= 2) chem += (c - 1) * 2; });
  }

  return {
    totalRating,
    attackRating,
    midfieldRating,
    defenseRating,
    gkRating,
    chemistry: Math.min(33, chem)
  };
}

// Full Match Simulation Engine between two drafted squads
export function simulateDraftMatch(team1: DraftSquad, team2: DraftSquad): MatchSimulationResult {
  const t1Players = Object.values(team1.players);
  const t2Players = Object.values(team2.players);

  // Determine attack vs defense balance with chemistry influence
  const t1Power = team1.totalRating + (team1.chemistry / 3.3) + (team1.attackRating * 0.4);
  const t2Power = team2.totalRating + (team2.chemistry / 3.3) + (team2.attackRating * 0.4);

  const events: MatchEvent[] = [];

  // Goal expectancy
  let t1Goals = 0;
  let t2Goals = 0;

  // Simulate 6 key highlight moments across 90 minutes
  const matchMinutes = [14, 28, 42, 59, 73, 86];

  matchMinutes.forEach(minute => {
    // Determine which team attacks this turn
    const isTeam1Attacking = Math.random() * (t1Power + t2Power) < t1Power;
    const attackingTeam = isTeam1Attacking ? team1 : team2;
    const defendingTeam = isTeam1Attacking ? team2 : team1;
    const teamNum: 1 | 2 = isTeam1Attacking ? 1 : 2;

    const atkPlayers = [attackingTeam.players['st'], attackingTeam.players['lw'], attackingTeam.players['rw'], attackingTeam.players['cm1']].filter(Boolean);
    const starAtk = atkPlayers[Math.floor(Math.random() * atkPlayers.length)] || Object.values(attackingTeam.players)[0];
    const defGk = defendingTeam.players['gk'] || Object.values(defendingTeam.players)[0];

    // Probability of goal on chance based on ratings
    const shotQuality = (starAtk?.stats.shooting || 80) + Math.random() * 20;
    const gkResistance = (defGk?.rating || 80) + Math.random() * 20;

    if (shotQuality > gkResistance + 6) {
      // GOAL!
      if (teamNum === 1) t1Goals++;
      else t2Goals++;

      events.push({
        minute,
        type: 'goal',
        team: teamNum,
        scorerPlayer: starAtk,
        textEn: `GOAL! ${starAtk.name} (${attackingTeam.playerName}) strikes an unstoppable shot into the top corner!`,
        textAr: `هدف! ${starAtk.nameAr} (${attackingTeam.playerName}) يسدد كرة صاروخية تسكن الشباك!`
      });
    } else if (shotQuality > gkResistance - 4) {
      // Big Goalkeeper Save!
      events.push({
        minute,
        type: 'save',
        team: teamNum === 1 ? 2 : 1,
        textEn: `Brilliant save by ${defGk.name}! Denies ${starAtk.name} from close range.`,
        textAr: `تصدٍ إعجازي من الحارس ${defGk.nameAr}! يحرم ${starAtk.nameAr} من هدف محقق.`
      });
    } else {
      // Dangerous Chance / Defense Tackle
      const defCB = defendingTeam.players['cb1'] || defendingTeam.players['cb2'] || defGk;
      events.push({
        minute,
        type: 'chance',
        team: teamNum,
        textEn: `Dangerous counter-attack led by ${starAtk.name}, intercepted decisively by ${defCB.name}.`,
        textAr: `هجمة مرتدة خطيرة يقودها ${starAtk.nameAr}، لكن يقطعها ببراعة ${defCB.nameAr}.`
      });
    }
  });

  // Guarantee at least 1 exciting event if both had low chances
  if (events.filter(e => e.type === 'goal').length === 0) {
    const min = 88;
    const chosenTeam = t1Power >= t2Power ? 1 : 2;
    const winnerSquad = chosenTeam === 1 ? team1 : team2;
    const striker = winnerSquad.players['st'] || Object.values(winnerSquad.players)[0];

    if (chosenTeam === 1) t1Goals = 1;
    else t2Goals = 1;

    events.push({
      minute: min,
      type: 'goal',
      team: chosenTeam,
      scorerPlayer: striker,
      textEn: `LATE DRAMA! ${striker.name} scores the dramatic match-winner in the 88th minute!`,
      textAr: `إثارة قاتلة في الدقيقة 88! ${striker.nameAr} يخطف هدف الفوز الثمين!`
    });
  }

  // Handle draw penalty shootouts if needed
  let penaltyShootout: { team1: number; team2: number } | undefined = undefined;
  let winnerTeam: 1 | 2 | 0 = 0;

  if (t1Goals > t2Goals) {
    winnerTeam = 1;
  } else if (t2Goals > t1Goals) {
    winnerTeam = 2;
  } else {
    // Penalty shootout
    const p1 = Math.floor(Math.random() * 2) + 4; // 4 or 5
    const p2 = p1 === 5 ? 4 : 5;
    penaltyShootout = { team1: p1, team2: p2 };
    winnerTeam = p1 > p2 ? 1 : 2;
  }

  // Pick Player of the Match (MOTM)
  const winningSquad = winnerTeam === 1 ? team1 : team2;
  const goalEvent = events.find(e => e.type === 'goal' && e.team === winnerTeam);
  const motm = goalEvent?.scorerPlayer || Object.values(winningSquad.players).sort((a, b) => b.rating - a.rating)[0] || t1Players[0];

  return {
    team1Score: t1Goals,
    team2Score: t2Goals,
    penaltyShootout,
    events: events.sort((a, b) => a.minute - b.minute),
    motm,
    winnerTeam
  };
}

// Generate shareable base64 code for a squad
export function encodeSquadCode(squad: DraftSquad): string {
  try {
    const compactObj = {
      n: squad.playerName,
      p: Object.entries(squad.players).map(([slot, player]) => `${slot}:${player.id}`)
    };
    return btoa(JSON.stringify(compactObj));
  } catch {
    return squad.id;
  }
}

// Decode friend's shareable squad code
export function decodeSquadCode(codeStr: string): DraftSquad | null {
  try {
    const raw = atob(codeStr.trim());
    const parsed = JSON.parse(raw);
    const playersMap: Record<string, Player> = {};

    parsed.p.forEach((item: string) => {
      const [slot, id] = item.split(':');
      const found = PLAYERS_DATABASE.find(p => p.id === id);
      if (found) {
        playersMap[slot] = found;
      }
    });

    if (Object.keys(playersMap).length < 5) return null;

    const metrics = calculateSquadMetrics(playersMap);

    return {
      id: `imported-${Date.now()}`,
      playerName: parsed.n || 'Friend Squad',
      formation: '4-3-3',
      players: playersMap,
      ...metrics,
      createdAt: new Date().toISOString()
    };
  } catch {
    return null;
  }
}
