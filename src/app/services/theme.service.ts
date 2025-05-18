import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private darkClass = 'dark';
  private themeKey = 'portfolio-theme';

  constructor() {
    const saved = localStorage.getItem(this.themeKey);
    if (saved === 'dark') {
      this.enableDark();
    } else {
      this.enableLight();
    }
  }
  enableDark() {
    document.documentElement.classList.add(this.darkClass);
    localStorage.setItem(this.themeKey, 'dark');
  }
  enableLight() {
    document.documentElement.classList.remove(this.darkClass);
    localStorage.setItem(this.themeKey, 'light');
  }
  toggleTheme(): void {
    if (document.documentElement.classList.contains(this.darkClass)) {
      this.enableLight();
    } else {
      this.enableDark();
    }
  }
}
