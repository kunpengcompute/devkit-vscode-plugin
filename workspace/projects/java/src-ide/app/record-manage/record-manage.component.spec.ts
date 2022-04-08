import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecordManageComponent } from './record-manage.component';

describe('RecordManageComponent', () => {
    let component: RecordManageComponent;
    let fixture: ComponentFixture<RecordManageComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [RecordManageComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(RecordManageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
