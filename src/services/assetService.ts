// src/services/assetService.ts

import type { Asset } from "@/types";
import {
  createRecord,
  readRecord,
  updateRecord,
  deleteRecord,
  getAllRecords,
} from "@/lib/db-crud";

const STORE = "assets";

export const assetService = {
  // Получить все активы
  getAll: (): Promise<Asset[]> => {
    return getAllRecords<Asset>(STORE);
  },

  // Получить актив по ID
  getById: (id: string): Promise<Asset | null> => {
    return readRecord<Asset>(STORE, id);
  },

  // Создать актив
  create: (data: Omit<Asset, "id">): Promise<Asset> => {
    return createRecord<Asset>(STORE, data);
  },

  // Обновить актив
  update: (id: string, updates: Partial<Asset>): Promise<Asset | null> => {
    return updateRecord<Asset>(STORE, id, updates);
  },

  // Удалить актив
  delete: (id: string): Promise<boolean> => {
    return deleteRecord(STORE, id);
  },

  // Поиск по названию
  search: async (query: string): Promise<Asset[]> => {
    const all = await getAllRecords<Asset>(STORE);
    const lowerQuery = query.toLowerCase().trim();
    if (!lowerQuery) return all;
    return all.filter((asset) =>
      asset.name.toLowerCase().includes(lowerQuery)
    );
  },
};