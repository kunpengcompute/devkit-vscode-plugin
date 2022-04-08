import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LockGraphComponent } from './lock-graph.component';

describe('LockGraphComponent', () => {
  let component: LockGraphComponent;
  let fixture: ComponentFixture<LockGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LockGraphComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LockGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
