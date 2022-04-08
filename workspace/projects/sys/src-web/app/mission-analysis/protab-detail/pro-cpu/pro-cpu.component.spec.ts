import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProCpuComponent } from './pro-cpu.component';

describe('ProCpuComponent', () => {
  let component: ProCpuComponent;
  let fixture: ComponentFixture<ProCpuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProCpuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProCpuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
