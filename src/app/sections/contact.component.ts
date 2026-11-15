import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { I18nService } from '../core/i18n.service';
import { GuideService } from '../core/guide.service';
import { ContactMeService } from '../services/contact-me.service';
import { LINKS } from '../core/content';

type Status = 'idle' | 'sending' | 'ok' | 'err';

@Component({
  selector: 'app-contact',
  imports: [FormsModule],
  template: `
<section id="contact" data-guide="contact">
  <div class="contact">
    <div class="side">
      <div class="sh" style="margin-bottom:18px"><span class="n">06</span></div>
      <h2>{{ i18n.ui('contact.t') }}</h2>
      <p>{{ i18n.ui('contact.p') }}</p>
      <div class="outs">
        <div class="mail">
          <div><strong>{{ i18n.ui('contact.mailL') }}</strong><br><a id="mailAddr" [href]="'mailto:' + links.email">{{ links.email }}</a></div>
          <button type="button" (click)="copy()">{{ copied() ? i18n.ui('contact.copied') : i18n.ui('contact.copy') }}</button>
        </div>
        <a [href]="links.linkedin" target="_blank" rel="noopener">LinkedIn <span>ayoub-razali ↗</span></a>
        <a [href]="links.github" target="_blank" rel="noopener">GitHub <span>youbo28 ↗</span></a>
        <a [href]="links.youtube" target="_blank" rel="noopener">YouTube <span>LEAF CODE ↗</span></a>
      </div>
    </div>
    <form #f="ngForm" (ngSubmit)="send(f)">
      <label for="f-name">{{ i18n.ui('contact.name') }}</label>
      <input id="f-name" name="name" [(ngModel)]="model.name" required autocomplete="name">
      <label for="f-mail">{{ i18n.ui('contact.email') }}</label>
      <input id="f-mail" name="email" type="email" [(ngModel)]="model.email" required email autocomplete="email">
      <label for="f-msg">{{ i18n.ui('contact.msg') }}</label>
      <textarea id="f-msg" name="message" [(ngModel)]="model.message" required></textarea>
      <button class="btn primary" type="submit" [disabled]="status() === 'sending'">
        {{ status() === 'sending' ? i18n.ui('contact.sending') : i18n.ui('contact.send') }}
      </button>
      <p class="sent" [class.err]="status() === 'err'" role="status">
        @if (status() === 'ok') { {{ i18n.ui('contact.ok') }} }
        @if (status() === 'err') { {{ i18n.ui('contact.err') }} }
      </p>
    </form>
  </div>
</section>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactComponent {
  readonly i18n = inject(I18nService);
  private guide = inject(GuideService);
  private api = inject(ContactMeService);
  readonly links = LINKS;
  readonly status = signal<Status>('idle');
  readonly copied = signal(false);
  model = { name: '', email: '', message: '' };

  async copy(): Promise<void> {
    this.guide.react('joy', 'copied');
    try {
      await navigator.clipboard.writeText(LINKS.email);
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2500);
    } catch {
      const el = document.getElementById('mailAddr');
      if (el) { const r = document.createRange(); r.selectNodeContents(el); const s = getSelection(); s?.removeAllRanges(); s?.addRange(r); }
    }
  }

  send(form: NgForm): void {
    if (form.invalid) { form.control.markAllAsTouched(); return; }
    this.status.set('sending');
    this.api.sendEmail({ ...this.model }).subscribe({
      next: () => { this.status.set('ok'); form.resetForm(); this.guide.react('thanks', 'thanks'); },
      error: () => this.status.set('err'),
    });
  }
}
