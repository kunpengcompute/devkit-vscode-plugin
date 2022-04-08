import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BrushTipsComponent } from './brush-tips.component';

describe('BrushTipsComponent', () => {
  let component: BrushTipsComponent;
  let fixture: ComponentFixture<BrushTipsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BrushTipsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BrushTipsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
