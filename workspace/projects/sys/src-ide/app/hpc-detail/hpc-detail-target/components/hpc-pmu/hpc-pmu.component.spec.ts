import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HpcPmuComponent } from './hpc-pmu.component';

describe('HpcPmuComponent', () => {
  let component: HpcPmuComponent;
  let fixture: ComponentFixture<HpcPmuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HpcPmuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HpcPmuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
