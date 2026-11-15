import { Injectable, inject, signal } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { Content, Lang } from './content';

const KEY = 'portfolio-lang';
const LANGS: Lang[] = ['en', 'fr', 'de', 'ar'];

/** Active language + the whole translation file for it (UI strings, content and guide lines). */
@Injectable({ providedIn: 'root' })
export class I18nService {
  private transloco = inject(TranslocoService);
  readonly langs = LANGS;
  readonly lang = signal<Lang>(this.initial());
  readonly content = signal<Content | null>(null);

  constructor() {
    this.use(this.lang());
  }

  use(lang: Lang): void {
    try { localStorage.setItem(KEY, lang); } catch {}
    const root = document.documentElement;
    root.lang = lang;
    root.dir = lang === 'ar' ? 'rtl' : 'ltr';
    this.transloco.setActiveLang(lang);
    this.transloco.load(lang).subscribe((c) => {
      if (this.transloco.getActiveLang() === lang) {
        this.content.set(c as unknown as Content);
        this.lang.set(lang);
      }
    });
  }

  ui(key: string): string {
    return this.content()?.ui[key] ?? '';
  }

  private initial(): Lang {
    let saved: string | null = null;
    try { saved = localStorage.getItem(KEY); } catch {}
    return (LANGS as string[]).includes(saved ?? '') ? (saved as Lang) : 'en';
  }
}
