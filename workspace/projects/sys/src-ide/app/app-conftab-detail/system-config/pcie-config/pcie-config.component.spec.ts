import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PcieConfigComponent } from './pcie-config.component';

describe('PcieConfigComponent', () => {
  let component: PcieConfigComponent;
  let fixture: ComponentFixture<PcieConfigComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PcieConfigComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PcieConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
