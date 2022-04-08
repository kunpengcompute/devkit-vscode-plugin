import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TargetEnviromentComponent } from './target-enviroment.component';

describe('TargetEnviromentComponent', () => {
  let component: TargetEnviromentComponent;
  let fixture: ComponentFixture<TargetEnviromentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TargetEnviromentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TargetEnviromentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
