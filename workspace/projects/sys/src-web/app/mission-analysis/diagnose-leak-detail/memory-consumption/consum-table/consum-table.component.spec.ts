import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsumTableComponent } from './consum-table.component';

describe('ConsumTableComponent', () => {
  let component: ConsumTableComponent;
  let fixture: ComponentFixture<ConsumTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConsumTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsumTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
