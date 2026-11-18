import { Injectable, signal } from '@angular/core';

/** Whether the chat is open. The mascot toggles it; the chat host shows the panel. */
@Injectable({ providedIn: 'root' })
export class ChatUiService {
  readonly open = signal(false);
  /** Whether the visitor has opened the chat at least once this visit. */
  readonly used = signal(false);

  toggle(): void {
    this.open.update((v) => !v);
    if (this.open()) this.used.set(true);
  }

  /** Closes the chat and hands keyboard focus back to the mascot. */
  close(): void {
    this.open.set(false);
    document.getElementById('guide-hit')?.focus();
  }
}
