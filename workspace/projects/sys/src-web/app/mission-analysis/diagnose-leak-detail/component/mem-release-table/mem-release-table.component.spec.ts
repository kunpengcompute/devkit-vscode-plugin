import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemReleaseTableComponent } from './mem-release-table.component';

describe('MemReleaseTableComponent', () => {
  let component: MemReleaseTableComponent;
  let fixture: ComponentFixture<MemReleaseTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MemReleaseTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MemReleaseTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
