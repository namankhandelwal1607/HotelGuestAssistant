# Hotel Guest Assistant — Backend API Examples

This document provides ready-to-run `curl` commands and response payloads for all backend endpoints.

---

## 1. Health Check Endpoint

### Request
```bash
curl -X GET http://localhost:4000/api/health
```

### Response (HTTP 200)
```json
{
  "status": "ok",
  "timestamp": "2026-09-22T15:10:00.000Z",
  "uptime": 124.5,
  "service": "hotel-guest-assistant-backend",
  "version": "1.0.0"
}
```

---

## 2. Direct Availability Endpoint (`POST /api/availability`)

### 2.1 Happy Path: Standard Availability Check
```bash
curl -X POST http://localhost:4000/api/availability \
  -H "Content-Type: application/json" \
  -d '{
    "checkIn": "2026-10-15",
    "checkOut": "2026-10-18",
    "adults": 2
  }'
```

### Response (HTTP 200)
```json
{
  "success": true,
  "data": {
    "checkIn": "2026-10-15",
    "checkOut": "2026-10-18",
    "adults": 2,
    "nights": 3,
    "rooms": [
      {
        "roomTypeId": "deluxe_king",
        "name": "Deluxe King Room",
        "pricePerNight": 220,
        "maxOccupancy": 2,
        "bedConfig": "1 King Bed",
        "description": "Spacious 380 sq ft room featuring an ultra-comfortable plush King pillow-top bed...",
        "features": ["Balcony", "Garden View", "Walk-in Rain Shower", "Nespresso Machine", "55-inch 4K TV"],
        "available": true,
        "nights": 3,
        "totalPrice": 660,
        "currency": "USD"
      },
      {
        "roomTypeId": "deluxe_double_queen",
        "name": "Deluxe Double Queen Room",
        "pricePerNight": 260,
        "maxOccupancy": 4,
        "bedConfig": "2 Queen Beds",
        "description": "Generous 450 sq ft room designed for families or traveling groups of up to 4 guests...",
        "features": ["2 Queen Beds", "Dual Sink Vanity", "Mini-Fridge", "Work Desk", "55-inch 4K TV"],
        "available": true,
        "nights": 3,
        "totalPrice": 780,
        "currency": "USD"
      },
      {
        "roomTypeId": "executive_harbor_suite",
        "name": "Executive Harbor Suite",
        "pricePerNight": 380,
        "maxOccupancy": 3,
        "bedConfig": "1 King Bed + 1 Queen Pullout Sofa Bed",
        "description": "Luxurious 620 sq ft suite featuring a separate master bedroom...",
        "features": ["Ocean Harbor View", "Separate Living Room", "Soaking Tub", "Complimentary Daily Breakfast"],
        "available": true,
        "nights": 3,
        "totalPrice": 1140,
        "currency": "USD"
      },
      {
        "roomTypeId": "two_bedroom_family_villa",
        "name": "Two-Bedroom Family Villa",
        "pricePerNight": 520,
        "maxOccupancy": 6,
        "bedConfig": "1 King Bed + 2 Twin Beds + 1 Queen Sleeper Sofa",
        "description": "Expansive 950 sq ft multi-room villa ideal for larger families and groups up to 6 guests...",
        "features": ["Kitchenette", "Private Ocean Patio", "2 Full Bathrooms", "Complimentary Daily Breakfast"],
        "available": true,
        "nights": 3,
        "totalPrice": 1560,
        "currency": "USD"
      }
    ],
    "totalAvailableCount": 4
  },
  "timestamp": "2026-09-22T15:10:02.000Z"
}
```

### 2.2 Validation Error: Check-out Before Check-in
```bash
curl -X POST http://localhost:4000/api/availability \
  -H "Content-Type: application/json" \
  -d '{
    "checkIn": "2026-10-18",
    "checkOut": "2026-10-15",
    "adults": 2
  }'
```

### Response (HTTP 400)
```json
{
  "success": false,
  "error": "Check-out date must be strictly after the check-in date.",
  "timestamp": "2026-09-22T15:10:03.000Z"
}
```

---

## 3. Chat Endpoint (`POST /api/chat`)

### 3.1 FAQ Inquiry: Check-in Time
```bash
curl -X POST http://localhost:4000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What time is check-in?"
  }'
```

