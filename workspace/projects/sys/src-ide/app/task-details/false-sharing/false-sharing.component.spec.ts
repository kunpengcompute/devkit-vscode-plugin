import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FalseSharingComponent } from './false-sharing.component';

describe('FalseSharingComponent', () => {
  let component: FalseSharingComponent;
  let fixture: ComponentFixture<FalseSharingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FalseSharingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FalseSharingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
