import { NextRequest, NextResponse } from "next/server";
import { getRoom, saveRoom } from "@/lib/store";
import { shuffle } from "@/lib/roomLogic";
import mockRestaurants from "@/lib/mockData";

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
      { error: "เฉพาะหัวหน้าห้องเท่านั้นที่เริ่มได้" },
      { status: 403 }
    );
  }

  const participantCount = Object.keys(room.participants).length;
  if (participantCount < 2) {
    return NextResponse.json(
      { error: "ต้องมีอย่างน้อย 2 คนถึงจะเริ่มได้" },
      { status: 400 }
    );
  }

  const allRestaurantIds = mockRestaurants.map((r) => r.id);
  room.restaurantPool = shuffle(allRestaurantIds).slice(0, 10);

  const pids = Object.keys(room.participants);
  room.participantOrder = {};
  pids.forEach((pid) => {
    room.participantOrder[pid] = shuffle([...room.restaurantPool]);
  });

  pids.forEach((pid) => {
    room.participants[pid].finishedSwiping = false;
  });
  room.swipes = {};
  room.status = "swiping";

  saveRoom(room);

  return NextResponse.json({ room });
}