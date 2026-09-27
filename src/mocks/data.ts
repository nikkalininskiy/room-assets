// src/mocks/data.ts

import type { RoomDto } from "@/api/roomsApi";
import type { AssetDto } from "@/api/assetsApi";
import type { BookingDto } from "@/api/bookingsApi";

export const roomsPayload: RoomDto[] = [
  {
    id: "r-101",
    code: "101",
    name: "Аудитория 101",
    capacity: 30,
    equipment: ["projector", "whiteboard"],
    status: "available",
  },
  {
    id: "r-102",
    code: "102",
    name: "Компьютерный класс",
    capacity: 20,
    equipment: ["computers", "projector", "wifi"],
    status: "available",
  },
  {
    id: "r-201",
    code: "201",
    name: "Конференц-зал",
    capacity: 50,
    equipment: ["projector", "microphone", "wifi"],
    status: "booked",
  },
  {
    id: "r-202",
    code: "202",
    name: "Семинарская",
    capacity: 25,
    equipment: ["board", "wifi"],
    status: "maintenance",
  },
];

export const assetsPayload: AssetDto[] = [
  {
    id: "a-proj-1",
    name: "Проектор Epson EB-695Wi",
    inventoryCode: "PRJ-001",
    status: "available",
  },
  {
    id: "a-proj-2",
    name: "Проектор BenQ TH671ST",
    inventoryCode: "PRJ-002",
    status: "in_use",
  },
  {
    id: "a-lap-1",
    name: "Ноутбук Lenovo ThinkPad X1",
    inventoryCode: "LAP-001",
    status: "available",
  },
];

export const bookingsPayload: BookingDto[] = [
  {
    id: "b-1",
    resourceType: "room",
    resourceId: "r-201",
    title: "Семинар по TypeScript",
    start: "2025-09-05T08:00:00Z",
    end: "2025-09-05T09:30:00Z",
    notes: "Нужен HDMI-кабель",
  },
  {
    id: "b-2",
    resourceType: "room",
    resourceId: "r-101",
    title: "Лекция по алгоритмам",
    start: "2025-09-06T10:00:00Z",
    end: "2025-09-06T12:00:00Z",
    notes: "",
  },
  {
    id: "b-3",
    resourceType: "asset",
    resourceId: "a-proj-1",
    title: "Презентация проекта",
    start: "2025-09-07T14:00:00Z",
    end: "2025-09-07T15:30:00Z",
    notes: "Подключить к ноутбуку",
  },
];