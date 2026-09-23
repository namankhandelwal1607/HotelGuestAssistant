# Manual QA & Evaluation Log — Hotel Guest Assistant

This evaluation log documents the manual and automated QA verification of **The Grand Azure Resort & Spa** guest assistant across 12 realistic guest scenarios, recording actual inputs, actual observed outputs, intent classification, and verification results.

---

## Evaluation Matrix Summary

| # | Test Scenario | Category | Expected Intent | Actual Status | Result |
|---|:---|:---|:---:|:---:|:---:|
| 1 | "What time is check-in?" | FAQ Policy | `faq` | 200 OK | **PASS** |
| 2 | "Does the hotel have a pool?" | Amenity | `faq` | 200 OK | **PASS** |
| 3 | "Which room is suitable for three guests?" | Room Suitability | `faq` | 200 OK | **PASS** |
| 4 | "Do you have rooms available from 2026-10-15 to 2026-10-18 for 2 adults?" | Tool Calling (Complete) | `availability` | 200 OK | **PASS** |
| 5 | "Do you have rooms available from 2026-10-15 to 2026-10-18?" | Missing Fields (Guests) | `availability` | 200 OK | **PASS** |
| 6 | "I want to check room availability" | Missing Fields (All) | `availability` | 200 OK | **PASS** |
| 7 | "Is it good for kids?" | Ambiguous Question | `faq` | 200 OK | **PASS** |
| 8 | "What is the weather going to be like tomorrow in Paris?" | Out of Scope / Unanswerable | `fallback` | 200 OK | **PASS** |
| 9 | "And what about breakfast?" (Follow-up) | Context Continuity | `faq` | 200 OK | **PASS** |
| 10 | Simulated upstream API failure | Error Resilience | `fallback` | 200 OK | **PASS** |
| 11 | Multi-turn continuous conversation (3 turns) | End-to-End Flow | Mixed | 200 OK | **PASS** |
| 12 | Direct availability check-out before check-in | Edge Validation | N/A | 400 Bad Request | **PASS** |

---

## Detailed Scenario Logs

### Scenario 1: Normal FAQ Question (Check-in / Check-out)
- **Input Message**: `"What time is check-in?"`
- **Observed Response**:
  ```json
  {
    "intent": "faq",
    "reply": "Check-in begins at 3:00 PM, and check-out is by 11:00 AM. Early check-in or late check-out may be arranged based on availability upon request at the front desk.",
    "conversationId": "320e8b2b-f844-46ee-876b-8cf788899806"
  }
  ```
- **Evaluation Notes**: Verified check-in time (3:00 PM) and check-out time (11:00 AM) matched `hotel-data.json` exactly. No hallucinations. **Result: PASS**.

---

### Scenario 2: Amenity Inquiry (Swimming Pool)
- **Input Message**: `"Does the hotel have a pool?"`
- **Observed Response**:
  ```json
  {
    "intent": "faq",
    "reply": "Heated rooftop infinity pool with panoramic ocean views, open daily from 6:00 AM to 10:00 PM. Complimentary private cabanas and towel service are available.",
    "conversationId": "65b530c1-5ea3-4cfd-91b4-2dfb94157cb1"
  }
  ```
- **Evaluation Notes**: Verified amenity details, operating hours, and luxury features accurately reflected the property data. **Result: PASS**.

---

### Scenario 3: Room Suitability Question (3 Guests)
- **Input Message**: `"Which room is suitable for three guests?"`
- **Observed Response**:
  ```json
  {
    "intent": "faq",
    "reply": "For three guests, we recommend either the Executive Harbor Suite (1 King bed + 1 Queen pullout sofa bed, plus complimentary breakfast) or the Deluxe Double Queen Room (2 Queen beds, accommodating up to 4 guests comfortably).",
    "conversationId": "34c11467-3ee8-406c-850f-2e98faefc801"
  }
  ```
- **Evaluation Notes**: Successfully recommended rooms capable of holding 3 guests while omitting 2-guest single King room. **Result: PASS**.

---

### Scenario 4: Availability Request with All Required Fields
- **Input Message**: `"Do you have rooms available from 2026-10-15 to 2026-10-18 for 2 adults?"`
- **Observed Response**:
  ```json
  {
    "intent": "availability",
    "reply": "I have verified our real-time availability for 2026-10-15 to 2026-10-18 (3 nights) for 2 guests. We have 4 room types available for your stay. Please review the options below:",
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
          "available": true,
          "nights": 3,
          "totalPrice": 660
        },
        {
          "roomTypeId": "deluxe_double_queen",
          "name": "Deluxe Double Queen Room",
          "pricePerNight": 260,
          "available": true,
          "nights": 3,
          "totalPrice": 780
        },
        {
          "roomTypeId": "executive_harbor_suite",
          "name": "Executive Harbor Suite",
          "pricePerNight": 380,
          "available": true,
          "nights": 3,
          "totalPrice": 1140
        },
        {
          "roomTypeId": "two_bedroom_family_villa",
          "name": "Two-Bedroom Family Villa",
          "pricePerNight": 520,
          "available": true,
          "nights": 3,
          "totalPrice": 1560
        }
      ],
      "totalAvailableCount": 4
    }
  }
  ```
