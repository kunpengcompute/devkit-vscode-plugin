import {
    Component, OnInit, ViewChild, OnChanges, SimpleChanges, Input, NgZone, ChangeDetectorRef
} from '@angular/core';
import { CustomValidatorsService } from 'projects/sys/src-ide/app/service';
import { MessageService } from '../service/message.service';
import { I18nService } from '../service/i18n.service';
import { LeftShowService } from './../service/left-show.service';
import { VscodeService } from '../service/vscode.service';
import { Utils } from '../service/utils.service';

@Component({
    selector: 'app-tab-detail',
    templateUrl: './tab-detail.component.html',
    styleUrls: ['./tab-detail.component.scss']
})
export class TabDetailComponent implements OnInit, OnChanges {
    @ViewChild('functionTab', { static: false }) functionTab: any;
    @Input() projectName: any;
    @Input() taskName: any;
    @Input() analysisType: any;
    @Input() status: any;
    @Input() functionType: any;
    @Input() id: any;
    @Input() nodeid: any;
    public selectDetail = {
        module: '',
        functionName: ''
    };
    public subscription: any;
    public hotFlameName: any;
    i18n: any;
    constructor(
        private custom: CustomValidatorsService,
        public vscodeService: VscodeService,
        private msgService: MessageService, public i18nService: I18nService,
        public leftShowService: LeftShowService,
        private zone: NgZone,
        private changeDetectorRef: ChangeDetectorRef) {
        this.i18n = this.i18nService.I18n();
    }

    public detailList: Array<any> = [];
    /**
     * 更改
     * @param changes 更改
     */
    ngOnChanges(changes: SimpleChanges): void {
    }

    /**
     * 初始化
     */
    ngOnInit() {
        if (this.status === 'Completed' || this.status === 'Aborted') {
            this.detailList = [
                {
                    title: this.i18n.common_term_task_tab_summary,
                    disable: false,
                    active: true,
                },
                {
                    title: this.i18n.common_term_task_tab_function,
                    disable: false,
                    active: false,
                },
                {
                    title: this.i18n.common_term_task_tab_graph_hot,
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
        if (this.analysisType === 'C/C++ Program') { // java不支持冷火焰图
            this.hotFlameName = this.i18n.common_term_task_tab_graph_hot;
            this.detailList[2].title = this.i18n.common_term_task_tab_graph_hot;
            this.detailList.splice(this.detailList.findIndex(item => item.prop === 'configuration'), 0, {
                title: this.i18n.common_term_task_tab_graph_cold,
                disable: false,
                active: false
            });
            this.updateWebViewPage();
        } else {
            this.hotFlameName = this.i18n.common_term_task_tab_graph;
            this.detailList[2].title = this.i18n.common_term_task_tab_graph;
        }
        this.subscription = this.msgService.getMessage().subscribe((msg) => {
            if (msg.function === 'openFunction') {
                    this.selectDetail.module = msg.detail.module;
                    this.selectDetail.functionName = msg.detail.functionName;
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
     * 传递折叠事件
     */
    public change() {
        this.leftShowService.leftIfShow.next();
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

}
