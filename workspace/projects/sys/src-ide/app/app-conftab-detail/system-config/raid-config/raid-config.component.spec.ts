import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RaidConfigComponent } from './raid-config.component';

describe('RaidConfigComponent', () => {
  let component: RaidConfigComponent;
  let fixture: ComponentFixture<RaidConfigComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RaidConfigComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RaidConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
