import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PopAlertModalComponent } from './popalert-modal.component';

describe('PopAlertModalComponent', () => {
    let component: PopAlertModalComponent;
    let fixture: ComponentFixture<PopAlertModalComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [PopAlertModalComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PopAlertModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
