import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InformationTitleComponent } from './information-title.component';

describe('InformationTitleComponent', () => {
  let component: InformationTitleComponent;
  let fixture: ComponentFixture<InformationTitleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InformationTitleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InformationTitleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
