import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HpcMemInstructComponent } from './hpc-mem-instruct.component';

describe('HpcMemInstructComponent', () => {
  let component: HpcMemInstructComponent;
  let fixture: ComponentFixture<HpcMemInstructComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HpcMemInstructComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HpcMemInstructComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
