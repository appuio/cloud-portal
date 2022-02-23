import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { StatusPageStatus } from '../types/statuspal';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StatusService {
  constructor(private httpClient: HttpClient) {}

  public getStatus(): Observable<StatusPageStatus> {
    return this.httpClient.get<StatusPageStatus>('https://statuspal.eu/api/v1/status_pages/appuio-cloud/status');
  }
}
