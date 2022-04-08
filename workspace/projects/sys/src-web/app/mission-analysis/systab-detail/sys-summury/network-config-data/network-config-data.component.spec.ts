import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NetworkConfigDataComponent } from './network-config-data.component';

describe('NetworkConfigDataComponent', () => {
  let component: NetworkConfigDataComponent;
  let fixture: ComponentFixture<NetworkConfigDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NetworkConfigDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NetworkConfigDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
