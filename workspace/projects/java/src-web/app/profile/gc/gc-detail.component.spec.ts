import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GcDetailComponent } from './gc-detail.component';

describe('GcDetailComponent', () => {
  let component: GcDetailComponent;
  let fixture: ComponentFixture<GcDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GcDetailComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GcDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
