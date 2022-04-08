import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BrushDetailsComponent } from './brush-details.component';

describe('BrushDetailsComponent', () => {
  let component: BrushDetailsComponent;
  let fixture: ComponentFixture<BrushDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BrushDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BrushDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
