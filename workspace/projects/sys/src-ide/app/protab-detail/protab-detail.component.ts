import {Component, OnInit, Input, NgZone, ChangeDetectorRef} from '@angular/core';
import { I18nService } from '../service/i18n.service';
import { MytipService } from '../service/mytip.service';
import { VscodeService } from '../service/vscode.service';
import { Utils } from '../service/utils.service';
@Component({
    selector: 'app-protab-detail',
    templateUrl: './protab-detail.component.html',
    styleUrls: ['./protab-detail.component.scss']
})
export class ProtabDetailComponent implements OnInit {
    @Input() projectName: any;
    @Input() taskName: any;
    @Input() analysisType: any;
    @Input() status: any;
    @Input() active: any;
    @Input() id: any;
    @Input() nodeid: any;
    public subscription: any;
    i18n: any;
    public detailList: Array<any> = [];
    public showLoading = false;

    constructor(
        public mytip: MytipService,
        public i18nService: I18nService,
        private zone: NgZone,
        private cdr: ChangeDetectorRef,
        public vscodeService: VscodeService) {
        this.i18n = this.i18nService.I18n();
    }
    /**
     * 初始化
     */
    ngOnInit() {
        this.showLoading = true;
        this.detailList = [
            {
                title: this.i18n.common_term_task_tab_summary,      // 总览
                disable: true,
                active: false
            },
            {
                title: this.i18n.sys.cpu,   // cpu
                disable: true,
                active: false
            },
            {
                title: this.i18n.sys.mem,  // 内存
                disable: true,
                active: false
            },
            {
                title: this.i18n.process.disk,  // 存储io
                disable: true,
                active: false
            },
            {
                title: this.i18n.process.context,  // 上下文切换
                disable: true,
                active: false
            },
            {
                title: this.i18n.common_term_task_tab_congration,          // 任务信息
                disable: false,
                active: false
            },
            {
                title: this.i18n.common_term_task_tab_log,  // 采集日志
                disable: false,
                active: false
            },
        ];
        if (this.status === 'Completed' || this.status === 'Aborted') {
            this.initTab();
        } else if (this.status === 'Created') {
            this.detailList = [
                {
                    title: this.i18n.common_term_task_tab_congration, // 任务信息
                    disable: false,
                    active: true
                }
            ];
            this.showLoading = false;
        } else if (this.status === 'Failed') {
            this.detailList = [
                {
                    title: this.i18n.common_term_task_tab_congration, // 任务信息
                    disable: false,
                    active: true
                },
                {
                    title: this.i18n.common_term_task_tab_log,  // 采集日志
                    disable: false,
                    active: false
                }
            ];
            this.showLoading = false;
        } else {
            this.detailList[5].active = true;
            this.detailList[0].active = false;
            this.detailList[0].disable = true;
            this.detailList[1].disable = true;
            this.detailList[2].disable = true;
            this.detailList[3].disable = true;
            this.detailList[4].disable = true;
            this.detailList[6].disable = true;
            // 去掉标签
            for (let index = this.detailList.length; index > 0; index--) {
                if (this.detailList[index - 1].disable) {
                    this.detailList.splice((index - 1), 1);
                }
            }
            this.showLoading = false;
        }
        this.updateWebViewPage();
    }

    /**
     * 初始化tab 页签
     */
    public async initTab() {
        const param = {
            'node-id': encodeURIComponent(this.nodeid),
        };
        let url = `/tasks/${this.id}/common/configuration/?`;
        url += Utils.converUrl(param);
        this.vscodeService.get({ url }, (resp: any) => {
            if (resp.data) {
                resp.data.task_param.type.forEach(item => {
                    if (this.status === 'Failed') { return false; }
                    if (item === 'cpu') {
                        this.detailList[1].disable = false;
                    } else if (item === 'mem') {
                        this.detailList[2].disable = false;
                    } else if (item === 'disk') {
                        this.detailList[3].disable = false;
                    } else if (item === 'context') {
                        this.detailList[4].disable = false;
                    }
                });

                this.detailList[0].active = true;
                this.detailList[0].disable = false;
                this.detailList = this.detailList.filter(item => {
                    return !item.disable;
                });
            }
            this.showLoading = false;
            this.updateWebViewPage();
        });
    }
    /**
     * intellIj刷新webview页面
     */
    public updateWebViewPage() {
        if (((self as any).webviewSession || {}).getItem('tuningOperation') === 'hypertuner') {
            this.zone.run(() => {
                this.cdr.detectChanges();
                this.cdr.checkNoChanges();
            });
        }
    }
}
