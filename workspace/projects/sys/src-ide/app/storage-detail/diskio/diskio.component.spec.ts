import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DiskioComponent } from './diskio.component';

describe('DiskioComponent', () => {
  let component: DiskioComponent;
  let fixture: ComponentFixture<DiskioComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DiskioComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DiskioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
