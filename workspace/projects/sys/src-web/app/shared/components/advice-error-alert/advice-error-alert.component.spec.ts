import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdviceErrorAlertComponent } from './advice-error-alert.component';

describe('AdviceErrorAlertComponent', () => {
  let component: AdviceErrorAlertComponent;
  let fixture: ComponentFixture<AdviceErrorAlertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdviceErrorAlertComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdviceErrorAlertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
