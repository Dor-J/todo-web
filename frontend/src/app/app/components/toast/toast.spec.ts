import '@testing-library/jest-dom/vitest';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { Toast } from './toast';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('Toast', () => {
  const setup = async (message: string | null = null) => {
    const { fixture } = await render(Toast, {
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
      const { component } = await setup('Test message');

      expect(component.message).toBe('Test message');
    });

    it('should bind to visible state through message', async () => {
      await setup('Test message');

      expect(screen.getByText('Test message')).toBeInTheDocument();
    });

    it('should emit dismiss event', async () => {
      const { component } = await setup('Test message');
      const user = userEvent.setup();

      const dismissSpy = vi.spyOn(component.dismiss, 'emit');

      const closeButton = screen.getByRole('button', { name: /close notification/i });
      await user.click(closeButton);

      expect(dismissSpy).toHaveBeenCalled();
    });
  });

  describe('User Interactions', () => {
    it('should dismiss when close button is clicked', async () => {
      const { component } = await setup('Test message');
      const user = userEvent.setup();

      const dismissSpy = vi.spyOn(component.dismiss, 'emit');

      const closeButton = screen.getByRole('button', { name: /close notification/i });
      await user.click(closeButton);

      expect(dismissSpy).toHaveBeenCalled();
    });

    it('should auto-dismiss after 2 seconds', async () => {
      vi.useFakeTimers();
      const { component } = await setup('Test message');

      const dismissSpy = vi.spyOn(component.dismiss, 'emit');

      // Fast-forward time
      vi.advanceTimersByTime(2000);

      await waitFor(() => {
        expect(dismissSpy).toHaveBeenCalled();
      });

      vi.useRealTimers();
    });
  });

  describe('Event Emissions', () => {
    it('should emit dismiss event when button is clicked', async () => {
      const { component } = await setup('Test message');
      const user = userEvent.setup();

      const dismissSpy = vi.spyOn(component.dismiss, 'emit');

      const closeButton = screen.getByRole('button', { name: /close notification/i });
      await user.click(closeButton);

      expect(dismissSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Template Rendering', () => {
    it('should display message when visible', async () => {
      await setup('Test toast message');

      expect(screen.getByText('Test toast message')).toBeInTheDocument();
    });

    it('should be hidden when message is null', async () => {
      await setup(null);

      const toast = screen.queryByRole('status');
      expect(toast).not.toBeInTheDocument();
    });

    it('should have proper accessibility attributes', async () => {
      await setup('Test message');

      const toast = screen.getByRole('status');
      expect(toast).toHaveAttribute('aria-live', 'polite');
    });
  });
});
