import { NextRequest, NextResponse } from "next/server";
import { getRoom, saveRoom } from "@/lib/store";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const { participantId } = await request.json();
  const room = getRoom(code.toUpperCase());

  if (!room) {
    return NextResponse.json({ error: "ไม่พบห้องนี้" }, { status: 404 });
  }

  if (participantId !== room.leaderId) {
    return NextResponse.json(
      { error: "เฉพาะหัวหน้าห้องเท่านั้นที่เริ่มรอบใหม่ได้" },
      { status: 403 }
    );
  }

  room.status = "lobby";
  room.restaurantPool = [];
  room.participantOrder = {};
  room.swipes = {};
  room.bracket = undefined;
  room.winnerId = undefined;

  const pids = Object.keys(room.participants);
  pids.forEach((pid) => {
    room.participants[pid].finishedSwiping = false;
  });

  saveRoom(room);

  return NextResponse.json({ room });
}