import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkageManageComponent } from './linkage-manage.component';

describe('LinkageManageComponent', () => {
  let component: LinkageManageComponent;
  let fixture: ComponentFixture<LinkageManageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LinkageManageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LinkageManageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
