import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CpuConfigComponent } from './cpu-config.component';

describe('CpuConfigComponent', () => {
  let component: CpuConfigComponent;
  let fixture: ComponentFixture<CpuConfigComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CpuConfigComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CpuConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
