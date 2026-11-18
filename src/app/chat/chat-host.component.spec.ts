import { ComponentFixture, DeferBlockState, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { ChatHostComponent } from './chat-host.component';
import { ChatUiService } from './chat-ui.service';
import { CHAT_TRANSPORT, ChatReply } from './chat.service';
import { I18nService } from '../core/i18n.service';

describe('ChatHostComponent (the chat the mascot opens)', () => {
  let fixture: ComponentFixture<ChatHostComponent>;
  let ui: ChatUiService;
  let answer: (r: ChatReply) => void;
  let mascot: HTMLButtonElement;
  const el = () => fixture.nativeElement as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatHostComponent],
      providers: [
        { provide: I18nService, useValue: { lang: signal('en'), ui: (k: string) => `[${k}]` } },
        { provide: CHAT_TRANSPORT, useValue: { send: () => new Promise<ChatReply>((r) => (answer = r)) } },
      ],
    }).compileComponents();
    // Stands in for the mascot's hit button, which lives in the mascot component.
    mascot = document.createElement('button');
    mascot.id = 'guide-hit';
    document.body.appendChild(mascot);
    ui = TestBed.inject(ChatUiService);
    fixture = TestBed.createComponent(ChatHostComponent);
    fixture.detectChanges();
  });

  afterEach(() => mascot.remove());

  async function open() {
    ui.toggle();
    fixture.detectChanges();
    const [panel] = await fixture.getDeferBlocks();
    await panel.render(DeferBlockState.Complete);
    await fixture.whenStable();
    fixture.detectChanges();
  }

  it('renders nothing until the mascot opens the chat', () => {
    expect(el().querySelector('[role="dialog"]')).toBeNull();
  });

  it('opens the panel and focuses the question field', async () => {
    await open();

    expect(el().querySelector('[role="dialog"]')).not.toBeNull();
    expect(document.activeElement).toBe(el().querySelector('textarea'));
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

  it('closes with Escape and gives focus back to the mascot', async () => {
    await open();
    el().querySelector('[role="dialog"]')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(ui.open()).toBeFalse();
    expect(el().querySelector('[role="dialog"]')).toBeNull();
    expect(document.activeElement).toBe(mascot);
  });

  it('clicking the mascot again closes it', async () => {
    await open();
    ui.toggle();
    fixture.detectChanges();

    expect(el().querySelector('[role="dialog"]')).toBeNull();
  });
});
