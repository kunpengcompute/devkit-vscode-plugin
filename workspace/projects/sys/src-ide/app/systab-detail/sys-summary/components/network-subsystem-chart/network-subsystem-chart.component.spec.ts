import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NetworkSubsystemChartComponent } from './network-subsystem-chart.component';

describe('NetworkSubsystemChartComponent', () => {
    let component: NetworkSubsystemChartComponent;
    let fixture: ComponentFixture<NetworkSubsystemChartComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [NetworkSubsystemChartComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(NetworkSubsystemChartComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
