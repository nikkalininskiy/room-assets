// src/lib/booking-utils.ts

import type { Booking } from "@/types";

// Проверка пересечения интервалов
export function checkOverlap(
  bookings: Booking[],
  newBooking: Omit<Booking, "id">
): boolean {
  // Проверяем только для того же ресурса
  const relevantBookings = bookings.filter(
    (b) =>
      b.resourceType === newBooking.resourceType &&
      b.resourceId === newBooking.resourceId
  );

  const newStart = new Date(newBooking.start).getTime();
  const newEnd = new Date(newBooking.end).getTime();

  return relevantBookings.some((b) => {
    const bStart = new Date(b.start).getTime();
    const bEnd = new Date(b.end).getTime();

    // Интервалы пересекаются, если начало одного меньше конца другого
    return newStart < bEnd && newEnd > bStart;
  });
}

// Проверка корректности времени (старт < конец)
export function isValidTimeRange(start: string, end: string): boolean {
  return new Date(start).getTime() < new Date(end).getTime();
}

// Форматирование даты для отображения в локальном времени
export function formatLocalTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString("ru-RU", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Преобразование локальной даты в UTC (для сохранения)
export function toUTC(date: Date): string {
  return date.toISOString();
}