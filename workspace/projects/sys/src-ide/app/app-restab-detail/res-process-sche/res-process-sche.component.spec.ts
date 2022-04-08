import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResProcessScheComponent } from './res-process-sche.component';

describe('ResProcessScheComponent', () => {
    let component: ResProcessScheComponent;
    let fixture: ComponentFixture<ResProcessScheComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ResProcessScheComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ResProcessScheComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
