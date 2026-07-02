import { NextRequest, NextResponse } from "next/server";
import { getRoom, saveRoom } from "@/lib/store";
import { maybeAdvanceBracket } from "@/lib/roomLogic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const { participantId, matchId, restaurantId } = await request.json();
  const room = getRoom(code.toUpperCase());

  if (!room) {
    return NextResponse.json({ error: "ไม่พบห้องนี้" }, { status: 404 });
  }

  if (!room.participants[participantId]) {
    return NextResponse.json({ error: "ไม่พบผู้เข้าร่วมนี้" }, { status: 400 });
  }

  if (!room.bracket) {
    return NextResponse.json({ error: "ไม่พบรอบโหวต" }, { status: 400 });
  }

  const match = room.bracket.matches.find((m) => m.id === matchId);
  if (!match) {
    return NextResponse.json({ error: "ไม่พบคู่โหวตนี้" }, { status: 400 });
  }

  match.votes[participantId] = restaurantId;

  maybeAdvanceBracket(room);
  saveRoom(room);

  return NextResponse.json({ room });
}