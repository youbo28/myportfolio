import { Component, effect, inject, signal } from '@angular/core';
import { EducationService } from '../../services/education.service';
import { Education } from '../../models/Education';
import { CommonModule } from '@angular/common';
import { TranslocoDirective } from '@ngneat/transloco';

@Component({
  selector: 'app-education',
  standalone: true,
  imports: [CommonModule,TranslocoDirective],
  templateUrl: './education.component.html',
  styleUrl: './education.component.scss'
})
export class EducationComponent {
  readonly educationData = signal <Education[]>([]);
  private educationService = inject(EducationService);
  constructor() {
    effect( ()=>{
      this.educationService.getEducationData().subscribe((data)=>this.educationData.set(data))
    })
  }
}
