import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TodoContainer } from './todo-container';

describe('TodoContainer', () => {
  let component: TodoContainer;
  let fixture: ComponentFixture<TodoContainer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodoContainer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TodoContainer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