### Response (HTTP 200)
```json
{
  "reply": "Check-in begins at 3:00 PM, and check-out is by 11:00 AM. Early check-in or late check-out may be arranged based on availability upon request at the front desk.",
  "intent": "faq",
  "conversationId": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
}
```

### 3.2 Amenity Inquiry: Swimming Pool
```bash
curl -X POST http://localhost:4000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Does the hotel have a pool?"
  }'
```

### Response (HTTP 200)
```json
{
  "reply": "Yes, we feature a heated rooftop infinity pool offering panoramic ocean views. The pool is open daily from 6:00 AM to 10:00 PM with complimentary cabanas and towel service.",
  "intent": "faq",
  "conversationId": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
}
```

### 3.3 Room Suitability Inquiry: 3 Guests
```bash
curl -X POST http://localhost:4000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Which room is suitable for three guests?"
  }'
```

### Response (HTTP 200)
```json
{
  "reply": "For three guests, we recommend either the Executive Harbor Suite (1 King bed + 1 Queen pullout sofa bed, plus complimentary breakfast) or the Deluxe Double Queen Room (2 Queen beds, accommodating up to 4 guests comfortably).",
  "intent": "faq",
  "conversationId": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
}
```

### 3.4 Availability Request with All Fields Present
```bash
curl -X POST http://localhost:4000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Do you have rooms available from 2026-10-15 to 2026-10-18 for 2 adults?"
  }'
```

### Response (HTTP 200)
```json
{
  "reply": "I have verified our real-time availability for 2026-10-15 to 2026-10-18 (3 nights) for 2 guests. We have 4 room types available for your stay. Please review the options below:",
  "intent": "availability",
  "data": {
    "checkIn": "2026-10-15",
    "checkOut": "2026-10-18",
    "adults": 2,
    "nights": 3,
    "rooms": [
      {
        "roomTypeId": "deluxe_king",
        "name": "Deluxe King Room",
        "pricePerNight": 220,
        "maxOccupancy": 2,
        "bedConfig": "1 King Bed",
        "description": "Spacious 380 sq ft room featuring an ultra-comfortable plush King pillow-top bed...",
        "features": ["Balcony", "Garden View", "Walk-in Rain Shower", "Nespresso Machine", "55-inch 4K TV"],
        "available": true,
        "nights": 3,
        "totalPrice": 660,
        "currency": "USD"
      }
    ],
    "totalAvailableCount": 4
  },
  "conversationId": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
}
```

### 3.5 Availability Request with Missing Fields (Dates Only, Missing Guests)
```bash
curl -X POST http://localhost:4000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Do you have rooms available from 2026-10-15 to 2026-10-18?"
  }'
```

### Response (HTTP 200)
```json
{
  "reply": "I would be delighted to check room availability for you. To provide exact options and pricing, please share your number of guests.",
  "intent": "availability",
  "missingFields": ["adults"],
  "data": {
    "provided": {
      "checkIn": "2026-10-15",
      "checkOut": "2026-10-18",
      "adults": null
    }
  },
  "conversationId": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
}
```

### 3.6 Out-of-Scope Question (Hallucination Prevention)
```bash
curl -X POST http://localhost:4000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is the weather going to be like tomorrow in Paris?"
  }'
```

### Response (HTTP 200)
```json
{
  "reply": "I apologize, but I do not have information regarding that in our hotel directory. Please feel free to contact our front desk at +1 (831) 555-0199 or email concierge@grandazureresort.com, and our team will gladly assist you.",
  "intent": "fallback",
  "conversationId": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
}
```

### 3.7 Follow-up Turn with Conversation Continuity
```bash
# Turn 1
curl -X POST http://localhost:4000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "session-101",
    "message": "What time is check-in?"
  }'

# Turn 2 (Pronoun / contextual follow-up)
curl -X POST http://localhost:4000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "session-101",
    "message": "And what about breakfast?"
  }'
```

### Response for Turn 2 (HTTP 200)
```json
{
  "reply": "Breakfast buffet is served daily from 7:00 AM to 10:30 AM in the Azure Bay Dining Room. It costs $25 per adult and $15 per child under 12. Complimentary full daily breakfast is included for all guests staying in Executive Harbor Suites and Two-Bedroom Family Villas.",
  "intent": "faq",
  "conversationId": "session-101"
}
```
