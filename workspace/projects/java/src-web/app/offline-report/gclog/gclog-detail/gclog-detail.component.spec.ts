import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GclogDetailComponent } from './gclog-detail.component';

describe('GclogDetailComponent', () => {
  let component: GclogDetailComponent;
  let fixture: ComponentFixture<GclogDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GclogDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GclogDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
