import { Room } from "./types";

const rooms = new Map<string, Room>();

export function createRoom(room: Room) {
  rooms.set(room.code, room);
}

export function getRoom(code: string): Room | undefined {
  return rooms.get(code.toUpperCase());
}

export function saveRoom(room: Room) {
  rooms.set(room.code, room);
}

export function roomExists(code: string) {
  return rooms.has(code.toUpperCase());
}