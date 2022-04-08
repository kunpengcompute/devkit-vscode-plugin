import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProSummuryComponent } from './pro-summury.component';

describe('ProSummuryComponent', () => {
  let component: ProSummuryComponent;
  let fixture: ComponentFixture<ProSummuryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProSummuryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProSummuryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
