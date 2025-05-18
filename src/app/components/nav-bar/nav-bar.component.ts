import { CommonModule } from '@angular/common';
import { Component, HostListener, inject } from '@angular/core';
import { TranslocoDirective } from '@ngneat/transloco';
import { LanguageSwitcherComponent } from "../language-switcher/language-switcher.component";
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [CommonModule, TranslocoDirective, LanguageSwitcherComponent],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.scss'
})
export class NavBarComponent {
  public themeService = inject(ThemeService);

  navItems = [
    { icon: 'fa-house', label: 'nav.home', href: '#home' },
    { icon: 'fa-user', label: 'nav.about', href: '#about' },
    { icon: 'fa-project-diagram', label: 'nav.projects', href: '#projects' },
    { icon: 'fa-briefcase', label: 'nav.experience', href: '#experience' },
    { icon: 'fa-graduation-cap', label: 'nav.education', href: '#education' },
    { icon: 'fa-envelope', label: 'nav.contact', href: '#contact' },
    { icon: 'fa-file-lines', label: 'nav.resume', href: 'https://drive.google.com/file/d/1ucq3uOuMHMxDRxRFfX7oy3XTGdMYhkS3/view?usp=drive_link' }
  ];

  currentSection: string = 'nav.home';
  @HostListener('window:scroll', [])
  onWindowScroll() {
    const offset = 100; // adjust as needed
    for (const item of this.navItems) {
      if (!item.href.startsWith('#')) continue;

      const section = document.querySelector(item.href);
      if (section) {
        const top = (section as HTMLElement).offsetTop;
        const height = (section as HTMLElement).offsetHeight;

        if (window.scrollY + offset >= top && window.scrollY < top + height) {
          this.currentSection = item.label;
          break;
        }
      }
    }
  }

  scrollToSection(label: string): void {
    const item = this.navItems.find(i => i.label === label);
    if (!item) return;

    const href = item.href;

    if (href.startsWith('http')) {
      window.open(href, '_blank');
    } else if (href.startsWith('#')) {
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        this.currentSection = label; // Update active section
        this.toggleMobile(false);
      }
    }
  }
  activeItem() {
    return this.currentSection;
  }

  toggleMobile(open: boolean) {
    const openBtn = document.getElementById('nav__toggle-open');
    const closeBtn = document.getElementById('nav__toggle-close');
    const menu = document.getElementById('mobile-nav');
    if (open) {
      openBtn?.classList.add('hidden');
      closeBtn?.classList.remove('hidden');
      menu?.classList.remove('hidden');
    } else {
      openBtn?.classList.remove('hidden');
      closeBtn?.classList.add('hidden');
      menu?.classList.add('hidden');
    }
  }
}
