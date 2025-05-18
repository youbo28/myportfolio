import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslocoDirective } from '@ngneat/transloco';
import { LanguageSwitcherComponent } from "./components/language-switcher/language-switcher.component";
import { NavBarComponent } from "./components/nav-bar/nav-bar.component";
import { HeroComponent } from "./components/hero/hero.component";
import { AboutMeComponent } from "./components/about-me/about-me.component";
import { EducationComponent } from "./components/education/education.component";
import { ExperienceComponent } from "./components/experience/experience.component";
import { ProjectComponent } from "./components/project/project.component";
import { CompetanceComponent } from "./components/competance/competance.component";
import { ContactMeComponent } from "./components/contact-me/contact-me.component";


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TranslocoDirective, LanguageSwitcherComponent, NavBarComponent, HeroComponent, AboutMeComponent, EducationComponent, ExperienceComponent, ProjectComponent, CompetanceComponent, ContactMeComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  // Set your target date (for example: 1st June 2025)

  ngOnInit() {
   
  }

}
