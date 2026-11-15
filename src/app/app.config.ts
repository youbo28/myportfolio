import { ApplicationConfig } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideTranslocoConfig } from '../transloco-loader';

export const appConfig: ApplicationConfig = {
  providers: [provideHttpClient(), provideTranslocoConfig()],
};
