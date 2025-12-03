import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { TodoFilters } from './todo-filters';
import { createMockFilters } from '../../test-utils';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { fakeAsync, tick } from '@angular/core/testing';
import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('TodoFilters', () => {
  const setup = async (initialFilters?: ReturnType<typeof createMockFilters>) => {
    const { fixture } = await render(TodoFilters, {
      componentInputs: {
        filters: initialFilters ?? createMockFilters(),
      },
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    return {
      fixture,
      component: fixture.componentInstance,
    };
  };

  describe('Input/Output', () => {
    it('should bind to filters input', async () => {
      const filters = createMockFilters({ status: 'active', query: 'test' });
      const { component } = await setup(filters);

      expect(component.filters.status).toBe('active');
      expect(component.filters.query).toBe('test');
    });

    it('should emit filtersChange when filters are updated', async () => {
      const { component } = await setup();
      const user = userEvent.setup();

      const filtersChangeSpy = vi.spyOn(component.filtersChange, 'emit');

      const activeButton = screen.getByRole('button', { name: /show active todos/i });
      await user.click(activeButton);

      expect(filtersChangeSpy).toHaveBeenCalled();
    });
  });

  describe('User Interactions', () => {
    it('should update query with debouncing', async () => {
      const { component } = await setup();
      const user = userEvent.setup();

      const filtersChangeSpy = vi.spyOn(component.filtersChange, 'emit');

      const searchInput = screen.getByLabelText(/search todos/i);
      await user.type(searchInput, 'test');
      
      // Wait for debounce (300ms) plus some buffer
      await waitFor(() => {
        expect(filtersChangeSpy).toHaveBeenCalled();
      }, { timeout: 500 });
      
      const emittedValue = filtersChangeSpy.mock.calls[0]?.[0];
      expect(emittedValue?.query).toBe('test');
    });

    it('should update status filter immediately', async () => {
      const { component } = await setup();
      const user = userEvent.setup();

      const filtersChangeSpy = vi.spyOn(component.filtersChange, 'emit');

      const activeButton = screen.getByRole('button', { name: /show active todos/i });
      await user.click(activeButton);

      expect(filtersChangeSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'active',
        })
      );
    });

    it('should update starred filter immediately', async () => {
      const { component } = await setup();
      const user = userEvent.setup();

      const filtersChangeSpy = vi.spyOn(component.filtersChange, 'emit');

      const starredButton = screen.getByRole('button', { name: /show only starred todos/i });
      await user.click(starredButton);

      expect(filtersChangeSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          isStarred: 'starred',
        })
      );
    });

    it('should update priority filter immediately', async () => {
      const { component } = await setup();
      const user = userEvent.setup();

      const filtersChangeSpy = vi.spyOn(component.filtersChange, 'emit');

      const highPriorityButton = screen.getByRole('button', {
        name: /show only high priority todos/i,
      });
      await user.click(highPriorityButton);

      expect(filtersChangeSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          priority: 'HIGH',
        })
      );
    });
  });

  describe('Event Emissions', () => {
    it('should emit filtersChange with updated filter state', async () => {
      const { component } = await setup();
      const user = userEvent.setup();

      const filtersChangeSpy = vi.spyOn(component.filtersChange, 'emit');

      const completedButton = screen.getByRole('button', {
        name: /show completed todos/i,
      });
      await user.click(completedButton);

      const emittedValue = filtersChangeSpy.mock.calls[0][0];
      expect(emittedValue).toHaveProperty('status', 'completed');
    });

    it('should emit debounced query updates', async () => {
      const { component } = await setup();
      const user = userEvent.setup();

      const filtersChangeSpy = vi.spyOn(component.filtersChange, 'emit');

      const searchInput = screen.getByLabelText(/search todos/i);
      await user.type(searchInput, 'test query');

      // Wait for debounce (300ms) plus some buffer
      await waitFor(() => {
        expect(filtersChangeSpy).toHaveBeenCalled();
      }, { timeout: 500 });

      const emittedValue = filtersChangeSpy.mock.calls[0]?.[0];
      expect(emittedValue?.query).toBe('test query');
    });

    it('should emit immediate filter updates for status', async () => {
      const { component } = await setup();
      const user = userEvent.setup();

      const filtersChangeSpy = vi.spyOn(component.filtersChange, 'emit');

      // Use getAllByRole and filter by the exact aria-label for status filter
      const allButtons = screen.getAllByRole('button', { name: /show all todos/i });
      // The first one should be the status filter (based on DOM order)
      const statusAllButton = allButtons[0];
      await user.click(statusAllButton);

      expect(filtersChangeSpy).toHaveBeenCalledTimes(1);
    });

    it('should emit immediate filter updates for priority', async () => {
      const { component } = await setup();
      const user = userEvent.setup();

      const filtersChangeSpy = vi.spyOn(component.filtersChange, 'emit');

      const mediumButton = screen.getByRole('button', {
        name: /show only medium priority todos/i,
      });
      await user.click(mediumButton);

      expect(filtersChangeSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Template Rendering', () => {
    it('should render filter controls', async () => {
      await setup();

      expect(screen.getByLabelText(/search todos/i)).toBeInTheDocument();
      // Use getAllByRole and check that at least one exists, or be more specific
      const allButtons = screen.getAllByRole('button', { name: /show all todos/i });
      expect(allButtons.length).toBeGreaterThan(0);
      expect(screen.getByRole('button', { name: /show active todos/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /show completed todos/i })).toBeInTheDocument();
    });

    it('should display current filter values', async () => {
      const filters = createMockFilters({ status: 'active' });
      await setup(filters);

      const activeButton = screen.getByRole('button', { name: /show active todos/i });
      expect(activeButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('should show active state for selected status filter', async () => {
      const filters = createMockFilters({ status: 'completed' });
      await setup(filters);

      const completedButton = screen.getByRole('button', {
        name: /show completed todos/i,
      });
      expect(completedButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('should show active state for selected starred filter', async () => {
      const filters = createMockFilters({ isStarred: 'starred' });
      await setup(filters);

      const starredButton = screen.getByRole('button', {
        name: /show only starred todos/i,
      });
      expect(starredButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('should show active state for selected priority filter', async () => {
      const filters = createMockFilters({ priority: 'HIGH' });
      await setup(filters);

      const highButton = screen.getByRole('button', {
        name: /show only high priority todos/i,
      });
      expect(highButton).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('Service Integration', () => {
    it('should cleanup RxJS Subject in ngOnDestroy', async () => {
      const { fixture, component } = await setup();

      const querySubject = (component as any).querySubject;
      const completeSpy = vi.spyOn(querySubject, 'complete');

      fixture.destroy();

      expect(completeSpy).toHaveBeenCalled();
    });
  });

  describe('Debouncing', () => {
    it('should debounce query updates by 300ms', async () => {
      const { component } = await setup();
      const user = userEvent.setup();

      const filtersChangeSpy = vi.spyOn(component.filtersChange, 'emit');

      const searchInput = screen.getByLabelText(/search todos/i);
      await user.type(searchInput, 'a');

      // Wait for debounce (300ms) plus some buffer
      await waitFor(() => {
        expect(filtersChangeSpy).not.toHaveBeenCalled();
      }, { timeout: 100 });

      await waitFor(() => {
        expect(filtersChangeSpy).toHaveBeenCalled();
      }, { timeout: 500 });
    });

    it('should only emit distinct query values', async () => {
      const { component } = await setup();
      const user = userEvent.setup();

      const filtersChangeSpy = vi.spyOn(component.filtersChange, 'emit');

      const searchInput = screen.getByLabelText(/search todos/i);
      await user.type(searchInput, 'test');
      // Wait for debounce (300ms) plus some buffer
      await waitFor(() => {
        expect(filtersChangeSpy).toHaveBeenCalledTimes(1);
      }, { timeout: 500 });

      // Type same value again
      await user.clear(searchInput);
      await user.type(searchInput, 'test');
      // Wait for debounce (300ms) plus some buffer
      await waitFor(() => {
        expect(filtersChangeSpy).toHaveBeenCalledTimes(1);
      }, { timeout: 500 });
    });
  });
});
