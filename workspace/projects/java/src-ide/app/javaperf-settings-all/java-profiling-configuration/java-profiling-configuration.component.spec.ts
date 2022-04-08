import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JavaProfilingConfigurationComponent } from './java-profiling-configuration.component';

describe('JavaProfilingConfigurationComponent', () => {
  let component: JavaProfilingConfigurationComponent;
  let fixture: ComponentFixture<JavaProfilingConfigurationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JavaProfilingConfigurationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JavaProfilingConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
