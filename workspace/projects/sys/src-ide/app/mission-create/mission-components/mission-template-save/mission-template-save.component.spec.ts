import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MissionTemplateSaveComponent } from './mission-template-save.component';

describe('MissionTemplateSaveComponent', () => {
    let component: MissionTemplateSaveComponent;
    let fixture: ComponentFixture<MissionTemplateSaveComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [MissionTemplateSaveComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MissionTemplateSaveComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
