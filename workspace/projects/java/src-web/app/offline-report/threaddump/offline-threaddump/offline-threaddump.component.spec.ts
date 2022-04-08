import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfflineThreaddumpComponent } from './offline-threaddump.component';

describe('OfflineThreaddumpComponent', () => {
  let component: OfflineThreaddumpComponent;
  let fixture: ComponentFixture<OfflineThreaddumpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OfflineThreaddumpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OfflineThreaddumpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
