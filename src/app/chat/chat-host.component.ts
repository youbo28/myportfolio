import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ChatPanelComponent } from './chat-panel.component';
import { ChatUiService } from './chat-ui.service';

/** Shows the chat panel when the mascot opens it. The panel's code loads on the first open. */
@Component({
  selector: 'app-chat-host',
  imports: [ChatPanelComponent],
  template: `
@defer (when ui.open()) {
  @if (ui.open()) {
    <app-chat-panel id="chat-panel" (closed)="ui.close()" />
  }
}`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatHostComponent {
  readonly ui = inject(ChatUiService);
}
