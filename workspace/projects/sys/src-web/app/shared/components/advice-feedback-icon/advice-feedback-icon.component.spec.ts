import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdviceFeedbackIconComponent } from './advice-feedback-icon.component';

describe('AdviceFeedbackIconComponent', () => {
  let component: AdviceFeedbackIconComponent;
  let fixture: ComponentFixture<AdviceFeedbackIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdviceFeedbackIconComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdviceFeedbackIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
