import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RuntimeInformationComponent } from './runtime-information.component';

describe('RuntimeInformationComponent', () => {
  let component: RuntimeInformationComponent;
  let fixture: ComponentFixture<RuntimeInformationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RuntimeInformationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RuntimeInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
