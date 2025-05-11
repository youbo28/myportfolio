import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideTransloco } from '@ngneat/transloco';
import { TranslocoHttpLoader } from '../transloco-loader';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes)]
};
