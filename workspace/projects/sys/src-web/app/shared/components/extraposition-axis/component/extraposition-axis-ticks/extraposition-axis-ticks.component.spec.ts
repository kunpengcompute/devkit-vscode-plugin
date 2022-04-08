import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtrapositionAxisTicksComponent } from './extraposition-axis-ticks.component';

describe('ExtrapositionAxisTicksComponent', () => {
  let component: ExtrapositionAxisTicksComponent;
  let fixture: ComponentFixture<ExtrapositionAxisTicksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExtrapositionAxisTicksComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExtrapositionAxisTicksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
