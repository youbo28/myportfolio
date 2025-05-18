import { inject, Injectable, isDevMode } from "@angular/core";
import { provideTransloco, Translation, translocoConfig, TranslocoLoader } from "@ngneat/transloco";
import { HttpClient } from "@angular/common/http";

@Injectable({ providedIn: 'root' })
export class TranslocoHttpLoader implements TranslocoLoader {
    private http = inject(HttpClient);

    getTranslation(lang: string) {
        return this.http.get<Translation>(`/assets/i18n/${lang}.json`);
    }
}
export function provideTranslocoConfig() {
    return provideTransloco({
      config: translocoConfig({
        availableLangs: ['en', 'fr', 'ar', 'de'],
        defaultLang: 'en',
        fallbackLang: 'en',
        reRenderOnLangChange: true,
        prodMode: !isDevMode()
      }),
      loader: TranslocoHttpLoader
    });
  }