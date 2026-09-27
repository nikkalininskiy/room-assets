// src/api/roomsApi.ts

import type { Room } from "@/types";
import { roomService } from "@/services";

// ========== DTO ==========
export type RoomStatus = "available" | "booked" | "maintenance";

export interface RoomDto {
  id: string;
  code: string;
  name: string;
  capacity: number;
  equipment: string[];
  status: RoomStatus;
}

export interface RoomsResponseDto {
  items: RoomDto[];
  page: number;
  total: number;
}

// ========== ФУНКЦИИ ДЛЯ РАБОТЫ С БД ==========

// Получить все комнаты
export async function fetchRooms(page = 1): Promise<RoomsResponseDto> {
  try {
    const items = await roomService.getAll();
    const safeItems = Array.isArray(items) ? items : [];
    return {
      items: safeItems.map(roomToDto),
      page,
      total: safeItems.length,
    };
  } catch (error) {
    console.error("Ошибка загрузки комнат:", error);
    return { items: [], page: 1, total: 0 };
  }
}

// Создать комнату
export async function createRoom(data: Omit<RoomDto, "id">): Promise<RoomDto> {
  const room = dtoToRoom(data);
  const created = await roomService.create(room);
  return roomToDto(created);
}

// Обновить комнату
export async function updateRoom(
  id: string,
  data: Partial<RoomDto>
): Promise<RoomDto> {
  const updates = partialDtoToRoom(data);
  const updated = await roomService.update(id, updates);
  if (!updated) {
    throw new Error("Комната не найдена");
  }
  return roomToDto(updated);
}

// Удалить комнату
export async function deleteRoom(id: string): Promise<void> {
  await roomService.delete(id);
}

// Поиск комнат
export async function searchRooms(query: string): Promise<RoomDto[]> {
  const items = await roomService.search(query);
  return items.map(roomToDto);
}

// ========== АДАПТЕРЫ ==========

function roomToDto(room: Room): RoomDto {
  const status: RoomStatus = "available";
  return {
    id: room.id,
    code: room.name.split(" ")[0] || room.id,
    name: room.name,
    capacity: room.capacity,
    equipment: room.features || [],
    status,
  };
}

function dtoToRoom(dto: Omit<RoomDto, "id">): Omit<Room, "id"> {
  return {
    name: dto.name,
    capacity: dto.capacity,
    features: dto.equipment || [],
  };
}

function partialDtoToRoom(dto: Partial<RoomDto>): Partial<Room> {
  const updates: Partial<Room> = {};
  if (dto.name !== undefined) updates.name = dto.name;
  if (dto.capacity !== undefined) updates.capacity = dto.capacity;
  if (dto.equipment !== undefined) updates.features = dto.equipment;
  return updates;
}