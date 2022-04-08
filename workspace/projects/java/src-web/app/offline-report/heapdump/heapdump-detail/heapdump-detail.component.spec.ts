import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeapdumpDetailComponent } from './heapdump-detail.component';

describe('HeapdumpDetailComponent', () => {
  let component: HeapdumpDetailComponent;
  let fixture: ComponentFixture<HeapdumpDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HeapdumpDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HeapdumpDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
