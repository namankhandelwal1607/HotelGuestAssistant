import {
  handleCheckAvailability,
  handleSearchHotelKnowledge,
  handleGetRoomDetails,
  createMcpServer,
  TOOLS
} from '../src/mcp/server';

describe('Model Context Protocol (MCP) Server Tool Tests', () => {
  describe('Tool Definitions', () => {
    test('exposes the 3 required hotel tools with valid schemas', () => {
      const server = createMcpServer();
      expect(server).toBeDefined();

      const toolNames = TOOLS.map((t) => t.name);
      expect(toolNames).toContain('check_availability');
      expect(toolNames).toContain('search_hotel_knowledge');
      expect(toolNames).toContain('get_room_details');

      for (const tool of TOOLS) {
        expect(tool.description).toBeDefined();
        expect((tool.description ?? '').length).toBeGreaterThan(15);
        expect(tool.inputSchema.type).toBe('object');
        expect(tool.inputSchema.properties).toBeDefined();
      }
    });
  });

  describe('Tool: check_availability', () => {
    test('valid input returns structured room availability and pricing', async () => {
      const result = await handleCheckAvailability({
        checkIn: '2026-10-15',
        checkOut: '2026-10-18',
        adults: 2
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].type).toBe('text');

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.checkIn).toBe('2026-10-15');
      expect(parsed.checkOut).toBe('2026-10-18');
      expect(parsed.nights).toBe(3);
      expect(parsed.adults).toBe(2);
      expect(Array.isArray(parsed.rooms)).toBe(true);
      expect(parsed.rooms.length).toBeGreaterThanOrEqual(4);

      const deluxeKing = parsed.rooms.find((r: any) => r.roomTypeId === 'deluxe_king');
      expect(deluxeKing).toBeDefined();
      expect(deluxeKing.totalPrice).toBe(18500 * 3);
    });

    test('invalid date range returns a structured error without throwing', async () => {
      const result = await handleCheckAvailability({
        checkIn: '2026-10-18',
        checkOut: '2026-10-15',
        adults: 2
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toMatch(/check-out date must be strictly after the check-in date/i);
    });

    test('invalid guest count returns a structured error', async () => {
      const result = await handleCheckAvailability({
        checkIn: '2026-10-15',
        checkOut: '2026-10-18',
        adults: 0
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toMatch(/adults must be at least 1/i);
    });
  });

  describe('Tool: search_hotel_knowledge', () => {
    test('returns relevant chunks for a known query', async () => {
      const result = await handleSearchHotelKnowledge({
        query: 'What time is check-in?'
      });

      expect(result.isError).toBe(false);
      const parsed = JSON.parse(result.content[0].text);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed.length).toBeGreaterThan(0);

      const sourceRefs = parsed.map((c: any) => c.sourceRef);
      expect(sourceRefs).toContain('hotel.check_in_time');
    });

    test('returns empty array when query is out of scope', async () => {
      const result = await handleSearchHotelKnowledge({
        query: "What's the weather in Paris?"
      });

      expect(result.isError).toBe(false);
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed).toEqual([]);
    });

    test('handles empty query gracefully with an error', async () => {
      const result = await handleSearchHotelKnowledge({
        query: ''
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toMatch(/query cannot be empty/i);
    });
  });

  describe('Tool: get_room_details', () => {
    test('returns full details for a valid room type ID', async () => {
      const result = await handleGetRoomDetails({
        roomTypeId: 'deluxe_king'
      });

      expect(result.isError).toBe(false);
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.id).toBe('deluxe_king');
      expect(parsed.name).toBe('Deluxe King Room');
      expect(parsed.pricePerNight).toBe(18500);
      expect(parsed.maxOccupancy).toBe(2);
      expect(Array.isArray(parsed.features)).toBe(true);
    });

    test("returns 'not found' gracefully for an unknown room ID", async () => {
      const result = await handleGetRoomDetails({
        roomTypeId: 'presidential_sky_penthouse'
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toMatch(/not found/i);
      expect(result.content[0].text).toMatch(/available room types are/i);
    });
  });
});
