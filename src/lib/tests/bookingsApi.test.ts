// src/api/__tests__/bookingsApi.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchBookings, createBooking, checkOverlap } from '../bookingsApi';
import { bookingService } from '@/services';

// Мокаем bookingService
vi.mock('@/services', () => ({
  bookingService: {
    getAll: vi.fn(),
    create: vi.fn(),
  },
}));

describe('bookingsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchBookings', () => {
    it('должен возвращать список броней', async () => {
      const mockBookings = [
        {
          id: 'b-1',
          resourceType: 'room' as const,
          resourceId: 'r-101',
          title: 'Test booking',
          start: '2025-09-05T10:00:00Z',
          end: '2025-09-05T11:00:00Z',
          notes: '',
        },
      ];

      (bookingService.getAll as vi.Mock).mockResolvedValue(mockBookings);

      const result = await fetchBookings();

      expect(result.items).toHaveLength(1);
      expect(result.items[0].title).toBe('Test booking');
      expect(result.total).toBe(1);
    });
  });

  describe('createBooking', () => {
    it('должен создавать бронь', async () => {
      const newBooking = {
        resourceType: 'room' as const,
        resourceId: 'r-101',
        title: 'New booking',
        start: '2025-09-05T10:00:00Z',
        end: '2025-09-05T11:00:00Z',
        notes: '',
      };

      const createdBooking = {
        ...newBooking,
        id: 'b-new',
      };

      (bookingService.create as vi.Mock).mockResolvedValue(createdBooking);

      const result = await createBooking(newBooking);

      expect(result.id).toBe('b-new');
      expect(result.title).toBe('New booking');
    });
  });

  describe('checkOverlap (экспортированная функция)', () => {
    it('должна обнаруживать пересечения', () => {
      const bookings = [
        {
          id: 'b-1',
          resourceType: 'room' as const,
          resourceId: 'r-101',
          title: 'Existing',
          start: '2025-09-05T10:00:00Z',
          end: '2025-09-05T11:00:00Z',
          notes: '',
        },
      ];

      const newBooking = {
        resourceType: 'room' as const,
        resourceId: 'r-101',
        title: 'New',
        start: '2025-09-05T10:30:00Z',
        end: '2025-09-05T11:30:00Z',
        notes: '',
      };

      expect(checkOverlap(bookings, newBooking)).toBe(true);
    });
  });
});