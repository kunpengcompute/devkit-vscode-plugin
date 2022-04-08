import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OperaLogManageComponent } from './operalog-manage.component';

describe('OperaLogManageComponent', () => {
    let component: OperaLogManageComponent;
    let fixture: ComponentFixture<OperaLogManageComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [OperaLogManageComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(OperaLogManageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
