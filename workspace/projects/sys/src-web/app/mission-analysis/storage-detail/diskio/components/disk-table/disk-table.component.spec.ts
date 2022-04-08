import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DiskTableComponent } from './disk-table.component';

describe('DiskTableComponent', () => {
  let component: DiskTableComponent;
  let fixture: ComponentFixture<DiskTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DiskTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DiskTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
