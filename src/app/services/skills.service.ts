import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { observableToBeFn } from 'rxjs/internal/testing/TestScheduler';

@Injectable({
  providedIn: 'root'
})
export class SkillsService {
  private skillsUrl = 'assets/data/skills.json';
  constructor(private http: HttpClient) { }
  getSkills(): Observable<string[]>{
    return this.http.get<string[]>(this.skillsUrl);
  }
}
