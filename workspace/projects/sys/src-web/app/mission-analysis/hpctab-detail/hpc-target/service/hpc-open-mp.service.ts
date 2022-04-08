import { Injectable } from '@angular/core';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
import { IHpcOpenMp, IHpcRankData } from '../../domain';
@Injectable({
  providedIn: 'root'
})
export class HpcOpenMpService {

  constructor(
    private http: AxiosService,
  ) { }

  getOpenMp(taskid: number, nodeid: number): Promise<{
    barrierData: Array<IHpcOpenMp>,
    paralleData: Array<IHpcOpenMp>,
    rankData: Array<IHpcRankData>,
    suggest: {en: string, chs: string}
  }> {

    const params = {
      'node-id': nodeid,
      'query-type': 'parallel-region'
    };

    return new Promise<any>((resolve, reject) => {
      this.http.axios.get(
        `/tasks/${encodeURIComponent(taskid)}/hpc-analysis/openmp-index/`,
        { params, headers: { showLoading: false } }
      ).then((res: any) => {
        let paralleData: Array<IHpcOpenMp> = [];
        let barrierData: Array<IHpcOpenMp> = [];
        let rankData: Array<IHpcRankData> = [];
        const hpcData = res?.data?.hpc?.data;
        if (hpcData != null) {
          if (hpcData.parallel_region) {
            paralleData = this.getObeject(hpcData.parallel_region);
          }
          if (hpcData.barrier_to_barrier) {
            barrierData = this.getObeject(hpcData.barrier_to_barrier);
          }
          if (hpcData.rank.length) {
            rankData = this.getRankObeject(hpcData.rank);
          }
        }

        resolve({ paralleData, barrierData, rankData, suggest: hpcData?.suggest });
      });
    });
  }


  // 非MPI模式处理
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
    let a: IHpcRankData;
    data.map((item: any) => {
      // 去掉括号
      if (item[1].indexOf('s') > -1) {
        item[1] = item[1].split('s')[0].trim();
      }
      if (item[2].indexOf('s (') > -1) {
        item[2] = item[2].split('s (')[0].trim();
      }
      if (item[3].indexOf('s (') > -1) {
        item[3] = item[3].split('s (')[0].trim();
      }
      if (item[4].indexOf('s (') > -1) {
        item[4] = item[4].split('s (')[0].trim();
      }
      a = {
        id: item[0],
        exe_time: item[1],
        run_time: item[2],
        paraller_time: item[3],
        unbalance_time: item[4],
        barrierData: [],
        expand: false,
        paralleData: []
      };
      rank.push(a);
    });
    return rank;
  }
}
