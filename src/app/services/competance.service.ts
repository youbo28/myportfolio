import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {  CategorizedCompetence} from '../models/Competance';

@Injectable({
  providedIn: 'root'
})
export class CompetanceService {
  private apiUrl = 'assets/data/competance.json'; // Path to the local JSON file

  private http = inject(HttpClient);

  getCompetences(): Observable<CategorizedCompetence[]> {
    return this.http.get<CategorizedCompetence[]>(this.apiUrl);
  }

}
