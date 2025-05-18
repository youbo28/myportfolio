import { Component, inject } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { LangOption } from '../../models/LangOption';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './language-switcher.component.html',
  styleUrl: './language-switcher.component.scss'
})
export class LanguageSwitcherComponent {
  languages: LangOption[] = [
    { id: 'en', label: 'English' },
    { id: 'fr', label: 'Français' },
    { id: 'de', label: 'Deutsch' },
    { id: 'ar', label: 'Arabic' }
  ];

  currentLanguage: string = 'en';

  private translocoService = inject(TranslocoService);

  onChange(event: any): void {
    this.currentLanguage = event.target.value;
    this.translocoService.setActiveLang(this.currentLanguage);
    const dir = this.currentLanguage === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.setAttribute('dir', dir);
  }

  text(key: string): string {
    return this.translocoService.translate(key);
  }
}