import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SourceCodeViewerComponent } from './source-code-viewer.component';

describe('SourceCodeViewerComponent', () => {
  let component: SourceCodeViewerComponent;
  let fixture: ComponentFixture<SourceCodeViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SourceCodeViewerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SourceCodeViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
