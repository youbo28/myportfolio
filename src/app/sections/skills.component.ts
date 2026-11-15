import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { I18nService } from '../core/i18n.service';
import { SayService } from '../core/say.service';

/** Badge colour and short mark for each skill (brand-ish colours, drawn in CSS, no logos). */
const MARK: Record<string, [string, string]> = {
  'Java': ['J', '#F89820'], 'Spring Boot': ['SB', '#6DB33F'], 'Angular': ['A', '#DD0031'], 'TypeScript': ['TS', '#3178C6'],
  'Tailwind': ['Tw', '#38BDF8'], 'Bootstrap': ['B', '#7952B3'], 'CSS': ['CSS', '#2965F1'], 'Odoo': ['O', '#875A7B'],
  'Microservices': ['μS', '#8FA8FF'], 'Monolithic': ['M', '#9AA3CF'], 'Docker': ['D', '#2496ED'], 'Kubernetes': ['K8s', '#326CE5'],
  'Git': ['G', '#F05032'], 'TDD': ['T', '#22C55E'], 'BDD': ['B', '#10B981'], 'Python': ['Py', '#3776AB'],
  'HTML': ['H', '#E34F26'], 'SCSS': ['S', '#CC6699'],
};

interface Tile { name: string; group: string; core: boolean; mark: string; hue: string; }

/**
 * Skills as slowly drifting rows of tiles (a marquee). Each row repeats its tiles four times so the loop is seamless on wide screens;
 * the copies are hidden from screen readers. Rows pause while hovered so the visitor can pick a tile,
 * and the guide talks about the hovered skill.
 */
@Component({
  selector: 'app-skills',
  template: `
<section id="skills" data-guide="skills">
  <div class="sh"><span class="n">02</span><h2>{{ i18n.ui('skills.t') }}</h2></div>
  <p class="sk-hint">{{ i18n.ui(touch ? 'skills.hintTouch' : 'skills.hint') }}</p>
  <div class="marquees">
    @for (row of rows(); track $index; let odd = $odd) {
      <div class="marquee" [class.rev]="odd" [style.--dur]="row.length * 9 + 's'">
        <div class="track">
          @for (copy of [0, 1, 2, 3]; track copy) {
            <ul class="set" [attr.aria-hidden]="copy > 0 ? 'true' : null">
              @for (s of row; track s.name) {
                <li class="skill" [class.core]="s.core" [style.--hue]="s.hue"
                    [attr.tabindex]="copy === 0 ? 0 : -1" [attr.data-say]="say.tech(s.name)">
                  <span class="mark" aria-hidden="true">{{ s.mark }}</span>
                  <span class="txt"><b>{{ s.name }}</b><small>{{ s.group }}</small></span>
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
  readonly touch = matchMedia('(hover: none)').matches;

  /** Every skill once (first group wins, so core skills keep their core look), split into three rows. */
  readonly rows = computed<Tile[][]>(() => {
    const seen = new Set<string>();
    const tiles: Tile[] = [];
    for (const g of this.i18n.content()?.skills ?? []) {
      for (const name of g.items) {
        if (seen.has(name)) continue;
        seen.add(name);
        const [mark, hue] = MARK[name] ?? [name.slice(0, 2), '#8FA8FF'];
        tiles.push({ name, group: g.label, core: g.core, mark, hue });
      }
    }
    const n = Math.ceil(tiles.length / 3);
    return [tiles.slice(0, n), tiles.slice(n, 2 * n), tiles.slice(2 * n)].filter((r) => r.length);
  });
}
