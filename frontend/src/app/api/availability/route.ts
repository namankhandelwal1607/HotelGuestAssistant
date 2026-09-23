import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { availabilityService } from '@/server/availabilityService';
import { Logger } from '@/server/logger';

const availabilityQuerySchema = z.object({
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Check-in must be in YYYY-MM-DD format'),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Check-out must be in YYYY-MM-DD format'),
  adults: z.number().int().min(1, 'At least 1 adult guest is required').max(10, 'Maximum 10 guests per online inquiry')
});

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    const body = await req.json();
    const parseResult = availabilityQuerySchema.safeParse(body);
    if (!parseResult.success) {
      const errorDetails = parseResult.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
      return NextResponse.json(
        {
          success: false,
          error: `Validation failed: ${errorDetails}`,
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    const { checkIn, checkOut, adults } = parseResult.data;
    Logger.info(`Direct availability query received: checkIn=${checkIn}, checkOut=${checkOut}, adults=${adults}`);

    const result = availabilityService.checkAvailability({ checkIn, checkOut, adults });
    const latency = Date.now() - startTime;
    Logger.info(`Direct availability query completed in ${latency}ms, available rooms: ${result.totalAvailableCount}`);

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    Logger.error('Error in /api/availability', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to check room availability',
        timestamp: new Date().toISOString()
      },
      { status: 400 }
    );
  }
}
