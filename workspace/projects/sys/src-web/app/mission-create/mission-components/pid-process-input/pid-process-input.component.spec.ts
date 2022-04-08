import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PidProcessInputComponent } from './pid-process-input.component';

describe('PidProcessInputComponent', () => {
  let component: PidProcessInputComponent;
  let fixture: ComponentFixture<PidProcessInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PidProcessInputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PidProcessInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
