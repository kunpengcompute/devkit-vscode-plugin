import {
    Component, OnInit, ViewChild, OnChanges, SimpleChanges, Input, NgZone, ChangeDetectorRef
} from '@angular/core';
import { MessageService } from '../service/message.service';
import { I18nService } from '../service/i18n.service';
import { LeftShowService } from './../service/left-show.service';
import { VscodeService } from '../service/vscode.service';
@Component({
    selector: 'app-hpc-detail',
    templateUrl: './hpc-detail.component.html',
    styleUrls: ['./hpc-detail.component.scss']
})
export class HpcDetailComponent implements OnInit {
    @Input() projectName: any;
    @Input() taskName: any;
    @Input() analysisType: any;
    @Input() analysisTarget: any;
    @Input() status: any;
    @Input() functionType: any;
    @Input() id: any;
    @Input() nodeid: any;
    i18n: any;
    public subscription: any;
    public hotFlameName: any;
    public taskInfo: any;
    constructor(
        public vscodeService: VscodeService,
        private msgService: MessageService,
        public i18nService: I18nService,
        private zone: NgZone,
        private changeDetectorRef: ChangeDetectorRef,
        public leftShowService: LeftShowService) {
        this.i18n = this.i18nService.I18n();
    }
    public detailList: Array<any> = [];
    /**
     * 初始化
     */
    ngOnInit() {
        if (this.status === 'Completed' || this.status === 'Aborted') {
            this.detailList = [
                {
                    title: this.i18n.mission_modal.hpc.summary,
                    disable: false,
                    active: true,
                },
                {
                    title: this.i18n.mission_modal.hpc.hpcTarget,
                    disable: false,
                    active: false,
                },
                {
                    title: this.i18n.common_term_task_tab_congration,
                    prop: 'configuration',
                    active: false,
                    disable: false,
                },
                {
                    title: this.i18n.common_term_task_tab_log,
                    active: false,
                    disable: false,
                }
            ];
        } else if (this.status === 'Created') {
            this.detailList = [
                {
                    title: this.i18n.common_term_task_tab_congration,
                    active: true,
                    disable: false,
                }
            ];
        } else {
            this.detailList = [
                {
                    title: this.i18n.common_term_task_tab_congration,
                    active: true,
                    disable: false,
                },
                {
                    title: this.i18n.common_term_task_tab_log,
                    active: false,
                    disable: false,
                }
            ];
        }
        this.subscription = this.msgService.getMessage().subscribe((msg) => {
            if (msg.function === 'openFunction') {
                this.detailList[2].active = false;
                this.detailList[1].disable = true;
                setTimeout(() => {
                    this.detailList[1].disable = false;
                    this.detailList[1].active = true;
                }, 300);
            }
        });
        this.updateWebViewPage();
    }
    /**
     * IntellIj刷新webview页面
     */
    public updateWebViewPage() {
        if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
            this.zone.run(() => {
                this.changeDetectorRef.checkNoChanges();
                this.changeDetectorRef.detectChanges();
            });
        }
    }


    public getConfigInfo(configInfo: any) {
        this.taskInfo = configInfo;
    }
}
