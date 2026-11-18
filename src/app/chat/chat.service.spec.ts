import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { CHAT_TRANSPORT, ChatReply, ChatRequest, ChatService, ChatTransport } from './chat.service';
import { I18nService } from '../core/i18n.service';

/** A transport whose answer the test controls; it records what the service sent. */
class FakeTransport implements ChatTransport {
  sent: ChatRequest[] = [];
  private settle?: { resolve: (r: ChatReply) => void; reject: (e: unknown) => void };
  send(req: ChatRequest): Promise<ChatReply> {
    this.sent.push(structuredClone(req));
    return new Promise((resolve, reject) => (this.settle = { resolve, reject }));
  }
  answer(reply: string, source: ChatReply['source'] = 'model') { this.settle!.resolve({ reply, source }); }
  fail() { this.settle!.reject(new Error('network down')); }
}

describe('ChatService', () => {
  let chat: ChatService;
  let transport: FakeTransport;
  const lang = signal<'en' | 'fr' | 'de' | 'ar'>('fr');

  beforeEach(() => {
    transport = new FakeTransport();
    TestBed.configureTestingModule({
      providers: [
        { provide: CHAT_TRANSPORT, useValue: transport },
        { provide: I18nService, useValue: { lang } },
      ],
    });
    chat = TestBed.inject(ChatService);
  });

  it('shows the visitor message at once and waits for the answer', () => {
    chat.send('Who are you?');

    expect(chat.messages()).toEqual([{ role: 'user', content: 'Who are you?' }]);
    expect(chat.status()).toBe('waiting');
  });

  it('adds the answer and goes back to idle', async () => {
    const done = chat.send('Who are you?');
    transport.answer("I'm Ayoub.");
    await done;

    expect(chat.messages()).toEqual([
      { role: 'user', content: 'Who are you?' },
      { role: 'assistant', content: "I'm Ayoub." },
    ]);
    expect(chat.status()).toBe('idle');
  });

  it('sends only user and assistant messages plus the site language', async () => {
    let done = chat.send('Hi');
    transport.answer('Hello!');
    await done;
    done = chat.send('What do you do?');
    transport.answer('I build backends.');
    await done;

    expect(transport.sent[1]).toEqual({
      messages: [
        { role: 'user', content: 'Hi' },
        { role: 'assistant', content: 'Hello!' },
        { role: 'user', content: 'What do you do?' },
      ],
      lang: 'fr',
    });
    for (const req of transport.sent) {
      expect(req.messages.every((m) => m.role === 'user' || m.role === 'assistant')).toBeTrue();
    }
  });

  it('remembers where the last answer came from', async () => {
    const done = chat.send('Hi');
    transport.answer('Sorry, try again later.', 'fallback');
    await done;

    expect(chat.lastSource()).toBe('fallback');
  });

  it('goes to the error status when the request fails', async () => {
    const done = chat.send('Hi');
    transport.fail();
    await done;

    expect(chat.status()).toBe('error');
    expect(chat.messages()).toEqual([{ role: 'user', content: 'Hi' }]);
  });

  it('ignores blank messages and messages sent while waiting', () => {
    chat.send('   ');
    expect(transport.sent.length).toBe(0);

    chat.send('First');
    chat.send('Second');
    expect(transport.sent.length).toBe(1);
  });
});
