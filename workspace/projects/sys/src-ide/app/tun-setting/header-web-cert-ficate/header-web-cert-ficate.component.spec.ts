import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WebcertficateComponent } from './header-web-cert-ficate.component';

describe('WeakPwdComponent', () => {
  let component: WebcertficateComponent;
  let fixture: ComponentFixture<WebcertficateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WebcertficateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WebcertficateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
