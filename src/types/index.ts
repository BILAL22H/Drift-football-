export type Position = 'GK' | 'DEF' | 'MID' | 'FWD';

export type DetailedPosition =
  | 'GK'
  | 'CB'
  | 'LB'
  | 'RB'
  | 'CDM'
  | 'CM'
  | 'CAM'
  | 'LW'
  | 'RW'
  | 'ST';

export type League =
  | 'Premier League'
  | 'La Liga'
  | 'Serie A'
  | 'Bundesliga'
  | 'Ligue 1'
  | 'Icons & Legends';

export type CardRarity = 'silver' | 'gold' | 'totw' | 'legendary';

export interface PlayerStats {
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
}

export interface SeasonStats {
  goals: number;
  assists: number;
  cleanSheets?: number;
  appearances: number;
}

export interface Player {
  id: string;
  name: string;
  shortName: string;
  nameAr: string;
  photo: string;
  club: string;
  clubAr: string;
  clubLogo: string;
  league: League;
  leagueAr: string;
  nationality: string;
  nationalityAr: string;
  flag: string;
  position: Position;
  detailedPosition: DetailedPosition;
  age: number;
  rating: number;
  rarity: CardRarity;
  stats: PlayerStats;
  seasonStats: SeasonStats;
  preferredFoot?: 'Left' | 'Right' | 'Both';
}

export type ChallengeType =
  | 'league'
  | 'nationality'
  | 'rating'
  | 'club'
  | 'position'
  | 'goals'
  | 'assists'
  | 'age';

export interface Challenge {
  id: string;
  type: ChallengeType;
  questionEn: string;
  questionAr: string;
  correctPlayerId: string;
  explanationEn: string;
  explanationAr: string;
  cards: [Player, Player, Player, Player]; // Exactly GK, DEF, MID, FWD
}

export type GameMode =
  | 'draft-battle'
  | 'guess'
  | 'dream-team'
  | 'endless'
  | 'daily'
  | 'collection'
  | 'packs';

export type DraftMultiplayerMode = 'pass-and-play' | 'solo-vs-ai' | 'online-room';

export interface DraftSlotDef {
  slotId: string;
  label: string;
  labelAr: string;
  position: Position;
  detailedPosition: DetailedPosition;
}

export interface DraftSquad {
  id: string;
  playerName: string;
  formation: '4-3-3';
  players: Record<string, Player>; // slotId -> Player
  totalRating: number;
  attackRating: number;
  midfieldRating: number;
  defenseRating: number;
  gkRating: number;
  chemistry: number;
  createdAt: string;
}

export interface MatchEvent {
  minute: number;
  type: 'goal' | 'save' | 'yellow' | 'red' | 'chance';
  textEn: string;
  textAr: string;
  scorerPlayer?: Player;
  team: 1 | 2;
}

export interface MatchSimulationResult {
  team1Score: number;
  team2Score: number;
  penaltyShootout?: { team1: number; team2: number };
  events: MatchEvent[];
  motm: Player;
  winnerTeam: 1 | 2 | 0; // 0 for draw before penalties
}

export interface UserStats {
  score: number;
  highScore: number;
  streak: number;
  bestStreak: number;
  totalAnswered: number;
  totalCorrect: number;
  coins: number;
  dailyStreak: number;
  lastDailyDate: string | null;
  unlockedPlayerIds: string[];
  dreamTeam: Record<string, string | null>; // slotId -> playerId
  formation: '4-3-3' | '4-2-3-1' | '3-5-2';
  savedDrafts: DraftSquad[];
}

export interface FormationSlot {
  id: string;
  label: string;
  allowedPosition: Position;
  detailedPosition: DetailedPosition;
  x: number; // percentage left on pitch (0-100)
  y: number; // percentage top on pitch (0-100)
}

export interface PackDefinition {
  id: string;
  nameEn: string;
  nameAr: string;
  cost: number;
  cardCount: number;
  minRating: number;
  descriptionEn: string;
  descriptionAr: string;
  badge: string;
  colorScheme: 'silver' | 'gold' | 'champions';
}

