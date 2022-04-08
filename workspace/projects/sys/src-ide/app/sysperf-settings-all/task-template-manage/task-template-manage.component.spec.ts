import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskTemplateManageComponent } from './task-template-manage.component';

describe('TaskTemplateManageComponent', () => {
    let component: TaskTemplateManageComponent;
    let fixture: ComponentFixture<TaskTemplateManageComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [TaskTemplateManageComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TaskTemplateManageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
