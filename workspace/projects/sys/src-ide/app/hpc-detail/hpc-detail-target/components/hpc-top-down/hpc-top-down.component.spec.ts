import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HpcTopDownComponent } from './hpc-top-down.component';

describe('HpcTopDownComponent', () => {
  let component: HpcTopDownComponent;
  let fixture: ComponentFixture<HpcTopDownComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HpcTopDownComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HpcTopDownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
