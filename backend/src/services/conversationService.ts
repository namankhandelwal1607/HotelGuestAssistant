import { v4 as uuidv4 } from 'uuid';
import { ChatMessage } from '../types';

export class ConversationService {
  private conversations: Map<string, ChatMessage[]> = new Map();
  private readonly maxTurns: number = 10; // Stores last 10 user/assistant exchanges (20 messages)

  public getOrCreateId(conversationId?: string): string {
    if (conversationId && conversationId.trim()) {
      return conversationId.trim();
    }
    return uuidv4();
  }

  public getHistory(conversationId: string): ChatMessage[] {
    return this.conversations.get(conversationId) || [];
  }

  public addMessage(conversationId: string, message: ChatMessage): void {
    const existing = this.conversations.get(conversationId) || [];
    existing.push({
      ...message,
      timestamp: message.timestamp || new Date().toISOString()
    });

    // Enforce sliding window (keep last 2 * maxTurns messages)
    const limit = this.maxTurns * 2;
    if (existing.length > limit) {
      this.conversations.set(conversationId, existing.slice(existing.length - limit));
    } else {
      this.conversations.set(conversationId, existing);
    }
  }

  public setHistory(conversationId: string, messages: ChatMessage[]): void {
    const limit = this.maxTurns * 2;
    const truncated = messages.length > limit ? messages.slice(messages.length - limit) : messages;
    this.conversations.set(conversationId, truncated);
  }

  public clear(conversationId: string): void {
    this.conversations.delete(conversationId);
  }

  public size(): number {
    return this.conversations.size;
  }
}

export const conversationService = new ConversationService();
