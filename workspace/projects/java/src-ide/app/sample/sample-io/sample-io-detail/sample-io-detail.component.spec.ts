import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SampleIoDetailComponent } from './sample-io-detail.component';

describe('SampleIoDetailComponent', () => {
  let component: SampleIoDetailComponent;
  let fixture: ComponentFixture<SampleIoDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SampleIoDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SampleIoDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
