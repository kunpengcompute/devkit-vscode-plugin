import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-mask',
    templateUrl: './mask.component.html',
    styleUrls: ['./mask.component.scss']
})

export class MaskComponent implements OnInit {

    public myMask = false;
    constructor() {

    }

    /**
     * 组件初始化
     */
    ngOnInit() {
    }

    /**
     * 关闭弹窗
     */
    public Close() {
        this.myMask = false;

    }

    /**
     * 打开弹窗
     */
    public Open() {
        this.myMask = true;
    }
}
