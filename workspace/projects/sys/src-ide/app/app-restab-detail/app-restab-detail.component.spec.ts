import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppRestabDetailComponent } from './app-restab-detail.component';

describe('AppRestabDetailComponent', () => {
    let component: AppRestabDetailComponent;
    let fixture: ComponentFixture<AppRestabDetailComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [AppRestabDetailComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AppRestabDetailComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
