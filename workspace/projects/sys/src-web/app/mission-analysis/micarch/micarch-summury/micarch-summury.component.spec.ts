import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MicarchSummuryComponent } from './micarch-summury.component';

describe('MicarchSummuryComponent', () => {
  let component: MicarchSummuryComponent;
  let fixture: ComponentFixture<MicarchSummuryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MicarchSummuryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MicarchSummuryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
