// src/types/index.ts

// ========== КОМНАТЫ ==========
export interface Room {
  id: string;
  name: string;
  capacity: number;
  features: string[];  // например, ["projector", "whiteboard"]
}

// ========== АКТИВЫ ==========
export interface Asset {
  id: string;
  name: string;
  inventoryCode: string;
  status: "available" | "in_use" | "maintenance";
}

// ========== БРОНИ ==========
export type ResourceType = "room" | "asset";

export interface Booking {
  id: string;
  resourceType: ResourceType;
  resourceId: string;   // ID комнаты или актива
  title: string;
  start: string;        // ISO 8601 / RFC 3339 (UTC)
  end: string;          // ISO 8601 / RFC 3339 (UTC)
  notes?: string;
}

// ========== ВСЕ ДАННЫЕ ДЛЯ ЭКСПОРТА/ИМПОРТА ==========
export interface AppData {
  rooms: Room[];
  assets: Asset[];
  bookings: Booking[];
}