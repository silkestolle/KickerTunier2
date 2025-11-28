
export interface Player {
  id: string;
  name: string;
  skill: number;
}

export interface Team {
  id: string;
  name: string;
  players: [Player, Player];
  skill: number;
  seed?: number;
}

export interface Match {
  id: string;
  teamA: Team | null;
  teamB: Team | null;
  scoreA: number | null;
  scoreB: number | null;
  winner: Team | null;
  isBye: boolean;
}

export type Round = Match[];

export type TournamentState = 'REGISTRATION' | 'TEAMS_VIEW' | 'IN_PROGRESS' | 'FINISHED';