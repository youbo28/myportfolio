import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { I18nService } from '../core/i18n.service';
import { SayService } from '../core/say.service';

@Component({
  selector: 'app-experience',
  template: `
<section id="experience" data-guide="experience">
  <div class="sh"><h2>{{ i18n.ui('exp.t') }}</h2></div>
  <ol class="tl">
    @for (j of i18n.content()?.jobs ?? []; track $index) {
      <li class="job" [class.now]="j.now" [attr.data-say]="say.job(j)">
        <time>{{ j.date }}</time>
        <div>
          <h3>{{ j.role }}@if (j.now) {<span class="now-tag">{{ i18n.content()?.now }}</span>}</h3>
          <div class="co">{{ j.company }}</div>
          <p>{{ j.desc }}</p>
        </div>
      </li>
    }
  </ol>
</section>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExperienceComponent {
  readonly i18n = inject(I18nService);
  readonly say = inject(SayService);
}
