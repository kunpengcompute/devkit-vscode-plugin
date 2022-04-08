import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderCertComponent } from './header-cert.component';

describe('HeaderCertComponent', () => {
  let component: HeaderCertComponent;
  let fixture: ComponentFixture<HeaderCertComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeaderCertComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderCertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
