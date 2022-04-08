import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GcLogComponent } from './gc-log.component';

describe('GcLogComponent', () => {
  let component: GcLogComponent;
  let fixture: ComponentFixture<GcLogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GcLogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GcLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
