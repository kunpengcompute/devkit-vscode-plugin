import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { TiTableRowData, TiTableSrcData, TiTableColumns, TiModalService, TiModalRef } from '@cloud/tiny3';

import { I18nService } from '../../service/i18n.service';
import { VscodeService } from '../../service/vscode.service';

@Component({
  selector: 'app-bc-download',
  templateUrl: './bc-download.component.html',
  styleUrls: ['./bc-download.component.scss']
})

export class BcDownloadComponent implements OnInit {
  @Input() bcOptions: any;
  @Input() weakFileName: any;
  @Input() workspace: any;
  @Input() bcGenerateTaskId: any;
  @Input() intellijFlag: any;

  @ViewChild('bcDownloadModal', { static: false }) bcDownloadModal: any;

  constructor(
    private tiModal: TiModalService,
    public i18nService: I18nService,
    public vscodeService: VscodeService,
    ) {
      this.i18n = this.i18nService.I18n();
    }

  public bcFileTableData: Array<TiTableRowData> = [];
  public bcFileSrcData: TiTableSrcData;
  public bcFileColumns: Array<TiTableColumns> = [];
  public checkedList: Array<TiTableRowData> = []; // 默认选中项
  public downSelecteds: Array<any> = [];
  public multipleDownloadBtn = true; // 多文件下载按钮是否禁用
  public fileArray: Array<any> = [];
  public i18n: any;
  public currLang: string;

  ngOnInit(): void {
    this.currLang = sessionStorage.getItem('language');
    this.bcFileColumns = [
      {
        title: this.i18n.plugins_porting_weakCheck.bc_modal.num,
        sortKey: 'No.', // 设置排序时按照源数据中的哪一个属性进行排序
        width: '10%'
      },
      {
        title: this.i18n.plugins_porting_weakCheck.bc_modal.filename,
        sortKey: 'fileName', // 设置排序时按照源数据中的哪一个属性进行排序
        width: '25%'
      },
      {
        title: this.i18n.plugins_porting_weakCheck.bc_modal.path,
        sortKey: 'fileSize',
        width: '50%'
      },
      {
        title: this.i18n.plugins_porting_weakCheck.bc_modal.operating,
        sortKey: 'status',
        width: '15%'
      },
    ];
  }

  // 显示BC文件下载modal
  showBcDownloadModal() {
    this.bcFileSrcData = {
      data: this.bcOptions,
      state: {
        searched: false, // 源数据未进行搜索处理
        sorted: false, // 源数据未进行排序处理
        paginated: false // 源数据未进行分页处理
      }
    };
    this.tiModal.open(this.bcDownloadModal, {
        id: 'bcDownloadModal',
        modalClass: 'dragModal700',
        beforeClose: (modalRef: TiModalRef) => {
          this.downSelecteds = [];
          this.checkedList = [];
          modalRef.destroy(true);
        }
    });
  }

  onMyChange(event: any): void {
    this.downSelecteds = [];
    for (const element of event) {
        this.downSelecteds.push(element.label);
    }
    if (this.downSelecteds.length > 0) {
      this.multipleDownloadBtn = false;
    }else {
      this.multipleDownloadBtn = true;
    }
  }

  // BC文件下载
  bcDownLoad(bcFile?: any){
    this.fileArray = [];
    if (bcFile) {
        const params = {
            bcFileName: bcFile
          };
        if (this.intellijFlag) {
            this.downloadFileByIntellij(params);
            return;
        }
        this.getBcFile(params, () => {
          this.downloadInfo(this.fileArray);
        });
    }else{
        if (this.downSelecteds) {
            if (this.intellijFlag) {
              const params = {
                bcFileNames: this.downSelecteds
              };
              this.downloadFileByIntellij(params);
              return;
            }
            let count = 0;
            const filenum = this.downSelecteds.length;
            this.downSelecteds.forEach((file: any) => {
              const params = {
                bcFileName: file,
              };
              this.getBcFile(params, () => {
                count ++;
                if (count === filenum) {
                  this.downloadInfo(this.fileArray);
                }
              });
            });
        }
    }
  }

  getBcFile(params: any, callback: any){
    const option = {
      url: '/portadv/weakconsistency/tasks/' + this.bcGenerateTaskId + '/bcfilelist/',
      responseType: 'arraybuffer',
      params,
    };
    this.vscodeService.post(option, (res: any) => {
      this.fileArray.push({
        fileName: option.params.bcFileName,
        res
      });
      callback();
    });
  }

  /**
   * port操作日志详细列表
   * @param bcList bc文件列表
   */
  public downloadInfo(res: any, fileName?: any) {
    const reportParams = {
      data: res,
      reportId: fileName,
    };

    const option = {
      cmd: 'downloadBcFile',
      data: reportParams
    };
    this.vscodeService.postMessage(option, null);
  }

  /**
   * intellij port操作日志详细列表
   * @param bcList bc文件列表
   */
  public downloadFileByIntellij(params: any){
    const message = {
      cmd: 'downloadBcFiles',
      data: {
          taskId: this.bcGenerateTaskId,
          fileName: params.bcFileName,
          fileNames: params.bcFileNames,
        }
      };
    this.vscodeService.postMessage(message, null);
  }

}
