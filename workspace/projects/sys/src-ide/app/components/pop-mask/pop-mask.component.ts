import { Component, OnInit } from '@angular/core';
import { CloseMaskService } from '../../service/close-mask.service';
@Component({
    selector: 'app-pop-mask',
    templateUrl: './pop-mask.component.html',
    styleUrls: ['./pop-mask.component.scss']
})
export class PopMaskComponent implements OnInit {
    public myMask = false;
    constructor(private closeMaskService: CloseMaskService) { }

    /**
     * 组件初始化
     */
    ngOnInit() { }

    /**
     * 关闭详情页弹窗
     */
    public Close() {
        $('.tab-content').css('overflow', 'auto');
        this.myMask = false;
        this.closeMaskService.sub.next(true);
    }

    /**
     * 打开详情页弹窗
     */
    public Open() {
        $('.tab-content').css('overflow', 'hidden');
        this.myMask = true;
    }
}
