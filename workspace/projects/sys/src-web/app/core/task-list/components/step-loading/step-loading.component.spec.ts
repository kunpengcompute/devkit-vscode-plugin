import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StepLoadingComponent } from './step-loading.component';

describe('StepLoadingComponent', () => {
  let component: StepLoadingComponent;
  let fixture: ComponentFixture<StepLoadingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StepLoadingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StepLoadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
