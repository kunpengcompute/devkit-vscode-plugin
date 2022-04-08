import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MissStatisticsComponent } from './miss-statistics.component';

describe('MissStatisticsComponent', () => {
  let component: MissStatisticsComponent;
  let fixture: ComponentFixture<MissStatisticsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MissStatisticsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MissStatisticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
