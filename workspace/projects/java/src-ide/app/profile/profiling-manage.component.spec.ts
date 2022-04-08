import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfilingManageComponent } from './profiling-manage.component';

describe('ProfilingManageComponent', () => {
    let component: ProfilingManageComponent;
    let fixture: ComponentFixture<ProfilingManageComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ProfilingManageComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProfilingManageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
