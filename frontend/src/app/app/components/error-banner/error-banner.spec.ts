import '@testing-library/jest-dom/vitest';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { ErrorBanner } from './error-banner';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('ErrorBanner', () => {
  const setup = async (message: string | null = null) => {
    const { fixture } = await render(ErrorBanner, {
      componentInputs: {
        message,
      },
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    return {
      fixture,
      component: fixture.componentInstance,
    };
  };

  describe('Input/Output', () => {
    it('should bind to message input', async () => {
      const { component } = await setup('Test error');

      expect(component.message).toBe('Test error');
    });

    it('should bind to visible state through message', async () => {
      await setup('Test error');

      expect(screen.getByText('Test error')).toBeInTheDocument();
    });

    it('should emit dismiss event', async () => {
      const { component } = await setup('Test error');
      const user = userEvent.setup();

      const dismissSpy = vi.spyOn(component.dismiss, 'emit');

      const dismissButton = screen.getByRole('button', { name: /dismiss error message/i });
      await user.click(dismissButton);

      expect(dismissSpy).toHaveBeenCalled();
    });
  });

  describe('User Interactions', () => {
    it('should dismiss when dismiss button is clicked', async () => {
      const { component } = await setup('Test error');
      const user = userEvent.setup();

      const dismissSpy = vi.spyOn(component.dismiss, 'emit');

      const dismissButton = screen.getByRole('button', { name: /dismiss error message/i });
      await user.click(dismissButton);

      expect(dismissSpy).toHaveBeenCalled();
    });
  });

  describe('Event Emissions', () => {
    it('should emit dismiss event', async () => {
      const { component } = await setup('Test error');
      const user = userEvent.setup();

      const dismissSpy = vi.spyOn(component.dismiss, 'emit');

      const dismissButton = screen.getByRole('button', { name: /dismiss error message/i });
      await user.click(dismissButton);

      expect(dismissSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Template Rendering', () => {
    it('should display error message', async () => {
      await setup('Network error occurred');

      expect(screen.getByText('Network error occurred')).toBeInTheDocument();
    });

    it('should toggle visibility based on message', async () => {
      const { fixture } = await setup(null);
      
      // Initially no message
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      
      // Use setInput to properly trigger change detection
      fixture.componentRef.setInput('message', 'Test error');
      fixture.detectChanges();
      await fixture.whenStable();
      
      await waitFor(() => {
        expect(screen.getByText('Test error')).toBeInTheDocument();
      });
    });

    it('should have proper accessibility attributes', async () => {
      await setup('Test error');

      const alert = screen.getByRole('alert');
      expect(alert).toHaveAttribute('aria-live', 'assertive');
    });
  });
});
