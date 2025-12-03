import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { TodoEditModal } from './todo-edit-modal';
import { createMockTodo } from '../../test-utils';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
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

describe('TodoEditModal', () => {
  const setup = async (todo: ReturnType<typeof createMockTodo> | null = null) => {
    const { fixture } = await render(TodoEditModal, {
      componentInputs: {
        todo,
      },
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    return {
      fixture,
      component: fixture.componentInstance,
    };
  };

  describe('Input/Output', () => {
    it('should bind to todo input', async () => {
      const todo = createMockTodo({ id: '1', title: 'Test Todo' });
      const { component } = await setup(todo);

      expect(component.todo).toEqual(todo);
    });

    it('should emit dismiss event', async () => {
      const todo = createMockTodo({ id: '1', title: 'Test Todo' });
      const { component } = await setup(todo);
      const user = userEvent.setup();

      const dismissSpy = vi.spyOn(component.dismiss, 'emit');

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(dismissSpy).toHaveBeenCalled();
    });

    it('should emit save event', async () => {
      const todo = createMockTodo({ id: '1', title: 'Test Todo' });
      const { component } = await setup(todo);
      const user = userEvent.setup();

      const saveSpy = vi.spyOn(component.save, 'emit');

      const titleInput = screen.getByDisplayValue('Test Todo');
      await user.clear(titleInput);
      await user.type(titleInput, 'Updated Todo');

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(saveButton);

      expect(saveSpy).toHaveBeenCalled();
    });
  });

  describe('Form Validation', () => {
    it('should require title field', async () => {
      const todo = createMockTodo({ id: '1', title: 'Test Todo' });
      await setup(todo);
      const user = userEvent.setup();

      const titleInput = screen.getByDisplayValue('Test Todo');
      await user.clear(titleInput);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/title is required/i)).toBeInTheDocument();
      });
    });

    it('should validate title maxLength (120 characters)', async () => {
      const todo = createMockTodo({ id: '1', title: 'Test Todo' });
      await setup(todo);
      const user = userEvent.setup();

      const titleInput = screen.getByDisplayValue('Test Todo');
      await user.clear(titleInput);
      const longTitle = 'a'.repeat(121);
      await user.type(titleInput, longTitle);
      await user.tab();

      await waitFor(() => {
        expect(
          screen.getByText(/title must be 120 characters or less/i)
        ).toBeInTheDocument();
      });
    });

    it('should validate description maxLength (1000 characters)', async () => {
      const todo = createMockTodo({ id: '1', title: 'Test Todo' });
      const { fixture, component } = await setup(todo);
      const user = userEvent.setup({ delay: null });

      const descriptionInput = screen.getByPlaceholderText(/add context/i);
      await user.clear(descriptionInput);
      const longDescription = 'a'.repeat(1001);
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
      const todo = createMockTodo({ id: '1', title: 'Test Todo' });
      const { fixture, component } = await setup(todo);
      const user = userEvent.setup({ delay: null });

      const titleInput = screen.getByDisplayValue('Test Todo');
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
      const todo = createMockTodo({ id: '1', title: 'Test Todo' });
      const { fixture, component } = await setup(todo);
      const user = userEvent.setup({ delay: null });

      const saveSpy = vi.spyOn(component.save, 'emit');

      const titleInput = screen.getByDisplayValue('Test Todo');
      await user.clear(titleInput);
      fixture.detectChanges();
      component.form.markAllAsTouched();
      fixture.detectChanges();

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(saveButton);
      fixture.detectChanges();

      expect(saveSpy).not.toHaveBeenCalled();
    });
  });

  describe('User Interactions', () => {
    it('should pre-populate form when todo is provided', async () => {
      const todo = createMockTodo({
        id: '1',
        title: 'Test Todo',
        description: 'Test description',
        isCompleted: true,
        priority: 'HIGH',
        starred: true,
      });
      await setup(todo);

      expect(screen.getByDisplayValue('Test Todo')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test description')).toBeInTheDocument();
      expect(screen.getByLabelText(/mark todo as completed/i)).toBeChecked();
      expect(
        (screen.getByLabelText(/select priority level/i) as HTMLSelectElement).value
      ).toBe('HIGH');
      expect(screen.getByLabelText(/star this todo/i)).toBeChecked();
    });

    it('should allow editing form fields', async () => {
      const todo = createMockTodo({ id: '1', title: 'Test Todo' });
      const { fixture } = await setup(todo);
      const user = userEvent.setup({ delay: null });

      const titleInput = screen.getByDisplayValue('Test Todo') as HTMLInputElement;
      await user.clear(titleInput);
      await user.type(titleInput, 'Updated Todo');
      fixture.detectChanges();
      await fixture.whenStable();

      expect(titleInput.value).toBe('Updated Todo');
    });

    it('should close modal when cancel button is clicked', async () => {
      const todo = createMockTodo({ id: '1', title: 'Test Todo' });
      const { component } = await setup(todo);
      const user = userEvent.setup();

      const dismissSpy = vi.spyOn(component.dismiss, 'emit');

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(dismissSpy).toHaveBeenCalled();
    });

    it('should save when save button is clicked with valid data', async () => {
      const todo = createMockTodo({
        id: '1',
        title: 'Test Todo',
        description: 'Test description',
        isCompleted: false,
        priority: 'MEDIUM',
        starred: false,
      });
      const { fixture, component } = await setup(todo);
      const user = userEvent.setup({ delay: null });

      const saveSpy = vi.spyOn(component.save, 'emit');

      const titleInput = screen.getByDisplayValue('Test Todo');
      await user.clear(titleInput);
      await user.type(titleInput, 'Updated Todo');
      fixture.detectChanges();
      await fixture.whenStable();
      expect(component.form.valid).toBe(true);

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(saveButton);
      fixture.detectChanges();

      expect(saveSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Updated Todo',
        })
      );
    });
  });

  describe('Event Emissions', () => {
    it('should emit save with form data', async () => {
      const todo = createMockTodo({
        id: '1',
        title: 'Test Todo',
        description: 'Description',
        isCompleted: false,
        priority: 'MEDIUM',
        starred: false,
      });
      const { fixture, component } = await setup(todo);
      const user = userEvent.setup({ delay: null });

      const saveSpy = vi.spyOn(component.save, 'emit');

      const titleInput = screen.getByDisplayValue('Test Todo');
      await user.clear(titleInput);
      await user.type(titleInput, 'Updated');
      fixture.detectChanges();
      await fixture.whenStable();
      expect(component.form.valid).toBe(true);

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(saveButton);
      fixture.detectChanges();

      const emittedValue = saveSpy.mock.calls[0][0];
      expect(emittedValue).toHaveProperty('title', 'Updated');
      expect(emittedValue).toHaveProperty('description', 'Description');
      expect(emittedValue).toHaveProperty('isCompleted', false);
      expect(emittedValue).toHaveProperty('priority', 'MEDIUM');
      expect(emittedValue).toHaveProperty('starred', false);
    });

    it('should emit dismiss on cancel', async () => {
      const todo = createMockTodo({ id: '1', title: 'Test Todo' });
      const { component } = await setup(todo);
      const user = userEvent.setup();

      const dismissSpy = vi.spyOn(component.dismiss, 'emit');

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(dismissSpy).toHaveBeenCalled();
    });
  });

  describe('Template Rendering', () => {
    it('should show modal when todo is provided', async () => {
      const todo = createMockTodo({ id: '1', title: 'Test Todo' });
      await setup(todo);

      expect(screen.getByDisplayValue('Test Todo')).toBeInTheDocument();
    });

    it('should hide modal when todo is null', async () => {
      await setup(null);

      const titleInput = screen.queryByPlaceholderText(/what needs to get done/i);
      expect(titleInput).not.toBeInTheDocument();
    });

    it('should render form fields with todo data', async () => {
      const todo = createMockTodo({
        id: '1',
        title: 'Test Todo',
        description: 'Test description',
        priority: 'HIGH',
      });
      await setup(todo);

      expect(screen.getByDisplayValue('Test Todo')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test description')).toBeInTheDocument();
      expect(
        (screen.getByLabelText(/select priority level/i) as HTMLSelectElement).value
      ).toBe('HIGH');
    });
  });

  describe('Lifecycle', () => {
    it('should populate form in ngOnChanges when todo is set', async () => {
      const todo = createMockTodo({
        id: '1',
        title: 'Test Todo',
        description: 'Description',
        isCompleted: true,
        priority: 'HIGH',
        starred: true,
      });
      const { component, fixture } = await setup(null);

      // Initially no todo
      expect(component.todo).toBeNull();

      // Use setInput to properly trigger ngOnChanges
      fixture.componentRef.setInput('todo', todo);
      fixture.detectChanges();
      await fixture.whenStable();
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Todo')).toBeInTheDocument();
      });
    });

    it('should focus input in ngAfterViewChecked when todo is set', async () => {
      const todo = createMockTodo({ id: '1', title: 'Test Todo' });
      const { component, fixture } = await setup(null);

      const focusSpy = vi.spyOn(
        HTMLInputElement.prototype,
        'focus'
      ).mockImplementation(() => {});
      const selectSpy = vi.spyOn(
        HTMLInputElement.prototype,
        'select'
      ).mockImplementation(() => {});
      
      // Use setInput to properly trigger ngOnChanges
      fixture.componentRef.setInput('todo', todo);
      fixture.detectChanges();
      await fixture.whenStable();
      
      // Wait a bit more for ngAfterViewChecked to run (it uses setTimeout internally)
      await new Promise(resolve => setTimeout(resolve, 10));
      
      await waitFor(() => {
        expect(focusSpy).toHaveBeenCalled();
        expect(selectSpy).toHaveBeenCalled();
      });

      focusSpy.mockRestore();
      selectSpy.mockRestore();
    });
  });
});
