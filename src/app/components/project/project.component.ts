import { Component, effect, inject, signal, Signal } from '@angular/core';
import { Project } from '../../models/Project';
import { ProjectService } from '../../services/project.service';

import { TranslocoDirective } from '@jsverse/transloco';

@Component({
    selector: 'app-project',
    imports: [TranslocoDirective],
    templateUrl: './project.component.html',
    styleUrl: './project.component.scss'
})
export class ProjectComponent {
  readonly projects= signal   <Project[]>([]);
  private projectService=inject(ProjectService)
  constructor(){
    effect(()=>{
      this.projectService.getProjects().subscribe((data)=> this.projects.set(data))
    })
  }
}
