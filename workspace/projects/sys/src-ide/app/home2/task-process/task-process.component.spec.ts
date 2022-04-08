import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskProcessComponent } from './task-process.component';

describe('TaskProcessComponent', () => {
  let component: TaskProcessComponent;
  let fixture: ComponentFixture<TaskProcessComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaskProcessComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
