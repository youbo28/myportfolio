import { Component, inject } from '@angular/core';
import { ContactFormData } from '../../models/ContactForm';
import { ContactMeService } from '../../services/contact-me.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslocoDirective } from '@ngneat/transloco';

@Component({
  selector: 'app-contact-me',
  standalone: true,
  imports: [CommonModule, FormsModule,TranslocoDirective],
  templateUrl: './contact-me.component.html',
  styleUrls: ['./contact-me.component.scss'],  // fixed typo here
})
export class ContactMeComponent {
  success = false;
  error = false;
    async onSubmit(event: Event) {
    event.preventDefault();

    this.success = false;
    this.error = false;

    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    try {
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData as any).toString(),
      });

      if (response.ok) {
        this.success = true;
        form.reset(); // clear form
      } else {
        this.error = true;
      }
    } catch {
      this.error = true;
    }
  }

}
