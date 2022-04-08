import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IoDetailComponent } from './io-detail.component';

describe('IoDetailComponent', () => {
  let component: IoDetailComponent;
  let fixture: ComponentFixture<IoDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IoDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IoDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
