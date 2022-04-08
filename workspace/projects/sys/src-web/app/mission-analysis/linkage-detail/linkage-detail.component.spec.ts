import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkageDetailComponent } from './linkage-detail.component';

describe('LinkageDetailComponent', () => {
  let component: LinkageDetailComponent;
  let fixture: ComponentFixture<LinkageDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LinkageDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LinkageDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
