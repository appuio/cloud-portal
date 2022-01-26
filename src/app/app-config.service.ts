import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Injectable } from '@angular/core';

export interface AppConfig {
  version: string;
  issuer: string;
  clientId: string;
}

@Injectable({
  providedIn: 'root',
})
export class AppConfigService {
  private readonly CONFIGURATION_URL = 'config.json';
  private appConfig?: AppConfig;

  constructor(private httpClient: HttpClient) {}

  loadConfig(): Observable<AppConfig> {
    return this.httpClient
      .get<AppConfig>(this.CONFIGURATION_URL)
      .pipe(map((config: AppConfig) => (this.appConfig = config)));
  }

  getConfiguration(): AppConfig {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.appConfig!;
  }
}
