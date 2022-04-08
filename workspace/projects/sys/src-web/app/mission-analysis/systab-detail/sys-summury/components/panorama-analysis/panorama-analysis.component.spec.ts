import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanoramaAnalysisComponent } from './panorama-analysis.component';

describe('PanoramaAnalysisComponent', () => {
  let component: PanoramaAnalysisComponent;
  let fixture: ComponentFixture<PanoramaAnalysisComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanoramaAnalysisComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanoramaAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
