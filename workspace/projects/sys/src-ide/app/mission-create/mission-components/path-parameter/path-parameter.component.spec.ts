import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PathParameterComponent } from './path-parameter.component';

describe('PathParameterComponent', () => {
  let component: PathParameterComponent;
  let fixture: ComponentFixture<PathParameterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PathParameterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PathParameterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
