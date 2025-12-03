import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/angular';
import { LoadingOverlay } from './loading-overlay';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('LoadingOverlay', () => {
  const setup = async (isLoading = false) => {
    const { fixture } = await render(LoadingOverlay, {
      componentInputs: {
        isLoading,
      },
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    return {
      fixture,
      component: fixture.componentInstance,
    };
  };

  describe('Input/Output', () => {
    it('should bind to isLoading input', async () => {
      const { component } = await setup(true);

      expect(component.isLoading).toBe(true);
    });
  });

  describe('Template Rendering', () => {
    it('should display overlay when visible', async () => {
      await setup(true);

      expect(screen.getByText(/syncing todos/i)).toBeInTheDocument();
    });

    it('should be hidden when not visible', async () => {
      await setup(false);

      const overlay = screen.queryByText(/syncing todos/i);
      expect(overlay).not.toBeInTheDocument();
    });

    it('should show loading indicator', async () => {
      await setup(true);

      const loadingText = screen.getByText(/syncing todos/i);
      expect(loadingText).toBeInTheDocument();
    });
  });
});
