import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CpuPackageNumaTableComponent } from './cpu-package-numa-table.component';

describe('CpuPackageNumaTableComponent', () => {
  let component: CpuPackageNumaTableComponent;
  let fixture: ComponentFixture<CpuPackageNumaTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CpuPackageNumaTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CpuPackageNumaTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
