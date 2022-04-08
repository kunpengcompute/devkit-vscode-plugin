import { Component, OnInit, Input } from '@angular/core';
import { TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { HttpService } from 'sys/src-com/app/service';
import { I18n } from 'sys/locale';

@Component({
    selector: 'app-mic-metrics-table',
    templateUrl: './mic-metrics-table.component.html',
    styleUrls: ['./mic-metrics-table.component.scss']
})
export class MicMetricsTableComponent implements OnInit {
    @Input() taskId: any;
    @Input() nodeid: any;
    constructor(private http: HttpService) { }
    public microTitle: any;
    public micIntroTitle: Array<any> = ['Cycles', 'Introduction', 'IPC'];
    public micIntroValue: Array<string> = [];
    public displayed: Array<TiTableRowData> = [];
    public srcData: TiTableSrcData;
    private data: Array<TiTableRowData> = [];
    public columns: Array<TiTableColumns> = [
        {
            title: I18n.micarch.eventName,
            width: '50%'
        },
        {
            title: I18n.tuninghelper.taskDetail.value,
            width: '50%'
        }
    ];
    public currentPage = 1;
    public totalNumber: number;
    public pageSize: { options: Array<number>, size: number } = {
        options: [10, 20, 40, 80, 100],
        size: 10
    };
    ngOnInit() {
        this.microTitle = {
            title: I18n.tuninghelper.taskDetail.micIndicator
        };
        const params = { 'node-id': this.nodeid, 'query-type': JSON.stringify(['cpu_micro_info']) };
        this.http.get(`/tasks/${encodeURIComponent(this.taskId)}/optimization/system-performance/`, {
            params,
            headers: { showLoading: false }
        }).then((resp: any) => {
            if (resp.data.optimization.data.cpu_micro) {
                const miAsyncData = resp.data.optimization.data.cpu_micro;
                this.micIntroValue[0] = miAsyncData.cycles;
                this.micIntroValue[1] = miAsyncData.instructions;
                this.micIntroValue[2] = miAsyncData.IPC;
                const micTbady: Array<any> = [];
                Object.keys(miAsyncData).forEach((key) => {
                    if (key !== 'cycles' && key !== 'instructions' && key !== 'IPC' && !key.includes('rate')) {
                        let rateKey = '';
                        if (key.includes('misses')) {
                            rateKey = key.split(' ')[0] + ' miss rate';
                            if (!miAsyncData[rateKey]) {
                                rateKey = key.split(' ')[0] + ' cache miss rate';
                            }
                        }
                        const obj = { micfirstname: key, micfirstvalue: miAsyncData[key], rate: miAsyncData[rateKey] };
                        micTbady.push(obj);
                    }
                });
                this.srcData.data = micTbady;
                this.totalNumber = micTbady.length;
            } else {
                this.micIntroValue = [];
            }
        });
        this.srcData = {
            data: this.data,
            state: {
                searched: false,
                sorted: false,
                paginated: false
            }
        };
    }
}
