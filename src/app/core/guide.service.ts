import { Injectable, signal } from '@angular/core';

/** Bridge so any section can make the guide react (e.g. copy email -> joy). */
@Injectable({ providedIn: 'root' })
export class GuideService {
  private api?: { react(name: string, lineKey?: string): void };
  readonly ytOpen = signal(false);

  connect(api: { react(name: string, lineKey?: string): void }): void {
    this.api = api;
  }

  react(name: string, lineKey?: string): void {
    this.api?.react(name, lineKey);
  }
}
