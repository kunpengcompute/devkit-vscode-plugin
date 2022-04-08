import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MigrationDetailComponent } from './migration-detail.component';

describe('MigrationDetailComponent', () => {
  let component: MigrationDetailComponent;
  let fixture: ComponentFixture<MigrationDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MigrationDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MigrationDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
