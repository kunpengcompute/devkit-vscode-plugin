import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NumaNodeSwitchDetailComponent } from './numa-node-switch-detail.component';

describe('NumaNodeSwitchDetailComponent', () => {
  let component: NumaNodeSwitchDetailComponent;
  let fixture: ComponentFixture<NumaNodeSwitchDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NumaNodeSwitchDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NumaNodeSwitchDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
