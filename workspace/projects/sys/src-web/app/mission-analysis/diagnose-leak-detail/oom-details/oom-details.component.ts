import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';

@Component({
  selector: 'app-oom-details',
  templateUrl: './oom-details.component.html',
  styleUrls: ['./oom-details.component.scss']
})
export class OomDetailsComponent implements OnInit {

  @Input() taskId: number;
  @Input() nodeId: number;

  @ViewChild('oomDetailsModal') oomDetailsModal: any;
  constructor(
    private Axios: AxiosService,
    public i18nService: I18nService
  ) {
    this.i18n = this.i18nService.I18n();
    this.baseLabel = {
      time: this.i18n.oomDetail.timeLine,
      trigger: this.i18n.oomDetail.trigger,
      killer: this.i18n.oomDetail.killer,
    };
  }
  public i18n: any;
  public baseLabel: any;
  public hasBorder = false;
  public baseInfo: any[] = [];
  // 调用栈信息列表
  public stackInformationList: any[] = [];
  // 系统内存信息
  public systemMemoryInformationList: any[] = [];
  // 左侧时间列表
  public leftTimeList: any[] = [];
  public active = 0;
  // 详情的数据列表
  public detailedInformationList: any[] = [];

  // 表格数据
  public headerList: any[] = []; // 表格表头
  public searchInfo: { isShowSearch: boolean, searchInput: string } = {
    isShowSearch: false,
    searchInput: ''
  };
  public searchWords: any[] = [];
  public searchKeys = ['pid'];
  public displayed: Array<TiTableRowData> = []; // 表示表格实际呈现的数据（开发者默认设置为[]即可）
  public srcData: TiTableSrcData;
  private data: Array<TiTableRowData> = [];
  public columns: Array<TiTableColumns> = [];
  public currentPage = 10;
  public totalNumber = 0;
  public pageSize: { options: Array<number>, size: number } = {
    options: [10, 20, 50, 100],
    size: 10
  };
  ngOnInit(): void {
    this.Axios.axios.get(`/memory-analysis/${this.taskId}/get-oom-info/?oomDetail=oom_time_val&nodeId=${this.nodeId}`)
      .then((res: any) => {
        this.leftTimeList = res.data.oom_detail.data.time_val;
        if (!this.leftTimeList) { return; }
        this.initRightInfo(this.leftTimeList[0]);
      });
    // 表格源数据，开发者对表格的数据设置请在这里进行
    this.srcData = {
      data: this.data, // 源数据
      // 用来标识传进来的源数据是否已经进行过排序、搜索、分页操作，
      // 已经做过的，tiny就不再做了
      // 如果没做，tiny会对传入的源数据做进一步处理（前提是开发者设置了相关特性，比如分页），然后作为displayedData显示出来
      // 本示例中，开发者设置了分页特性，且对源数据未进行分页处理，因此tiny会对数据进行分页处理
      state: {
        searched: false, // 源数据未进行搜索处理
        sorted: false, // 源数据未进行排序处理
        paginated: false // 源数据未进行分页处理
      }
    };
    this.searchWords = [this.searchInfo.searchInput];
  }
  // 点击表头搜索框出现搜索框
  public searchPid() {
    this.searchInfo.isShowSearch = true;
  }
  public hideSearchBox() {
    this.searchInfo.isShowSearch = false;
  }
  // 输入内容搜索
  public setOneWordSearch(value: string): void {
    this.searchWords[0] = value;
  }
  public chooseItem(val: any) {
    this.active = val;
    this.initRightInfo(this.leftTimeList[val]);
  }
  public showMsg() {
    this.getOomInfoDetails(this.leftTimeList[this.active]);
  }
  public initRightInfo(time: string) {
    this.getOomBasicDetail(time);
    this.getOomProcessCalltrace(time);
    this.getOomsystemMem(time);
    this.getOomProcessMem(time);
  }
  public getOomBasicDetail(timeVal: string) {
    this.Axios.axios.get(
      `/memory-analysis/${this.taskId}/get-oom-info/?oomDetail=oom_basic_val&nodeId=${this.nodeId}&timeVal=${timeVal}`)
      .then((res: any) => {
        if (JSON.parse(JSON.stringify(res.data)) !== '{}') {
          this.baseInfo = res.data.oom_detail.data;
          this.baseInfo.forEach(((item: any) => {
            item.key = this.baseLabel[item.key];
          }));
        }
      });
  }
  public getOomProcessCalltrace(timeVal: string) {
    this.Axios.axios.get(`/memory-analysis/${this.taskId}
    /get-oom-info/?oomDetail=oom_process_calltrace&nodeId=${this.nodeId}&timeVal=${timeVal}`).then((res: any) => {
      this.stackInformationList = res.data.oom_detail.data.calltrace;
    });
  }
  public getOomsystemMem(timeVal: string) {
    this.Axios.axios.get(`/memory-analysis/${this.taskId}/get-oom-info/?oomDetail=oom_system_mem&nodeId=
    ${this.nodeId}&timeVal=${timeVal}`).then((res: any) => {
      this.systemMemoryInformationList = res.data.oom_detail.data;
      this.systemMemoryInformationList.forEach((item: any) => {
        item.key = item.key[0].toUpperCase() + item.key.slice(1);
      });
    });
  }
  public getOomProcessMem(timeVal: string) {
    this.columns = [];
    this.Axios.axios.get(`/memory-analysis/${this.taskId}/get-oom-info/?oomDetail=oom_process_mem&nodeId=
    ${this.nodeId}&timeVal=${timeVal}`).then((res: any) => {
      this.headerList = res.data.oom_detail.data.header;
      res.data.oom_detail.data.header.forEach((item: any) => {
        this.columns.push({ prop: item, title: item, width: '10%', sortKey: item });
      });
      this.srcData.data = res.data.oom_detail.data.data;
      this.totalNumber = res.data.oom_detail.data.data.length;
    });
  }
  // oom_detail
  public getOomInfoDetails(timeVal: string) {
    this.Axios.axios.get(`/memory-analysis/${this.taskId}/get-oom-info/?oomDetail=oom_detail&nodeId=
    ${this.nodeId}&timeVal=${timeVal}`).then((res: any) => {
      this.detailedInformationList = res.data.oom_detail.data;
      this.oomDetailsModal.showMsg();
    });
  }
}

