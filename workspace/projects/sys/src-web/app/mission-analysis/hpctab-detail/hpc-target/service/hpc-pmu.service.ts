import { Injectable } from '@angular/core';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';

@Injectable({
  providedIn: 'root'
})
export class HpcPmuService {

  constructor(
    private http: AxiosService,
  ) { }

  getPMUdata(taskid: number, nodeid: number): Promise<{ coreData: any[], uncoreData: any[] }> {
    const params = {
      'node-id': nodeid,
      'query-type': 'pmu-event'
    };
    return new Promise<any>((resolve, reject) => {
      this.http.axios.get(
        `/tasks/${encodeURIComponent(taskid)}/hpc-analysis/pmu-event/`,
        { params, headers: { showLoading: false } }
      ).then((res: any) => {
        const coreData: Array<any> = [];
        const uncoreData: Array<any> = [];
        if (res?.data?.hpc?.data) {
          res.data.hpc.data.map((item: any) => {
            if (item.core_type === 'core') {
              coreData.push(item);
            }
            if (item.core_type === 'uncore') {
              uncoreData.push(item);
            }
          });
        }
        resolve({ coreData, uncoreData });
      }).catch(() => { reject(false); });
    });
  }
}
