import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GuardianCreateComponent } from './guardian-create.component';

describe('MigrationCenterComponent', () => {
  let component: GuardianCreateComponent;
  let fixture: ComponentFixture<GuardianCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GuardianCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GuardianCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
