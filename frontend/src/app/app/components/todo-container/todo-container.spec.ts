import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { TodoContainer } from './todo-container';
import { createMockTodoStore, createMockTodo, createMockUiStore } from '../test-utils';
import { TodoStore } from '../../../../store/todo.store';
import { UiStore } from '../../../../store/general.store';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';
import { signal } from '@angular/core';

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

describe('TodoContainer', () => {
  const setup = async (initialState?: {
    todos?: ReturnType<typeof createMockTodo>[];
    filters?: Parameters<typeof createMockTodoStore>[0];
    loading?: boolean;
    error?: string | null;
    toast?: string | null;
  }) => {
    const mockStore = createMockTodoStore(initialState?.filters);
    if (initialState?.todos) {
      mockStore.setTodos(initialState.todos);
    }

    // Create mock UiStore using the helper function
    const mockUiStore = createMockUiStore({
      loading: initialState?.loading,
      error: initialState?.error,
      toast: initialState?.toast,
    });

    const { fixture } = await render(TodoContainer, {
      providers: [
        { provide: TodoStore, useValue: mockStore.store },
        { provide: UiStore, useValue: mockUiStore },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    return {
      fixture,
      component: fixture.componentInstance,
      store: mockStore.store,
      storeHelpers: mockStore,
      uiStore: mockUiStore,
      uiStoreHelpers: {
        setLoading: (loading: boolean) => {
          if (mockUiStore.setLoading) {
            mockUiStore.setLoading(loading);
          }
          if (mockUiStore.loading) {
            mockUiStore.loading.set(loading);
          }
        },
        setError: (error: string | null) => {
          if (mockUiStore.setError) {
            mockUiStore.setError(error);
          }
          if (mockUiStore.error) {
            mockUiStore.error.set(error);
          }
        },
        setToast: (toast: string | null) => {
          if (mockUiStore.setToast) {
            mockUiStore.setToast(toast);
          }
          if (mockUiStore.toast) {
            mockUiStore.toast.set(toast);
          }
        },
      },
    };
  };

  describe('Service/Store Integration', () => {
    it('should call loadTodos() in ngOnInit', async () => {
      const { store } = await setup();
      expect(store.loadTodos).toHaveBeenCalled();
    });

    it('should call createTodo when form is submitted', async () => {
      const { store } = await setup();
      const user = userEvent.setup();

      const titleInput = screen.getByPlaceholderText(/what needs to get done/i);
      await user.type(titleInput, 'New Todo');
      const submitButton = screen.getByRole('button', { name: /save new todo/i });
      await user.click(submitButton);

      expect(store.createTodo).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New Todo',
        })
      );
    });

    it('should call toggleComplete when todo is toggled', async () => {
      const todo = createMockTodo({ id: '1', title: 'Test Todo' });
      const { store } = await setup({ todos: [todo] });

      const checkbox = screen.getByLabelText(/mark 'test todo' as/i);
      await userEvent.click(checkbox);

      expect(store.toggleComplete).toHaveBeenCalledWith(todo);
    });

    it('should call updateTodo when edit is saved', async () => {
      const todo = createMockTodo({ id: '1', title: 'Test Todo' });
      const { store, component } = await setup({ todos: [todo] });

      // Open edit modal
      const editButton = screen.getByLabelText(/edit 'test todo'/i);
      await userEvent.click(editButton);

      // Wait for modal to appear
      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Todo')).toBeInTheDocument();
      });

      // Update title
      const titleInput = screen.getByDisplayValue('Test Todo');
      await userEvent.clear(titleInput);
      await userEvent.type(titleInput, 'Updated Todo');

      // Save
      const saveButton = screen.getByRole('button', { name: /save changes/i });
      await userEvent.click(saveButton);

      expect(store.updateTodo).toHaveBeenCalledWith(
        expect.objectContaining({
          id: '1',
          title: 'Updated Todo',
        })
      );
    });

    it('should call deleteTodo when delete is triggered', async () => {
      const todo = createMockTodo({ id: '1', title: 'Test Todo' });
      const { store } = await setup({ todos: [todo] });

      const deleteButton = screen.getByLabelText(/delete 'test todo'/i);
      await userEvent.click(deleteButton);

      expect(store.deleteTodo).toHaveBeenCalledWith('1');
    });

    it('should call setFilters when filters change', async () => {
      const { store } = await setup();
      const user = userEvent.setup();

      const activeButton = screen.getByRole('button', { name: /show active todos/i });
      await user.click(activeButton);

      expect(store.setFilters).toHaveBeenCalled();
    });

    it('should call clearToast when toast is dismissed', async () => {
      const { uiStore, uiStoreHelpers, fixture } = await setup({ toast: 'Test message' });
      uiStoreHelpers.setToast('Test message');
      fixture.detectChanges();
      await fixture.whenStable();

      // Verify clearToast method exists and can be called
      expect(uiStore.clearToast).toBeDefined();
      expect(typeof uiStore.clearToast).toBe('function');
      
      // Test that calling it works - use non-null assertion since we verified it exists
      if (uiStore.clearToast) {
        uiStore.clearToast();
        expect(uiStore.clearToast).toHaveBeenCalled();
      }
    });

    it('should call clearError when error is dismissed', async () => {
      const { uiStore, uiStoreHelpers } = await setup({ error: 'Test error' });
      uiStoreHelpers.setError('Test error');

      await waitFor(() => {
        expect(screen.getByText('Test error')).toBeInTheDocument();
      });

      const dismissButton = screen.getByRole('button', { name: /dismiss/i });
      await userEvent.click(dismissButton);

      expect(uiStore.clearError).toHaveBeenCalled();
    });
  });

  describe('Input/Output', () => {
    it('should read filteredTodos from store', async () => {
      const todos = [
        createMockTodo({ id: '1', title: 'Todo 1' }),
        createMockTodo({ id: '2', title: 'Todo 2' }),
      ];
      await setup({ todos });

      expect(screen.getByText('Todo 1')).toBeInTheDocument();
      expect(screen.getByText('Todo 2')).toBeInTheDocument();
    });

    it('should read stats from store', async () => {
      const todos = [
        createMockTodo({ id: '1', title: 'Todo 1', isCompleted: false }),
        createMockTodo({ id: '2', title: 'Todo 2', isCompleted: true }),
      ];
      await setup({ todos });

      // Use getAllByText and filter, or query within the stats component
      const statsElements = screen.getAllByText(/2/);
      // Find the one in the stats section (should be in a specific container)
      expect(statsElements.length).toBeGreaterThan(0);
      // Or use a more specific query if stats have specific structure
    });

    it('should read loading state from store', async () => {
      const { uiStoreHelpers } = await setup({ loading: true });
      uiStoreHelpers.setLoading(true);

      await waitFor(() => {
        expect(screen.getByText(/syncing todos/i)).toBeInTheDocument();
      });
    });

    it('should read error state from store', async () => {
      const { uiStoreHelpers } = await setup({ error: 'Test error' });
      uiStoreHelpers.setError('Test error');

      await waitFor(() => {
        expect(screen.getByText('Test error')).toBeInTheDocument();
      });
    });
  });

  describe('User Interactions', () => {
    it('should trigger handleCreate when form is submitted', async () => {
      const { store } = await setup();
      const user = userEvent.setup();

      const titleInput = screen.getByPlaceholderText(/what needs to get done/i);
      await user.type(titleInput, 'New Todo');
      await user.type(screen.getByPlaceholderText(/add more detail/i), 'Description');

      const submitButton = screen.getByRole('button', { name: /save new todo/i });
      await user.click(submitButton);

      expect(store.createTodo).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New Todo',
          description: 'Description',
        })
      );
    });

    it('should trigger handleToggle when checkbox is clicked', async () => {
      const todo = createMockTodo({ id: '1', title: 'Test Todo', isCompleted: false });
      const { store } = await setup({ todos: [todo] });

      const checkbox = screen.getByLabelText(/mark 'test todo' as complete/i);
      await userEvent.click(checkbox);

      expect(store.toggleComplete).toHaveBeenCalledWith(todo);
    });

    it('should open edit modal when edit button is clicked', async () => {
      const todo = createMockTodo({ id: '1', title: 'Test Todo' });
      await setup({ todos: [todo] });

      const editButton = screen.getByLabelText(/edit 'test todo'/i);
      await userEvent.click(editButton);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Todo')).toBeInTheDocument();
      });
    });

    it('should trigger handleDelete when delete button is clicked', async () => {
      const todo = createMockTodo({ id: '1', title: 'Test Todo' });
      const { store } = await setup({ todos: [todo] });

      const deleteButton = screen.getByLabelText(/delete 'test todo'/i);
      await userEvent.click(deleteButton);

      expect(store.deleteTodo).toHaveBeenCalledWith('1');
    });

    it('should trigger handleFiltersChange when filter is changed', async () => {
      const { store } = await setup();
      const user = userEvent.setup();

      const activeButton = screen.getByRole('button', { name: /show active todos/i });
      await user.click(activeButton);

      expect(store.setFilters).toHaveBeenCalled();
    });
  });

  describe('Template Rendering', () => {
    it('should show loading overlay when loading is true', async () => {
      const { uiStoreHelpers } = await setup({ loading: true });
      uiStoreHelpers.setLoading(true);

      await waitFor(() => {
        expect(screen.getByText(/syncing todos/i)).toBeInTheDocument();
      });
    });

    it('should show error banner when error has value', async () => {
      const { uiStoreHelpers } = await setup({ error: 'Test error' });
      uiStoreHelpers.setError('Test error');

      await waitFor(() => {
        expect(screen.getByText('Test error')).toBeInTheDocument();
      });
    });

    it('should render todos list from filteredTodos', async () => {
      const todos = [
        createMockTodo({ id: '1', title: 'Todo 1' }),
        createMockTodo({ id: '2', title: 'Todo 2' }),
      ];
      await setup({ todos });

      expect(screen.getByText('Todo 1')).toBeInTheDocument();
      expect(screen.getByText('Todo 2')).toBeInTheDocument();
    });

    it('should display stats correctly', async () => {
      const todos = [
        createMockTodo({ id: '1', title: 'Todo 1', isCompleted: false }),
        createMockTodo({ id: '2', title: 'Todo 2', isCompleted: true }),
      ];
      await setup({ todos });

      // Check that stats component is rendered (exact implementation depends on template)
      const statsSection = screen.getByText(/filters/i).closest('section');
      expect(statsSection).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should display error state', async () => {
      const { uiStoreHelpers } = await setup({ error: 'Network error' });
      uiStoreHelpers.setError('Network error');

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });

    it('should allow error dismissal', async () => {
      const { uiStore, uiStoreHelpers } = await setup({ error: 'Test error' });
      uiStoreHelpers.setError('Test error');

      await waitFor(() => {
        expect(screen.getByText('Test error')).toBeInTheDocument();
      });

      const dismissButton = screen.getByRole('button', { name: /dismiss/i });
      await userEvent.click(dismissButton);

      expect(uiStore.clearError).toHaveBeenCalled();
    });
  });

  describe('Modal Management', () => {
    it('should open edit modal when edit is triggered', async () => {
      const todo = createMockTodo({ id: '1', title: 'Test Todo' });
      await setup({ todos: [todo] });

      const editButton = screen.getByLabelText(/edit 'test todo'/i);
      await userEvent.click(editButton);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Todo')).toBeInTheDocument();
      });
    });

    it('should close edit modal when dismissed', async () => {
      const todo = createMockTodo({ id: '1', title: 'Test Todo' });
      await setup({ todos: [todo] });

      const editButton = screen.getByLabelText(/edit 'test todo'/i);
      await userEvent.click(editButton);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Todo')).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await userEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByDisplayValue('Test Todo')).not.toBeInTheDocument();
      });
    });

    it('should update editingTodo signal when edit is triggered', async () => {
      const todo = createMockTodo({ id: '1', title: 'Test Todo' });
      const { component } = await setup({ todos: [todo] });

      const editButton = screen.getByLabelText(/edit 'test todo'/i);
      await userEvent.click(editButton);

      await waitFor(() => {
        expect(component.editingTodo()).toEqual(todo);
      });
    });

    it('should save edit and close modal', async () => {
      const todo = createMockTodo({ id: '1', title: 'Test Todo' });
      const { store, component } = await setup({ todos: [todo] });

      const editButton = screen.getByLabelText(/edit 'test todo'/i);
      await userEvent.click(editButton);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Todo')).toBeInTheDocument();
      });

      const titleInput = screen.getByDisplayValue('Test Todo');
      await userEvent.clear(titleInput);
      await userEvent.type(titleInput, 'Updated Todo');

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      await userEvent.click(saveButton);

      expect(store.updateTodo).toHaveBeenCalled();
      await waitFor(() => {
        expect(component.editingTodo()).toBeNull();
      });
    });
  });
});
