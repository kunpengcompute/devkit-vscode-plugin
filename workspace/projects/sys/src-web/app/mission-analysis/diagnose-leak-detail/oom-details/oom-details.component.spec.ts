import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OomDetailsComponent } from './oom-details.component';

describe('OomDetailsComponent', () => {
  let component: OomDetailsComponent;
  let fixture: ComponentFixture<OomDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OomDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OomDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
