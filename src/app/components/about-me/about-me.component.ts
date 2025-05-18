import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { OnSameUrlNavigation } from '@angular/router';
import { SkillsService } from '../../services/skills.service';
import { CommonModule } from '@angular/common';
import { TranslocoDirective } from '@ngneat/transloco';

@Component({
  selector: 'app-about-me',
  standalone: true,
  imports: [CommonModule,TranslocoDirective],
  templateUrl: './about-me.component.html',
  styleUrl: './about-me.component.scss'
})
export class AboutMeComponent {
  readonly skills = signal<string[]>([]);
  private skillsService = inject(SkillsService);
  constructor() {
    effect(() => {
      this.skillsService.getSkills().subscribe((data) => this.skills.set(data))
    })
  }
colorClasses = [
  { bg: 'bg-blue-100', text: 'text-blue-800' },
  { bg: 'bg-green-100', text: 'text-green-800' },
  { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  { bg: 'bg-purple-100', text: 'text-purple-800' },
  { bg: 'bg-pink-100', text: 'text-pink-800' },
  { bg: 'bg-red-100', text: 'text-red-800' },
  { bg: 'bg-indigo-100', text: 'text-indigo-800' },
  { bg: 'bg-orange-100', text: 'text-orange-800' },
  { bg: 'bg-teal-100', text: 'text-teal-800' },
  { bg: 'bg-cyan-100', text: 'text-cyan-800' },
  { bg: 'bg-lime-100', text: 'text-lime-800' },
  { bg: 'bg-emerald-100', text: 'text-emerald-800' },
  { bg: 'bg-amber-100', text: 'text-amber-800' },
  { bg: 'bg-rose-100', text: 'text-rose-800' },
  { bg: 'bg-fuchsia-100', text: 'text-fuchsia-800' },
  { bg: 'bg-violet-100', text: 'text-violet-800' },
  { bg: 'bg-sky-100', text: 'text-sky-800' }
];

  getColorClass(index: number): string {
    const color = this.colorClasses[index % this.colorClasses.length];
    return `${color.bg} ${color.text}`
  }
}
