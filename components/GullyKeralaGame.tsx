'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Volume2, VolumeX, Sun, Sunset, CloudRain, Trophy, RotateCcw, Play, Pause, Sparkles, Award } from 'lucide-react';

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

  // Realistic Rural Kerala Padam Palettes (Golden Hour Day, Evening Sunset, Monsoon)
  COLORS: {
    DAY: {
      skyTop: '#D97706',      // Warm golden-hour upper tint
      skyMid: '#FBBF24',      // Soft morning/golden mist
      skyHorizon: '#FEF3C7',  // Hazy warm horizon
      distantHills: '#3F6212',
      midHills: '#365314',
      outerEarth: '#57534E',
      padamBase: '#656D4A',   // Olive-khaki harvested paddy earth
      padamDry: '#7F7756',    // Dry khaki earth
      padamGreen: '#4A5D23',  // Patchy dusty olive grass
      padamSoil: '#8B7355',   // Bare sandy trampled soil
      bundMud: '#5C4033',     // Raised mud varambu bund
      pitchClay: '#9A4628',   // Compacted red-brown laterite clay
      pitchDark: '#7C3219',
      canalWater: '#3B4D3B',  // Muddy brown-green village canal water
      canalBank: '#4E3B2B',
      shadowColor: 'rgba(28, 25, 23, 0.28)',
    },
    EVENING: {
      skyTop: '#311042',      // Deep twilight violet
      skyMid: '#C2410C',      // Rich sunset orange-crimson
      skyHorizon: '#FDBA74',  // Warm peach-gold horizon
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
      skyTop: '#334155',      // Heavy monsoon slate
      skyMid: '#475569',
      skyHorizon: '#94A3B8',
      distantHills: '#1E3A2F',
      midHills: '#143323',
      outerEarth: '#3F3A34',
      padamBase: '#3F4E2E',   // Wet dark olive soil
      padamDry: '#4E4937',
      padamGreen: '#2D471E',
      padamSoil: '#574433',   // Wet mud
      bundMud: '#3E2A1E',
      pitchClay: '#6E2B14',   // Dark damp laterite clay
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
type GameScreen = 'TITLE' | 'PLAYING' | 'PAUSED' | 'SUMMARY';
type GameMode = 'QUICK' | 'CHASE' | 'TOURNAMENT';
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

// ============================================================================
// 3. WEB AUDIO API SYNTHESIZER (NO EXTERNAL FILES)
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

// Deterministic pseudo-random helper for organic ground textures
function seededRandom(seed: number) {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

// Canal bank X boundary at a given world Y coordinate (winding natural canal along left edge)
function getCanalBankX(wy: number): number {
  return -218 + Math.sin(wy * 0.014) * 22 + Math.cos(wy * 0.008) * 14;
}

// Generator function for randomized Crow (Kaakka) or Paddy Heron/Egret (Kokk) sprites
export function generateRandomBirdSprites(
  viewportWidth: number = 1280,
  viewportHeight: number = 720,
  initialScatter: boolean = false
): FlyingBirdSprite[] {
  const species: 'CROW' | 'HERON' = Math.random() < 0.52 ? 'HERON' : 'CROW';
  const direction: 1 | -1 = Math.random() < 0.5 ? 1 : -1;
  const count =
    species === 'HERON'
      ? 1 + Math.floor(Math.random() * 3) // 1 to 3 graceful paddy herons in formation
      : 1 + Math.floor(Math.random() * 4); // 1 to 4 village crows

  const baseX = initialScatter
    ? Math.random() * viewportWidth
    : direction === 1
    ? -50 - Math.random() * 40
    : viewportWidth + 50 + Math.random() * 40;

  // Herons glide lower near the misty hills/paddy horizon; crows fly across upper-mid sky
  const baseY =
    species === 'HERON'
      ? viewportHeight * (0.11 + Math.random() * 0.13)
      : viewportHeight * (0.05 + Math.random() * 0.16);

  const baseSpeed =
    species === 'HERON'
      ? 34 + Math.random() * 18 // Slower, stately glide
      : 48 + Math.random() * 26; // Brisk crow flight

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
  const [mode, setMode] = useState<GameMode>('QUICK');
  const [overs, setOvers] = useState<number>(GAME_CONFIG.DEFAULT_OVERS);
  const [selectedRivalIdx, setSelectedRivalIdx] = useState<number>(0);
  const [selectedBatsmanId, setSelectedBatsmanId] = useState<string>('unni');
  const [unlockAllBatsmen, setUnlockAllBatsmen] = useState<boolean>(false);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('DAY');
  const [isMonsoon, setIsMonsoon] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [aimDir, setAimDir] = useState<AimDirection>(0);

  // In-memory session progression
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
  });

  // Coconut palms list around the village padam (uneven heights & natural leans)
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

  // Mutable simulation state inside ref for 60fps loop
  const simRef = useRef({
    screen: 'TITLE' as GameScreen,
    mode: 'QUICK' as GameMode,
    overs: GAME_CONFIG.DEFAULT_OVERS,
    rivalIdx: 0,
    batsmanId: 'unni',
    timeOfDay: 'DAY' as TimeOfDay,
    isMonsoon: false,
    aimDir: 0 as AimDirection,

    runs: 0,
    wickets: 0,
    balls: 0,
    totalBalls: 12,
    target: null as number | null,
    fours: 0,
    sixes: 0,
    bestShot: 'Classic Village Drive',
    lastBalls: [] as string[],

    phase: 'READY' as DeliveryPhase,
    phaseTimer: 1.2,
    ballType: 'FAST' as BallType,
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

    // Animated Village Life Entities
    boatY: -180,
    goat: { x: 168, y: -195, angle: 0, pauseTimer: 0 }, // Tied near the northern varambu bund
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

  const pickNextBallType = useCallback((rivalIdx: number): BallType => {
    const rival = GAME_CONFIG.RIVALS[rivalIdx] || GAME_CONFIG.RIVALS[0];
    const types: BallType[] = ['FAST', 'SPIN', 'SLOWER', 'BOUNCER'];
    if (Math.random() < 0.42) return rival.favoredBall;
    return types[Math.floor(Math.random() * types.length)];
  }, []);

  // Spawn dust puffs, mud splashes, or celebration particles
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

  const startMatch = useCallback(
    (customMode?: GameMode, customRivalIdx?: number, customOvers?: number) => {
      audio.init();
      const s = simRef.current;
      const activeMode = customMode ?? mode;
      const activeOvers = customOvers ?? overs;
      const activeRivalIdx =
        activeMode === 'TOURNAMENT'
          ? sessionStats.tournamentStage
          : customRivalIdx ?? selectedRivalIdx;

      const rival = GAME_CONFIG.RIVALS[activeRivalIdx] || GAME_CONFIG.RIVALS[0];
      const totalBalls = activeOvers * 6;
      const computedTarget =
        activeMode === 'QUICK'
          ? null
          : Math.round(activeOvers * rival.runsPerOver + (activeMode === 'TOURNAMENT' ? activeRivalIdx * 3 : 0));

      s.screen = 'PLAYING';
      s.mode = activeMode;
      s.overs = activeOvers;
      s.rivalIdx = activeRivalIdx;
      s.batsmanId = selectedBatsmanId;
      s.runs = 0;
      s.wickets = 0;
      s.balls = 0;
      s.totalBalls = totalBalls;
      s.target = computedTarget;
      s.fours = 0;
      s.sixes = 0;
      s.bestShot = 'Waiting for big shot...';
      s.lastBalls = [];

      s.phase = 'RUNUP';
      s.phaseTimer = 1.0;
      s.ballType = pickNextBallType(activeRivalIdx);
      s.ballProgress = 0;
      s.swung = false;
      s.batSwingAnim = 0;
      s.fielders = initFielders();
      s.particles = [];
      s.waterRipples = [];

      triggerPopup(
        [{ text: 'Kali Thudangam! Play Ball!', sub: 'കളി തുടങ്ങാം!' }],
        '#D4AF37'
      );

      setScreen('PLAYING');
      setHud({
        runs: 0,
        wickets: 0,
        balls: 0,
        totalBalls,
        target: computedTarget,
        fours: 0,
        sixes: 0,
        bestShot: 'None yet',
        bowlerType: s.ballType,
        popupText: s.popupText,
        popupSub: s.popupSub,
        popupColor: s.popupColor,
        lastBalls: [],
        matchResultTitle: '',
        matchWon: false,
        villageTitle: 'Padam Contender',
      });
    },
    [initFielders, mode, overs, pickNextBallType, selectedBatsmanId, selectedRivalIdx, sessionStats.tournamentStage]
  );

  const computeVillageTitle = (runs: number, sixes: number, wickets: number) => {
    if (sixes >= 4 || runs >= 48) return 'Padam King (പാടം രാജാവ്)';
    if (runs >= 30) return 'Chayakada Champion (ചായക്കട ചാമ്പ്യൻ)';
    if (runs >= 16) return 'Kuttanad Striker (കുട്ടനാട് സ്ട്രൈക്കർ)';
    if (wickets >= GAME_CONFIG.MAX_WICKETS && runs < 8) return 'Kayal Swimmer (കായൽ നീന്തൽക്കാരൻ)';
    return 'Ulsavam All-Rounder (ഉത്സവം താരം)';
  };

  const resolveDeliveryOutcome = useCallback(
    (runsScored: number, isOut: boolean, badge: string, shotDesc?: string) => {
      const s = simRef.current;
      s.runs += runsScored;
      if (isOut) s.wickets += 1;
      s.balls += 1;
      if (runsScored === 4) s.fours += 1;
      if (runsScored >= 6) s.sixes += 1;
      if (shotDesc) s.bestShot = shotDesc;
      s.lastBalls = [...s.lastBalls.slice(-7), badge];

      const chasedTarget = s.target !== null && s.runs >= s.target;
      const allOut = s.wickets >= GAME_CONFIG.MAX_WICKETS;
      const oversDone = s.balls >= s.totalBalls;

      if (chasedTarget || allOut || oversDone) {
        const won = s.target === null ? s.runs >= s.overs * 10 : s.runs >= s.target;
        const vTitle = computeVillageTitle(s.runs, s.sixes, s.wickets);
        const resultLabel =
          s.target === null
            ? `Innings Complete! Scored ${s.runs}/${s.wickets}`
            : won
            ? `Adipoli Victory! Target Chased!`
            : `Fallen Short by ${s.target - s.runs} Runs`;

        setSessionStats((prev) => {
          const newHigh = Math.max(prev.highScore, s.runs);
          const newUnlocked = new Set(prev.unlockedIds);
          if (newHigh >= 20 || s.runs >= 20) newUnlocked.add('appu');
          if (newHigh >= 40 || s.runs >= 40 || won) newUnlocked.add('ammachi');

          let nextStage = prev.tournamentStage;
          if (s.mode === 'TOURNAMENT') {
            if (won) {
              nextStage = (prev.tournamentStage + 1) % 3;
            } else {
              nextStage = 0;
            }
          }

          return {
            highScore: newHigh,
            matchesWon: prev.matchesWon + (won ? 1 : 0),
            unlockedIds: Array.from(newUnlocked),
            tournamentStage: nextStage,
          };
        });

        s.screen = 'SUMMARY';
        setScreen('SUMMARY');
        setHud({
          runs: s.runs,
          wickets: s.wickets,
          balls: s.balls,
          totalBalls: s.totalBalls,
          target: s.target,
          fours: s.fours,
          sixes: s.sixes,
          bestShot: s.bestShot,
          bowlerType: s.ballType,
          popupText: s.popupText,
          popupSub: s.popupSub,
          popupColor: s.popupColor,
          lastBalls: s.lastBalls,
          matchResultTitle: resultLabel,
          matchWon: won,
          villageTitle: vTitle,
        });
        return;
      }

      s.phase = 'RUNUP';
      s.phaseTimer = 1.25;
      s.ballType = pickNextBallType(s.rivalIdx);
      s.ballProgress = 0;
      s.swung = false;
      s.fielders.forEach((f) => {
        f.x = f.homeX;
        f.y = f.homeY;
      });

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
    [pickNextBallType]
  );

  const handleSwing = useCallback(() => {
    const s = simRef.current;
    if (s.screen !== 'PLAYING') return;
    if (s.phase !== 'BOWLING' || s.swung) return;

    s.swung = true;
    s.batSwingAnim = 1.0;

    const batsman = GAME_CONFIG.BATSMEN.find((b) => b.id === s.batsmanId) || GAME_CONFIG.BATSMEN[0];
    const delta = s.ballProgress - GAME_CONFIG.DIFFICULTY.SWEET_SPOT;
    const absDelta = Math.abs(delta);

    const perfWin = GAME_CONFIG.DIFFICULTY.PERFECT_WINDOW * batsman.timingMult;
    const goodWin = GAME_CONFIG.DIFFICULTY.GOOD_WINDOW * batsman.timingMult;
    const edgeWin = GAME_CONFIG.DIFFICULTY.EDGE_WINDOW * batsman.timingMult;

    const baseAngle =
      s.aimDir === -1
        ? -Math.PI * 0.76
        : s.aimDir === 1
        ? -Math.PI * 0.24
        : -Math.PI * 0.5;

    const timingSkew = delta * 1.9;
    const shotAngle = baseAngle + timingSkew;
    const isLuckyMiracle = absDelta <= edgeWin && absDelta > perfWin && Math.random() < batsman.luckyChance;

    if (absDelta <= perfWin || isLuckyMiracle) {
      audio.playBatHit('PERFECT');
      s.hitStopTimer = 0.055;
      s.shakeIntensity = 8;
      s.phase = 'HIT_FLIGHT';

      const power = (285 + Math.random() * 55) * batsman.powerMult;
      s.ball.vx = Math.cos(shotAngle) * power;
      s.ball.vy = Math.sin(shotAngle) * power;
      s.ball.vz = 195 + Math.random() * 45;
      s.ball.bounces = 0;

      spawnParticles(s.ball.x, s.ball.y, 20, '#D4AF37', 20, 1.1);
    } else if (absDelta <= goodWin) {
      audio.playBatHit('GOOD');
      s.hitStopTimer = 0.025;
      s.shakeIntensity = 3.5;
      s.phase = 'HIT_FLIGHT';

      const power = (185 + Math.random() * 45) * batsman.powerMult;
      s.ball.vx = Math.cos(shotAngle) * power;
      s.ball.vy = Math.sin(shotAngle) * power;
      s.ball.vz = 85 + Math.random() * 55;
      s.ball.bounces = 0;

      spawnParticles(s.ball.x, s.ball.y, 16, '#D6D3D1', 10, 0.8);
    } else if (absDelta <= edgeWin) {
      audio.playBatHit('EDGE');
      s.phase = 'HIT_FLIGHT';

      const edgeAngle = -Math.PI * (0.25 + Math.random() * 0.5);
      const power = 110 + Math.random() * 55;
      s.ball.vx = Math.cos(edgeAngle) * power;
      s.ball.vy = Math.sin(edgeAngle) * power;
      s.ball.vz = 155 + Math.random() * 40;
      s.ball.bounces = 0;
    } else {
      audio.playBatHit('MISS');
    }
  }, []);

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

  // Sync toggles into simulation ref & mark offscreen static background dirty
  useEffect(() => {
    simRef.current.timeOfDay = timeOfDay;
    simRef.current.isMonsoon = isMonsoon;
    simRef.current.batsmanId = selectedBatsmanId;
    simRef.current.mode = mode;
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
  }, [timeOfDay, isMonsoon, selectedBatsmanId, mode, overs, selectedRivalIdx]);

  // ==========================================================================
  // 6. OFFSCREEN STATIC ENVIRONMENT RENDERER (CALLED ONLY ON RESIZE / LIGHTING CHANGE)
  // ==========================================================================
  const renderStaticEnvironment = useCallback(
    (W: number, H: number) => {
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

      // Gentler Elevated Broadcast Camera Projection (Pitch runs vertically, no extreme tilt)
      const scale = Math.min(W / 900, H / 640);
      const cx = W * 0.51;
      const cy = H * 0.57;

      const toScreen = (wx: number, wy: number, wz: number = 0) => {
        // Gentle perspective foreshortening so pitch runs vertically and fielders stay proportionate
        const depthFactor = 1 + wy * 0.00055;
        const rx = wx * depthFactor;
        const ry = wy * 0.78 - wz * 0.92;
        return {
          x: cx + rx * scale,
          y: cy + ry * scale,
        };
      };

      // ----------------------------------------------------------------------
      // LAYER 1: ATMOSPHERIC SKY GRADIENT & LAYERED WESTERN GHATS HILLS
      // ----------------------------------------------------------------------
      const skyGrad = ctx.createLinearGradient(0, 0, 0, H * 0.34);
      skyGrad.addColorStop(0, palette.skyTop);
      skyGrad.addColorStop(0.55, palette.skyMid);
      skyGrad.addColorStop(1, palette.skyHorizon);
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, W, H * 0.35);

      // Soft glowing sun / evening orb near horizon
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

      // Far Hazy Western Ghats Mountain Ridge
      ctx.fillStyle = palette.distantHills;
      ctx.beginPath();
      ctx.moveTo(0, H * 0.24);
      ctx.bezierCurveTo(W * 0.18, H * 0.14, W * 0.36, H * 0.21, W * 0.54, H * 0.16);
      ctx.bezierCurveTo(W * 0.72, H * 0.11, W * 0.88, H * 0.19, W, H * 0.15);
      ctx.lineTo(W, H * 0.36);
      ctx.lineTo(0, H * 0.36);
      ctx.closePath();
      ctx.fill();

      // Morning / Evening Mist band between hills
      const mistGrad = ctx.createLinearGradient(0, H * 0.18, 0, H * 0.28);
      mistGrad.addColorStop(0, 'rgba(254, 243, 199, 0)');
      mistGrad.addColorStop(0.5, s.isMonsoon ? 'rgba(203, 213, 225, 0.28)' : 'rgba(254, 243, 199, 0.26)');
      mistGrad.addColorStop(1, 'rgba(254, 243, 199, 0)');
      ctx.fillStyle = mistGrad;
      ctx.fillRect(0, H * 0.17, W, H * 0.12);

      // Closer Rolling Green Foothills & Distant Palm Treeline Silhouette
      ctx.fillStyle = palette.midHills;
      ctx.beginPath();
      ctx.moveTo(0, H * 0.26);
      ctx.quadraticCurveTo(W * 0.28, H * 0.2, W * 0.55, H * 0.25);
      ctx.quadraticCurveTo(W * 0.82, H * 0.21, W, H * 0.26);
      ctx.lineTo(W, H);
      ctx.lineTo(0, H);
      ctx.closePath();
      ctx.fill();

      // Distant Treeline Silhouettes along Horizon
      ctx.fillStyle = s.timeOfDay === 'EVENING' ? '#142214' : '#264015';
      for (let i = 0; i < 38; i++) {
        const tx = (i / 37) * W;
        const ty = H * (0.235 + Math.sin(i * 0.7) * 0.012);
        const r = (10 + (i % 4) * 4) * scale;
        ctx.beginPath();
        ctx.arc(tx, ty, r, Math.PI, 0);
        ctx.fill();
      }

      // ----------------------------------------------------------------------
      // LAYER 2: HARVESTED PADDY FIELD ("PADAM") BASE & ORGANIC NOISE TEXTURE
      // ----------------------------------------------------------------------
      ctx.fillStyle = palette.padamBase;
      ctx.fillRect(0, H * 0.24, W, H * 0.76);

      // Irregular, organic harvested paddy ground shape (NOT a stadium oval!)
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

      // Noise-based organic colour variation (olive, khaki, dusty green, cracked brown-grey earth)
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

      // Worn bare sandy-soil patches where fielders stand & near pitch ends
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

      // Cracked dry earth lines & golden-green paddy stubble tufts across the padam
      ctx.strokeStyle = s.isMonsoon ? 'rgba(30, 25, 20, 0.35)' : 'rgba(68, 55, 42, 0.35)';
      ctx.lineWidth = 1 * scale;
      for (let i = 0; i < 95; i++) {
        const cx1 = (seededRandom(i * 19.1) - 0.5) * 440;
        const cy1 = (seededRandom(i * 23.7) - 0.5) * 440;
        const p = toScreen(cx1, cy1, 0);
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + (seededRandom(i) - 0.5) * 18 * scale, p.y + (seededRandom(i + 1) - 0.5) * 10 * scale);
        ctx.lineTo(p.x + (seededRandom(i + 2) - 0.5) * 26 * scale, p.y + (seededRandom(i + 3) - 0.5) * 14 * scale);
        ctx.stroke();
      }

      // Golden-green harvested paddy stubble tufts
      for (let i = 0; i < 320; i++) {
        const sx = (seededRandom(i * 31.3) - 0.5) * 460;
        const sy = (seededRandom(i * 41.9) - 0.5) * 460;
        if (Math.abs(sx) < 28 && sy > -140 && sy < 130) continue; // Keep pitch clear
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

      // Monsoon Ground Puddles (reflective wet patches)
      if (s.isMonsoon) {
        const puddles = [
          { x: -75, y: -90, rx: 28, ry: 14 },
          { x: 88, y: 25, rx: 34, ry: 16 },
          { x: -55, y: 125, rx: 25, ry: 12 },
          { x: 110, y: -135, rx: 30, ry: 13 },
          { x: 6, y: -15, rx: 14, ry: 22 },
        ];
        puddles.forEach((pd) => {
          const pp = toScreen(pd.x, pd.y, 0);
          ctx.fillStyle = 'rgba(100, 116, 139, 0.48)';
          ctx.beginPath();
          ctx.ellipse(pp.x, pp.y, pd.rx * scale, pd.ry * scale, 0.15, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = 'rgba(148, 163, 184, 0.45)';
          ctx.lineWidth = 1 * scale;
          ctx.stroke();
        });
      }

      ctx.restore(); // End padam clip

      // ----------------------------------------------------------------------
      // LAYER 3: NATURAL BOUNDARIES (VARAMBU MUD BUND, TALL PADDY, LOW STONE WALL)
      // ----------------------------------------------------------------------
      // Raised Mud Bund ("Varambu") along top-right & northern edge
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

      // Grass tufts along the top of the mud varambu
      ctx.strokeStyle = '#4D7C0F';
      ctx.lineWidth = 1.5 * scale;
      for (let t = -180; t <= 180; t += 8) {
        const wy = -266 + Math.abs(t) * 0.12;
        const bp = toScreen(t, wy, 3);
        ctx.beginPath();
        ctx.moveTo(bp.x, bp.y);
        ctx.lineTo(bp.x - 3 * scale, bp.y - 9 * scale);
        ctx.moveTo(bp.x, bp.y);
        ctx.lineTo(bp.x + 2 * scale, bp.y - 10 * scale);
        ctx.stroke();
      }

      // Unharvested Tall Golden-Green Paddy Patch beyond the northern bund ("Padathil poyi" Auto-6 zone)
      for (let py = -310; py <= -255; py += 10) {
        for (let px = -165; px <= 155; px += 9) {
          const tp = toScreen(px + (py % 7), py, 0);
          ctx.strokeStyle = (px + py) % 2 === 0 ? '#65A30D' : '#CA8A04';
          ctx.lineWidth = 1.6 * scale;
          ctx.beginPath();
          ctx.moveTo(tp.x, tp.y);
          ctx.lineTo(tp.x + 2 * scale, tp.y - 13 * scale);
          ctx.stroke();
        }
      }

      // ----------------------------------------------------------------------
      // LAYER 4: WINDING VILLAGE CANAL ("KAYAL") WITH BANK, HYACINTH & REEDS
      // ----------------------------------------------------------------------
      // Draw winding muddy brown-green canal along the left edge
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

      const canalGrad = ctx.createLinearGradient(0, H * 0.25, W * 0.28, H);
      canalGrad.addColorStop(0, '#2F3E2E');
      canalGrad.addColorStop(0.5, palette.canalWater);
      canalGrad.addColorStop(1, '#3E4C36');
      ctx.fillStyle = canalGrad;
      ctx.fill();

      // Subtle water surface sheen lines
      ctx.strokeStyle = 'rgba(163, 177, 138, 0.22)';
      ctx.lineWidth = 1.2 * scale;
      for (let wy = -280; wy <= 260; wy += 26) {
        const bx = getCanalBankX(wy) - 45;
        const wp = toScreen(bx, wy, 0);
        ctx.beginPath();
        ctx.moveTo(wp.x - 18 * scale, wp.y);
        ctx.lineTo(wp.x + 18 * scale, wp.y);
        ctx.stroke();
      }
      ctx.restore();

      // Sloped Muddy Laterite & Grass Canal Bank
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

      // Floating Water Hyacinth (Payal) clusters & Canal Reeds
      for (let wy = -260; wy <= 240; wy += 38) {
        const bx = getCanalBankX(wy);
        // Floating green water hyacinth pads near bank edge
        const hp = toScreen(bx - 16 - (Math.abs(wy) % 18), wy, 0);
        ctx.fillStyle = '#3F6212';
        for (let c = 0; c < 4; c++) {
          ctx.beginPath();
          ctx.ellipse(
            hp.x + (c - 1.5) * 6 * scale,
            hp.y + (c % 2) * 4 * scale,
            6 * scale,
            3.5 * scale,
            0.2,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
        // Tiny violet hyacinth flower dot
        ctx.fillStyle = '#C084FC';
        ctx.beginPath();
        ctx.arc(hp.x, hp.y - 2 * scale, 2 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Tall Reeds on the canal bank
        const rp = toScreen(bx + 2, wy + 8, 0);
        ctx.strokeStyle = '#4D7C0F';
        ctx.lineWidth = 1.4 * scale;
        [-3, 0, 3].forEach((ox) => {
          ctx.beginPath();
          ctx.moveTo(rp.x, rp.y);
          ctx.lineTo(rp.x + ox * scale, rp.y - 14 * scale);
          ctx.stroke();
        });
      }

      // ----------------------------------------------------------------------
      // LAYER 5: COMPACTED RED-BROWN LATERITE CLAY PITCH
      // ----------------------------------------------------------------------
      // Irregular hand-prepared village pitch strip
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

      const pitchGrad = ctx.createLinearGradient(0, toScreen(0, -135, 0).y, 0, toScreen(0, 118, 0).y);
      pitchGrad.addColorStop(0, palette.pitchDark);
      pitchGrad.addColorStop(0.2, palette.pitchClay);
      pitchGrad.addColorStop(0.8, palette.pitchClay);
      pitchGrad.addColorStop(1, palette.pitchDark);
      ctx.fillStyle = pitchGrad;
      ctx.fill();

      // Cracks & worn bowler/batter footmarks on the laterite clay
      ctx.strokeStyle = 'rgba(45, 18, 8, 0.45)';
      ctx.lineWidth = 1 * scale;
      for (let py = -110; py <= 95; py += 18) {
        const cp = toScreen((py % 9) - 4, py, 0);
        ctx.beginPath();
        ctx.moveTo(cp.x - 6 * scale, cp.y);
        ctx.lineTo(cp.x + 2 * scale, cp.y + 3 * scale);
        ctx.lineTo(cp.x + 7 * scale, cp.y - 1 * scale);
        ctx.stroke();
      }

      // Faded hand-drawn lime/chalk crease lines
      const drawFadedCrease = (wy: number) => {
        const cL = toScreen(-16, wy, 0);
        const cR = toScreen(16, wy, 0);
        ctx.strokeStyle = 'rgba(245, 245, 244, 0.52)';
        ctx.lineWidth = 2 * scale;
        ctx.setLineDash([7 * scale, 3 * scale, 12 * scale, 2 * scale]);
        ctx.beginPath();
        ctx.moveTo(cL.x, cL.y);
        ctx.lineTo(cR.x, cR.y);
        ctx.stroke();
        ctx.setLineDash([]);
      };
      drawFadedCrease(-112);
      drawFadedCrease(95);
      ctx.restore();

      // ----------------------------------------------------------------------
      // LAYER 6: MIDGROUND VILLAGE ARCHITECTURE & TREES (TEMPLE, CHURCH, HOUSE,
      //          BANYAN TREE, JACKFRUIT TREE, BANANA PLANTS, CHAYAKADA, AUTO)
      // ----------------------------------------------------------------------
      // 1. Small Kerala Temple in the Distance (Left-Center Horizon)
      const templePos = toScreen(-125, -305, 0);
      ctx.save();
      ctx.translate(templePos.x, templePos.y);
      ctx.fillStyle = '#F5F5F4';
      ctx.fillRect(-16 * scale, -22 * scale, 32 * scale, 22 * scale);
      // Terracotta two-tier sloped roof
      ctx.fillStyle = '#9A3412';
      ctx.beginPath();
      ctx.moveTo(-22 * scale, -22 * scale);
      ctx.lineTo(0, -44 * scale);
      ctx.lineTo(22 * scale, -22 * scale);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#D97706';
      ctx.beginPath();
      ctx.arc(0, -46 * scale, 2.8 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 2. Small Village Church (Right-Center Horizon)
      const churchPos = toScreen(145, -298, 0);
      ctx.save();
      ctx.translate(churchPos.x, churchPos.y);
      ctx.fillStyle = '#FAFAF9';
      ctx.fillRect(-14 * scale, -24 * scale, 28 * scale, 24 * scale);
      ctx.fillStyle = '#991B1B';
      ctx.beginPath();
      ctx.moveTo(-17 * scale, -24 * scale);
      ctx.lineTo(0, -40 * scale);
      ctx.lineTo(17 * scale, -24 * scale);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#EAB308';
      ctx.lineWidth = 1.8 * scale;
      ctx.beginPath();
      ctx.moveTo(0, -50 * scale);
      ctx.lineTo(0, -39 * scale);
      ctx.moveTo(-4 * scale, -46 * scale);
      ctx.lineTo(4 * scale, -46 * scale);
      ctx.stroke();
      ctx.restore();

      // 3. Tiled-Roof Kerala House with Clothesline (Right Midground)
      const housePos = toScreen(225, -220, 0);
      ctx.save();
      ctx.translate(housePos.x, housePos.y);
      ctx.fillStyle = '#E7E5E4';
      ctx.fillRect(-28 * scale, -24 * scale, 56 * scale, 24 * scale);
      // Wooden pillars
      ctx.fillStyle = '#451A03';
      [-20, 0, 20].forEach((px) => ctx.fillRect(px * scale, -18 * scale, 2.5 * scale, 18 * scale));
      // Sloped Mangalore clay tile roof
      ctx.fillStyle = '#B45309';
      ctx.beginPath();
      ctx.moveTo(-34 * scale, -22 * scale);
      ctx.lineTo(-22 * scale, -40 * scale);
      ctx.lineTo(22 * scale, -40 * scale);
      ctx.lineTo(34 * scale, -22 * scale);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Clothesline tied between the house and nearby palm
      const clStart = toScreen(195, -210, 18);
      const clEnd = toScreen(250, -180, 18);
      ctx.strokeStyle = '#D6D3D1';
      ctx.lineWidth = 1 * scale;
      ctx.beginPath();
      ctx.moveTo(clStart.x, clStart.y);
      ctx.lineTo(clEnd.x, clEnd.y);
      ctx.stroke();
      ['#DC2626', '#2563EB', '#FACC15', '#16A34A'].forEach((col, idx) => {
        const frac = (idx + 1) / 5;
        const lx = clStart.x + (clEnd.x - clStart.x) * frac;
        const ly = clStart.y + (clEnd.y - clStart.y) * frac;
        ctx.fillStyle = col;
        ctx.fillRect(lx - 4 * scale, ly, 8 * scale, 11 * scale);
      });

      // 4. Ancient Banyan Tree ("Aalmaram") with Aerial Roots & Stone Platform (Left-Top Midground)
      const banyanPos = toScreen(-165, -230, 0);
      ctx.save();
      ctx.translate(banyanPos.x, banyanPos.y);
      // Laterite stone platform (Althara)
      ctx.fillStyle = '#78350F';
      ctx.fillRect(-26 * scale, -6 * scale, 52 * scale, 8 * scale);
      // Thick gnarled trunk & hanging aerial roots
      ctx.fillStyle = '#44403C';
      ctx.fillRect(-10 * scale, -42 * scale, 20 * scale, 36 * scale);
      ctx.strokeStyle = '#57534E';
      ctx.lineWidth = 1.6 * scale;
      [-16, -11, 12, 17].forEach((rx) => {
        ctx.beginPath();
        ctx.moveTo(rx * scale, -36 * scale);
        ctx.lineTo((rx + 1) * scale, -6 * scale);
        ctx.stroke();
      });
      // Lush layered banyan canopy
      ctx.fillStyle = '#14532D';
      ctx.beginPath();
      ctx.ellipse(0, -52 * scale, 44 * scale, 24 * scale, 0, 0, Math.PI * 2);
      ctx.ellipse(-22 * scale, -44 * scale, 28 * scale, 18 * scale, 0, 0, Math.PI * 2);
      ctx.ellipse(22 * scale, -44 * scale, 28 * scale, 18 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 5. Jackfruit Tree ("Plavu") with Hanging Jackfruits (Right Midground)
      const jackPos = toScreen(265, -145, 0);
      ctx.save();
      ctx.translate(jackPos.x, jackPos.y);
      ctx.fillStyle = '#451A03';
      ctx.fillRect(-6 * scale, -38 * scale, 12 * scale, 38 * scale);
      // Hanging green spiny jackfruits (Chakka) on the trunk
      ctx.fillStyle = '#65A30D';
      ctx.beginPath();
      ctx.ellipse(-8 * scale, -22 * scale, 4.5 * scale, 7 * scale, 0.2, 0, Math.PI * 2);
      ctx.ellipse(8 * scale, -16 * scale, 4 * scale, 6.5 * scale, -0.2, 0, Math.PI * 2);
      ctx.fill();
      // Canopy
      ctx.fillStyle = '#166534';
      ctx.beginPath();
      ctx.arc(0, -48 * scale, 26 * scale, 0, Math.PI * 2);
      ctx.arc(-14 * scale, -40 * scale, 18 * scale, 0, Math.PI * 2);
      ctx.arc(14 * scale, -40 * scale, 18 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 6. Banana Plants ("Vazha") with Broad Leaves
      const drawBananaPlant = (wx: number, wy: number) => {
        const bp = toScreen(wx, wy, 0);
        ctx.save();
        ctx.translate(bp.x, bp.y);
        ctx.fillStyle = '#4D7C0F';
        ctx.fillRect(-2.5 * scale, -18 * scale, 5 * scale, 18 * scale);
        const leafAngles = [-2.4, -1.8, -1.2, -0.6, -0.2];
        ctx.fillStyle = '#65A30D';
        leafAngles.forEach((ang) => {
          ctx.save();
          ctx.translate(0, -18 * scale);
          ctx.rotate(ang);
          ctx.beginPath();
          ctx.ellipse(12 * scale, 0, 13 * scale, 4 * scale, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });
        ctx.restore();
      };
      drawBananaPlant(232, -165);
      drawBananaPlant(248, -155);
      drawBananaPlant(-182, -195);

      // 7. Chayakada (Village Tea Shop with Weathered Corrugated Tin Roof)
      const chayaPos = toScreen(255, -88, 0);
      ctx.save();
      ctx.translate(chayaPos.x, chayaPos.y);
      // Long golden-hour shadow
      ctx.fillStyle = palette.shadowColor;
      ctx.beginPath();
      ctx.ellipse(-18 * scale, 4 * scale, 44 * scale, 12 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
      // Wooden shop shack & open front counter
      ctx.fillStyle = '#5C4033';
      ctx.fillRect(-34 * scale, -30 * scale, 68 * scale, 32 * scale);
      ctx.fillStyle = '#271911';
      ctx.fillRect(-26 * scale, -24 * scale, 52 * scale, 16 * scale);
      // Warm glowing lantern inside chayakada in Evening/Monsoon
      if (s.timeOfDay === 'EVENING' || s.isMonsoon) {
        const glow = ctx.createRadialGradient(0, -18 * scale, 2 * scale, 0, -18 * scale, 38 * scale);
        glow.addColorStop(0, 'rgba(251, 191, 36, 0.85)');
        glow.addColorStop(1, 'rgba(251, 191, 36, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(0, -18 * scale, 38 * scale, 0, Math.PI * 2);
        ctx.fill();
      }
      // Brass samovar & glass jars
      ctx.fillStyle = '#D97706';
      ctx.fillRect(-18 * scale, -18 * scale, 9 * scale, 11 * scale);
      // Hanging ripe banana bunches
      ctx.fillStyle = '#EAB308';
      ctx.beginPath();
      ctx.arc(16 * scale, -19 * scale, 5.5 * scale, 0, Math.PI * 2);
      ctx.arc(23 * scale, -18 * scale, 4.5 * scale, 0, Math.PI * 2);
      ctx.fill();
      // Corrugated Rusty/Silver Tin Roof
      ctx.fillStyle = '#94A3B8';
      ctx.beginPath();
      ctx.moveTo(-42 * scale, -28 * scale);
      ctx.lineTo(-30 * scale, -48 * scale);
      ctx.lineTo(32 * scale, -48 * scale);
      ctx.lineTo(44 * scale, -28 * scale);
      ctx.closePath();
      ctx.fill();
      // Rust patches & ridges on tin roof
      ctx.fillStyle = 'rgba(154, 52, 18, 0.38)';
      ctx.fillRect(-18 * scale, -43 * scale, 22 * scale, 8 * scale);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.3 * scale;
      for (let rx = -28; rx <= 28; rx += 8) {
        ctx.beginPath();
        ctx.moveTo(rx * scale, -48 * scale);
        ctx.lineTo((rx + 4) * scale, -28 * scale);
        ctx.stroke();
      }
      ctx.restore();

      // 8. Parked Kerala Auto-Rickshaw near the Chayakada
      const autoPos = toScreen(272, 22, 0);
      ctx.save();
      ctx.translate(autoPos.x, autoPos.y);
      ctx.fillStyle = palette.shadowColor;
      ctx.beginPath();
      ctx.ellipse(-6 * scale, 2 * scale, 24 * scale, 8 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1C1917';
      ctx.fillRect(-18 * scale, -13 * scale, 36 * scale, 11 * scale);
      ctx.fillStyle = '#EAB308';
      ctx.beginPath();
      ctx.roundRect(-16 * scale, -26 * scale, 32 * scale, 14 * scale, 5 * scale);
      ctx.fill();
      ctx.fillStyle = '#0C0A09';
      ctx.beginPath();
      ctx.arc(-12 * scale, -2 * scale, 4.5 * scale, 0, Math.PI * 2);
      ctx.arc(12 * scale, -2 * scale, 4.5 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 9. Low Laterite Stone Wall ("Kallu Mathil") on Right-Bottom Edge
      const wallStart = toScreen(185, 175, 0);
      const wallEnd = toScreen(275, 85, 0);
      ctx.strokeStyle = '#7C2D12';
      ctx.lineWidth = 13 * scale;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(wallStart.x, wallStart.y);
      ctx.lineTo(wallEnd.x, wallEnd.y);
      ctx.stroke();
      // Individual laterite stone blocks texture
      ctx.strokeStyle = '#451A03';
      ctx.lineWidth = 1.2 * scale;
      for (let t = 0.08; t <= 0.92; t += 0.12) {
        const bx = wallStart.x + (wallEnd.x - wallStart.x) * t;
        const by = wallStart.y + (wallEnd.y - wallStart.y) * t;
        ctx.strokeRect(bx - 5 * scale, by - 4 * scale, 10 * scale, 6 * scale);
      }

      // 10. Static Coconut Palm Trunks & Long Golden-Hour Shadows (Fronds sway in dynamic loop)
      palmsRef.current.forEach((palm) => {
        const base = toScreen(palm.wx, palm.wy, 0);
        const top = toScreen(palm.wx + palm.lean, palm.wy, palm.height);

        // Long golden-hour ground shadow
        const shadowEnd = toScreen(palm.wx - 65, palm.wy + 25, 0);
        ctx.strokeStyle = palette.shadowColor;
        ctx.lineWidth = 5 * scale;
        ctx.beginPath();
        ctx.moveTo(base.x, base.y);
        ctx.lineTo(shadowEnd.x, shadowEnd.y);
        ctx.stroke();

        // Ringed coconut trunk
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

      // 11. Foreground Details (Stones, Tall Grass Tufts, Discarded Plastic Chair & Wooden Bench)
      // Wooden bench near bottom-left canal bank
      const benchPos = toScreen(-155, 215, 0);
      ctx.save();
      ctx.translate(benchPos.x, benchPos.y);
      ctx.fillStyle = '#5C4033';
      ctx.fillRect(-20 * scale, -8 * scale, 40 * scale, 4 * scale);
      ctx.fillRect(-16 * scale, -4 * scale, 3 * scale, 7 * scale);
      ctx.fillRect(13 * scale, -4 * scale, 3 * scale, 7 * scale);
      ctx.restore();

      // Discarded blue plastic village chair near bottom-right boundary
      const chairPos = toScreen(165, 212, 0);
      ctx.save();
      ctx.translate(chairPos.x, chairPos.y);
      ctx.rotate(0.18);
      ctx.fillStyle = '#1D4ED8';
      ctx.fillRect(-8 * scale, -14 * scale, 16 * scale, 10 * scale);
      ctx.fillStyle = '#2563EB';
      ctx.fillRect(-9 * scale, -6 * scale, 18 * scale, 4 * scale);
      ctx.strokeStyle = '#1E40AF';
      ctx.lineWidth = 1.8 * scale;
      ctx.beginPath();
      ctx.moveTo(-7 * scale, -2 * scale);
      ctx.lineTo(-8 * scale, 5 * scale);
      ctx.moveTo(7 * scale, -2 * scale);
      ctx.lineTo(8 * scale, 5 * scale);
      ctx.stroke();
      ctx.restore();

      // Foreground stones & tall grass tufts along bottom edge
      const fgSpots = [-210, -130, -65, 55, 125, 205];
      fgSpots.forEach((fx, idx) => {
        const fp = toScreen(fx, 242 + (idx % 3) * 8, 0);
        // Laterite stones
        ctx.fillStyle = '#57534E';
        ctx.beginPath();
        ctx.ellipse(fp.x, fp.y, 7 * scale, 4.5 * scale, 0.2, 0, Math.PI * 2);
        ctx.fill();
        // Tall grass blades
        ctx.strokeStyle = '#3F6212';
        ctx.lineWidth = 1.8 * scale;
        [-4, -1, 2, 5].forEach((gx) => {
          ctx.beginPath();
          ctx.moveTo(fp.x + gx * scale, fp.y);
          ctx.lineTo(fp.x + (gx * 1.8) * scale, fp.y - 16 * scale);
          ctx.stroke();
        });
      });

      bgDirtyRef.current = false;
    },
    []
  );

  // ==========================================================================
  // 7. MAIN 60FPS UPDATE & DYNAMIC RENDER LOOP
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

      // ----------------------------------------------------------------------
      // A. SIMULATION UPDATE
      // ----------------------------------------------------------------------
      if (s.hitStopTimer > 0) {
        s.hitStopTimer -= dt;
      } else if (s.screen !== 'PAUSED') {
        if (s.shakeIntensity > 0) s.shakeIntensity = Math.max(0, s.shakeIntensity - dt * 28);
        if (s.popupTimer > 0) s.popupTimer = Math.max(0, s.popupTimer - dt);
        if (s.batSwingAnim > 0) s.batSwingAnim = Math.max(0, s.batSwingAnim - dt * 3.8);
        if (s.grassFlutterTimer > 0) s.grassFlutterTimer = Math.max(0, s.grassFlutterTimer - dt);

        // Animate wooden boat / kettuvallam along the winding canal
        s.boatY += dt * 11;
        if (s.boatY > 210) s.boatY = -240;

        // Animate goat tied near the northern bund (wanders in a tether arc)
        if (s.goat.pauseTimer > 0) {
          s.goat.pauseTimer -= dt;
        } else {
          s.goat.angle += dt * 0.65;
          s.goat.x = 148 + Math.cos(s.goat.angle) * 18;
          s.goat.y = -215 + Math.sin(s.goat.angle) * 10;
        }

        // Animate wandering village dog near bottom boundary
        s.dog.x += s.dog.vx * dt;
        s.dog.y += s.dog.vy * dt;
        if (s.dog.x < -150 || s.dog.x > -40) s.dog.vx *= -1;
        if (s.dog.y < 145 || s.dog.y > 195) s.dog.vy *= -1;

        // Periodically spawn new randomized crow or paddy heron flocks across the background
        s.birdSpawnTimer -= dt;
        const currentW = canvasRef.current?.width || 1280;
        const currentH = canvasRef.current?.height || 720;
        if (s.birdSpawnTimer <= 0) {
          if (s.skyBirds.length < 14) {
            s.skyBirds.push(...generateRandomBirdSprites(currentW, currentH, false));
          }
          s.birdSpawnTimer = 4.2 + Math.random() * 3.8;
        }

        // Animate sky birds (crows & paddy herons) crossing horizon
        s.skyBirds = s.skyBirds.filter((b) => {
          b.x += b.vx * dt;
          b.y += b.vy * dt + Math.sin(b.wingPhase) * 0.12;
          b.wingPhase += dt * b.flapSpeed;
          return b.x > -140 && b.x < currentW + 140;
        });

        // Update particles (dust puffs & boundary bursts)
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

        // Continuous subtle ripples in the canal (more frequent in monsoon)
        if (Math.random() < (s.isMonsoon ? 0.35 : 0.06)) {
          const ry = -220 + Math.random() * 440;
          const rx = getCanalBankX(ry) - 25 - Math.random() * 45;
          s.waterRipples.push({ x: rx, y: ry, r: 2, alpha: 0.65 });
        }

        s.waterRipples = s.waterRipples.filter((r) => {
          r.r += dt * 32;
          r.alpha -= dt * 0.65;
          return r.alpha > 0;
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

        // Active Gameplay Delivery Phases
        if (s.screen === 'PLAYING') {
          const rival = GAME_CONFIG.RIVALS[s.rivalIdx] || GAME_CONFIG.RIVALS[0];

          if (s.phase === 'RUNUP') {
            s.phaseTimer -= dt;
            const runupFrac = 1 - Math.max(0, s.phaseTimer);
            s.ball.x = 6;
            s.ball.y = -170 + runupFrac * 48;
            s.ball.z = 26;

            if (s.phaseTimer <= 0) {
              s.phase = 'BOWLING';
              s.ballProgress = 0;
              const typeSpeedMult =
                s.ballType === 'FAST'
                  ? 1.18
                  : s.ballType === 'SLOWER'
                  ? 0.78
                  : s.ballType === 'BOUNCER'
                  ? 1.12
                  : 0.92;
              s.ballSpeed = GAME_CONFIG.DIFFICULTY.BASE_BALL_SPEED * rival.speedMult * typeSpeedMult;
              s.ballSpinCurve = s.ballType === 'SPIN' ? (Math.random() > 0.5 ? 24 : -24) : 0;
            }
          } else if (s.phase === 'BOWLING') {
            const monsoonPitchMod =
              s.isMonsoon && s.ballProgress > 0.55 ? GAME_CONFIG.DIFFICULTY.MONSOON_SKID : 1.0;

            const prevP = s.ballProgress;
            s.ballProgress += s.ballSpeed * monsoonPitchMod * dt;

            const p = s.ballProgress;
            const bouncePoint = s.ballType === 'BOUNCER' ? 0.45 : 0.62;
            const lateralSpin = p > bouncePoint ? ((p - bouncePoint) / (1 - bouncePoint)) * s.ballSpinCurve : 0;

            s.ball.x = (1 - p) * 5 + lateralSpin;
            s.ball.y = -122 + p * 228;

            // Spawn a dust puff when the ball pitches on the laterite clay
            if (prevP < bouncePoint && p >= bouncePoint) {
              spawnParticles(s.ball.x, s.ball.y, 2, s.isMonsoon ? '#78716C' : '#D6B89A', 8, 0.45);
            }

            if (p < bouncePoint) {
              s.ball.z = 28 * (1 - p / bouncePoint);
            } else {
              const afterFrac = (p - bouncePoint) / (1 - bouncePoint);
              const peakZ = s.ballType === 'BOUNCER' ? 38 : 19;
              s.ball.z = Math.sin(afterFrac * Math.PI * 0.85) * peakZ;
            }

            if (s.ballProgress >= 1.02) {
              const hitStumps = Math.abs(s.ball.x) < 14 && s.ballType !== 'BOUNCER';
              if (hitStumps) {
                audio.playWicketSound();
                s.shakeIntensity = 7;
                spawnParticles(0, 105, 16, '#D97706', 18, 0.9);
                triggerPopup(COMMENTARY.BOWLED_OUT, '#EF4444');
                s.phase = 'BALL_SETTLED';
                s.phaseTimer = 1.35;
                setTimeout(() => resolveDeliveryOutcome(0, true, 'W'), 950);
              } else {
                triggerPopup(COMMENTARY.DOT, '#94A3B8');
                s.phase = 'BALL_SETTLED';
                s.phaseTimer = 1.1;
                setTimeout(() => resolveDeliveryOutcome(0, false, '0'), 800);
              }
            }
          } else if (s.phase === 'HIT_FLIGHT') {
            const grassDrag =
              s.ball.z <= 2
                ? s.isMonsoon
                  ? GAME_CONFIG.DIFFICULTY.MONSOON_SLOWDOWN
                  : 0.92
                : 0.995;

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
              // Dust / mud puff on ground bounce
              spawnParticles(s.ball.x, s.ball.y, 1, s.isMonsoon ? '#57534E' : '#C2A878', 7, 0.4);
            }

            const fSpeed = GAME_CONFIG.DIFFICULTY.FIELDER_SPEED * rival.fielderBoost;
            let caughtByFielder = false;
            let stoppedByFielder = false;

            for (const f of s.fielders) {
              const dx = s.ball.x - f.x;
              const dy = s.ball.y - f.y;
              const dist = Math.hypot(dx, dy);
              if (dist > 4) {
                f.x += (dx / dist) * fSpeed * dt;
                f.y += (dy / dist) * fSpeed * dt;
              }

              if (s.ball.bounces === 0 && s.ball.z < 52 && dist < GAME_CONFIG.DIFFICULTY.CATCH_RADIUS) {
                caughtByFielder = true;
                break;
              }
              if (s.ball.bounces > 0 && s.ball.z < 15 && dist < 22) {
                stoppedByFielder = true;
                break;
              }
            }

            // ----------------------------------------------------------------
            // CHECK REALISTIC VILLAGE BOUNDARIES & RULES
            // ----------------------------------------------------------------
            const distFromCenter = Math.hypot(s.ball.x * 0.9, (s.ball.y + 10) * 0.95);
            const canalEdgeX = getCanalBankX(s.ball.y);

            // 1. Caught by Fielder
            if (caughtByFielder) {
              audio.playWicketSound();
              triggerPopup(COMMENTARY.CAUGHT_OUT, '#EF4444');
              spawnParticles(s.ball.x, s.ball.y, 15, '#EF4444', 16);
              s.phase = 'BALL_SETTLED';
              setTimeout(() => resolveDeliveryOutcome(0, true, 'W'), 1000);
            }
            // 2. Hit Tied Goat near Bund or Pecking Hens (Comic Pause, 0 Runs)
            else if (
              (Math.hypot(s.ball.x - s.goat.x, s.ball.y - s.goat.y) < 30 ||
                Math.hypot(s.ball.x - 155, s.ball.y - 150) < 28) &&
              s.ball.z < 36
            ) {
              audio.playGoatBleat();
              s.goat.pauseTimer = 1.8;
              triggerPopup(COMMENTARY.ANIMAL_DOT, '#F59E0B');
              spawnParticles(s.ball.x, s.ball.y, 18, '#FDE047', 14);
              s.phase = 'BALL_SETTLED';
              setTimeout(() => resolveDeliveryOutcome(0, false, '🐐', 'Animal Interception!'), 1100);
            }
            // 3. Hit Chayakada Tin Roof (x: 215..305, y: -135..-45) -> Crows scatter + +2 Bonus Runs!
            else if (s.ball.x > 210 && s.ball.x < 310 && s.ball.y > -140 && s.ball.y < -40 && s.ball.z < 65) {
              audio.playTinRoofClang();
              audio.playChendaBoundaryBeat();
              s.shakeIntensity = 7;
              s.crows.forEach((c) => (c.flying = 1.8));
              const totalRoofRuns = s.ball.bounces === 0 ? 6 : 4;
              const withBonus = totalRoofRuns + 2;
              triggerPopup(COMMENTARY.ROOF, '#38BDF8');
              spawnParticles(s.ball.x, s.ball.y, 40, '#E2E8F0', 22);
              s.phase = 'BALL_SETTLED';
              setTimeout(
                () => resolveDeliveryOutcome(withBonus, false, `${withBonus}`, `Chayakada Tin Roof (${withBonus} Runs)`),
                1100
              );
            }
            // 4. Ball Hit into Winding Canal ("Kayal" x < canalEdgeX) = OUT!
            else if (s.ball.x < canalEdgeX && s.ball.z <= 14) {
              audio.playSplash();
              s.waterRipples.push({ x: s.ball.x, y: s.ball.y, r: 5, alpha: 1.0 });
              s.waterRipples.push({ x: s.ball.x, y: s.ball.y, r: 16, alpha: 0.85 });
              triggerPopup(COMMENTARY.CANAL_OUT, '#EF4444');
              s.phase = 'BALL_SETTLED';
              setTimeout(() => resolveDeliveryOutcome(0, true, '🌊', 'Kayal Splash'), 1100);
            }
            // 5. Ball Lost in Tall Paddy beyond the Northern Bund (y < -242) = AUTO SIX!
            else if (s.ball.y < -242) {
              audio.playChendaBoundaryBeat();
              s.shakeIntensity = 8;
              s.grassFlutterTimer = 1.5;
              triggerPopup(COMMENTARY.PADDY_SIX, '#4ADE80');
              spawnParticles(s.ball.x, s.ball.y, 18, '#84CC16', 26);
              s.phase = 'BALL_SETTLED';
              setTimeout(() => resolveDeliveryOutcome(6, false, '6', 'Padam Auto-Sixer!'), 1100);
            }
            // 6. Crossed Natural Boundary (Mud Varambu / Palm Line / Stone Wall)
            else if (distFromCenter > 248) {
              audio.playChendaBoundaryBeat();
              s.grassFlutterTimer = 1.4;
              if (s.ball.bounces === 0) {
                s.shakeIntensity = 9;
                triggerPopup(COMMENTARY.SIX, '#D4AF37');
                spawnParticles(s.ball.x, s.ball.y, 24, '#84CC16', 24);
                s.phase = 'BALL_SETTLED';
                setTimeout(() => resolveDeliveryOutcome(6, false, '6', 'Towering Coconut Six!'), 1050);
              } else {
                s.shakeIntensity = 4.5;
                triggerPopup(COMMENTARY.FOUR, '#FACC15');
                spawnParticles(s.ball.x, s.ball.y, 12, '#A3E635', 18);
                s.phase = 'BALL_SETTLED';
                setTimeout(() => resolveDeliveryOutcome(4, false, '4', 'Varambu Boundary Four'), 1000);
              }
            }
            // 7. Stopped in infield or ball slowed down
            else if (stoppedByFielder || Math.hypot(s.ball.vx, s.ball.vy) < 28) {
              const runsEarned = distFromCenter > 130 ? 2 : distFromCenter > 52 ? 1 : 0;
              if (runsEarned > 0) {
                triggerPopup(COMMENTARY.RUNS, '#E2E8F0');
              } else {
                triggerPopup(COMMENTARY.DOT, '#94A3B8');
              }
              s.phase = 'BALL_SETTLED';
              setTimeout(
                () =>
                  resolveDeliveryOutcome(
                    runsEarned,
                    false,
                    `${runsEarned}`,
                    runsEarned === 2 ? 'Quick Padam Double' : undefined
                  ),
                850
              );
            }
          }
        }
      }

      // ----------------------------------------------------------------------
      // B. RENDER FRAME (BLIT OFFSCREEN STATIC CANVAS + ANIMATE DYNAMIC ELEMENTS)
      // ----------------------------------------------------------------------
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const W = canvas.width;
          const H = canvas.height;

          if (
            bgDirtyRef.current ||
            !bgCanvasRef.current ||
            bgCanvasRef.current.width !== W ||
            bgCanvasRef.current.height !== H
          ) {
            renderStaticEnvironment(W, H);
          }

          ctx.save();

          if (s.shakeIntensity > 0) {
            const sx = (Math.random() - 0.5) * s.shakeIntensity * 2;
            const sy = (Math.random() - 0.5) * s.shakeIntensity * 2;
            ctx.translate(sx, sy);
          }

          // 1. Blit pre-rendered static ground & background in one fast drawImage call
          if (bgCanvasRef.current) {
            ctx.drawImage(bgCanvasRef.current, 0, 0);
          }

          const scale = Math.min(W / 900, H / 640);
          const cx = W * 0.51;
          const cy = H * 0.57;
          const palette = s.isMonsoon
            ? GAME_CONFIG.COLORS.MONSOON
            : s.timeOfDay === 'EVENING'
            ? GAME_CONFIG.COLORS.EVENING
            : GAME_CONFIG.COLORS.DAY;

          const toScreen = (wx: number, wy: number, wz: number = 0) => {
            const depthFactor = 1 + wy * 0.00055;
            const rx = wx * depthFactor;
            const ry = wy * 0.78 - wz * 0.92;
            return {
              x: cx + rx * scale,
              y: cy + ry * scale,
            };
          };

          // 2. Animated Drifting Clouds & Sky Birds
          ctx.fillStyle = s.isMonsoon
            ? 'rgba(71, 85, 105, 0.55)'
            : s.timeOfDay === 'EVENING'
            ? 'rgba(251, 146, 60, 0.25)'
            : 'rgba(255, 251, 235, 0.48)';
          for (let i = 0; i < 5; i++) {
            const cloudX = ((i * 290 + now * 0.009) % (W + 260)) - 130;
            const cloudY = H * (0.05 + (i % 3) * 0.035);
            ctx.beginPath();
            ctx.ellipse(cloudX, cloudY, 64 * scale, 18 * scale, 0, 0, Math.PI * 2);
            ctx.ellipse(cloudX + 32 * scale, cloudY - 6 * scale, 44 * scale, 14 * scale, 0, 0, Math.PI * 2);
            ctx.fill();
          }

          // Render Randomized Crow & Paddy Heron Sprites Across the Sky
          s.skyBirds.forEach((b) => {
            const bScale = scale * b.size;
            const flap = Math.sin(b.wingPhase);
            ctx.save();
            ctx.translate(b.x, b.y);
            if (b.direction === -1) ctx.scale(-1, 1);

            if (b.species === 'HERON') {
              // White Paddy Heron / Egret (Kokk): slender white body, trailing legs, S-curved neck, yellow beak, sweeping wings
              // Trailing long legs
              ctx.strokeStyle = '#475569';
              ctx.lineWidth = 1.2 * bScale;
              ctx.beginPath();
              ctx.moveTo(-5 * bScale, 0.5 * bScale);
              ctx.lineTo(-13 * bScale, 2.5 * bScale);
              ctx.moveTo(-5 * bScale, 1.5 * bScale);
              ctx.lineTo(-12 * bScale, 3.5 * bScale);
              ctx.stroke();

              // Slender white body & S-neck
              ctx.fillStyle = s.timeOfDay === 'EVENING' ? '#E2E8F0' : '#F8FAFC';
              ctx.beginPath();
              ctx.ellipse(0, 0, 6.5 * bScale, 2.2 * bScale, -0.08, 0, Math.PI * 2);
              ctx.fill();

              // S-curved neck & head
              ctx.strokeStyle = s.timeOfDay === 'EVENING' ? '#E2E8F0' : '#FFFFFF';
              ctx.lineWidth = 2 * bScale;
              ctx.beginPath();
              ctx.moveTo(4.5 * bScale, -0.5 * bScale);
              ctx.quadraticCurveTo(7 * bScale, -3.5 * bScale, 9 * bScale, -1.5 * bScale);
              ctx.stroke();

              // Pointed yellow heron beak
              ctx.strokeStyle = '#F59E0B';
              ctx.lineWidth = 1.3 * bScale;
              ctx.beginPath();
              ctx.moveTo(9 * bScale, -1.5 * bScale);
              ctx.lineTo(13 * bScale, -1 * bScale);
              ctx.stroke();

              // Sweeping arched white wings
              const wingTipY = flap * 8.5 * bScale;
              const wingMidY = flap * 3.5 * bScale - 2.5 * bScale;
              ctx.strokeStyle = s.timeOfDay === 'EVENING' ? '#CBD5E1' : '#FFFFFF';
              ctx.lineWidth = 2.2 * bScale;
              ctx.lineCap = 'round';
              ctx.beginPath();
              ctx.moveTo(-1 * bScale, 0);
              ctx.quadraticCurveTo(-3 * bScale, wingMidY, -7 * bScale, wingTipY);
              ctx.moveTo(1 * bScale, 0);
              ctx.quadraticCurveTo(3 * bScale, wingMidY, 6 * bScale, wingTipY * 0.85);
              ctx.stroke();
            } else {
              // Indian House Crow (Kaakka): dark charcoal/black body, fanned tail, brisk flapping wings
              const crowColor = s.timeOfDay === 'EVENING' ? '#0F172A' : '#1C1917';
              ctx.fillStyle = crowColor;
              // Compact body
              ctx.beginPath();
              ctx.ellipse(0, 0, 5 * bScale, 2.2 * bScale, 0, 0, Math.PI * 2);
              ctx.fill();

              // Fanned tail feathers
              ctx.beginPath();
              ctx.moveTo(-4 * bScale, 0);
              ctx.lineTo(-8.5 * bScale, -1.8 * bScale);
              ctx.lineTo(-8.5 * bScale, 1.8 * bScale);
              ctx.closePath();
              ctx.fill();

              // Head & stout beak
              ctx.beginPath();
              ctx.arc(5 * bScale, -1 * bScale, 2 * bScale, 0, Math.PI * 2);
              ctx.fill();
              ctx.strokeStyle = '#334155';
              ctx.lineWidth = 1.3 * bScale;
              ctx.beginPath();
              ctx.moveTo(6.5 * bScale, -1 * bScale);
              ctx.lineTo(9.2 * bScale, -0.5 * bScale);
              ctx.stroke();

              // Flapping dark wings
              const wingTipY = flap * 6.5 * bScale;
              ctx.strokeStyle = crowColor;
              ctx.lineWidth = 2.1 * bScale;
              ctx.lineCap = 'round';
              ctx.beginPath();
              ctx.moveTo(-0.5 * bScale, -0.5 * bScale);
              ctx.quadraticCurveTo(-2 * bScale, wingTipY * 0.4 - 2 * bScale, -5.5 * bScale, wingTipY);
              ctx.moveTo(1 * bScale, -0.5 * bScale);
              ctx.quadraticCurveTo(3 * bScale, wingTipY * 0.4 - 2 * bScale, 5.5 * bScale, wingTipY * 0.9);
              ctx.stroke();
            }

            ctx.restore();
          });

          // 3. Canal Water Ripples & Small Wooden Country Boat / Kettuvallam
          s.waterRipples.forEach((rip) => {
            const rp = toScreen(rip.x, rip.y, 0);
            ctx.strokeStyle = `rgba(214, 211, 209, ${rip.alpha * 0.65})`;
            ctx.lineWidth = 1.4 * scale;
            ctx.beginPath();
            ctx.ellipse(rp.x, rp.y, rip.r * scale, rip.r * 0.55 * scale, 0, 0, Math.PI * 2);
            ctx.stroke();
          });

          const boatWorldX = getCanalBankX(s.boatY) - 42;
          const boatPt = toScreen(boatWorldX, s.boatY, 0);
          ctx.save();
          ctx.translate(boatPt.x, boatPt.y);
          ctx.rotate(0.12);
          // Proportionate wooden country vallam / small kettuvallam
          ctx.fillStyle = '#3E2723';
          ctx.beginPath();
          ctx.moveTo(-8 * scale, -22 * scale);
          ctx.quadraticCurveTo(8 * scale, 0, -5 * scale, 22 * scale);
          ctx.quadraticCurveTo(-14 * scale, 0, -8 * scale, -22 * scale);
          ctx.fill();
          // Woven thatch canopy
          ctx.fillStyle = '#A16207';
          ctx.beginPath();
          ctx.ellipse(-6 * scale, 0, 5.5 * scale, 11 * scale, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          // 4. Simple Wooden Stick Stumps (One slightly bent!) with Tiny Shadows
          const drawStickStumps = (wy: number) => {
            const configs = [
              { ox: -5.5, tilt: -0.5, h: 19 },
              { ox: 0, tilt: 0.3, h: 19.5 },
              { ox: 5.5, tilt: 2.4, h: 18 }, // Slightly bent wooden stick!
            ];
            configs.forEach((st) => {
              const base = toScreen(st.ox, wy, 0);
              const top = toScreen(st.ox + st.tilt, wy, st.h);
              // Tiny shadow under each stick
              ctx.strokeStyle = palette.shadowColor;
              ctx.lineWidth = 2 * scale;
              ctx.beginPath();
              ctx.moveTo(base.x, base.y);
              ctx.lineTo(base.x - 8 * scale, base.y + 3 * scale);
              ctx.stroke();
              // Peeled wooden stick stump
              ctx.strokeStyle = '#D6B88A';
              ctx.lineWidth = 2.2 * scale;
              ctx.lineCap = 'round';
              ctx.beginPath();
              ctx.moveTo(base.x, base.y);
              ctx.lineTo(top.x, top.y);
              ctx.stroke();
            });
          };
          drawStickStumps(-122);

          // 5. Short Ball-Trajectory Indicator & Aim Cone
          if (s.screen === 'PLAYING' && (s.phase === 'RUNUP' || s.phase === 'BOWLING')) {
            const bounceY = s.ballType === 'BOUNCER' ? -20 : 20;
            const spinX = s.ballSpinCurve;
            const startPt = toScreen(5, -122, 24);
            const bouncePt = toScreen(2, bounceY, 0);
            const endPt = toScreen(spinX, 100, s.ballType === 'BOUNCER' ? 28 : 14);

            ctx.save();
            ctx.strokeStyle =
              s.ballType === 'FAST'
                ? 'rgba(239, 68, 68, 0.65)'
                : s.ballType === 'SPIN'
                ? 'rgba(168, 85, 247, 0.65)'
                : s.ballType === 'BOUNCER'
                ? 'rgba(249, 115, 22, 0.65)'
                : 'rgba(56, 189, 248, 0.65)';
            ctx.lineWidth = 2.2 * scale;
            ctx.setLineDash([5 * scale, 5 * scale]);
            ctx.beginPath();
            ctx.moveTo(startPt.x, startPt.y);
            ctx.quadraticCurveTo((startPt.x + bouncePt.x) * 0.5, bouncePt.y - 16 * scale, bouncePt.x, bouncePt.y);
            ctx.lineTo(endPt.x, endPt.y);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.beginPath();
            ctx.ellipse(bouncePt.x, bouncePt.y, 9 * scale, 5 * scale, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
          }

          if (s.screen === 'PLAYING') {
            const batterBase = toScreen(0, 98, 0);
            const targetWorldX = s.aimDir === -1 ? -145 : s.aimDir === 1 ? 145 : 0;
            const targetWorldY = s.aimDir === 0 ? -185 : -90;
            const aimTarget = toScreen(targetWorldX, targetWorldY, 0);

            ctx.save();
            ctx.strokeStyle = 'rgba(250, 204, 21, 0.35)';
            ctx.lineWidth = 2 * scale;
            ctx.setLineDash([4 * scale, 6 * scale]);
            ctx.beginPath();
            ctx.moveTo(batterBase.x, batterBase.y);
            ctx.lineTo(aimTarget.x, aimTarget.y);
            ctx.stroke();
            ctx.restore();
          }

          // 6. Animated Life & Detail: Spectators under Banyan Tree & on Stone Wall,
          //    Tied Goat, Pecking Hens, Wandering Dog, Crows on Tin Roof
          // Spectators under the Banyan Tree (Uncles in mundu, Woman with umbrella)
          const banyanSpec = toScreen(-158, -222, 0);
          ctx.save();
          ctx.translate(banyanSpec.x, banyanSpec.y);
          // Uncle in white mundu
          ctx.fillStyle = '#FDFBF2';
          ctx.fillRect(-14 * scale, -10 * scale, 7 * scale, 9 * scale);
          ctx.fillStyle = '#0284C7';
          ctx.fillRect(-14 * scale, -19 * scale, 7 * scale, 9 * scale);
          ctx.fillStyle = '#7C2D12';
          ctx.beginPath();
          ctx.arc(-10.5 * scale, -22 * scale, 3.2 * scale, 0, Math.PI * 2);
          ctx.fill();

          // Woman with black monsoon/sun umbrella
          ctx.fillStyle = '#BE185D';
          ctx.fillRect(4 * scale, -18 * scale, 7 * scale, 16 * scale);
          ctx.fillStyle = '#1C1917';
          ctx.beginPath();
          ctx.arc(7.5 * scale, -24 * scale, 12 * scale, Math.PI, 0);
          ctx.fill();
          ctx.restore();

          // Spectators on Stone Wall (Kids in blue/white school uniforms & Uncle in lungi)
          const wallStart = toScreen(185, 175, 0);
          const wallEnd = toScreen(275, 85, 0);
          [0.22, 0.5, 0.78].forEach((t, idx) => {
            const sx = wallStart.x + (wallEnd.x - wallStart.x) * t;
            const sy = wallStart.y + (wallEnd.y - wallStart.y) * t - 6 * scale;
            const cheer = s.popupTimer > 1.2 ? Math.abs(Math.sin(now * 0.015 + idx)) * 6 * scale : 0;
            // School kids (white shirt + navy shorts) & Uncle
            ctx.fillStyle = idx < 2 ? '#1E3A8A' : '#15803D';
            ctx.fillRect(sx - 4 * scale, sy - 8 * scale - cheer, 8 * scale, 7 * scale);
            ctx.fillStyle = idx < 2 ? '#F8FAFC' : '#FDE047';
            ctx.fillRect(sx - 4.5 * scale, sy - 16 * scale - cheer, 9 * scale, 9 * scale);
            ctx.fillStyle = '#7C2D12';
            ctx.beginPath();
            ctx.arc(sx, sy - 20 * scale - cheer, 3.8 * scale, 0, Math.PI * 2);
            ctx.fill();
          });

          // Goat tied near the mud varambu bund
          const pegPos = toScreen(148, -222, 0);
          const goatPos = toScreen(s.goat.x, s.goat.y, 0);
          ctx.strokeStyle = '#A8A29E';
          ctx.lineWidth = 1 * scale;
          ctx.beginPath();
          ctx.moveTo(pegPos.x, pegPos.y);
          ctx.lineTo(goatPos.x, goatPos.y - 6 * scale);
          ctx.stroke();

          ctx.save();
          ctx.translate(goatPos.x, goatPos.y);
          ctx.fillStyle = '#F5F5F4';
          ctx.fillRect(-8 * scale, -10 * scale, 14 * scale, 7 * scale);
          ctx.fillRect(4 * scale, -15 * scale, 5 * scale, 6 * scale);
          ctx.strokeStyle = '#D6D3D1';
          ctx.lineWidth = 1.6 * scale;
          ctx.beginPath();
          ctx.moveTo(-6 * scale, -3 * scale);
          ctx.lineTo(-6 * scale, 2 * scale);
          ctx.moveTo(4 * scale, -3 * scale);
          ctx.lineTo(4 * scale, 2 * scale);
          ctx.stroke();
          if (s.goat.pauseTimer > 0) {
            ctx.font = `700 ${Math.round(11 * scale)}px sans-serif`;
            ctx.fillStyle = '#FDE047';
            ctx.fillText('Baa! 🐐', -8 * scale, -20 * scale);
          }
          ctx.restore();

          // Pecking Hens
          s.hens.forEach((h) => {
            const hp = toScreen(h.x, h.y, 0);
            const peck = Math.sin(now * 0.012 + h.phase) * 2.5 * scale;
            ctx.fillStyle = '#B45309';
            ctx.beginPath();
            ctx.arc(hp.x, hp.y - 3 * scale, 4 * scale, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#DC2626';
            ctx.beginPath();
            ctx.arc(hp.x + 3.5 * scale, hp.y - 4.5 * scale + peck, 1.8 * scale, 0, Math.PI * 2);
            ctx.fill();
          });

          // Wandering Village Dog (Naadan Pattikutty)
          const dogPos = toScreen(s.dog.x, s.dog.y, 0);
          ctx.save();
          ctx.translate(dogPos.x, dogPos.y);
          if (s.dog.vx < 0) ctx.scale(-1, 1);
          ctx.fillStyle = '#A16207';
          ctx.fillRect(-7 * scale, -8 * scale, 13 * scale, 5.5 * scale);
          ctx.fillRect(4 * scale, -12 * scale, 5 * scale, 5 * scale);
          // Wagging curled tail
          const wag = Math.sin(now * 0.02) * 2 * scale;
          ctx.strokeStyle = '#A16207';
          ctx.lineWidth = 1.6 * scale;
          ctx.beginPath();
          ctx.moveTo(-7 * scale, -7 * scale);
          ctx.quadraticCurveTo(-11 * scale, -13 * scale + wag, -8 * scale, -14 * scale);
          ctx.stroke();
          ctx.restore();

          // Crows on the Chayakada Tin Roof
          s.crows.forEach((c, idx) => {
            if (c.flying > 0) c.flying = Math.max(0, c.flying - dt);
            const flyLift = c.flying > 0 ? Math.sin(c.flying * 3) * 28 : 0;
            const cp = toScreen(c.x, c.y, 38 + flyLift);
            const hop = Math.abs(Math.sin(now * 0.004 + c.hopPhase)) * 2 * scale;
            ctx.fillStyle = '#0F172A';
            ctx.beginPath();
            ctx.ellipse(cp.x, cp.y - hop, 4 * scale, 2.5 * scale, -0.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(cp.x + 3.5 * scale, cp.y - 2 * scale - hop, 2 * scale, 0, Math.PI * 2);
            ctx.fill();
            if (idx === 0 && c.flying > 0) {
              ctx.font = `700 ${Math.round(10 * scale)}px sans-serif`;
              ctx.fillStyle = '#E2E8F0';
              ctx.fillText('Kaa!', cp.x, cp.y - 12 * scale);
            }
          });

          // 7. Proportionate Village Cricketers (Long Shadows, Unsquashed Proportions)
          const drawVillageCricketer = (
            wx: number,
            wy: number,
            lungiColor: string,
            shirtColor: string,
            isUncle: boolean,
            isBatter = false
          ) => {
            const pos = toScreen(wx, wy, 0);
            ctx.save();
            ctx.translate(pos.x, pos.y);

            // Long golden-hour shadow cast across the padam
            ctx.fillStyle = palette.shadowColor;
            ctx.beginPath();
            ctx.ellipse(-9 * scale, 2 * scale, 13 * scale, 4 * scale, -0.15, 0, Math.PI * 2);
            ctx.fill();

            // Bare feet & legs
            ctx.strokeStyle = '#7C2D12';
            ctx.lineWidth = 2.2 * scale;
            ctx.beginPath();
            ctx.moveTo(-3 * scale, -7 * scale);
            ctx.lineTo(-3 * scale, 0);
            ctx.moveTo(3 * scale, -7 * scale);
            ctx.lineTo(3 * scale, 0);
            ctx.stroke();

            // Folded Mundu / Lungi
            ctx.fillStyle = lungiColor;
            ctx.fillRect(-6.5 * scale, -18 * scale, 13 * scale, 12 * scale);
            ctx.fillStyle = '#D4AF37';
            ctx.fillRect(-6.5 * scale, -8 * scale, 13 * scale, 1.8 * scale);

            // Proportionate Torso / T-Shirt
            ctx.fillStyle = shirtColor;
            ctx.beginPath();
            ctx.roundRect(-7.5 * scale, -33 * scale, 15 * scale, 16 * scale, 3 * scale);
            ctx.fill();

            // Head & Hair
            ctx.fillStyle = '#7C2D12';
            ctx.beginPath();
            ctx.arc(0, -39.5 * scale, 5.5 * scale, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#1C1917';
            ctx.beginPath();
            ctx.arc(0, -41 * scale, 5.5 * scale, Math.PI, 0);
            ctx.fill();

            if (isUncle) {
              ctx.strokeStyle = '#0F172A';
              ctx.lineWidth = 1.8 * scale;
              ctx.beginPath();
              ctx.moveTo(-3.5 * scale, -37.5 * scale);
              ctx.lineTo(3.5 * scale, -37.5 * scale);
              ctx.stroke();
            }

            if (isBatter) {
              ctx.save();
              const swingRot = s.batSwingAnim > 0 ? -Math.sin(s.batSwingAnim * Math.PI) * 1.65 : 0.32;
              ctx.translate(7 * scale, -26 * scale);
              ctx.rotate(swingRot);
              ctx.fillStyle = '#B45309';
              ctx.fillRect(-2.2 * scale, 0, 4.4 * scale, 22 * scale);
              ctx.fillStyle = '#F5F5F4';
              ctx.fillRect(-1.4 * scale, -6 * scale, 2.8 * scale, 6 * scale);
              ctx.restore();
            }

            ctx.restore();
          };

          s.fielders.forEach((f) => {
            drawVillageCricketer(f.x, f.y, f.lungiColor, f.shirtColor, f.isUncle, false);
          });

          const bowlerY = s.phase === 'RUNUP' ? -170 + (1 - Math.max(0, s.phaseTimer)) * 48 : -122;
          drawVillageCricketer(5, bowlerY, '#FDFBF2', '#0369A1', true, false);

          const activeBatsman =
            GAME_CONFIG.BATSMEN.find((b) => b.id === s.batsmanId) || GAME_CONFIG.BATSMEN[0];
          drawVillageCricketer(
            -8,
            98,
            activeBatsman.munduColor,
            activeBatsman.shirtColor,
            s.batsmanId === 'ammachi' ? false : true,
            true
          );

          // Batter End Wooden Stick Stumps
          drawStickStumps(108);

          // 8. Cricket Ball, Ground Shadow & Sweet-Spot Timing Ring
          if (s.screen === 'PLAYING') {
            const shadowPt = toScreen(s.ball.x, s.ball.y, 0);
            const ballPt = toScreen(s.ball.x, s.ball.y, s.ball.z);

            ctx.fillStyle = 'rgba(0, 0, 0, 0.38)';
            ctx.beginPath();
            ctx.ellipse(shadowPt.x, shadowPt.y, 4.8 * scale, 2.6 * scale, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#DC2626';
            ctx.beginPath();
            ctx.arc(ballPt.x, ballPt.y, 5.2 * scale, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#FEF08A';
            ctx.lineWidth = 1.1 * scale;
            ctx.stroke();

            if (s.phase === 'BOWLING') {
              const sweetCenter = toScreen(0, 94, 12);
              const distToSweet = Math.abs(s.ballProgress - GAME_CONFIG.DIFFICULTY.SWEET_SPOT);
              const ringColor =
                distToSweet <= GAME_CONFIG.DIFFICULTY.PERFECT_WINDOW
                  ? '#4ADE80'
                  : distToSweet <= GAME_CONFIG.DIFFICULTY.GOOD_WINDOW
                  ? '#FACC15'
                  : 'rgba(255,255,255,0.35)';

              ctx.strokeStyle = ringColor;
              ctx.lineWidth = 2.2 * scale;
              ctx.beginPath();
              ctx.arc(
                sweetCenter.x,
                sweetCenter.y,
                Math.max(8, (1 - s.ballProgress) * 90) * scale,
                0,
                Math.PI * 2
              );
              ctx.stroke();
            }
          }

          // 9. Animated Swaying Coconut Palm Fronds (Trunks pre-rendered on offscreen canvas)
          const boundaryFlutter = s.grassFlutterTimer > 0 ? Math.sin(now * 0.03) * 5 : 0;
          palmsRef.current.forEach((palm) => {
            const top = toScreen(palm.wx + palm.lean, palm.wy, palm.height);
            const windSway = Math.sin(now * 0.0022 + palm.seed) * 5 + boundaryFlutter;

            // Tender coconuts cluster
            ctx.fillStyle = s.timeOfDay === 'EVENING' ? '#451A03' : '#A16207';
            ctx.beginPath();
            ctx.arc(top.x - 3 * scale, top.y + 3 * scale, 3.2 * scale, 0, Math.PI * 2);
            ctx.arc(top.x + 3 * scale, top.y + 3 * scale, 3.2 * scale, 0, Math.PI * 2);
            ctx.fill();

            // Swaying Fronds
            const frondAngles = [-2.7, -2.15, -1.55, -0.95, -0.4, 0.15, 0.55];
            ctx.strokeStyle = s.timeOfDay === 'EVENING' ? '#142E18' : '#15803D';
            ctx.lineWidth = 3.2 * scale;
            ctx.lineCap = 'round';
            frondAngles.slice(0, palm.frondCount).forEach((ang, idx) => {
              const fx = top.x + Math.cos(ang) * 35 * scale + windSway * scale;
              const fy = top.y + Math.sin(ang) * 24 * scale + (idx % 2) * 5 * scale;
              ctx.beginPath();
              ctx.moveTo(top.x, top.y);
              ctx.quadraticCurveTo((top.x + fx) * 0.5, top.y - 10 * scale, fx, fy);
              ctx.stroke();
            });
          });

          // 10. Render Dust Puffs & Boundary Grass Flutter Particles
          s.particles.forEach((p) => {
            const pt = toScreen(p.x, p.y, p.z);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = Math.max(0, 1 - p.life / p.maxLife);
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, p.size * scale, 0, Math.PI * 2);
            ctx.fill();
          });
          ctx.globalAlpha = 1;

          // 11. Monsoon Rain Streaks
          if (s.isMonsoon) {
            ctx.strokeStyle = 'rgba(203, 213, 225, 0.42)';
            ctx.lineWidth = 1.3;
            ctx.beginPath();
            s.rain.forEach((drop) => {
              ctx.moveTo(drop.x, drop.y);
              ctx.lineTo(drop.x - drop.len * 0.32, drop.y + drop.len);
            });
            ctx.stroke();
          }

          // 12. Manglish Commentary Pop-up Banner
          if (s.popupTimer > 0 && s.popupText) {
            const alpha = Math.min(1, s.popupTimer * 2);
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.translate(W * 0.5, H * 0.21);

            ctx.font = `800 ${Math.round(28 * scale)}px var(--font-display), sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillStyle = '#0F172A';
            ctx.fillText(s.popupText, 2, 2);
            ctx.fillStyle = s.popupColor;
            ctx.fillText(s.popupText, 0, 0);

            ctx.font = `600 ${Math.round(14 * scale)}px var(--font-sans), sans-serif`;
            ctx.fillStyle = '#FDFBF2';
            ctx.fillText(s.popupSub, 0, 24 * scale);
            ctx.restore();
          }

          ctx.restore();
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [initFielders, renderStaticEnvironment, resolveDeliveryOutcome]);

  // Handle responsive full-viewport canvas sizing
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

  // Derived Score Metrics
  const oversFormatted = `${Math.floor(hud.balls / 6)}.${hud.balls % 6} / ${overs}.0`;
  const strikeRate = hud.balls > 0 ? Math.round((hud.runs / hud.balls) * 100) : 0;
  const reqRuns = hud.target !== null ? Math.max(0, hud.target - hud.runs) : null;
  const ballsLeft = Math.max(0, hud.totalBalls - hud.balls);
  const currentRival =
    mode === 'TOURNAMENT'
      ? GAME_CONFIG.RIVALS[sessionStats.tournamentStage]
      : GAME_CONFIG.RIVALS[selectedRivalIdx];

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none bg-[#1c2414] font-sans">
      {/* ===================================================================
          ISOLATED 60FPS FULL-VIEWPORT CANVAS
          =================================================================== */}
      <canvas
        ref={canvasRef}
        onClick={() => {
          if (screen === 'PLAYING') handleSwing();
        }}
        className="block w-full h-full cursor-pointer"
      />

      {/* ===================================================================
          PERIMETER HUD (WORLD-MATCHED, LOW-OCCLUSION <15% VIEWPORT)
          =================================================================== */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-20 flex items-start justify-between px-4 py-3 md:px-6">
        {screen === 'PLAYING' ? (
          <div className="pointer-events-auto flex flex-wrap items-center gap-4 rounded-xl bg-[#0b1f11]/85 border border-[#d4af37]/40 px-4 py-2.5 shadow-lg">
            <div>
              <div className="text-[11px] font-medium text-[#d4af37]">
                SCORE · സ്കോർ
              </div>
              <div className="font-mono text-2xl font-bold tabular-nums text-[#fdfbf2]">
                {hud.runs}/{hud.wickets}
              </div>
            </div>

            <div className="h-8 w-px bg-[#d4af37]/25" />

            <div>
              <div className="text-[11px] font-medium text-[#d4af37]">
                OVERS · ഓവർ
              </div>
              <div className="font-mono text-lg font-semibold tabular-nums text-[#fdfbf2]">
                {oversFormatted}
              </div>
            </div>

            <div className="h-8 w-px bg-[#d4af37]/25" />

            <div>
              <div className="text-[11px] font-medium text-[#d4af37]">
                SR · സ്ട്രൈക്ക് റേറ്റ്
              </div>
              <div className="font-mono text-lg font-semibold tabular-nums text-[#fdfbf2]">
                {strikeRate}
              </div>
            </div>

            {reqRuns !== null && (
              <>
                <div className="h-8 w-px bg-[#d4af37]/25" />
                <div>
                  <div className="text-[11px] font-medium text-amber-300">
                    NEED · ലക്ഷ്യം ({hud.target})
                  </div>
                  <div className="font-mono text-sm font-bold tabular-nums text-amber-200">
                    {reqRuns} in {ballsLeft}b
                  </div>
                </div>
              </>
            )}

            <div className="hidden sm:flex items-center gap-1.5 pl-2">
              <span className="text-xs text-[#d4af37]">Delivery:</span>
              <span className="font-mono text-xs font-bold text-white">
                {hud.bowlerType}
              </span>
            </div>
          </div>
        ) : (
          <div className="pointer-events-auto flex items-center gap-3 rounded-xl bg-[#0b1f11]/85 border border-[#d4af37]/40 px-3.5 py-2">
            <Trophy className="w-4 h-4 text-[#d4af37]" />
            <span className="text-xs font-medium text-[#fdfbf2] tabular-nums">
              Session High Score: <strong className="text-[#d4af37] font-mono">{sessionStats.highScore}</strong>
            </span>
          </div>
        )}

        {/* Right Perimeter Environment & Audio Controls (Day / Evening / Monsoon) */}
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTimeOfDay((v) => (v === 'DAY' ? 'EVENING' : 'DAY'))}
            className="flex items-center gap-1.5 rounded-lg bg-[#0b1f11]/85 border border-[#d4af37]/40 px-3 py-2 text-xs font-semibold text-[#fdfbf2] hover:bg-[#14361b] transition-colors whitespace-nowrap shrink-0"
            title="Toggle Golden Hour Day / Sunset Evening"
          >
            {timeOfDay === 'EVENING' ? (
              <Sunset className="w-4 h-4 text-orange-400" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
            <span className="hidden sm:inline">{timeOfDay === 'EVENING' ? 'Evening' : 'Day'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsMonsoon((v) => !v)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              isMonsoon
                ? 'bg-slate-800/90 border-sky-400 text-sky-100'
                : 'bg-[#0b1f11]/85 border-[#d4af37]/40 text-[#fdfbf2] hover:bg-[#14361b]'
            }`}
            title="Toggle Monsoon Rain Mode"
          >
            <CloudRain className="w-4 h-4 text-sky-300" />
            <span className="hidden sm:inline">{isMonsoon ? 'Monsoon ON' : 'Monsoon'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              audio.muted = !isMuted;
              setIsMuted(!isMuted);
            }}
            className="flex items-center gap-1.5 rounded-lg bg-[#0b1f11]/85 border border-[#d4af37]/40 px-3 py-2 text-xs font-semibold text-[#fdfbf2] hover:bg-[#14361b] transition-colors whitespace-nowrap shrink-0"
            title="Toggle Mute (M)"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-[#d4af37]" />}
          </button>

          {screen === 'PLAYING' && (
            <button
              type="button"
              onClick={() => {
                simRef.current.screen = 'PAUSED';
                setScreen('PAUSED');
              }}
              className="flex items-center gap-1.5 rounded-lg bg-[#0b1f11]/85 border border-[#d4af37]/40 px-3 py-2 text-xs font-semibold text-[#fdfbf2] hover:bg-[#14361b] transition-colors whitespace-nowrap shrink-0"
              title="Pause Game (Esc)"
            >
              <Pause className="w-4 h-4 text-[#d4af37]" />
            </button>
          )}
        </div>
      </div>

      {/* ===================================================================
          ACTIVE PLAY BOTTOM CONTROLS
          =================================================================== */}
      {screen === 'PLAYING' && (
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
                className={`px-3.5 py-2.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
                  aimDir === -1
                    ? 'bg-[#d4af37] text-[#0e2414]'
                    : 'text-[#fdfbf2] hover:bg-white/10'
                }`}
              >
                ← Off Side
              </button>
              <button
                type="button"
                onClick={() => {
                  simRef.current.aimDir = 0;
                  setAimDir(0);
                }}
                className={`px-3.5 py-2.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
                  aimDir === 0
                    ? 'bg-[#d4af37] text-[#0e2414]'
                    : 'text-[#fdfbf2] hover:bg-white/10'
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
                className={`px-3.5 py-2.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
                  aimDir === 1
                    ? 'bg-[#d4af37] text-[#0e2414]'
                    : 'text-[#fdfbf2] hover:bg-white/10'
                }`}
              >
                Leg Side →
              </button>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-2 rounded-xl bg-[#0b1f11]/80 border border-[#d4af37]/30 px-4 py-2 text-xs text-[#fdfbf2]">
            <span className="text-[#d4af37] font-semibold">This Over:</span>
            {hud.lastBalls.length === 0 ? (
              <span className="text-white/60">First ball coming up...</span>
            ) : (
              hud.lastBalls.map((b, i) => (
                <span key={i} className="font-mono font-bold px-1.5 text-white">
                  {b}
                </span>
              ))
            )}
          </div>

          <div className="pointer-events-auto flex flex-col items-end gap-1.5">
            <span className="text-[11px] font-semibold text-[#fdfbf2]/90 drop-shadow">
              SPACE / TAP TO BAT · അടിക്കുക
            </span>
            <button
              type="button"
              onClick={handleSwing}
              className="rounded-2xl bg-gradient-to-b from-[#facc15] to-[#ca8a04] border-2 border-[#fef08a] px-7 py-4 text-base font-extrabold text-[#0e2414] shadow-xl active:scale-95 transition-transform whitespace-nowrap shrink-0"
            >
              🏏 SWING BAT (അടി!)
            </button>
          </div>
        </div>
      )}

      {/* ===================================================================
          TITLE SCREEN MODAL
          =================================================================== */}
      {screen === 'TITLE' && (
        <div className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-black/45">
          <div className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl bg-[#fdfbf2] text-[#14361b] shadow-2xl border-4 border-[#d4af37]">
            <div className="h-3.5 w-full bg-[repeating-linear-gradient(90deg,#d4af37_0px,#d4af37_18px,#b45309_18px,#b45309_24px,#fdfbf2_24px,#fdfbf2_30px)]" />

            <div className="p-6 md:p-8 space-y-6">
              <div className="text-center space-y-1.5">
                <div className="inline-flex items-center gap-2 text-xs font-bold tracking-wider text-[#b45309]">
                  <span>RURAL KERALA PADAM CRICKET</span>
                  <span>·</span>
                  <span>വെണ്ണിക്കുളം പ്രീമിയർ ലീഗ്</span>
                </div>
                <h1
                  className="text-3xl md:text-5xl font-extrabold tracking-tight text-[#0e2414]"
                  style={{ textWrap: 'balance' }}
                >
                  Vennikulam Premier League
                </h1>
                <p className="text-sm text-[#335c3b] max-w-xl mx-auto">
                  Step onto the harvested village paddy field! Smash sixes over the mud varambu into the tall paddy, clang the chayakada tin roof for +2 bonus runs, and stay clear of the winding canal!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-xs font-bold text-[#14361b]">
                    SELECT MODE · കളി രീതി
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'QUICK', label: 'Quick Match', sub: 'സൗഹൃദ മത്സരം' },
                      { id: 'CHASE', label: 'Chase Target', sub: 'ലക്ഷ്യം നേടുക' },
                      { id: 'TOURNAMENT', label: 'Tournament', sub: 'ടൂർണമെന്റ് (3x)' },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setMode(m.id as GameMode)}
                        className={`rounded-xl p-3 text-left border transition-colors ${
                          mode === m.id
                            ? 'bg-[#14361b] text-[#fdfbf2] border-[#d4af37]'
                            : 'bg-[#f4EFE0] text-[#14361b] border-[#d4af37]/40 hover:bg-[#ebe3ce]'
                        }`}
                      >
                        <div className="text-sm font-bold whitespace-nowrap">{m.label}</div>
                        <div className="text-[11px] opacity-80">{m.sub}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#14361b]">
                    OVERS · ഓവറുകൾ
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {GAME_CONFIG.OVER_OPTIONS.map((ov) => (
                      <button
                        key={ov}
                        type="button"
                        onClick={() => setOvers(ov)}
                        className={`rounded-xl py-3 text-center font-mono font-bold border transition-colors ${
                          overs === ov
                            ? 'bg-[#14361b] text-[#d4af37] border-[#d4af37]'
                            : 'bg-[#f4EFE0] text-[#14361b] border-[#d4af37]/40 hover:bg-[#ebe3ce]'
                        }`}
                      >
                        <div className="text-base">{ov}</div>
                        <div className="text-[10px] font-sans font-normal opacity-80">
                          {ov * 6} balls
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {mode !== 'QUICK' && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#14361b]">
                    {mode === 'TOURNAMENT'
                      ? `TOURNAMENT ROUND ${sessionStats.tournamentStage + 1}/3 · എതിരാളി`
                      : 'SELECT RIVAL VILLAGE · എതിർ ടീം'}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {GAME_CONFIG.RIVALS.map((riv, idx) => {
                      const isSelected =
                        mode === 'TOURNAMENT'
                          ? sessionStats.tournamentStage === idx
                          : selectedRivalIdx === idx;
                      return (
                        <button
                          key={riv.id}
                          type="button"
                          disabled={mode === 'TOURNAMENT'}
                          onClick={() => setSelectedRivalIdx(idx)}
                          className={`rounded-xl p-3 text-left border transition-colors ${
                            isSelected
                              ? 'bg-[#14361b] text-[#fdfbf2] border-[#d4af37]'
                              : 'bg-[#f4EFE0] text-[#14361b] border-[#d4af37]/40 hover:bg-[#ebe3ce]'
                          }`}
                        >
                          <div className="text-sm font-bold">{riv.name}</div>
                          <div className="text-[11px] text-[#d4af37]">{riv.malayalam}</div>
                          <div className="text-[11px] opacity-80 mt-1">
                            Target: ~{overs * riv.runsPerOver} runs · {riv.favoredBall}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#14361b]">
                    SELECT BATSMAN · ബാറ്റ്സ്മാൻ
                  </label>
                  <button
                    type="button"
                    onClick={() => setUnlockAllBatsmen((v) => !v)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#b45309] hover:underline"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {unlockAllBatsmen ? 'Milestone Locks Restored' : 'Unlock All Batsmen (Quick Toggle)'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {GAME_CONFIG.BATSMEN.map((b) => {
                    const isUnlocked =
                      unlockAllBatsmen || sessionStats.unlockedIds.includes(b.id);
                    const isSelected = selectedBatsmanId === b.id;
                    return (
                      <button
                        key={b.id}
                        type="button"
                        disabled={!isUnlocked}
                        onClick={() => setSelectedBatsmanId(b.id)}
                        className={`rounded-xl p-3 text-left border transition-colors ${
                          isSelected
                            ? 'bg-[#14361b] text-[#fdfbf2] border-[#d4af37]'
                            : isUnlocked
                            ? 'bg-[#f4EFE0] text-[#14361b] border-[#d4af37]/40 hover:bg-[#ebe3ce]'
                            : 'bg-stone-200/70 text-stone-500 border-stone-300 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold">
                            {b.name} ({b.malayalam})
                          </span>
                          <span className="text-[11px] font-semibold text-[#d4af37]">
                            {b.role}
                          </span>
                        </div>
                        <p className="text-xs mt-1 opacity-90">{b.desc}</p>
                        {!isUnlocked && (
                          <p className="text-[11px] font-semibold text-amber-800 mt-1">
                            🔒 {b.unlockText}
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-xl bg-[#f4EFE0] border border-[#d4af37]/50 p-3.5 text-xs text-[#14361b] grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <strong className="block text-[#b45309]">🌊 Winding Canal</strong>
                  <span>Ball in water = OUT!</span>
                </div>
                <div>
                  <strong className="block text-[#b45309]">☕ Tin Roof</strong>
                  <span>Chayakada hit = +2 Bonus</span>
                </div>
                <div>
                  <strong className="block text-[#b45309]">🌾 Tall Paddy</strong>
                  <span>Over varambu = Auto 6!</span>
                </div>
                <div>
                  <strong className="block text-[#b45309]">🐐 Goat / Hen</strong>
                  <span>Animal block = 0 Run</span>
                </div>
              </div>

              <div className="pt-1 flex flex-col items-center gap-3">
                <button
                  type="button"
                  onClick={() => startMatch()}
                  className="w-full sm:w-auto min-w-[260px] inline-flex items-center justify-center gap-2 rounded-xl bg-[#14361b] hover:bg-[#1b4924] text-[#fdfbf2] border-2 border-[#d4af37] px-8 py-3.5 text-base font-extrabold shadow-lg transition-colors whitespace-nowrap shrink-0"
                >
                  <Play className="w-5 h-5 text-[#d4af37] fill-current" />
                  <span>Start Match · കളി തുടങ്ങാം</span>
                </button>
                <div className="text-xs text-[#335c3b] text-center">
                  ←/↑/→ Aim Direction · Space or Click Swing Bat · M Mute · Esc Pause
                </div>
              </div>
            </div>

            <div className="h-3.5 w-full bg-[repeating-linear-gradient(90deg,#d4af37_0px,#d4af37_18px,#b45309_18px,#b45309_24px,#fdfbf2_24px,#fdfbf2_30px)]" />
          </div>
        </div>
      )}

      {/* ===================================================================
          PAUSE MODAL
          =================================================================== */}
      {screen === 'PAUSED' && (
        <div className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-black/55">
          <div className="w-full max-w-md rounded-2xl bg-[#fdfbf2] text-[#14361b] border-4 border-[#d4af37] p-6 text-center space-y-4 shadow-2xl">
            <h2 className="text-2xl font-extrabold">Match Paused · ഇടവേള</h2>
            <p className="text-sm text-[#335c3b]">
              Grab a hot meter chaya and pazhampori from the chayakada!
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  simRef.current.screen = 'PLAYING';
                  setScreen('PLAYING');
                }}
                className="px-5 py-2.5 rounded-xl bg-[#14361b] text-[#fdfbf2] font-bold text-sm whitespace-nowrap shrink-0"
              >
                Resume Match
              </button>
              <button
                type="button"
                onClick={() => startMatch()}
                className="px-5 py-2.5 rounded-xl bg-[#f4EFE0] border border-[#d4af37] text-[#14361b] font-bold text-sm whitespace-nowrap shrink-0"
              >
                Restart Match
              </button>
              <button
                type="button"
                onClick={() => {
                  simRef.current.screen = 'TITLE';
                  setScreen('TITLE');
                }}
                className="px-5 py-2.5 rounded-xl bg-stone-200 text-stone-800 font-bold text-sm whitespace-nowrap shrink-0"
              >
                Main Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          END-OF-MATCH SUMMARY CARD
          =================================================================== */}
      {screen === 'SUMMARY' && (
        <div className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-black/55">
          <div className="w-full max-w-lg rounded-2xl bg-[#fdfbf2] text-[#14361b] border-4 border-[#d4af37] overflow-hidden shadow-2xl">
            <div className="h-3.5 w-full bg-[repeating-linear-gradient(90deg,#d4af37_0px,#d4af37_18px,#b45309_18px,#b45309_24px,#fdfbf2_24px,#fdfbf2_30px)]" />

            <div className="p-6 md:p-8 space-y-5 text-center">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-[#b45309]">
                <Award className="w-4 h-4" />
                <span>MATCH SUMMARY · മത്സര ഫലം</span>
              </div>

              <h2 className="text-2xl md:text-3xl font-extrabold text-[#0e2414]">
                {hud.matchResultTitle}
              </h2>

              <div className="py-2 px-4 rounded-xl bg-[#14361b] text-[#fdfbf2]">
                <div className="text-xs text-[#d4af37]">Earned Village Title · പദവി</div>
                <div className="text-lg font-extrabold">{hud.villageTitle}</div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
                <div className="rounded-xl bg-[#f4EFE0] p-3 border border-[#d4af37]/40">
                  <div className="text-[11px] text-[#335c3b]">Total Runs</div>
                  <div className="font-mono text-xl font-extrabold tabular-nums">
                    {hud.runs}/{hud.wickets}
                  </div>
                </div>
                <div className="rounded-xl bg-[#f4EFE0] p-3 border border-[#d4af37]/40">
                  <div className="text-[11px] text-[#335c3b]">Boundaries</div>
                  <div className="font-mono text-xl font-extrabold tabular-nums">
                    {hud.fours}×4 · {hud.sixes}×6
                  </div>
                </div>
                <div className="rounded-xl bg-[#f4EFE0] p-3 border border-[#d4af37]/40">
                  <div className="text-[11px] text-[#335c3b]">Strike Rate</div>
                  <div className="font-mono text-xl font-extrabold tabular-nums">
                    {strikeRate}
                  </div>
                </div>
                <div className="rounded-xl bg-[#f4EFE0] p-3 border border-[#d4af37]/40">
                  <div className="text-[11px] text-[#335c3b]">High Score</div>
                  <div className="font-mono text-xl font-extrabold tabular-nums text-[#b45309]">
                    {sessionStats.highScore}
                  </div>
                </div>
              </div>

              <div className="text-xs text-[#335c3b] flex items-center justify-between px-1">
                <span>
                  <strong>Best Shot:</strong> {hud.bestShot}
                </span>
                <span>
                  <strong>Opponent:</strong> {currentRival.name}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => startMatch()}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#14361b] hover:bg-[#1b4924] text-[#fdfbf2] border-2 border-[#d4af37] px-6 py-3 text-sm font-extrabold transition-colors whitespace-nowrap shrink-0"
                >
                  <RotateCcw className="w-4 h-4 text-[#d4af37]" />
                  <span>
                    {mode === 'TOURNAMENT' && hud.matchWon
                      ? 'Next Tournament Round · അടുത്ത മത്സരം'
                      : 'Play Again · വീണ്ടും കളിക്കാം'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    simRef.current.screen = 'TITLE';
                    setScreen('TITLE');
                  }}
                  className="w-full sm:w-auto rounded-xl bg-[#f4EFE0] hover:bg-[#ebe3ce] border border-[#d4af37] text-[#14361b] px-5 py-3 text-sm font-bold transition-colors whitespace-nowrap shrink-0"
                >
                  Change Mode / Batter
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
