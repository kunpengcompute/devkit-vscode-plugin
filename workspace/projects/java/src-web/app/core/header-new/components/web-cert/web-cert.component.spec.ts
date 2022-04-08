import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WebCertComponent } from './web-cert.component';

describe('WebCertComponent', () => {
  let component: WebCertComponent;
  let fixture: ComponentFixture<WebCertComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WebCertComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WebCertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
