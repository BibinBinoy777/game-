# Gully Kerala Premier (ഗല്ലി കേരള പ്രീമിയർ)

An arcade-style village cricket browser game set on a lush rural Kerala paddy-field pitch (*padam*), featuring an angled isometric full-field camera, authentic local rules, Web Audio synthesized *chenda* drum beats, unlockable village batters, and Manglish commentary pop-ups.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following core design and gameplay decisions incorporate your confirmed preferences from our clarification step:

- **Camera Perspective (Confirmed)**: **Angled Isometric Overview** of the entire paddy field (*padam*), allowing players to clearly see the red laterite pitch, surrounding coconut palms, the canal (*kayal*) with a drifting *kettuvallam* (houseboat), the tin-roofed *chayakada* (tea shop), wandering goat and hens, stone wall spectators, and AI fielders moving in real time.
- **Batsman Unlock Progression (Confirmed)**: **Score Milestone Unlocks + Quick "Unlock All" Toggle**. *Unni* (Power Hitter) is available immediately; *Appu* (Timing Master) unlocks after scoring 25+ runs in a match; *Ammachi* (Lucky Rare Sixes) unlocks after scoring 50+ runs or winning a match—paired with an instant **"Unlock All Batsmen"** toggle on the title screen so anyone can test all traits immediately.
- **Delivery Experience (Confirmed)**: **Full-Screen Browser Experience** with a self-contained single-file HTML5 export view/copy option accessible from the help modal if you ever want to copy the standalone single-file HTML code, while running natively full-viewport inside the browser.

---

## 1. Overview & Core Concept

- **What It Does**: Lets players step onto a muddy, sun-drenched (or monsoon-soaked) Kerala village paddy field to bat against cunning village bowlers across Quick Match, Chase Mode, and a 3-stage Knockout Tournament.
- **Target Audience / Persona**: Casual and arcade sports game fans who love expressive regional atmosphere, timing-based batting mechanics, and humorous local gully cricket rules.
- **Key Value**: Combines responsive 60fps arcade batting physics and timing windows with rich Kerala cultural details—mundu-clad uncles and kids, Manglish commentary callouts, village hazards, and procedural Web Audio *chenda* percussion.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Title Screen (Kasavu Border & Live Isometric World Backdrop)**:
   - Displays the live animated paddy field in the background (swaying coconut palms, drifting houseboat on the canal, pecking hens, and monsoon clouds).
   - Framed with an animated gold-and-cream Kerala *kasavu* border pattern and a custom SVG title lockup (`Gully Kerala Premier · ഗല്ലി കേരള പ്രീമിയർ`).
   - Players configure **Game Mode** (Quick Match, Chase Mode vs *Kuttanad XI* / *Munnar Mavericks* / *Kozhikode Kings*, or 3-Match Knockout Tournament), **Overs** (1, 2, or 5 overs), **Batsman** (*Unni*, *Appu*, *Ammachi* with an "Unlock All" toggle), and **Environment** (Day/Night toggle & Monsoon Rain Mode).
2. **Active Batting Gameplay (Low-Occlusion Perimeter HUD)**:
   - **Bowler Run-Up & Telegraph**: Bowler approaches and announces delivery type (*Fast*, *Spin*, *Slower Ball*, *Bouncer*) with a brief trajectory preview arc on the red laterite pitch.
   - **Directional Aim & Timing Swing**: Player selects shot direction (**Off Side / Left**, **Straight / Up**, **Leg Side / Right**) via Arrow keys / `A-W-D` or mobile touch buttons, then presses `Space` or taps **SWING** as the ball enters the sweet spot.
   - **Ball Flight & Village Rules Resolution**:
     - **Perfect Timing**: Lofted four or six with camera shake, hit-stop, and *chenda* celebration beat.
     - **Padam Tall Paddy Zone**: Ball lost in the deep paddy grass triggers an automatic **6 Runs!** (*"Padathil poyi — Sixer!"*).
     - **Chayakada Tin Roof**: Hitting the tea shop tin roof clangs loudly and awards **+2 Bonus Runs**.
     - **Kayal (Canal) Hazard**: Hitting directly into the backwater canal splashes the water and triggers an instant **OUT!** (*"Kayalil poyi!"*).
     - **Goat / Hen Interception**: If the ball hits the wandering goat or hens, a comical pause ensues with a bleat/cluck and **0 Runs (Dead Ball)**.
     - **Fielder Catch / Ground Fielding**: Mundu-clad uncles and village kids sprint toward the ball to cut off singles/doubles or dive for catches on mistimed lofted shots.
