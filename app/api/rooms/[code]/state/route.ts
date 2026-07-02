import { NextRequest, NextResponse } from "next/server";
import { getRoom } from "@/lib/store";
import { getRestaurantsByIds } from "@/lib/mockData";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const participantId = request.nextUrl.searchParams.get("participantId");
  const room = getRoom(code.toUpperCase());

  if (!room) {
    return NextResponse.json({ error: "ไม่พบห้องนี้" }, { status: 404 });
  }

  if (!participantId || !room.participants[participantId]) {
    return NextResponse.json({ error: "ไม่พบผู้เข้าร่วมนี้" }, { status: 400 });
  }

  const restaurants = getRestaurantsByIds(room.restaurantPool);
  const yourOrder = room.participantOrder[participantId] ?? [];

  let swipeRemaining = 0;
  let bracketMatchRemaining = 0;
  let activeMatchId: string | null = null;

  if (room.status === "swiping" && room.swipeStartedAt) {
    swipeRemaining = Math.max(
      0,
      60 - Math.floor((Date.now() - room.swipeStartedAt) / 1000)
    );
  }

  if (room.status === "bracket" && room.bracket) {
    const active = room.bracket.matches[room.bracket.activeMatchIndex];
    if (active && !active.winnerId && active.startedAt) {
      activeMatchId = active.id;
      bracketMatchRemaining = Math.max(
        0,
        30 - Math.floor((Date.now() - active.startedAt) / 1000)
      );
    }
  }

  return NextResponse.json({
    room,
    restaurants,
    yourOrder,
    timers: { swipeRemaining, bracketMatchRemaining, activeMatchId },
  });
}