import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { I18nService } from '../core/i18n.service';
import { SayService } from '../core/say.service';

/** Projects whose image is a tall title poster (no UI to screenshot): crop to the middle, not the top. */
const POSTERS = new Set(['loan', 'movies', 'library']);

@Component({
  selector: 'app-projects',
  template: `
<section id="projects" data-guide="projects">
  <div class="sh"><h2>{{ i18n.ui('projects.t') }}</h2></div>
  <div class="projects">
    @for (p of i18n.content()?.projects ?? []; track p.id) {
      <article class="pj" [id]="'pj-' + p.id" [attr.data-say]="say.project(p)">
        <a class="cover" [href]="p.live || p.gh" target="_blank" rel="noopener" tabindex="-1" aria-hidden="true">
          <img [src]="'assets/projects/' + p.id + '.webp'" alt="" loading="lazy" decoding="async"
               [class.poster]="posters.has(p.id)">
        </a>
        <div class="body">
          <h3>{{ p.title }}</h3>
          <p>{{ p.desc }}</p>
          <div class="tech">@for (t of p.tech; track t) { <span [attr.data-say]="say.tech(t)">{{ t }}</span> }</div>
          <div class="pl">
            @if (p.gh) { <a [href]="p.gh" target="_blank" rel="noopener">{{ i18n.ui('site') }} ↗</a> }
            @if (p.live) { <a [href]="p.live" target="_blank" rel="noopener">{{ i18n.ui('live') }} ↗</a> }
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
  readonly say = inject(SayService);
  readonly posters = POSTERS;
}
