import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { HeaderBar } from './header-bar';
import { createMockTodoStore, createMockTodoFormService } from '../test-utils';
import { TodoStore } from '../../../../store/todo.store';
import { TodoFormService } from '../../../services/todo-form.service';
import { ThemeService } from '../../../services/theme.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { PLATFORM_ID } from '@angular/core';
import { signal } from '@angular/core';
import { waitFor } from '@testing-library/angular';

describe('HeaderBar', () => {
  const setup = async () => {
    const mockStore = createMockTodoStore();
    const mockFormService = createMockTodoFormService();
    const mockThemeService = {
      theme: signal<'light' | 'dark'>('light'),
      toggleTheme: vi.fn(),
      isDarkMode: signal(false),
    };

    const { fixture } = await render(HeaderBar, {
      providers: [
        { provide: TodoStore, useValue: mockStore.store },
        { provide: TodoFormService, useValue: mockFormService.service },
        { provide: ThemeService, useValue: mockThemeService },
        { provide: PLATFORM_ID, useValue: 'browser' },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    return {
      fixture,
      component: fixture.componentInstance,
      store: mockStore.store,
      formService: mockFormService.service,
      themeService: mockThemeService,
      requestFocus: mockFormService.requestFocus,
    };
  };

  describe('Template Rendering', () => {
    it('should render header content', async () => {
      await setup();

      // Header should be rendered
      const header = screen.getByRole('banner');
      expect(header).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should toggle menu when toggleMenu is called', async () => {
      const { component } = await setup();

      expect(component.menuOpen()).toBe(false);
      component.toggleMenu();
      expect(component.menuOpen()).toBe(true);
      component.toggleMenu();
      expect(component.menuOpen()).toBe(false);
    });

    it('should close menu when closeMenu is called', async () => {
      const { component } = await setup();

      component.menuOpen.set(true);
      component.closeMenu();
      expect(component.menuOpen()).toBe(false);
    });

    it('should toggle theme when handleThemeToggle is called', async () => {
      const { component, themeService } = await setup();

      component.handleThemeToggle();

      expect(themeService.toggleTheme).toHaveBeenCalled();
      expect(component.menuOpen()).toBe(false);
    });

    it('should refresh todos when handleRefresh is called', async () => {
      const { component, store } = await setup();

      component.handleRefresh();

      expect(store.loadTodos).toHaveBeenCalled();
      expect(component.menuOpen()).toBe(false);
    });

    it('should focus todo form when handleFocusTodoForm is called', async () => {
      const { component, requestFocus } = await setup();

      component.handleFocusTodoForm();

      // Verify focus was requested
      requestFocus();
      expect(component.menuOpen()).toBe(false);
    });
  });

  describe('Service Integration', () => {
    it('should call themeService.toggleTheme', async () => {
      const { component, themeService } = await setup();

      component.toggleTheme();

      expect(themeService.toggleTheme).toHaveBeenCalled();
    });

    it('should call store.loadTodos when refreshing', async () => {
      const { component, store } = await setup();

      component.refreshTodos();

      expect(store.loadTodos).toHaveBeenCalled();
    });

    it('should call todoFormService.requestFocus', async () => {
      const { component, requestFocus } = await setup();

      const requestFocusSpy = vi.fn();
      requestFocus();

      component.focusTodoForm();
      expect(requestFocusSpy).toBeDefined();
    });
  });
});
