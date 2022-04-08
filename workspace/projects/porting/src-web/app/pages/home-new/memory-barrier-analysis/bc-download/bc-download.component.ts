import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { TiTableRowData, TiTableSrcData, TiTableColumns, TiModalService, TiModalRef } from '@cloud/tiny3';

import {
  MytipService, AxiosService,
  I18nService
} from '../../../../service';

@Component({
  selector: 'app-bc-download',
  templateUrl: './bc-download.component.html',
  styleUrls: ['./bc-download.component.scss']
})

export class BcDownloadComponent implements OnInit {
  @Input() bcOptions: any;
  @Input() weakFileName: any;
  @Input() workspace: any;
  @Input() weakCopmilerId: any;

  @ViewChild('bcDownloadModal', { static: false }) bcDownloadModal: any;

  constructor(
    private tiModal: TiModalService,
    public i18nService: I18nService,
    private axiosService: AxiosService,
    private mytip: MytipService,
    ) {
      this.i18n = this.i18nService.I18n();
    }

  public bcFileTableData: Array<TiTableRowData> = [];
  public bcFileSrcData: TiTableSrcData;
  public bcFileColumns: Array<TiTableColumns> = [];
  public checkedList: Array<TiTableRowData> = []; // 默认选中项
  public downSelecteds: Array<any> = [];
  public i18n: any;
  public currLang: string;

  ngOnInit(): void {
    this.currLang = sessionStorage.getItem('language');
    this.bcFileColumns = [
      {
        title: this.i18n.check_weak.bc_modal.num,
        sortKey: 'No.', // 设置排序时按照源数据中的哪一个属性进行排序
        width: '10%'
      },
      {
        title: this.i18n.check_weak.bc_modal.filename,
        sortKey: 'fileName', // 设置排序时按照源数据中的哪一个属性进行排序
        width: '25%'
      },
      {
        title: this.i18n.check_weak.bc_modal.path,
        sortKey: 'fileSize',
        width: '60%'
      },
      {
        title: this.i18n.check_weak.bc_modal.operating,
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
  }

  // BC文件下载
  bcDownLoad(bcFile?: any){
    if (bcFile) {
        const params = {
          bcFileName: bcFile
          };
        this.getBcFile(params);
    }else{
      let count = -200;
      if (this.downSelecteds) {
        this.downSelecteds.forEach((file: any) => {
          count = count + 200;
          const params = {
            bcFileName: file
          };
          setTimeout(() => this.getBcFile(params), count);
        });
      }
    }
  }

  getBcFile(params: any){
    this.axiosService.axios.post(
        `/portadv/weakconsistency/tasks/${encodeURIComponent(this.weakCopmilerId)}/bcfilelist/`,
         params, {responseType: 'arraybuffer'})
        .then((res: any) => {
          if ( res.status ) {
            // filename为None，参数错误
            const failInfo = sessionStorage.getItem('language') === 'zh-cn' ? res.infochinese : res.info;
            this.mytip.alertInfo({ type: 'warn', content: failInfo, time: 10000 });
          }else {
            this.downloadFile(res, params);
          }
    });
  }

  /**
   * 创建blob对象，并利用浏览器打开url进行下载
   * @param data 文件流数据
   */
  downloadFile(data: any, params: any) {
    const contentType = '*/*';
    const blob = new Blob([data], { type: contentType });
    if ('download' in document.createElement('a')) {
    const url = window.URL.createObjectURL(blob);
    // 以动态创建a标签进行下载
    const a = document.createElement('a');
    a.href = url;
    a.download = params.bcFileName;
    a.setAttribute('id', params.bcFileName);
    a.click();
    window.URL.revokeObjectURL(url);
    } else {
      if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        // for IE
        window.navigator.msSaveOrOpenBlob(blob, params.bcFileName);
      }
    }
  }
}
