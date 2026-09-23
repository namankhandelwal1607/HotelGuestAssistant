import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { aiService } from '../services/aiService';
import { Logger } from '../utils/logger';

const router = Router();

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

router.post('/chat', async (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  try {
    const parseResult = chatRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      const errorMsg = parseResult.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
      Logger.warn(`Invalid chat request: ${errorMsg}`);
      return res.status(400).json({
        success: false,
        error: `Validation error: ${errorMsg}`,
        timestamp: new Date().toISOString()
      });
    }

    const { message, conversationId, history } = parseResult.data;
    Logger.info(`[Chat Request] convId=${conversationId || 'new'} msg="${message.slice(0, 80)}"`);

    const result = await aiService.processMessage(message, conversationId, history);
    const latency = Date.now() - startTime;

    Logger.info(`[Chat Response] convId=${result.conversationId} intent=${result.intent} latency=${latency}ms`);

    return res.status(200).json({
      reply: result.reply,
      intent: result.intent,
      data: result.data,
      conversationId: result.conversationId,
      missingFields: result.missingFields
    });
  } catch (error: any) {
    Logger.error('Error handling chat request', error);
    next(error);
  }
});

export default router;
