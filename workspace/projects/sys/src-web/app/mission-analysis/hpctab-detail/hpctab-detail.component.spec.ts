import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HpctabDetailComponent } from './hpctab-detail.component';

describe('HpctabDetailComponent', () => {
  let component: HpctabDetailComponent;
  let fixture: ComponentFixture<HpctabDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HpctabDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HpctabDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
