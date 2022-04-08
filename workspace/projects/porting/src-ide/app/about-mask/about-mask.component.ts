import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-about-mask',
    templateUrl: './about-mask.component.html',
    styleUrls: ['./about-mask.component.scss']
})
export class AboutMaskComponent implements OnInit {
    @Input() title: any;
    public myMask = false;
    constructor() { }

    ngOnInit() {
    }
    public Close() {
        this.myMask = false;

    }
    public Open() {
        this.myMask = true;
    }
}
