import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FreeRemoteEnvironmentComponent } from './free-remote-environment.component';

describe('FreeRemoteEnvironmentComponent', () => {
  let component: FreeRemoteEnvironmentComponent;
  let fixture: ComponentFixture<FreeRemoteEnvironmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FreeRemoteEnvironmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FreeRemoteEnvironmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
