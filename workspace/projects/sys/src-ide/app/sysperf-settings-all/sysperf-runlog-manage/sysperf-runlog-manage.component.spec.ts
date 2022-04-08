import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SyperfRunLogManageComponent } from './sysperf-runlog-manage.component';

describe('SyperfRunLogManageComponent', () => {
    let component: SyperfRunLogManageComponent;
    let fixture: ComponentFixture<SyperfRunLogManageComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [SyperfRunLogManageComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SyperfRunLogManageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
