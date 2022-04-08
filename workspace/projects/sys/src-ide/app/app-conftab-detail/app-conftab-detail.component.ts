import { Component, OnInit, Input } from '@angular/core';
import { I18nService } from '../service/i18n.service';
@Component({
    selector: 'app-conftab-detail',
    templateUrl: './app-conftab-detail.component.html',
    styleUrls: ['./app-conftab-detail.component.scss']
})
export class AppConftabDetailComponent implements OnInit {
    @Input() projectName: any;
    @Input() taskName: any;
    @Input() analysisType: any;
    @Input() status: any;
    @Input() id: any;
    @Input() nodeid: any;
    public subscription: any;
    i18n: any;
    public detailList: Array<any> = [];
    constructor(public i18nService: I18nService) {
        this.i18n = this.i18nService.I18n();
    }

    /**
     * 组件初始化
     */
    ngOnInit() {
        this.detailList = [
            {
                title: this.i18n.common_term_task_tab_summary,
                disable: false,
                active: true
            },
            {
                title: this.i18n.common_term_task_tab_congration,
                disable: false,
                active: false
            },
            {
                title: this.i18n.common_term_task_tab_log,
                disable: false,
                active: false
            }
        ];
        if (this.status === 'Completed' || this.status === 'Aborted') {
            this.detailList[0].active = true;
            this.detailList[0].disable = false;

        } else {
            this.detailList[2].active = true;
            this.detailList[0].active = false;
            this.detailList[0].disable = true;

        }
    }

}
