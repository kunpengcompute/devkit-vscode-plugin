import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SocketioCompareComponent } from './socketio-compare.component';

describe('SocketioCompareComponent', () => {
  let component: SocketioCompareComponent;
  let fixture: ComponentFixture<SocketioCompareComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SocketioCompareComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SocketioCompareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
