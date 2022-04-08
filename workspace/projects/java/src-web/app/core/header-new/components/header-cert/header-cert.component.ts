import { Component, OnInit } from '@angular/core';
import { I18nService } from 'projects/java/src-web/app/service/i18n.service';
import { AxiosService } from 'projects/java/src-web/app/service/axios.service';
import { MytipService } from 'projects/java/src-web/app/service/mytip.service';
import { TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';

@Component({
  selector: 'app-header-cert',
  templateUrl: './header-cert.component.html',
  styleUrls: ['./header-cert.component.scss']
})
export class HeaderCertComponent implements OnInit {

  constructor(
    public i18nServe: I18nService,
    public Axios: AxiosService,
    public myTip: MytipService
  ) {
    this.i18n = this.i18nServe.I18n();
    this.noDadaInfo = this.i18n.common_term_task_nodata;
    this.columns = [
      {
        title: this.i18n.newHeader.certificate.certName,
        sortKey: 'certName',
        width: '20%'
      },
      {
        title: this.i18n.newHeader.certificate.status,
        sortKey: 'status',
        width: '20%'
      },
      {
        title: this.i18n.newHeader.certificate.certValid,
        sortKey: 'certValid',
        width: '20%'
      },
      {
        title: this.i18n.newHeader.certificate.certType,
        sortKey: 'certType',
        width: '20%'
      }
    ];
  }
  public i18n: any;
  public displayed: Array<TiTableRowData> = []; // 表示表格实际呈现的数据（开发者默认设置为[]即可）
  public srcData: TiTableSrcData;
  private data: Array<TiTableRowData> = [];
  public columns: Array<TiTableColumns> = [];
  public noDadaInfo: any;
  public isLoading: any = false;
  ngOnInit() {
    this.srcData = {
      data: this.data,
      state: {
        searched: false,
        sorted: false,
        paginated: false
      }
    };
    this.handleGetCertData();
  }
  handleGetCertData() {
    this.isLoading = true;
    this.Axios.axios.get('tools/certificates').then((res: any) => {
      this.isLoading = false;
      this.data = res.members.map((item: any) => {
        const certName = item.certificateName;
        const certType = item.certificateType;
        const certValid = this.handleFormatTime(item.notAfter);
        const status = item.verify;
        const statusName = this.i18n.newHeader.certificate[item.verify];
        return {
          certName,
          certType,
          certValid,
          statusName,
          status
        };
      });
      this.srcData.data = this.data;
    }).catch(() => {
      this.isLoading = false;
    });
  }
  handleCertStatus(status: any) {
    let circleColor = '';
    switch (status) {
      case 'VALID':
        circleColor = 'color-green';
        break;
      case 'EXPIRING':
        circleColor = 'color-orange';
        break;
      case 'EXPIRED':
        circleColor = 'color-red';
        break;
      case 'NONE':
        circleColor = 'color-green';
        break;
      default:
        break;
    }
    return circleColor;
  }
  handleFormatTime(time: any) {
    const date = new Date(time);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    const min = date.getMinutes();
    const sec = date.getSeconds();
    return `${year}/${month < 10 ? '0' + month : month}/${day < 10 ?
       '0' + day : day} ${hour < 10 ? '0' + hour : hour}:` +
      `${min < 10 ? '0' + min : min}:${sec < 10 ? '0' + sec : sec}`;
  }
  handleRefreshWorkingKey() {
    this.Axios.axios.post('tools/workingKey').then((res: any) => {
      if (res.code === 0) {
        this.myTip.alertInfo({
          type: 'success',
          content: res.message,
          time: 3500,
        });
      }
    });
  }
}
