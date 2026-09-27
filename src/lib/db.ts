// src/lib/db.ts

import type { Room, Asset, Booking } from "@/types";

// ========== НАЗВАНИЯ ХРАНИЛИЩ ==========
const STORES = {
  ROOMS: "rooms",
  ASSETS: "assets",
  BOOKINGS: "bookings",
} as const;

// ========== ОТКРЫТИЕ / СОЗДАНИЕ БД ==========
export function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("RoomAssetsDB", 1);

    // Создаём хранилища при первой инициализации
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Хранилище комнат (ключ — id)
      if (!db.objectStoreNames.contains(STORES.ROOMS)) {
        const store = db.createObjectStore(STORES.ROOMS, { keyPath: "id" });
        store.createIndex("name", "name", { unique: false });
      }

      // Хранилище активов (ключ — id)
      if (!db.objectStoreNames.contains(STORES.ASSETS)) {
        const store = db.createObjectStore(STORES.ASSETS, { keyPath: "id" });
        store.createIndex("inventoryCode", "inventoryCode", { unique: true });
        store.createIndex("status", "status", { unique: false });
      }

      // Хранилище броней (ключ — id)
      if (!db.objectStoreNames.contains(STORES.BOOKINGS)) {
        const store = db.createObjectStore(STORES.BOOKINGS, { keyPath: "id" });
        store.createIndex("resourceId", "resourceId", { unique: false });
        store.createIndex("start", "start", { unique: false });
        store.createIndex("end", "end", { unique: false });
        // Составной индекс для быстрого поиска по ресурсу и времени
        store.createIndex("resourceType_resourceId", ["resourceType", "resourceId"], { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}