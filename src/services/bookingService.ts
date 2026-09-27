// src/services/bookingService.ts

import type { Booking } from "@/types";
import {
  createRecord,
  readRecord,
  updateRecord,
  deleteRecord,
  getAllRecords,
} from "@/lib/db-crud";
import { checkOverlap, isValidTimeRange } from "@/lib/booking-utils";

const STORE = "bookings";

export const bookingService = {
  getAll: (): Promise<Booking[]> => {
    return getAllRecords<Booking>(STORE);
  },

  getById: (id: string): Promise<Booking | null> => {
    return readRecord<Booking>(STORE, id);
  },

  create: async (data: Omit<Booking, "id">): Promise<Booking> => {
    if (!isValidTimeRange(data.start, data.end)) {
      throw new Error("Время начала должно быть меньше времени окончания");
    }

    const allBookings = await getAllRecords<Booking>(STORE);
    if (checkOverlap(allBookings, data)) {
      throw new Error("Бронь пересекается с существующей для этого ресурса");
    }

    return createRecord<Booking>(STORE, data);
  },

  // ✅ ИСПРАВЛЕННАЯ ВЕРСИЯ update
  update: async (
    id: string,
    updates: Partial<Booking>
  ): Promise<Booking | null> => {
    // 1. Получаем текущую бронь
    const current = await readRecord<Booking>(STORE, id);
    if (!current) {
      throw new Error("Бронь не найдена");
    }

    // 2. Проверка времени
    const start = updates.start ?? current.start;
    const end = updates.end ?? current.end;
    if (!isValidTimeRange(start, end)) {
      throw new Error("Время начала должно быть меньше времени окончания");
    }

    // 3. Проверка пересечений ТОЛЬКО если изменился ресурс или время
    const resourceChanged =
      updates.resourceId !== undefined || updates.resourceType !== undefined;
    const timeChanged = updates.start !== undefined || updates.end !== undefined;

    if (resourceChanged || timeChanged) {
      const allBookings = await getAllRecords<Booking>(STORE);
      const otherBookings = allBookings.filter((b) => b.id !== id);
      const updatedBooking = { ...current, ...updates };

      if (checkOverlap(otherBookings, updatedBooking)) {
        throw new Error("Бронь пересекается с существующей для этого ресурса");
      }
    }

    // 4. Обновление
    return updateRecord<Booking>(STORE, id, updates);
  },

  delete: (id: string): Promise<boolean> => {
    return deleteRecord(STORE, id);
  },

  getByResource: async (
    resourceType: "room" | "asset",
    resourceId: string
  ): Promise<Booking[]> => {
    const all = await getAllRecords<Booking>(STORE);
    return all.filter(
      (b) => b.resourceType === resourceType && b.resourceId === resourceId
    );
  },

  getByDateRange: async (startDate: string, endDate: string): Promise<Booking[]> => {
    const all = await getAllRecords<Booking>(STORE);
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    return all.filter((b) => {
      const bStart = new Date(b.start).getTime();
      const bEnd = new Date(b.end).getTime();
      return bStart >= start && bEnd <= end;
    });
  },
};