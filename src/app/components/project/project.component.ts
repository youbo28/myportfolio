import { Component, effect, inject, signal, Signal } from '@angular/core';
import { Project } from '../../models/Project';
import { ProjectService } from '../../services/project.service';
import { CommonModule } from '@angular/common';
import { TranslocoDirective } from '@ngneat/transloco';

@Component({
  selector: 'app-project',
  standalone: true,
  imports: [CommonModule,TranslocoDirective],
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
