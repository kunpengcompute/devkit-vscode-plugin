import { Component, OnInit } from '@angular/core';
import { I18nService } from '../../../service/i18n.service';
import { AxiosService } from '../../../service/axios.service';
import { LibService } from '../../../service/lib.service';

@Component({
  selector: 'app-offline-reportinfor',
  templateUrl: './offline-reportinfor.component.html',
  styleUrls: ['./offline-reportinfor.component.scss']
})
export class OfflineReportinforComponent implements OnInit {
  i18n: any;
  constructor(
    private i18nService: I18nService,
    public Axios: AxiosService,
    public libService: LibService,
  ) {
    this.i18n = this.i18nService.I18n();
    this.mainInforList = [
      {
        lable: this.i18n.offlineRecode.heapdump.reportName,
        value: '',
      },
      {
        lable: '',
        value: '',
      },
      {
        lable: this.i18n.offlineRecode.heapdump.type,
        value: '',
      }
    ];
    this.lessInforList = [
      {
        lable: this.i18n.offlineRecode.heapdump.processName,
        value: '',
      },
      {
        lable: this.i18n.offlineRecode.heapdump.processId,
        value: '',
      },
      {
        lable: this.i18n.offlineRecode.heapdump.processParameters,
        value: '',
      },
      {
        lable: this.i18n.offlineRecode.heapdump.processRemarks,
        value: '',
      }
    ];
  }

  public mainInforList: any = [
    {
      lable: '',
      value: '',
    },
    {
      lable: '',
      value: '',
    },
    {
      lable: '',
      value: '',
    }
  ];
  public lessInforList: any = [
    {
      lable: '',
      value: '',
    },
    {
      lable: '',
      value: '',
    },
    {
      lable: '',
      value: '',
    },
    {
      lable: '',
      value: '',
    }
  ];
  public heapdumpId: string;
  public threaddumpId: string;
  public gclogId: string;
  public reportType: string;
  public isLoading: any = false;
  ngOnInit(): void {
    this.reportType = sessionStorage.getItem('reportType');
    if (this.reportType === 'threaddump') {
      this.threaddumpId = sessionStorage.getItem('threaddumpId');
      this.getThreadDumpReportInfor();
    } else if (this.reportType === 'heapdump') {
      this.heapdumpId = sessionStorage.getItem('heapdumpId');
      this.getHeapDumpReportInfor();
    } else if (this.reportType === 'GCLog') {
      this.gclogId = sessionStorage.getItem('GCLogId');
      this.getGclogReportInfor();
    }
  }

  /**
   * 获取线程转储信息
   */
  public getThreadDumpReportInfor() {
    this.isLoading = true;
    this.Axios.axios.get(`/threadDump/${this.threaddumpId}`).then((res: any) => {
      this.mainInforList[0].value = res.data.reportName;
      this.mainInforList[1].value = this.libService.dateFormat(res.data.createTime, 'yyyy/MM/dd hh:mm:ss');
      this.mainInforList[2].value = res.data.reportSource === 'SELF_COLLECTION'
        ? this.i18n.offlineRecode.heapdump.selfCollection
        : this.i18n.offlineRecode.heapdump.import;
      this.mainInforList[1].lable = res.data.reportSource === 'SELF_COLLECTION'
        ? this.i18n.offlineRecode.heapdump.importNameCreated
        : this.i18n.offlineRecode.heapdump.importNameImported;
      this.lessInforList[0].value = res.data.lvmName;
      this.lessInforList[1].value = res.data.lvmId;
      this.lessInforList[2].value = res.data.params;
      this.lessInforList[3].value = res.data.comment;
      this.isLoading = false;
    });
  }
  /**
   * 获取内存转储信息
   */
  public getHeapDumpReportInfor() {
    this.isLoading = true;
    this.Axios.axios.get(`/heap/actions/record/${this.heapdumpId}`).then((res: any) => {
      this.mainInforList[0].value = res.data.alias;
      this.mainInforList[1].value = this.libService.dateFormat(res.data.createTime, 'yyyy/MM/dd hh:mm:ss');
      this.mainInforList[2].value = res.data.source === 'SELF_COLLECTION'
        ? this.i18n.offlineRecode.heapdump.selfCollection
        : this.i18n.offlineRecode.heapdump.import;
      this.mainInforList[1].lable = res.data.source === 'SELF_COLLECTION'
        ? this.i18n.offlineRecode.heapdump.importNameCreated
        : this.i18n.offlineRecode.heapdump.importNameImported;
      this.lessInforList[0].value = res.data.pidName;
      this.lessInforList[1].value = res.data.lvmId;
      this.lessInforList[2].value = res.data.param;
      this.lessInforList[3].value = res.data.comments;
      this.isLoading = false;
    });
  }
  /**
   * 获取gcLog信息
   */
  public getGclogReportInfor() {
    this.isLoading = true;
    this.Axios.axios.get(`/gcLog/${this.gclogId}`).then((res: any) => {
      this.mainInforList[0].value = res.data.logName;
      this.mainInforList[1].value = this.libService.dateFormat(res.data.createTime, 'yyyy/MM/dd hh:mm:ss');
      this.mainInforList[2].value = res.data.reportSource === 'SELF_COLLECTION'
        ? this.i18n.offlineRecode.heapdump.selfCollection
        : this.i18n.offlineRecode.heapdump.import;
      this.mainInforList[1].lable = res.data.reportSource === 'SELF_COLLECTION'
        ? this.i18n.offlineRecode.heapdump.importNameCreated
        : this.i18n.offlineRecode.heapdump.importNameImported;
      this.lessInforList[0].value = res.data.lvmName;
      this.lessInforList[1].value = res.data.lvmId;
      this.lessInforList[2].value = res.data.params;
      this.lessInforList[3].value = res.data.comment;
      this.isLoading = false;
    });
  }
}
