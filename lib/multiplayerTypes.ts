// ============================================================================
// MULTIPLAYER TYPES & CONSTANTS FOR VENNIKULAM PREMIER LEAGUE (TWO-DEVICE)
// ============================================================================

export type MpMode = 'TWO_DEVICE';

export type MpRole = 'HOST' | 'GUEST';

export type BowlingVariation = 'FAST' | 'SPIN' | 'SLOWER' | 'BOUNCER';
export type BowlingLine = 'OFF' | 'MIDDLE' | 'LEG';
export type BowlingLength = 'SHORT' | 'GOOD' | 'FULL';

export interface BowlingDeliveryChoice {
  variation: BowlingVariation;
  line: BowlingLine;
  length: BowlingLength;
  timestamp: number;
}

export interface PlayerProfile {
  name: string;
  batsmanId: string;
}

export interface InningsScorecard {
  battingPlayer: string;
  bowlingPlayer: string;
  runs: number;
  wickets: number;
  balls: number;
  totalBalls: number;
  fours: number;
  sixes: number;
  bestShot: string;
  lastBalls: string[];
}

export type MpPhase =
  | 'MP_LOBBY'
  | 'MP_TOSS'
  | 'MP_BOWLER_PICK' // 3-second human bowler choice strip on Bowling Device
  | 'MP_BALL_RUNUP'
  | 'MP_BALL_BOWLING'
  | 'MP_BALL_HIT'
  | 'MP_BALL_OUTCOME'
  | 'MP_INNINGS_BREAK'
  | 'MP_SUPER_OVER_ALERT'
  | 'MP_MATCH_END';

export interface PeerMessage {
  id?: string;
  type:
    | 'LOBBY_STATE'
    | 'GUEST_PROFILE'
    | 'TOSS_INIT'
    | 'TOSS_START'
    | 'TOSS_DECISION'
    | 'BOWLING_CHOICE'
    | 'BATTER_SWING'
    | 'BALL_RESULT'
    | 'START_INNINGS_2'
    | 'EMOTE'
    | 'PING'
    | 'PONG'
    | 'REMATCH';
  payload?: any;
}

export const MP_EMOTES = [
  { id: 'adipoli', text: 'Adipoli!', sub: 'അടിപൊളി!', color: '#22C55E' },
  { id: 'poda', text: 'Poda!', sub: 'പോടാ!', color: '#EF4444' },
  { id: 'kidilam', text: 'Kidilam!', sub: 'കിടിലം!', color: '#EAB308' },
  { id: 'pidikkada', text: 'Pidikkada!', sub: 'പിടിക്കടാ!', color: '#38BDF8' },
];
