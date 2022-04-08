import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppParamsInputComponent } from './app-params-input.component';

describe('AppParamsInputComponent', () => {
  let component: AppParamsInputComponent;
  let fixture: ComponentFixture<AppParamsInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppParamsInputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppParamsInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
