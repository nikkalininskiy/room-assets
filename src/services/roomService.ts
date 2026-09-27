// src/services/roomService.ts

import type { Room } from "@/types";
import {
  createRecord,
  readRecord,
  updateRecord,
  deleteRecord,
  getAllRecords,
} from "@/lib/db-crud";

const STORE = "rooms";

export const roomService = {
  // Получить все комнаты
  getAll: (): Promise<Room[]> => {
    return getAllRecords<Room>(STORE);
  },

  // Получить комнату по ID
  getById: (id: string): Promise<Room | null> => {
    return readRecord<Room>(STORE, id);
  },

  // Создать комнату
  create: (data: Omit<Room, "id">): Promise<Room> => {
    return createRecord<Room>(STORE, data);
  },

  // Обновить комнату
  update: (id: string, updates: Partial<Room>): Promise<Room | null> => {
    return updateRecord<Room>(STORE, id, updates);
  },

  // Удалить комнату
  delete: (id: string): Promise<boolean> => {
    return deleteRecord(STORE, id);
  },

  // Поиск по названию (фильтрация на клиенте)
  search: async (query: string): Promise<Room[]> => {
    const all = await getAllRecords<Room>(STORE);
    const lowerQuery = query.toLowerCase().trim();
    if (!lowerQuery) return all;
    return all.filter((room) =>
      room.name.toLowerCase().includes(lowerQuery)
    );
  },
};