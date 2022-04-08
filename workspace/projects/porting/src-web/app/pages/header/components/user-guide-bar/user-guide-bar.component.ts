import { Component, Input, OnInit } from '@angular/core';
import { PortWorkerStatusService } from '../../../../service';
const hardUrl: any = require('../../../../../assets/hard-coding/url.json');

@Component({
    selector: 'app-user-guide-bar',
    templateUrl: './user-guide-bar.component.html',
    styleUrls: ['./user-guide-bar.component.scss']
})
export class UserGuideBarComponent implements OnInit {

    @Input() status: any;  // 创建任务返回的状态
    constructor(
        public portWorkerStatusService: PortWorkerStatusService,
    ) { }

    public lang: string;

    ngOnInit(): void {
        this.lang = sessionStorage.getItem('language');
    }

    /**
     * 前往用户指南
     */
    public gotoUserGuide() {
        if (this.lang === 'zh-cn') {
            window.open(hardUrl.userGuide, '_blank');
        } else {
            window.open(hardUrl.userGuideEn, '_blank');
        }
    }
}
