import { ComponentFixture, DeferBlockState, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { ChatLauncherComponent } from './chat-launcher.component';
import { CHAT_TRANSPORT, ChatReply } from './chat.service';
import { I18nService } from '../core/i18n.service';

describe('ChatLauncherComponent', () => {
  let fixture: ComponentFixture<ChatLauncherComponent>;
  let answer: (r: ChatReply) => void;
  const el = () => fixture.nativeElement as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatLauncherComponent],
      providers: [
        { provide: I18nService, useValue: { lang: signal('en'), ui: (k: string) => `[${k}]` } },
        { provide: CHAT_TRANSPORT, useValue: { send: () => new Promise<ChatReply>((r) => (answer = r)) } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ChatLauncherComponent);
    fixture.detectChanges();
  });

  async function open() {
    el().querySelector<HTMLButtonElement>('button.chat-open')!.click();
    fixture.detectChanges();
    const [panel] = await fixture.getDeferBlocks();
    await panel.render(DeferBlockState.Complete);
    await fixture.whenStable();
    fixture.detectChanges();
  }

  it('is a real button with an accessible label, so keyboard users can open it', () => {
    const button = el().querySelector('button.chat-open')!;
    expect(button.getAttribute('aria-label')).toBe('[chat.open]');
    expect(button.getAttribute('aria-expanded')).toBe('false');
  });

  it('does not render the panel until it is opened', () => {
    expect(el().querySelector('[role="dialog"]')).toBeNull();
  });

  it('opens the panel and focuses the question field', async () => {
    await open();

    expect(el().querySelector('[role="dialog"]')).not.toBeNull();
    expect(document.activeElement).toBe(el().querySelector('textarea'));
    expect(el().querySelector('button.chat-open')!.getAttribute('aria-expanded')).toBe('true');
  });

  it('shows the question at once, a thinking line, then the answer', async () => {
    await open();
    const field = el().querySelector('textarea')!;
    field.value = 'Who are you?';
    field.dispatchEvent(new Event('input'));
    el().querySelector<HTMLFormElement>('form')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(el().textContent).toContain('Who are you?');
    expect(el().textContent).toContain('[chat.thinking]');

    answer({ reply: "I'm Ayoub.", source: 'model' });
    await fixture.whenStable();
    fixture.detectChanges();

    expect(el().textContent).toContain("I'm Ayoub.");
    expect(el().textContent).not.toContain('[chat.thinking]');
  });

  it('closes with Escape and gives focus back to the button', async () => {
    await open();
    el().querySelector('[role="dialog"]')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(el().querySelector('[role="dialog"]')).toBeNull();
    expect(document.activeElement).toBe(el().querySelector('button.chat-open'));
  });
});
