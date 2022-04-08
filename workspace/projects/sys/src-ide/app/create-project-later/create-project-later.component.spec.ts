import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateProjectLaterComponent } from './create-project-later.component';

describe('CreateProjectLaterComponent', () => {
  let component: CreateProjectLaterComponent;
  let fixture: ComponentFixture<CreateProjectLaterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateProjectLaterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateProjectLaterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
