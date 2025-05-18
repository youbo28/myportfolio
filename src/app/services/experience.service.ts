import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Experience } from '../models/Experience';

@Injectable({
  providedIn: 'root'
})
export class ExperienceService {
  private apiUrl = 'assets/data/experience.json'; // Path to the local JSON file

  constructor(private http: HttpClient) { }
  getExperienceData(): Observable<Experience[]> {
    return this.http.get<Experience[]>(this.apiUrl);
  }
}
