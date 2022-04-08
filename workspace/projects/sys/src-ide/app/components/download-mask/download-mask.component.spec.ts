import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DownloadMaskComponent } from './download-mask.component';

describe('DownloadMaskComponent', () => {
  let component: DownloadMaskComponent;
  let fixture: ComponentFixture<DownloadMaskComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DownloadMaskComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DownloadMaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
