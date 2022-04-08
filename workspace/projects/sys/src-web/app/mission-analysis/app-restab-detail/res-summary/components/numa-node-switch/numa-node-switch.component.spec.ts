import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NumaNodeSwitchComponent } from './numa-node-switch.component';

describe('NumaNodeSwitchComponent', () => {
  let component: NumaNodeSwitchComponent;
  let fixture: ComponentFixture<NumaNodeSwitchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NumaNodeSwitchComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NumaNodeSwitchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
