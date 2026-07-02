import { NextRequest, NextResponse } from "next/server";
import { getRoom, saveRoom } from "@/lib/store";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const { username } = await request.json();
  const upperCode = code.toUpperCase();
  const room = getRoom(upperCode);

  if (!room) {
    return NextResponse.json({ error: "ไม่พบห้องนี้" }, { status: 404 });
  }

  if (room.status !== "lobby") {
    return NextResponse.json({ error: "เกมเริ่มไปแล้ว เข้าร่วมไม่ได้" }, { status: 400 });
  }

  if (!username || typeof username !== "string" || username.trim().length === 0) {
    return NextResponse.json({ error: "กรุณาใส่ชื่อผู้ใช้" }, { status: 400 });
  }

  const trimmedName = username.trim();

  const nameTaken = Object.values(room.participants).some(
    (p) => p.username.toLowerCase() === trimmedName.toLowerCase()
  );
  if (nameTaken) {
    return NextResponse.json({ error: "ชื่อนี้มีคนใช้แล้วในห้องนี้" }, { status: 400 });
  }

  const participantId = crypto.randomUUID();

  room.participants[participantId] = {
    id: participantId,
    username: trimmedName,
    isLeader: false,
    finishedSwiping: false,
  };

  saveRoom(room);

  return NextResponse.json({
    participantId,
    room,
  });
}