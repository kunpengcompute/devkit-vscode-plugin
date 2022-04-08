import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtrapositionAxisComponent } from './extraposition-axis.component';

describe('ExtrapositionAxisComponent', () => {
  let component: ExtrapositionAxisComponent;
  let fixture: ComponentFixture<ExtrapositionAxisComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExtrapositionAxisComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExtrapositionAxisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
