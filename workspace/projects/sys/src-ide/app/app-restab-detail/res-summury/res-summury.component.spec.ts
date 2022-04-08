import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResSummuryComponent } from './res-summury.component';

describe('ResSummuryComponent', () => {
  let component: ResSummuryComponent;
  let fixture: ComponentFixture<ResSummuryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResSummuryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResSummuryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
