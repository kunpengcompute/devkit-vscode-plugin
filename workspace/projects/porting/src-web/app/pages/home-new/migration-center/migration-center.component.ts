import { Component, OnInit, ViewChild, OnDestroy, Output, EventEmitter } from '@angular/core';
import { TiMessageService, TiTableRowData, TiTableColumns, TiTableSrcData } from '@cloud/tiny3';
import { Router, ActivatedRoute } from '@angular/router';
import {
  CommonService, I18nService, AxiosService,
  MytipService, MessageService
} from '../../../service';
import { HomeNewService } from '../home-new.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-migration-center',
  templateUrl: './migration-center.component.html',
  styleUrls: ['./migration-center.component.scss']
})
export class MigrationCenterComponent implements OnInit, OnDestroy {

  @ViewChild('pwd', { static: false }) pwdMask: any;
  @Output() voted = new EventEmitter<string>();

  public i18n: any;
  public firstSortData: Array<any> = [];
  public isClick = 0;
  public sortLabels: Array<any> = [];
  public currLang = '';
  public routeType = '';
  public displayed: Array<TiTableRowData> = []; // 表示表格实际呈现的数据（开发者默认设置为[]即可）
  public srcData: TiTableSrcData;
  public secondSortData: Array<TiTableRowData> = [];
  public columns: Array<TiTableColumns> = [];
  public flag = false;
  private closeTaskSub: Subscription;
  constructor(
    public messageervice: MessageService,
    public i18nService: I18nService,
    public Axios: AxiosService,
    public timessage: TiMessageService,
    public router: Router,
    public route: ActivatedRoute,
    public mytip: MytipService,
    public commonService: CommonService,
    private homeService: HomeNewService
  ) {
    this.i18n = this.i18nService.I18n();
    // 禁止复用路由
    this.router.routeReuseStrategy.shouldReuseRoute = () => {
      return false;
    };
  }
  public firstSort = '';

  public progressData: any = {};
  public isAlermOpt = false; // 告警时禁止操作
  public progressContext: any = {};

  public sampleBtnTip = '';
  public currentPage = 1;
  public totalNumber: number;
  public pageSize: { options: Array<number>, size: number} = {
      options: [10, 20, 50, 100],
      size: 10
  };
  public infoArr = {
    title: '',
    dsc: '',
    select: '',
    flag: false,
  };
  ngOnInit() {
    this.progressData = {
      id: 'disk',
      label: '',
      isShow: false,
      value: 0
    };
    this.infoArr.title =  this.i18n.common_term_migration_pre_tip.title;
    this.infoArr.dsc =  this.i18n.common_term_migration_pre_tip.content;
    this.infoArr.select =  this.i18n.common_term_migration_pre_tip.label;

    this.currLang = sessionStorage.getItem('language');
    this.closeTaskSub = this.homeService.getMessage().subscribe(msg => {
      if (sessionStorage.getItem('isFirst') !== '1' && sessionStorage.getItem('isExpired') !== '1') {
        const idx = JSON.parse(sessionStorage.getItem('isClick'));
        this.routeType = msg.type;
        this.getFirstSort(idx);
      }
    });
    if (sessionStorage.getItem('isFirst') !== '1' && sessionStorage.getItem('isExpired') !== '1') {
      if (!this.routeType) {
        const tabType = sessionStorage.getItem('tabType');
        this.routeType = tabType;
        this.getFirstSort(JSON.parse(sessionStorage.getItem('isClick')));
      }
    }
    this.columns = [
      { title: this.i18n.common_term_tab2_table_label1, width: '10%' },
      { title: this.i18n.common_term_tab2_table_label2, width: '10%' },
      { title: this.i18n.common_term_tab2_table_label3, width: '70%' }
    ];
    this.sortLabels = [
      { label: this.i18n.common_term_migration_sort_BD },
      { label: this.i18n.common_term_migration_sort_MS },
      { label: this.i18n.common_term_migration_sort_DS },
      { label: this.i18n.common_term_migration_sort_DB },
      { label: this.i18n.common_term_migration_sort_NW },
      { label: this.i18n.common_term_migration_sort_RTL },
      { label: this.i18n.common_term_migration_sort_HPC },
      { label: this.i18n.common_term_migration_sort_SDS },
      { label: this.i18n.common_term_migration_sort_CLOUD },
      { label: this.i18n.common_term_migration_sort_NATIVE },
      { label: this.i18n.common_term_migration_sort_WEB },
    ];
  }

  ngOnDestroy(): void {
    if (this.closeTaskSub) { this.closeTaskSub.unsubscribe(); }
  }

  closeModal() {
    let preTab = sessionStorage.getItem('chooseTab');
    if (preTab === 'migrationCenter' || !preTab) { preTab = 'porting-workload'; }
    this.pwdMask.Close();
    this.router.navigate(['homeNew/' + preTab]);
    this.voted.emit(preTab);
    sessionStorage.setItem('chooseTab', preTab);
  }

  confirmChk() {
    this.Axios.axios.post('/portadv/solution/disclaimer/').then((res: any) => {
      if (this.commonService.handleStatus(res) === 0) {
        this.pwdMask.Close();
       }
    });
  }

  // 查询迁移类别
  public getFirstSort(idx: number = 0): void {
    this.Axios.axios.get('/portadv/solution/category/').then((res: any) => {
      const data = res.data;
      if (this.commonService.handleStatus(res) === 0) {
        if (!data.disclaimer) { // 弹出迁移必读
          this.pwdMask.Open();
        }
        if (data.category.length) {
          idx = idx || 0;
          this.showSecondData(data.category[idx], idx);
        }
      } else {
        if (sessionStorage.getItem('language') === 'zh-cn') {
          this.mytip.alertInfo({ type: 'warn', content: res.infochinese, time: 10000, web: 'migration' });
        } else {
          this.mytip.alertInfo({ type: 'warn', content: res.info, time: 10000, web: 'migration' });
        }
      }
    });
  }

  public showSecondData(item: any, index: any) {
    this.isClick = index;
    this.firstSort = item;
    const url = `/portadv/solution/basicinfo/`;
    this.Axios.axios.get(url, { params: { category: item } }).then((data: any) => {
      if (this.commonService.handleStatus(data) === 0) {
        this.totalNumber = data.data.software.length;
        this.secondSortData = data.data.software;
        this.srcData = {
          data: this.secondSortData,
          state: {
            searched: false, // 源数据未进行搜索处理
            sorted: false, // 源数据未进行排序处理
            paginated: false // 源数据未进行分页处理
          }
        };
      } else {
        const content = this.currLang === 'zh-cn' ? data.infochinese : data.info;
        this.mytip.alertInfo({ type: 'warn', content, time: 10000, web: 'migration' });
      }
    });
  }

  public showDetail(item: any) {
    const params = {
      queryParams: {
        software: `${this.firstSort}_${item.name}_${item.version}_${item.type}`
      }
    };
    sessionStorage.setItem('routeTypeName', item.name);
    this.router.navigate(['migrationDetail'], params);
  }

}
