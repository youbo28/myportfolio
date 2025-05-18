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
  submitted = false;


  handleSubmit() {
    this.success = false;
    this.error = false;
    this.submitted = true;
  }

  handleIframeLoad() {
    // Only mark as success if form was submitted
    if (this.submitted) {
      this.success = true;
      this.error = false;
      this.submitted = false;

      // Optionally reset form fields manually
      const form = document.forms.namedItem('contact') as HTMLFormElement;
      form?.reset();
    }
  }


}
