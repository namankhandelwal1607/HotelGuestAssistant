import { knowledgeIndexService, buildChunks } from '../src/services/knowledgeIndexService';
import { hotelRepo } from '../src/data/hotelDataRepository';

describe('KnowledgeIndexService and RAG Chunking Tests', () => {
  const hotelData = hotelRepo.getAll();

  test('buildChunks generates logical units for policies, amenities, rooms, and faqs', () => {
    const chunks = buildChunks(hotelData);
    expect(chunks.length).toBeGreaterThan(15);

    const categories = new Set(chunks.map((c) => c.category));
    expect(categories.has('policy')).toBe(true);
    expect(categories.has('amenity')).toBe(true);
    expect(categories.has('room')).toBe(true);
    expect(categories.has('faq')).toBe(true);

    // Verify all chunks have required shape
    for (const chunk of chunks) {
      expect(chunk.id).toBeDefined();
      expect(chunk.category).toBeDefined();
      expect(typeof chunk.text).toBe('string');
      expect(chunk.text.length).toBeGreaterThan(10);
      expect(chunk.sourceRef).toBeDefined();
    }
  });

  test('Test: "What time is check-in?" retrieves a chunk whose sourceRef corresponds to the check-in/out policy entry', () => {
    const query = 'What time is check-in?';
    const chunks = knowledgeIndexService.getRelevantChunks(query, 4);

    expect(chunks.length).toBeGreaterThan(0);
    const sourceRefs = chunks.map((c) => c.sourceRef);
    expect(sourceRefs).toContain('hotel.check_in_time');
  });

  test('Test: "Does the hotel have a pool?" retrieves the pool amenity chunk', () => {
    const query = 'Does the hotel have a pool?';
    const chunks = knowledgeIndexService.getRelevantChunks(query, 4);

    expect(chunks.length).toBeGreaterThan(0);
    const poolChunk = chunks.find((c) => c.sourceRef === 'amenities.pool');
    expect(poolChunk).toBeDefined();
    expect(poolChunk?.category).toBe('amenity');
    expect(poolChunk?.text).toMatch(/pool/i);
  });

  test('Test: an unrelated query ("What\'s the weather in Paris?") retrieves nothing above the similarity threshold', () => {
    const query = "What's the weather in Paris?";
    const chunks = knowledgeIndexService.getRelevantChunks(query, 4);

    expect(chunks).toEqual([]);
    expect(chunks.length).toBe(0);
  });

  test('Test: getRelevantChunks respects the topK parameter', () => {
    const query = 'What is the check-in and check-out policy and time?';

    const top1 = knowledgeIndexService.getRelevantChunks(query, 1);
    expect(top1.length).toBe(1);

    const top2 = knowledgeIndexService.getRelevantChunks(query, 2);
    expect(top2.length).toBe(2);

    const top4 = knowledgeIndexService.getRelevantChunks(query, 4);
    expect(top4.length).toBe(4);
  });
});
