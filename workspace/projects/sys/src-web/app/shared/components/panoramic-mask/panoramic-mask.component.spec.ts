import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanoramicMaskComponent } from './panoramic-mask.component';

describe('PanoramicMaskComponent', () => {
  let component: PanoramicMaskComponent;
  let fixture: ComponentFixture<PanoramicMaskComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanoramicMaskComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanoramicMaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
