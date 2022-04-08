import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpCompareComponent } from './http-compare.component';

describe('HttpCompareComponent', () => {
  let component: HttpCompareComponent;
  let fixture: ComponentFixture<HttpCompareComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HttpCompareComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HttpCompareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
