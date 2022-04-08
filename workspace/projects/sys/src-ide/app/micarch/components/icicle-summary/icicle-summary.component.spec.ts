import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IcicleSummaryComponent } from './icicle-summary.component';

describe('IcicleSummaryComponent', () => {
  let component: IcicleSummaryComponent;
  let fixture: ComponentFixture<IcicleSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IcicleSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IcicleSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
