import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ContactFormData } from '../models/ContactForm';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ContactMeService {
  private http = inject(HttpClient);
  // Netlify functions live under /.netlify/functions/your-function-name
  private apiUrl = '/.netlify/functions/sendEmail';

  sendEmail(data: ContactFormData): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

}
