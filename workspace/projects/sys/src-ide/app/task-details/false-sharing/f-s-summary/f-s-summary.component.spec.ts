import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FSSummaryComponent } from './f-s-summary.component';

describe('FSSummaryComponent', () => {
  let component: FSSummaryComponent;
  let fixture: ComponentFixture<FSSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FSSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FSSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
