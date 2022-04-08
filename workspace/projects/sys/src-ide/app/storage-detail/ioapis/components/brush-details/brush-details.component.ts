import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TiTableRowData } from '@cloud/tiny3';
import { I18nService } from '../../../../service/i18n.service';
import { VscodeService, HTTP_STATUS_CODE } from '../../../../service/vscode.service';
import { Utils } from './../../../../service/utils.service';
import { TableService } from '../../../../service/table.service';

@Component({
    selector: 'app-brush-details',
    templateUrl: './brush-details.component.html',
    styleUrls: ['./brush-details.component.scss'],
})
export class BrushDetailsComponent {

    @Input() nodeid: string;
    @Input() taskid: any;
    @Input() readChecked: boolean;
    @Input() topState: string;
    @Input() timeTitle: string;
    @Output() public toggleTopOut = new EventEmitter<any>();

    public i18n: any;
    // 语言,zh-cn: 中文, 'en-us': 英文
    public lang;

    // 上下折叠面板状态, active:展开
    public pidFunction = 'Function/PID';

    public tlbData = {
        columns: [],
        displayed: ([] as Array<TiTableRowData>),
        srcData: {
            data: ([] as Array<TiTableRowData>),
            state: {
                searched: false,
                sorted: false,
                paginated: false
            },
        },
        pageNo: 0,
        total: (undefined as number),
        pageSize: {
            options: [10, 20, 50, 100],
            size: 10
        },
    };

    public nodataTip: any;

    constructor(
        public i18nService: I18nService,
        private  vscodeService: VscodeService,
        public tableService: TableService
    ) {
        this.i18n = this.i18nService.I18n();
        this.lang = (self as any).webviewSession.getItem('language');
        this.tlbData.columns = [
            { label: this.i18n.storageIO.ioapis.time, sortKey: 'time', compareType: 'number' },
            { label: this.i18n.storageIO.ioapis.cpid, sortKey: 'pid' },
            { label: this.i18n.mission_create.process_name, sortKey: 'cmd' },
            { label: this.i18n.storageIO.ioapis.params, sortKey: 'params' },
            { label: this.i18n.storageIO.ioapis.return, sortKey: 'return_val' },
            { label: this.i18n.common_term_task_time, sortKey: 'exec_time' },
        ];
        this.nodataTip = this.i18n.common_term_task_nodata;
    }

    /**
     * 打开详情划框
     */
    public toggleTop(pid?: string, func?: string, startTime?: string, endTime?: string) {
        if (!func) { // 手动点击按钮
            this.topState === 'active'
                ? (this.topState = 'notActive')
                : (this.topState = 'active');
        } else {// 框选事件触发
            this.topState = 'active';
            this.pidFunction = func + '/' + pid;
            this.timeTitle = startTime + '-' + endTime;
            this.getBrushData(pid , func , startTime , endTime );
        }

        this.toggleTopOut.emit({
            topState: this.topState,
            timeTitle: this.timeTitle
        });
    }

    /**
     * 根据框选内容,请求详细信息
     */
    public getBrushData(pid?: string, func?: string, startTime?: string, endTime?: string) {
        const params = {
            nodeId: this.nodeid,
            pid,
            func,
            startTime,
            endTime,
        };
        Utils.startLoading();
        this.nodataTip = this.i18n.loading;
        const endTimer = setTimeout(() => {
            Utils.endLoading();
            this.nodataTip = this.i18n.common_term_task_nodata;
        }, 23000);
        this.vscodeService.get({
            url: '/tasks/' + this.taskid + '/ioperformance/detail_io_api_org_data_by_time/?' + Utils.converUrl(params),
            timeout: 20000
        }, (resp: any) => {
            Utils.endLoading();
            this.nodataTip = this.i18n.common_term_task_nodata;
            clearInterval(endTimer);
            if (resp.code === HTTP_STATUS_CODE.SYSPERF_SUCCESS) {
                const data = resp.data.io_api_org_data_by_time;
                if (data) {
                    this.tlbData.srcData.data = data.data;
                    this.tlbData.total = data.data.length;
                }
            }
        });
    }
}
