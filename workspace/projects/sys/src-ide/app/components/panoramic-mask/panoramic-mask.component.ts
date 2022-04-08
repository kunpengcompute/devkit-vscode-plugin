import { Component } from '@angular/core';

@Component({
    selector: 'app-panoramic-mask',
    templateUrl: './panoramic-mask.component.html',
    styleUrls: ['./panoramic-mask.component.scss']
})
export class PanoramicMaskComponent {

    public myMask = false;
    constructor() { }

    /**
     * 关闭弹出页面
     */
    public Close() {
        this.myMask = false;
    }

    /**
     * 弹出页面
     */
    public Open() {
        this.myMask = true;
    }
}
