import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreaddumpDetailComponent } from './threaddump-detail.component';

describe('ThreaddumpDetailComponent', () => {
  let component: ThreaddumpDetailComponent;
  let fixture: ComponentFixture<ThreaddumpDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ThreaddumpDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ThreaddumpDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
