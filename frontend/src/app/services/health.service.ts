import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, interval, startWith, switchMap, catchError, map, of } from 'rxjs';

export interface HealthStatus {
  status: 'Healthy' | 'Unhealthy' | 'Unknown';
}

@Injectable({
  providedIn: 'root',
})
export class HealthService {
  private readonly healthUrl: string;
  private readonly checkInterval = 60000; // Check every 60 seconds

  constructor(private http: HttpClient) {
    // Values injected at build time by @ngx-env/builder
    const baseUrl = import.meta.env.NG_APP_API_URL ?? 'http://localhost:5013';
    const endpoint = import.meta.env.NG_APP_HEALTH_ENDPOINT ??'/api/health';
    
    const normalizedBase = baseUrl.replace(/\/+$/, '');
    const normalizedEndpoint = endpoint.replace(/^\/?/, '/');
    
    this.healthUrl = `${normalizedBase}${normalizedEndpoint}`;
  }

  /**
   * Checks the health status of the backend API.
   * @returns Observable of health status
   */
  checkHealth(): Observable<HealthStatus> {
    return this.http.get<{ status: string }>(this.healthUrl).pipe(
      map((response) => ({
        status: (response.status === 'Healthy' ? 'Healthy' : 'Unhealthy') as 'Healthy' | 'Unhealthy',
      })),
      catchError(() => of({ status: 'Unknown' as const })),
    );
  }

  /**
   * Returns an observable that periodically checks health status.
   * @returns Observable that emits health status at regular intervals
   */
  getHealthStatus(): Observable<HealthStatus> {
    return interval(this.checkInterval).pipe(
      startWith(0), // Check immediately on subscription
      switchMap(() => this.checkHealth()),
    );
  }
}

