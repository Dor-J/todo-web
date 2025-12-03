import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { TodoList } from './todo-list';
import { createMockTodo, createMockFilters } from '../../test-utils';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('TodoList', () => {
  const setup = async (
    todos: ReturnType<typeof createMockTodo>[] = [],
    filters?: ReturnType<typeof createMockFilters>
  ) => {
    const { fixture } = await render(TodoList, {
      componentInputs: {
        todos,
        filters: filters ?? createMockFilters(),
      },
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    return {
      fixture,
      component: fixture.componentInstance,
    };
  };

  describe('Input/Output', () => {
    it('should bind to todos input array', async () => {
      const todos = [
        createMockTodo({ id: '1', title: 'Todo 1' }),
        createMockTodo({ id: '2', title: 'Todo 2' }),
      ];
      const { component } = await setup(todos);

      expect(component.todos).toHaveLength(2);
      expect(component.todos[0].title).toBe('Todo 1');
    });

    it('should bind to filters input', async () => {
      const filters = createMockFilters({ status: 'active' });
      const { component } = await setup([], filters);

      expect(component.filters.status).toBe('active');
    });

    it('should emit toggleTodo event', async () => {
      const todos = [createMockTodo({ id: '1', title: 'Todo 1' })];
      const { component } = await setup(todos);
      const user = userEvent.setup();

      const toggleSpy = vi.spyOn(component.toggleTodo, 'emit');

      const checkbox = screen.getByLabelText(/mark 'todo 1' as/i);
      await user.click(checkbox);

      expect(toggleSpy).toHaveBeenCalledWith(todos[0]);
    });

    it('should emit editTodo event', async () => {
      const todos = [createMockTodo({ id: '1', title: 'Todo 1' })];
      const { component } = await setup(todos);
      const user = userEvent.setup();

      const editSpy = vi.spyOn(component.editTodo, 'emit');

      const editButton = screen.getByLabelText(/edit 'todo 1'/i);
      await user.click(editButton);

      expect(editSpy).toHaveBeenCalledWith(todos[0]);
    });

    it('should emit deleteTodo event', async () => {
      const todos = [createMockTodo({ id: '1', title: 'Todo 1' })];
      const { component } = await setup(todos);
      const user = userEvent.setup();

      const deleteSpy = vi.spyOn(component.deleteTodo, 'emit');

      const deleteButton = screen.getByLabelText(/delete 'todo 1'/i);
      await user.click(deleteButton);

      expect(deleteSpy).toHaveBeenCalledWith('1');
    });

    it('should emit toggleStarred event', async () => {
      const todos = [createMockTodo({ id: '1', title: 'Todo 1' })];
      const { component } = await setup(todos);
      const user = userEvent.setup();

      const toggleStarredSpy = vi.spyOn(component.toggleStarred, 'emit');

      const starButton = screen.getByLabelText(/star todo|unstar todo/i);
      await user.click(starButton);

      expect(toggleStarredSpy).toHaveBeenCalledWith(todos[0]);
    });

    it('should emit sortByChange event', async () => {
      const { component } = await setup();
      const user = userEvent.setup();

      const sortByChangeSpy = vi.spyOn(component.sortByChange, 'emit');

      component.setSortBy('priority');

      expect(sortByChangeSpy).toHaveBeenCalledWith('priority');
    });
  });

  describe('User Interactions', () => {
    it('should trigger setSortBy when sort selection changes', async () => {
      const { component } = await setup();
      const user = userEvent.setup();

      const setSortBySpy = vi.spyOn(component, 'setSortBy');
      const sortByChangeSpy = vi.spyOn(component.sortByChange, 'emit');

      component.setSortBy('createdAt');

      expect(setSortBySpy).toHaveBeenCalledWith('createdAt');
      expect(sortByChangeSpy).toHaveBeenCalledWith('createdAt');
    });

    it('should propagate events from TodoListItem components', async () => {
      const todos = [createMockTodo({ id: '1', title: 'Todo 1' })];
      const { component } = await setup(todos);
      const user = userEvent.setup();

      const toggleSpy = vi.spyOn(component.toggleTodo, 'emit');

      const checkbox = screen.getByLabelText(/mark 'todo 1' as/i);
      await user.click(checkbox);

      expect(toggleSpy).toHaveBeenCalled();
    });
  });

  describe('Event Emissions', () => {
    it('should bubble up events from TodoListItem components', async () => {
      const todos = [
        createMockTodo({ id: '1', title: 'Todo 1' }),
        createMockTodo({ id: '2', title: 'Todo 2' }),
      ];
      const { component } = await setup(todos);
      const user = userEvent.setup();

      const editSpy = vi.spyOn(component.editTodo, 'emit');

      const editButton = screen.getByLabelText(/edit 'todo 1'/i);
      await user.click(editButton);

      expect(editSpy).toHaveBeenCalledWith(todos[0]);
    });

    it('should emit sortByChange correctly', async () => {
      const { component } = await setup();

      const sortByChangeSpy = vi.spyOn(component.sortByChange, 'emit');

      component.setSortBy('updatedAt');

      expect(sortByChangeSpy).toHaveBeenCalledWith('updatedAt');
    });
  });

  describe('Template Rendering', () => {
    it('should render all todos in list', async () => {
      const todos = [
        createMockTodo({ id: '1', title: 'Todo 1' }),
        createMockTodo({ id: '2', title: 'Todo 2' }),
        createMockTodo({ id: '3', title: 'Todo 3' }),
      ];
      await setup(todos);

      expect(screen.getByText('Todo 1')).toBeInTheDocument();
      expect(screen.getByText('Todo 2')).toBeInTheDocument();
      expect(screen.getByText('Todo 3')).toBeInTheDocument();
    });

    it('should handle empty state', async () => {
      await setup([]);

      // When empty, no todo items should be rendered
      const todoItems = screen.queryAllByRole('article');
      expect(todoItems).toHaveLength(0);
    });

    it('should pass correct props to TodoListItem components', async () => {
      const todos = [createMockTodo({ id: '1', title: 'Test Todo' })];
      await setup(todos);

      // Verify that the todo item receives the correct todo
      expect(screen.getByText('Test Todo')).toBeInTheDocument();
    });

    it('should render multiple todos correctly', async () => {
      const todos = [
        createMockTodo({ id: '1', title: 'First Todo' }),
        createMockTodo({ id: '2', title: 'Second Todo' }),
        createMockTodo({ id: '3', title: 'Third Todo' }),
      ];
      await setup(todos);

      expect(screen.getByText('First Todo')).toBeInTheDocument();
      expect(screen.getByText('Second Todo')).toBeInTheDocument();
      expect(screen.getByText('Third Todo')).toBeInTheDocument();
    });
  });
});
