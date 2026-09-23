import { HotelData, HotelInfo, RoomType, Amenity, FAQ } from './types';
import rawHotelData from './data/hotel-data.json';

export class HotelDataRepository {
  private static instance: HotelDataRepository;
  private data: HotelData;

  private constructor() {
    this.data = rawHotelData as unknown as HotelData;
  }

  public static getInstance(): HotelDataRepository {
    if (!HotelDataRepository.instance) {
      HotelDataRepository.instance = new HotelDataRepository();
    }
    return HotelDataRepository.instance;
  }

  public getAll(): HotelData {
    return this.data;
  }

  public getHotelInfo(): HotelInfo {
    return this.data.hotel;
  }

  public getAmenities(): Amenity[] {
    return this.data.amenities;
  }

  public getRooms(): RoomType[] {
    return this.data.rooms;
  }

  public getRoomById(id: string): RoomType | undefined {
    return this.data.rooms.find((r) => r.id === id);
  }

  public getFaqs(): FAQ[] {
    return this.data.faqs;
  }
}

export const hotelRepo = HotelDataRepository.getInstance();
