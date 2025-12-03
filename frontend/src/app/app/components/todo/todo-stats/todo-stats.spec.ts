import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/angular';
import { TodoStats } from './todo-stats';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('TodoStats', () => {
  const setup = async (options?: { total?: number; completed?: number; remaining?: number }) => {
    const { fixture } = await render(TodoStats, {
      componentInputs: {
        total: options?.total ?? 0,
        completed: options?.completed ?? 0,
        remaining: options?.remaining ?? 0,
      },
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    return {
      fixture,
      component: fixture.componentInstance,
    };
  };

  describe('Input/Output', () => {
    it('should bind to total input', async () => {
      const { component } = await setup({ total: 10 });

      expect(component.total).toBe(10);
    });

    it('should bind to completed input', async () => {
      const { component } = await setup({ completed: 5 });

      expect(component.completed).toBe(5);
    });

    it('should bind to remaining input', async () => {
      const { component } = await setup({ remaining: 3 });

      expect(component.remaining).toBe(3);
    });
  });

  describe('Template Rendering', () => {
    it('should display stats correctly', async () => {
      await setup({ total: 10, completed: 7, remaining: 3 });

      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('7')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('should format numbers properly', async () => {
      await setup({ total: 100, completed: 50, remaining: 50 });

      expect(screen.getByText('100')).toBeInTheDocument();
      // There are two "50" values (completed and remaining), so use getAllByText
      const fiftyElements = screen.getAllByText('50');
      expect(fiftyElements).toHaveLength(2);
    });

    it('should display total stat', async () => {
      await setup({ total: 5 });

      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText(/total/i)).toBeInTheDocument();
    });

    it('should display completed stat', async () => {
      await setup({ completed: 3 });

      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText(/completed/i)).toBeInTheDocument();
    });

    it('should display remaining stat', async () => {
      await setup({ remaining: 2 });

      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText(/remaining/i)).toBeInTheDocument();
    });
  });
});
