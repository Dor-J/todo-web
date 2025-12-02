import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TodoFilters } from './todo-filters';

describe('TodoFilters', () => {
  let component: TodoFilters;
  let fixture: ComponentFixture<TodoFilters>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodoFilters]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TodoFilters);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
