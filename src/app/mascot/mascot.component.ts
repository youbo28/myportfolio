import { ChangeDetectionStrategy, Component, DestroyRef, afterNextRender, effect, inject } from '@angular/core';
import { I18nService } from '../core/i18n.service';
import { ThemeService } from '../services/theme.service';
import { GuideService } from '../core/guide.service';
import type { GuideApi } from './guide.engine';

/** The 3D guide. three.js and the engine load in their own chunk after the page is up. */
@Component({
  selector: 'app-mascot',
  template: `
<canvas id="guide3d" aria-hidden="true"></canvas>
<div id="bubble" role="status" aria-live="polite"><span id="btext"></span><button id="hide" type="button" [attr.aria-label]="i18n.ui('guide.hide')">×</button></div>
<button id="recall" type="button" hidden [attr.aria-label]="i18n.ui('guide.show')"><svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true"><path d="M14.5 3a9 9 0 1 0 6.4 13.3A7.2 7.2 0 0 1 14.5 3Z" fill="currentColor"/></svg></button>
<div id="horizon" aria-hidden="true"><div class="fill"></div></div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MascotComponent {
  readonly i18n = inject(I18nService);
  private theme = inject(ThemeService);
  private guide = inject(GuideService);
  private api?: GuideApi;

  constructor() {
    inject(DestroyRef).onDestroy(() => { this.stopListening?.(); this.api?.destroy(); });

    // A new language: the guide re-reads its lines and looks surprised.
    effect(() => {
      this.i18n.content();
      this.api?.relabel();
    });

    afterNextRender(async () => {
      const { createGuide } = await import('./guide.engine');
      const start = () => {
        if (!this.i18n.content()) { setTimeout(start, 50); return; }
        this.api = createGuide({
          getLang: () => this.i18n.lang(),
          getContent: () => this.i18n.content(),
          mode: () => this.theme.mode(),
          applyTheme: (next) => this.theme.apply(next),
        });
        this.theme.registerSwitcher((next) => this.api!.switchTheme(next));
        this.guide.connect(this.api);
        this.listenForHover(this.api);
      };
      start();
    });
  }

  /**
   * Companion mode: when the visitor rests the mouse on (or focuses, or taps) something
   * marked with data-say, the guide points at it and talks about it.
   */
  private listenForHover(api: GuideApi): void {
    const find = (t: EventTarget | null) => (t instanceof Element ? t.closest('[data-say]') : null);
    const text = (el: Element) => el.getAttribute('data-say') ?? '';
    let timer: ReturnType<typeof setTimeout> | undefined;
    let last: Element | null = null;
    const ac = new AbortController();
    const opts = { signal: ac.signal, passive: true } as const;

    document.addEventListener('pointerover', (e) => {
      if (e.pointerType === 'touch') return;
      const el = find(e.target);
      if (!el || el === last) return;
      last = el;
      clearTimeout(timer);
      // wait for the mouse to settle so passing over things doesn't make it chatter
      timer = setTimeout(() => api.hoverSay(el, text(el)), 350);
    }, opts);
    document.addEventListener('pointerout', (e) => {
      const el = find(e.target);
      if (!el || (e.relatedTarget instanceof Node && el.contains(e.relatedTarget))) return;
      clearTimeout(timer);
      api.hoverEnd(el);
      if (last === el) last = null;
    }, opts);
    // keyboard users get the same companion
    document.addEventListener('focusin', (e) => {
      const el = find(e.target);
      if (el) api.hoverSay(el, text(el));
    }, opts);
    // phones have no hover: a tap on something that isn't a link makes it talk
    document.addEventListener('click', (e) => {
      if (!matchMedia('(hover: none)').matches) return;
      const el = find(e.target);
      if (el && !(e.target instanceof Element && e.target.closest('a,button,input,textarea'))) api.hoverSay(el, text(el));
    }, opts);
    this.stopListening = () => ac.abort();
  }
  private stopListening?: () => void;
}
