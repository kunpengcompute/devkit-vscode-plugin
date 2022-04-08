import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NetworkTableComponent } from './network-table.component';

describe('NetworkTableComponent', () => {
  let component: NetworkTableComponent;
  let fixture: ComponentFixture<NetworkTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NetworkTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NetworkTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
