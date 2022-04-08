import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HpcDetailTargetComponent } from './hpc-detail-target.component';

describe('HpcDetailTargetComponent', () => {
  let component: HpcDetailTargetComponent;
  let fixture: ComponentFixture<HpcDetailTargetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HpcDetailTargetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HpcDetailTargetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
