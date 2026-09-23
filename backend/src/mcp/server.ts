/**
 * Hotel Guest Assistant - Model Context Protocol (MCP) Server
 *
 * This server exposes the hotel guest assistant's core business logic as MCP tools,
 * allowing MCP-compatible clients (such as Claude Desktop, Cursor, and Windsurf)
 * to query real-time room availability, retrieve grounded knowledge chunks,
 * and inspect room details directly.
 *
 * TRANSPORT ARCHITECTURE NOTE:
 * Default transport: Standard I/O (StdioServerTransport) enables seamless zero-config
 * integration with local desktop clients (Claude Desktop / Cursor) by spawning this
 * process directly.
 *
 * SWAPPING TO SSE/HTTP TRANSPORT:
 * To deploy this MCP server over HTTP/Server-Sent Events (SSE) for remote or multi-tenant
 * access:
 * 1. Import `SSEServerTransport` from `@modelcontextprotocol/sdk/server/sse.js`.
 * 2. Mount an Express/Fastify endpoint:
 *    app.get('/sse', async (req, res) => {
 *      const transport = new SSEServerTransport('/messages', res);
 *      await server.connect(transport);
 *    });
 *    app.post('/messages', async (req, res) => {
 *      await transport.handlePostMessage(req, res);
 *    });
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

import { availabilityService } from '../services/availabilityService';
import { hotelRepo } from '../data/hotelDataRepository';
import { knowledgeIndexService } from '../services/knowledgeIndexService';

// ---------------------------------------------------------------------------
// Zod Validation Schemas
// ---------------------------------------------------------------------------

export const checkAvailabilitySchema = z.object({
  checkIn: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'checkIn must be formatted as YYYY-MM-DD'),
  checkOut: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'checkOut must be formatted as YYYY-MM-DD'),
  adults: z
    .number()
    .int()
    .min(1, 'adults must be at least 1')
}).refine(
  (data) => new Date(data.checkOut) > new Date(data.checkIn),
  {
    message: 'Check-out date must be strictly after the check-in date',
    path: ['checkOut']
  }
);

export const searchKnowledgeSchema = z.object({
  query: z.string().min(1, 'query cannot be empty')
});

export const getRoomDetailsSchema = z.object({
  roomTypeId: z.string().min(1, 'roomTypeId cannot be empty')
});

// ---------------------------------------------------------------------------
// Tool Definitions
// ---------------------------------------------------------------------------

export const TOOLS: Tool[] = [
  {
    name: 'check_availability',
    description:
      'Check real-time room availability, capacity limits, and total stay pricing for specific dates and guest count at the hotel. Uses deterministic inventory rules.',
    inputSchema: {
      type: 'object',
      properties: {
        checkIn: {
          type: 'string',
          description: 'Check-in date formatted as YYYY-MM-DD (e.g. 2026-10-15)'
        },
        checkOut: {
          type: 'string',
          description: 'Check-out date formatted as YYYY-MM-DD (e.g. 2026-10-18)'
        },
        adults: {
          type: 'number',
          description: 'Number of adult guests staying in the room (minimum 1)'
        }
      },
      required: ['checkIn', 'checkOut', 'adults']
    }
  },
  {
    name: 'search_hotel_knowledge',
    description:
      'Search the hotel knowledge base (policies, amenities, room specs, check-in rules, FAQs) using semantic cosine retrieval to return relevant grounded chunks.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Natural language search query or guest question'
        }
      },
      required: ['query']
    }
  },
  {
    name: 'get_room_details',
    description:
      'Fetch full specifications, maximum occupancy, bed configuration, nightly pricing, and features for a specific room type ID.',
    inputSchema: {
      type: 'object',
      properties: {
        roomTypeId: {
          type: 'string',
          description: 'The unique room type identifier (e.g. deluxe_king, deluxe_double_queen, executive_harbor_suite, two_bedroom_family_villa)'
        }
      },
      required: ['roomTypeId']
    }
  }
];

// ---------------------------------------------------------------------------
// Tool Handlers (Exported for direct unit testing without stdio)
// ---------------------------------------------------------------------------

export async function handleCheckAvailability(args: unknown) {
  const parseResult = checkAvailabilitySchema.safeParse(args);
  if (!parseResult.success) {
    const errorMsg = parseResult.error.errors.map((e) => e.message).join('; ');
    return {
      isError: true,
      content: [
        {
          type: 'text' as const,
          text: `Invalid parameters for check_availability: ${errorMsg}`
        }
      ]
    };
  }

  try {
    const { checkIn, checkOut, adults } = parseResult.data;
    const result = availabilityService.checkAvailability({ checkIn, checkOut, adults });
    return {
      isError: false,
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(result, null, 2)
        }
      ]
    };
  } catch (error: any) {
    return {
      isError: true,
      content: [
        {
          type: 'text' as const,
          text: `Error evaluating room availability: ${error.message}`
        }
      ]
    };
  }
}

export async function handleSearchHotelKnowledge(args: unknown) {
  const parseResult = searchKnowledgeSchema.safeParse(args);
  if (!parseResult.success) {
    return {
      isError: true,
      content: [
        {
          type: 'text' as const,
          text: `Invalid parameters for search_hotel_knowledge: ${parseResult.error.message}`
        }
      ]
    };
  }

  try {
    const { query } = parseResult.data;
    const chunks = knowledgeIndexService.getRelevantChunks(query, 4);
    const results = chunks.map((c) => ({
      id: c.id,
      category: c.category,
      sourceRef: c.sourceRef,
      text: c.text
    }));

    return {
      isError: false,
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(results, null, 2)
        }
      ]
    };
  } catch (error: any) {
    return {
      isError: true,
      content: [
        {
          type: 'text' as const,
          text: `Error searching knowledge base: ${error.message}`
        }
      ]
    };
  }
}

export async function handleGetRoomDetails(args: unknown) {
  const parseResult = getRoomDetailsSchema.safeParse(args);
  if (!parseResult.success) {
    return {
      isError: true,
      content: [
        {
          type: 'text' as const,
          text: `Invalid parameters for get_room_details: ${parseResult.error.message}`
        }
      ]
    };
  }

  const { roomTypeId } = parseResult.data;
  const room = hotelRepo.getRoomById(roomTypeId);

  if (!room) {
    const availableIds = hotelRepo.getRooms().map((r) => r.id).join(', ');
    return {
      isError: true,
      content: [
        {
          type: 'text' as const,
          text: `Room type "${roomTypeId}" not found. Available room types are: ${availableIds}`
        }
      ]
    };
  }

  return {
    isError: false,
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(room, null, 2)
      }
    ]
  };
}

// ---------------------------------------------------------------------------
// Server Factory & Lifecycle
// ---------------------------------------------------------------------------

export function createMcpServer(): Server {
  const server = new Server(
    {
      name: 'hotel-guest-assistant-mcp',
      version: '1.0.0'
    },
    {
      capabilities: {
        tools: {}
      }
    }
  );

  // List available tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools: TOOLS };
  });

  // Call tool request handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    switch (name) {
      case 'check_availability':
        return await handleCheckAvailability(args);
      case 'search_hotel_knowledge':
        return await handleSearchHotelKnowledge(args);
      case 'get_room_details':
        return await handleGetRoomDetails(args);
      default:
        return {
          isError: true,
          content: [
            {
              type: 'text' as const,
              text: `Unknown tool requested: ${name}`
            }
          ]
        };
    }
  });

  return server;
}

export async function runMcpServer(): Promise<void> {
  const server = createMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // Log strictly to stderr so stdout remains clean for MCP JSON-RPC protocol messages
  console.error('Hotel Guest Assistant MCP Server running on stdio');
}

// Runnable entry point
if (require.main === module) {
  runMcpServer().catch((error) => {
    console.error('Fatal MCP Server error:', error);
    process.exit(1);
  });
}
