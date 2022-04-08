import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DdrSummuryComponent } from './ddr-summury.component';

describe('DdrSummuryComponent', () => {
  let component: DdrSummuryComponent;
  let fixture: ComponentFixture<DdrSummuryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DdrSummuryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DdrSummuryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
