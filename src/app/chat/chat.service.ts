import { Injectable, InjectionToken, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { I18nService } from '../core/i18n.service';
import { Lang } from '../core/content';
import { environment } from '../../environments/environment';

/** Only these two roles ever leave the browser; the system prompt lives in the Worker. */
export type ChatMessage = { role: 'user' | 'assistant'; content: string };
export type ChatRequest = { messages: ChatMessage[]; lang: Lang };
export type ChatReply = { reply: string; source: 'model' | 'fallback' };
export type ChatStatus = 'idle' | 'waiting' | 'typing' | 'error';

/** How a question reaches the bot. Swapped for a fake in tests. */
export interface ChatTransport {
  send(req: ChatRequest): Promise<ChatReply>;
}

/** Posts to the portfolio-bot Worker, whose URL comes from the environment config. */
@Injectable({ providedIn: 'root' })
export class HttpChatTransport implements ChatTransport {
  private http = inject(HttpClient);
  send(req: ChatRequest): Promise<ChatReply> {
    return firstValueFrom(this.http.post<ChatReply>(environment.chatUrl, req));
  }
}

export const CHAT_TRANSPORT = new InjectionToken<ChatTransport>('CHAT_TRANSPORT', {
  providedIn: 'root',
  factory: () => inject(HttpChatTransport),
});

/**
 * Milliseconds between words when an answer is typed out. The Worker sends the whole answer
 * at once; the typing is only presentation. 0 (or reduced motion) shows it at once.
 */
export const CHAT_TYPING_MS = new InjectionToken<number>('CHAT_TYPING_MS', {
  providedIn: 'root',
  factory: () => (matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 45),
});

/** The conversation with the bot: messages, status, and sending a question. */
@Injectable({ providedIn: 'root' })
export class ChatService {
  private transport = inject(CHAT_TRANSPORT);
  private i18n = inject(I18nService);
  private typingMs = inject(CHAT_TYPING_MS);

  readonly messages = signal<ChatMessage[]>([]);
  readonly status = signal<ChatStatus>('idle');
  readonly lastSource = signal<ChatReply['source'] | null>(null);

  async send(text: string): Promise<void> {
    const content = text.trim();
    if (!content || this.status() === 'waiting' || this.status() === 'typing') return;

    this.messages.update((m) => [...m, { role: 'user', content }]);
    this.status.set('waiting');
    try {
      const { reply, source } = await this.transport.send({ messages: this.messages(), lang: this.i18n.lang() });
      this.lastSource.set(source);
      await this.typeOut(reply);
      this.status.set('idle');
    } catch {
      this.status.set('error');
    }
  }

  /** Adds the answer one word (with its trailing space) at a time. */
  private async typeOut(reply: string): Promise<void> {
    const words = this.typingMs > 0 ? reply.match(/\S+\s*/g) ?? [reply] : [reply];
    this.status.set('typing');
    let shown = words[0];
    this.messages.update((m) => [...m, { role: 'assistant', content: shown }]);
    for (const word of words.slice(1)) {
      await new Promise((r) => setTimeout(r, this.typingMs));
      shown += word;
      const text = shown;
      this.messages.update((m) => [...m.slice(0, -1), { role: 'assistant', content: text }]);
    }
  }
}
