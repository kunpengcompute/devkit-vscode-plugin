import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskTmplComponent } from './task-tmpl.component';

describe('TaskTmplComponent', () => {
  let component: TaskTmplComponent;
  let fixture: ComponentFixture<TaskTmplComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaskTmplComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskTmplComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
