import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { I18nService } from '../core/i18n.service';
import { ThemeService } from '../services/theme.service';
import { LINKS } from '../core/content';

@Component({
  selector: 'app-nav-bar',
  template: `
<header><div class="wrap nav">
  <a class="brand" href="#top"><i></i>Razali Ayoub</a>
  <nav class="links" [class.open]="menu()" [attr.aria-label]="i18n.ui('nav.menu')" (click)="menu.set(false)">
    <a href="#about">{{ i18n.ui('nav.about') }}</a>
    <a href="#skills">{{ i18n.ui('nav.skills') }}</a>
    <a href="#projects">{{ i18n.ui('nav.projects') }}</a>
    <a href="#experience">{{ i18n.ui('nav.experience') }}</a>
    <a href="#contact">{{ i18n.ui('nav.contact') }}</a>
    <div class="lang lang-m" role="group" [attr.aria-label]="i18n.ui('lang')" (click)="$event.stopPropagation()">
      @for (l of i18n.langs; track l) {
        <button type="button" [attr.aria-pressed]="i18n.lang() === l" (click)="i18n.use(l); menu.set(false)">{{ l.toUpperCase() }}</button>
      }
    </div>
  </nav>
  <div class="tools">
    <div class="lang lang-d" role="group" [attr.aria-label]="i18n.ui('lang')">
      @for (l of i18n.langs; track l) {
        <button type="button" [attr.aria-pressed]="i18n.lang() === l" (click)="i18n.use(l)">{{ l.toUpperCase() }}</button>
      }
    </div>
    <button type="button" class="pill theme" (click)="theme.toggle()"
      [attr.aria-label]="theme.mode() === 'dark' ? i18n.ui('light') : i18n.ui('dark')">
      @if (theme.mode() === 'dark') {
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
      } @else {
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M14.5 3a9 9 0 1 0 6.4 13.3A7.2 7.2 0 0 1 14.5 3Z" fill="currentColor"/></svg>
      }
    </button>
    <a class="pill cv" [href]="links.cv" target="_blank" rel="noopener">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 4v11m0 0-4-4m4 4 4-4M5 20h14"/></svg><span>{{ i18n.ui('nav.resume') }}</span>
    </a>
    <button type="button" class="pill menu-btn" [attr.aria-expanded]="menu()" [attr.aria-label]="i18n.ui('nav.menu')" (click)="menu.set(!menu())">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
    </button>
  </div>
</div></header>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavBarComponent {
  readonly i18n = inject(I18nService);
  readonly theme = inject(ThemeService);
  readonly links = LINKS;
  readonly menu = signal(false);
}
