import { ChangeDetectionStrategy, Component, afterNextRender } from '@angular/core';
import { createSky } from './sky';

/** Background: twinkling stars at night, drifting clouds by day. */
@Component({
  selector: 'app-sky',
  template: `<canvas id="sky" aria-hidden="true"></canvas>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkyComponent {
  constructor() {
    afterNextRender(() => createSky());
  }
}
