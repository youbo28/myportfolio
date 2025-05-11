import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TranslocoDirective } from '@ngneat/transloco';
import { LanguageSwitcherComponent } from "../language-switcher/language-switcher.component";

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [CommonModule, TranslocoDirective, LanguageSwitcherComponent],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.scss'
})
export class NavBarComponent {
  navItems = [
    { icon: 'fa-house', label: 'nav.home', href: '#home' },
    { icon: 'fa-user', label: 'nav.about', href: '#about' },
    { icon: 'fa-gift', label: 'nav.projects', href: '#projects' },
    { icon: 'fa-code', label: 'nav.skills', href: '#skills' },
    { icon: 'fa-envelope', label: 'nav.contact', href: '#contact' },
    { icon: 'fa-file-lines', label: 'nav.resume', href: '#resume' }
  ];

  currentSection: string = 'nav.home';

  scrollToSection(item: string) {
    this.currentSection = item;
    const sectionId = item.split('.')[1]; // "home", "about", etc.
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
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
