import { Component, OnDestroy, inject, afterNextRender, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HealthService, type HealthStatus } from '../../../services/health.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-health-indicator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './health-indicator.html',
})
export class HealthIndicator implements OnDestroy {
  private readonly healthService = inject(HealthService);
  private readonly cdr = inject(ChangeDetectorRef);
  private subscription?: Subscription;

  healthStatus: HealthStatus = { status: 'Unknown' };

  constructor() {
    // Subscribe after the next render to avoid ExpressionChangedAfterItHasBeenCheckedError
    afterNextRender(() => {
      this.subscription = this.healthService.getHealthStatus().subscribe({
        next: (status) => {
          this.healthStatus = status;
          this.cdr.detectChanges();
        },
      });
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  /**
   * Gets the status color class based on health status.
   */
  getStatusColor(): string {
    switch (this.healthStatus.status) {
      case 'Healthy':
        return 'bg-green-500';
      case 'Unhealthy':
        return 'bg-red-500';
      default:
        return 'bg-yellow-500';
    }
  }

  /**
   * Gets the status text for display.
   */
  getStatusText(): string {
    return this.healthStatus.status;
  }
}