3. **End-of-Match Summary & Tournament Progression**:
   - Displays a festive Kasavu-styled scorecard with Total Runs, Wickets, Overs, Boundaries (4s & 6s), Strike Rate, Best Shot description, Session High Score (stored in memory), and a humorous dynamic **Village Title** (*"Padam King"*, *"Chayakada Champion"*, *"Kayal Swimmer"*, or *"Duck Master"*).
   - Offers instant **Play Again / Next Tournament Match** without page refresh.

### Visual Identity & Theme

- **Aesthetic Direction**: Warm, hand-crafted flat vector/canvas illustration inspired by rural Kerala backwaters and village festival posters.
- **Color Palette & Mood**:
  - **60% Dominant Field Canvas**: Lush Paddy Emerald (`#2E7D32` / `#43A047` in Day, `#14361B` in Night, `#1F4E28` in Monsoon) and Backwater Teal (`#1976D2` / `#0D47A1`).
  - **30% Earth & Architectural Surfaces**: Red Laterite Pitch (`#C85A32`), Kasavu Cream (`#FDFBF2`), Stone Wall & Chayakada Wood (`#6D4C41`), Tin Roof Silver (`#90A4AE`).
  - **10% Festival Accents**: Kasavu Gold (`#D4AF37`), Temple Vermilion (`#D32F2F`), Auto-Rickshaw Yellow/Black (`#FBC02D`).
- **Typography & Hierarchy**:
  - **Display Face**: Bold expressive geometric/condensed display headers for scores, Manglish pop-ups, and titles.
  - **Body & Bilingual Subtitles**: Clean, high-contrast English labels paired with Malayalam script subtitles (`കളി തുടങ്ങാം`, `സ്കോർ`, `ഓവർ`).
  - **Numeric Readouts**: Strict `tabular-nums` alignment for Score, Overs, Target, Required Runs, and Strike Rate.
- **Interactive Feedback & Motion**:
  - 45ms hit-stop and decaying screen shake on Perfect timing boundaries.
  - Floating Manglish comic callouts (*"Adipoli shot!"*, *"Sixer, mone!"*, *"Pidikkada!"*, *"Out aayallo!"*, *"Kidilam!"*, *"Poda!"*) with spring scale-in animation.
  - Monsoon rain particle overlay that slows ball roll on the grass and makes spin/pace skid unpredictably on the wet pitch.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Angled Isometric Projection on 2D HTML5 Canvas**
  - *Chosen Approach*: Custom isometric world-to-screen coordinate transform `(x, y, z)` rendered at 60fps on a single `<canvas>`.
  - *Why*: Lets players simultaneously appreciate the ball's 3D parabolic loft height (`z`), lateral shot direction (`x, y`), and all surrounding village landmarks (canal on the off-side boundary, chayakada on leg-side, deep paddy straight down the ground, temple/church on the horizon).
- **Decision 2: Pure Web Audio API Procedural Sound Engine**
  - *Chosen Approach*: Zero external audio files; synthesized wooden bat crack, tin roof metallic clang, water splash, goat bleat, crowd filtered-noise roar, and rhythmic *chenda* percussion roll on boundaries.
  - *Why*: Guarantees instant zero-latency playback, zero broken network assets, and full compliance with single-file self-contained rules.
- **Decision 3: In-Memory Session Progression**
  - *Chosen Approach*: High scores, unlocked batsmen, and tournament bracket progress live in an in-memory session state object (no `localStorage`).
  - *Why*: Strictly honors the prompt specification while providing an instant "Unlock All" toggle for convenience.

---

## 4. Technical Architecture & Data Strategy

### Architecture & Component Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     GULLY KERALA PREMIER (Game Shell)                   │
├───────────────────────────────────┬─────────────────────────────────────┤
│   Configurable Constants & Rules  │     In-Memory Session Store         │
│   • DIFFICULTY_PRESETS            │     • highScore, unlockedBatsmen    │
│   • OVER_OPTIONS (1, 2, 5)        │     • unlockAllOverride             │
│   • PALETTE (Day/Night/Monsoon)   │     • tournamentStage (QF/SF/Final) │
└─────────────────┬─────────────────┴──────────────────┬──────────────────┘
                  │                                    │
                  ▼                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    Core 60fps Game Loop (requestAnimationFrame)         │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌───────────────┐  │
