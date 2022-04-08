import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InformationDescriptionComponent } from './information-description.component';

describe('InformationDescriptionComponent', () => {
  let component: InformationDescriptionComponent;
  let fixture: ComponentFixture<InformationDescriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InformationDescriptionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InformationDescriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
