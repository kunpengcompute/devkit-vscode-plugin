import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MessionIoDetailComponent } from './mession-io-detail.component';

describe('MessionIoDetailComponent', () => {
  let component: MessionIoDetailComponent;
  let fixture: ComponentFixture<MessionIoDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MessionIoDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MessionIoDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
