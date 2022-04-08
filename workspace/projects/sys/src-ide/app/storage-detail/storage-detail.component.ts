import { Component, OnInit, Input, OnDestroy, ChangeDetectorRef, NgZone, ViewChild } from '@angular/core';
import { I18nService } from '../service/i18n.service';
import { VscodeService } from '../service/vscode.service';
import { Utils } from '../service/utils.service';
import { LeftShowService } from './../service/left-show.service';
import { MessageService } from '../service/message.service';


@Component({
    selector: 'app-storage-detail',
    templateUrl: './storage-detail.component.html',
    styleUrls: ['./storage-detail.component.scss'],
})
export class StorageDetailComponent implements OnInit, OnDestroy {
    @Input() projectName: any;
    @Input() taskName: any;
    @Input() analysisType: any;
    @Input() status: any;
    @Input() functionType: any;
    @Input() id: any;
    @Input() nodeid: any;
    @Input() active: any;

    @ViewChild('functionModal') functionModal: any;
    @ViewChild('appDiskIoRef') appDiskIoRef: any;

    public selectDetail = {
        dev: '',
        pid: '',
        func: ''
    };

    public subscription: any;
    // 国际化
    i18n: any;
    public detailList: Array<any> = [];
    constructor(
        public i18nService: I18nService,
        public vscodeService: VscodeService,
        public leftShowService: LeftShowService,
        private msgService: MessageService,
        private zone: NgZone,
        private changeDetectorRef: ChangeDetectorRef
    ) {
        this.i18n = this.i18nService.I18n();
    }

    /**
     * 初始化
     */
    ngOnInit() {
        this.detailList = [
            {
              title: this.i18n.common_term_task_tab_summary,
              disable: true,
              active: false
            },
            {
              title: this.i18n.storageIO.disk_title,
              disable: true,
              active: false,
              prop: 'disk',
            },
            {
              title: this.i18n.common_term_task_tab_congration,
              active: false,
              disable: false,
              prop: 'configuration',
            },
            {
              title: this.i18n.common_term_task_tab_log,
              active: false,
              disable: false,
            }
        ];

        if (this.status === 'Completed' || this.status === 'Aborted') {

            this.detailList[0].disable = false;
            this.detailList[1].disable = false;
            this.detailList[0].active = true;
            this.initTab();
        } else {
            this.detailList[2].active = true;
            this.detailList[0].active = false;
            this.detailList[0].disable = true;
            this.detailList[1].disable = true;
            for (let index = this.detailList.length; index > 0; index--) {
                if (this.detailList[index - 1].disable) {
                    this.detailList.splice((index - 1), 1);
                }
            }
        }

        setTimeout(() => {
            this.subscription = this.msgService.getMessage().subscribe((msg) => {
                if (msg.taskName !== this.taskName) { return; }
                this.selectDetail = msg.detail;
                this.detailList[0].active = false;
                if (msg.function === 'disk' && this.detailList.length === 5) {
                    this.detailList[2].disable = true;
                    setTimeout(() => {
                        this.detailList[2].disable = false;
                        this.detailList[2].active = true;
                    }, 300);
                } else {
                    this.detailList[1].disable = true;
                    setTimeout(() => {
                        this.detailList[1].disable = false;
                        this.detailList[1].active = true;
                    }, 300);
                }
           });
        }, 500);
        setTimeout(() => {
          this.updateWebViewPage();
        }, 900);
        this.updateWebViewPage();
    }

    /**
     * 初始化导航条
     */
    public async initTab() {
        const params = {
          'node-id': this.nodeid,
          'analysis-type': 'ioperformance',
        };
        const url = '/tasks/' + this.id + '/common/configuration/?' + Utils.converUrl(params);
        const res = await this.vscodeService.get({ url }, (resp: any) => {
            if (resp.data && resp.data.analysisTarget !== 'Profile System') {
                this.detailList.splice(this.detailList.findIndex(item => item.prop === 'disk'), 0, {
                    title: this.i18n.storageIO.apis_title,
                    disable: false,
                    active: false
                });
                this.updateWebViewPage();
            }
        });
        this.updateWebViewPage();

    }

    /**
     * 页面销毁
     */
    ngOnDestroy() {
        if (this.subscription) {
          this.subscription.unsubscribe();
        }
    }

    /**
     * 导航条切换事件
     */
    public change(item: any) {
        // iopais
        if (item.title === this.i18n.storageIO.apis_title && item.active) {
            this.functionModal?.showAllData();
        }

        // diskio
        if (item.title === this.i18n.storageIO.disk_title && item.active) {
            this.appDiskIoRef?.showAllData();
        }
        this.leftShowService.leftIfShow.next();
    }

    /**
     * IntellIj刷新webview页面
     */
    public updateWebViewPage() {
        if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
            this.zone.run(() => {
                this.changeDetectorRef.markForCheck();
                this.changeDetectorRef.checkNoChanges();
                this.changeDetectorRef.detectChanges();
            });
        }
    }
}
