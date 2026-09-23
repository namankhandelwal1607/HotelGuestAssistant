import Groq from 'groq-sdk';
import { hotelRepo } from '../data/hotelDataRepository';
import { availabilityService } from './availabilityService';
import { conversationService } from './conversationService';
import { knowledgeIndexService, KnowledgeChunk } from './knowledgeIndexService';
import {
  ChatIntent,
  ChatMessage,
  ChatResponse,
  AvailabilityField,
  AvailabilityResultData
} from '../types';
import { Logger } from '../utils/logger';

export class AIService {
  private groqClient: Groq | null = null;
  private modelName: string;
  private forceMockForTesting: boolean = false;
  private simulateFailureForTesting: boolean = false;

  constructor() {
    this.modelName = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
    this.initClient();
  }

  private initClient(): void {
    if (!process.env.GROQ_API_KEY) {
      try {
        const path = require('path');
        const dotenv = require('dotenv');
        dotenv.config({ path: path.resolve(__dirname, '../../.env') });
        dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env') });
        dotenv.config();
      } catch {
        // ignore
      }
    }
    this.modelName = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
    const apiKey = process.env.GROQ_API_KEY;
    if (apiKey && apiKey.trim() && !apiKey.includes('your_groq_api_key_here')) {
      try {
        this.groqClient = new Groq({ apiKey: apiKey.trim() });
        Logger.info('Groq AI client initialized with model: ' + this.modelName);
      } catch (err) {
        Logger.error('Failed to initialize Groq client, will use grounded mock fallback', err);
        this.groqClient = null;
      }
    } else {
      Logger.info('GROQ_API_KEY not provided. Running in deterministic grounded mode.');
      this.groqClient = null;
    }
  }

  public setForceMock(mock: boolean): void {
    this.forceMockForTesting = mock;
  }

  public setSimulateFailure(fail: boolean): void {
    this.simulateFailureForTesting = fail;
  }

  /**
   * Main chat processing pipeline
   */
  public async processMessage(
    userMessage: string,
    conversationId?: string,
    clientHistory?: ChatMessage[]
  ): Promise<ChatResponse> {
    const activeConvId = conversationService.getOrCreateId(conversationId);

    // If client supplied recent history and server doesn't have it yet, seed it
    if (clientHistory && clientHistory.length > 0 && conversationService.getHistory(activeConvId).length === 0) {
      conversationService.setHistory(activeConvId, clientHistory);
    }

    // Append current user message to conversation memory
    conversationService.addMessage(activeConvId, {
      role: 'user',
      content: userMessage
    });

    const fullHistory = conversationService.getHistory(activeConvId);

    // Check for simulated failure testing scenario
    if (this.simulateFailureForTesting) {
      Logger.warn('Simulating upstream AI API failure as requested by test configuration');
      return {
        reply: 'We are temporarily experiencing an issue with our virtual concierge service. Please contact our front desk directly at +1 (831) 555-0199 or email concierge@grandazureresort.com for immediate assistance.',
        intent: 'fallback',
        conversationId: activeConvId,
        sources: []
      };
    }

    // Route to live Groq API if available and not forced to mock
    if (this.groqClient && !this.forceMockForTesting && process.env.NODE_ENV !== 'test') {
      try {
        const response = await this.callGroqWithTools(userMessage, fullHistory, activeConvId);
        conversationService.addMessage(activeConvId, {
          role: 'assistant',
          content: response.reply
        });
        return response;
      } catch (error) {
        Logger.error('Error during Groq API call, gracefully falling back', error);
        // Fallback gracefully without crashing
        const fallbackResponse: ChatResponse = {
          reply: 'I apologize for the delay. I am having a brief connection issue with our service. Please feel free to ask your question again, or contact our front desk at +1 (831) 555-0199 for immediate help.',
          intent: 'fallback',
          conversationId: activeConvId,
          sources: []
        };
        conversationService.addMessage(activeConvId, {
          role: 'assistant',
          content: fallbackResponse.reply
        });
        return fallbackResponse;
      }
    }

    // Deterministic Grounded Engine (used in tests and offline environments)
    const deterministicResponse = this.processDeterministically(userMessage, fullHistory, activeConvId);
    conversationService.addMessage(activeConvId, {
      role: 'assistant',
      content: deterministicResponse.reply
    });
    return deterministicResponse;
  }

