import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CpuTopologyComponent } from './cpu-topology.component';

describe('CpuTopologyComponent', () => {
  let component: CpuTopologyComponent;
  let fixture: ComponentFixture<CpuTopologyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CpuTopologyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CpuTopologyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
