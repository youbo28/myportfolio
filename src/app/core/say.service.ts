import { Injectable, inject } from '@angular/core';
import { I18nService } from './i18n.service';
import { Edu, Job, Project } from './content';

/**
 * Builds what the guide says when the visitor hovers (or taps) something.
 * Elements carry the sentence in a `data-say` attribute; the guide picks it up.
 */
@Injectable({ providedIn: 'root' })
export class SayService {
  private i18n = inject(I18nService);

  private get h(): any {
    return this.i18n.content()?.guide['hover'];
  }

  private fill(t: string | undefined, vars: Record<string, string>): string {
    return (t ?? '').replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');
  }

  private join(items: string[]): string {
    if (items.length < 2) return items.join('');
    return `${items.slice(0, -1).join(', ')} ${this.h?.and ?? 'and'} ${items[items.length - 1]}`;
  }

  /** A fixed line, e.g. 'cv', 'email', 'github'. */
  key(k: string): string {
    return this.h?.[k] ?? '';
  }

  /** A skill or technology: a personal line for the core stack, otherwise the projects built with it. */
  tech(x: string): string {
    const h = this.h;
    if (!h) return '';
    if (h.core?.[x]) return h.core[x];
    const lx = x.toLowerCase();
    const built = (this.i18n.content()?.projects ?? [])
      .filter((p) => p.tech.some((t) => t.toLowerCase() === lx || t.toLowerCase().startsWith(lx + ' ')))
      .map((p) => p.title);
    return built.length ? this.fill(h.built, { list: this.join(built), x }) : this.fill(h.tool, { x });
  }

  job(j: Job): string {
    if (j.story) return j.story;
    return this.fill(j.now ? this.h?.jobNow : this.h?.jobPast, { role: j.role, company: j.company, date: j.date });
  }

  project(p: Project): string {
    if (p.story) return p.story;
    return this.fill(this.h?.project, { title: p.title, tech: this.join(p.tech) });
  }

  edu(e: Edu): string {
    if (e.story) return e.story;
    return this.fill(this.h?.edu, { date: e.date });
  }

  langs(): { name: string; say: string }[] {
    return this.h?.langs ?? [];
  }
}
