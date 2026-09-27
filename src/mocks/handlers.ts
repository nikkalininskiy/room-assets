// src/mocks/handlers.ts

import { http, HttpResponse } from "msw";
import { roomsPayload, assetsPayload, bookingsPayload } from "./data";
import type { RoomDto } from "@/api/roomsApi";
import type { AssetDto } from "@/api/assetsApi";
import type { BookingDto } from "@/api/bookingsApi";

// Вспомогательная функция для генерации ID
function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

// Хранилище данных (в памяти)
let rooms = [...roomsPayload];
let assets = [...assetsPayload];
let bookings = [...bookingsPayload];

export const handlers = [
  // ========== ROOMS ==========
  http.get("/api/rooms", () => {
    return HttpResponse.json({
      items: rooms,
      page: 1,
      total: rooms.length,
    });
  }),

  http.post("/api/rooms", async ({ request }) => {
    const newRoom = (await request.json()) as Omit<RoomDto, "id">;
    const room: RoomDto = {
      ...newRoom,
      id: `r-${generateId()}`,
    };
    rooms.push(room);
    return HttpResponse.json(room, { status: 201 });
  }),

  http.put("/api/rooms/:id", async ({ params, request }) => {
    const { id } = params;
    const updates = (await request.json()) as Partial<RoomDto>;
    const index = rooms.findIndex((r) => r.id === id);
    if (index === -1) {
      return HttpResponse.json({ error: "Room not found" }, { status: 404 });
    }
    rooms[index] = { ...rooms[index], ...updates };
    return HttpResponse.json(rooms[index]);
  }),

  http.delete("/api/rooms/:id", ({ params }) => {
    const { id } = params;
    rooms = rooms.filter((r) => r.id !== id);
    return HttpResponse.json({ success: true });
  }),

  // ========== ASSETS ==========
  http.get("/api/assets", () => {
    return HttpResponse.json({
      items: assets,
      page: 1,
      total: assets.length,
    });
  }),

  http.post("/api/assets", async ({ request }) => {
    const newAsset = (await request.json()) as Omit<AssetDto, "id">;
    const asset: AssetDto = {
      ...newAsset,
      id: `a-${generateId()}`,
    };
    assets.push(asset);
    return HttpResponse.json(asset, { status: 201 });
  }),

  http.put("/api/assets/:id", async ({ params, request }) => {
    const { id } = params;
    const updates = (await request.json()) as Partial<AssetDto>;
    const index = assets.findIndex((a) => a.id === id);
    if (index === -1) {
      return HttpResponse.json({ error: "Asset not found" }, { status: 404 });
    }
    assets[index] = { ...assets[index], ...updates };
    return HttpResponse.json(assets[index]);
  }),

  http.delete("/api/assets/:id", ({ params }) => {
    const { id } = params;
    assets = assets.filter((a) => a.id !== id);
    return HttpResponse.json({ success: true });
  }),

  // ========== BOOKINGS ==========
  http.get("/api/bookings", () => {
    return HttpResponse.json({
      items: bookings,
      page: 1,
      total: bookings.length,
    });
  }),

  http.post("/api/bookings", async ({ request }) => {
    const newBooking = (await request.json()) as Omit<BookingDto, "id">;
    const booking: BookingDto = {
      ...newBooking,
      id: `b-${generateId()}`,
    };
    bookings.push(booking);
    return HttpResponse.json(booking, { status: 201 });
  }),

  http.put("/api/bookings/:id", async ({ params, request }) => {
    const { id } = params;
    const updates = (await request.json()) as Partial<BookingDto>;
    const index = bookings.findIndex((b) => b.id === id);
    if (index === -1) {
      return HttpResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    bookings[index] = { ...bookings[index], ...updates };
    return HttpResponse.json(bookings[index]);
  }),

  http.delete("/api/bookings/:id", ({ params }) => {
    const { id } = params;
    bookings = bookings.filter((b) => b.id !== id);
    return HttpResponse.json({ success: true });
  }),
];