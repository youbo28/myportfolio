import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, signal } from '@angular/core';
import { I18nService } from '../core/i18n.service';
import { LINKS } from '../core/content';

@Component({
  selector: 'app-hero',
  template: `
<div class="hero" data-guide="hero">
  <div>
    <span class="kicker"><b></b><span>{{ i18n.ui('hero.kicker') }}</span></span>
    <h1><span>{{ i18n.ui('hero.h1a') }}&#32;</span><span class="soft">{{ i18n.ui('hero.h1b') }}</span></h1>
    <p class="role" [innerHTML]="i18n.ui('hero.role')"></p>
    <div class="type" aria-hidden="true">{{ typed() }}</div>
    <div class="ctas">
      <a class="btn primary" [href]="links.cv" target="_blank" rel="noopener">{{ i18n.ui('hero.cv') }}</a>
      <a class="btn" href="#contact">{{ i18n.ui('hero.contact') }}</a>
    </div>
  </div>
  <div class="home" id="home" aria-hidden="true">
    <div class="orbit"></div><div class="orbit o2"></div>
    <span class="chipf" style="top:4%;inset-inline-start:60%">&#64;Spring Boot</span>
    <span class="chipf" style="top:48%;inset-inline-start:-8%">&lt;Angular/&gt;</span>
    <span class="chipf" style="bottom:6%;inset-inline-start:48%">java 21</span>
  </div>
</div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroComponent {
  readonly i18n = inject(I18nService);
  readonly links = LINKS;
  readonly typed = signal('');
  private timer?: ReturnType<typeof setTimeout>;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
    effect(() => this.start(this.i18n.content()?.type ?? []));
  }

  /** Typewriter: types each line, waits, deletes it, moves to the next. */
  private start(lines: string[]): void {
    clearTimeout(this.timer);
    if (!lines.length) return;
    if (matchMedia('(prefers-reduced-motion:reduce)').matches) { this.typed.set(lines[0]); return; }
    let li = 0, ci = 0, del = false;
    const tick = () => {
      const s = lines[li];
      this.typed.set(s.slice(0, ci));
      if (!del && ci < s.length) { ci++; this.timer = setTimeout(tick, 45); }
      else if (!del) { del = true; this.timer = setTimeout(tick, 1800); }
      else if (ci > 0) { ci--; this.timer = setTimeout(tick, 22); }
      else { del = false; li = (li + 1) % lines.length; this.timer = setTimeout(tick, 300); }
    };
    tick();
  }
}
