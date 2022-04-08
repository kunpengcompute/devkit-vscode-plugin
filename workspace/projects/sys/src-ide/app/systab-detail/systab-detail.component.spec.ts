import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SystabDetailComponent } from './systab-detail.component';

describe('SystabDetailComponent', () => {
  let component: SystabDetailComponent;
  let fixture: ComponentFixture<SystabDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SystabDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SystabDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
