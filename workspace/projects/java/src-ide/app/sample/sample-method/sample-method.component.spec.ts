import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SampleMethodComponent } from './sample-method.component';

describe('SampleMethodComponent', () => {
  let component: SampleMethodComponent;
  let fixture: ComponentFixture<SampleMethodComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SampleMethodComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SampleMethodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
