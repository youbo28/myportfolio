import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import {
  siOpenjdk, siSpringboot, siAngular, siTypescript, siTailwindcss, siBootstrap, siCss, siOdoo, siDocker,
  siKubernetes, siGit, siPython, siHtml5, siSass, siFlutter,
} from 'simple-icons';
import { I18nService } from '../core/i18n.service';
import { SayService } from '../core/say.service';

/** Brand logos from Simple Icons (CC0, bundled from npm). Colours tuned to stay visible on both themes. */
const BRAND: Record<string, { path: string; hex: string }> = {
  'Java': { path: siOpenjdk.path, hex: '#F89820' },
  'Spring Boot': { path: siSpringboot.path, hex: '#6DB33F' },
  'Angular': { path: siAngular.path, hex: '#DD0031' },
  'TypeScript': { path: siTypescript.path, hex: '#3178C6' },
  'Tailwind': { path: siTailwindcss.path, hex: '#06B6D4' },
  'Bootstrap': { path: siBootstrap.path, hex: '#7952B3' },
  'CSS': { path: siCss.path, hex: '#663399' },
  'Odoo': { path: siOdoo.path, hex: '#A24689' },
  'Docker': { path: siDocker.path, hex: '#2496ED' },
  'Kubernetes': { path: siKubernetes.path, hex: '#326CE5' },
  'Git': { path: siGit.path, hex: '#F03C2E' },
  'Python': { path: siPython.path, hex: '#3776AB' },
  'HTML': { path: siHtml5.path, hex: '#E34F26' },
  'SCSS': { path: siSass.path, hex: '#CC6699' },
  'Flutter': { path: siFlutter.path, hex: '#02569B' },
};

/** Simple drawn icons for things that have no brand logo (24x24, stroked). */
const GLYPH: Record<string, { body: string; hex: string }> = {
  'LiteLLM': { hex: '#8B5CF6', body: '<circle cx="4" cy="12" r="2.2"/><circle cx="20" cy="5" r="2.2"/><circle cx="20" cy="12" r="2.2"/><circle cx="20" cy="19" r="2.2"/><path d="M6.2 12h4.3m0 0 7.3-7m-7.3 7h7.3m-7.3 0 7.3 7"/>' },
  'Microservices': { hex: '#8FA8FF', body: '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>' },
  'Monolithic': { hex: '#9AA3CF', body: '<rect x="4" y="3" width="16" height="18" rx="3"/><path d="M8 8h8M8 12h8M8 16h5"/>' },
  'TDD': { hex: '#22C55E', body: '<circle cx="12" cy="12" r="9"/><path d="m8 12.5 2.8 2.8L16.5 9"/>' },
  'BDD': { hex: '#10B981', body: '<path d="M4 5h16v10H9l-5 4z"/><path d="m9 10 2 2 4-4"/>' },
};

interface Item { name: string; core: boolean; hex: string; svg: SafeHtml; }

/**
 * Skills as an infinite logo marquee: rows of logos drifting in alternating directions.
 * A row pauses while hovered or focused, and the guide talks about the hovered skill.
 */
@Component({
  selector: 'app-skills',
  template: `
<section id="skills" data-guide="skills">
  <div class="sh"><h2>{{ i18n.ui('skills.t') }}</h2></div>
  <p class="sk-hint">{{ i18n.ui(touch ? 'skills.hintTouch' : 'skills.hint') }}</p>
  <div class="marquees">
    @for (row of rows(); track $index; let odd = $odd) {
      <div class="marquee" [class.rev]="odd" [style.--dur]="row.length * 7 + 's'">
        <div class="track">
          @for (copy of [0, 1, 2, 3]; track copy) {
            <ul class="set" [attr.aria-hidden]="copy > 0 ? 'true' : null">
              @for (s of row; track s.name) {
                <li class="logo" [class.core]="s.core" [style.--hue]="s.hex"
                    [attr.tabindex]="copy === 0 ? 0 : -1" [attr.data-say]="say.tech(s.name)">
                  <span class="ic" [innerHTML]="s.svg"></span><span class="nm">{{ s.name }}</span>
                </li>
              }
            </ul>
          }
        </div>
      </div>
    }
  </div>
</section>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkillsComponent {
  readonly i18n = inject(I18nService);
  readonly say = inject(SayService);
  private sanitizer = inject(DomSanitizer);
  readonly touch = matchMedia('(hover: none)').matches;

  private icon(name: string): { svg: string; hex: string } {
    const b = BRAND[name];
    if (b) return { hex: b.hex, svg: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${b.path}"/></svg>` };
    const g = GLYPH[name] ?? { hex: '#8FA8FF', body: '<circle cx="12" cy="12" r="8"/>' };
    return { hex: g.hex, svg: `<svg viewBox="0 0 24 24" aria-hidden="true" class="glyph">${g.body}</svg>` };
  }

  /** Every skill once, split into three rows. The SVG markup comes from our own constants, so it is trusted. */
  readonly rows = computed<Item[][]>(() => {
    const seen = new Set<string>();
    const items: Item[] = [];
    for (const g of this.i18n.content()?.skills ?? []) {
      for (const name of g.items) {
        if (seen.has(name)) continue;
        seen.add(name);
        const { svg, hex } = this.icon(name);
        items.push({ name, core: g.core, hex, svg: this.sanitizer.bypassSecurityTrustHtml(svg) });
      }
    }
    const n = Math.ceil(items.length / 3);
    return [items.slice(0, n), items.slice(n, 2 * n), items.slice(2 * n)].filter((r) => r.length);
  });
}
