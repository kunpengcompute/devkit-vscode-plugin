import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderCertificateAgentComponent } from './header-certificate-agent.component';

describe('HeaderCertificateAgentComponent', () => {
  let component: HeaderCertificateAgentComponent;
  let fixture: ComponentFixture<HeaderCertificateAgentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeaderCertificateAgentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderCertificateAgentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
