import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RunUserInputComponent } from './run-user-input.component';

describe('RunUserInputComponent', () => {
  let component: RunUserInputComponent;
  let fixture: ComponentFixture<RunUserInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RunUserInputComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RunUserInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
