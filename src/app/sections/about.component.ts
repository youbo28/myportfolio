import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { I18nService } from '../core/i18n.service';
import { SayService } from '../core/say.service';

@Component({
  selector: 'app-about',
  template: `
<section id="about" data-guide="about">
  <div class="sh"><h2>{{ i18n.ui('about.t') }}</h2></div>
  <div class="about">
    <div [innerHTML]="i18n.ui('about.p')"></div>
    <div class="facts">
      <div class="fact" [attr.data-say]="say.key('current')"><small>{{ i18n.ui('about.f1') }}</small><span>{{ i18n.ui('about.f1v') }}</span></div>
      <div class="fact" [attr.data-say]="say.key('focus')"><small>{{ i18n.ui('about.f2') }}</small><span>Java · Spring Boot · Angular</span></div>
      <div class="fact"><small>{{ i18n.ui('about.f3') }}</small><span class="spoken">@for (l of say.langs(); track l.name; let last = $last) {<span class="sl" tabindex="0" [attr.data-say]="l.say">{{ l.name }}</span>@if (!last) {<span>, </span>}}</span></div>
    </div>
  </div>
</section>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutComponent {
  readonly i18n = inject(I18nService);
  readonly say = inject(SayService);
}
