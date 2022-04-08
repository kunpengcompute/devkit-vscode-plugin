import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigInformationComponent } from './config-information.component';

describe('ConfigInformationComponent', () => {
  let component: ConfigInformationComponent;
  let fixture: ComponentFixture<ConfigInformationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfigInformationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
