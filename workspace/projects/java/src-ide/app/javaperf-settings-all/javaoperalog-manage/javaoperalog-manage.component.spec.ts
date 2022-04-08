import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JavaOperalogManageComponent } from './javaoperalog-manage.component';

describe('JavaOperalogManageComponent', () => {
    let component: JavaOperalogManageComponent;
    let fixture: ComponentFixture<JavaOperalogManageComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [JavaOperalogManageComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(JavaOperalogManageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
