import { ChangeDetectionStrategy, Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { I18nService } from '../core/i18n.service';
import { ChatPanelComponent } from './chat-panel.component';

/**
 * The "ask me" button beside the guide. The mascot itself is a full-screen canvas that
 * ignores the pointer, so this real button is what opens the chat (and what keyboards reach).
 * The panel's code is only downloaded the first time it opens.
 */
@Component({
  selector: 'app-chat-launcher',
  imports: [ChatPanelComponent],
  template: `
<button #opener class="chat-open" type="button" (click)="toggle()"
  [attr.aria-label]="i18n.ui('chat.open')" [attr.aria-expanded]="open()" aria-controls="chat-panel">
  <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-5 4v-4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"/></svg>
</button>
@defer (when open()) {
  @if (open()) {
    <app-chat-panel id="chat-panel" (closed)="close()" />
  }
}`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatLauncherComponent {
  readonly i18n = inject(I18nService);
  readonly open = signal(false);
  private opener = viewChild.required<ElementRef<HTMLButtonElement>>('opener');

  toggle(): void {
    this.open() ? this.close() : this.open.set(true);
  }

  close(): void {
    this.open.set(false);
    this.opener().nativeElement.focus();
  }
}
