import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProtabDetailComponent } from './protab-detail.component';

describe('ProtabDetailComponent', () => {
  let component: ProtabDetailComponent;
  let fixture: ComponentFixture<ProtabDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProtabDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProtabDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
