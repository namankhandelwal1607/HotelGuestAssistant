export interface RoomAvailabilityResult {
  roomTypeId: string;
  name: string;
  pricePerNight: number;
  maxOccupancy: number;
  bedConfig: string;
  description: string;
  features: string[];
  available: boolean;
  nights: number;
  totalPrice: number;
  currency: string;
  reasonIfNotAvailable?: string;
}

export interface AvailabilityResultData {
  checkIn: string;
  checkOut: string;
  adults: number;
  nights: number;
  rooms: RoomAvailabilityResult[];
  totalAvailableCount: number;
}

export type AvailabilityField = 'checkIn' | 'checkOut' | 'adults';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  intent?: 'faq' | 'availability' | 'fallback';
  data?: AvailabilityResultData | any;
  missingFields?: AvailabilityField[];
  isError?: boolean;
}

export interface ChatApiResponse {
  reply: string;
  intent: 'faq' | 'availability' | 'fallback';
  data?: AvailabilityResultData;
  conversationId: string;
  missingFields?: AvailabilityField[];
}

export interface AvailabilityQuery {
  checkIn: string;
  checkOut: string;
  adults: number;
}
