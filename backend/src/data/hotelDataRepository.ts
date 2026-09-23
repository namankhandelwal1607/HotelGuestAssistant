import path from 'path';
import fs from 'fs';
import { HotelData, HotelInfo, RoomType, Amenity, FAQ } from '../types';

export class HotelDataRepository {
  private static instance: HotelDataRepository;
  private data: HotelData;

  private constructor() {
    this.data = this.loadData();
  }

  public static getInstance(): HotelDataRepository {
    if (!HotelDataRepository.instance) {
      HotelDataRepository.instance = new HotelDataRepository();
    }
    return HotelDataRepository.instance;
  }

  private loadData(): HotelData {
    // Resolve path relative to backend root or source file
    const possiblePaths = [
      path.resolve(__dirname, '../../data/hotel-data.json'),
      path.resolve(__dirname, '../data/hotel-data.json'),
      path.resolve(process.cwd(), 'data/hotel-data.json'),
      path.resolve(process.cwd(), 'backend/data/hotel-data.json')
    ];

    for (const filePath of possiblePaths) {
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(raw) as HotelData;
      }
    }

    throw new Error('Unable to locate hotel-data.json in repository search paths');
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
