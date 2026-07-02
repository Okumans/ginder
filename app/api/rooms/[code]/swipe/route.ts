import { NextRequest, NextResponse } from "next/server";
import { getRoom, saveRoom } from "@/lib/store";
import { computeResult } from "@/lib/roomLogic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const { participantId, restaurantId, direction } = await request.json();
  const room = getRoom(code.toUpperCase());

  if (!room) {
    return NextResponse.json({ error: "ไม่พบห้องนี้" }, { status: 404 });
  }

  if (!room.participants[participantId]) {
    return NextResponse.json({ error: "ไม่พบผู้เข้าร่วมนี้" }, { status: 400 });
  }

  if (direction !== "like" && direction !== "pass") {
    return NextResponse.json({ error: "ทิศทางไม่ถูกต้อง" }, { status: 400 });
  }

  if (!room.swipes[participantId]) {
    room.swipes[participantId] = {};
  }

  room.swipes[participantId][restaurantId] = direction;

  const order = room.participantOrder[participantId];
  const swipedCount = Object.keys(room.swipes[participantId]).length;
  if (swipedCount >= order.length) {
    room.participants[participantId].finishedSwiping = true;
  }

  const pids = Object.keys(room.participants);
  const allFinished = pids.every(
    (pid) => room.participants[pid].finishedSwiping
  );

  if (allFinished && room.status === "swiping") {
    computeResult(room);
  }

  saveRoom(room);

  return NextResponse.json({ room });
}