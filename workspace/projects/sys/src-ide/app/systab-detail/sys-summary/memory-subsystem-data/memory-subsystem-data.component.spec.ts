import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MemorySubsystemDataComponent } from './memory-subsystem-data.component';

describe('MemorySubsystemDataComponent', () => {
  let component: MemorySubsystemDataComponent;
  let fixture: ComponentFixture<MemorySubsystemDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MemorySubsystemDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MemorySubsystemDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
