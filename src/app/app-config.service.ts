import { HttpClient } from '@angular/common/http';
import { map, Observable, of } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';

export interface AppConfig {
  version: string;
  environment: string;
  issuer: string;
  clientId: string;
  glitchTipDsn: string;
}

@Injectable({
  providedIn: 'root',
})
export class AppConfigService {
  private readonly CONFIGURATION_URL = 'config.json'; // contains the structure of `environment.appConfig`.
  private appConfig?: AppConfig;

  constructor(private httpClient: HttpClient) {}

  loadConfig(): Observable<AppConfig> {
    if (!environment.appConfig) {
      return this.httpClient
        .get<AppConfig>(this.CONFIGURATION_URL)
        .pipe(map((config: AppConfig) => (this.appConfig = config)));
    }
    this.appConfig = environment.appConfig;
    return of(environment.appConfig);
  }

  getConfiguration(): AppConfig {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.appConfig!;
  }
}
