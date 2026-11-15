import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { I18nService } from '../core/i18n.service';
import { SayService } from '../core/say.service';

@Component({
  selector: 'app-education',
  template: `
<section id="education" data-guide="education">
  <div class="sh"><span class="n">05</span><h2>{{ i18n.ui('edu.t') }}</h2></div>
  <div class="edu">
    @for (e of i18n.content()?.edu ?? []; track $index) {
      <div class="ed" [attr.data-say]="say.edu(e)"><time>{{ e.date }}</time><h3>{{ e.title }}</h3><p>{{ e.desc }}</p></div>
    }
  </div>
</section>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EducationComponent {
  readonly i18n = inject(I18nService);
  readonly say = inject(SayService);
}
