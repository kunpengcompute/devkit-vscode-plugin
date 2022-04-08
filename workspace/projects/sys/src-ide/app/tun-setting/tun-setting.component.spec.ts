import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TunsetComponent } from './Tun-setting.component';

describe('TunsetComponent', () => {
    let component: TunsetComponent;
    let fixture: ComponentFixture<TunsetComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [TunsetComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TunsetComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
