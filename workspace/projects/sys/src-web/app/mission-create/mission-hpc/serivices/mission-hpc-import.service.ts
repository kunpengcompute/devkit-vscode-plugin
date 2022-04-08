import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { IHpcSchTaskInfo } from '../domain';
import { AnalysisType } from 'projects/sys/src-web/app/domain';

@Injectable({
  providedIn: 'root'
})
export class MissionHpcImportService {

  constructor() { }

  /** 订阅源 */
  private importListerSource = new Subject<IHpcSchTaskInfo>();

  /** 开启节点的通知订阅流 */
  public importLister$ = this.importListerSource
    .asObservable()
    .pipe(
      filter((item => item?.['analysis-type'] === AnalysisType.Hpc))
    );

  /**
   * 导入的发布方法
   * @param taskData 任务信息
   */
  public importTpl(taskData: IHpcSchTaskInfo) {
    this.importListerSource.next(taskData);
  }
}

