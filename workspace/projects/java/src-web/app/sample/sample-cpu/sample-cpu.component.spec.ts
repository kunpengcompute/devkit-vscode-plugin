import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SampleCpuComponent } from './sample-cpu.component';

describe('SampleCpuComponent', () => {
  let component: SampleCpuComponent;
  let fixture: ComponentFixture<SampleCpuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SampleCpuComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SampleCpuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
