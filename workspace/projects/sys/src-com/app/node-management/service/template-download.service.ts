import { Injectable } from '@angular/core';
import { DownloadFileService } from '../../service';
import { SysLocale } from 'sys/locale/sys-locale';
import { SysLocaleLang } from 'sys/locale';

@Injectable({
  providedIn: 'root',
})
export class TemplateDownloadService {
  private readonly tplNameMap = new Map<string, string>([
    ['add' + SysLocaleLang.ZH_CN, 'Template_for_Batch_Addition_Chinese'],
    ['add' + SysLocaleLang.EN_US, 'Template_for_Batch_Addition_English'],
    ['delete' + SysLocaleLang.ZH_CN, 'Template_for_Batch_Deletion_Chinese'],
    ['delete' + SysLocaleLang.EN_US, 'Template_for_Batch_Deletion_English'],
  ]);
  private readonly tplFileSuffix = '.xlsx';

  constructor(private downloadServe: DownloadFileService) {}

  /**
   * 下载导入模板
   */
  downloadImport() {
    this.downloadServe.downloadCom(
      `/nodes/download/?type=add&language=${SysLocale.getLocale()}`,
      {},
      {
        fileName:
          this.tplNameMap.get('add' + SysLocale.getLocale()) +
          this.tplFileSuffix,
      }
    );
  }

  /**
   * 下载删除模板
   */
  downloadDelete() {
    this.downloadServe.downloadCom(
      `/nodes/download/?type=delete&language=${SysLocale.getLocale()}`,
      {},
      {
        fileName:
          this.tplNameMap.get('delete' + SysLocale.getLocale()) +
          this.tplFileSuffix,
      }
    );
  }
}
