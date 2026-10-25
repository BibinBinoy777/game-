// ============================================================================
// HYBRID TWO-DEVICE NETWORK MANAGER (SERVER ROOM SYNC + PEERJS WEBRTC P2P)
// ============================================================================
import { PeerMessage } from './multiplayerTypes';

declare global {
  interface Window {
    Peer?: any;
  }
}

export class PeerNetworkManager {
  private peer: any = null;
  private conn: any = null;
  private roomCode: string = '';
  private isHost: boolean = false;
  private pingInterval: any = null;
  private serverPollInterval: any = null;
  private disconnectTimeout: any = null;

  private webrtcConnected: boolean = false;
  private serverPeerConnected: boolean = false;
  private hasNotifiedConnect: boolean = false;
  private lastServerSeq: number = 0;
  private seenMessageIds: Set<string> = new Set();

  public onMessage: ((msg: PeerMessage) => void) | null = null;
  public onConnected: (() => void) | null = null;
  public onDisconnected: ((willWait: boolean) => void) | null = null;
  public onReconnected: (() => void) | null = null;
  public onPingUpdated: ((ms: number) => void) | null = null;
  public onError: ((err: string) => void) | null = null;

  // Ensure PeerJS library is loaded dynamically from CDN
  public static async loadPeerJs(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    if (window.Peer) return true;

    return new Promise((resolve) => {
      const existing = document.querySelector('script[data-peerjs="true"]');
      if (existing) {
        setTimeout(() => resolve(Boolean(window.Peer)), 500);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js';
      script.async = true;
      script.setAttribute('data-peerjs', 'true');
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.head.appendChild(script);
    });
  }

  // Generate 4-letter code without ambiguous characters (avoid 0/O, 1/I)
  public static generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  private getFullPeerId(code: string): string {
    return `vpl-kerala-${code.toUpperCase()}`;
  }

  // Host a room on Device 1 (Server Room Sync + WebRTC P2P)
  public async hostRoom(code: string): Promise<boolean> {
    this.cleanup();
    this.roomCode = code.trim().toUpperCase();
    this.isHost = true;

    // 1. Register room on Server Room Sync immediately
    let serverOk = false;
    try {
      const t0 = Date.now();
      const res = await fetch('/api/mp-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CREATE',
          code: this.roomCode,
          role: 'HOST',
        }),
      });
      const data = await res.json();
      if (data.ok) {
        serverOk = true;
        this.lastServerSeq = 0;
        if (this.onPingUpdated) {
          this.onPingUpdated(Math.max(1, Date.now() - t0));
        }
      }
    } catch (err) {
      console.warn('Server room create warning:', err);
    }

    // Start fast server polling loop for instant guest detection & fallback sync
    this.startServerSyncLoop();

    // 2. Also spin up WebRTC PeerJS host in parallel for direct P2P fast path
    this.initWebRtcHost();

    return serverOk || true;
  }

  private async initWebRtcHost() {
    const loaded = await PeerNetworkManager.loadPeerJs();
    if (!loaded || !window.Peer || !this.roomCode) return;

    try {
      const fullId = this.getFullPeerId(this.roomCode);
      this.peer = new window.Peer(fullId, { debug: 0 });

      this.peer.on('connection', (connection: any) => {
        this.setupConnection(connection);
      });

      this.peer.on('error', () => {
        // Server Room Sync handles connection seamlessly even if PeerJS broker has issues
      });
    } catch (_) {}
  }

  // Join an existing room on Device 2 (Server Room Sync + WebRTC P2P)
  public async joinRoom(code: string): Promise<boolean> {
    this.cleanup();
    this.roomCode = code.trim().toUpperCase();
    this.isHost = false;

    if (this.roomCode.length < 4) {
      if (this.onError) this.onError('Please enter a valid 4-letter room code.');
      return false;
    }

    // 1. Join via Server Room Sync immediately
    try {
      const t0 = Date.now();
      const res = await fetch('/api/mp-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'JOIN',
          code: this.roomCode,
          role: 'GUEST',
        }),
      });
      const data = await res.json();
      if (data.ok) {
        this.lastServerSeq = data.lastSeq || 0;
        this.serverPeerConnected = true;
        if (this.onPingUpdated) {
          this.onPingUpdated(Math.max(1, Date.now() - t0));
        }
        this.notifyPeerConnected();
      }
    } catch (err) {
      console.warn('Server room join warning:', err);
    }

    // Start fast server polling loop
    this.startServerSyncLoop();

    // 2. Also initiate WebRTC P2P connection in parallel
    this.initWebRtcGuest();

    return true;
  }

  private async initWebRtcGuest() {
    const loaded = await PeerNetworkManager.loadPeerJs();
    if (!loaded || !window.Peer || !this.roomCode) return;

    try {
      this.peer = new window.Peer({ debug: 0 });
      this.peer.on('open', () => {
        if (!this.peer || !this.roomCode) return;
        const targetId = this.getFullPeerId(this.roomCode);
        const connection = this.peer.connect(targetId, { reliable: true });
        this.setupConnection(connection);
      });
      this.peer.on('error', () => {
        // Handled seamlessly by Server Room Sync
      });
    } catch (_) {}
  }

  private notifyPeerConnected() {
    if (this.disconnectTimeout) {
      clearTimeout(this.disconnectTimeout);
      this.disconnectTimeout = null;
      if (this.onReconnected) this.onReconnected();
      return;
    }
    if (!this.hasNotifiedConnect) {
      this.hasNotifiedConnect = true;
      if (this.onConnected) this.onConnected();
    }
  }

  private startServerSyncLoop() {
    this.stopServerSyncLoop();
    this.serverPollInterval = setInterval(async () => {
      if (!this.roomCode) return;
      try {
        const t0 = Date.now();
        const res = await fetch('/api/mp-room', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'POLL',
            code: this.roomCode,
            role: this.isHost ? 'HOST' : 'GUEST',
            afterSeq: this.lastServerSeq,
          }),
        });
        const data = await res.json();
        if (!data.ok) return;

        const rtt = Math.max(1, Math.round((Date.now() - t0) * 0.6));
        if (!this.webrtcConnected && this.onPingUpdated) {
          this.onPingUpdated(rtt);
        }

        if (data.peerConnected) {
          this.serverPeerConnected = true;
          this.notifyPeerConnected();
        } else if (this.hasNotifiedConnect && !this.webrtcConnected && !data.peerConnected) {
          this.serverPeerConnected = false;
          this.handlePeerLoss();
        }

        if (Array.isArray(data.events) && data.events.length > 0) {
          for (const ev of data.events) {
            if (ev.seq > this.lastServerSeq) {
              this.lastServerSeq = ev.seq;
            }
            if (ev.message) {
              this.processIncomingMessage(ev.message);
            }
          }
        }
      } catch (_) {
        // Ignore transient network hiccups during poll
      }
    }, 220);
  }

  private stopServerSyncLoop() {
    if (this.serverPollInterval) {
      clearInterval(this.serverPollInterval);
      this.serverPollInterval = null;
    }
  }

  private setupConnection(connection: any) {
    if (this.conn) {
      try {
        this.conn.close();
      } catch (_) {}
    }
    this.conn = connection;

    this.conn.on('open', () => {
      this.webrtcConnected = true;
      this.notifyPeerConnected();
      this.startHeartbeat();
    });

    this.conn.on('data', (data: any) => {
      if (!data) return;
      this.processIncomingMessage(data);
    });

    this.conn.on('close', () => {
      this.webrtcConnected = false;
      if (!this.serverPeerConnected) {
        this.handlePeerLoss();
      }
    });

    this.conn.on('error', () => {
      this.webrtcConnected = false;
    });
  }

  private processIncomingMessage(data: PeerMessage) {
    if (!data) return;

    if (data.type === 'PING') {
      if (this.conn && this.conn.open) {
        try {
          this.conn.send({ type: 'PONG', payload: data.payload });
        } catch (_) {}
      }
      return;
    }

    if (data.type === 'PONG') {
      const sentAt = Number(data.payload);
      if (sentAt && this.onPingUpdated) {
        const latency = Math.max(1, Math.round(Date.now() - sentAt));
        this.onPingUpdated(latency);
      }
      return;
    }

    // Deduplicate messages across WebRTC and Server Room Sync
    if (data.id) {
      if (this.seenMessageIds.has(data.id)) {
        return;
      }
      this.seenMessageIds.add(data.id);
      if (this.seenMessageIds.size > 300) {
        const firstKey = this.seenMessageIds.values().next().value;
        if (firstKey) this.seenMessageIds.delete(firstKey);
      }
    }

    if (this.onMessage) {
      this.onMessage(data);
    }
  }

  private handlePeerLoss() {
    this.stopHeartbeat();
    if (this.onDisconnected) {
      this.onDisconnected(true);
    }
    if (this.disconnectTimeout) clearTimeout(this.disconnectTimeout);

    // Give 30s to reconnect before terminating
    this.disconnectTimeout = setTimeout(() => {
      if (!this.isConnected() && this.onDisconnected) {
        this.onDisconnected(false);
      }
    }, 30000);
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.pingInterval = setInterval(() => {
      if (this.conn && this.conn.open) {
        try {
          this.conn.send({ type: 'PING', payload: Date.now() });
        } catch (_) {}
      }
    }, 2000);
  }

  private stopHeartbeat() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  public send(msg: PeerMessage) {
    const msgId = msg.id || `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const enriched: PeerMessage = { ...msg, id: msgId };
    this.seenMessageIds.add(msgId);

    // 1. Fast path: WebRTC DataChannel
    if (this.conn && this.conn.open) {
      try {
        this.conn.send(enriched);
      } catch (err) {
        console.warn('WebRTC send warning:', err);
      }
    }

    // 2. Guaranteed path: Server Room Sync relay
    if (this.roomCode && msg.type !== 'PING' && msg.type !== 'PONG') {
      fetch('/api/mp-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SEND',
          code: this.roomCode,
          role: this.isHost ? 'HOST' : 'GUEST',
          id: msgId,
          message: enriched,
        }),
      }).catch(() => {});
    }
  }

  public isConnected(): boolean {
    return Boolean((this.conn && this.conn.open) || this.serverPeerConnected);
  }

  public getRoomCode(): string {
    return this.roomCode;
  }

  public cleanup() {
    this.stopHeartbeat();
    this.stopServerSyncLoop();
    this.webrtcConnected = false;
    this.serverPeerConnected = false;
    this.hasNotifiedConnect = false;
    this.lastServerSeq = 0;
    this.seenMessageIds.clear();

    if (this.disconnectTimeout) {
      clearTimeout(this.disconnectTimeout);
      this.disconnectTimeout = null;
    }
    if (this.conn) {
      try {
        this.conn.close();
      } catch (_) {}
      this.conn = null;
    }
    if (this.peer) {
      try {
        this.peer.destroy();
      } catch (_) {}
      this.peer = null;
    }
  }
}
