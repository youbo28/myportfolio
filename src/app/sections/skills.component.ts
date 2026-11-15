import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { I18nService } from '../core/i18n.service';
import { SayService } from '../core/say.service';

@Component({
  selector: 'app-skills',
  template: `
<section id="skills" data-guide="skills">
  <div class="sh"><span class="n">02</span><h2>{{ i18n.ui('skills.t') }}</h2></div>
  <div class="skills">
    @for (g of i18n.content()?.skills ?? []; track g.key) {
      <div class="sk" [class.core]="g.core">
        <h3>{{ g.label }}</h3>
        <ul class="chips">
          @for (s of g.items; track s) { <li class="chip" tabindex="0" [attr.data-say]="say.tech(s)">{{ s }}</li> }
        </ul>
      </div>
    }
  </div>
</section>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkillsComponent {
  readonly i18n = inject(I18nService);
  readonly say = inject(SayService);
}
