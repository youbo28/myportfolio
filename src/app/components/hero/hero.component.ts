import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TranslocoDirective, TranslocoService } from '@ngneat/transloco';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule,TranslocoDirective],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss'
})
export class HeroComponent {
  greetingHtml = '';
  texts: string[] = [];
  currentText = '';
  private textIndex = 0;
  private charIndex = 0;
  private isDeleting = false;
  private typingSpeed = 100;
  private pauseDuration = 2000;
  constructor(private translocoService: TranslocoService) {}

  

  ngOnInit() {
    this.loadTexts();
  }

  loadTexts() {
    this.translocoService.selectTranslateObject('hero.typewriter').subscribe(translations => {
      this.texts = [translations.line1, translations.line2, translations.line3];
      this.typeWriter();
    });
  }

  typeWriter() {
    const fullText = this.texts[this.textIndex];

    if (!this.isDeleting) {
      this.currentText = fullText.substring(0, this.charIndex + 1);
      this.charIndex++;

      if (this.charIndex === fullText.length) {
        this.isDeleting = true;
        setTimeout(() => this.typeWriter(), this.pauseDuration);
        return;
      }
    } else {
      this.currentText = fullText.substring(0, this.charIndex - 1);
      this.charIndex--;

      if (this.charIndex === 0) {
        this.isDeleting = false;
        this.textIndex = (this.textIndex + 1) % this.texts.length;
      }
    }

    setTimeout(() => this.typeWriter(), this.isDeleting ? this.typingSpeed / 2 : this.typingSpeed);
  }
}
