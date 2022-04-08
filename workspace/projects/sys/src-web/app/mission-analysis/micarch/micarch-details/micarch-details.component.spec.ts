import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MicarchDetailsComponent } from './micarch-details.component';

describe('MicarchDetailsComponent', () => {
  let component: MicarchDetailsComponent;
  let fixture: ComponentFixture<MicarchDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MicarchDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MicarchDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
