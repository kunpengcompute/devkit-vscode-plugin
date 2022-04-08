import { Component, OnInit, Input } from '@angular/core';
import { I18nService } from 'projects/sys/src-ide/app/service/i18n.service';
import { VscodeService } from '../../../../service/vscode.service';
import { TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { HpcOpenMpService } from '../../service/hpc-open-mp.service';
import { IHpcRankData, IHpcOpenMp } from '../../../domain';

@Component({
    selector: 'app-hpc-open-mp',
    templateUrl: './hpc-open-mp.component.html',
    styleUrls: ['./hpc-open-mp.component.scss']
})
export class HpcOpenMpComponent implements OnInit {
    @Input() taskId: number;
    @Input() nodeId: number;
    public i18n: any;
    public paralleData: TiTableSrcData;
    public paralleDisplayed: Array<TiTableRowData> = [];
    public paralleColumns: Array<TiTableColumns> = [];
    public barrierData: TiTableSrcData;
    public barrierDisplayed: Array<TiTableRowData> = [];
    public barrierColumns: Array<TiTableColumns> = [];
    public rankData: Array<IHpcRankData> = [];
    public resBarrierData: any[] = [];
    public resParalleData: any[] = [];
    constructor(
        private i18nService: I18nService,
        public vscodeService: VscodeService,
        private hpcOpenMp: HpcOpenMpService
    ) {
        this.i18n = this.i18nService.I18n();
    }
    /**
     * 初始化
     */
    ngOnInit() {
        this.barrierData = {
            data: [],
            state: {
                searched: false,
                sorted: false,
                paginated: false
            }
        };
        this.paralleData = {
            data: [],
            state: {
                searched: false,
                sorted: false,
                paginated: false
            }
        };
        this.barrierColumns = [
            { title: 'Barrier-to-barrier segment', width: '25%' },
            { title: 'Potential Gain(s)', width: '12%', sortKey: 'potential_gain_value' },
            { title: 'CPU Utilization(%)', width: '13%', sortKey: 'cpu_utiliczation' },

            { title: 'Lock Contention(s)', width: '10%', sortKey: 'Lock' },
            { title: 'Creation(s)', width: '10%', sortKey: 'Creation' },
            { title: 'Scheduling(s)', width: '10%', sortKey: 'Scheduling' },
            { title: 'Tasking(s)', width: '10%', sortKey: 'Tasking' },
            { title: 'Reduction(s)', width: '10%', sortKey: 'Reduction' },
            { title: 'Atomics(s)', width: '10%', sortKey: 'Atomics' },
            {
                title: this.i18n.hpc.hpc_target.exe_time, width: '10%', sortKey: 'exetime',
            },
            {
                title: this.i18n.hpc.hpc_target.unbalance_time, width: '10%', sortKey: 'unbalancetime',
            },
            {
                title: this.i18n.hpc.hpc_target.unbalance_rate, width: '10%', sortKey: 'unbalanceratge',
            },
        ];
        this.paralleColumns = [
            { title: 'Parallel region', width: '25%' },
            { title: 'Potential Gain(s)', width: '12%', sortKey: 'potential_gain_value' },
            { title: 'CPU Utilization(%)', width: '13%', sortKey: 'cpu_utiliczation' },
            { title: 'Lock Contention(s)', width: '10%', sortKey: 'Lock' },
            { title: 'Creation(s)', width: '10%', sortKey: 'Creation' },
            { title: 'Scheduling(s)', width: '10%', sortKey: 'Scheduling' },
            { title: 'Tasking(s)', width: '10%', sortKey: 'Tasking' },
            { title: 'Reduction(s)', width: '10%', sortKey: 'Reduction' },
            { title: 'Atomics(s)', width: '10%', sortKey: 'Atomics' },
            { title: this.i18n.hpc.hpc_target.exe_time, width: '10%', sortKey: 'exetime' },
            { title: this.i18n.hpc.hpc_target.unbalance_time, width: '10%', sortKey: 'unbalancetime' },
            { title: this.i18n.hpc.hpc_target.unbalance_rate, width: '10%', sortKey: 'unbalanceratge' },
        ];
        this.hpcOpenMp.getOpenMp(this.taskId, this.nodeId).then((res) => {
            this.rankData = res.rankData;
            this.barrierData.data = res.barrierData;
            this.resBarrierData = res.barrierData;
            this.paralleData.data = res.paralleData;
            this.resParalleData = res.paralleData;
        });
    }
    /**
     * 表格层级展开
     */
    public toggle(rank: IHpcRankData) {
        const bool = rank.expand;
        this.rankData.map((item: IHpcRankData) => {
            item.expand = false;
        });
        rank.expand = !bool;
        this.paralleData.data = this.resParalleData.filter((item: IHpcOpenMp) => {
            return item.id === rank.id;
        });
        this.barrierData.data = this.resBarrierData.filter((item: IHpcOpenMp) => {
            return item.id === rank.id;
        });
    }
}
