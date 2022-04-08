import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemLeakTableComponent } from './mem-leak-table.component';

describe('MemLeakTableComponent', () => {
  let component: MemLeakTableComponent;
  let fixture: ComponentFixture<MemLeakTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MemLeakTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MemLeakTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
