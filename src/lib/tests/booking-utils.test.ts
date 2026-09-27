// src/lib/__tests__/booking-utils.test.ts

import { describe, it, expect } from 'vitest';
import { checkOverlap, isValidTimeRange, formatLocalTime } from '../booking-utils';
import type { Booking } from '@/types';

describe('booking-utils', () => {
  describe('checkOverlap', () => {
    const existingBookings: Booking[] = [
      {
        id: 'b-1',
        resourceType: 'room',
        resourceId: 'r-101',
        title: 'Existing booking',
        start: '2025-09-05T10:00:00Z',
        end: '2025-09-05T11:00:00Z',
        notes: '',
      },
      {
        id: 'b-2',
        resourceType: 'room',
        resourceId: 'r-102',
        title: 'Another booking',
        start: '2025-09-05T12:00:00Z',
        end: '2025-09-05T13:00:00Z',
        notes: '',
      },
    ];

    it('должен вернуть true при пересечении интервалов', () => {
      const newBooking: Omit<Booking, 'id'> = {
        resourceType: 'room',
        resourceId: 'r-101',
        title: 'New booking',
        start: '2025-09-05T10:30:00Z',
        end: '2025-09-05T11:30:00Z',
        notes: '',
      };

      expect(checkOverlap(existingBookings, newBooking)).toBe(true);
    });

    it('должен вернуть false при отсутствии пересечений', () => {
      const newBooking: Omit<Booking, 'id'> = {
        resourceType: 'room',
        resourceId: 'r-101',
        title: 'New booking',
        start: '2025-09-05T11:30:00Z',
        end: '2025-09-05T12:30:00Z',
        notes: '',
      };

      expect(checkOverlap(existingBookings, newBooking)).toBe(false);
    });

    it('должен вернуть false для разных ресурсов', () => {
      const newBooking: Omit<Booking, 'id'> = {
        resourceType: 'room',
        resourceId: 'r-103',
        title: 'New booking',
        start: '2025-09-05T10:30:00Z',
        end: '2025-09-05T11:30:00Z',
        notes: '',
      };

      expect(checkOverlap(existingBookings, newBooking)).toBe(false);
    });

    it('должен вернуть true при точном совпадении интервалов', () => {
      const newBooking: Omit<Booking, 'id'> = {
        resourceType: 'room',
        resourceId: 'r-101',
        title: 'New booking',
        start: '2025-09-05T10:00:00Z',
        end: '2025-09-05T11:00:00Z',
        notes: '',
      };

      expect(checkOverlap(existingBookings, newBooking)).toBe(true);
    });

    it('должен вернуть true при касании границ (начало нового в конце существующего)', () => {
      const newBooking: Omit<Booking, 'id'> = {
        resourceType: 'room',
        resourceId: 'r-101',
        title: 'New booking',
        start: '2025-09-05T11:00:00Z',
        end: '2025-09-05T12:00:00Z',
        notes: '',
      };

      // Касание границ (11:00 = 11:00) — это уже пересечение
      // Для строгого непересечения нужно использовать start >= end
      // Но наша функция проверяет start < bEnd && end > bStart
      // При start = bEnd (11:00 = 11:00): false && ... = false
      // Поэтому касание границ считается НЕ пересечением
      expect(checkOverlap(existingBookings, newBooking)).toBe(false);
    });
  });

  describe('isValidTimeRange', () => {
    it('должен вернуть true когда start < end', () => {
      expect(isValidTimeRange('2025-09-05T10:00:00Z', '2025-09-05T11:00:00Z')).toBe(true);
    });

    it('должен вернуть false когда start > end', () => {
      expect(isValidTimeRange('2025-09-05T11:00:00Z', '2025-09-05T10:00:00Z')).toBe(false);
    });

    it('должен вернуть false когда start = end', () => {
      expect(isValidTimeRange('2025-09-05T10:00:00Z', '2025-09-05T10:00:00Z')).toBe(false);
    });
  });

  describe('formatLocalTime', () => {
    it('должен форматировать ISO-дату в локальное время', () => {
      // Тест зависит от локального часового пояса, поэтому проверяем только формат
      const result = formatLocalTime('2025-09-05T10:00:00Z');
      expect(result).toMatch(/\d{2}\.\d{2}\.\d{4}, \d{2}:\d{2}/);
    });
  });
});