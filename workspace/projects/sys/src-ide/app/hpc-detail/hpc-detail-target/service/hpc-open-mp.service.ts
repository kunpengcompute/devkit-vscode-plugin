import { Injectable } from '@angular/core';
import { VscodeService, HTTP_STATUS_CODE } from '../../../service/vscode.service';
import { IHpcOpenMp, IHpcRankData } from '../../domain';

@Injectable({
    providedIn: 'root'
})
export class HpcOpenMpService {

    constructor(
        public vscodeService: VscodeService
    ) { }
    /**
     * 获取数据
     */
    getOpenMp(taskId, nodeId): Promise<{
        barrierData: Array<IHpcOpenMp>, paralleData: Array<IHpcOpenMp>, rankData: Array<IHpcRankData>
    }> {
        return new Promise<any>((resolve, reject) => {
            const url = `/tasks/${taskId}/hpc-analysis/pmu-event/?node-id=${nodeId}&query-type=parallel-region`;
            this.vscodeService.get({ url }, (res) => {
                let paralleData: Array<IHpcOpenMp> = [];
                let barrierData: Array<IHpcOpenMp> = [];
                let rankData: Array<IHpcRankData> = [];
                if (HTTP_STATUS_CODE.SYSPERF_SUCCESS && res.data.hpc.data) {
                    if (res.data.hpc.data.parallel_region) {
                        paralleData = this.getObeject(res.data.hpc.data.parallel_region);
                    }
                    if (res.data.hpc.data.barrier_to_barrier) {
                        barrierData = this.getObeject(res.data.hpc.data.barrier_to_barrier);
                    }
                    if (res.data.hpc.data.rank) {
                        rankData = this.getRankObeject(res.data.hpc.data.rank);
                    }
                }
                resolve({ paralleData, barrierData, rankData });
            });
        });
    }

    private getObeject(data: []) {
        const mpData: Array<any> = [];
        let a: {
            title: string,
            potential_gain_value: string,
            cpu_utiliczation: string,
            Lock: string,
            Creation: string,
            Scheduling: string,
            Tasking: string,
            Reduction: string,
            Atomics: string,
            exetime: string,
            unbalancetime: string,
            unbalanceratge: string,
            Spin: string,
            overhead: string,
            id?: number
        };
        data.map((item: Array<any>) => {
            a = {
                title: item[0],
                potential_gain_value: item[1],
                cpu_utiliczation: item[2],
                Lock: item[3],
                Creation: item[4],
                Scheduling: item[5],
                Tasking: item[6],
                Reduction: item[7],
                Atomics: item[8],
                exetime: item[9],
                unbalancetime: item[10],
                unbalanceratge: item[11],
                Spin: item[12],
                overhead: item[13],
                id: item[14]
            };
            mpData.push(a);
        });
        return mpData;
    }

    private getRankObeject(data: any[]): Array<IHpcRankData> {
        const rank: Array<IHpcRankData> = [];
        let rankData: IHpcRankData;
        data.map((item: any) => {
            rankData = {
                id: item[0],
                exe_time: item[1],
                run_time: item[2].split('(')[0].trim(),
                paraller_time: item[3].split('(')[0].trim(),
                unbalance_time: item[4].split('(')[0].trim(),
                barrierData: [],
                expand: false,
                paralleData: []
            };
            rank.push(rankData);
        });
        return rank;
    }
}
