import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SysNetComponent } from './sys-net.component';

describe('SysNetComponent', () => {
  let component: SysNetComponent;
  let fixture: ComponentFixture<SysNetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SysNetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SysNetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
