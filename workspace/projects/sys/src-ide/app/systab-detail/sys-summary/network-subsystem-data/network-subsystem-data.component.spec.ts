import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NetworkSubsystemDataComponent } from './network-subsystem-data.component';

describe('NetworkSubsystemDataComponent', () => {
  let component: NetworkSubsystemDataComponent;
  let fixture: ComponentFixture<NetworkSubsystemDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NetworkSubsystemDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NetworkSubsystemDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
