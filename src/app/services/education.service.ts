import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Education } from '../models/Education';

@Injectable({
  providedIn: 'root'
})
export class EducationService {
    private apiUrl = 'assets/data/education.json'; // Path to the local JSON file

  constructor(private http: HttpClient) { }
  getEducationData(): Observable<Education[]> {
    return this.http.get<Education[]>(this.apiUrl)
  }

}
