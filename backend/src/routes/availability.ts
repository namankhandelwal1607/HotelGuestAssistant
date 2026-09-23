import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { availabilityService } from '../services/availabilityService';
import { Logger } from '../utils/logger';

const router = Router();

const availabilityQuerySchema = z.object({
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Check-in must be in YYYY-MM-DD format'),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Check-out must be in YYYY-MM-DD format'),
  adults: z.number().int().min(1, 'At least 1 adult guest is required').max(10, 'Maximum 10 guests per online inquiry')
});

router.post('/availability', (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  try {
    const parseResult = availabilityQuerySchema.safeParse(req.body);
    if (!parseResult.success) {
      const errorDetails = parseResult.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
      return res.status(400).json({
        success: false,
        error: `Validation failed: ${errorDetails}`,
        timestamp: new Date().toISOString()
      });
    }

    const { checkIn, checkOut, adults } = parseResult.data;
    Logger.info(`Direct availability query received: checkIn=${checkIn}, checkOut=${checkOut}, adults=${adults}`);

    const result = availabilityService.checkAvailability({ checkIn, checkOut, adults });
    const latency = Date.now() - startTime;
    Logger.info(`Direct availability query completed in ${latency}ms, available rooms: ${result.totalAvailableCount}`);

    return res.status(200).json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    Logger.error('Error in /api/availability', error);
    return res.status(400).json({
      success: false,
      error: error.message || 'Failed to check room availability',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
