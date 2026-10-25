'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Volume2,
  VolumeX,
  Sun,
  Sunset,
  CloudRain,
  Trophy,
  RotateCcw,
  Play,
  Pause,
  Sparkles,
  Award,
  Users,
  Copy,
  Check,
  Wifi,
  WifiOff,
  Radio,
  ArrowRight,
  Shield,
  Smile,
  Send,
  MessageCircle,
} from 'lucide-react';
import {
  MpMode,
  MpRole,
  BowlingVariation,
  BowlingLine,
  BowlingLength,
  BowlingDeliveryChoice,
  InningsScorecard,
  MP_EMOTES,
  PeerMessage,
} from '@/lib/multiplayerTypes';
import { PeerNetworkManager } from '@/lib/peerNetworkManager';

// ============================================================================
// 1. CONFIGURABLE CONSTANTS (TWEAK DIFFICULTY, OVER COUNTS & COLOURS HERE)
// ============================================================================
export const GAME_CONFIG = {
  OVER_OPTIONS: [1, 2, 5] as const,
  DEFAULT_OVERS: 2,
  MAX_WICKETS: 3,

  DIFFICULTY: {
    SWEET_SPOT: 0.84,
    PERFECT_WINDOW: 0.042,
    GOOD_WINDOW: 0.088,
    EDGE_WINDOW: 0.145,
    BASE_BALL_SPEED: 0.62,
    FIELDER_SPEED: 115,
    CATCH_RADIUS: 26,
    MONSOON_SLOWDOWN: 0.78,
    MONSOON_SKID: 1.16,
  },

  RIVALS: [
    {
      id: 'kuttanad',
      name: 'Kuttanad XI',
      malayalam: 'കുട്ടനാട് XI',
      tagline: 'Backwater Spin Wizards',
      runsPerOver: 11,
      speedMult: 0.95,
      fielderBoost: 0.95,
      favoredBall: 'SPIN' as const,
    },
    {
      id: 'munnar',
      name: 'Munnar Mavericks',
      malayalam: 'മൂന്നാർ മാവെറിക്സ്',
      tagline: 'High-Range Express Pacers',
      runsPerOver: 14,
      speedMult: 1.12,
      fielderBoost: 1.08,
      favoredBall: 'BOUNCER' as const,
    },
    {
      id: 'kozhikode',
      name: 'Kozhikode Kings',
      malayalam: 'കോഴിക്കോട് കിംഗ്സ്',
      tagline: 'Malabar Slower-Ball Masters',
      runsPerOver: 17,
      speedMult: 1.24,
      fielderBoost: 1.2,
      favoredBall: 'SLOWER' as const,
    },
  ],

  BATSMEN: [
    {
      id: 'unni',
      name: 'Sunni',
      malayalam: 'സുണ്ണി',
      role: 'Power Hitter',
      desc: '+25% shot power & effortless sixes into the paddy.',
      unlockText: 'Starter Batter',
      unlockRuns: 0,
      powerMult: 1.25,
      timingMult: 1.0,
      luckyChance: 0.05,
      munduColor: '#FDFBF2',
      shirtColor: '#B91C1C',
    },
    {
      id: 'appu',
      name: 'Maanu',
      malayalam: 'മണു',
      role: 'Timing Master',
      desc: '+35% wider sweet spot for Good & Perfect shots.',
      unlockText: 'Score 20+ runs in a match',
      unlockRuns: 20,
      powerMult: 1.05,
      timingMult: 1.35,
      luckyChance: 0.08,
      munduColor: '#E8F5E9',
      shirtColor: '#1D4ED8',
    },
    {
      id: 'ammachi',
      name: 'Pro',
      malayalam: 'പ്രോ',
      role: 'Lucky Legend',
      desc: '40% chance edges & mishits fly for miracle sixes!',
      unlockText: 'Score 40+ runs or win a match',
      unlockRuns: 40,
      powerMult: 1.15,
      timingMult: 1.15,
      luckyChance: 0.42,
      munduColor: '#FFF8E1',
      shirtColor: '#7E22CE',
    },
  ],

  // Realistic Rural Kerala Padam Palettes
  COLORS: {
    DAY: {
      skyTop: '#D97706',
      skyMid: '#FBBF24',
      skyHorizon: '#FEF3C7',
      distantHills: '#3F6212',
      midHills: '#365314',
      outerEarth: '#57534E',
      padamBase: '#656D4A',
      padamDry: '#7F7756',
      padamGreen: '#4A5D23',
      padamSoil: '#8B7355',
      bundMud: '#5C4033',
      pitchClay: '#9A4628',
      pitchDark: '#7C3219',
      canalWater: '#3B4D3B',
      canalBank: '#4E3B2B',
      shadowColor: 'rgba(28, 25, 23, 0.28)',
    },
    EVENING: {
      skyTop: '#311042',
      skyMid: '#C2410C',
      skyHorizon: '#FDBA74',
      distantHills: '#1E293B',
      midHills: '#1A2E1A',
      outerEarth: '#3B322C',
      padamBase: '#4B4F35',
      padamDry: '#5E543E',
      padamGreen: '#344219',
      padamSoil: '#69533E',
      bundMud: '#432E23',
      pitchClay: '#7C341C',
      pitchDark: '#592210',
      canalWater: '#28362B',
      canalBank: '#38291E',
      shadowColor: 'rgba(15, 10, 20, 0.42)',
    },
    MONSOON: {
      skyTop: '#334155',
      skyMid: '#475569',
      skyHorizon: '#94A3B8',
      distantHills: '#1E3A2F',
      midHills: '#143323',
      outerEarth: '#3F3A34',
      padamBase: '#3F4E2E',
      padamDry: '#4E4937',
      padamGreen: '#2D471E',
      padamSoil: '#574433',
      bundMud: '#3E2A1E',
      pitchClay: '#6E2B14',
      pitchDark: '#4D1C0B',
      canalWater: '#2C4035',
      canalBank: '#332419',
      shadowColor: 'rgba(15, 23, 42, 0.22)',
    },
  },
};

// ============================================================================
// 2. TYPES & INTERFACES
// ============================================================================
type GameScreen = 'TITLE' | 'PLAYING' | 'PAUSED' | 'SUMMARY' | 'TOSS' | 'INNINGS_BREAK';
type GameMode = 'QUICK' | 'CHASE' | 'TOURNAMENT' | 'MULTIPLAYER';
type BallType = 'FAST' | 'SPIN' | 'SLOWER' | 'BOUNCER';
type AimDirection = -1 | 0 | 1;
type DeliveryPhase = 'READY' | 'RUNUP' | 'BOWLING' | 'HIT_FLIGHT' | 'BALL_SETTLED';
type TimeOfDay = 'DAY' | 'EVENING';

interface Fielder {
  id: number;
  name: string;
  homeX: number;
  homeY: number;
  x: number;
  y: number;
  lungiColor: string;
  shirtColor: string;
  isUncle: boolean;
  animOffset: number;
}

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
}

interface RainDrop {
  x: number;
  y: number;
  len: number;
  speed: number;
}

interface PalmTree {
  wx: number;
  wy: number;
  height: number;
  lean: number;
  frondCount: number;
  seed: number;
}

interface FlyingBirdSprite {
  species: 'CROW' | 'HERON';
  x: number;
  y: number;
  vx: number;
  vy: number;
  wingPhase: number;
  flapSpeed: number;
  size: number;
  direction: 1 | -1;
}

interface ActiveEmote {
  id: string;
  text: string;
  sender: string;
  x: number;
  y: number;
  alpha: number;
  color: string;
}

// ============================================================================
// 3. WEB AUDIO API SYNTHESIZER
// ============================================================================
class KeralaAudioEngine {
  ctx: AudioContext | null = null;
  muted: boolean = false;

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playBatHit(quality: 'PERFECT' | 'GOOD' | 'EDGE' | 'MISS') {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    if (quality === 'MISS') {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.14);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
      return;
    }

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    const baseFreq = quality === 'PERFECT' ? 185 : quality === 'GOOD' ? 230 : 390;
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(55, now + 0.09);

    gain.gain.setValueAtTime(quality === 'PERFECT' ? 0.65 : 0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.11);
  }

  playTinRoofClang() {
    if (this.muted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const freqs = [520, 785, 1140, 1620];
    freqs.forEach((f, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = idx % 2 === 0 ? 'square' : 'sawtooth';
      osc.frequency.setValueAtTime(f, now);
      osc.frequency.exponentialRampToValueAtTime(f * 0.85, now + 0.35);
      gain.gain.setValueAtTime(0.12 / (idx + 1), now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.36);
    });
  }

  playSplash() {
    if (this.muted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.45;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.15));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(900, now);
    filter.frequency.exponentialRampToValueAtTime(300, now + 0.4);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.44);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(now);
  }

  playGoatBleat() {
    if (this.muted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(330, now);
    osc.frequency.linearRampToValueAtTime(390, now + 0.15);
    osc.frequency.linearRampToValueAtTime(290, now + 0.45);

    lfo.frequency.value = 16;
    lfoGain.gain.value = 25;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.005, now + 0.48);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    lfo.start(now);
    osc.stop(now + 0.5);
    lfo.stop(now + 0.5);
  }

  playCrowdCheer() {
    if (this.muted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const duration = 1.4;
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      const env = Math.sin((i / bufferSize) * Math.PI);
      data[i] = (Math.random() * 2 - 1) * env;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1100, now);
    filter.Q.value = 1.2;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(now);
  }

  playChendaBoundaryBeat() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    this.playCrowdCheer();

    const hits = [0, 0.14, 0.28, 0.36, 0.5, 0.64, 0.72, 0.8, 0.94, 1.08, 1.16, 1.24, 1.38];
    hits.forEach((offset, idx) => {
      if (!this.ctx) return;
      const t = this.ctx.currentTime + offset;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const isAccent = idx % 4 === 0;
      osc.type = isAccent ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(isAccent ? 290 : 240, t);
      osc.frequency.exponentialRampToValueAtTime(95, t + 0.08);

      gain.gain.setValueAtTime(isAccent ? 0.45 : 0.28, t);
      gain.gain.exponentialRampToValueAtTime(0.005, t + 0.09);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.095);
    });
  }

  playWicketSound() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [0, 0.06, 0.13].forEach((d, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(320 - i * 55, now + d);
      osc.frequency.exponentialRampToValueAtTime(90, now + d + 0.08);
      gain.gain.setValueAtTime(0.25, now + d);
      gain.gain.exponentialRampToValueAtTime(0.005, now + d + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + d);
      osc.stop(now + d + 0.09);
    });
  }

  playCoinToss() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    for (let i = 0; i < 7; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200 + i * 180, now + i * 0.08);
      gain.gain.setValueAtTime(0.12, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.07);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.08);
    }
  }
}

const audio = new KeralaAudioEngine();

// ============================================================================
// 4. MANGLISH COMMENTARY PHRASES
// ============================================================================
const COMMENTARY = {
  SIX: [
    { text: 'Sixer, mone!', sub: 'സിക്സർ മോനേ! തകർത്തു!' },
    { text: 'Adipoli shot!', sub: 'അടിപൊളി ഷോട്ട്!' },
    { text: 'Kidilam! Over the Palms!', sub: 'കിടിലം! തെങ്ങിൻ മുകളിലൂടെ!' },
  ],
  PADDY_SIX: [
    { text: 'Padathil poyi! Auto Sixer!', sub: 'പാടത്തിൽ പോയി — 6 റൺസ്!' },
    { text: 'Lost in the Stubble! 6 Runs!', sub: 'നെൽപ്പാടത്തിൽ പോയി!' },
  ],
  FOUR: [
    { text: 'Adipoli boundary!', sub: 'അടിപൊളി ഫോർ!' },
    { text: 'Kidilam placement past the varambu!', sub: 'വരമ്പ് കടന്ന് ഫോർ!' },
  ],
  ROOF: [
    { text: 'Chayakada Roof! +2 Bonus!', sub: 'ചായക്കടപ്പുറത്ത് വീണു! +2' },
  ],
  CANAL_OUT: [
    { text: 'Kayalil poyi! OUT!', sub: 'കായലിൽ പോയി! ഔട്ട്!' },
  ],
  CAUGHT_OUT: [
    { text: 'Pidikkada! Caught Out!', sub: 'പിടിക്കടാ! ക്യാച്ച് ഔട്ട്!' },
    { text: 'Out aayallo!', sub: 'അയ്യോ ഔട്ട് ആയല്ലോ!' },
  ],
  BOWLED_OUT: [
    { text: 'Out aayallo! Clean Bowled!', sub: 'ക്ലീൻ ബൗൾഡ് ആയി!' },
  ],
  LBW_OUT: [
    { text: 'Plumb in front! LBW Out!', sub: 'നേരെ പാഡിൽ! എൽ.ബി.ഡബ്ല്യു ഔട്ട്!' },
  ],
  ANIMAL_DOT: [
    { text: 'Aadu thaduthu! Comic Dot Ball!', sub: 'ആട് തടുത്തു! റൺ ഇല്ല!' },
    { text: 'Kozhi pidichu! No Run!', sub: 'കോഴി തട്ടി! റൺ ഇല്ല!' },
  ],
  RUNS: [
    { text: 'Odu mone! Good running!', sub: 'ഓട് മോനേ!' },
    { text: 'Smart placement!', sub: 'നല്ല ഓട്ടം!' },
  ],
  DOT: [
    { text: 'Poda! Swing and a miss!', sub: 'പോടാ! മിസ്സായി!' },
    { text: 'Fielder thaduthu! Dot ball.', sub: 'ഫീൽഡർ തടുത്തു!' },
  ],
};

