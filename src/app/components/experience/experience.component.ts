import { Component, effect, inject, signal } from '@angular/core';
import { ExperienceService } from '../../services/experience.service';
import { Experience } from '../../models/Experience';
import { CommonModule } from '@angular/common';
import { TranslocoDirective } from '@ngneat/transloco';

@Component({
  selector: 'app-experience',
  standalone: true,
  imports: [CommonModule,TranslocoDirective],
  templateUrl: './experience.component.html',
  styleUrl: './experience.component.scss'
})
export class ExperienceComponent {
    readonly experienceData = signal <Experience[]>([]);
  
  private experienceService = inject(ExperienceService);
  constructor(){
    effect(()=>{
      this.experienceService.getExperienceData().subscribe((data)=>this.experienceData.set(data))
    })
  }
}
