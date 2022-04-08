import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WebDetailComponent } from './web-detail.component';

describe('WebDetailComponent', () => {
  let component: WebDetailComponent;
  let fixture: ComponentFixture<WebDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [WebDetailComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WebDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
