import { NextRequest, NextResponse } from "next/server";
import { generateRoomCode } from "@/lib/roomLogic";
import { createRoom } from "@/lib/store";
import { Room } from "@/lib/types";

export async function POST(request: NextRequest) {
  const { username } = await request.json();

  if (!username || typeof username !== "string" || username.trim().length === 0) {
    return NextResponse.json({ error: "กรุณาใส่ชื่อผู้ใช้" }, { status: 400 });
  }

  const code = generateRoomCode();
  const participantId = crypto.randomUUID();

  const room: Room = {
    code,
    leaderId: participantId,
    status: "lobby",
    restaurantPool: [],
    participantOrder: {},
    participants: {
      [participantId]: {
        id: participantId,
        username: username.trim(),
        isLeader: true,
        finishedSwiping: false,
      },
    },
    swipes: {},
    createdAt: Date.now(),
  };

  createRoom(room);

  return NextResponse.json({
    code,
    participantId,
    room,
  });
}