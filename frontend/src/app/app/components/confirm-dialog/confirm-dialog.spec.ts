import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { ConfirmDialog } from './confirm-dialog';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('ConfirmDialog', () => {
  const setup = async (options?: {
    visible?: boolean;
    message?: string;
    confirmLabel?: string;
    cancelLabel?: string;
  }) => {
    const { fixture } = await render(ConfirmDialog, {
      componentInputs: {
        visible: options?.visible ?? true,
        message: options?.message ?? 'Are you sure you want to proceed?',
        confirmLabel: options?.confirmLabel ?? 'Delete',
        cancelLabel: options?.cancelLabel ?? 'Cancel',
      },
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    return {
      fixture,
      component: fixture.componentInstance,
    };
  };

  describe('Input/Output', () => {
    it('should bind to visible input', async () => {
      const { component } = await setup({ visible: true });

      expect(component.visible).toBe(true);
    });

    it('should bind to message input', async () => {
      const { component } = await setup({ message: 'Custom message' });

      expect(component.message).toBe('Custom message');
    });

    it('should bind to confirmLabel input', async () => {
      const { component } = await setup({ confirmLabel: 'Confirm' });

      expect(component.confirmLabel).toBe('Confirm');
    });

    it('should bind to cancelLabel input', async () => {
      const { component } = await setup({ cancelLabel: 'Abort' });

      expect(component.cancelLabel).toBe('Abort');
    });

    it('should emit confirm event', async () => {
      const { component } = await setup();
      const user = userEvent.setup();

      const confirmSpy = vi.spyOn(component.confirm, 'emit');

      const confirmButton = screen.getByRole('button', { name: /confirm action/i });
      await user.click(confirmButton);

      expect(confirmSpy).toHaveBeenCalled();
    });

    it('should emit cancel event', async () => {
      const { component } = await setup();
      const user = userEvent.setup();

      const cancelSpy = vi.spyOn(component.cancel, 'emit');

      const cancelButton = screen.getByRole('button', { name: /cancel action/i });
      await user.click(cancelButton);

      expect(cancelSpy).toHaveBeenCalled();
    });
  });

  describe('User Interactions', () => {
    it('should trigger confirm when confirm button is clicked', async () => {
      const { component } = await setup();
      const user = userEvent.setup();

      const confirmSpy = vi.spyOn(component.confirm, 'emit');

      const confirmButton = screen.getByRole('button', { name: /confirm action/i });
      await user.click(confirmButton);

      expect(confirmSpy).toHaveBeenCalled();
    });

    it('should trigger cancel when cancel button is clicked', async () => {
      const { component } = await setup();
      const user = userEvent.setup();

      const cancelSpy = vi.spyOn(component.cancel, 'emit');

      const cancelButton = screen.getByRole('button', { name: /cancel action/i });
      await user.click(cancelButton);

      expect(cancelSpy).toHaveBeenCalled();
    });
  });

  describe('Event Emissions', () => {
    it('should emit confirm event correctly', async () => {
      const { component, fixture } = await setup();
      const user = userEvent.setup();

      const confirmSpy = vi.spyOn(component.confirm, 'emit');

      const confirmButton = screen.getByRole('button', { name: /confirm action/i });
      await user.click(confirmButton);

      expect(confirmSpy).toHaveBeenCalledTimes(1);
      
      // Wait for any async operations to complete
      await fixture.whenStable();
    });

    it('should emit cancel event correctly', async () => {
      const { component, fixture } = await setup();
      const user = userEvent.setup();

      const cancelSpy = vi.spyOn(component.cancel, 'emit');

      const cancelButton = screen.getByRole('button', { name: /cancel action/i });
      await user.click(cancelButton);

      expect(cancelSpy).toHaveBeenCalledTimes(1);
      
      // Wait for any async operations to complete
      await fixture.whenStable();
    });
  });

  describe('Template Rendering', () => {
    it('should show dialog when visible', async () => {
      await setup({ visible: true });

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should hide dialog when not visible', async () => {
      await setup({ visible: false });

      const dialog = screen.queryByRole('dialog');
      expect(dialog).not.toBeInTheDocument();
    });

    it('should display custom message', async () => {
      await setup({ message: 'Custom confirmation message' });

      expect(screen.getByText('Custom confirmation message')).toBeInTheDocument();
    });

    it('should display custom labels', async () => {
      await setup({ confirmLabel: 'Yes', cancelLabel: 'No' });

      expect(screen.getByRole('button', { name: /confirm action/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel action/i })).toBeInTheDocument();
      // Also verify the text content
      expect(screen.getByText('Yes')).toBeInTheDocument();
      expect(screen.getByText('No')).toBeInTheDocument();
    });

    it('should have proper accessibility attributes', async () => {
      await setup();

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'confirm-dialog-title');
      expect(dialog).toHaveAttribute('aria-describedby', 'confirm-dialog-message');
    });
  });
});
