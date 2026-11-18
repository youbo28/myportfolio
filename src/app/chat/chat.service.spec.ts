import { TestBed, fakeAsync, flushMicrotasks, tick } from '@angular/core/testing';
import { signal } from '@angular/core';
import { CHAT_TRANSPORT, CHAT_TYPING_MS, ChatReply, ChatRequest, ChatService, ChatTransport } from './chat.service';
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

  function setup(typingMs: number) {
    transport = new FakeTransport();
    TestBed.configureTestingModule({
      providers: [
        { provide: CHAT_TRANSPORT, useValue: transport },
        { provide: I18nService, useValue: { lang } },
        { provide: CHAT_TYPING_MS, useValue: typingMs },
      ],
    });
    chat = TestBed.inject(ChatService);
  }

  // Most tests don't care about the typing effect: answers appear at once.
  beforeEach(() => setup(0));

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

  describe('typing the answer out', () => {
    beforeEach(() => {
      TestBed.resetTestingModule();
      setup(30);
    });

    it('reveals the answer word by word, then goes idle', fakeAsync(() => {
      chat.send('Who are you?');
      transport.answer("I'm Ayoub, a software engineer.");
      flushMicrotasks();

      expect(chat.status()).toBe('typing');
      expect(chat.messages()[1].content).toBe("I'm ");

      tick(30);
      expect(chat.messages()[1].content).toBe("I'm Ayoub, ");

      tick(30 * 10);
      expect(chat.messages()[1].content).toBe("I'm Ayoub, a software engineer.");
      expect(chat.status()).toBe('idle');
    }));

    it('ignores new questions until the answer is fully typed', fakeAsync(() => {
      chat.send('Hi');
      transport.answer('Hello there, nice to meet you.');
      flushMicrotasks();

      chat.send('Next question');
      expect(transport.sent.length).toBe(1);

      tick(1000);
      chat.send('Next question');
      expect(transport.sent.length).toBe(2);
    }));

    it('sends the full answer, not the partly typed one, as history', fakeAsync(() => {
      chat.send('Hi');
      transport.answer('Hello there.');
      flushMicrotasks();
      tick(1000);
      chat.send('More?');

      expect(transport.sent[1].messages[1]).toEqual({ role: 'assistant', content: 'Hello there.' });
    }));
  });
});
