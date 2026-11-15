import { Injectable, signal } from '@angular/core';
import { Mode } from '../core/content';

const KEY = 'portfolio-theme';

/** Light (dawn) / dark (night) theme. The guide can take over the switch to play the sunset/moonrise. */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly mode = signal<Mode>(this.initial());
  private switcher?: (next: Mode) => boolean;

  constructor() {
    this.apply(this.mode());
  }

  apply(mode: Mode): void {
    const root = document.documentElement;
    root.dataset['theme'] = mode;
    root.dataset['mode'] = mode;
    try { localStorage.setItem(KEY, mode); } catch {}
    this.mode.set(mode);
  }

  /** Lets the guide animate the change; it calls apply() at the right moment. */
  registerSwitcher(fn: (next: Mode) => boolean): void {
    this.switcher = fn;
  }

  toggle(): void {
    const next: Mode = this.mode() === 'dark' ? 'light' : 'dark';
    if (!this.switcher?.(next)) this.apply(next);
  }

  private initial(): Mode {
    let saved: string | null = null;
    try { saved = localStorage.getItem(KEY); } catch {}
    if (saved === 'dark' || saved === 'light') return saved;
    return matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
}
