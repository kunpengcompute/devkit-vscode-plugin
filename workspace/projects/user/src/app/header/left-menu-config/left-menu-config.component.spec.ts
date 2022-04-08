import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LeftMenuConfigComponent } from './left-menu-config.component';

describe('LeftMenuConfigComponent', () => {
  let component: LeftMenuConfigComponent;
  let fixture: ComponentFixture<LeftMenuConfigComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LeftMenuConfigComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LeftMenuConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
