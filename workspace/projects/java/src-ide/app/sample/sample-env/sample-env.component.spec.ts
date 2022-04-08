import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SampleEnvComponent } from './sample-env.component';

describe('SampleEnvComponent', () => {
  let component: SampleEnvComponent;
  let fixture: ComponentFixture<SampleEnvComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SampleEnvComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SampleEnvComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
