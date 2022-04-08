import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MemorySubsystemComponent } from './memory-subsystem.component';

describe('MemorySubsystemComponent', () => {
  let component: MemorySubsystemComponent;
  let fixture: ComponentFixture<MemorySubsystemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MemorySubsystemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MemorySubsystemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
