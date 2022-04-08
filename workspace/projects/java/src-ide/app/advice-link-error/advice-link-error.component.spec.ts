import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdviceLinkErrorComponent } from './advice-link-error.component';

describe('AdviceLinkErrorComponent', () => {
  let component: AdviceLinkErrorComponent;
  let fixture: ComponentFixture<AdviceLinkErrorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdviceLinkErrorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdviceLinkErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
