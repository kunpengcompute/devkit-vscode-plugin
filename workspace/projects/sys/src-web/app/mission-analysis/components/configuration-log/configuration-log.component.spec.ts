import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigurationLogComponent } from './configuration-log.component';

describe('ConfigurationLogComponent', () => {
  let component: ConfigurationLogComponent;
  let fixture: ComponentFixture<ConfigurationLogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfigurationLogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigurationLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
