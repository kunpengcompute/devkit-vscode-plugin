import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessNodeConfigPidComponent } from './process-node-config-pid.component';

describe('ProcessNodeConfigPidComponent', () => {
  let component: ProcessNodeConfigPidComponent;
  let fixture: ComponentFixture<ProcessNodeConfigPidComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProcessNodeConfigPidComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessNodeConfigPidComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
