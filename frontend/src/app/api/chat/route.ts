import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { aiService } from '@/server/aiService';
import { Logger } from '@/server/logger';

const chatMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1),
  timestamp: z.string().optional()
});

const chatRequestSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(2000, 'Message is too long (max 2000 characters)'),
  conversationId: z.string().optional(),
  history: z.array(chatMessageSchema).optional()
});

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    const body = await req.json();
    const parseResult = chatRequestSchema.safeParse(body);
    if (!parseResult.success) {
      const errorMsg = parseResult.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
      Logger.warn(`Invalid chat request: ${errorMsg}`);
      return NextResponse.json(
        {
          success: false,
          error: `Validation error: ${errorMsg}`,
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    const { message, conversationId, history } = parseResult.data;
    Logger.info(`[Chat Request] convId=${conversationId || 'new'} msg="${message.slice(0, 80)}"`);

    const result = await aiService.processMessage(message, conversationId, history);
    const latency = Date.now() - startTime;

    Logger.info(`[Chat Response] convId=${result.conversationId} intent=${result.intent} latency=${latency}ms`);

    return NextResponse.json({
      reply: result.reply,
      intent: result.intent,
      data: result.data,
      conversationId: result.conversationId,
      missingFields: result.missingFields
    });
  } catch (error: any) {
    Logger.error('Error handling chat request', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'An unexpected error occurred while processing your request.',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