- **Evaluation Notes**: Successfully invoked deterministic `checkAvailability` tool. Extracted `checkIn`, `checkOut`, and `adults`. Computed 3 nights and accurate total pricing. UI rendered rich cards. **Result: PASS**.

---

### Scenario 5: Availability Request with Missing Information (Dates Given, Missing Guests)
- **Input Message**: `"Do you have rooms available from 2026-10-15 to 2026-10-18?"`
- **Observed Response**:
  ```json
  {
    "intent": "availability",
    "reply": "I would be delighted to check room availability for you. To provide exact options and pricing, please share your number of guests.",
    "missingFields": ["adults"],
    "data": {
      "provided": {
        "checkIn": "2026-10-15",
        "checkOut": "2026-10-18",
        "adults": null
      }
    }
  }
  ```
- **Evaluation Notes**: Correctly flagged missing `adults` field rather than hallucinating or assuming a default. Inline stay picker prefilled with the provided dates. **Result: PASS**.

---

### Scenario 6: Generic Availability Request (Missing All Fields)
- **Input Message**: `"I want to check room availability"`
- **Observed Response**:
  ```json
  {
    "intent": "availability",
    "reply": "I would be delighted to check room availability for you. To provide exact options and pricing, please share your check-in date, check-out date, number of guests.",
    "missingFields": ["checkIn", "checkOut", "adults"]
  }
  ```
- **Evaluation Notes**: Returns structured `missingFields` array triggering the inline date and guest picker form on the frontend. **Result: PASS**.

---

### Scenario 7: Ambiguous Question ("Is it good for kids?")
- **Input Message**: `"Is it good for kids?"`
- **Observed Response**:
  ```json
  {
    "intent": "faq",
    "reply": "The Grand Azure Resort welcomes families! We offer multi-room Two-Bedroom Family Villas with kitchenettes, a heated rooftop pool open until 10:00 PM, and child breakfast rates ($15 under age 12). Please let us know if you need cribs or high chairs, or if you have specific family amenities in mind."
  }
  ```
- **Evaluation Notes**: Grounded response drawing from hotel child breakfast rates, family villas, and pool policies. Did not invent kids clubs or childcare services not present in the data. **Result: PASS**.

---

### Scenario 8: Out-of-Scope / Unsupported Question (Hallucination Prevention)
- **Input Message**: `"What is the weather going to be like tomorrow in Paris?"`
- **Observed Response**:
  ```json
  {
    "intent": "fallback",
    "reply": "I apologize, but I do not have information regarding that in our hotel directory. Please feel free to contact our front desk at +1 (831) 555-0199 or email concierge@grandazureresort.com, and our team will gladly assist you."
  }
  ```
- **Evaluation Notes**: Cleanly refused out-of-scope query, provided front desk fallback, and marked `intent: 'fallback'`. **Result: PASS**.

---

### Scenario 9: Conversation Follow-Up with Pronoun Reference
- **Turn 1 Input**: `"What time is check-in?"`
- **Turn 1 Output**: `"Check-in begins at 3:00 PM..."`
- **Turn 2 Input**: `"And what about breakfast?"` (Same `conversationId`)
- **Turn 2 Output**:
  ```json
  {
    "intent": "faq",
    "reply": "Breakfast buffet is served daily from 7:00 AM to 10:30 AM in the Azure Bay Dining Room. It costs $25 per adult and $15 per child under 12. Complimentary full daily breakfast is included for all guests staying in Executive Harbor Suites and Two-Bedroom Family Villas."
  }
  ```
- **Evaluation Notes**: Maintained conversational context across turns via `conversationId`. Successfully resolved contextual follow-up. **Result: PASS**.

---

### Scenario 10: Simulated Upstream LLM / API Failure
- **Test Condition**: Model client configured to simulate upstream failure/timeout.
- **Input Message**: `"Can you help me?"`
- **Observed Response**:
  ```json
  {
    "intent": "fallback",
    "reply": "We are temporarily experiencing an issue with our virtual concierge service. Please contact our front desk directly at +1 (831) 555-0199 or email concierge@grandazureresort.com for immediate assistance."
  }
  ```
- **Evaluation Notes**: Backend caught error without crashing, returned HTTP 200 with structured fallback response, and logged warning with timestamp. Frontend displayed retry button. **Result: PASS**.

---

### Scenario 11: End-to-End Multi-Turn Flow
- **Turn 1**: Checked parking availability -> answered valet parking ($35/night) & EV charging.
- **Turn 2**: Asked room suitability for 3 guests -> recommended Executive Harbor Suite or Double Queen.
- **Turn 3**: Checked dates `2026-11-01` to `2026-11-04` for 3 adults -> returned available rooms; correctly marked Deluxe King as unavailable with reason `"Exceeds max room capacity (2 guests max, requested 3)"`.
- **Evaluation Notes**: Seamless multi-turn session with memory persistence. **Result: PASS**.

---

### Scenario 12: Direct API Validation Boundary
- **Endpoint**: `POST /api/availability`
- **Payload**: `{ "checkIn": "2026-10-18", "checkOut": "2026-10-15", "adults": 2 }`
- **Observed Response (HTTP 400)**:
  ```json
  {
    "success": false,
    "error": "Check-out date must be strictly after the check-in date."
  }
  ```
- **Evaluation Notes**: Edge validation caught inverted date interval and returned structured HTTP 400 error. **Result: PASS**.
