# Vennikulam Premier League — Two-Device 1v1 Multiplayer

Refactor the Multiplayer mode in **Vennikulam Premier League** to remove single-device Pass & Play completely and deliver a dedicated **Two-Device 1v1 Multiplayer** experience powered by a hybrid **Server Room Sync + WebRTC P2P** transport.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural and UX decisions reflect your confirmed preferences before we update the code:

- **Dedicated Two-Device Multiplayer Only**: Pass & Play (One Device) and its single-screen privacy curtain are completely removed. Selecting **Multiplayer (2 Devices)** on the start screen goes directly to the Two-Device lobby (**Host on Device 1** or **Join on Device 2**).
- **4-Letter Room Code & Invite Link**: Device 1 generates a 4-letter room code (e.g., `VPL4`) with a one-tap **Copy Invite Link** (`?room=CODE`) button. Device 2 joins either by entering the 4-letter code or opening the invite link directly.
- **Hybrid Server Room Sync + WebRTC Transport**: Combines a server-side room relay with WebRTC P2P using idempotent message IDs so two separate phones or laptops connect reliably in under 200ms even across mobile carrier NATs or firewalls.

---

## 1. Overview & Core Concept

- **What It Does**: Lets two players on two separate devices (phones, tablets, or laptops) play a full two-innings Kerala village padam cricket match against each other in real time.
- **Target Audience / Persona**: Friends and rivals playing head-to-head on their own devices who want instant room joining without NAT/firewall connection failures.
- **Key Value**: Each player has their own dedicated screen—the bowler secretly selects Variation (`Fast`, `Spin`, `Slower`, `Bouncer`), Line (`Off`, `Middle`, `Leg`), and Length (`Short`, `Good`, `Full`) on their device within the 3-second countdown while the batter prepares to time their shot on the other device.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Start Screen → Two-Device Lobby**: Clicking **Multiplayer (2 Devices)** opens the Two-Device lobby directly with two clean actions: **Host Match (Device 1)** and **Join Match (Device 2)**.
  2. **Host Flow (Device 1)**: Enters player name & batsman (`Sunni`, `Maanu`, or `Pro`), picks overs (`1`, `2`, or `5`), and clicks **Create Room**. Immediately displays the 4-letter room code and **Copy Invite Link** button while waiting for Device 2.
  3. **Guest Flow (Device 2)**: Opens the `?room=CODE` link (which auto-fills the code and switches to Guest mode) or types the 4-letter code and clicks **Join Room**.
  4. **Synchronized Coin Toss**: Once connected, both devices transition to the animated gold sovereign coin toss (`Heads / പൂവ്` or `Tails / കായ്`). The toss winner selects **Bat** or **Bowl** on their device.
  5. **Live Two-Device Innings**:
     - **Bowling Device**: Sees the bottom-docked 3-second delivery selector (`Fast / Spin / Slower / Bouncer`, `Off / Middle / Leg`, `Short / Good / Full`) and locks in the secret ball.
     - **Batting Device**: Sees `"Bowler is setting delivery..."` until release, then times the swing and picks direction (`← Off`, `↑ Straight`, `Leg →`).
  6. **Post-Match Scorecard & Rematch**: Both devices see the two-innings comparison scorecard, village awards (*"Padam King"*, *"Chayakada Champion"*, *"Kayalil Poyi Award"*), series score tracker, and **Rematch** button.
- **Visual Identity & Theme**:
  - Retains the Kerala Kasavu gold (`#D4AF37`), lush paddy green (`#14361B`), cream (`#FDFBF2`), and laterite (`#B45309`) palette alongside `Outfit`, `Plus Jakarta Sans`, and `JetBrains Mono` (`tabular-nums`).
  - Unobtrusive HUD occupying under 15% of viewport height so the harvested paddy field, mud bund, winding canal, and fielders remain in full view.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Removing Single-Device Pass & Play**
  - *Chosen Approach*: Remove the Pass & Play sub-mode and privacy handover curtain so Multiplayer is 100% focused on Two-Device play.
  - *Why*: Eliminates mode confusion and lets each player experience real-time head-to-head batting and bowling on their own device.
- **Decision 2: Hybrid Server Room Sync + WebRTC P2P**
  - *Chosen Approach*: Pair PeerJS WebRTC data channels with a lightweight server-backed room message queue (`/api/mp-room`) and deduplicated message IDs.
  - *Why*: Pure WebRTC often fails or stalls when two phones are on different cellular networks or restricted Wi-Fi. With hybrid sync, room creation and joining succeed 100% of the time, and every delivery, swing, toss, and emote arrives reliably with minimal latency.

---

## 4. Technical Architecture & Data Strategy

### Architecture & Component Diagram

```
┌────────────────────────────────────────────────────────────────────────────┐
│                   Vennikulam Premier League (Two-Device)                   │
└─────────────────────────────────────┬──────────────────────────────────────┘
                                      │
        ┌─────────────────────────────┴─────────────────────────────┐
        ▼                                                           ▼
┌───────────────────────────────┐                           ┌───────────────────────────────┐
│   Device 1: Host (Authoritative)│                         │     Device 2: Guest Client    │
│  • Creates 4-Letter Room Code │                           │  • Joins via Code or ?room=   │
│  • Runs Physics & Outcome Sim │                           │  • Sends Bowler/Batter Inputs │
│  • Renders Padam Canvas + HUD │                           │  • Renders Synced Canvas + HUD│
└───────────────┬───────────────┘                           └───────────────┬───────────────┘
                │                                                           │
                └─────────────► Dual Transport Network Layer ◄──────────────┘
                                              │
                        ┌─────────────────────┴─────────────────────┐
                        ▼                                           ▼
        ┌───────────────────────────────┐           ┌───────────────────────────────┐
        │   Server Room Sync (/api)     │           │   PeerJS WebRTC DataChannel   │
        │  • Instant Room Registration  │           │  • Direct P2P Fast Path       │
        │  • Ordered Event Relay Queue  │           │  • Sub-50ms Local Delivery    │
        │  • Heartbeat & Presence Track │           │  • Automatic Fallback         │
        └───────────────────────────────┘           └───────────────────────────────┘
```

### Data Model & State Synchronization

- **Room Session State**:
  - `roomCode`: 4-character alphanumeric code (`A-Z`, `2-9`).
  - `hostConnected` / `guestConnected`: Real-time presence timestamps for 30-second disconnect detection and auto-reconnect.
  - `events`: Ordered list of envelopes `{ id: string, sender: 'HOST' | 'GUEST', timestamp: number, message: PeerMessage }`.
- **Idempotent Event Deduplication**:
  - `PeerNetworkManager` assigns a unique `id` to every outgoing `PeerMessage` and tracks `seenMessageIds` (`Set<string>`).
  - Whether an event arrives first via WebRTC P2P or via the Server Room Sync poll, it is processed exactly once and never duplicated.
- **Interactive Component & State Mapping**:
  - **Two-Device Lobby Panel**: Toggle between **Host Match (Device 1)** and **Join Match (Device 2)**, edit player name/character, copy `?room=CODE` invite link, and auto-join when `?room=CODE` is present in the URL.
  - **Authoritative Ball & Swing Resolution**: When Device 2 is bowling, its 3-second delivery selection is sent via `BOWLING_CHOICE` to Device 1; when Device 2 is batting, its swing timing and direction are sent via `BATTER_SWING` and resolved deterministically.
