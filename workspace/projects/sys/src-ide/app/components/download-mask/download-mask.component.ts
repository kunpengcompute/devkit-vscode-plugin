import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-download-mask',
    templateUrl: './download-mask.component.html',
    styleUrls: ['./download-mask.component.scss']
})
export class DownloadMaskComponent implements OnInit {
    public myMask = false;
    /**
     * 初始加载
     */
    ngOnInit() { }
    /**
     * 关闭弹窗
     */
    public Close() {
        $('.tab-content').css('overflow', 'auto');
        this.myMask = false;
    }
    /**
     * 打开弹窗
     */
    public Open() {
        $('.tab-content').css('overflow', 'hidden');
        this.myMask = true;
    }
}
