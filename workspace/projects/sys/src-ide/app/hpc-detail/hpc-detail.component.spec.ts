import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HpcDetailComponent } from './hpc-detail.component';

describe('HpcDetailComponent', () => {
  let component: HpcDetailComponent;
  let fixture: ComponentFixture<HpcDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HpcDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HpcDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
