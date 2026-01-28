import {
  Component,
  OnInit,
  HostListener,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { TranslocoModule } from '@ngneat/transloco';

interface Firework {
  id: number;
  x: number;
  y: number;
  color: string;
  particles: Particle[];
}

interface Particle {
  id: number;
  tx: number;
  ty: number;
}

@Component({
  selector: 'app-youtube-modal',
  standalone: true,
  imports: [CommonModule, TranslocoModule],
  templateUrl: './youtube-modal.component.html',
  styleUrls: ['./youtube-modal.component.scss'],
  animations: [
    trigger('modalAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.7)' }),
        animate(
          '300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          style({ opacity: 1, transform: 'scale(1)' }),
        ),
      ]),
      transition(':leave', [
        animate(
          '200ms ease-out',
          style({ opacity: 0, transform: 'scale(0.7)' }),
        ),
      ]),
    ]),
    trigger('backdropAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease-out', style({ opacity: 1 })),
      ]),
      transition(':leave', [animate('200ms ease-out', style({ opacity: 0 }))]),
    ]),
  ],
})
export class YoutubeModalComponent implements OnInit {
  isVisible = false;
  fireworks: Firework[] = [];
  confetti: any[] = [];
  sparkles: any[] = [];
  private readonly STORAGE_KEY = 'youtube-modal-shown';
  private fireworkInterval: any;
  private confettiInterval: any;

  ngOnInit() {
    // Check if modal has been shown before
    const hasBeenShown = localStorage.getItem(this.STORAGE_KEY);

    if (!hasBeenShown) {
      // Show modal immediately
      setTimeout(() => {
        this.isVisible = true;
        this.startFireworks();
        this.startConfetti();
      }, 100);
    }
  }

  startFireworks() {
    // Launch fireworks at intervals
    this.launchFirework();

    this.fireworkInterval = setInterval(() => {
      this.launchFirework();
    }, 800);

    // Stop after 8 seconds
    setTimeout(() => {
      if (this.fireworkInterval) {
        clearInterval(this.fireworkInterval);
      }
    }, 8000);
  }

  launchFirework() {
    // Spring Boot / LEAF CODE themed colors (more green focus)
    const colors = [
      'firework-green',
      'firework-yellow',
      'firework-green',
      'firework-blue',
      'firework-green',
      'firework-orange',
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    // Random position
    const x = Math.random() * 80 + 10; // 10% to 90%
    const y = Math.random() * 60 + 10; // 10% to 70%

    // Create particles for explosion
    const particles: Particle[] = [];
    const particleCount = 20;

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const velocity = 80 + Math.random() * 40;
      particles.push({
        id: i,
        tx: Math.cos(angle) * velocity,
        ty: Math.sin(angle) * velocity,
      });
    }

    const firework: Firework = {
      id: Date.now() + Math.random(),
      x,
      y,
      color: randomColor,
      particles,
    };

    this.fireworks.push(firework);

    // Add sparkles at firework center
    this.addSparkles(x, y);

    // Remove firework after animation completes
    setTimeout(() => {
      this.fireworks = this.fireworks.filter((f) => f.id !== firework.id);
    }, 1500);
  }

  addSparkles(x: number, y: number) {
    for (let i = 0; i < 5; i++) {
      const sparkle = {
        id: Date.now() + Math.random(),
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
      };

      this.sparkles.push(sparkle);

      setTimeout(() => {
        this.sparkles = this.sparkles.filter((s) => s.id !== sparkle.id);
      }, 1000);
    }
  }

  startConfetti() {
    // Spring Boot / LEAF CODE themed colors (more green focus)
    const colors = [
      '#00ff88',
      '#6fd943',
      '#ffff00',
      '#00d4ff',
      '#8bc34a',
      '#cddc39',
    ];

    // Create initial burst of confetti
    for (let i = 0; i < 30; i++) {
      setTimeout(() => {
        this.createConfetti(colors);
      }, i * 50);
    }

    // Continue creating confetti for a few seconds
    this.confettiInterval = setInterval(() => {
      this.createConfetti(colors);
    }, 300);

    // Stop after 5 seconds
    setTimeout(() => {
      if (this.confettiInterval) {
        clearInterval(this.confettiInterval);
      }
    }, 5000);
  }

  createConfetti(colors: string[]) {
    const confetti = {
      id: Date.now() + Math.random(),
      x: Math.random() * 100,
      y: -10,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      delay: Math.random() * 0.5,
    };

    this.confetti.push(confetti);

    setTimeout(() => {
      this.confetti = this.confetti.filter((c) => c.id !== confetti.id);
    }, 3000);
  }

  closeModal() {
    this.isVisible = false;
    // Clear intervals
    if (this.fireworkInterval) {
      clearInterval(this.fireworkInterval);
    }
    if (this.confettiInterval) {
      clearInterval(this.confettiInterval);
    }
    // Mark as shown in localStorage
    localStorage.setItem(this.STORAGE_KEY, 'true');
  }

  onBackdropClick(event: MouseEvent) {
    // Close modal when clicking on backdrop (outside the modal content)
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  @HostListener('document:keydown.escape')
  onEscapeKey() {
    // Allow closing with Escape key
    if (this.isVisible) {
      this.closeModal();
    }
  }

  visitYouTube() {
    this.closeModal();
    window.open('https://www.youtube.com/@ayoubrazali2484', '_blank');
  }

  ngOnDestroy() {
    // Cleanup intervals
    if (this.fireworkInterval) {
      clearInterval(this.fireworkInterval);
    }
    if (this.confettiInterval) {
      clearInterval(this.confettiInterval);
    }
  }
}
