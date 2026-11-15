import { Component, effect, inject, signal } from '@angular/core';
import { EducationService } from '../../services/education.service';
import { Education } from '../../models/Education';

import { TranslocoDirective } from '@jsverse/transloco';

@Component({
    selector: 'app-education',
    imports: [TranslocoDirective],
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
