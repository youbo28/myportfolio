import { ChangeDetectionStrategy, Component, DestroyRef, afterNextRender, effect, inject } from '@angular/core';
import { I18nService } from '../core/i18n.service';
import { ThemeService } from '../services/theme.service';
import { GuideService } from '../core/guide.service';
import type { GuideApi } from './guide.engine';
import { ChatUiService } from '../chat/chat-ui.service';
import { ChatService } from '../chat/chat.service';

/**
 * The 3D guide. three.js and the engine load in their own chunk after the page is up.
 * The guide is also the chat: #guide-hit is a real button the engine keeps on top of it.
 */
@Component({
  selector: 'app-mascot',
  template: `
<canvas id="guide3d" aria-hidden="true"></canvas>
<button id="guide-hit" type="button" (click)="chat.toggle()" [attr.aria-label]="i18n.ui('chat.open')"
  [attr.aria-expanded]="chat.open()" aria-controls="chat-panel"></button>
<div id="bubble" role="status" aria-live="polite"><span id="btext"></span><button id="hide" type="button" [attr.aria-label]="i18n.ui('guide.hide')">×</button></div>
<button id="recall" type="button" hidden [attr.aria-label]="i18n.ui('guide.show')"><svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true"><path d="M14.5 3a9 9 0 1 0 6.4 13.3A7.2 7.2 0 0 1 14.5 3Z" fill="currentColor"/></svg></button>
<div id="horizon" aria-hidden="true"><div class="fill"></div></div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MascotComponent {
  readonly i18n = inject(I18nService);
  readonly chat = inject(ChatUiService);
  private conversation = inject(ChatService);
  private theme = inject(ThemeService);
  private guide = inject(GuideService);
  private api?: GuideApi;

  constructor() {
    inject(DestroyRef).onDestroy(() => { this.stopListening?.(); this.stopNudge?.(); this.api?.destroy(); });

    // The guide is the chat: while it's open, it flies to the panel and sits there.
    effect(() => {
      const open = this.chat.open();
      if (!this.api) return;
      if (!open) { this.api.undock(); return; }
      const waitForPanel = () => {
        const panel = document.querySelector('.chat');
        if (panel) this.api?.dock(panel);
        else if (this.chat.open()) requestAnimationFrame(waitForPanel);
      };
      waitForPanel();
    });

    // While an answer is typed out in the chat, the guide's mouth moves.
    effect(() => {
      this.conversation.messages();
      if (this.conversation.status() === 'typing') this.api?.talk();
    });

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
        this.nudgeAtContact(this.api);
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
    document.addEventListener('focusout', (e) => {
      const el = find(e.target);
      if (el && !(e.relatedTarget instanceof Node && el.contains(e.relatedTarget))) api.hoverEnd(el);
    }, opts);
    // phones have no hover: a tap on something that isn't a link makes it talk
    document.addEventListener('click', (e) => {
      if (!matchMedia('(hover: none)').matches) return;
      const el = find(e.target);
      if (el && !(e.target instanceof Element && e.target.closest('a,button,input,textarea'))) api.hoverSay(el, text(el), 6000);
    }, opts);
    this.stopListening = () => ac.abort();
  }
  private stopListening?: () => void;

  /**
   * A visitor who reaches Contact without ever opening the chat gets one nudge per visit:
   * the guide comes to the mouse, waves and says it can chat.
   */
  private nudgeAtContact(api: GuideApi): void {
    const KEY = 'chat-nudged';
    const contact = document.getElementById('contact');
    if (!contact || !('IntersectionObserver' in window)) return;
    const seen = () => { try { return sessionStorage.getItem(KEY) === '1'; } catch { return false; } };
    const io = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      if (this.chat.used() || seen()) { io.disconnect(); return; }
      api.nudge(this.i18n.ui('chat.nudge'));
      try { sessionStorage.setItem(KEY, '1'); } catch {}
      io.disconnect();
    }, { threshold: 0.35 });
    io.observe(contact);
    this.stopNudge = () => io.disconnect();
  }
  private stopNudge?: () => void;
}