function seededRandom(seed: number) {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function getCanalBankX(wy: number): number {
  return -218 + Math.sin(wy * 0.014) * 22 + Math.cos(wy * 0.008) * 14;
}

export function generateRandomBirdSprites(
  viewportWidth: number = 1280,
  viewportHeight: number = 720,
  initialScatter: boolean = false
): FlyingBirdSprite[] {
  const species: 'CROW' | 'HERON' = Math.random() < 0.52 ? 'HERON' : 'CROW';
  const direction: 1 | -1 = Math.random() < 0.5 ? 1 : -1;
  const count =
    species === 'HERON'
      ? 1 + Math.floor(Math.random() * 3)
      : 1 + Math.floor(Math.random() * 4);

  const baseX = initialScatter
    ? Math.random() * viewportWidth
    : direction === 1
    ? -50 - Math.random() * 40
    : viewportWidth + 50 + Math.random() * 40;

  const baseY =
    species === 'HERON'
      ? viewportHeight * (0.11 + Math.random() * 0.13)
      : viewportHeight * (0.05 + Math.random() * 0.16);

  const baseSpeed =
    species === 'HERON'
      ? 34 + Math.random() * 18
      : 48 + Math.random() * 26;

  const sprites: FlyingBirdSprite[] = [];
  for (let i = 0; i < count; i++) {
    const offsetX = -direction * i * (18 + Math.random() * 14);
    const offsetY = (i % 2 === 0 ? 1 : -1) * i * (7 + Math.random() * 6);
    sprites.push({
      species,
      x: baseX + offsetX,
      y: baseY + offsetY,
      vx: direction * (baseSpeed + (Math.random() - 0.5) * 6),
      vy: (Math.random() - 0.5) * 4,
      wingPhase: Math.random() * Math.PI * 2,
      flapSpeed: species === 'HERON' ? 5.8 + Math.random() * 1.8 : 9.5 + Math.random() * 2.5,
      size: species === 'HERON' ? 0.95 + Math.random() * 0.3 : 0.75 + Math.random() * 0.25,
      direction,
    });
  }
  return sprites;
}

// ============================================================================
// 5. MAIN GAME COMPONENT
// ============================================================================
export default function GullyKeralaGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const bgCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const bgDirtyRef = useRef<boolean>(true);

  // React UI state
  const [screen, setScreen] = useState<GameScreen>('TITLE');
  const [mode, setMode] = useState<GameMode>(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      if (p.get('room')) return 'MULTIPLAYER';
    }
    return 'QUICK';
  });
  const [overs, setOvers] = useState<number>(GAME_CONFIG.DEFAULT_OVERS);
  const [selectedRivalIdx, setSelectedRivalIdx] = useState<number>(0);
  const [selectedBatsmanId, setSelectedBatsmanId] = useState<string>('unni');
  const [unlockAllBatsmen, setUnlockAllBatsmen] = useState<boolean>(false);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('DAY');
  const [isMonsoon, setIsMonsoon] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [aimDir, setAimDir] = useState<AimDirection>(0);

  // ==========================================================================
  // TWO-DEVICE MULTIPLAYER STATE
  // ==========================================================================
  const [mpRole, setMpRole] = useState<MpRole>(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      if (p.get('room')) return 'GUEST';
    }
    return 'HOST';
  });
  const [p1Name, setP1Name] = useState<string>('Sunni (Device 1)');
  const [p2Name, setP2Name] = useState<string>('Maanu (Device 2)');
  const [p1Batsman, setP1Batsman] = useState<string>('unni');
  const [p2Batsman, setP2Batsman] = useState<string>('appu');

  // Network State
  const [roomCodeInput, setRoomCodeInput] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      const r = p.get('room');
      if (r) return r.toUpperCase();
    }
    return '';
  });
  const [activeRoomCode, setActiveRoomCode] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [pingMs, setPingMs] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [connError, setConnError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [disconnectAlert, setDisconnectAlert] = useState<boolean>(false);

  // Series score (best of 3 or cumulative)
  const [seriesScore, setSeriesScore] = useState<{ p1Wins: number; p2Wins: number }>({
    p1Wins: 0,
    p2Wins: 0,
  });

  // Toss State
  const [tossCaller, setTossCaller] = useState<'P1' | 'P2'>('P1');
  const [tossCallChoice, setTossCallChoice] = useState<'HEADS' | 'TAILS'>('HEADS');
  const [tossFlipping, setTossFlipping] = useState<boolean>(false);
  const [tossWinner, setTossWinner] = useState<'P1' | 'P2' | null>(null);
  const [tossDecision, setTossDecision] = useState<'BAT' | 'BOWL' | null>(null);

  // Innings & Match State
  const [currentInnings, setCurrentInnings] = useState<1 | 2>(1);
  const [isSuperOver, setIsSuperOver] = useState<boolean>(false);
  const [innings1Score, setInnings1Score] = useState<InningsScorecard | null>(null);
  const [innings2Score, setInnings2Score] = useState<InningsScorecard | null>(null);

  // Bowling Controls State (Human Bowler Choice on Bowling Device)
  const [bowlerChoiceTimer, setBowlerChoiceTimer] = useState<number>(3.0);
  const [bowlerVariation, setBowlerVariation] = useState<BowlingVariation>('FAST');
  const [bowlerLine, setBowlerLine] = useState<BowlingLine>('MIDDLE');
  const [bowlerLength, setBowlerLength] = useState<BowlingLength>('GOOD');
  const [isBowlerChoosing, setIsBowlerChoosing] = useState<boolean>(false);

  // Emotes State
  const [activeEmotes, setActiveEmotes] = useState<ActiveEmote[]>([]);
  const [emoteCooldown, setEmoteCooldown] = useState<boolean>(false);

  const netManagerRef = useRef<PeerNetworkManager | null>(null);
  const peerMessageHandlerRef = useRef<(msg: PeerMessage) => void>(() => {});
  const hostLobbyStateRef = useRef({
    p1Name,
    p2Name,
    p1Batsman,
    p2Batsman,
    overs,
    timeOfDay,
    isMonsoon,
    mpRole,
  });

  useEffect(() => {
    hostLobbyStateRef.current = {
      p1Name,
      p2Name,
      p1Batsman,
      p2Batsman,
      overs,
      timeOfDay,
      isMonsoon,
      mpRole,
    };
  }, [p1Name, p2Name, p1Batsman, p2Batsman, overs, timeOfDay, isMonsoon, mpRole]);

  // In-memory single-player progression
  const [sessionStats, setSessionStats] = useState({
    highScore: 0,
    matchesWon: 0,
    unlockedIds: ['unni'] as string[],
    tournamentStage: 0,
  });

  // Live HUD state
  const [hud, setHud] = useState({
    runs: 0,
    wickets: 0,
    balls: 0,
    totalBalls: GAME_CONFIG.DEFAULT_OVERS * 6,
    target: null as number | null,
    fours: 0,
    sixes: 0,
    bestShot: 'None yet',
    bowlerType: 'FAST' as BallType,
    popupText: '',
    popupSub: '',
    popupColor: '#D4AF37',
    lastBalls: [] as string[],
    matchResultTitle: '',
    matchWon: false,
    villageTitle: 'Padam Rookie',
    loserTitle: '',
    winnerName: '',
    loserName: '',
  });

  const palmsRef = useRef<PalmTree[]>([
    { wx: -185, wy: -255, height: 112, lean: -14, frondCount: 7, seed: 1 },
    { wx: -135, wy: -275, height: 96, lean: 10, frondCount: 6, seed: 2 },
    { wx: -65, wy: -285, height: 124, lean: -8, frondCount: 8, seed: 3 },
    { wx: 45, wy: -280, height: 105, lean: 12, frondCount: 7, seed: 4 },
    { wx: 125, wy: -270, height: 118, lean: -11, frondCount: 7, seed: 5 },
    { wx: 198, wy: -245, height: 92, lean: 15, frondCount: 6, seed: 6 },
    { wx: -205, wy: -135, height: 108, lean: 16, frondCount: 7, seed: 7 },
    { wx: 265, wy: -175, height: 116, lean: -14, frondCount: 7, seed: 8 },
    { wx: 285, wy: -25, height: 102, lean: -9, frondCount: 6, seed: 9 },
    { wx: -188, wy: 155, height: 120, lean: 12, frondCount: 7, seed: 10 },
    { wx: 255, wy: 165, height: 114, lean: -16, frondCount: 7, seed: 11 },
  ]);

  // Mutable simulation ref for 60fps loop
  const simRef = useRef({
    screen: 'TITLE' as GameScreen,
    mode: 'QUICK' as GameMode,
    mpRole: 'HOST' as MpRole,
    isLocalPlayerBatting: true,
    isLocalPlayerBowling: false,
    overs: GAME_CONFIG.DEFAULT_OVERS,
    rivalIdx: 0,
    batsmanId: 'unni',
    timeOfDay: 'DAY' as TimeOfDay,
    isMonsoon: false,
    aimDir: 0 as AimDirection,

    // Match tracking
    runs: 0,
    wickets: 0,
    balls: 0,
    totalBalls: 12,
    target: null as number | null,
    fours: 0,
    sixes: 0,
    bestShot: 'Classic Village Drive',
    lastBalls: [] as string[],

    // Innings & Multiplayer
    currentInnings: 1 as 1 | 2,
    isSuperOver: false,
    battingPlayerName: 'Sunni (Device 1)',
    bowlingPlayerName: 'Maanu (Device 2)',
    innings1Score: null as InningsScorecard | null,

    // Delivery & Physics
    phase: 'READY' as DeliveryPhase,
    phaseTimer: 1.2,
    ballType: 'FAST' as BallType,
    ballLine: 'MIDDLE' as BowlingLine,
    ballLength: 'GOOD' as BowlingLength,
    ballProgress: 0,
    ballSpeed: 0.65,
    ballSpinCurve: 0,
    swung: false,
    batSwingAnim: 0,

    ball: {
      x: 0,
      y: -125,
      z: 28,
      vx: 0,
      vy: 0,
      vz: 0,
      bounces: 0,
    },

    hitStopTimer: 0,
    shakeIntensity: 0,

    popupTimer: 0,
    popupText: '',
    popupSub: '',
    popupColor: '#D4AF37',

    // Human bowling choice countdown
    bowlerChoosing: false,
    bowlerTimer: 3.0,

    // Animated Entities
    boatY: -180,
    goat: { x: 168, y: -195, angle: 0, pauseTimer: 0 },
    dog: { x: -120, y: 165, vx: 16, vy: 5 },
    hens: [
      { x: 152, y: 142, phase: 0 },
      { x: 170, y: 154, phase: 2.1 },
      { x: 138, y: 158, phase: 4.2 },
    ],
    crows: [
      { x: 245, y: -102, hopPhase: 0, flying: 0 },
      { x: 268, y: -96, hopPhase: 1.8, flying: 0 },
    ],
    skyBirds: [
      ...generateRandomBirdSprites(1280, 720, true),
      ...generateRandomBirdSprites(1280, 720, true),
    ] as FlyingBirdSprite[],
    birdSpawnTimer: 3.5,
    grassFlutterTimer: 0,
    fielders: [] as Fielder[],
    particles: [] as Particle[],
    rain: [] as RainDrop[],
    waterRipples: [] as { x: number; y: number; r: number; alpha: number }[],
  });

  const initFielders = useCallback((): Fielder[] => {
    const spots = [
      { name: 'Kuttappan Uncle', x: -145, y: -45, lungi: '#1E88E5', shirt: '#FFF8E1', uncle: true },
      { name: 'Rajan Chettan', x: -125, y: 88, lungi: '#43A047', shirt: '#FFECB3', uncle: true },
      { name: 'Manu', x: -8, y: -210, lungi: '#FDFBF2', shirt: '#E53935', uncle: false },
      { name: 'Kannan', x: 148, y: -55, lungi: '#8E24AA', shirt: '#E1F5FE', uncle: false },
      { name: 'Dasan Uncle', x: 138, y: 72, lungi: '#F4511E', shirt: '#FDFBF2', uncle: true },
      { name: 'Babu', x: 75, y: -175, lungi: '#00897B', shirt: '#FFF9C4', uncle: false },
    ];
    return spots.map((s, idx) => ({
      id: idx,
      name: s.name,
      homeX: s.x,
      homeY: s.y,
      x: s.x,
      y: s.y,
      lungiColor: s.lungi,
      shirtColor: s.shirt,
      isUncle: s.uncle,
      animOffset: idx * 1.1,
    }));
  }, []);

  // Spawn dust puffs & boundary bursts
  const spawnParticles = (x: number, y: number, z: number, color: string, count = 14, speedScale = 1) => {
    const s = simRef.current;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
      const spd = (25 + Math.random() * 75) * speedScale;
      s.particles.push({
        x,
        y,
        z,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        vz: (45 + Math.random() * 90) * speedScale,
        color,
        size: 2.5 + Math.random() * 3,
        life: 0,
        maxLife: 0.45 + Math.random() * 0.35,
      });
    }
  };

  const triggerPopup = (list: { text: string; sub: string }[], color: string) => {
    const s = simRef.current;
    const item = list[Math.floor(Math.random() * list.length)];
    s.popupText = item.text;
    s.popupSub = item.sub;
    s.popupColor = color;
    s.popupTimer = 2.1;
  };

  const triggerEmote = useCallback(
    (emoteText: string, senderName: string, color: string) => {
      const id = `${Date.now()}-${Math.random()}`;
      const newEmote: ActiveEmote = {
        id,
        text: emoteText,
        sender: senderName,
        x: typeof window !== 'undefined' ? window.innerWidth * (0.35 + Math.random() * 0.3) : 300,
        y: typeof window !== 'undefined' ? window.innerHeight * 0.45 : 300,
        alpha: 1.0,
        color,
      };
      setActiveEmotes((prev) => [...prev.slice(-4), newEmote]);

      if (mode === 'MULTIPLAYER' && netManagerRef.current?.isConnected()) {
        netManagerRef.current.send({
          type: 'EMOTE',
          payload: { text: emoteText, sender: senderName, color },
        });
      }

      setEmoteCooldown(true);
      setTimeout(() => setEmoteCooldown(false), 3000);
    },
    [mode]
  );

  // Determine whose turn it is to bat / bowl across the two devices
  const isP1Batting =
    currentInnings === 1
      ? tossWinner === 'P1'
        ? tossDecision === 'BAT'
        : tossDecision === 'BOWL'
      : !(tossWinner === 'P1' ? tossDecision === 'BAT' : tossDecision === 'BOWL');
  const currentBattingName = isP1Batting ? p1Name : p2Name;
  const currentBowlingName = isP1Batting ? p2Name : p1Name;

  const isLocalPlayerBatting =
    mode !== 'MULTIPLAYER' || (mpRole === 'HOST' ? isP1Batting : !isP1Batting);
  const isLocalPlayerBowling =
    mode === 'MULTIPLAYER' && (mpRole === 'HOST' ? !isP1Batting : isP1Batting);

  // ==========================================================================
  // TWO-DEVICE MULTIPLAYER NETWORK SETUP
  // ==========================================================================
  useEffect(() => {
    const net = new PeerNetworkManager();
    netManagerRef.current = net;

    net.onConnected = () => {
      setIsConnected(true);
      setIsConnecting(false);
      setConnError(null);
      setDisconnectAlert(false);

      if (hostLobbyStateRef.current.mpRole === 'HOST') {
        net.send({
          type: 'LOBBY_STATE',
          payload: {
            p1Name: hostLobbyStateRef.current.p1Name,
            p2Name: hostLobbyStateRef.current.p2Name,
            p1Batsman: hostLobbyStateRef.current.p1Batsman,
            p2Batsman: hostLobbyStateRef.current.p2Batsman,
            overs: hostLobbyStateRef.current.overs,
            timeOfDay: hostLobbyStateRef.current.timeOfDay,
            isMonsoon: hostLobbyStateRef.current.isMonsoon,
          },
        });
      } else {
        net.send({
          type: 'GUEST_PROFILE',
          payload: {
            p2Name: hostLobbyStateRef.current.p2Name,
            p2Batsman: hostLobbyStateRef.current.p2Batsman,
          },
        });
      }
    };

    net.onDisconnected = (willWait) => {
      setIsConnected(false);
      if (willWait) {
        setDisconnectAlert(true);
      } else {
        setConnError('Other device disconnected.');
      }
    };

    net.onReconnected = () => {
      setIsConnected(true);
      setDisconnectAlert(false);
    };

    net.onPingUpdated = (ms) => {
      setPingMs(ms);
    };

    net.onError = (err) => {
      setConnError(err);
      setIsConnecting(false);
    };

    net.onMessage = (msg: PeerMessage) => {
      peerMessageHandlerRef.current(msg);
    };

    // Auto-join if ?room=CODE is present in URL on Device 2
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      const r = p.get('room');
      if (r && r.trim().length >= 4) {
        const cleanCode = r.trim().toUpperCase();
        setTimeout(() => {
          setActiveRoomCode(cleanCode);
          setIsConnecting(true);
          net.joinRoom(cleanCode);
        }, 120);
      }
    }

    return () => {
      net.cleanup();
    };
  }, []);

  // Update active emotes opacity decay
  useEffect(() => {
    if (activeEmotes.length === 0) return;
    const interval = setInterval(() => {
      setActiveEmotes((prev) =>
        prev
          .map((e) => ({ ...e, alpha: e.alpha - 0.04, y: e.y - 1.2 }))
          .filter((e) => e.alpha > 0)
      );
    }, 40);
    return () => clearInterval(interval);
  }, [activeEmotes]);

  // Host Room on Device 1
  const handleHostOnline = useCallback(async () => {
    setIsConnecting(true);
    setConnError(null);
    const code = PeerNetworkManager.generateRoomCode();
    setActiveRoomCode(code);
    setMpRole('HOST');
    const success = await netManagerRef.current?.hostRoom(code);
    setIsConnecting(false);
    if (!success) {
      setConnError('Could not create room. Please try again.');
    }
  }, []);

  // Join Room on Device 2
  const handleJoinOnline = useCallback(async () => {
    if (!roomCodeInput || roomCodeInput.trim().length < 4) {
      setConnError('Please enter the 4-letter room code from Device 1.');
      return;
    }
    setIsConnecting(true);
    setConnError(null);
    setMpRole('GUEST');
    const code = roomCodeInput.trim().toUpperCase();
    setActiveRoomCode(code);
    const success = await netManagerRef.current?.joinRoom(code);
    if (!success) {
      setIsConnecting(false);
    }
  }, [roomCodeInput]);

  const copyInviteLink = () => {
    if (typeof window === 'undefined' || !activeRoomCode) return;
    const link = `${window.location.origin}/?room=${activeRoomCode}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2200);
  };

  // ==========================================================================
  // COIN TOSS LOGIC (TWO-DEVICE SYNCED)
  // ==========================================================================
  const startToss = useCallback(
    (broadcast: boolean = true) => {
      setScreen('TOSS');
      simRef.current.screen = 'TOSS';
      setTossFlipping(false);
      setTossWinner(null);
      setTossDecision(null);

      if (broadcast && mode === 'MULTIPLAYER' && netManagerRef.current?.isConnected()) {
        netManagerRef.current.send({
          type: 'TOSS_INIT',
          payload: {
            caller: tossCaller,
            p1Name,
            p2Name,
            p1Batsman,
            p2Batsman,
            overs,
          },
        });
      }
    },
    [mode, overs, p1Batsman, p1Name, p2Batsman, p2Name, tossCaller]
  );

  const flipCoin = () => {
    audio.playCoinToss();
    setTossFlipping(true);
    const resultSide: 'HEADS' | 'TAILS' = Math.random() < 0.5 ? 'HEADS' : 'TAILS';
    const won = tossCallChoice === resultSide;
    const winner: 'P1' | 'P2' = won ? tossCaller : tossCaller === 'P1' ? 'P2' : 'P1';

    if (mode === 'MULTIPLAYER') {
      netManagerRef.current?.send({
        type: 'TOSS_START',
        payload: { winner, coinSide: resultSide, callChoice: tossCallChoice },
      });
    }

    setTimeout(() => {
      setTossFlipping(false);
      setTossWinner(winner);
    }, 1500);
  };

  const handleTossResultFromPeer = (
    winner: 'P1' | 'P2',
    _coinSide: 'HEADS' | 'TAILS',
    callChoice?: 'HEADS' | 'TAILS'
  ) => {
    audio.playCoinToss();
    if (callChoice) setTossCallChoice(callChoice);
    setScreen('TOSS');
    simRef.current.screen = 'TOSS';
    setTossFlipping(true);
    setTimeout(() => {
      setTossFlipping(false);
      setTossWinner(winner);
    }, 1400);
  };

  const makeTossDecision = (decision: 'BAT' | 'BOWL') => {
    setTossDecision(decision);

    if (mode === 'MULTIPLAYER') {
      netManagerRef.current?.send({
        type: 'TOSS_DECISION',
        payload: { decision },
      });
    }

    setTimeout(() => {
      startInnings(1, false, decision);
    }, 900);
  };

  // ==========================================================================
  // HUMAN BOWLING & DELIVERY RESOLUTION (TWO-DEVICE)
  // ==========================================================================
  const triggerBowlerChoiceWindow = useCallback(() => {
    const s = simRef.current;
    s.bowlerChoosing = true;
    s.bowlerTimer = 3.0;
    setIsBowlerChoosing(true);
    setBowlerChoiceTimer(3.0);
  }, []);

  const applyBowlingChoice = useCallback((choice: BowlingDeliveryChoice) => {
    const s = simRef.current;
    s.bowlerChoosing = false;
    setIsBowlerChoosing(false);

    s.ballType = choice.variation;
    s.ballLine = choice.line;
    s.ballLength = choice.length;

    // Delivery formulation
    const speedMult =
      choice.variation === 'FAST'
        ? 1.25
        : choice.variation === 'SLOWER'
        ? 0.74
        : choice.variation === 'BOUNCER'
        ? 1.15
        : 0.94;

    s.ballSpeed = GAME_CONFIG.DIFFICULTY.BASE_BALL_SPEED * speedMult;
    s.ballSpinCurve =
      choice.variation === 'SPIN'
        ? choice.line === 'OFF'
          ? -26
          : 26
        : 0;

    // Reset fielders to home positions and start run-up
    s.fielders.forEach((f) => {
      f.x = f.homeX;
      f.y = f.homeY;
    });
    s.phase = 'RUNUP';
    s.phaseTimer = 1.0;
    s.ballProgress = 0;
    s.swung = false;
  }, []);

  const confirmBowlingDelivery = useCallback(
    (customVar?: BowlingVariation, customLine?: BowlingLine, customLen?: BowlingLength) => {
      const v = customVar || bowlerVariation;
      const l = customLine || bowlerLine;
      const len = customLen || bowlerLength;

      const choice: BowlingDeliveryChoice = {
        variation: v,
        line: l,
        length: len,
        timestamp: Date.now(),
      };

      if (simRef.current.mode === 'MULTIPLAYER') {
        netManagerRef.current?.send({
          type: 'BOWLING_CHOICE',
          payload: choice,
        });
      }

      applyBowlingChoice(choice);
    },
    [applyBowlingChoice, bowlerLength, bowlerLine, bowlerVariation]
  );

  // ==========================================================================
  // START INNINGS & MATCH FLOW
  // ==========================================================================
  const startInnings = useCallback(
    (inningsNum: 1 | 2, superOver: boolean = false, overrideDecision?: 'BAT' | 'BOWL') => {
      audio.init();
      const s = simRef.current;
      const activeDecision = overrideDecision || tossDecision || 'BAT';

      const totalBalls = superOver ? 1 : overs * 6;
      setCurrentInnings(inningsNum);
      setIsSuperOver(superOver);

      s.screen = 'PLAYING';
      s.currentInnings = inningsNum;
      s.isSuperOver = superOver;
      s.mode = mode;
      s.mpRole = mpRole;
      s.overs = overs;
      s.runs = 0;
      s.wickets = 0;
      s.balls = 0;
      s.totalBalls = totalBalls;
      s.fours = 0;
      s.sixes = 0;
      s.bestShot = 'None yet';
      s.lastBalls = [];
      s.fielders = initFielders();
      s.particles = [];
      s.waterRipples = [];

      const targetRuns =
        inningsNum === 2 && s.innings1Score !== null
          ? s.innings1Score.runs + 1
          : null;
      s.target = targetRuns;

      // Assign current batter & bowler names and traits
      const p1Bats =
        inningsNum === 1
          ? tossWinner === 'P1'
            ? activeDecision === 'BAT'
            : activeDecision === 'BOWL'
          : !(tossWinner === 'P1' ? activeDecision === 'BAT' : activeDecision === 'BOWL');

      s.battingPlayerName = p1Bats ? p1Name : p2Name;
      s.bowlingPlayerName = p1Bats ? p2Name : p1Name;
      s.batsmanId = p1Bats ? p1Batsman : p2Batsman;
      s.isLocalPlayerBatting =
        mode !== 'MULTIPLAYER' || (mpRole === 'HOST' ? p1Bats : !p1Bats);
      s.isLocalPlayerBowling =
        mode === 'MULTIPLAYER' && (mpRole === 'HOST' ? !p1Bats : p1Bats);

      setScreen('PLAYING');
      setHud({
        runs: 0,
        wickets: 0,
        balls: 0,
        totalBalls,
        target: targetRuns,
        fours: 0,
        sixes: 0,
        bestShot: 'None yet',
        bowlerType: 'FAST',
        popupText: superOver
          ? 'Super Over! 1 Ball Each!'
          : inningsNum === 1
          ? 'Innings 1 Begins!'
          : `Target: ${targetRuns} Runs!`,
        popupSub: `${s.battingPlayerName} is Batting`,
        popupColor: '#D4AF37',
        lastBalls: [],
        matchResultTitle: '',
        matchWon: false,
        villageTitle: 'Padam Contender',
        loserTitle: '',
        winnerName: '',
        loserName: '',
      });

      triggerPopup(
        [
          {
            text: superOver
              ? 'Super Over! 1 Ball Thriller!'
              : inningsNum === 1
              ? 'Innings 1! Set the Target!'
              : `Chase On! Need ${targetRuns} Runs!`,
            sub: `${s.battingPlayerName} to Bat!`,
          },
        ],
        '#D4AF37'
      );

      // Start human bowling selection if multiplayer, else AI bowler
      if (mode === 'MULTIPLAYER') {
        triggerBowlerChoiceWindow();
      } else {
        s.phase = 'RUNUP';
        s.phaseTimer = 1.0;
        s.ballType = 'FAST';
        s.ballProgress = 0;
        s.swung = false;
      }
    },
    [initFielders, mode, mpRole, overs, p1Batsman, p1Name, p2Batsman, p2Name, tossDecision, tossWinner, triggerBowlerChoiceWindow]
  );

  const startMatch = useCallback(
    (customMode?: GameMode) => {
      const activeMode = customMode || mode;
      if (activeMode === 'MULTIPLAYER') {
        startToss(true);
      } else {
        // Single player standard match
        audio.init();
        const s = simRef.current;
        s.screen = 'PLAYING';
        s.mode = activeMode;
        s.isLocalPlayerBatting = true;
        s.isLocalPlayerBowling = false;
        s.overs = overs;
        s.rivalIdx = selectedRivalIdx;
        s.batsmanId = selectedBatsmanId;
        s.runs = 0;
        s.wickets = 0;
        s.balls = 0;
        s.totalBalls = overs * 6;
        s.target = activeMode === 'QUICK' ? null : Math.round(overs * (GAME_CONFIG.RIVALS[selectedRivalIdx]?.runsPerOver || 12));
        s.fours = 0;
        s.sixes = 0;
        s.bestShot = 'Classic Village Drive';
        s.lastBalls = [];
        s.fielders = initFielders();
        s.particles = [];
        s.waterRipples = [];

        s.phase = 'RUNUP';
        s.phaseTimer = 1.0;
        s.ballType = 'FAST';
        s.ballProgress = 0;
        s.swung = false;

        setScreen('PLAYING');
        setHud({
          runs: 0,
          wickets: 0,
          balls: 0,
          totalBalls: overs * 6,
          target: s.target,
          fours: 0,
          sixes: 0,
          bestShot: 'None yet',
          bowlerType: s.ballType,
          popupText: 'Kali Thudangam! Play Ball!',
          popupSub: 'കളി തുടങ്ങാം!',
          popupColor: '#D4AF37',
          lastBalls: [],
          matchResultTitle: '',
          matchWon: false,
          villageTitle: 'Padam Contender',
          loserTitle: '',
          winnerName: '',
          loserName: '',
        });
      }
    },
    [initFielders, mode, overs, selectedBatsmanId, selectedRivalIdx, startToss]
  );

  // Multiplayer Innings End Handler
  const handleMultiplayerInningsEnd = useCallback(() => {
    const s = simRef.current;
    const currentScorecard: InningsScorecard = {
      battingPlayer: s.battingPlayerName,
      bowlingPlayer: s.bowlingPlayerName,
      runs: s.runs,
      wickets: s.wickets,
      balls: s.balls,
      totalBalls: s.totalBalls,
      fours: s.fours,
      sixes: s.sixes,
      bestShot: s.bestShot,
      lastBalls: s.lastBalls,
    };

    if (s.currentInnings === 1 && !s.isSuperOver) {
      // Innings 1 Complete -> Go to Innings Break
      s.innings1Score = currentScorecard;
      setInnings1Score(currentScorecard);
      s.screen = 'INNINGS_BREAK';
      setScreen('INNINGS_BREAK');
    } else {
      // Innings 2 Complete or Super Over complete -> Resolve Winner
      setInnings2Score(currentScorecard);
      const inn1 = s.innings1Score!;
      const inn2 = currentScorecard;

      if (inn2.runs === inn1.runs) {
        // TIE -> One-ball Super Over!
        triggerPopup([{ text: 'MATCH TIED! SUPER OVER!', sub: 'സമനില! സൂപ്പർ ഓവർ!' }], '#FACC15');
        setTimeout(() => {
          startInnings(1, true);
        }, 1800);
        return;
      }

      const p2Won = inn2.runs >= inn1.runs + 1;
      const winnerName = p2Won ? inn2.battingPlayer : inn1.battingPlayer;
      const loserName = p2Won ? inn1.battingPlayer : inn2.battingPlayer;

      const vTitle = p2Won ? 'Padam King (പാടം രാജാവ്)' : 'Chayakada Champion (ചായക്കട ചാമ്പ്യൻ)';
      const lTitle = 'Kayalil Poyi Award (കായലിൽ പോയി അവാർഡ്)';

      // Update series score
      setSeriesScore((prev) => {
        const p1WonMatch = winnerName === p1Name;
        return {
          p1Wins: prev.p1Wins + (p1WonMatch ? 1 : 0),
          p2Wins: prev.p2Wins + (p1WonMatch ? 0 : 1),
        };
      });

      s.screen = 'SUMMARY';
      setScreen('SUMMARY');
      setHud((prev) => ({
        ...prev,
        matchResultTitle: `${winnerName} Wins the Match!`,
        winnerName,
        loserName,
        villageTitle: vTitle,
        loserTitle: lTitle,
      }));
    }
  }, [p1Name, startInnings]);

  // Delivery Outcome Resolution (Synced across Both Devices)
  const resolveDeliveryOutcome = useCallback(
    (
      runsScored: number,
      isOut: boolean,
      badge: string,
      shotDesc?: string,
      fromNetwork: boolean = false,
      targetBallNumber?: number
    ) => {
      const s = simRef.current;

      // Guard against duplicate outcome resolution for the same delivery
      if (targetBallNumber !== undefined && s.balls >= targetBallNumber) {
        return;
      }

      s.runs += runsScored;
      if (isOut) s.wickets += 1;
      s.balls += 1;
      if (runsScored === 4) s.fours += 1;
      if (runsScored >= 6) s.sixes += 1;
      if (shotDesc) s.bestShot = shotDesc;
      s.lastBalls = [...s.lastBalls.slice(-7), badge];

      // Broadcast authoritative ball outcome to peer device
      if (s.mode === 'MULTIPLAYER' && !fromNetwork) {
        netManagerRef.current?.send({
          type: 'BALL_RESULT',
          payload: {
            ballNumber: s.balls,
            runsScored,
            isOut,
            badge,
            shotDesc,
            popupText: s.popupText,
            popupSub: s.popupSub,
            popupColor: s.popupColor,
          },
        });
      }

      // Check Innings End
      const chasedTarget = s.target !== null && s.runs >= s.target;
      const allOut = s.wickets >= GAME_CONFIG.MAX_WICKETS;
      const oversDone = s.balls >= s.totalBalls;

      if (chasedTarget || allOut || oversDone) {
        if (s.mode === 'MULTIPLAYER') {
          handleMultiplayerInningsEnd();
        } else {
          // Single player match complete
          const won = s.target === null ? s.runs >= s.overs * 10 : s.runs >= s.target;
          s.screen = 'SUMMARY';
          setScreen('SUMMARY');
          setHud((prev) => ({
            ...prev,
            runs: s.runs,
            wickets: s.wickets,
            balls: s.balls,
            fours: s.fours,
            sixes: s.sixes,
            bestShot: s.bestShot,
            matchResultTitle: won ? 'Adipoli Victory!' : 'Fallen Short!',
            matchWon: won,
            villageTitle: s.runs > 35 ? 'Padam King (പാടം രാജാവ്)' : 'Chayakada Champion',
          }));
        }
        return;
      }

      // Prepare next ball
      if (s.mode === 'MULTIPLAYER') {
        triggerBowlerChoiceWindow();
      } else {
        s.phase = 'RUNUP';
        s.phaseTimer = 1.1;
        s.ballType = (['FAST', 'SPIN', 'SLOWER', 'BOUNCER'] as BallType[])[Math.floor(Math.random() * 4)];
        s.ballProgress = 0;
        s.swung = false;
        s.fielders.forEach((f) => {
          f.x = f.homeX;
          f.y = f.homeY;
        });
      }

      setHud((prev) => ({
        ...prev,
        runs: s.runs,
        wickets: s.wickets,
        balls: s.balls,
        fours: s.fours,
        sixes: s.sixes,
        bestShot: s.bestShot,
        bowlerType: s.ballType,
        popupText: s.popupText,
        popupSub: s.popupSub,
        popupColor: s.popupColor,
        lastBalls: s.lastBalls,
      }));
    },
    [handleMultiplayerInningsEnd, triggerBowlerChoiceWindow]
  );

  const startRematch = () => {
    setTossCaller((prev) => (prev === 'P1' ? 'P2' : 'P1'));
    if (netManagerRef.current?.isConnected()) {
      netManagerRef.current.send({ type: 'REMATCH' });
    }
    startToss(false);
  };

  // Deterministic Batter Swing Execution (Identical Trajectory on Both Devices)
  const executeSwingAction = useCallback(
    (dir: AimDirection, overrideProgress?: number, deterministicSeed?: number) => {
      const s = simRef.current;
      if (s.screen !== 'PLAYING') return;
      if (s.swung) return;

      if (overrideProgress !== undefined) {
        s.phase = 'BOWLING';
        s.ballProgress = overrideProgress;
      } else if (s.phase !== 'BOWLING') {
        return;
      }

      s.swung = true;
      s.batSwingAnim = 1.0;

      const r1 = deterministicSeed !== undefined ? deterministicSeed : Math.random();
      const r2 = ((r1 * 9301 + 49297) % 233280) / 233280;
      const r3 = ((r2 * 9301 + 49297) % 233280) / 233280;

      const batsman = GAME_CONFIG.BATSMEN.find((b) => b.id === s.batsmanId) || GAME_CONFIG.BATSMEN[0];
      const delta = s.ballProgress - GAME_CONFIG.DIFFICULTY.SWEET_SPOT;
      const absDelta = Math.abs(delta);

      const perfWin = GAME_CONFIG.DIFFICULTY.PERFECT_WINDOW * batsman.timingMult;
      const goodWin = GAME_CONFIG.DIFFICULTY.GOOD_WINDOW * batsman.timingMult;
      const edgeWin = GAME_CONFIG.DIFFICULTY.EDGE_WINDOW * batsman.timingMult;

      const baseAngle =
        dir === -1
          ? -Math.PI * 0.76
          : dir === 1
          ? -Math.PI * 0.24
          : -Math.PI * 0.5;

      const timingSkew = delta * 1.9;
      const shotAngle = baseAngle + timingSkew;
      const isLuckyMiracle = absDelta <= edgeWin && absDelta > perfWin && r1 < batsman.luckyChance;

      if (absDelta <= perfWin || isLuckyMiracle) {
        audio.playBatHit('PERFECT');
        s.hitStopTimer = 0.055;
        s.shakeIntensity = 8;
        s.phase = 'HIT_FLIGHT';

        const power = (285 + r2 * 55) * batsman.powerMult;
        s.ball.vx = Math.cos(shotAngle) * power;
        s.ball.vy = Math.sin(shotAngle) * power;
        s.ball.vz = 195 + r3 * 45;
        s.ball.bounces = 0;

        spawnParticles(s.ball.x, s.ball.y, 20, '#D4AF37', 20, 1.1);
      } else if (absDelta <= goodWin) {
        audio.playBatHit('GOOD');
        s.hitStopTimer = 0.025;
        s.shakeIntensity = 3.5;
        s.phase = 'HIT_FLIGHT';

        const power = (185 + r2 * 45) * batsman.powerMult;
        s.ball.vx = Math.cos(shotAngle) * power;
        s.ball.vy = Math.sin(shotAngle) * power;
        s.ball.vz = 85 + r3 * 55;
        s.ball.bounces = 0;

        spawnParticles(s.ball.x, s.ball.y, 16, '#D6D3D1', 10, 0.8);
      } else if (absDelta <= edgeWin) {
        audio.playBatHit('EDGE');
        s.phase = 'HIT_FLIGHT';

        const edgeAngle = -Math.PI * (0.25 + r1 * 0.5);
        const power = 110 + r2 * 55;
        s.ball.vx = Math.cos(edgeAngle) * power;
        s.ball.vy = Math.sin(edgeAngle) * power;
        s.ball.vz = 155 + r3 * 40;
        s.ball.bounces = 0;
      } else {
        audio.playBatHit('MISS');
      }
    },
    []
  );

  const handleSwing = useCallback(() => {
    if (!isLocalPlayerBatting) return;
    const s = simRef.current;
    if (s.phase !== 'BOWLING' || s.swung) return;

    const swingProgress = s.ballProgress;
    const seed = Math.random();
    executeSwingAction(s.aimDir, swingProgress, seed);

    if (mode === 'MULTIPLAYER') {
      netManagerRef.current?.send({
        type: 'BATTER_SWING',
        payload: { dir: s.aimDir, ballProgress: swingProgress, seed },
      });
    }
  }, [executeSwingAction, isLocalPlayerBatting, mode]);

  // Sync latest message handler dynamically
  useEffect(() => {
    peerMessageHandlerRef.current = (msg: PeerMessage) => {
      if (msg.type === 'LOBBY_STATE') {
        const d = msg.payload;
        if (d.p1Name) setP1Name(d.p1Name);
        if (d.p1Batsman) setP1Batsman(d.p1Batsman);
        if (d.overs) setOvers(d.overs);
        if (d.timeOfDay) setTimeOfDay(d.timeOfDay);
        if (typeof d.isMonsoon === 'boolean') setIsMonsoon(d.isMonsoon);
      } else if (msg.type === 'GUEST_PROFILE') {
        const d = msg.payload;
        if (d.p2Name) setP2Name(d.p2Name);
        if (d.p2Batsman) setP2Batsman(d.p2Batsman);
      } else if (msg.type === 'TOSS_INIT') {
        const d = msg.payload;
        if (d.caller) setTossCaller(d.caller);
        if (d.p1Name) setP1Name(d.p1Name);
        if (d.p2Name) setP2Name(d.p2Name);
        if (d.p1Batsman) setP1Batsman(d.p1Batsman);
        if (d.p2Batsman) setP2Batsman(d.p2Batsman);
        if (d.overs) setOvers(d.overs);
        startToss(false);
      } else if (msg.type === 'TOSS_START') {
        handleTossResultFromPeer(
          msg.payload.winner,
          msg.payload.coinSide,
          msg.payload.callChoice
        );
      } else if (msg.type === 'TOSS_DECISION') {
        setTossDecision(msg.payload.decision);
        setTimeout(() => startInnings(1, false, msg.payload.decision), 900);
      } else if (msg.type === 'BOWLING_CHOICE') {
        applyBowlingChoice(msg.payload);
      } else if (msg.type === 'BATTER_SWING') {
        executeSwingAction(
          msg.payload.dir,
          msg.payload.ballProgress,
          msg.payload.seed
        );
      } else if (msg.type === 'BALL_RESULT') {
        const d = msg.payload;
        if (d.popupText) {
          simRef.current.popupText = d.popupText;
          simRef.current.popupSub = d.popupSub || '';
          simRef.current.popupColor = d.popupColor || '#D4AF37';
          simRef.current.popupTimer = 2.0;
        }
        resolveDeliveryOutcome(
          d.runsScored,
          d.isOut,
          d.badge,
          d.shotDesc,
          true,
          d.ballNumber
        );
      } else if (msg.type === 'START_INNINGS_2') {
        startInnings(2);
      } else if (msg.type === 'EMOTE') {
        const { text, sender, color } = msg.payload;
        setActiveEmotes((prev) => [
          ...prev.slice(-4),
          {
            id: `${Date.now()}-${Math.random()}`,
            text,
            sender,
            x: window.innerWidth * (0.35 + Math.random() * 0.3),
            y: window.innerHeight * 0.45,
            alpha: 1.0,
            color: color || '#EAB308',
          },
        ]);
      } else if (msg.type === 'REMATCH') {
        setTossCaller((prev) => (prev === 'P1' ? 'P2' : 'P1'));
        startToss(false);
      }
    };
  });

  // Keyboard Listeners
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        simRef.current.aimDir = -1;
        setAimDir(-1);
      } else if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'ArrowDown' || e.code === 'KeyS') {
        simRef.current.aimDir = 0;
        setAimDir(0);
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        simRef.current.aimDir = 1;
        setAimDir(1);
      } else if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        if (simRef.current.screen === 'TITLE') {
          startMatch();
        } else if (simRef.current.screen === 'PLAYING') {
          handleSwing();
        } else if (simRef.current.screen === 'SUMMARY') {
          startMatch();
        }
      } else if (e.code === 'KeyM') {
        audio.muted = !audio.muted;
        setIsMuted(audio.muted);
      } else if (e.code === 'Escape' || e.code === 'KeyP') {
        if (simRef.current.screen === 'PLAYING') {
          simRef.current.screen = 'PAUSED';
          setScreen('PAUSED');
        } else if (simRef.current.screen === 'PAUSED') {
          simRef.current.screen = 'PLAYING';
          setScreen('PLAYING');
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleSwing, startMatch]);

  // Sync state into simRef
  useEffect(() => {
    simRef.current.timeOfDay = timeOfDay;
    simRef.current.isMonsoon = isMonsoon;
    simRef.current.batsmanId = selectedBatsmanId;
    simRef.current.mode = mode;
    simRef.current.mpRole = mpRole;
    simRef.current.isLocalPlayerBatting = isLocalPlayerBatting;
    simRef.current.isLocalPlayerBowling = isLocalPlayerBowling;
    simRef.current.overs = overs;
    simRef.current.rivalIdx = selectedRivalIdx;
    bgDirtyRef.current = true;

    if (isMonsoon && simRef.current.rain.length === 0) {
      const drops: RainDrop[] = [];
      for (let i = 0; i < 120; i++) {
        drops.push({
          x: Math.random() * 1800,
          y: Math.random() * 1100,
          len: 15 + Math.random() * 15,
          speed: 580 + Math.random() * 240,
        });
      }
      simRef.current.rain = drops;
    }
  }, [timeOfDay, isMonsoon, selectedBatsmanId, mode, mpRole, isLocalPlayerBatting, isLocalPlayerBowling, overs, selectedRivalIdx]);

  // ==========================================================================
  // OFFSCREEN STATIC ENVIRONMENT RENDERER (BLITTED FOR 60FPS)
  // ==========================================================================
  const renderStaticEnvironment = useCallback((W: number, H: number) => {
    if (!bgCanvasRef.current) {
      bgCanvasRef.current = document.createElement('canvas');
    }
    const bgCanvas = bgCanvasRef.current;
    bgCanvas.width = W;
    bgCanvas.height = H;
    const ctx = bgCanvas.getContext('2d');
    if (!ctx) return;

    const s = simRef.current;
    const palette = s.isMonsoon
      ? GAME_CONFIG.COLORS.MONSOON
      : s.timeOfDay === 'EVENING'
      ? GAME_CONFIG.COLORS.EVENING
      : GAME_CONFIG.COLORS.DAY;

    const scale = Math.min(W / 900, H / 640);
    const cx = W * 0.51;
    const cy = H * 0.57;

    const toScreen = (wx: number, wy: number, wz: number = 0) => {
      const depthFactor = 1 + wy * 0.00055;
      const rx = wx * depthFactor;
      const ry = wy * 0.78 - wz * 0.92;
      return {
        x: cx + rx * scale,
        y: cy + ry * scale,
      };
    };

    // Sky & Western Ghats Foothills
    const skyGrad = ctx.createLinearGradient(0, 0, 0, H * 0.34);
    skyGrad.addColorStop(0, palette.skyTop);
    skyGrad.addColorStop(0.55, palette.skyMid);
    skyGrad.addColorStop(1, palette.skyHorizon);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, H * 0.35);

    if (!s.isMonsoon) {
      const sunX = W * (s.timeOfDay === 'EVENING' ? 0.25 : 0.78);
      const sunY = H * 0.16;
      const sunGrad = ctx.createRadialGradient(sunX, sunY, 4 * scale, sunX, sunY, 95 * scale);
      sunGrad.addColorStop(0, s.timeOfDay === 'EVENING' ? 'rgba(253, 186, 116, 0.85)' : 'rgba(254, 249, 195, 0.85)');
      sunGrad.addColorStop(1, 'rgba(254, 249, 195, 0)');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(sunX, sunY, 95 * scale, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = palette.distantHills;
    ctx.beginPath();
    ctx.moveTo(0, H * 0.24);
    ctx.bezierCurveTo(W * 0.18, H * 0.14, W * 0.36, H * 0.21, W * 0.54, H * 0.16);
    ctx.bezierCurveTo(W * 0.72, H * 0.11, W * 0.88, H * 0.19, W, H * 0.15);
    ctx.lineTo(W, H * 0.36);
    ctx.lineTo(0, H * 0.36);
    ctx.closePath();
    ctx.fill();

    const mistGrad = ctx.createLinearGradient(0, H * 0.18, 0, H * 0.28);
    mistGrad.addColorStop(0, 'rgba(254, 243, 199, 0)');
    mistGrad.addColorStop(0.5, s.isMonsoon ? 'rgba(203, 213, 225, 0.28)' : 'rgba(254, 243, 199, 0.26)');
    mistGrad.addColorStop(1, 'rgba(254, 243, 199, 0)');
    ctx.fillStyle = mistGrad;
    ctx.fillRect(0, H * 0.17, W, H * 0.12);

    ctx.fillStyle = palette.midHills;
    ctx.beginPath();
    ctx.moveTo(0, H * 0.26);
    ctx.quadraticCurveTo(W * 0.28, H * 0.2, W * 0.55, H * 0.25);
    ctx.quadraticCurveTo(W * 0.82, H * 0.21, W, H * 0.26);
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = s.timeOfDay === 'EVENING' ? '#142214' : '#264015';
    for (let i = 0; i < 38; i++) {
      const tx = (i / 37) * W;
      const ty = H * (0.235 + Math.sin(i * 0.7) * 0.012);
      const r = (10 + (i % 4) * 4) * scale;
      ctx.beginPath();
      ctx.arc(tx, ty, r, Math.PI, 0);
      ctx.fill();
    }

    // Harvested Paddy Ground & Noise Patches
    ctx.fillStyle = palette.padamBase;
    ctx.fillRect(0, H * 0.24, W, H * 0.76);

    const padamPoly = [
      [-210, -250],
      [-85, -275],
      [65, -268],
      [185, -238],
      [248, -145],
      [262, -20],
      [238, 115],
      [175, 205],
      [45, 235],
      [-115, 222],
      [-195, 145],
      [-218, 15],
      [-208, -125],
    ];

    ctx.save();
    ctx.beginPath();
    padamPoly.forEach(([px, py], idx) => {
      const pt = toScreen(px, py, 0);
      if (idx === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    ctx.closePath();
    ctx.fillStyle = palette.padamDry;
    ctx.fill();
    ctx.clip();

    const patchColors = [
      palette.padamGreen,
      palette.padamBase,
      palette.padamSoil,
      '#5F6F3A',
      '#786B4D',
      '#4B5828',
    ];
    for (let i = 0; i < 240; i++) {
      const rx = (seededRandom(i * 3.1) - 0.5) * 520;
      const ry = (seededRandom(i * 7.3) - 0.5) * 520;
      const rw = (18 + seededRandom(i * 11.7) * 55) * scale;
      const rh = (10 + seededRandom(i * 17.9) * 28) * scale;
      const angle = seededRandom(i * 5.5) * Math.PI;
      const pt = toScreen(rx, ry, 0);

      ctx.save();
      ctx.translate(pt.x, pt.y);
      ctx.rotate(angle);
      ctx.fillStyle = patchColors[i % patchColors.length];
      ctx.globalAlpha = 0.35 + seededRandom(i * 2.3) * 0.35;
      ctx.beginPath();
      ctx.ellipse(0, 0, rw, rh, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Bare soil patches
    const wornSpots = [
      { x: 0, y: -130, r: 36 },
      { x: 0, y: 108, r: 42 },
      { x: -145, y: -45, r: 26 },
      { x: -125, y: 88, r: 24 },
      { x: -8, y: -210, r: 28 },
      { x: 148, y: -55, r: 25 },
      { x: 138, y: 72, r: 25 },
      { x: 75, y: -175, r: 24 },
    ];
    wornSpots.forEach((ws) => {
      const wp = toScreen(ws.x, ws.y, 0);
      const rad = ws.r * scale;
      const wornGrad = ctx.createRadialGradient(wp.x, wp.y, rad * 0.15, wp.x, wp.y, rad);
      wornGrad.addColorStop(0, s.isMonsoon ? '#4A3728' : '#9C8265');
      wornGrad.addColorStop(0.7, s.isMonsoon ? 'rgba(74,55,40,0.5)' : 'rgba(156,130,101,0.45)');
      wornGrad.addColorStop(1, 'rgba(156,130,101,0)');
      ctx.fillStyle = wornGrad;
      ctx.beginPath();
      ctx.ellipse(wp.x, wp.y, rad * 1.15, rad * 0.82, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    // Stubble tufts
    for (let i = 0; i < 320; i++) {
      const sx = (seededRandom(i * 31.3) - 0.5) * 460;
      const sy = (seededRandom(i * 41.9) - 0.5) * 460;
      if (Math.abs(sx) < 28 && sy > -140 && sy < 130) continue;
      const sp = toScreen(sx, sy, 0);
      ctx.strokeStyle = i % 3 === 0 ? '#A3A847' : i % 2 === 0 ? '#6B7F32' : '#8C7A4B';
      ctx.lineWidth = 1.2 * scale;
      ctx.beginPath();
      ctx.moveTo(sp.x, sp.y);
      ctx.lineTo(sp.x - 2 * scale, sp.y - 4.5 * scale);
      ctx.moveTo(sp.x, sp.y);
      ctx.lineTo(sp.x + 2 * scale, sp.y - 4 * scale);
      ctx.stroke();
    }
    ctx.restore();

    // Natural Varambu Bund
    const bundPoints = [
      [-195, -245],
      [-75, -270],
      [65, -265],
      [185, -232],
      [248, -140],
    ];
    ctx.strokeStyle = palette.bundMud;
    ctx.lineWidth = 14 * scale;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    bundPoints.forEach(([bx, by], i) => {
      const bp = toScreen(bx, by, 0);
      if (i === 0) ctx.moveTo(bp.x, bp.y);
      else ctx.lineTo(bp.x, bp.y);
    });
    ctx.stroke();

    // Winding Canal
    ctx.save();
    ctx.beginPath();
    for (let wy = -330; wy <= 320; wy += 20) {
      const bankX = getCanalBankX(wy);
      const pt = toScreen(bankX, wy, 0);
      if (wy === -330) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    }
    for (let wy = 320; wy >= -330; wy -= 20) {
      const outerX = getCanalBankX(wy) - 105;
      const pt = toScreen(outerX, wy, 0);
      ctx.lineTo(pt.x, pt.y);
    }
    ctx.closePath();
    ctx.fillStyle = palette.canalWater;
    ctx.fill();
    ctx.restore();

    // Canal Bank
    ctx.strokeStyle = palette.canalBank;
    ctx.lineWidth = 8 * scale;
    ctx.beginPath();
    for (let wy = -330; wy <= 320; wy += 18) {
      const bankX = getCanalBankX(wy);
      const pt = toScreen(bankX, wy, 0);
      if (wy === -330) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    }
    ctx.stroke();

    // Compacted Laterite Pitch
    ctx.save();
    ctx.beginPath();
    const pitchLeftPoints = [
      [-16, -135],
      [-18, -60],
      [-17, 20],
      [-19, 118],
    ];
    const pitchRightPoints = [
      [19, 118],
      [17, 25],
      [18, -55],
      [16, -135],
    ];
    pitchLeftPoints.forEach(([px, py], i) => {
      const pt = toScreen(px, py, 0);
      if (i === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    pitchRightPoints.forEach(([px, py]) => {
      const pt = toScreen(px, py, 0);
      ctx.lineTo(pt.x, pt.y);
    });
    ctx.closePath();
    ctx.fillStyle = palette.pitchClay;
    ctx.fill();

    const drawFadedCrease = (wy: number) => {
      const cL = toScreen(-16, wy, 0);
      const cR = toScreen(16, wy, 0);
      ctx.strokeStyle = 'rgba(245, 245, 244, 0.52)';
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.moveTo(cL.x, cL.y);
      ctx.lineTo(cR.x, cR.y);
      ctx.stroke();
    };
    drawFadedCrease(-112);
    drawFadedCrease(95);
    ctx.restore();

    // Village Structures (Banyan, Chayakada, Palm Trunks, Wall)
    // Chayakada Tea Shop
    const chayaPos = toScreen(255, -88, 0);
    ctx.save();
    ctx.translate(chayaPos.x, chayaPos.y);
    ctx.fillStyle = '#5C4033';
    ctx.fillRect(-34 * scale, -30 * scale, 68 * scale, 32 * scale);
    ctx.fillStyle = '#94A3B8';
    ctx.beginPath();
    ctx.moveTo(-42 * scale, -28 * scale);
    ctx.lineTo(-30 * scale, -48 * scale);
    ctx.lineTo(32 * scale, -48 * scale);
    ctx.lineTo(44 * scale, -28 * scale);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Palm Trunks
    palmsRef.current.forEach((palm) => {
      const base = toScreen(palm.wx, palm.wy, 0);
      const top = toScreen(palm.wx + palm.lean, palm.wy, palm.height);
      ctx.strokeStyle = s.timeOfDay === 'EVENING' ? '#292524' : '#57534E';
      ctx.lineWidth = 5.5 * scale;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(base.x, base.y);
      ctx.quadraticCurveTo(
        (base.x + top.x) * 0.5 + palm.lean * 0.3 * scale,
        (base.y + top.y) * 0.5,
        top.x,
        top.y
      );
      ctx.stroke();
    });

    bgDirtyRef.current = false;
  }, []);

  // ==========================================================================
  // 60FPS GAME LOOP
  // ==========================================================================
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    simRef.current.fielders = initFielders();

    const loop = (now: number) => {
      const rawDt = (now - lastTime) / 1000;
      lastTime = now;
      const dt = Math.min(rawDt, 0.05);

      const s = simRef.current;

      if (s.hitStopTimer > 0) {
        s.hitStopTimer -= dt;
      } else if (s.screen !== 'PAUSED') {
        if (s.shakeIntensity > 0) s.shakeIntensity = Math.max(0, s.shakeIntensity - dt * 28);
        if (s.popupTimer > 0) s.popupTimer = Math.max(0, s.popupTimer - dt);
        if (s.batSwingAnim > 0) s.batSwingAnim = Math.max(0, s.batSwingAnim - dt * 3.8);

        // Human Bowler 3-Second Choice Countdown (Bowling Device triggers, Batting Device syncs)
        if (s.bowlerChoosing) {
          s.bowlerTimer -= dt;
          setBowlerChoiceTimer(Math.max(0, s.bowlerTimer));
          if (s.isLocalPlayerBowling && s.bowlerTimer <= 0) {
            confirmBowlingDelivery();
          } else if (!s.isLocalPlayerBowling && s.bowlerTimer <= -1.2) {
            applyBowlingChoice({
              variation: 'FAST',
              line: 'MIDDLE',
              length: 'GOOD',
              timestamp: Date.now(),
            });
          }
        }

        s.boatY += dt * 11;
        if (s.boatY > 210) s.boatY = -240;

        // Animate sky birds
        s.birdSpawnTimer -= dt;
        const currentW = canvasRef.current?.width || 1280;
        const currentH = canvasRef.current?.height || 720;
        if (s.birdSpawnTimer <= 0) {
          if (s.skyBirds.length < 14) {
            s.skyBirds.push(...generateRandomBirdSprites(currentW, currentH, false));
          }
          s.birdSpawnTimer = 4.2 + Math.random() * 3.8;
        }

        s.skyBirds = s.skyBirds.filter((b) => {
          b.x += b.vx * dt;
          b.y += b.vy * dt + Math.sin(b.wingPhase) * 0.12;
          b.wingPhase += dt * b.flapSpeed;
          return b.x > -140 && b.x < currentW + 140;
        });

        // Update particles
        s.particles = s.particles.filter((p) => {
          p.life += dt;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.z += p.vz * dt;
          p.vz -= 290 * dt;
          if (p.z < 0) {
            p.z = 0;
            p.vz *= -0.35;
          }
          return p.life < p.maxLife;
        });

        if (s.isMonsoon) {
          s.rain.forEach((drop) => {
            drop.x -= drop.speed * 0.32 * dt;
            drop.y += drop.speed * dt;
            if (drop.y > 1050) {
              drop.y = -20;
              drop.x = Math.random() * 1800;
            }
          });
        }

        // Active Delivery Simulation
        if (s.screen === 'PLAYING') {
          if (s.phase === 'RUNUP') {
            s.phaseTimer -= dt;
            const runupFrac = 1 - Math.max(0, s.phaseTimer);
            s.ball.x = 6;
            s.ball.y = -170 + runupFrac * 48;
            s.ball.z = 26;

            if (s.phaseTimer <= 0) {
              s.phase = 'BOWLING';
              s.ballProgress = 0;
            }
          } else if (s.phase === 'BOWLING') {
            const monsoonPitchMod =
              s.isMonsoon && s.ballProgress > 0.55 ? GAME_CONFIG.DIFFICULTY.MONSOON_SKID : 1.0;

            const prevP = s.ballProgress;
            s.ballProgress += s.ballSpeed * monsoonPitchMod * dt;

            const p = s.ballProgress;
            const bouncePoint = s.ballLength === 'SHORT' ? 0.42 : s.ballLength === 'FULL' ? 0.72 : 0.6;
            const lineOffset = s.ballLine === 'OFF' ? 22 : s.ballLine === 'LEG' ? -22 : 0;
            const lateralSpin = p > bouncePoint ? ((p - bouncePoint) / (1 - bouncePoint)) * s.ballSpinCurve : 0;

            s.ball.x = (1 - p) * 5 + lineOffset * p + lateralSpin;
            s.ball.y = -122 + p * 228;

            if (prevP < bouncePoint && p >= bouncePoint) {
              spawnParticles(s.ball.x, s.ball.y, 2, s.isMonsoon ? '#78716C' : '#D6B89A', 8, 0.45);
            }

            if (p < bouncePoint) {
              s.ball.z = 28 * (1 - p / bouncePoint);
            } else {
              const afterFrac = (p - bouncePoint) / (1 - bouncePoint);
              const peakZ = s.ballType === 'BOUNCER' || s.ballLength === 'SHORT' ? 38 : 19;
              s.ball.z = Math.sin(afterFrac * Math.PI * 0.85) * peakZ;
            }

            if (s.ballProgress >= 1.02) {
              const nextBallNum = s.balls + 1;
              const hitStumps = Math.abs(s.ball.x) < 14 && s.ballType !== 'BOUNCER';
              if (hitStumps) {
                audio.playWicketSound();
                s.shakeIntensity = 7;
                spawnParticles(0, 105, 16, '#D97706', 18, 0.9);
                triggerPopup(COMMENTARY.BOWLED_OUT, '#EF4444');
                s.phase = 'BALL_SETTLED';
                s.phaseTimer = 1.35;
                setTimeout(() => resolveDeliveryOutcome(0, true, 'W', undefined, false, nextBallNum), 950);
              } else if (Math.abs(s.ball.x) < 18 && s.ballLength === 'FULL') {
                // LBW Case on full ball in line with stumps
                audio.playWicketSound();
                triggerPopup(COMMENTARY.LBW_OUT, '#EF4444');
                s.phase = 'BALL_SETTLED';
                setTimeout(() => resolveDeliveryOutcome(0, true, 'LBW', undefined, false, nextBallNum), 950);
              } else {
                triggerPopup(COMMENTARY.DOT, '#94A3B8');
                s.phase = 'BALL_SETTLED';
                s.phaseTimer = 1.1;
                setTimeout(() => resolveDeliveryOutcome(0, false, '0', undefined, false, nextBallNum), 800);
              }
            }
          } else if (s.phase === 'HIT_FLIGHT') {
            const grassDrag = s.ball.z <= 2 ? (s.isMonsoon ? 0.78 : 0.92) : 0.995;
            s.ball.x += s.ball.vx * dt;
            s.ball.y += s.ball.vy * dt;
            s.ball.z += s.ball.vz * dt;
            s.ball.vz -= 260 * dt;

            if (s.ball.z <= 0) {
              s.ball.z = 0;
              s.ball.bounces += 1;
              s.ball.vz = Math.abs(s.ball.vz) * (s.isMonsoon ? 0.32 : 0.48);
              s.ball.vx *= grassDrag;
              s.ball.vy *= grassDrag;
            }

            // Fielder sprint
            let caughtByFielder = false;
            let stoppedByFielder = false;
            for (const f of s.fielders) {
              const dx = s.ball.x - f.x;
              const dy = s.ball.y - f.y;
              const dist = Math.hypot(dx, dy);
              if (dist > 4) {
                f.x += (dx / dist) * 115 * dt;
                f.y += (dy / dist) * 115 * dt;
              }
              if (s.ball.bounces === 0 && s.ball.z < 52 && dist < 26) {
                caughtByFielder = true;
                break;
              }
              if (s.ball.bounces > 0 && s.ball.z < 15 && dist < 22) {
                stoppedByFielder = true;
                break;
              }
            }

            // Boundary & Village Rule checks
            const distFromCenter = Math.hypot(s.ball.x * 0.9, (s.ball.y + 10) * 0.95);
            const canalEdgeX = getCanalBankX(s.ball.y);
            const nextBallNum = s.balls + 1;

            if (caughtByFielder) {
              audio.playWicketSound();
              triggerPopup(COMMENTARY.CAUGHT_OUT, '#EF4444');
              s.phase = 'BALL_SETTLED';
              setTimeout(() => resolveDeliveryOutcome(0, true, 'W', undefined, false, nextBallNum), 1000);
            } else if (s.ball.x > 210 && s.ball.x < 310 && s.ball.y > -140 && s.ball.y < -40 && s.ball.z < 65) {
              // Tin Roof Hit
              audio.playTinRoofClang();
              audio.playChendaBoundaryBeat();
              const roofRuns = s.ball.bounces === 0 ? 8 : 6;
              triggerPopup(COMMENTARY.ROOF, '#38BDF8');
              s.phase = 'BALL_SETTLED';
              setTimeout(() => resolveDeliveryOutcome(roofRuns, false, `${roofRuns}`, 'Chayakada Roof Smash', false, nextBallNum), 1100);
            } else if (s.ball.x < canalEdgeX && s.ball.z <= 14) {
              // Canal OUT
              audio.playSplash();
              triggerPopup(COMMENTARY.CANAL_OUT, '#EF4444');
              s.phase = 'BALL_SETTLED';
              setTimeout(() => resolveDeliveryOutcome(0, true, '🌊', undefined, false, nextBallNum), 1100);
            } else if (s.ball.y < -242) {
              // Tall Paddy Auto 6
              audio.playChendaBoundaryBeat();
              triggerPopup(COMMENTARY.PADDY_SIX, '#4ADE80');
              s.phase = 'BALL_SETTLED';
              setTimeout(() => resolveDeliveryOutcome(6, false, '6', 'Lost in Tall Paddy Six!', false, nextBallNum), 1100);
            } else if (distFromCenter > 248) {
              audio.playChendaBoundaryBeat();
              const bRuns = s.ball.bounces === 0 ? 6 : 4;
              triggerPopup(bRuns === 6 ? COMMENTARY.SIX : COMMENTARY.FOUR, '#D4AF37');
              s.phase = 'BALL_SETTLED';
              setTimeout(
                () =>
                  resolveDeliveryOutcome(
                    bRuns,
                    false,
                    `${bRuns}`,
                    bRuns === 6 ? 'Towering Coconut Six!' : 'Padam Boundary Four!',
                    false,
                    nextBallNum
                  ),
                1050
              );
            } else if (stoppedByFielder || Math.hypot(s.ball.vx, s.ball.vy) < 28) {
              const r = distFromCenter > 130 ? 2 : distFromCenter > 52 ? 1 : 0;
              s.phase = 'BALL_SETTLED';
              setTimeout(() => resolveDeliveryOutcome(r, false, `${r}`, undefined, false, nextBallNum), 850);
            }
          }
        }
      }

      // Render Frame
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const W = canvas.width;
          const H = canvas.height;

          if (bgDirtyRef.current || !bgCanvasRef.current || bgCanvasRef.current.width !== W) {
            renderStaticEnvironment(W, H);
          }

          ctx.save();
          if (s.shakeIntensity > 0) {
            ctx.translate((Math.random() - 0.5) * s.shakeIntensity * 2, (Math.random() - 0.5) * s.shakeIntensity * 2);
          }

          if (bgCanvasRef.current) {
            ctx.drawImage(bgCanvasRef.current, 0, 0);
          }

          const scale = Math.min(W / 900, H / 640);
          const cx = W * 0.51;
          const cy = H * 0.57;

          const toScreen = (wx: number, wy: number, wz: number = 0) => {
            const rx = wx * (1 + wy * 0.00055);
            const ry = wy * 0.78 - wz * 0.92;
            return { x: cx + rx * scale, y: cy + ry * scale };
          };

          // Render Birds
          s.skyBirds.forEach((b) => {
            const bScale = scale * b.size;
            const flap = Math.sin(b.wingPhase);
            ctx.save();
            ctx.translate(b.x, b.y);
            if (b.direction === -1) ctx.scale(-1, 1);
            ctx.fillStyle = b.species === 'HERON' ? '#F8FAFC' : '#1C1917';
            ctx.beginPath();
            ctx.ellipse(0, 0, 6 * bScale, 2.2 * bScale, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          });

          // Draw Stumps
          const drawStickStumps = (wy: number) => {
            [-5.5, 0, 5.5].forEach((ox) => {
              const base = toScreen(ox, wy, 0);
              const top = toScreen(ox, wy, 19);
              ctx.strokeStyle = '#D6B88A';
              ctx.lineWidth = 2.2 * scale;
              ctx.beginPath();
              ctx.moveTo(base.x, base.y);
              ctx.lineTo(top.x, top.y);
              ctx.stroke();
            });
          };
          drawStickStumps(-122);
          drawStickStumps(108);

          // Draw Cricketers
          const drawPlayer = (wx: number, wy: number, lungi: string, shirt: string, isBatter = false) => {
            const p = toScreen(wx, wy, 0);
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.fillStyle = lungi;
            ctx.fillRect(-6.5 * scale, -18 * scale, 13 * scale, 12 * scale);
            ctx.fillStyle = shirt;
            ctx.fillRect(-7.5 * scale, -33 * scale, 15 * scale, 16 * scale);
            ctx.fillStyle = '#7C2D12';
            ctx.beginPath();
            ctx.arc(0, -39 * scale, 5.5 * scale, 0, Math.PI * 2);
            ctx.fill();

            if (isBatter) {
              const rot = s.batSwingAnim > 0 ? -Math.sin(s.batSwingAnim * Math.PI) * 1.6 : 0.32;
              ctx.translate(7 * scale, -26 * scale);
              ctx.rotate(rot);
              ctx.fillStyle = '#B45309';
              ctx.fillRect(-2 * scale, 0, 4 * scale, 22 * scale);
            }
            ctx.restore();
          };

          // Fielders
          s.fielders.forEach((f) => drawPlayer(f.x, f.y, f.lungiColor, f.shirtColor));

          // Bowler & Batter
          const bowlerY = s.phase === 'RUNUP' ? -170 + (1 - Math.max(0, s.phaseTimer)) * 48 : -122;
          drawPlayer(5, bowlerY, '#FDFBF2', '#0369A1');

          const activeBatsman = GAME_CONFIG.BATSMEN.find((b) => b.id === s.batsmanId) || GAME_CONFIG.BATSMEN[0];
          drawPlayer(-8, 98, activeBatsman.munduColor, activeBatsman.shirtColor, true);

          // Ball & Shadow
          if (s.screen === 'PLAYING') {
            const shadowPt = toScreen(s.ball.x, s.ball.y, 0);
            const ballPt = toScreen(s.ball.x, s.ball.y, s.ball.z);

            ctx.fillStyle = 'rgba(0,0,0,0.38)';
            ctx.beginPath();
            ctx.ellipse(shadowPt.x, shadowPt.y, 4.8 * scale, 2.6 * scale, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#DC2626';
            ctx.beginPath();
            ctx.arc(ballPt.x, ballPt.y, 5.2 * scale, 0, Math.PI * 2);
            ctx.fill();
          }

          // Particles
          s.particles.forEach((p) => {
            const pt = toScreen(p.x, p.y, p.z);
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, p.size * scale, 0, Math.PI * 2);
            ctx.fill();
          });

          // Floating Emotes Render
          activeEmotes.forEach((em) => {
            ctx.save();
            ctx.globalAlpha = em.alpha;
            ctx.fillStyle = em.color || '#EAB308';
            ctx.font = `800 ${Math.round(20 * scale)}px sans-serif`;
            ctx.fillText(em.text, em.x, em.y);
            ctx.font = `600 ${Math.round(11 * scale)}px sans-serif`;
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText(em.sender, em.x, em.y - 18 * scale);
            ctx.restore();
          });

          // Popup Banner
          if (s.popupTimer > 0 && s.popupText) {
            ctx.save();
            ctx.globalAlpha = Math.min(1, s.popupTimer * 2);
            ctx.translate(W * 0.5, H * 0.21);
            ctx.font = `800 ${Math.round(26 * scale)}px var(--font-display), sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillStyle = s.popupColor;
            ctx.fillText(s.popupText, 0, 0);
            ctx.font = `600 ${Math.round(13 * scale)}px sans-serif`;
            ctx.fillStyle = '#FDFBF2';
            ctx.fillText(s.popupSub, 0, 22 * scale);
            ctx.restore();
          }

          ctx.restore();
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [activeEmotes, confirmBowlingDelivery, initFielders, renderStaticEnvironment, resolveDeliveryOutcome]);

  // Handle window resize
  useEffect(() => {
    const updateSize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
        bgDirtyRef.current = true;
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const oversFormatted = `${Math.floor(hud.balls / 6)}.${hud.balls % 6} / ${overs}.0`;
  const strikeRate = hud.balls > 0 ? Math.round((hud.runs / hud.balls) * 100) : 0;
  const reqRuns = hud.target !== null ? Math.max(0, hud.target - hud.runs) : null;
  const ballsLeft = Math.max(0, hud.totalBalls - hud.balls);

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none bg-[#1c2414] font-sans">
      <canvas
        ref={canvasRef}
        onClick={() => {
          if (screen === 'PLAYING') handleSwing();
        }}
        className="block w-full h-full cursor-pointer"
      />

      {/* TOP PERIMETER HUD */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-20 flex items-start justify-between px-4 py-3 md:px-6">
        {screen === 'PLAYING' ? (
          <div className="pointer-events-auto flex flex-wrap items-center gap-4 rounded-xl bg-[#0b1f11]/90 border border-[#d4af37]/40 px-4 py-2.5 shadow-lg">
            <div>
              <div className="text-[10px] font-medium text-[#d4af37]">
                {mode === 'MULTIPLAYER' ? `${currentBattingName} (BAT)` : 'SCORE · സ്കോർ'}
              </div>
              <div className="font-mono text-2xl font-bold tabular-nums text-[#fdfbf2]">
                {hud.runs}/{hud.wickets}
              </div>
            </div>

            <div className="h-8 w-px bg-[#d4af37]/25" />

            <div>
              <div className="text-[10px] font-medium text-[#d4af37]">
                {mode === 'MULTIPLAYER' ? `INNINGS ${currentInnings}/2` : 'OVERS · ഓവർ'}
              </div>
              <div className="font-mono text-base font-semibold tabular-nums text-[#fdfbf2]">
                {oversFormatted}
              </div>
            </div>

            {reqRuns !== null && (
              <>
                <div className="h-8 w-px bg-[#d4af37]/25" />
                <div>
                  <div className="text-[10px] font-medium text-amber-300">
                    TARGET: {hud.target}
                  </div>
                  <div className="font-mono text-sm font-bold tabular-nums text-amber-200">
                    Need {reqRuns} in {ballsLeft}b
                  </div>
                </div>
              </>
            )}

            {mode === 'MULTIPLAYER' && (
              <div className="hidden sm:flex items-center gap-1.5 pl-2 text-xs text-[#d4af37]">
                <span>Bowl:</span>
                <strong className="text-white">{currentBowlingName}</strong>
              </div>
            )}
          </div>
        ) : (
          <div className="pointer-events-auto flex items-center gap-3 rounded-xl bg-[#0b1f11]/85 border border-[#d4af37]/40 px-3.5 py-2">
            <Trophy className="w-4 h-4 text-[#d4af37]" />
            <span className="text-xs font-medium text-[#fdfbf2] tabular-nums">
              Session High Score: <strong className="text-[#d4af37] font-mono">{sessionStats.highScore}</strong>
            </span>
          </div>
        )}

        {/* Right Controls */}
        <div className="pointer-events-auto flex items-center gap-2">
          {mode === 'MULTIPLAYER' && (
            <div className="flex items-center gap-1.5 rounded-lg bg-[#0b1f11]/85 border border-[#d4af37]/40 px-2.5 py-1.5 text-xs">
              {isConnected ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300 font-mono text-[11px]">
                    {activeRoomCode ? `${activeRoomCode} · ` : ''}{pingMs ? `${pingMs}ms` : '2-Device Live'}
                  </span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-amber-300 text-[11px]">
                    {activeRoomCode ? `Room ${activeRoomCode} · Waiting...` : 'Waiting for Device 2...'}
                  </span>
                </>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={() => setTimeOfDay((v) => (v === 'DAY' ? 'EVENING' : 'DAY'))}
            className="flex items-center gap-1.5 rounded-lg bg-[#0b1f11]/85 border border-[#d4af37]/40 px-3 py-2 text-xs font-semibold text-[#fdfbf2]"
          >
            {timeOfDay === 'EVENING' ? <Sunset className="w-4 h-4 text-orange-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>

          <button
            type="button"
            onClick={() => setIsMonsoon((v) => !v)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold ${
              isMonsoon ? 'bg-slate-800 border-sky-400 text-sky-100' : 'bg-[#0b1f11]/85 border-[#d4af37]/40 text-[#fdfbf2]'
            }`}
          >
            <CloudRain className="w-4 h-4 text-sky-300" />
          </button>

          <button
            type="button"
            onClick={() => {
              audio.muted = !isMuted;
              setIsMuted(!isMuted);
            }}
            className="flex items-center gap-1.5 rounded-lg bg-[#0b1f11]/85 border border-[#d4af37]/40 px-3 py-2 text-xs font-semibold text-[#fdfbf2]"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-[#d4af37]" />}
          </button>
        </div>
      </div>

      {/* FLOATING EMOTE BAR */}
      {screen === 'PLAYING' && (
        <div className="fixed top-16 right-4 z-20 flex flex-col gap-1.5 pointer-events-auto">
          {MP_EMOTES.map((em) => (
            <button
              key={em.id}
              disabled={emoteCooldown}
              onClick={() => triggerEmote(em.text, isLocalPlayerBatting ? currentBattingName : currentBowlingName, em.color)}
              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-[#0b1f11]/80 border border-[#d4af37]/30 text-[#fdfbf2] hover:bg-[#14361b] active:scale-95 disabled:opacity-50 transition-all text-right"
            >
              {em.text}
            </button>
          ))}
        </div>
      )}

      {/* BOWLING DEVICE: 3-SECOND SECRET DELIVERY SELECTION STRIP (DOCKS AT BOTTOM) */}
      {screen === 'PLAYING' && isBowlerChoosing && isLocalPlayerBowling && (
        <div className="fixed inset-x-0 bottom-0 z-30 bg-[#0b1f11]/95 border-t-2 border-[#d4af37] p-3 text-[#fdfbf2] shadow-2xl">
          <div className="max-w-3xl mx-auto space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#d4af37]">
                🎯 YOUR TURN TO BOWL · {currentBowlingName} (Secretly pick in {bowlerChoiceTimer.toFixed(1)}s)
              </span>
              <div className="w-32 bg-stone-700 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-400 h-full transition-all duration-100"
                  style={{ width: `${(bowlerChoiceTimer / 3) * 100}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              {/* Variation */}
              <div>
                <div className="text-[10px] text-stone-400 mb-1">VARIATION:</div>
                <div className="grid grid-cols-2 gap-1">
                  {(['FAST', 'SPIN', 'SLOWER', 'BOUNCER'] as BowlingVariation[]).map((v) => (
                    <button
                      key={v}
                      onClick={() => setBowlerVariation(v)}
                      className={`py-1.5 px-2 rounded font-bold text-[11px] border ${
                        bowlerVariation === v ? 'bg-[#d4af37] text-black border-amber-300' : 'bg-stone-800 border-stone-700'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Line */}
              <div>
                <div className="text-[10px] text-stone-400 mb-1">LINE:</div>
                <div className="grid grid-cols-3 gap-1">
                  {(['OFF', 'MIDDLE', 'LEG'] as BowlingLine[]).map((l) => (
                    <button
                      key={l}
                      onClick={() => setBowlerLine(l)}
                      className={`py-1.5 px-1 rounded font-bold text-[11px] border ${
                        bowlerLine === l ? 'bg-[#d4af37] text-black border-amber-300' : 'bg-stone-800 border-stone-700'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Length */}
              <div>
                <div className="text-[10px] text-stone-400 mb-1">LENGTH:</div>
                <div className="grid grid-cols-3 gap-1">
                  {(['SHORT', 'GOOD', 'FULL'] as BowlingLength[]).map((len) => (
                    <button
                      key={len}
                      onClick={() => setBowlerLength(len)}
                      className={`py-1.5 px-1 rounded font-bold text-[11px] border ${
                        bowlerLength === len ? 'bg-[#d4af37] text-black border-amber-300' : 'bg-stone-800 border-stone-700'
                      }`}
                    >
                      {len}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-center pt-1">
              <button
                onClick={() => confirmBowlingDelivery()}
                className="w-full py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold rounded-lg text-xs"
              >
                CONFIRM SECRET DELIVERY & BOWL TO {currentBattingName.toUpperCase()}!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BATTING DEVICE: WAITING BANNER WHILE BOWLER CHOOSES ON THE OTHER DEVICE */}
      {screen === 'PLAYING' && isBowlerChoosing && isLocalPlayerBatting && (
        <div className="fixed inset-x-0 bottom-0 z-30 bg-[#0b1f11]/95 border-t-2 border-[#d4af37] p-3 text-[#fdfbf2] shadow-2xl">
          <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
              <div>
                <div className="text-xs font-extrabold text-[#d4af37]">
                  🏏 BATTER READY · {currentBattingName} (You are Batting on this Device)
                </div>
                <div className="text-[11px] text-stone-300">
                  {currentBowlingName} is secretly selecting delivery on the other device ({bowlerChoiceTimer.toFixed(1)}s)...
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 rounded-xl bg-black/40 border border-[#d4af37]/40 p-1">
              <span className="text-[10px] text-stone-300 px-2 font-bold">PRE-AIM:</span>
              <button
                type="button"
                onClick={() => {
                  simRef.current.aimDir = -1;
                  setAimDir(-1);
                }}
                className={`px-2.5 py-1.5 rounded text-xs font-bold ${
                  aimDir === -1 ? 'bg-[#d4af37] text-[#0e2414]' : 'text-[#fdfbf2] hover:bg-white/10'
                }`}
              >
                ← Off
              </button>
              <button
                type="button"
                onClick={() => {
                  simRef.current.aimDir = 0;
                  setAimDir(0);
                }}
                className={`px-2.5 py-1.5 rounded text-xs font-bold ${
                  aimDir === 0 ? 'bg-[#d4af37] text-[#0e2414]' : 'text-[#fdfbf2] hover:bg-white/10'
                }`}
              >
                ↑ Straight
              </button>
              <button
                type="button"
                onClick={() => {
                  simRef.current.aimDir = 1;
                  setAimDir(1);
                }}
                className={`px-2.5 py-1.5 rounded text-xs font-bold ${
                  aimDir === 1 ? 'bg-[#d4af37] text-[#0e2414]' : 'text-[#fdfbf2] hover:bg-white/10'
                }`}
              >
                Leg →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BATTING CONTROLS (DESKTOP & MOBILE TOUCH) */}
      {screen === 'PLAYING' && !isBowlerChoosing && (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 flex items-end justify-between px-4 pb-4 md:px-8">
          <div className="pointer-events-auto flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold text-[#fdfbf2]/90 drop-shadow">
              SHOT DIRECTION · ദിശ (← ↑ →)
            </span>
            <div className="flex items-center gap-1.5 rounded-xl bg-[#0b1f11]/90 border border-[#d4af37]/40 p-1.5">
              <button
                type="button"
                onClick={() => {
                  simRef.current.aimDir = -1;
                  setAimDir(-1);
                }}
                className={`px-3.5 py-2.5 rounded-lg text-xs font-bold transition-colors ${
                  aimDir === -1 ? 'bg-[#d4af37] text-[#0e2414]' : 'text-[#fdfbf2] hover:bg-white/10'
                }`}
              >
                ← Off
              </button>
              <button
                type="button"
                onClick={() => {
                  simRef.current.aimDir = 0;
                  setAimDir(0);
                }}
                className={`px-3.5 py-2.5 rounded-lg text-xs font-bold transition-colors ${
                  aimDir === 0 ? 'bg-[#d4af37] text-[#0e2414]' : 'text-[#fdfbf2] hover:bg-white/10'
                }`}
              >
                ↑ Straight
              </button>
              <button
                type="button"
                onClick={() => {
                  simRef.current.aimDir = 1;
                  setAimDir(1);
                }}
                className={`px-3.5 py-2.5 rounded-lg text-xs font-bold transition-colors ${
                  aimDir === 1 ? 'bg-[#d4af37] text-[#0e2414]' : 'text-[#fdfbf2] hover:bg-white/10'
                }`}
              >
                Leg →
              </button>
            </div>
          </div>

          <div className="pointer-events-auto flex flex-col items-end gap-1.5">
            <span className="text-[11px] font-semibold text-[#fdfbf2]/90 drop-shadow">
              {isLocalPlayerBatting ? 'SPACE / TAP TO SWING BAT' : `WATCHING ${currentBattingName.toUpperCase()} BAT`}
            </span>
            <button
              type="button"
              disabled={!isLocalPlayerBatting}
              onClick={handleSwing}
              className={`rounded-2xl border-2 px-7 py-4 text-base font-extrabold shadow-xl transition-transform ${
                isLocalPlayerBatting
                  ? 'bg-gradient-to-b from-[#facc15] to-[#ca8a04] border-[#fef08a] text-[#0e2414] active:scale-95 cursor-pointer'
                  : 'bg-stone-700 border-stone-600 text-stone-400 cursor-not-allowed opacity-60'
              }`}
            >
              {isLocalPlayerBatting ? '🏏 SWING BAT (അടി!)' : '🎯 BOWLING DEVICE (LIVE)'}
            </button>
          </div>
        </div>
      )}

      {/* TITLE SCREEN MODAL */}
      {screen === 'TITLE' && (
        <div className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-black/45">
          <div className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl bg-[#fdfbf2] text-[#14361b] shadow-2xl border-4 border-[#d4af37]">
            <div className="h-3.5 w-full bg-[repeating-linear-gradient(90deg,#d4af37_0px,#d4af37_18px,#b45309_18px,#b45309_24px,#fdfbf2_24px,#fdfbf2_30px)]" />

            <div className="p-6 md:p-8 space-y-5">
              <div className="text-center space-y-1">
                <div className="inline-flex items-center gap-2 text-xs font-bold tracking-wider text-[#b45309]">
                  <span>RURAL KERALA PADAM CRICKET · വെണ്ണിക്കുളം പ്രീമിയർ ലീഗ്</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-[#0e2414]">
                  Vennikulam Premier League
                </h1>
                <p className="text-xs text-[#335c3b] max-w-lg mx-auto">
                  Play Solo or challenge a friend across Two Devices with a 4-letter Room Code!
                </p>
              </div>

              {/* Mode Selector */}
              <div>
                <label className="block text-xs font-bold text-[#14361b] mb-1.5">
                  SELECT GAME MODE · കളി രീതി
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    { id: 'QUICK', label: 'Quick Match', sub: 'സൗഹൃദ മത്സരം' },
                    { id: 'CHASE', label: 'Chase Mode', sub: 'ലക്ഷ്യം നേടുക' },
                    { id: 'TOURNAMENT', label: 'Tournament', sub: 'ടൂർണമെന്റ് (3x)' },
                    { id: 'MULTIPLAYER', label: 'Multiplayer (2 Devices)', sub: 'രണ്ട് ഫോൺ / ഉപകരണങ്ങൾ' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setMode(m.id as GameMode);
                        if (m.id === 'MULTIPLAYER' && !activeRoomCode && !isConnecting && mpRole === 'HOST') {
                          handleHostOnline();
                        }
                      }}
                      className={`rounded-xl p-2.5 text-left border transition-all ${
                        mode === m.id
                          ? 'bg-[#14361b] text-[#fdfbf2] border-[#d4af37] ring-2 ring-amber-400/40'
                          : 'bg-[#f4EFE0] text-[#14361b] border-[#d4af37]/40 hover:bg-[#ebe3ce]'
                      }`}
                    >
                      <div className="text-sm font-bold">{m.label}</div>
                      <div className="text-[10px] opacity-80">{m.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* MULTIPLAYER TWO-DEVICE LOBBY SUB-PANEL */}
              {mode === 'MULTIPLAYER' ? (
                <div className="p-4 bg-[#f4EFE0] rounded-xl border-2 border-[#d4af37] space-y-4">
                  {/* Two-Device Role Tabs: Host on Device 1 vs Join on Device 2 */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#d4af37]/40 pb-3">
                    <div>
                      <div className="text-xs font-extrabold text-[#0e2414] flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-[#b45309]" />
                        <span>TWO-DEVICE 1v1 MULTIPLAYER · രണ്ട് ഉപകരണങ്ങളിൽ കളിക്കാം</span>
                      </div>
                      <p className="text-[11px] text-stone-600">
                        Device 1 creates a 4-letter Room Code; Device 2 enters the code or opens the invite link.
                      </p>
                    </div>
                    <div className="flex gap-1.5 bg-white/80 p-1 rounded-lg border border-[#d4af37]/50 text-xs font-bold">
                      <button
                        type="button"
                        onClick={() => {
                          setMpRole('HOST');
                          setConnError(null);
                          if (!activeRoomCode && !isConnecting) {
                            handleHostOnline();
                          }
                        }}
                        className={`px-3 py-1.5 rounded-md transition-colors ${
                          mpRole === 'HOST' ? 'bg-[#14361b] text-[#fdfbf2]' : 'text-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        📱 Device 1: Host Room
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMpRole('GUEST');
                          setConnError(null);
                        }}
                        className={`px-3 py-1.5 rounded-md transition-colors ${
                          mpRole === 'GUEST' ? 'bg-[#14361b] text-[#fdfbf2]' : 'text-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        📲 Device 2: Join Room
                      </button>
                    </div>
                  </div>

                  {/* Connection & Room Code Box */}
                  {mpRole === 'HOST' ? (
                    <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-300 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="space-y-1 text-center sm:text-left">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-[#b45309]">
                          DEVICE 1 (HOST) · SHARE THIS 4-LETTER ROOM CODE WITH DEVICE 2
                        </div>
                        {activeRoomCode ? (
                          <div className="flex items-center justify-center sm:justify-start gap-3">
                            <span className="font-mono text-2xl font-black tracking-widest text-[#0e2414] bg-amber-200 border border-amber-400 px-3.5 py-1 rounded-lg">
                              {activeRoomCode}
                            </span>
                            <div className="text-xs">
                              {isConnected ? (
                                <span className="inline-flex items-center gap-1 font-extrabold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-md border border-emerald-300">
                                  ● Device 2 ({p2Name}) Connected!
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 font-semibold text-amber-800 animate-pulse">
                                  ⏳ Waiting for Device 2 to join...
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="text-xs text-amber-800 font-semibold">
                            {isConnecting ? 'Generating 4-letter Room Code...' : 'Click below to generate a 4-letter Room Code'}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        {activeRoomCode ? (
                          <button
                            type="button"
                            onClick={copyInviteLink}
                            className="flex-1 sm:flex-initial px-4 py-2 bg-[#b45309] hover:bg-amber-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow"
                          >
                            {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            {copiedLink ? 'Invite Link Copied!' : 'Copy Invite Link (?room=' + activeRoomCode + ')'}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={handleHostOnline}
                            disabled={isConnecting}
                            className="flex-1 sm:flex-initial px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs shadow"
                          >
                            Generate Room Code
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-300 space-y-2">
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="text-center sm:text-left">
                          <div className="text-[11px] font-bold uppercase tracking-wider text-blue-900">
                            DEVICE 2 (GUEST) · ENTER 4-LETTER CODE FROM DEVICE 1
                          </div>
                          <p className="text-xs text-blue-800">
                            Ask Player 1 for the 4-letter code shown on Device 1 and tap Join.
                          </p>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <input
                            type="text"
                            maxLength={4}
                            value={roomCodeInput}
                            onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                            placeholder="CODE"
                            className="w-28 px-3 py-2 border-2 border-blue-400 bg-white rounded-lg text-base font-mono font-black uppercase text-center tracking-widest"
                          />
                          <button
                            type="button"
                            onClick={() => handleJoinOnline()}
                            disabled={isConnecting}
                            className="flex-1 sm:flex-initial px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-extrabold text-xs disabled:opacity-50 shadow"
                          >
                            {isConnecting ? 'Joining...' : isConnected ? 'Connected ✓' : 'Join Device 1'}
                          </button>
                        </div>
                      </div>
                      {isConnected && (
                        <div className="text-xs font-extrabold text-emerald-700 bg-emerald-100 border border-emerald-300 px-3 py-1.5 rounded-lg">
                          ● Connected to Device 1 ({p1Name}) in Room {activeRoomCode}! Host can now start the Coin Toss.
                        </div>
                      )}
                      {connError && <p className="text-xs text-rose-600 font-bold">{connError}</p>}
                    </div>
                  )}

                  {/* Player 1 (Device 1) & Player 2 (Device 2) Batsman Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div
                      className={`p-3 rounded-xl border ${
                        mpRole === 'HOST' ? 'bg-white border-[#14361b] ring-2 ring-[#14361b]/15' : 'bg-white/60 border-stone-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="font-extrabold text-[#14361b]">
                          📱 Device 1 (Host): {mpRole === 'HOST' ? 'YOU' : p1Name}
                        </label>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900">P1</span>
                      </div>
                      <input
                        type="text"
                        value={p1Name}
                        disabled={mpRole !== 'HOST'}
                        onChange={(e) => {
                          const val = e.target.value;
                          setP1Name(val);
                          if (mpRole === 'HOST' && isConnected) {
                            netManagerRef.current?.send({
                              type: 'LOBBY_STATE',
                              payload: {
                                p1Name: val,
                                p1Batsman,
                                p2Name,
                                p2Batsman,
                                overs,
                                timeOfDay,
                                isMonsoon,
                              },
                            });
                          }
                        }}
                        className="w-full px-2.5 py-1.5 border rounded-lg text-xs mb-2 disabled:bg-stone-100 font-semibold"
                        placeholder="Player 1 Name"
                      />
                      <select
                        value={p1Batsman}
                        disabled={mpRole !== 'HOST'}
                        onChange={(e) => {
                          const val = e.target.value;
                          setP1Batsman(val);
                          if (mpRole === 'HOST' && isConnected) {
                            netManagerRef.current?.send({
                              type: 'LOBBY_STATE',
                              payload: {
                                p1Name,
                                p1Batsman: val,
                                p2Name,
                                p2Batsman,
                                overs,
                                timeOfDay,
                                isMonsoon,
                              },
                            });
                          }
                        }}
                        className="w-full px-2.5 py-1.5 border rounded-lg text-xs disabled:bg-stone-100 font-semibold"
                      >
                        {GAME_CONFIG.BATSMEN.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name} ({b.role})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div
                      className={`p-3 rounded-xl border ${
                        mpRole === 'GUEST' ? 'bg-white border-blue-800 ring-2 ring-blue-800/15' : 'bg-white/60 border-stone-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="font-extrabold text-blue-950">
                          📲 Device 2 (Guest): {mpRole === 'GUEST' ? 'YOU' : p2Name}
                        </label>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900">P2</span>
                      </div>
                      <input
                        type="text"
                        value={p2Name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setP2Name(val);
                          if (mpRole === 'GUEST' && isConnected) {
                            netManagerRef.current?.send({
                              type: 'GUEST_PROFILE',
                              payload: {
                                p2Name: val,
                                p2Batsman,
                              },
                            });
                          } else if (mpRole === 'HOST' && isConnected) {
                            netManagerRef.current?.send({
                              type: 'LOBBY_STATE',
                              payload: {
                                p1Name,
                                p1Batsman,
                                p2Name: val,
                                p2Batsman,
                                overs,
                                timeOfDay,
                                isMonsoon,
                              },
                            });
                          }
                        }}
                        className="w-full px-2.5 py-1.5 border rounded-lg text-xs mb-2 font-semibold"
                        placeholder="Player 2 Name"
                      />
                      <select
                        value={p2Batsman}
                        onChange={(e) => {
                          const val = e.target.value;
                          setP2Batsman(val);
                          if (mpRole === 'GUEST' && isConnected) {
                            netManagerRef.current?.send({
                              type: 'GUEST_PROFILE',
                              payload: {
                                p2Name,
                                p2Batsman: val,
                              },
                            });
                          } else if (mpRole === 'HOST' && isConnected) {
                            netManagerRef.current?.send({
                              type: 'LOBBY_STATE',
                              payload: {
                                p1Name,
                                p1Batsman,
                                p2Name,
                                p2Batsman: val,
                                overs,
                                timeOfDay,
                                isMonsoon,
                              },
                            });
                          }
                        }}
                        className="w-full px-2.5 py-1.5 border rounded-lg text-xs font-semibold"
                      >
                        {GAME_CONFIG.BATSMEN.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name} ({b.role})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Overs selection */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="font-bold">Match Length (Two Innings):</span>
                    <div className="flex gap-2">
                      {GAME_CONFIG.OVER_OPTIONS.map((ov) => (
                        <button
                          key={ov}
                          type="button"
                          disabled={mpRole === 'GUEST'}
                          onClick={() => {
                            setOvers(ov);
                            if (mpRole === 'HOST' && isConnected) {
                              netManagerRef.current?.send({
                                type: 'LOBBY_STATE',
                                payload: {
                                  p1Name,
                                  p1Batsman,
                                  p2Name,
                                  p2Batsman,
                                  overs: ov,
                                  timeOfDay,
                                  isMonsoon,
                                },
                              });
                            }
                          }}
                          className={`px-3 py-1 rounded font-bold border ${
                            overs === ov ? 'bg-[#14361b] text-white border-amber-400' : 'bg-white border-stone-300'
                          } disabled:opacity-60`}
                        >
                          {ov} Over{ov > 1 ? 's' : ''}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* Single player config */
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-bold text-[#14361b]">SELECT BATSMAN:</label>
                    <button
                      onClick={() => setUnlockAllBatsmen((v) => !v)}
                      className="text-[#b45309] font-bold hover:underline"
                    >
                      {unlockAllBatsmen ? 'Lock Restored' : 'Unlock All Batsmen'}
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {GAME_CONFIG.BATSMEN.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => setSelectedBatsmanId(b.id)}
                        className={`p-2.5 text-left rounded-xl border text-xs ${
                          selectedBatsmanId === b.id
                            ? 'bg-[#14361b] text-white border-amber-400'
                            : 'bg-[#f4EFE0] text-black border-[#d4af37]/40'
                        }`}
                      >
                        <div className="font-bold">{b.name}</div>
                        <div className="text-[10px] opacity-80">{b.role}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Start Button */}
              <div className="pt-2 text-center">
                {mode === 'MULTIPLAYER' && mpRole === 'GUEST' && !isConnected ? (
                  <div className="text-xs font-bold text-blue-900 bg-blue-100 border border-blue-300 rounded-xl py-3 px-4">
                    Enter the 4-letter Room Code above and tap &ldquo;Join Device 1&rdquo; to connect!
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => startMatch()}
                    className="w-full sm:w-auto min-w-[260px] inline-flex items-center justify-center gap-2 rounded-xl bg-[#14361b] hover:bg-[#1b4924] text-[#fdfbf2] border-2 border-[#d4af37] px-8 py-3.5 text-base font-extrabold shadow-lg transition-colors"
                  >
                    <Play className="w-5 h-5 text-[#d4af37] fill-current" />
                    <span>
                      {mode === 'MULTIPLAYER'
                        ? isConnected
                          ? 'Toss Coin & Start 2-Device Match'
                          : 'Open Coin Toss (Waiting for Device 2)'
                        : 'Start Match · കളി തുടങ്ങാം'}
                    </span>
                  </button>
                )}
              </div>
            </div>

            <div className="h-3.5 w-full bg-[repeating-linear-gradient(90deg,#d4af37_0px,#d4af37_18px,#b45309_18px,#b45309_24px,#fdfbf2_24px,#fdfbf2_30px)]" />
          </div>
        </div>
      )}

      {/* COIN TOSS MODAL */}
      {screen === 'TOSS' && (
        <div className="fixed inset-0 z-40 bg-black/75 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#fdfbf2] text-[#14361b] border-4 border-[#d4af37] p-6 text-center shadow-2xl space-y-4">
            <h2 className="text-2xl font-black text-[#0e2414]">COIN TOSS · ടോസ്</h2>

            {/* Coin Animation */}
            <div className="py-6 flex justify-center">
              <div
                className={`w-28 h-28 rounded-full border-4 border-amber-500 bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-500 flex items-center justify-center shadow-2xl text-amber-950 font-black text-xl ${
                  tossFlipping ? 'animate-spin' : ''
                }`}
              >
                {tossFlipping ? 'FLIPPING...' : tossWinner ? 'WINNER!' : tossCallChoice}
              </div>
            </div>

            {!tossWinner ? (
              <div className="space-y-3">
                <p className="text-xs text-[#335c3b] font-bold">
                  {tossCaller === 'P1' ? p1Name : p2Name} calls the toss:
                </p>
                <div className="flex justify-center gap-3">
                  <button
                    disabled={tossFlipping}
                    onClick={() => setTossCallChoice('HEADS')}
                    className={`px-4 py-2 rounded-lg font-bold text-xs border ${
                      tossCallChoice === 'HEADS' ? 'bg-[#14361b] text-white border-amber-400' : 'bg-white'
                    }`}
                  >
                    HEADS (പൂവ്)
                  </button>
                  <button
                    disabled={tossFlipping}
                    onClick={() => setTossCallChoice('TAILS')}
                    className={`px-4 py-2 rounded-lg font-bold text-xs border ${
                      tossCallChoice === 'TAILS' ? 'bg-[#14361b] text-white border-amber-400' : 'bg-white'
                    }`}
                  >
                    TAILS (കായ്)
                  </button>
                </div>
                <button
                  disabled={tossFlipping}
                  onClick={flipCoin}
                  className="w-full py-2.5 bg-[#b45309] text-white font-black rounded-xl text-sm"
                >
                  Spin Sovereign Coin!
                </button>
              </div>
            ) : !tossDecision ? (
              <div className="space-y-3">
                <p className="text-sm font-black text-emerald-800">
                  🎉 {tossWinner === 'P1' ? p1Name : p2Name} Won the Toss!
                </p>
                {((tossWinner === 'P1' && mpRole === 'HOST') || (tossWinner === 'P2' && mpRole === 'GUEST') || !isConnected) ? (
                  <>
                    <p className="text-xs text-stone-600">Choose to Bat or Bowl first on your device:</p>
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => makeTossDecision('BAT')}
                        className="flex-1 py-3 bg-[#14361b] text-white font-black rounded-xl text-sm border-2 border-amber-400"
                      >
                        🏏 Bat First
                      </button>
                      <button
                        onClick={() => makeTossDecision('BOWL')}
                        className="flex-1 py-3 bg-amber-600 text-white font-black rounded-xl text-sm"
                      >
                        🎯 Bowl First
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="text-xs font-bold text-amber-800 animate-pulse py-2">
                    Waiting for {tossWinner === 'P1' ? p1Name : p2Name} to choose Bat or Bowl on their device...
                  </p>
                )}
              </div>
            ) : (
              <div className="text-sm font-bold text-[#14361b]">
                {tossWinner === 'P1' ? p1Name : p2Name} elected to {tossDecision} first! Loading match...
              </div>
            )}
          </div>
        </div>
      )}

      {/* INNINGS BREAK MODAL */}
      {screen === 'INNINGS_BREAK' && innings1Score && (
        <div className="fixed inset-0 z-40 bg-black/75 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#fdfbf2] text-[#14361b] border-4 border-[#d4af37] p-6 text-center shadow-2xl space-y-4">
            <h2 className="text-2xl font-black text-[#0e2414]">INNINGS BREAK · ഇടവേള</h2>
            <div className="p-3 bg-[#f4EFE0] rounded-xl border border-stone-300 text-xs space-y-1">
              <div className="text-stone-600 font-bold">{innings1Score.battingPlayer} scored:</div>
              <div className="font-mono text-3xl font-black text-[#0e2414]">
                {innings1Score.runs}/{innings1Score.wickets}
              </div>
              <div className="text-stone-500">
                ({Math.floor(innings1Score.balls / 6)}.{innings1Score.balls % 6} overs · {innings1Score.fours}×4 · {innings1Score.sixes}×6)
              </div>
            </div>

            <div className="p-3 bg-amber-100 rounded-xl border border-amber-400">
              <div className="text-xs text-amber-900 font-semibold">Target for {innings1Score.bowlingPlayer}:</div>
              <div className="font-mono text-2xl font-extrabold text-[#b45309]">
                {innings1Score.runs + 1} Runs to Win
              </div>
            </div>

            <button
              onClick={() => {
                if (isConnected) {
                  netManagerRef.current?.send({ type: 'START_INNINGS_2' });
                }
                startInnings(2);
              }}
              className="w-full py-3 bg-[#14361b] text-white font-black rounded-xl text-sm border-2 border-amber-400"
            >
              Start 2nd Innings Chase! (Both Devices)
            </button>
          </div>
        </div>
      )}

      {/* SUMMARY MODAL */}
      {screen === 'SUMMARY' && (
        <div className="fixed inset-0 z-40 bg-black/75 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-[#fdfbf2] text-[#14361b] border-4 border-[#d4af37] overflow-hidden shadow-2xl">
            <div className="h-3.5 w-full bg-[repeating-linear-gradient(90deg,#d4af37_0px,#d4af37_18px,#b45309_18px,#b45309_24px,#fdfbf2_24px,#fdfbf2_30px)]" />

            <div className="p-6 md:p-8 space-y-4 text-center">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#b45309]">
                <Award className="w-4 h-4" />
                <span>MATCH COMPLETED · മത്സര ഫലം</span>
              </div>

              <h2 className="text-2xl md:text-3xl font-extrabold text-[#0e2414]">
                {hud.matchResultTitle}
              </h2>

              {/* Series Score Badge for Multiplayer */}
              {mode === 'MULTIPLAYER' && (
                <div className="inline-block px-3 py-1 bg-amber-100 border border-amber-400 rounded-full text-xs font-bold text-amber-950 font-mono">
                  Series: {p1Name} ({seriesScore.p1Wins}) - ({seriesScore.p2Wins}) {p2Name}
                </div>
              )}

              {/* Village Titles for Winner & Loser */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-emerald-100 border border-emerald-300 rounded-xl">
                  <div className="text-emerald-800 font-bold">{hud.winnerName || 'Winner'}:</div>
                  <div className="font-extrabold text-sm text-emerald-950">{hud.villageTitle}</div>
                </div>
                <div className="p-2.5 bg-rose-100 border border-rose-300 rounded-xl">
                  <div className="text-rose-800 font-bold">{hud.loserName || 'Runner-Up'}:</div>
                  <div className="font-extrabold text-sm text-rose-950">{hud.loserTitle || 'Kayalil Poyi Award'}</div>
                </div>
              </div>

              {/* Detailed Dual Innings Scorecards */}
              {mode === 'MULTIPLAYER' && innings1Score && innings2Score ? (
                <div className="space-y-2 text-left text-xs bg-[#f4EFE0] p-3 rounded-xl border border-stone-300">
                  <div className="border-b pb-1 font-bold flex justify-between">
                    <span>1st Innings: {innings1Score.battingPlayer}</span>
                    <span className="font-mono font-black">{innings1Score.runs}/{innings1Score.wickets} ({Math.floor(innings1Score.balls/6)}.{innings1Score.balls%6} ov)</span>
                  </div>
                  <div className="pt-1 font-bold flex justify-between">
                    <span>2nd Innings: {innings2Score.battingPlayer}</span>
                    <span className="font-mono font-black">{innings2Score.runs}/{innings2Score.wickets} ({Math.floor(innings2Score.balls/6)}.{innings2Score.balls%6} ov)</span>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-left">
                  <div className="rounded-xl bg-[#f4EFE0] p-2.5 border">
                    <div className="text-[10px] text-stone-600">Total Runs</div>
                    <div className="font-mono text-lg font-black">{hud.runs}/{hud.wickets}</div>
                  </div>
                  <div className="rounded-xl bg-[#f4EFE0] p-2.5 border">
                    <div className="text-[10px] text-stone-600">Boundaries</div>
                    <div className="font-mono text-lg font-black">{hud.fours}×4 · {hud.sixes}×6</div>
                  </div>
                  <div className="rounded-xl bg-[#f4EFE0] p-2.5 border">
                    <div className="text-[10px] text-stone-600">Strike Rate</div>
                    <div className="font-mono text-lg font-black">{strikeRate}</div>
                  </div>
                  <div className="rounded-xl bg-[#f4EFE0] p-2.5 border">
                    <div className="text-[10px] text-stone-600">High Score</div>
                    <div className="font-mono text-lg font-black text-[#b45309]">{sessionStats.highScore}</div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                {mode === 'MULTIPLAYER' ? (
                  <button
                    onClick={startRematch}
                    className="flex-1 py-3 bg-[#14361b] text-white font-extrabold rounded-xl text-xs border border-amber-400"
                  >
                    🔁 Play Rematch (Next Match in Series)
                  </button>
                ) : (
                  <button
                    onClick={() => startMatch()}
                    className="flex-1 py-3 bg-[#14361b] text-white font-extrabold rounded-xl text-xs border border-amber-400"
                  >
                    Play Again
                  </button>
                )}
                <button
                  onClick={() => {
                    simRef.current.screen = 'TITLE';
                    setScreen('TITLE');
                  }}
                  className="px-5 py-3 bg-stone-200 text-black font-bold rounded-xl text-xs"
                >
                  Main Menu
                </button>
              </div>
            </div>

            <div className="h-3.5 w-full bg-[repeating-linear-gradient(90deg,#d4af37_0px,#d4af37_18px,#b45309_18px,#b45309_24px,#fdfbf2_24px,#fdfbf2_30px)]" />
          </div>
        </div>
      )}
    </div>
  );
}
