import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SourceCodeViewerSliderComponent } from './source-code-viewer-slider.component';

describe('SourceCodeViewerSliderComponent', () => {
  let component: SourceCodeViewerSliderComponent;
  let fixture: ComponentFixture<SourceCodeViewerSliderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SourceCodeViewerSliderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SourceCodeViewerSliderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
