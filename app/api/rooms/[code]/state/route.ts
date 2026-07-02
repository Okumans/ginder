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

  return NextResponse.json({
    room,
    restaurants,
    yourOrder,
  });
}