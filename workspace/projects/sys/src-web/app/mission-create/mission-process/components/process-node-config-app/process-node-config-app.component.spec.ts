import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessNodeConfigAppComponent } from './process-node-config-app.component';

describe('ProcessNodeConfigAppComponent', () => {
  let component: ProcessNodeConfigAppComponent;
  let fixture: ComponentFixture<ProcessNodeConfigAppComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProcessNodeConfigAppComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessNodeConfigAppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
