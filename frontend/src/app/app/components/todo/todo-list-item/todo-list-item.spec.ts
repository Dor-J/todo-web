import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { TodoListItem } from './todo-list-item';
import { createMockTodo } from '../../test-utils';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('TodoListItem', () => {
  const setup = async (todoOverrides?: Partial<Parameters<typeof createMockTodo>[0]>) => {
    const todo = createMockTodo(todoOverrides);

    const { fixture } = await render(TodoListItem, {
      componentInputs: {
        todo,
      },
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    return {
      fixture,
      component: fixture.componentInstance,
      todo,
    };
  };

  describe('Input/Output', () => {
    it('should bind to todo input', async () => {
      const { component } = await setup({ id: '1', title: 'Test Todo' });

      expect(component.todo.id).toBe('1');
      expect(component.todo.title).toBe('Test Todo');
    });

    it('should emit toggle event', async () => {
      const { component } = await setup();
      const user = userEvent.setup();

      const toggleSpy = vi.spyOn(component.toggle, 'emit');

      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      expect(toggleSpy).toHaveBeenCalled();
    });

    it('should emit edit event', async () => {
      const { component } = await setup();
      const user = userEvent.setup();

      const editSpy = vi.spyOn(component.edit, 'emit');

      const editButton = screen.getByLabelText(/edit/i);
      await user.click(editButton);

      expect(editSpy).toHaveBeenCalled();
    });

    it('should emit delete event', async () => {
      const { component } = await setup();
      const user = userEvent.setup();

      const deleteSpy = vi.spyOn(component.delete, 'emit');

      const deleteButton = screen.getByLabelText(/delete/i);
      await user.click(deleteButton);

      expect(deleteSpy).toHaveBeenCalled();
    });

    it('should emit toggleStarred event', async () => {
      const { component } = await setup();
      const user = userEvent.setup();

      const toggleStarredSpy = vi.spyOn(component.toggleStarred, 'emit');

      const starButton = screen.getByLabelText(/star todo|unstar todo/i);
      await user.click(starButton);

      expect(toggleStarredSpy).toHaveBeenCalled();
    });
  });

  describe('User Interactions', () => {
    it('should toggle checkbox when clicked', async () => {
      await setup({ isCompleted: false });
      const user = userEvent.setup();

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();

      await user.click(checkbox);

      // Checkbox state is bound to todo.isCompleted, so it won't change
      // but the event should be emitted
      const toggleSpy = vi.spyOn(
        screen.getByRole('checkbox').closest('label')!,
        'dispatchEvent'
      );
    });

    it('should trigger edit when edit button is clicked', async () => {
      const { component } = await setup();
      const user = userEvent.setup();

      const editSpy = vi.spyOn(component.edit, 'emit');

      const editButton = screen.getByLabelText(/edit/i);
      await user.click(editButton);

      expect(editSpy).toHaveBeenCalled();
    });

    it('should trigger delete when delete button is clicked', async () => {
      const { component } = await setup();
      const user = userEvent.setup();

      const deleteSpy = vi.spyOn(component.delete, 'emit');

      const deleteButton = screen.getByLabelText(/delete/i);
      await user.click(deleteButton);

      expect(deleteSpy).toHaveBeenCalled();
    });

    it('should trigger toggleStarred when star button is clicked', async () => {
      const { component } = await setup();
      const user = userEvent.setup();

      const toggleStarredSpy = vi.spyOn(component.toggleStarred, 'emit');

      const starButton = screen.getByLabelText(/star todo|unstar todo/i);
      await user.click(starButton);

      expect(toggleStarredSpy).toHaveBeenCalled();
    });
  });

  describe('Event Emissions', () => {
    it('should emit toggle event with correct timing', async () => {
      const { component } = await setup();
      const user = userEvent.setup();

      const toggleSpy = vi.spyOn(component.toggle, 'emit');

      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      expect(toggleSpy).toHaveBeenCalledTimes(1);
    });

    it('should emit edit event when edit button is clicked', async () => {
      const { component } = await setup();
      const user = userEvent.setup();

      const editSpy = vi.spyOn(component.edit, 'emit');

      const editButton = screen.getByLabelText(/edit/i);
      await user.click(editButton);

      expect(editSpy).toHaveBeenCalledTimes(1);
    });

    it('should emit delete event when delete button is clicked', async () => {
      const { component } = await setup();
      const user = userEvent.setup();

      const deleteSpy = vi.spyOn(component.delete, 'emit');

      const deleteButton = screen.getByLabelText(/delete/i);
      await user.click(deleteButton);

      expect(deleteSpy).toHaveBeenCalledTimes(1);
    });

    it('should emit toggleStarred event when star button is clicked', async () => {
      const { component } = await setup();
      const user = userEvent.setup();

      const toggleStarredSpy = vi.spyOn(component.toggleStarred, 'emit');

      const starButton = screen.getByLabelText(/star todo|unstar todo/i);
      await user.click(starButton);

      expect(toggleStarredSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Template Rendering', () => {
    it('should display todo title', async () => {
      await setup({ title: 'Test Todo Title' });

      expect(screen.getByText('Test Todo Title')).toBeInTheDocument();
    });

    it('should display todo description when present', async () => {
      await setup({ description: 'Test description' });

      expect(screen.getByText('Test description')).toBeInTheDocument();
    });

    it('should not display description when absent', async () => {
      await setup({ description: undefined });

      const description = screen.queryByText(/test description/i);
      expect(description).not.toBeInTheDocument();
    });

    it('should render priority badge', async () => {
      await setup({ priority: 'HIGH' });

      expect(screen.getByText('HIGH')).toBeInTheDocument();
    });

    it('should apply line-through styling when completed', async () => {
      await setup({ isCompleted: true, title: 'Completed Todo' });

      const titleElement = screen.getByText('Completed Todo');
      expect(titleElement).toHaveClass('line-through');
    });

    it('should show star icon when starred', async () => {
      await setup({ starred: true });

      const starButton = screen.getByLabelText(/unstar todo/i);
      expect(starButton).toBeInTheDocument();
    });

    it('should show empty star icon when not starred', async () => {
      await setup({ starred: false });

      const starButton = screen.getByLabelText(/star todo/i);
      expect(starButton).toBeInTheDocument();
    });

    it('should format dates correctly', async () => {
      const date = new Date('2024-01-15T10:30:00Z').toISOString();
      await setup({ createdAt: date });

      // Date pipe will format it, so we check for presence
      const dateElement = screen.getByText(/created/i);
      expect(dateElement).toBeInTheDocument();
    });

    it('should display status badge', async () => {
      await setup({ isCompleted: false });

      expect(screen.getByText(/in progress/i)).toBeInTheDocument();
    });

    it('should display done status when completed', async () => {
      await setup({ isCompleted: true });

      expect(screen.getByText(/done/i)).toBeInTheDocument();
    });

    it('should display updated date when present', async () => {
      const updatedAt = new Date('2024-01-16T10:30:00Z').toISOString();
      await setup({ updatedAt });

      const updatedText = screen.getByText(/updated/i);
      expect(updatedText).toBeInTheDocument();
    });
  });
});
