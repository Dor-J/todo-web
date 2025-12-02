import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TodoEditModal } from './todo-edit-modal';

describe('TodoEditModal', () => {
  let component: TodoEditModal;
  let fixture: ComponentFixture<TodoEditModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodoEditModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TodoEditModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
