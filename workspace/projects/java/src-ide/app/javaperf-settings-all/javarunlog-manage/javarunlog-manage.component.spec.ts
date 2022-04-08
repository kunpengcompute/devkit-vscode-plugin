import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JavaRunlogManageComponent } from './javarunlog-manage.component';

describe('JavaRunlogManageComponent', () => {
    let component: JavaRunlogManageComponent;
    let fixture: ComponentFixture<JavaRunlogManageComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [JavaRunlogManageComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(JavaRunlogManageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
