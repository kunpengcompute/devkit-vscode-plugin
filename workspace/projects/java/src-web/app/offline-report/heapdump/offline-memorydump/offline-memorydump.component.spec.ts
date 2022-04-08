import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfflineMemorydumpComponent } from './offline-memorydump.component';

describe('OfflineMemorydumpComponent', () => {
  let component: OfflineMemorydumpComponent;
  let fixture: ComponentFixture<OfflineMemorydumpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OfflineMemorydumpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OfflineMemorydumpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
