import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LocktabDetailComponent } from './locktab-detail.component';

describe('LocktabDetailComponent', () => {
  let component: LocktabDetailComponent;
  let fixture: ComponentFixture<LocktabDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LocktabDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LocktabDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
