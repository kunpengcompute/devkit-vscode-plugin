import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DdrCatchDetailComponent } from './ddr-catch-detail.component';

describe('DdrCatchDetailComponent', () => {
  let component: DdrCatchDetailComponent;
  let fixture: ComponentFixture<DdrCatchDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DdrCatchDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DdrCatchDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
