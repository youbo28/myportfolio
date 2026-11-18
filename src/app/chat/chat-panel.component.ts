import { ChangeDetectionStrategy, Component, ElementRef, afterNextRender, inject, output, signal, viewChild } from '@angular/core';
import { I18nService } from '../core/i18n.service';
import { ChatService } from './chat.service';

/** The conversation with the bot: messages, a thinking line while waiting, and the question field. */
@Component({
  selector: 'app-chat-panel',
  template: `
<section class="chat" role="dialog" [attr.aria-label]="i18n.ui('chat.title')" (keydown.escape)="closed.emit()">
  <div class="chat-head">
    <strong>{{ i18n.ui('chat.title') }}</strong>
    <button type="button" class="chat-close" (click)="closed.emit()" [attr.aria-label]="i18n.ui('chat.close')">×</button>
  </div>
  <ol class="chat-log" aria-live="polite">
    @for (m of chat.messages(); track $index) {
      <li [class]="'chat-msg ' + m.role">{{ m.content }}</li>
    }
    @if (chat.status() === 'waiting') {
      <li class="chat-msg assistant thinking">{{ i18n.ui('chat.thinking') }}</li>
    }
    @if (chat.status() === 'error') {
      <li class="chat-msg error" role="alert">{{ i18n.ui('chat.error') }}</li>
    }
  </ol>
  <form class="chat-form" (submit)="ask($event)">
    <textarea #field rows="2" maxlength="1000" [value]="draft()" (input)="draft.set(field.value)"
      (keydown.enter)="enter($event)" [placeholder]="i18n.ui('chat.placeholder')"
      [attr.aria-label]="i18n.ui('chat.placeholder')"></textarea>
    <button type="submit" [disabled]="chat.status() === 'waiting' || chat.status() === 'typing'">{{ i18n.ui('chat.send') }}</button>
  </form>
</section>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatPanelComponent {
  readonly i18n = inject(I18nService);
  readonly chat = inject(ChatService);
  readonly closed = output<void>();
  readonly draft = signal('');
  private field = viewChild.required<ElementRef<HTMLTextAreaElement>>('field');

  constructor() {
    afterNextRender(() => this.field().nativeElement.focus());
  }

  ask(e: Event): void {
    e.preventDefault();
    const text = this.draft();
    if (!text.trim() || this.chat.status() === 'waiting' || this.chat.status() === 'typing') return;
    this.draft.set('');
    this.chat.send(text);
  }

  /** Enter sends; Shift+Enter makes a new line. */
  enter(e: Event): void {
    if ((e as KeyboardEvent).shiftKey) return;
    this.ask(e);
  }
}
