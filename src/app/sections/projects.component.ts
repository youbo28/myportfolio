import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { I18nService } from '../core/i18n.service';
import { Project } from '../core/content';

/** Drawn cover art per project (no screenshots, no external images). */
function cover(p: Project): string {
  const h = p.hue, ink = '#0B1026';
  const m: Record<string, string> = {
    web: `<rect x="70" y="40" width="260" height="130" rx="12" fill="${ink}" opacity=".85"/><rect x="70" y="40" width="260" height="22" rx="12" fill="${h}" opacity=".9"/><circle cx="86" cy="51" r="4" fill="${ink}"/><circle cx="100" cy="51" r="4" fill="${ink}"/><rect x="88" y="80" width="120" height="14" rx="7" fill="${h}"/><rect x="88" y="104" width="180" height="8" rx="4" fill="#fff" opacity=".35"/><rect x="88" y="120" width="150" height="8" rx="4" fill="#fff" opacity=".25"/><path d="M290 90 A22 22 0 1 0 306 128 A18 18 0 1 1 290 90Z" fill="#F6E7B4"/>`,
    chart: `<rect x="70" y="36" width="260" height="138" rx="12" fill="${ink}" opacity=".85"/><g fill="${h}"><rect x="96" y="120" width="26" height="36" rx="4"/><rect x="134" y="100" width="26" height="56" rx="4"/><rect x="172" y="84" width="26" height="72" rx="4"/><rect x="210" y="104" width="26" height="52" rx="4"/></g><path d="M96 92 L140 76 L184 62 L224 70 L300 50" stroke="#fff" stroke-width="3" fill="none" opacity=".8"/>`,
    film: `<rect x="80" y="44" width="240" height="122" rx="10" fill="${ink}" opacity=".85"/><g fill="${h}">${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<rect x="${92 + i * 29}" y="52" width="16" height="10" rx="2"/><rect x="${92 + i * 29}" y="148" width="16" height="10" rx="2"/>`).join('')}</g><text x="110" y="112" font-family="monospace" font-size="16" fill="#fff" opacity=".9">GET /api/watchlist</text><text x="110" y="134" font-family="monospace" font-size="13" fill="${h}">200 OK</text>`,
    books: `<g>${([['#8FA8FF', 40], ['#FF9A6B', 52], ['#6EE7B7', 36], ['#F6E7B4', 58], ['#C4B5FD', 44], ['#8FA8FF', 30]] as [string, number][]).map(([c, w], i, a) => { const x = 110 + a.slice(0, i).reduce((s, [, ww]) => s + ww * 0.55 + 6, 0); return `<rect x="${x}" y="${170 - w * 2.2}" width="${w * 0.55}" height="${w * 2.2}" rx="3" fill="${c}"/>`; }).join('')}</g><rect x="96" y="170" width="220" height="8" rx="4" fill="#fff" opacity=".4"/>`,
  };
  return `<svg viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="g${p.id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${h}" stop-opacity=".35"/><stop offset="1" stop-color="${h}" stop-opacity=".08"/></linearGradient></defs><rect width="400" height="200" fill="url(#g${p.id})"/>${m[p.motif] ?? ''}</svg>`;
}

@Component({
  selector: 'app-projects',
  template: `
<section id="projects" data-guide="projects">
  <div class="sh"><span class="n">03</span><h2>{{ i18n.ui('projects.t') }}</h2></div>
  <div class="projects">
    @for (p of items(); track p.data.id) {
      <article class="pj" [id]="'pj-' + p.data.id">
        <div class="cover" [innerHTML]="p.art"></div>
        <div class="body">
          <h3>{{ p.data.title }}</h3>
          <p>{{ p.data.desc }}</p>
          <div class="tech">@for (t of p.data.tech; track t) { <span>{{ t }}</span> }</div>
          <div class="pl">
            <a [href]="p.data.gh" target="_blank" rel="noopener">{{ i18n.ui('site') }} ↗</a>
            @if (p.data.live) { <a [href]="p.data.live" target="_blank" rel="noopener">{{ i18n.ui('live') }} ↗</a> }
          </div>
        </div>
      </article>
    }
  </div>
</section>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectsComponent {
  readonly i18n = inject(I18nService);
  private sanitizer = inject(DomSanitizer);
  // The cover markup is generated here from our own constants, so it is safe to trust.
  readonly items = computed(() =>
    (this.i18n.content()?.projects ?? []).map((data) => ({ data, art: this.sanitizer.bypassSecurityTrustHtml(cover(data)) as SafeHtml })),
  );
}
