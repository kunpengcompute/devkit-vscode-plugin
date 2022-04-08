import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CpuPackageNumaComponent } from './cpu-package-numa.component';

describe('CpuPackageNumaComponent', () => {
  let component: CpuPackageNumaComponent;
  let fixture: ComponentFixture<CpuPackageNumaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CpuPackageNumaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CpuPackageNumaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
