import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppConftabDetailComponent } from './app-conftab-detail.component';

describe('AppConftabDetailComponent', () => {
  let component: AppConftabDetailComponent;
  let fixture: ComponentFixture<AppConftabDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppConftabDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppConftabDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
