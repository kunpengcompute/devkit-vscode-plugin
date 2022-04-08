import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NumaDetailComponent } from './numa-detail.component';

describe('NumaDetailComponent', () => {
    let component: NumaDetailComponent;
    let fixture: ComponentFixture<NumaDetailComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [NumaDetailComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(NumaDetailComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
