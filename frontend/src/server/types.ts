export interface HotelInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  check_in_time: string;
  check_out_time: string;
  cancellation_policy: string;
  breakfast_policy: string;
  currency: string;
}

export interface Amenity {
  id: string;
  name: string;
  description: string;
}

export interface RoomType {
  id: string;
  name: string;
  maxOccupancy: number;
  bedConfig: string;
  pricePerNight: number;
  description: string;
  features: string[];
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface HotelData {
  hotel: HotelInfo;
  amenities: Amenity[];
  rooms: RoomType[];
  faqs: FAQ[];
  qa_responses?: Record<string, string>;
}

export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  role: MessageRole;
  content: string;
  timestamp?: string;
}

export type ChatIntent = 'faq' | 'availability' | 'fallback';

export interface AvailabilityQuery {
  checkIn: string;
  checkOut: string;
  adults: number;
}

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

export interface ChatRequest {
  message: string;
  conversationId?: string;
  history?: ChatMessage[];
}

export type AvailabilityField = 'checkIn' | 'checkOut' | 'adults';

export interface ChatResponse {
  reply: string;
  intent: ChatIntent;
  data?: AvailabilityResultData | Record<string, unknown>;
  conversationId: string;
  missingFields?: AvailabilityField[];
}
