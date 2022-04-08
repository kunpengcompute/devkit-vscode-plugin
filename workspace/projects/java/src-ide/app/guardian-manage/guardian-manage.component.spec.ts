import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GuardianManageComponent } from './guardian-manage.component';

describe('GuardianManageComponent', () => {
  let component: GuardianManageComponent;
  let fixture: ComponentFixture<GuardianManageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GuardianManageComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GuardianManageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
