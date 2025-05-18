import { AfterViewInit, Component, computed, ElementRef, inject, OnInit, signal } from '@angular/core';
import { CompetanceService } from '../../services/competance.service';
import { CategorizedCompetence, Competance } from '../../models/Competance';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { TranslocoDirective } from '@ngneat/transloco';

@Component({
  selector: 'app-competance',
  standalone: true,
  imports: [CommonModule, TranslocoDirective],
  templateUrl: './competance.component.html',
  styleUrl: './competance.component.scss'
})
export class CompetanceComponent implements AfterViewInit{
  private service = inject(CompetanceService);
  private el = inject(ElementRef);
  competences = signal<CategorizedCompetence[]>([]);
  visible = signal(false);

  constructor() {
    this.service.getCompetences().subscribe(data => this.competences.set(data));
  }
  onScrollEnter() {
    this.visible.set(false); // reset to trigger animation every time
    setTimeout(() => this.visible.set(true), 50); // slight delay to restart animation
  }
   ngAfterViewInit(): void {
    this.onScrollEnter();
  }
}