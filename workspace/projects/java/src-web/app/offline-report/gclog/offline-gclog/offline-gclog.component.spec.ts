import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfflineGclogComponent } from './offline-gclog.component';

describe('OfflineGclogComponent', () => {
  let component: OfflineGclogComponent;
  let fixture: ComponentFixture<OfflineGclogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OfflineGclogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OfflineGclogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
