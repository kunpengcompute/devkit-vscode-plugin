import { Injectable } from '@angular/core';

import { I18nService } from '../../../service/i18n.service';

@Injectable({
  providedIn: 'root'
})
export class BcfileReportService {

  constructor(
    private i18nService: I18nService
  ) {
    this.i18n = this.i18nService.I18n();
  }

  public i18n: any;

  // 对返回的报告数据进行处理
  handleReportDate(data: any) {
    const settingLeftInfo = [
      { label: this.i18n.check_weak.BCFile, value: data.source_dir }
    ];
    const fixSum = data.fix_sum;
    let fileArr = [];
    const soFileSrcData: Array<any> = [];
    data.result.barriers.forEach((item: any, index: any) => {
      fileArr = item.file.split('/');
      soFileSrcData.push({
        number: index + 1,
        name: fileArr[fileArr.length - 1],
        path: item.file,
        suggTotal: item.count,
        data: this.handlePositon(item.locs)
      });
    });

    return {
      settingLeftInfo,
      fixSum,
      soFileSrcData
    };
  }

  /**
   * 处理 建议代码位置
   */
  handlePositon(locs: any): Array<any> {
    const arr: Array<any> = [];
    if (locs.length) {
      locs.forEach((item: any, index: number) => {
        arr.push({
          num: index + 1,
          position: `Line:${item.line}，Column:${item.col}`
        });
      });
    }
    return arr;
  }
}
