import { ChatApiResponse, Message, AvailabilityQuery, AvailabilityResultData } from '../types';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '';

export async function sendChatMessage(
  message: string,
  conversationId?: string,
  history?: Message[]
): Promise<ChatApiResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const payload = {
      message,
      conversationId: conversationId || undefined,
      history: history
        ? history.slice(-6).map((m) => ({
            role: m.role,
            content: m.content,
            timestamp: m.timestamp
          }))
        : undefined
    };

    const res = await fetch(`${BACKEND_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errorJson = await res.json().catch(() => null);
      const errMsg = errorJson?.error || `Server responded with status ${res.status}`;
      throw new Error(errMsg);
    }

    return await res.json();
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Request timed out. The server took too long to respond.');
    }
    throw new Error(err.message || 'Unable to connect to the hotel concierge backend.');
  }
}

export async function checkDirectAvailability(
  query: AvailabilityQuery
): Promise<AvailabilityResultData> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(`${BACKEND_URL}/api/availability`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(query),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errorJson = await res.json().catch(() => null);
      throw new Error(errorJson?.error || 'Failed to check room availability');
    }

    const data = await res.json();
    return data.data;
  } catch (err: any) {
    clearTimeout(timeoutId);
    throw new Error(err.message || 'Failed to connect to the availability engine.');
  }
}
