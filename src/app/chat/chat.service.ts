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
export type ChatStatus = 'idle' | 'waiting' | 'error';

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

/** The conversation with the bot: messages, status, and sending a question. */
@Injectable({ providedIn: 'root' })
export class ChatService {
  private transport = inject(CHAT_TRANSPORT);
  private i18n = inject(I18nService);

  readonly messages = signal<ChatMessage[]>([]);
  readonly status = signal<ChatStatus>('idle');
  readonly lastSource = signal<ChatReply['source'] | null>(null);

  async send(text: string): Promise<void> {
    const content = text.trim();
    if (!content || this.status() === 'waiting') return;

    this.messages.update((m) => [...m, { role: 'user', content }]);
    this.status.set('waiting');
    try {
      const { reply, source } = await this.transport.send({ messages: this.messages(), lang: this.i18n.lang() });
      this.messages.update((m) => [...m, { role: 'assistant', content: reply }]);
      this.lastSource.set(source);
      this.status.set('idle');
    } catch {
      this.status.set('error');
    }
  }
}
