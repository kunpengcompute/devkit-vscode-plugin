import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CpuPackageComponent } from './cpu-package.component';

describe('CpuPackageComponent', () => {
  let component: CpuPackageComponent;
  let fixture: ComponentFixture<CpuPackageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CpuPackageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CpuPackageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
