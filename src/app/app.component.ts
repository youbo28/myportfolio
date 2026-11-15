import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SkyComponent } from './layout/sky.component';
import { NavBarComponent } from './layout/nav-bar.component';
import { YoutubeModalComponent } from './layout/youtube-modal.component';
import { HeroComponent } from './sections/hero.component';
import { AboutComponent } from './sections/about.component';
import { SkillsComponent } from './sections/skills.component';
import { ProjectsComponent } from './sections/projects.component';
import { ExperienceComponent } from './sections/experience.component';
import { EducationComponent } from './sections/education.component';
import { ContactComponent } from './sections/contact.component';
import { MascotComponent } from './mascot/mascot.component';
import { I18nService } from './core/i18n.service';
import { GuideService } from './core/guide.service';

@Component({
  selector: 'app-root',
  imports: [SkyComponent, NavBarComponent, YoutubeModalComponent, HeroComponent, AboutComponent, SkillsComponent,
    ProjectsComponent, ExperienceComponent, EducationComponent, ContactComponent, MascotComponent],
  template: `
<app-sky />
<app-nav-bar />
<main class="wrap" id="top">
  <app-hero />
  <app-about />
  <app-skills />
  <app-projects />
  <app-experience />
  <app-education />
  <app-contact />
  <footer>
    <span>© {{ year }} Razali Ayoub</span>
    <span><button type="button" (click)="guide.ytOpen.set(true)">{{ i18n.ui('foot.yt') }}</button></span>
  </footer>
</main>
<app-mascot />
<app-youtube-modal />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  readonly i18n = inject(I18nService);
  readonly guide = inject(GuideService);
  readonly year = new Date().getFullYear();
}
