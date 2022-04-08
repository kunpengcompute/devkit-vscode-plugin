import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemoryConsumptionComponent } from './memory-consumption.component';

describe('MemoryConsumptionComponent', () => {
  let component: MemoryConsumptionComponent;
  let fixture: ComponentFixture<MemoryConsumptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MemoryConsumptionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MemoryConsumptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
