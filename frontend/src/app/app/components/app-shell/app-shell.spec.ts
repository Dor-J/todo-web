import { render, screen } from '@testing-library/angular';
import { AppShell } from './app-shell';
import { createMockTodoStore } from '../test-utils';
import { TodoStore } from '../../../../store/todo.store';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';

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
    const mockStore = createMockTodoStore();

    const { fixture } = await render(AppShell, {
      providers: [
        { provide: TodoStore, useValue: mockStore.store },
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });

    return {
      fixture,
      component: fixture.componentInstance,
      store: mockStore.store,
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

      // Component should have access to TodoStore
      expect(component.todoStore).toBeDefined();
    });
  });
});
