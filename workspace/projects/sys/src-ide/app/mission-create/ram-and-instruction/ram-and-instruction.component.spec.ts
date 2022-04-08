import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RamAndInstructionComponent } from './ram-and-instruction.component';

describe('RamAndInstructionComponent', () => {
  let component: RamAndInstructionComponent;
  let fixture: ComponentFixture<RamAndInstructionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RamAndInstructionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RamAndInstructionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
