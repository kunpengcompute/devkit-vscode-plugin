import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HpcOpenMpComponent } from './hpc-open-mp.component';

describe('HpcOpenMpComponent', () => {
  let component: HpcOpenMpComponent;
  let fixture: ComponentFixture<HpcOpenMpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HpcOpenMpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HpcOpenMpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
