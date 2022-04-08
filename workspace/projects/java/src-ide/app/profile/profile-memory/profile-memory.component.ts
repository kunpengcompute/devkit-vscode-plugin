import { Component, OnInit, AfterContentInit, OnDestroy } from '@angular/core';
import { TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { AxiosService } from '../../service/axios.service';
import { Subscription } from 'rxjs';
import { I18nService } from '../../service/i18n.service';
import { MessageService } from '../../service/message.service';
import { ProfileDownloadService } from '../../service/profile-download.service';
@Component({
    selector: 'app-profile-memory',
    templateUrl: './profile-memory.component.html',
    styleUrls: ['./profile-memory.component.scss']
})
export class ProfileMemoryComponent implements OnInit, AfterContentInit, OnDestroy {
    i18n: any;
    constructor(
        public i18nService: I18nService,
        private Axios: AxiosService,
        private msgService: MessageService,
        private downloadService: ProfileDownloadService
    ) {
        this.i18n = this.i18nService.I18n();
    }
    public memoryOptions: any = {}; // echarts配置
    public insCountWidth = 0;
    public insCountTotal = 0;
    public displayed: Array<TiTableRowData> = [];
    public srcData: TiTableSrcData;
    public noDadaInfo: string;
    public columns: Array<TiTableColumns> = [
        {
            title: 'name',
            width: '40%',
            sortKey: ''
        },
        {
            title: 'instance',
            width: '30%',
            sortKey: 'instances',
        },
        {
            title: 'size',
            width: '30%',
            sortKey: 'bytes',
        }
    ];

    private isStopMsgSub: Subscription;
    public startBtnDisabled: boolean;
    /**
     * ngOnInit
     */
    ngOnInit() {
        this.noDadaInfo = this.i18n.common_term_task_nodata;
        this.startBtnDisabled = JSON.parse((self as any).webviewSession.getItem('isProStop'));
        this.srcData = {
            data: [], // 源数据
            state: {
                searched: false,
                sorted: false,
                paginated: false
            }
        };

        this.isStopMsgSub = this.msgService.getMessage().subscribe((msg) => {
            if (msg.type === 'isStopPro') {
                this.startBtnDisabled = msg.isStop;
            }
        });

        const isDownload = JSON.parse((self as any).webviewSession.getItem('downloadProfile') || 'false');
        if (isDownload) {
            this.srcData.data = this.downloadService.downloadItems.javaHeap.classes;
            return;
        }
        this.refreshData();
    }
    /**
     * refreshData
     */
    public refreshData() {
        if (this.startBtnDisabled) { return; }
        this.getTableData();
    }

    /**
     * ngAfterContentInit
     */
    ngAfterContentInit(): void {

    }

    /**
     * ngOnDestroy
     */
    ngOnDestroy(): void {
        if (this.isStopMsgSub) { this.isStopMsgSub.unsubscribe(); }
    }

    private getTableData() {
        this.srcData.data = [];
        const guardianId = (self as any).webviewSession.getItem('guardianId');
        const params = {
            jvmId: (self as any).webviewSession.getItem('jvmId')
        };
        this.Axios.axios.post(`/guardians/${guardianId}/cmds/dump-histogram`, params).then((resp: any) => {
            if (resp.classes.length) {
                this.srcData.data = resp.classes;
                this.downloadService.downloadItems.javaHeap.classes = JSON.parse(JSON.stringify(this.srcData.data));
            }
        });
    }
    /**
     * trackByFn
     * @param index index
     * @param item item
     */
    public trackByFn(index: number, item: any): number {
        return item.id;
    }
}
