import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VirtualMachinConfigComponent } from './virtual-machin-config.component';

describe('VirtualMachinConfigComponent', () => {
  let component: VirtualMachinConfigComponent;
  let fixture: ComponentFixture<VirtualMachinConfigComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VirtualMachinConfigComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VirtualMachinConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
