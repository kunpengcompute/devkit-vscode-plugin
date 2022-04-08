import { Injectable } from '@angular/core';
import { AnalysisType, IHpcTaskInfo } from 'projects/sys/src-web/app/domain';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';

@Injectable({
  providedIn: 'root'
})
export class TaskInfoService {

  constructor(
    private http: AxiosService
  ) { }

  public pullTakeInfo(taskId: number, nodeId: number): Promise<IHpcTaskInfo> {
    const params = {
      'node-id': nodeId,
      'analysis-type': AnalysisType.Hpc
    };
    return new Promise<IHpcTaskInfo>((resolve) => {
      this.http.axios.get(
        '/tasks/' + encodeURIComponent(taskId) + '/common/configuration/',
        { params, headers: { showLoading: false } }
      ).then((res: any) => {
        resolve(res.data);
      });
    });
  }
}
