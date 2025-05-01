import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'My-portfolio';
  currentTime: string = '';
  countdown: string = '';

  // Set your target date (for example: 1st June 2025)
  targetDate = new Date('2025-06-01T00:00:00').getTime();

  ngOnInit() {
    // Update countdown every second
    setInterval(() => {
      const now = new Date().getTime();
      const timeLeft = this.targetDate - now;

      if (timeLeft <= 0) {
        this.countdown = 'Time’s up!';
      } else {
        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

        this.countdown = `${days}d ${hours}h ${minutes}m ${seconds}s`;
      }
    }, 1000);
  }
  cheerButton(event: any) {
    // Add the sparkle effect on click
    const button = event.target;
    const sparklesContainer = button.querySelector('.sparkles');

    // Create a sparkle element
    const sparkle = document.createElement('div');
    sparkle.classList.add('sparkle');
    
    // Position the sparkle at a random spot within the button
    sparkle.style.top = `${Math.random() * 100}%`;
    sparkle.style.left = `${Math.random() * 100}%`;

    // Add the sparkle to the container
    sparklesContainer.appendChild(sparkle);

    // Remove the sparkle after animation completes (1 second)
    setTimeout(() => {
      sparkle.remove();
    }, 1000);
  }

}
