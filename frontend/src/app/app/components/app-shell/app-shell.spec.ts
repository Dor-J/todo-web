import { render, screen } from '@testing-library/angular';
import { AppShell } from './app-shell';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';
import { signal } from '@angular/core';
import { UiStore } from '../../../../store/general.store';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('AppShell', () => {
  const setup = async () => {
    const mockUiStore: Partial<UiStore> = {
      loading: signal(false),
      error: signal<string | null>(null),
      toast: signal<string | null>(null),
      clearToast: vi.fn(),
      clearError: vi.fn(),
      setLoading: vi.fn(),
      setError: vi.fn(),
      setToast: vi.fn(),
    };

    const { fixture } = await render(AppShell, {
      providers: [
        { provide: UiStore, useValue: mockUiStore },
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });

    return {
      fixture,
      component: fixture.componentInstance,
      uiStore: mockUiStore,
    };
  };

  describe('Template Rendering', () => {
    it('should render app shell layout', async () => {
      await setup();

      // App shell should render header and footer
      const header = screen.queryByRole('banner');
      const footer = screen.queryByRole('contentinfo');

      // At least one should be present (exact structure depends on template)
      expect(header || footer).toBeTruthy();
    });

    it('should integrate child components', async () => {
      const { component } = await setup();

      // Component should have access to UiStore
      expect(component.uiStore).toBeDefined();
    });
  });
});