  /**
   * Calls Groq chat completions with RAG-retrieved chunks and native tool calling
   */
  private async callGroqWithTools(
    userMessage: string,
    history: ChatMessage[],
    conversationId: string
  ): Promise<ChatResponse> {
    if (!this.groqClient) {
      throw new Error('Groq client is not initialized');
    }

    const hotelData = hotelRepo.getAll();
    const retrievedChunks = knowledgeIndexService.getRelevantChunks(userMessage, 4);
    const sources = retrievedChunks.map((c) => c.sourceRef);

    // If retrieval returns zero chunks above similarity threshold and query is not availability-focused,
    // skip LLM call entirely and return fallback response as a hard groundedness gate.
    const lowerMsg = userMessage.toLowerCase();
    const isAvailabilityIntent =
      lowerMsg.includes('room') ||
      lowerMsg.includes('avail') ||
      lowerMsg.includes('book') ||
      lowerMsg.includes('stay') ||
      lowerMsg.includes('night') ||
      /\d{4}-\d{2}-\d{2}/.test(lowerMsg);

    if (retrievedChunks.length === 0 && !isAvailabilityIntent) {
      Logger.info(`[RAG Retrieval] Zero chunks above similarity threshold for: "${userMessage}". Skipping LLM.`);
      return {
        reply:
          hotelData.qa_responses?.['default'] ||
          "I do not have that information in our directory, but I'd be happy to assist you with that. Please allow me a moment to connect you with the right information, or feel free to contact our front desk at +1 (831) 555-0199.",
        intent: 'fallback',
        conversationId,
        sources: []
      };
    }

    const systemPrompt = this.buildSystemPrompt(hotelData.hotel.name, retrievedChunks);

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...history.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
      }))
    ];

    const tools: Groq.Chat.Completions.ChatCompletionTool[] = [
      {
        type: 'function',
        function: {
          name: 'checkAvailability',
          description: 'Check real-time room availability and pricing for specific check-in date, check-out date, and number of adult guests at The Grand Azure Resort.',
          parameters: {
            type: 'object',
            properties: {
              checkIn: {
                type: 'string',
                description: 'Check-in date formatted as YYYY-MM-DD (e.g., 2026-10-15)'
              },
              checkOut: {
                type: 'string',
                description: 'Check-out date formatted as YYYY-MM-DD (e.g., 2026-10-18)'
              },
              adults: {
                type: 'integer',
                description: 'Number of adult guests staying in the room'
              }
            },
            required: ['checkIn', 'checkOut', 'adults']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'requestMissingAvailabilityFields',
          description: 'Call this function when the guest expresses an intent to check room availability or book a stay, but has not provided all 3 required parameters (checkIn, checkOut, adults).',
          parameters: {
            type: 'object',
            properties: {
              missingFields: {
                type: 'array',
                items: {
                  type: 'string',
                  enum: ['checkIn', 'checkOut', 'adults']
                },
                description: 'Array of parameter names that are missing'
              },
              providedFields: {
                type: 'object',
                properties: {
                  checkIn: { type: 'string' },
                  checkOut: { type: 'string' },
                  adults: { type: 'integer' }
                },
                description: 'Any parameters the user has already provided'
              },
              clarifyingPrompt: {
                type: 'string',
                description: 'Polite concierge message asking the guest for the missing parameters'
              }
            },
            required: ['missingFields', 'clarifyingPrompt']
          }
        }
      }
    ];

    const completion = await this.groqClient.chat.completions.create({
      model: this.modelName,
      messages,
      tools,
      tool_choice: 'auto',
      temperature: 0.1,
      max_tokens: 600
    });

    const choice = completion.choices[0];
    const message = choice.message;

    // Check if the model triggered a tool call
    if (message.tool_calls && message.tool_calls.length > 0) {
      const toolCall = message.tool_calls[0];
      const fnName = toolCall.function.name;
      const fnArgs = JSON.parse(toolCall.function.arguments || '{}');

      if (fnName === 'checkAvailability') {
        const { checkIn, checkOut, adults } = fnArgs;
        try {
          const availData = availabilityService.checkAvailability({
            checkIn: String(checkIn),
            checkOut: String(checkOut),
            adults: Number(adults)
          });

          const availableRooms = availData.rooms.filter((r) => r.available);
          const replyText =
            availableRooms.length > 0
              ? `I have checked our inventory for ${checkIn} to ${checkOut} (${availData.nights} night${availData.nights > 1 ? 's' : ''}) for ${adults} guest${adults > 1 ? 's' : ''}. We have ${availableRooms.length} room type${availableRooms.length > 1 ? 's' : ''} available for your stay. You can view the details and rates below:`
              : `I checked our inventory for ${checkIn} to ${checkOut} for ${adults} guest${adults > 1 ? 's' : ''}, but unfortunately no rooms are available for those exact dates or party size. Please consider alternate dates or contact our front desk at +1 (831) 555-0199 for customized assistance.`;

          return {
            reply: replyText,
            intent: 'availability',
            data: availData,
            conversationId
          };
        } catch (err: any) {
          return {
            reply: `I encountered an issue checking those dates: ${err.message}. Please check your dates and try again.`,
            intent: 'availability',
            conversationId,
            missingFields: ['checkIn', 'checkOut', 'adults']
          };
        }
      } else if (fnName === 'requestMissingAvailabilityFields') {
        const missing = (fnArgs.missingFields || ['checkIn', 'checkOut', 'adults']) as AvailabilityField[];
        const prompt = fnArgs.clarifyingPrompt || "I would be happy to check availability for you! Could you please provide your check-in date, check-out date, and the number of guests?";
        return {
          reply: prompt,
          intent: 'availability',
          missingFields: missing,
          data: fnArgs.providedFields ? { providedFields: fnArgs.providedFields } : undefined,
          conversationId
        };
      }
    }

    // Normal text answer from Groq
    const reply = message.content || "I am at your service. How may I assist you with your stay at The Grand Azure Resort today?";
    const isFallback =
      reply.toLowerCase().includes("don't have that information") ||
      reply.toLowerCase().includes('do not have that information') ||
      reply.toLowerCase().includes('outside of my knowledge') ||
      reply.toLowerCase().includes('not present in our directory');

    return {
      reply,
      intent: isFallback ? 'fallback' : 'faq',
      conversationId,
      sources: isFallback ? [] : sources
    };
  }

  /**
   * Deterministic grounded processor:
   * Provides predictable, fast, 100% testable responses strictly from hotel-data.json with RAG retrieval.
   */
  public processDeterministically(
    message: string,
    history: ChatMessage[],
    conversationId: string
  ): ChatResponse {
    const response = this.computeDeterministicResponse(message, history, conversationId);
    if (response.intent === 'faq' && !response.sources) {
      const retrievedChunks = knowledgeIndexService.getRelevantChunks(message, 4);
      response.sources = retrievedChunks.map((c) => c.sourceRef);
    } else if (response.intent === 'fallback' && !response.sources) {
      response.sources = [];
    }
    return response;
  }

  private computeDeterministicResponse(
    message: string,
    history: ChatMessage[],
    conversationId: string
  ): ChatResponse {
    const lower = message.toLowerCase().trim();
    const hotelData = hotelRepo.getAll();
    const retrievedChunks = knowledgeIndexService.getRelevantChunks(message, 4);
    const sources = retrievedChunks.map((c) => c.sourceRef);

    // 0. Greetings Check
    if (lower === 'hello' || lower === 'hi' || lower === 'hey' || lower.startsWith('hello ') || lower.startsWith('hi ') || lower.startsWith('hey ')) {
      return {
        reply: hotelData.qa_responses?.['hello'] || "Good evening. Welcome to Grand Aurel. I'm here to make your stay effortless — how may I assist you tonight?",
        intent: 'faq',
        conversationId,
        sources
      };
    }

    // 1. Availability Request Detection
    const hasAvailabilityKeywords =
      lower.includes('available') ||
      lower.includes('availability') ||
      lower.includes('book a room') ||
      lower.includes('reserve a room') ||
      lower.includes('stay from') ||
      lower.includes('rates for');

    // Date extraction pattern: YYYY-MM-DD
    const dateMatches = message.match(/\b\d{4}-\d{2}-\d{2}\b/g) || [];
    // Guest count extraction
    const guestMatch = message.match(/(\d+)\s*(guest|adult|people|person)/i);
    const guestCount = guestMatch ? parseInt(guestMatch[1], 10) : undefined;

    if (hasAvailabilityKeywords || (dateMatches.length > 0 && (lower.includes('room') || lower.includes('night')))) {
      const checkIn = dateMatches[0];
      const checkOut = dateMatches[1];

      // If all 3 fields are present -> execute deterministic checkAvailability
      if (checkIn && checkOut && guestCount) {
        try {
          const availData = availabilityService.checkAvailability({
            checkIn,
            checkOut,
            adults: guestCount
          });

          const availableRooms = availData.rooms.filter((r) => r.available);
          const replyText =
            availableRooms.length > 0
              ? `I have verified our real-time availability for ${checkIn} to ${checkOut} (${availData.nights} night${availData.nights > 1 ? 's' : ''}) for ${guestCount} guest${guestCount > 1 ? 's' : ''}. We have ${availableRooms.length} room type${availableRooms.length > 1 ? 's' : ''} available for your stay. Please review the options below:`
              : `I checked our inventory for ${checkIn} to ${checkOut} for ${guestCount} guest${guestCount > 1 ? 's' : ''}, but currently no rooms match those dates or capacity. Please adjust your dates or contact our front desk.`;

          return {
            reply: replyText,
            intent: 'availability',
            data: availData,
            conversationId
          };
        } catch (err: any) {
          return {
            reply: `I was unable to check availability: ${err.message}`,
            intent: 'availability',
            conversationId
          };
        }
      }

      // Missing fields: determine what's missing
      const missingFields: AvailabilityField[] = [];
      if (!checkIn) missingFields.push('checkIn');
      if (!checkOut) missingFields.push('checkOut');
      if (!guestCount) missingFields.push('adults');

      const missingText: string[] = [];
      if (!checkIn) missingText.push('check-in date');
      if (!checkOut) missingText.push('check-out date');
      if (!guestCount) missingText.push('number of guests');

      return {
        reply: `I would be delighted to check room availability for you. To provide exact options and pricing, please share your ${missingText.join(', ')}.`,
        intent: 'availability',
        missingFields,
        data: {
          provided: {
            checkIn: checkIn || null,
            checkOut: checkOut || null,
            adults: guestCount || null
          }
        },
        conversationId
      };
    }

    // Zero-chunks Groundedness Gate: If no chunks met similarity threshold and query is not availability-focused,
    // immediately return fallback response rather than guessing.
    if (retrievedChunks.length === 0 && !hasAvailabilityKeywords && dateMatches.length === 0) {
      return {
        reply:
          hotelData.qa_responses?.['default'] ||
          "I do not have that information in our directory, but I'd be happy to assist you with that. Please allow me a moment to connect you with the right information, or feel free to contact our front desk or call our concierge desk directly at ext. 0.",
        intent: 'fallback',
        conversationId,
        sources: []
      };
    }

    // 2. Context Follow-up resolution (pronoun or continuation like "and what about breakfast?" or "what about the pool?")
    const isFollowup =
      lower.startsWith('and ') ||
      lower.startsWith('what about ') ||
      lower.startsWith('how about ') ||
      lower.includes('also');

    if (isFollowup) {
      if (lower.includes('breakfast')) {
        return {
          reply: hotelData.hotel.breakfast_policy,
          intent: 'faq',
          conversationId
        };
      }
      if (lower.includes('pool') || lower.includes('swim')) {
        const pool = hotelData.amenities.find((a) => a.id === 'pool');
        return {
          reply: pool ? pool.description : 'We feature a heated rooftop infinity pool open daily from 6:00 AM to 10:00 PM.',
          intent: 'faq',
          conversationId
        };
      }
      if (lower.includes('parking') || lower.includes('car')) {
        const parking = hotelData.amenities.find((a) => a.id === 'parking');
        return {
          reply: parking ? parking.description : 'Valet parking is available for $35 per overnight stay with complimentary EV charging.',
          intent: 'faq',
          conversationId
        };
      }
    }

    // 3. Specific FAQ / Knowledge Base Matching
    // Room service / In-room dining
    if (lower.includes('room service') || lower.includes('in-room dining') || lower.includes('in room dining')) {
      return {
        reply: hotelData.qa_responses?.['room service'] || "Our in-room dining is available 24 hours. Breakfast is served 6–11 AM, lunch 12–3 PM, and dinner from 6 PM through midnight. After midnight, our late-night menu features light fare and classic cocktails. Shall I send the full menu to your room's tablet?",
        intent: 'faq',
        conversationId
      };
    }

    // Spa / Spa appointments
    if (lower.includes('spa') || lower.includes('hammam') || lower.includes('massage') || lower.includes('facial')) {
      return {
        reply: hotelData.qa_responses?.['spa'] || "The Aurel Spa is open daily from 8 AM to 9 PM. We offer signature treatments including the Grand Hammam ritual (90 min, $280), deep tissue massage (60 min, $195), and our bespoke facial with locally sourced botanicals (75 min, $240). Shall I check availability for you?",
        intent: 'faq',
        conversationId
      };
    }

    // Local dining / Restaurants
    if ((lower.includes('dining') || lower.includes('restaurant') || lower.includes('maison bleu') || lower.includes('café de flore') || lower.includes('local dining')) && !lower.includes('room service')) {
      return {
        reply: hotelData.qa_responses?.['dining'] || "We recommend Maison Bleu on Rue Saint-Honoré — a 10-minute walk, Michelin-starred, stunning seasonal tasting menu. For something more relaxed, Café de Flore is nearby. I can make a reservation on your behalf — just let me know the time and party size.",
        intent: 'faq',
        conversationId
      };
    }

    // Airport / Airport transfers / Chauffeur
    if (lower.includes('airport') || lower.includes('transfer') || lower.includes('chauffeur') || lower.includes('charles de gaulle') || lower.includes('orly')) {
      return {
        reply: hotelData.qa_responses?.['airport'] || "We partner with Prestige Chauffeur for all transfers. A private sedan to Charles de Gaulle is €140 (45–60 min), and to Orly €115 (35–50 min). I can arrange pick-up for any time — please share your departure details.",
        intent: 'faq',
        conversationId
      };
    }

    // Concierge / Concierge services
    if (lower.includes('concierge') && !lower.includes('desk directly')) {
      return {
        reply: hotelData.qa_responses?.['concierge'] || "Our concierge team can arrange theatre tickets, private museum tours, curated shopping guides, florists, and last-minute reservations at the city's most sought-after restaurants. What can we arrange for you?",
        intent: 'faq',
        conversationId
      };
    }

    // Check-in / check-out time
    if (lower.includes('check-in') || lower.includes('check in') || lower.includes('check out') || lower.includes('checkout') || lower.includes('check-out')) {
      if (
        lower.includes('late check-out') ||
        lower.includes('late checkout') ||
        ((lower.includes('check out') || lower.includes('check-out') || lower.includes('checkout')) && !lower.includes('check in') && !lower.includes('check-in'))
      ) {
        return {
          reply: hotelData.qa_responses?.['checkout'] || "Standard check-out is at noon. Late check-out until 4 PM is available for $95, subject to availability — I can request that for your room right now if you'd like.",
          intent: 'faq',
          conversationId
        };
      }
      return {
        reply: "Check-in begins at 3:00 PM, and check-out is by 11:00 AM (standard check-out is at noon for Grand Aurel; late check-out until 4 PM is available for $95, subject to availability).",
        intent: 'faq',
        conversationId
      };
    }

    // Swimming pool
    if (lower.includes('pool') || lower.includes('swimming')) {
      return {
        reply: "The heated rooftop infinity pool is open from 7 AM to 10 PM for guests. Cabanas may be reserved in advance. Poolside service for drinks and light bites runs 10 AM to 8 PM.",
        intent: 'faq',
        conversationId
      };
    }

    // Gym / Fitness centre
    if (lower.includes('gym') || lower.includes('fitness') || lower.includes('technogym') || lower.includes('peloton')) {
      return {
        reply: hotelData.qa_responses?.['gym'] || "The fitness centre is open 24 hours with keycard access. It features Technogym equipment, a cycling studio, and Peloton bikes. Personal training sessions can be arranged at €120/hour.",
        intent: 'faq',
        conversationId
      };
    }

    // Wi-Fi / Internet
    if (lower.includes('wifi') || lower.includes('wi-fi') || lower.includes('internet')) {
      return {
        reply: hotelData.qa_responses?.['wifi'] || "Complimentary high-speed Wi-Fi is available throughout the property. Connect to 'Grand Aurel Guest' — no password required. Premium bandwidth for video calls and streaming is available at €18/day.",
        intent: 'faq',
        conversationId
      };
    }

    // Room suitability for 3 guests
    if (
      (lower.includes('room') && (lower.includes('3') || lower.includes('three')) && (lower.includes('guest') || lower.includes('people') || lower.includes('adult') || lower.includes('suitable'))) ||
      lower.includes('three guests') ||
      lower.includes('3 guests')
    ) {
      const faq = hotelData.faqs.find((f) => f.question.toLowerCase().includes('three guests'));
      return {
        reply: faq
          ? faq.answer
          : 'For three guests, we recommend either the Executive Harbor Suite (1 King bed + 1 Queen pullout sofa bed, plus complimentary breakfast) or the Deluxe Double Queen Room (2 Queen beds, accommodating up to 4 guests comfortably).',
        intent: 'faq',
        conversationId
      };
    }

    // Breakfast
    if (lower.includes('breakfast') && !lower.includes('lunch') && !lower.includes('luner') && !lower.includes('dinner')) {
      return {
        reply: hotelData.qa_responses?.['breakfast'] || "Our breakfast buffet is served in the Grand Salon from 7 to 11 AM (weekends until 11:30 AM). Continental, cooked-to-order, and plant-based options are available. Room service breakfast begins at 6 AM.",
        intent: 'faq',
        conversationId
      };
    }

    // Lunch / Dinner / Meal Inclusions (handles typos like 'luner')
    if (
      lower.includes('lunch') ||
      lower.includes('luner') ||
      lower.includes('dinner') ||
      lower.includes('meal') ||
      lower.includes('all-inclusive') ||
      lower.includes('all inclusive')
    ) {
      return {
        reply: "Lunch and dinner are not included in the standard room rates or room budget. Guests can enjoy lunch and dinner à la carte at our dining venues or via 24-hour room service (breakfast 6–11 AM, lunch 12–3 PM, dinner 6 PM–midnight).",
        intent: 'faq',
        conversationId
      };
    }

    // Cancellation policy
    if (lower.includes('cancel') || lower.includes('cancellation')) {
      return {
        reply: hotelData.hotel.cancellation_policy,
        intent: 'faq',
        conversationId
      };
    }

    // Parking & EV
    if (lower.includes('parking') || lower.includes('valet') || lower.includes('ev charging')) {
      const parking = hotelData.amenities.find((a) => a.id === 'parking');
      return {
        reply: parking ? parking.description : 'Valet parking is available for $35 per overnight stay with complimentary EV charging.',
        intent: 'faq',
        conversationId
      };
    }

    // Pets / Dogs
    if (lower.includes('pet') || lower.includes('dog') || lower.includes('cat') || lower.includes('animal')) {
      const petFaq = hotelData.faqs.find((f) => f.question.toLowerCase().includes('pet'));
      return {
        reply: petFaq ? petFaq.answer : 'We welcome up to two dogs per room under 25 lbs each with a $75 cleaning fee per stay. Service animals are free of charge.',
        intent: 'faq',
        conversationId
      };
    }

    // Ambiguous questions (e.g., "Is it good for kids?")
    if (lower.includes('kid') || lower.includes('children') || lower.includes('family')) {
      return {
        reply: 'The Grand Azure Resort welcomes families! We offer multi-room Two-Bedroom Family Villas with kitchenettes, a heated rooftop pool open until 10:00 PM, and child breakfast rates ($15 under age 12). Please let us know if you need cribs or high chairs, or if you have specific family amenities in mind.',
        intent: 'faq',
        conversationId
      };
    }

    // Unanswerable / Out of scope questions (weather, flights, external password, outside attractions)
    return {
      reply: hotelData.qa_responses?.['default'] || "I do not have that information in our directory, but I'd be happy to assist you with that. Please allow me a moment to connect you with the right information, or feel free to contact our front desk or call our concierge desk directly at ext. 0.",
      intent: 'fallback',
      conversationId
    };
  }

  private buildSystemPrompt(hotelName: string, chunks: KnowledgeChunk[]): string {
    const contextText =
      chunks.length > 0
        ? chunks.map((c, i) => `[Source ${i + 1} (${c.category}): ${c.sourceRef}]\n${c.text}`).join('\n\n')
        : 'No directly relevant knowledge base entries were found for this query.';

    return `You are the AI Hotel Guest Assistant for "${hotelName}".
Your responsibility is to assist prospective and current guests with property details, amenities, room types, policies, and availability.

RETRIEVED KNOWLEDGE BASE CONTEXT (Top-${chunks.length} Chunks):
${contextText}

STRICT OPERATIONAL RULES:
1. ONLY answer questions using factual information found directly in the RETRIEVED KNOWLEDGE BASE CONTEXT above.
2. OUT-OF-SCOPE QUESTIONS: If the guest asks about anything not in the retrieved context (such as local weather, outside restaurants not listed, flight booking, external events, or private credentials), DO NOT guess or hallucinate. Politely state that you do not have that information in your directory and offer the front desk contact info (+1 (831) 555-0199 or concierge@grandazureresort.com).
3. ROOM AVAILABILITY:
   - You must NEVER invent or speculate on room availability or inventory yourself.
   - If the user provides checkIn (YYYY-MM-DD), checkOut (YYYY-MM-DD), and the number of adults, invoke the tool 'checkAvailability'.
   - If the user asks about availability or booking but is missing any required information (dates or guest count), invoke the tool 'requestMissingAvailabilityFields' specifying which fields are missing.
4. ROOM SUITABILITY:
   - When asked which room fits certain parties (e.g. 3 guests), reference the maxOccupancy and bed configurations accurately from the retrieved context.
5. Maintain a welcoming, polite, and professional luxury concierge tone at all times.`;
  }
}

export const aiService = new AIService();
