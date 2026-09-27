// src/lib/seed.ts

import type { Room, Asset, Booking } from "@/types";
import { roomService } from "@/services/roomService";
import { assetService } from "@/services/assetService";
import { bookingService } from "@/services/bookingService";
import { getAllRecords } from "./db-crud";

// Начальные данные (из ТЗ)
const SEED_ROOMS: Omit<Room, "id">[] = [
  { name: "Аудитория 101", capacity: 30, features: ["projector", "whiteboard"] },
  { name: "Аудитория 203", capacity: 20, features: [] },
];

const SEED_ASSETS: Omit<Asset, "id">[] = [
  { name: "Проектор Epson", inventoryCode: "PRJ-001", status: "available" },
  { name: "Ноутбук Dell", inventoryCode: "LAP-001", status: "available" },
];

const SEED_BOOKINGS: Omit<Booking, "id">[] = [
  {
    resourceType: "room",
    resourceId: "r-101", // Этот ID будет создан автоматически
    title: "Семинар по TypeScript",
    start: "2025-09-05T08:00:00Z",
    end: "2025-09-05T09:30:00Z",
    notes: "Нужен HDMI-кабель",
  },
];

// Проверка, есть ли данные в БД
export async function isDatabaseEmpty(): Promise<boolean> {
  const rooms = await getAllRecords<Room>("rooms");
  return rooms.length === 0;
}

// Заполнение БД начальными данными
export async function seedDatabase(): Promise<void> {
  console.log("🌱 Заполнение базы данных начальными данными...");

  // 1. Создаём комнаты
  const createdRooms: Room[] = [];
  for (const room of SEED_ROOMS) {
    const created = await roomService.create(room);
    createdRooms.push(created);
    console.log(`  ✅ Создана комната: ${created.name}`);
  }

  // 2. Создаём активы
  const createdAssets: Asset[] = [];
  for (const asset of SEED_ASSETS) {
    const created = await assetService.create(asset);
    createdAssets.push(created);
    console.log(`  ✅ Создан актив: ${created.name}`);
  }

  // 3. Создаём брони (привязываем к созданным ресурсам)
  for (const booking of SEED_BOOKINGS) {
    // Для примера привязываем бронь к первой созданной комнате
    const resourceId = createdRooms[0]?.id;
    if (resourceId) {
      await bookingService.create({
        ...booking,
        resourceId,
      });
      console.log(`  ✅ Создана бронь: ${booking.title}`);
    }
  }

  console.log("✅ База данных заполнена!");
}