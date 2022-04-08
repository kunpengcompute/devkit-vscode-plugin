import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FileConfigComponent } from './file-config.component';

describe('FileConfigComponent', () => {
  let component: FileConfigComponent;
  let fixture: ComponentFixture<FileConfigComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FileConfigComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FileConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
