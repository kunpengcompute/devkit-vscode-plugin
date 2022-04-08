import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SampleSuggestComponent } from './sample-suggest.component';

describe('SampleSuggestComponent', () => {
  let component: SampleSuggestComponent;
  let fixture: ComponentFixture<SampleSuggestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SampleSuggestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SampleSuggestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
