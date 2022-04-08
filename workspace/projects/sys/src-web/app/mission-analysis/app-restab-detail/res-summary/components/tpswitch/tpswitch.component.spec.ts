import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TPSwitchComponent } from './tpswitch.component';

describe('TPSwitchComponent', () => {
  let component: TPSwitchComponent;
  let fixture: ComponentFixture<TPSwitchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TPSwitchComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TPSwitchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
