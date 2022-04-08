import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MissionTemplatesComponent } from './mission-templates.component';

describe('MissionTemplatesComponent', () => {
    let component: MissionTemplatesComponent;
    let fixture: ComponentFixture<MissionTemplatesComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [MissionTemplatesComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MissionTemplatesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
