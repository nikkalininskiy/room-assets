// src/api/bookingsApi.ts

import type { Booking, ResourceType } from "@/types";
import { bookingService } from "@/services";
import { checkOverlap, isValidTimeRange } from "@/lib/booking-utils";

export interface BookingDto {
  id: string;
  resourceType: ResourceType;
  resourceId: string;
  title: string;
  start: string;
  end: string;
  notes?: string;
}

export interface BookingsResponseDto {
  items: BookingDto[];
  page: number;
  total: number;
}

// Получить все брони
export async function fetchBookings(page = 1): Promise<BookingsResponseDto> {
  try {
    const items = await bookingService.getAll();
    const safeItems = Array.isArray(items) ? items : [];
    return {
      items: safeItems.map(bookingToDto),
      page,
      total: safeItems.length,
    };
  } catch (error) {
    console.error("Ошибка загрузки броней:", error);
    return { items: [], page: 1, total: 0 };
  }
}

// Создать бронь
export async function createBooking(
  data: Omit<BookingDto, "id">
): Promise<BookingDto> {
  const booking = dtoToBooking(data);
  const created = await bookingService.create(booking);
  return bookingToDto(created);
}

// Обновить бронь
export async function updateBooking(
  id: string,
  data: Partial<BookingDto>
): Promise<BookingDto> {
  const updates = partialDtoToBooking(data);
  const updated = await bookingService.update(id, updates);
  if (!updated) {
    throw new Error("Бронь не найдена");
  }
  return bookingToDto(updated);
}

// Удалить бронь
export async function deleteBooking(id: string): Promise<void> {
  await bookingService.delete(id);
}

// Получить брони для ресурса
export async function fetchBookingsByResource(
  resourceType: ResourceType,
  resourceId: string
): Promise<BookingDto[]> {
  const items = await bookingService.getByResource(resourceType, resourceId);
  return items.map(bookingToDto);
}

// Проверка пересечений (экспортируем из утилит)
export { checkOverlap, isValidTimeRange };

// ========== АДАПТЕРЫ ==========

function bookingToDto(booking: Booking): BookingDto {
  return {
    id: booking.id,
    resourceType: booking.resourceType,
    resourceId: booking.resourceId,
    title: booking.title,
    start: booking.start,
    end: booking.end,
    notes: booking.notes,
  };
}

function dtoToBooking(dto: Omit<BookingDto, "id">): Omit<Booking, "id"> {
  return {
    resourceType: dto.resourceType,
    resourceId: dto.resourceId,
    title: dto.title,
    start: dto.start,
    end: dto.end,
    notes: dto.notes || "",
  };
}

function partialDtoToBooking(dto: Partial<BookingDto>): Partial<Booking> {
  const updates: Partial<Booking> = {};
  if (dto.resourceType !== undefined) updates.resourceType = dto.resourceType;
  if (dto.resourceId !== undefined) updates.resourceId = dto.resourceId;
  if (dto.title !== undefined) updates.title = dto.title;
  if (dto.start !== undefined) updates.start = dto.start;
  if (dto.end !== undefined) updates.end = dto.end;
  if (dto.notes !== undefined) updates.notes = dto.notes;
  return updates;
}