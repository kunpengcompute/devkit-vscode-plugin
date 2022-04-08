import { Injectable } from '@angular/core';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
import { IHPCBasicData } from '../domain';
import { MytipService } from 'projects/sys/src-web/app/service/mytip.service';

@Injectable({
  providedIn: 'root'
})
export class BasicDataService {

  private i18n: any;

  constructor(
    private http: AxiosService,
    private i18nService: I18nService,
    private mytip: MytipService
  ) {
    this.i18n = this.i18nService.I18n();
  }

  public getHotspotsData(taskId: number, nodeId: number) {
    return new Promise<any>((resolve) => {
      const params = {
        'node-id': nodeId,
        'query-type': 'hotspots'
      };
      this.http.axios.get(
        '/tasks/' + encodeURIComponent(taskId) + '/hpc-analysis/hotspots/',
        { params, headers: { showLoading: false } }
      ).then((res: any) => {
        resolve(res.data.hpc.data);
      });
    });
  }
}
