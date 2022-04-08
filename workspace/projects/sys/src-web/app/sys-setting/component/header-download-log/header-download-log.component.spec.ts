import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderDownloadLogComponent } from './header-download-log.component';

describe('HeaderDownloadLogComponent', () => {
  let component: HeaderDownloadLogComponent;
  let fixture: ComponentFixture<HeaderDownloadLogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeaderDownloadLogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderDownloadLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
