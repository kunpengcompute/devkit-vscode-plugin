import { Injectable } from '@angular/core';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
import { IHpcTopDwon } from '../../domain';
@Injectable({
  providedIn: 'root'
})
export class HpcTopDownService {

  constructor(
    private http: AxiosService,
  ) { }

  public getTopDownData(taskid: number, nodeid: number)
    : Promise<{ topdown: Array<IHpcTopDwon>, echartsData: IHpcTopDwon }> {
    const params = {
      'node-id': nodeid,
      'query-type': 'top-down'
    };
    return new Promise<any>((resolve, reject) => {
      this.http.axios.get(
        `tasks/${encodeURIComponent(taskid)}/hpc-analysis/topdown/`,
        { params, headers: { showLoading: false } })
        .then((res: any) => {
          let topdown: Array<IHpcTopDwon>;
          let echartsData: IHpcTopDwon;
          const rawData = res?.data?.hpc?.data;
          if (rawData != null) {
            topdown = this.getTopDown(rawData, 0);
            echartsData = {
              children: topdown,
              expand: true,
              levelIndex: 0,
              name: 'HPC top-down',
              proportion: 100,
              value: '100 %'
            };
          }
          resolve({ topdown, echartsData });
        }).catch(() => { reject(false); });
    });
  }

  private getTopDown(
    data: Array<IHpcTopDwon>, index: number
  ): Array<IHpcTopDwon> {
    return !Array.isArray(data)
      ? void 0
      : data.map((item: IHpcTopDwon) => {
        return {
          levelIndex: index,
          name: item.name,
          value: item.value,
          proportion: +item.value?.replace?.('%', '')?.trim() || 0,
          max: true,
          expand: item.children == null,
          children: this.getTopDown(item.children, index + 1)
        };
      });
  }
}
