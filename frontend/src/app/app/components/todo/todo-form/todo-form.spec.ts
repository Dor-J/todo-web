import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { TodoForm } from './todo-form';
import { createMockTodoFormService } from '../../test-utils';
import { TodoFormService } from '../../../../services/todo-form.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('TodoForm', () => {
  const setup = async () => {
    const mockFormService = createMockTodoFormService();

    const { fixture } = await render(TodoForm, {
      providers: [
        { provide: TodoFormService, useValue: mockFormService.service },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    return {
      fixture,
      component: fixture.componentInstance,
      formService: mockFormService.service,
      requestFocus: mockFormService.requestFocus,
    };
  };

  describe('Form Validation', () => {
    it('should require title field', async () => {
      const { fixture, component } = await setup();
      const user = userEvent.setup({ delay: null });

      const titleInput = screen.getByPlaceholderText(/what needs to get done/i);
      await user.click(titleInput);
      await user.tab(); // Blur to trigger validation
      component.form.controls.title.markAsTouched();
      fixture.detectChanges();

      await waitFor(() => {
        expect(screen.getByText(/title is required/i)).toBeInTheDocument();
      });
    });

    it('should validate title maxLength (120 characters)', async () => {
      const { fixture, component } = await setup();
      const user = userEvent.setup({ delay: null });

      const titleInput = screen.getByPlaceholderText(/what needs to get done/i);
      const longTitle = 'a'.repeat(121);
      await user.clear(titleInput);
      await user.type(titleInput, longTitle);
      fixture.detectChanges();
      await user.tab();
      component.form.controls.title.markAsTouched();
      fixture.detectChanges();

      await waitFor(() => {
        expect(
          screen.getByText(/title must be 120 characters or less/i)
        ).toBeInTheDocument();
      });
    });

    it('should validate description maxLength (1000 characters)', async () => {
      const { fixture, component } = await setup();
      const user = userEvent.setup({ delay: null });

      const descriptionInput = screen.getByPlaceholderText(/add more detail/i);
      const longDescription = 'a'.repeat(1001);
      await user.clear(descriptionInput);
      await user.type(descriptionInput, longDescription);
      fixture.detectChanges();
      await user.tab();
      component.form.controls.description.markAsTouched();
      fixture.detectChanges();

      await waitFor(() => {
        expect(
          screen.getByText(/description must be 1000 characters or less/i)
        ).toBeInTheDocument();
      });
    });

    it('should reject whitespace-only title', async () => {
      const { fixture, component } = await setup();
      const user = userEvent.setup({ delay: null });

      const titleInput = screen.getByPlaceholderText(/what needs to get done/i);
      await user.clear(titleInput);
      await user.type(titleInput, '   ');
      fixture.detectChanges();
      await user.tab();
      component.form.controls.title.markAsTouched();
      fixture.detectChanges();

      await waitFor(() => {
        expect(
          screen.getByText(/title cannot be empty or only whitespace/i)
        ).toBeInTheDocument();
      });
    });

    it('should block form submission when invalid', async () => {
      const { fixture, component } = await setup();
      const user = userEvent.setup({ delay: null });

      const submitButton = screen.getByRole('button', { name: /save new todo/i });
      const saveSpy = vi.spyOn(component.save, 'emit');

      await user.click(submitButton);
      component.form.markAllAsTouched();
      fixture.detectChanges();

      expect(saveSpy).not.toHaveBeenCalled();
      await waitFor(() => {
        expect(screen.getByText(/title is required/i)).toBeInTheDocument();
      });
    });

    it('should display error messages correctly', async () => {
      const { fixture, component } = await setup();
      const user = userEvent.setup({ delay: null });

      const titleInput = screen.getByPlaceholderText(/what needs to get done/i);
      await user.click(titleInput);
      await user.tab();
      component.form.controls.title.markAsTouched();
      fixture.detectChanges();

      await waitFor(() => {
        const errorMessage = screen.getByText(/title is required/i);
        expect(errorMessage).toBeInTheDocument();
        expect(errorMessage).toHaveAttribute('id', 'title-error');
      });
    });
  });

  describe('User Interactions', () => {
    it('should allow typing in title field', async () => {
      const { fixture } = await setup();
      const user = userEvent.setup({ delay: null });

      const titleInput = screen.getByPlaceholderText(/what needs to get done/i) as HTMLInputElement;
      await user.clear(titleInput);
      await user.type(titleInput, 'Test Todo');
      fixture.detectChanges();
      await fixture.whenStable();

      expect(titleInput.value).toBe('Test Todo');
    });

    it('should allow typing in description field', async () => {
      const { fixture } = await setup();
      const user = userEvent.setup({ delay: null });

      const descriptionInput = screen.getByPlaceholderText(
        /add more detail/i
      ) as HTMLTextAreaElement;
      await user.clear(descriptionInput);
      await user.type(descriptionInput, 'Test description');
      fixture.detectChanges();
      await fixture.whenStable();

      expect(descriptionInput.value).toBe('Test description');
    });

    it('should allow selecting priority', async () => {
      await setup();
      const user = userEvent.setup();

      const prioritySelect = screen.getByLabelText(/select priority level/i);
      await user.selectOptions(prioritySelect, 'HIGH');

      expect((prioritySelect as HTMLSelectElement).value).toBe('HIGH');
    });

    it('should allow toggling isCompleted checkbox', async () => {
      await setup();
      const user = userEvent.setup();

      const completedCheckbox = screen.getByLabelText(/mark todo as completed/i);
      expect(completedCheckbox).not.toBeChecked();
      await user.click(completedCheckbox);
      expect(completedCheckbox).toBeChecked();
    });

    it('should allow toggling starred checkbox', async () => {
      await setup();
      const user = userEvent.setup();

      const starredCheckbox = screen.getByLabelText(/star this todo/i);
      expect(starredCheckbox).not.toBeChecked();
      await user.click(starredCheckbox);
      expect(starredCheckbox).toBeChecked();
    });

    it('should submit form with valid data', async () => {
      const { fixture, component } = await setup();
      const user = userEvent.setup({ delay: null });

      const saveSpy = vi.spyOn(component.save, 'emit');

      const titleInput = screen.getByPlaceholderText(/what needs to get done/i);
      await user.clear(titleInput);
      await user.type(titleInput, 'Test Todo');
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.form.valid).toBe(true);

      const submitButton = screen.getByRole('button', { name: /save new todo/i });
      await user.click(submitButton);
      fixture.detectChanges();

      expect(saveSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Todo',
          description: '',
          isCompleted: false,
          priority: 'MEDIUM',
          starred: false,
        })
      );
    });

    it('should reset form after successful submission', async () => {
      const { fixture } = await setup();
      const user = userEvent.setup({ delay: null });

      const titleInput = screen.getByPlaceholderText(/what needs to get done/i) as HTMLInputElement;
      await user.clear(titleInput);
      await user.type(titleInput, 'Test Todo');
      fixture.detectChanges();
      await fixture.whenStable();

      const submitButton = screen.getByRole('button', { name: /save new todo/i });
      await user.click(submitButton);
      fixture.detectChanges();

      await waitFor(() => {
        expect(titleInput.value).toBe('');
      });
    });

    it('should reset form when clear button is clicked', async () => {
      const { fixture } = await setup();
      const user = userEvent.setup({ delay: null });

      const titleInput = screen.getByPlaceholderText(/what needs to get done/i) as HTMLInputElement;
      await user.clear(titleInput);
      await user.type(titleInput, 'Test Todo');
      fixture.detectChanges();
      await fixture.whenStable();

      const clearButton = screen.getByRole('button', { name: /clear/i });
      await user.click(clearButton);
      fixture.detectChanges();

      expect(titleInput.value).toBe('');
    });
  });

  describe('Event Emissions', () => {
    it('should emit save event with correct payload on valid submit', async () => {
      const { fixture, component } = await setup();
      const user = userEvent.setup({ delay: null });

      const saveSpy = vi.spyOn(component.save, 'emit');

      const titleInput = screen.getByPlaceholderText(/what needs to get done/i);
      const descriptionInput = screen.getByPlaceholderText(/add more detail/i);
      
      await user.clear(titleInput);
      await user.type(titleInput, 'Test Todo');
      fixture.detectChanges();
      
      await user.clear(descriptionInput);
      await user.type(descriptionInput, 'Description');
      fixture.detectChanges();
      
      await user.selectOptions(
        screen.getByLabelText(/select priority level/i),
        'HIGH'
      );
      fixture.detectChanges();
      
      await user.click(screen.getByLabelText(/mark todo as completed/i));
      fixture.detectChanges();
      
      await user.click(screen.getByLabelText(/star this todo/i));
      fixture.detectChanges();
      
      await fixture.whenStable();
      expect(component.form.valid).toBe(true);

      await user.click(screen.getByRole('button', { name: /save new todo/i }));
      fixture.detectChanges();

      expect(saveSpy).toHaveBeenCalledWith({
        title: 'Test Todo',
        description: 'Description',
        isCompleted: true,
        priority: 'HIGH',
        starred: true,
      });
    });

    it('should include all form values in save event', async () => {
      const { fixture, component } = await setup();
      const user = userEvent.setup({ delay: null });

      const saveSpy = vi.spyOn(component.save, 'emit');

      const titleInput = screen.getByPlaceholderText(/what needs to get done/i);
      const descriptionInput = screen.getByPlaceholderText(/add more detail/i);
      
      await user.clear(titleInput);
      await user.type(titleInput, 'Complete Todo');
      fixture.detectChanges();
      
      await user.clear(descriptionInput);
      await user.type(descriptionInput, 'Full description');
      fixture.detectChanges();
      
      await user.selectOptions(
        screen.getByLabelText(/select priority level/i),
        'LOW'
      );
      fixture.detectChanges();
      
      await fixture.whenStable();
      expect(component.form.valid).toBe(true);

      await user.click(screen.getByRole('button', { name: /save new todo/i }));
      fixture.detectChanges();

      const emittedValue = saveSpy.mock.calls[0][0];
      expect(emittedValue).toHaveProperty('title');
      expect(emittedValue).toHaveProperty('description');
      expect(emittedValue).toHaveProperty('isCompleted');
      expect(emittedValue).toHaveProperty('priority');
      expect(emittedValue).toHaveProperty('starred');
    });
  });

  describe('Service Integration', () => {
    it('should subscribe to focus request from TodoFormService', async () => {
      const { component, requestFocus } = await setup();

      const focusSpy = vi.spyOn(component, 'focusInput');

      requestFocus();

      await waitFor(() => {
        expect(focusSpy).toHaveBeenCalled();
      });
    });

    it('should call focusInput when service requests focus', async () => {
      const { component, requestFocus } = await setup();

      const focusSpy = vi.spyOn(component, 'focusInput');

      requestFocus();

      await waitFor(() => {
        expect(focusSpy).toHaveBeenCalled();
      });
    });

    it('should cleanup subscription in ngOnDestroy', async () => {
      const { fixture, component, requestFocus } = await setup();

      const focusSpy = vi.spyOn(component, 'focusInput');

      requestFocus();
      await waitFor(() => {
        expect(focusSpy).toHaveBeenCalled();
      });

      focusSpy.mockClear();
      fixture.destroy();

      requestFocus();
      // Should not be called after destroy
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(focusSpy).not.toHaveBeenCalled();
    });
  });

  describe('Template Rendering', () => {
    it('should render all form fields', async () => {
      await setup();

      expect(screen.getByPlaceholderText(/what needs to get done/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/add more detail/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/select priority level/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/mark todo as completed/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/star this todo/i)).toBeInTheDocument();
    });

    it('should display validation errors when fields are invalid', async () => {
      const { fixture, component } = await setup();
      const user = userEvent.setup({ delay: null });

      const titleInput = screen.getByPlaceholderText(/what needs to get done/i);
      await user.click(titleInput);
      await user.tab();
      component.form.controls.title.markAsTouched();
      fixture.detectChanges();

      await waitFor(() => {
        expect(screen.getByText(/title is required/i)).toBeInTheDocument();
      });
    });

    it('should enable submit button by default', async () => {
      await setup();

      const submitButton = screen.getByRole('button', { name: /save new todo/i });
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).not.toBeDisabled();
    });
  });
});
