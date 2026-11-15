import { ChangeDetectionStrategy, Component, HostListener, inject } from '@angular/core';
import { I18nService } from '../core/i18n.service';
import { GuideService } from '../core/guide.service';
import { LINKS } from '../core/content';

const KEY = 'youtube-modal-shown';

/** One-time announcement of the YouTube channel. */
@Component({
  selector: 'app-youtube-modal',
  template: `
@if (guide.ytOpen()) {
  <div id="yt" role="dialog" aria-modal="true" aria-labelledby="yt-t" (click)="$event.target === $event.currentTarget && close()">
    <div class="card">
      <div class="play"><svg width="30" height="30" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" fill="#fff"/></svg></div>
      <h3 id="yt-t">{{ i18n.ui('yt.t') }}</h3>
      <p>{{ i18n.ui('yt.p') }}</p>
      <div class="row">
        <a class="btn primary" [href]="links.youtube" target="_blank" rel="noopener" (click)="close()">{{ i18n.ui('yt.go') }}</a>
        <button type="button" class="btn" (click)="close()">{{ i18n.ui('yt.later') }}</button>
      </div>
      <small>{{ i18n.ui('yt.note') }}</small>
    </div>
  </div>
}`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class YoutubeModalComponent {
  readonly i18n = inject(I18nService);
  readonly guide = inject(GuideService);
  readonly links = LINKS;

  constructor() {
    let seen: string | null = '1';
    try { seen = localStorage.getItem(KEY); } catch {}
    if (seen !== 'true' && seen !== '1') setTimeout(() => this.guide.ytOpen.set(true), 1500);
  }

  @HostListener('document:keydown.escape')
  close(): void {
    if (!this.guide.ytOpen()) return;
    this.guide.ytOpen.set(false);
    try { localStorage.setItem(KEY, '1'); } catch {}
  }
}
