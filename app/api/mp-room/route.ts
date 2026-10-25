import { NextRequest, NextResponse } from 'next/server';
import { PeerMessage } from '@/lib/multiplayerTypes';

interface RoomEventEnvelope {
  seq: number;
  id: string;
  sender: 'HOST' | 'GUEST';
  timestamp: number;
  message: PeerMessage;
}

interface ServerRoomState {
  code: string;
  createdAt: number;
  hostLastSeen: number;
  guestLastSeen: number;
  guestJoined: boolean;
  nextSeq: number;
  events: RoomEventEnvelope[];
}

declare global {
  var __vplMultiplayerRooms: Map<string, ServerRoomState> | undefined;
}

function getRoomStore(): Map<string, ServerRoomState> {
  if (!globalThis.__vplMultiplayerRooms) {
    globalThis.__vplMultiplayerRooms = new Map<string, ServerRoomState>();
  }
  return globalThis.__vplMultiplayerRooms;
}

function pruneStaleRooms(store: Map<string, ServerRoomState>) {
  const now = Date.now();
  const maxAgeMs = 2 * 60 * 60 * 1000; // 2 hours
  for (const [key, room] of store.entries()) {
    if (now - room.createdAt > maxAgeMs && now - room.hostLastSeen > 600000 && now - room.guestLastSeen > 600000) {
      store.delete(key);
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, code, role, id, message, afterSeq = 0 } = body;
    const rawCode = String(code || '').trim().toUpperCase();

    if (!rawCode || rawCode.length < 3) {
      return NextResponse.json({ ok: false, error: 'Invalid 4-letter room code' }, { status: 400 });
    }

    const store = getRoomStore();
    pruneStaleRooms(store);
    const now = Date.now();

    if (action === 'CREATE') {
      const newRoom: ServerRoomState = {
        code: rawCode,
        createdAt: now,
        hostLastSeen: now,
        guestLastSeen: 0,
        guestJoined: false,
        nextSeq: 1,
        events: [],
      };
      store.set(rawCode, newRoom);
      return NextResponse.json({ ok: true, code: rawCode, serverTime: now });
    }

    if (action === 'JOIN') {
      let room = store.get(rawCode);
      if (!room) {
        // Allow joining even if Guest hits join slightly before Host registration completes
        room = {
          code: rawCode,
          createdAt: now,
          hostLastSeen: now,
          guestLastSeen: now,
          guestJoined: true,
          nextSeq: 1,
          events: [],
        };
        store.set(rawCode, room);
      } else {
        room.guestJoined = true;
        room.guestLastSeen = now;
      }

      const hostActive = now - room.hostLastSeen < 15000;
      return NextResponse.json({
        ok: true,
        code: rawCode,
        hostActive,
        lastSeq: room.nextSeq - 1,
        serverTime: now,
      });
    }

    if (action === 'SEND') {
      let room = store.get(rawCode);
      if (!room) {
        room = {
          code: rawCode,
          createdAt: now,
          hostLastSeen: role === 'HOST' ? now : 0,
          guestLastSeen: role === 'GUEST' ? now : 0,
          guestJoined: role === 'GUEST',
          nextSeq: 1,
          events: [],
        };
        store.set(rawCode, room);
      }

      if (role === 'HOST') {
        room.hostLastSeen = now;
      } else {
        room.guestJoined = true;
        room.guestLastSeen = now;
      }

      const msgId = String(id || `${now}-${Math.random().toString(36).slice(2, 8)}`);
      const alreadyExists = room.events.some((e) => e.id === msgId);
      if (!alreadyExists && message) {
        room.events.push({
          seq: room.nextSeq++,
          id: msgId,
          sender: role === 'HOST' ? 'HOST' : 'GUEST',
          timestamp: now,
          message: { ...message, id: msgId },
        });
        if (room.events.length > 120) {
          room.events = room.events.slice(-120);
        }
      }

      return NextResponse.json({ ok: true, seq: room.nextSeq - 1, serverTime: now });
    }

    if (action === 'POLL') {
      const room = store.get(rawCode);
      if (!room) {
        return NextResponse.json({
          ok: false,
          error: 'Room not found',
          peerConnected: false,
          events: [],
          serverTime: now,
        });
      }

      if (role === 'HOST') {
        room.hostLastSeen = now;
      } else {
        room.guestJoined = true;
        room.guestLastSeen = now;
      }

      const peerConnected =
        role === 'HOST'
          ? room.guestJoined && now - room.guestLastSeen < 12000
          : now - room.hostLastSeen < 12000;

      const incomingEvents = room.events.filter(
        (e) => e.seq > Number(afterSeq) && e.sender !== role
      );

      const maxSeq =
        incomingEvents.length > 0
          ? incomingEvents[incomingEvents.length - 1].seq
          : Number(afterSeq);

      return NextResponse.json({
        ok: true,
        peerConnected,
        events: incomingEvents,
        lastSeq: maxSeq,
        serverTime: now,
      });
    }

    return NextResponse.json({ ok: false, error: 'Unsupported action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || 'Server room sync error' },
      { status: 500 }
    );
  }
}