│  │ Isometric World      │  │ Bowling & Batting    │  │ Village Rules │  │
│  │ Renderer (Canvas)    │  │ Physics Engine       │  │ & AI Fielders │  │
│  │ • Padam & Pitch      │  │ • Fast/Spin/Bouncer  │  │ • Kayal (OUT) │  │
│  │ • Canal & Houseboat  │  │ • Slower Ball        │  │ • Tin Roof +2 │  │
│  │ • Chayakada & Wall   │  │ • Trajectory Arc     │  │ • Paddy = 6   │  │
│  │ • Goat, Hens, Auto   │  │ • Timing Window Eval │  │ • Goat/Hen 0  │  │
│  └──────────────────────┘  └──────────────────────┘  └───────────────┘  │
└─────────────────┬────────────────────────────────────┬──────────────────┘
                  │                                    │
                  ▼                                    ▼
┌───────────────────────────────────┐  ┌──────────────────────────────────┐
│   Low-Occlusion Perimeter HUD     │  │   Web Audio Synthesizer          │
│   • Score / Wickets / Overs       │  │   • Bat Hit & Edge Tick          │
│   • Target / Req Runs / SR        │  │   • Chenda Drum Boundary Loop    │
│   • Manglish Pop-up Banner        │  │   • Crowd Cheer / Splash / Roof  │
│   • Mobile Touch Direction & Bat  │  │   • Global Mute Toggle           │
└───────────────────────────────────┘  └──────────────────────────────────┘
```

### Data Model & State

- **`CONFIG` (Top-of-File Tunable Constants)**:
  - `DIFFICULTY`: Timing window tolerances (`perfectWindowMs`, `goodWindowMs`, `edgeWindowMs`), bowler speed multipliers, and AI fielder sprint speed.
  - `OVERS_OPTIONS`: `[1, 2, 5]` (default `2` overs = 12 balls).
  - `BATSMEN`:
    - `unni`: Power Hitter (+25% exit velocity, easier 6s).
    - `appu`: Timing Master (+30% wider Perfect/Good timing window).
    - `ammachi`: Lucky Legend (35% chance to turn edges or mishits into miraculous sixes over the coconut palms).
  - `RIVAL_TEAMS`:
    - *Kuttanad XI* (Easy/Medium target, spin-heavy),
    - *Munnar Mavericks* (Medium/Hard target, fast & bouncer-heavy),
    - *Kozhikode Kings* (Hard tournament final, deceptive slower balls & tight fielding).
- **`gameState` Object**:
  - `screen`: `'TITLE' | 'PLAYING' | 'PAUSED' | 'SUMMARY'`
  - `mode`: `'QUICK' | 'CHASE' | 'TOURNAMENT'`
  - `weather`: `{ night: boolean, monsoon: boolean }`
  - `match`: `{ runs, wickets, maxWickets, ballsBowled, totalBalls, fours, sixes, target, bestShot, ballHistory }`
  - `delivery`: `{ state: 'IDLE' | 'RUNUP' | 'BOWLING' | 'HIT' | 'DEAD', type: 'FAST' | 'SPIN' | 'SLOWER' | 'BOUNCER', pos: {x,y,z}, vel: {vx,vy,vz}, aimDir: -1 | 0 | 1, timingRating }`

### Interactive Component & State Mapping

- **Title Screen Controls**: Mode selector cards, Overs selector (`1 / 2 / 5`), Batsman selector with lock status and `"Unlock All"` switch, Day/Night & Monsoon toggles, and `"Start Match (കളി തുടങ്ങാം)"` button.
- **In-Game Controls**:
  - Keyboard: `ArrowLeft`/`A` (Off Side), `ArrowUp`/`W` (Straight), `ArrowRight`/`D` (Leg Side), `Space`/`Enter` or Canvas Click (Swing Bat), `M` (Mute), `R` (Quick Restart), `P`/`Escape` (Pause).
  - Mobile/Touch: Dedicated bottom-left directional pad (`OFF`, `STR`, `LEG`) and bottom-right oversized `SWING (അടി!)` button, keeping >85% of the isometric field completely unobstructed.
- **Summary & Replay Flow**: Calculates strike rate, determines village title, updates session high score and milestone unlocks, and resets `match` and `delivery` states cleanly on replay.
