import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemReleaseSubTableComponent } from './mem-release-sub-table.component';

describe('MemReleaseSubTableComponent', () => {
  let component: MemReleaseSubTableComponent;
  let fixture: ComponentFixture<MemReleaseSubTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MemReleaseSubTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MemReleaseSubTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
