import request from 'supertest';
import app from '../src/app';
import { aiService } from '../src/services/aiService';
import { conversationService } from '../src/services/conversationService';

describe('Hotel Guest Assistant Backend API Tests', () => {
  beforeEach(() => {
    // Ensure standard test configuration
    aiService.setForceMock(true);
    aiService.setSimulateFailure(false);
  });

  // Health Check
  describe('GET /api/health', () => {
    it('returns status ok and service metadata', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.service).toBe('hotel-guest-assistant-backend');
    });
  });

  // Scenario 1: FAQ question answered correctly from knowledge base
  describe('Scenario 1: FAQ Question', () => {
    it('answers check-in and check-out questions accurately from knowledge base', async () => {
      const res = await request(app)
        .post('/api/chat')
        .send({ message: 'What time is check-in?' });

      expect(res.status).toBe(200);
      expect(res.body.intent).toBe('faq');
      expect(res.body.reply).toMatch(/3:00 PM/i);
      expect(res.body.reply).toMatch(/11:00 AM/i);
      expect(res.body.conversationId).toBeDefined();
      expect(Array.isArray(res.body.sources)).toBe(true);
      expect(res.body.sources.length).toBeGreaterThan(0);
      expect(res.body.sources).toContain('hotel.check_in_time');
    });
  });

  // Scenario 2: Amenity question
  describe('Scenario 2: Amenity Question', () => {
    it('answers pool question accurately from knowledge base', async () => {
      const res = await request(app)
        .post('/api/chat')
        .send({ message: 'Does the hotel have a pool?' });

      expect(res.status).toBe(200);
      expect(res.body.intent).toBe('faq');
      expect(res.body.reply).toMatch(/rooftop infinity pool/i);
      expect(res.body.reply).toMatch(/heated/i);
      expect(Array.isArray(res.body.sources)).toBe(true);
      expect(res.body.sources.length).toBeGreaterThan(0);
      expect(res.body.sources).toContain('amenities.pool');
    });
  });

  // Scenario 3: Room suitability question
  describe('Scenario 3: Room Suitability Question', () => {
    it('recommends appropriate rooms for three guests', async () => {
      const res = await request(app)
        .post('/api/chat')
        .send({ message: 'Which room is suitable for three guests?' });

      expect(res.status).toBe(200);
      expect(res.body.intent).toBe('faq');
      expect(res.body.reply).toMatch(/Executive Harbor Suite|Deluxe Double Queen/i);
      expect(Array.isArray(res.body.sources)).toBe(true);
      expect(res.body.sources.length).toBeGreaterThan(0);
    });
  });

  // Scenario 4: Availability request with all required fields present
  describe('Scenario 4: Availability Request with All Fields', () => {
    it('calls deterministic checkAvailability and returns structured results with cards', async () => {
      const res = await request(app)
        .post('/api/chat')
        .send({
          message: 'Do you have rooms available from 2026-10-15 to 2026-10-18 for 2 adults?'
        });

      expect(res.status).toBe(200);
      expect(res.body.intent).toBe('availability');
      expect(res.body.data).toBeDefined();
      expect(res.body.data.checkIn).toBe('2026-10-15');
      expect(res.body.data.checkOut).toBe('2026-10-18');
      expect(res.body.data.adults).toBe(2);
      expect(res.body.data.nights).toBe(3);
      expect(Array.isArray(res.body.data.rooms)).toBe(true);
      expect(res.body.data.rooms.length).toBeGreaterThanOrEqual(4);

      // Verify that room items have required structured fields
      const deluxeKing = res.body.data.rooms.find((r: any) => r.roomTypeId === 'deluxe_king');
      expect(deluxeKing).toBeDefined();
      expect(deluxeKing.totalPrice).toBe(18500 * 3);
    });
  });

  // Scenario 5: Availability request with missing fields
  describe('Scenario 5: Availability Request with Missing Fields', () => {
    it('detects missing fields and asks the user for them instead of guessing', async () => {
      const res = await request(app)
        .post('/api/chat')
        .send({
          message: 'Do you have rooms available from 2026-10-15 to 2026-10-18?'
        });

      expect(res.status).toBe(200);
      expect(res.body.intent).toBe('availability');
      expect(res.body.missingFields).toContain('adults');
      expect(res.body.reply).toMatch(/number of guests|guests/i);
    });

    it('prompts for all fields when the user asks generically about availability', async () => {
      const res = await request(app)
        .post('/api/chat')
        .send({ message: 'I want to check room availability' });

      expect(res.status).toBe(200);
      expect(res.body.intent).toBe('availability');
      expect(res.body.missingFields).toEqual(
        expect.arrayContaining(['checkIn', 'checkOut', 'adults'])
      );
    });
  });

  // Scenario 6: Ambiguous question
  describe('Scenario 6: Ambiguous Question', () => {
    it('returns a sensible clarifying or grounded response for ambiguous questions without hallucination', async () => {
      const res = await request(app)
        .post('/api/chat')
        .send({ message: 'Is it good for kids?' });

      expect(res.status).toBe(200);
      expect(res.body.intent).toBe('faq');
      expect(res.body.reply).toMatch(/family|children|pool|villa/i);
    });
  });

  // Scenario 7: Out-of-scope / unanswerable question
  describe('Scenario 7: Out-of-scope Question', () => {
    it('returns a clear fallback response without hallucinating unknown facts', async () => {
      const res = await request(app)
        .post('/api/chat')
        .send({ message: "What is the weather going to be like tomorrow in Paris?" });

      expect(res.status).toBe(200);
      expect(res.body.intent).toBe('fallback');
      expect(res.body.reply).toMatch(/do not have that information|contact our front desk/i);
      expect(res.body.sources).toEqual([]);
    });
  });

  // Scenario 8: Conversation follow-up with pronoun reference
  describe('Scenario 8: Conversation Follow-Up', () => {
    it('maintains conversational context across follow-up queries', async () => {
      const convId = 'test-conversation-followup-1';

      // Turn 1
      const res1 = await request(app)
        .post('/api/chat')
        .send({
          conversationId: convId,
          message: 'What time is check-in?'
        });
      expect(res1.status).toBe(200);
      expect(res1.body.reply).toMatch(/3:00 PM/i);
      expect(Array.isArray(res1.body.sources)).toBe(true);
      expect(res1.body.sources.length).toBeGreaterThan(0);

      // Turn 2 (pronoun / contextual follow-up)
      const res2 = await request(app)
        .post('/api/chat')
        .send({
          conversationId: convId,
          message: 'And what about breakfast?'
        });

      expect(res2.status).toBe(200);
      expect(res2.body.intent).toBe('faq');
      expect(res2.body.reply).toMatch(/breakfast|7:00 AM|Azure Bay/i);
      expect(Array.isArray(res2.body.sources)).toBe(true);
      expect(res2.body.sources.length).toBeGreaterThan(0);
    });
  });

  // Scenario 9: Simulated LLM/API failure
  describe('Scenario 9: Simulated LLM/API Failure', () => {
    it('returns a graceful structured fallback error without crashing when LLM fails', async () => {
      aiService.setSimulateFailure(true);

      const res = await request(app)
        .post('/api/chat')
        .send({ message: 'Can you help me?' });

      expect(res.status).toBe(200);
      expect(res.body.intent).toBe('fallback');
      expect(res.body.reply).toMatch(/experiencing an issue|front desk/i);
      expect(res.body.conversationId).toBeDefined();

      // Reset
      aiService.setSimulateFailure(false);
    });
  });

  // Scenario 10: End-to-end multi-turn conversation flow
  describe('Scenario 10: End-to-End Conversation Flow', () => {
    it('completes a multi-turn conversation maintaining continuity', async () => {
      const convId = 'e2e-conversation-test-10';

      // Step 1: Inquire about amenities
      const step1 = await request(app)
        .post('/api/chat')
        .send({
          conversationId: convId,
          message: 'Does the hotel have parking?'
        });
      expect(step1.status).toBe(200);
      expect(step1.body.reply).toMatch(/valet parking/i);

      // Step 2: Inquire about room options
      const step2 = await request(app)
        .post('/api/chat')
        .send({
          conversationId: convId,
          message: 'Which room is suitable for three guests?'
        });
      expect(step2.status).toBe(200);
      expect(step2.body.reply).toMatch(/Executive Harbor Suite|Double Queen/i);

      // Step 3: Check availability
      const step3 = await request(app)
        .post('/api/chat')
        .send({
          conversationId: convId,
          message: 'Do you have rooms available from 2026-11-01 to 2026-11-04 for 3 adults?'
        });
      expect(step3.status).toBe(200);
      expect(step3.body.intent).toBe('availability');
      expect(step3.body.data.adults).toBe(3);
      expect(step3.body.data.nights).toBe(3);

      // Verify deluxe king is marked unavailable for 3 adults due to capacity
      const kingRoom = step3.body.data.rooms.find((r: any) => r.roomTypeId === 'deluxe_king');
      expect(kingRoom.available).toBe(false);
      expect(kingRoom.reasonIfNotAvailable).toMatch(/capacity/i);

      // Step 4: Verify conversation history is retained in memory
      const history = conversationService.getHistory(convId);
      expect(history.length).toBe(6); // 3 user + 3 assistant
    });
  });

  // Standalone /api/availability endpoint tests
  describe('POST /api/availability endpoint', () => {
    it('returns available rooms for valid payload', async () => {
      const res = await request(app)
        .post('/api/availability')
        .send({
          checkIn: '2026-10-10',
          checkOut: '2026-10-12',
          adults: 2
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.nights).toBe(2);
      expect(res.body.data.rooms.length).toBeGreaterThan(0);
    });

    it('returns 400 when check-out is before check-in', async () => {
      const res = await request(app)
        .post('/api/availability')
        .send({
          checkIn: '2026-10-12',
          checkOut: '2026-10-10',
          adults: 2
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/after the check-in date/i);
    });

    it('returns 400 when adults is invalid', async () => {
      const res = await request(app)
        .post('/api/availability')
        .send({
          checkIn: '2026-10-10',
          checkOut: '2026-10-12',
          adults: 0
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
