import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResCpuScheComponent } from './res-cpu-sche.component';

describe('ResCpuScheComponent', () => {
    let component: ResCpuScheComponent;
    let fixture: ComponentFixture<ResCpuScheComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ResCpuScheComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ResCpuScheComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
