import { Component, OnInit, Input, AfterViewInit, OnChanges } from '@angular/core';

@Component({
    selector: 'app-circle-progress',
    templateUrl: './circle-progress.component.html',
    styleUrls: ['./circle-progress.component.scss']
})
export class CircleProgressComponent implements OnInit, AfterViewInit, OnChanges {

    @Input() progressData: any;
    @Input() progressPercent: any;
    @Input() theme: any;
    constructor() { }
    private elCircle: any;
    private elBorder: any;
    public elId: string;
    public language: string;

    /**
     * 组件初始化
     */
    ngOnInit() {
        this.elId = this.progressData.id;
        this.language = (self as any).webviewSession.getItem('language');
    }

    /**
     * 组件变化
     */
    ngOnChanges(): void {
        if (!this.elCircle || !this.elCircle.length) { return; }
        this.rotateCircle();
    }

    /**
     * 组件初始化后操作
     */
    ngAfterViewInit(): void {
        this.elCircle = $(`#${this.progressData.id}`);
        this.elBorder = $(`#${this.elId}-border`);
        if (!this.elCircle || !this.elCircle.length) { return; }
        this.rotateCircle();
    }

    /**
     * 旋转
     */
    public rotateCircle() {
        const that = this;

        this.elCircle.forEach((element: any) => {
            let deg = that.progressPercent * 360 / 100;
            deg = Number(deg);
            const color = that.colorFormat(that.progressData.remain,
               that.progressData.minVal, that.progressData.maxVal);
            if (deg <= 180) {
                $(element).find('.right').css('transform', `rotate( + ${deg} + deg)`);
                $(element).find('.left').css('transform', 'rotate(0deg)');
            } else {
                $(element).find('.right').css('transform', 'rotate(180deg)');
                $(element).find('.left').css('transform', `rotate( + ${deg - 180} + deg)`);
            }
            $(element).css('background', color);
            that.elBorder.css('background', color);
        });
    }

    private colorFormat(val: any, min: any, max: any) {
        let color = '';
        if (val >= min && val <= max) { color = '#fdca5a'; }
        else if (val <= min) { color = '#f45c5e'; }
        else { color = '#7adfa0'; }
        return color;
    }
}
