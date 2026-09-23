import { hotelRepo } from '../data/hotelDataRepository';
import { AvailabilityQuery, AvailabilityResultData, RoomAvailabilityResult } from '../types';

export class AvailabilityService {
  /**
   * Deterministic mock availability checker.
   * Validates dates and capacity, calculates stay totals, and determines room availability.
   */
  public checkAvailability(query: AvailabilityQuery): AvailabilityResultData {
    const { checkIn, checkOut, adults } = query;

    this.validateQuery(query);

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const diffTime = checkOutDate.getTime() - checkInDate.getTime();
    const nights = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)));

    const allRooms = hotelRepo.getRooms();
    const currency = hotelRepo.getHotelInfo().currency || 'USD';

    const results: RoomAvailabilityResult[] = allRooms.map((room) => {
      // 1. Capacity check
      if (room.maxOccupancy < adults) {
        return {
          roomTypeId: room.id,
          name: room.name,
          pricePerNight: room.pricePerNight,
          maxOccupancy: room.maxOccupancy,
          bedConfig: room.bedConfig,
          description: room.description,
          features: room.features,
          available: false,
          nights,
          totalPrice: room.pricePerNight * nights,
          currency,
          reasonIfNotAvailable: `Exceeds max room capacity (${room.maxOccupancy} guest${room.maxOccupancy > 1 ? 's' : ''} max, requested ${adults})`
        };
      }

      // 2. Deterministic availability rule based on room and dates
      // Certain room types may be booked out on specific test dates (e.g. Christmas / peak dates)
      const isAvailable = this.isRoomAvailableDeterministically(room.id, checkIn, checkOut);

      return {
        roomTypeId: room.id,
        name: room.name,
        pricePerNight: room.pricePerNight,
        maxOccupancy: room.maxOccupancy,
        bedConfig: room.bedConfig,
        description: room.description,
        features: room.features,
        available: isAvailable,
        nights,
        totalPrice: room.pricePerNight * nights,
        currency,
        reasonIfNotAvailable: isAvailable ? undefined : 'Sold out for the selected dates'
      };
    });

    const totalAvailableCount = results.filter((r) => r.available).length;

    return {
      checkIn,
      checkOut,
      adults,
      nights,
      rooms: results,
      totalAvailableCount
    };
  }

  /**
   * Deterministic rule-based availability:
   * Returns consistent results for the same inputs without randomness.
   */
  private isRoomAvailableDeterministically(roomId: string, checkIn: string, checkOut: string): boolean {
    // Specific booked-out test simulation (e.g., peak blackout dates)
    if (checkIn.includes('2026-12-31') && roomId === 'executive_harbor_suite') {
      return false;
    }

    // Deterministic hash based on date and roomId characters
    let hash = 0;
    const key = `${roomId}-${checkIn}-${checkOut}`;
    for (let i = 0; i < key.length; i++) {
      hash = (hash << 5) - hash + key.charCodeAt(i);
      hash |= 0;
    }

    // Keep ~80% of eligible rooms available deterministically
    return Math.abs(hash) % 5 !== 0;
  }

  private validateQuery(query: AvailabilityQuery): void {
    const { checkIn, checkOut, adults } = query;

    if (!checkIn || typeof checkIn !== 'string') {
      throw new Error('Check-in date is required and must be in YYYY-MM-DD format.');
    }
    if (!checkOut || typeof checkOut !== 'string') {
      throw new Error('Check-out date is required and must be in YYYY-MM-DD format.');
    }

    const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!isoDateRegex.test(checkIn) || isNaN(Date.parse(checkIn))) {
      throw new Error('Invalid check-in date format. Please use YYYY-MM-DD.');
    }
    if (!isoDateRegex.test(checkOut) || isNaN(Date.parse(checkOut))) {
      throw new Error('Invalid check-out date format. Please use YYYY-MM-DD.');
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkOutDate <= checkInDate) {
      throw new Error('Check-out date must be strictly after the check-in date.');
    }

    if (!adults || typeof adults !== 'number' || adults < 1 || !Number.isInteger(adults)) {
      throw new Error('Number of adults must be a positive integer greater than or equal to 1.');
    }

    if (adults > 10) {
      throw new Error('For group bookings exceeding 10 guests, please contact our hotel group sales department.');
    }
  }
}

export const availabilityService = new AvailabilityService();
