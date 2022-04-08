import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MissDetailComponent } from './miss-detail.component';

describe('MissDetailComponent', () => {
  let component: MissDetailComponent;
  let fixture: ComponentFixture<MissDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MissDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MissDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
