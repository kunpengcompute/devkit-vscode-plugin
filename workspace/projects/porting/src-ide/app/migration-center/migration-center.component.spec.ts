import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MigrationCenterComponent } from './migration-center.component';

describe('MigrationCenterComponent', () => {
  let component: MigrationCenterComponent;
  let fixture: ComponentFixture<MigrationCenterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MigrationCenterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MigrationCenterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
