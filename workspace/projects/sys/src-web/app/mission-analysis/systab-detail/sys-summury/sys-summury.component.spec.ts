import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SysSummuryComponent } from './sys-summury.component';

describe('SysSummuryComponent', () => {
  let component: SysSummuryComponent;
  let fixture: ComponentFixture<SysSummuryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SysSummuryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SysSummuryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
