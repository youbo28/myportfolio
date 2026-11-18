import { ChangeDetectionStrategy, Component, ElementRef, afterNextRender, effect, inject, output, signal, viewChild } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { I18nService } from '../core/i18n.service';
import { ChatService } from './chat.service';

/**
 * The conversation with the guide: a greeting and suggested questions to start, typing dots
 * while it thinks, its answers typed out beside its avatar, and the question field.
 */
@Component({
  selector: 'app-chat-panel',
  imports: [NgTemplateOutlet],
  template: `
<!-- the guide's face in miniature, beside its messages -->
<ng-template #face><span class="chat-avatar" aria-hidden="true"><svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M14.5 3a9 9 0 1 0 6.4 13.3A7.2 7.2 0 0 1 14.5 3Z"/></svg></span></ng-template>
<section class="chat" role="dialog" [attr.aria-label]="i18n.ui('chat.title')" (keydown.escape)="closed.emit()">
  <div class="chat-head">
    <ng-container *ngTemplateOutlet="face" />
    <div class="chat-who">
      <strong>{{ i18n.ui('chat.title') }}</strong>
      <span class="chat-online">{{ i18n.ui('chat.online') }}</span>
    </div>
    <button type="button" class="chat-close" (click)="closed.emit()" [attr.aria-label]="i18n.ui('chat.close')">×</button>
  </div>
  <ol #log class="chat-log" aria-live="polite">
    <li class="chat-row assistant"><ng-container *ngTemplateOutlet="face" />
      <span class="chat-msg assistant">{{ i18n.ui('chat.greeting') }}</span></li>
    @for (m of chat.messages(); track $index) {
      <li [class]="'chat-row ' + m.role">
        @if (m.role === 'assistant') { <ng-container *ngTemplateOutlet="face" /> }
        <span [class]="'chat-msg ' + m.role">{{ m.content }}</span>
      </li>
    }
    @if (chat.status() === 'waiting') {
      <li class="chat-row assistant"><ng-container *ngTemplateOutlet="face" />
        <span class="chat-msg assistant thinking"><span class="dot"></span><span class="dot"></span><span class="dot"></span>
          <span class="sr-only">{{ i18n.ui('chat.thinking') }}</span></span></li>
    }
    @if (chat.status() === 'error') {
      <li class="chat-msg error" role="alert">{{ i18n.ui('chat.error') }}</li>
    }
  </ol>
  @if (chat.messages().length === 0) {
    <div class="chat-chips">
      @for (k of suggestions; track k) {
        <button type="button" class="chat-chip" (click)="suggest(i18n.ui(k))">{{ i18n.ui(k) }}</button>
      }
    </div>
  }
  <form class="chat-form" (submit)="ask($event)">
    <textarea #field rows="2" maxlength="1000" [value]="draft()" (input)="draft.set(field.value)"
      (keydown.enter)="enter($event)" [placeholder]="i18n.ui('chat.placeholder')"
      [attr.aria-label]="i18n.ui('chat.placeholder')"></textarea>
    <button type="submit" [disabled]="busy()">{{ i18n.ui('chat.send') }}</button>
  </form>
</section>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatPanelComponent {
  readonly i18n = inject(I18nService);
  readonly chat = inject(ChatService);
  readonly closed = output<void>();
  readonly draft = signal('');
  readonly suggestions = ['chat.s1', 'chat.s2', 'chat.s3'];
  private field = viewChild.required<ElementRef<HTMLTextAreaElement>>('field');
  private log = viewChild.required<ElementRef<HTMLOListElement>>('log');

  constructor() {
    afterNextRender(() => this.field().nativeElement.focus());
    // keep the latest words in view while the answer is typed out
    effect(() => {
      this.chat.messages();
      this.chat.status();
      const el = this.log().nativeElement;
      queueMicrotask(() => (el.scrollTop = el.scrollHeight));
    });
  }

  busy(): boolean {
    return this.chat.status() === 'waiting' || this.chat.status() === 'typing';
  }

  ask(e: Event): void {
    e.preventDefault();
    const text = this.draft();
    if (!text.trim() || this.busy()) return;
    this.draft.set('');
    this.chat.send(text);
  }

  suggest(text: string): void {
    if (!this.busy()) this.chat.send(text);
  }

  /** Enter sends; Shift+Enter makes a new line. */
  enter(e: Event): void {
    if ((e as KeyboardEvent).shiftKey) return;
    this.ask(e);
  }
}
