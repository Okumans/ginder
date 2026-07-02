import { NextRequest, NextResponse } from "next/server";
import { getRoom, saveRoom } from "@/lib/store";
import { maybeAdvanceBracket } from "@/lib/roomLogic";
import { getRestaurantsByIds } from "@/lib/mockData";

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

  const activeMatch = room.bracket.matches[room.bracket.activeMatchIndex];
  if (!activeMatch) {
    return NextResponse.json({ error: "ไม่พบคู่โหวตที่กำลังดำเนินอยู่" }, { status: 400 });
  }

  // Timer check: reject votes on expired matches
  if (
    activeMatch.startedAt &&
    activeMatch.id === matchId &&
    Date.now() - activeMatch.startedAt > 30_000
  ) {
    return NextResponse.json({ error: "หมดเวลาสำหรับคู่นี้แล้ว" }, { status: 400 });
  }

  // Only allow voting on the active match
  if (matchId !== activeMatch.id) {
    return NextResponse.json(
      { error: "กรุณาโหวตคู่ปัจจุบันก่อน" },
      { status: 400 }
    );
  }

  const match = room.bracket.matches.find((m) => m.id === matchId);
  if (!match) {
    return NextResponse.json({ error: "ไม่พบคู่โหวตนี้" }, { status: 400 });
  }

  // Don't allow double-voting
  if (match.votes[participantId]) {
    return NextResponse.json({ error: "คุณโหวตคู่นี้ไปแล้ว" }, { status: 400 });
  }

  match.votes[participantId] = restaurantId;

  try {
    maybeAdvanceBracket(room);
  } catch (e) {
    console.error("bracket-vote advance error:", e);
  }
  saveRoom(room);

  const restaurants = getRestaurantsByIds(room.restaurantPool);
  return NextResponse.json({ room, restaurants });
}