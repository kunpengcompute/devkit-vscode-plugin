import {
  Component, OnInit, Input, Output, EventEmitter,
  Renderer2, AfterViewInit, ViewChild, ViewEncapsulation, ComponentRef
} from '@angular/core';
import {TiTableColumns, TiTableRowData, TiTableSrcData, Util, TiModalService} from '@cloud/tiny3';
import axios from 'axios';
import {Router} from '@angular/router';
import {
  CommonService, AxiosService, I18nService,
  MytipService, ReportService, MessageService
} from '../../../service';
import {SourceCodeReportApi} from '../../../api';
import {getExplore} from '../../../utils';
import {LoadingScene} from '../../../shared/directive/loading/domain';
import {CreateLoadingRefService} from '../../../shared/directive/loading/service/create-loading-ref.service';
import {LoadingComponent} from '../../../shared/directive/loading/component/loading/loading.component';

@Component({
  selector: 'app-report-detail',
  templateUrl: './report-detail.component.html',
  styleUrls: ['./report-detail.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ReportDetailComponent implements OnInit, AfterViewInit {
  constructor(
    private Axios: AxiosService,
    public i18nService: I18nService,
    public mytip: MytipService,
    private reportService: ReportService,
    private commonService: CommonService,
    private sourceCodeReportApi: SourceCodeReportApi,
    private renderer2: Renderer2,
    public msgservice: MessageService,
    public router: Router,
    private tiModal: TiModalService,
    private createLoadingRefService: CreateLoadingRefService
  ) {
    this.i18n = this.i18nService.I18n();
  }

  @Output() getReportId = new EventEmitter();
  @Output() getIsSign = new EventEmitter();
  @Output() viewSuggestion = new EventEmitter();
  @Input() report: any;
  @ViewChild('ieShowModal', {static: false}) ieShowModal: any;
  /** LoadingComponent 的组件引用 */
  private loadingRef: ComponentRef<LoadingComponent>;
  public imgBase: any;
  public i18n: any;
  public tableWidth: string;
  public humanBudgetNum = 0;
  public humanBudget = 0;
  public humanStandard = 0;
  public enWidth: any;
  private cancels: any = [];
  public haveNewReport = true;
  public IsLockReport = false;
  public showModalWarn = '';
  public showModalBtn = '';
  public newReportId = '';
  public textForm1: any = {
    textForm: {
      type: 'text'
    },
    colsNumber: 1,
    colsGap: ['40px', '40px'],

    fieldVerticalAlign: 'middle',

    firstItem: {
      label: '',
      value: []
    },
    secondItem: {
      label: '',
      value: ''
    },
    thirdItem: {
      label: '',
      value: ''
    },
    fourthItem: {
      label: '',
      value: ''
    },
    fifthItem: {
      label: '',
      value: ''
    },
    sixthItem: {
      label: '',
      value: ''
    }
  };
  public cmakeNeedTrans: number;
  public cmakelistsinfo: number;
  public automakeNeedTrans: number;
  public asmNeedTrans: number;
  public asmFileLines: number;
  public asmlines: number;
  public makefileNeedTrans: number;
  public makefileTotal: number;
  public makefileLines: number;
  public fortranNeedTrans: number;
  public fortranLines: number;
  public soFilesNeed: number;
  public soFilesTotal: number;
  public soFilesUse: number;
  public cFileTotal: number;
  public cFileNeed: number;
  public cLines: number;
  public pythonNeedTrans: number;
  public pythonLines: number;
  public interpretedLines: number;
  public golangNeedTrans: number;
  public golangLines: number;
  public javaNeedTrans: number;
  public javaLines: number;
  public scalaNeedTrans: number;
  public scalaLines: number;
  public showHumanFlag = true;
  public showHumanBudgetNum = true;
  public portingLevelList: Array<any> = [];

  public scanItems = ['soFile', 'cFile', 'lines'];
  public isOpen = false;
  public scanItemsObj: any = {
    soFile: {
      id: '2',
      label: '',
      content: '',
      files: [],
      hasDetail: false,
      isOpen: true
    },
    cFile: {
      id: '3',
      label: '',
      content: '',
      files: [],
      hasDetail: false,
      isOpen: true
    },
    lines: {
      id: '4',
      label: '',
      content: '',
      hasDetail: false,
      isOpen: false
    }
  };
  public cfileDetailDisplay: Array<TiTableRowData> = [];
  public cfileDetailSrcData: TiTableSrcData;

  public cfileDetailColumn: Array<TiTableColumns> = [
    {
      title: '',
      sortKey: '',
      width: '5%'
    },
    {
      title: '',
      width: '10%',
      sortKey: '',
    },
    {
      title: '',
      sortKey: 'path',
      width: '50%'
    },
    {
      title: '',
      width: '10%',
      key: 'firstName',
      sortKey: '',
      selected: null,
      options: [{
        label: '',
      }
      ]
    },
    {
      title: '',
      width: '10%',
      sortKey: 'linecount',
    },
    {
      title: '',
      width: '15%',
      sortKey: ''
    }
  ];
  public binDetailDisplay: Array<TiTableRowData> = [];
  public binDetailSrcData: TiTableSrcData;
  public searchWords: Array<any> = [''];
  public searchKeys: Array<string> = ['oper']; // 设置过滤字段
  public binDetailColumns: Array<TiTableColumns> = [
    {
      title: '',
      width: '5%'
    },
    {
      title: '',
      width: '15%'
    },
    {
      title: '',
      width: '10%'
    },
    {
      title: '',
      width: '25%'
    },
    {
      title: '',
      width: '20%',
      key: 'oper', // 该列的 headfilter 要过滤的字段
      selected: null, // 该列的 headfilter 下拉选中项
      panelWidth: '160px', // 该列的 headfilter 的下拉框宽度
      options: []
    },
    {
      title: '',
      width: '25%'
    }
  ];
  public totalLine: any = 0;
  public realTotalLine: any = 0;
  public cfileLine = 0;

  public curLang = '';
  public copySuccess: string;
  // 当前表格筛选值
  public currentSelectLabel: any;
  public cfileCopy: any;
  public goTip = '';
  public goTipSwitch: boolean;

  ngOnInit() {
    this.curLang = sessionStorage.getItem('language');
    this.copySuccess = this.i18n.common_term_report_detail.copySuccess;
    const tabFlag = JSON.parse(sessionStorage.getItem('tabFlag'));
    if (tabFlag) {
      sessionStorage.setItem('tabFlag', 'false');
      this.Axios.axios.get('/users/disclaimercounts/').then((resp: any) => {
        if (this.commonService.handleStatus(resp) === 0) {
          if (resp.data.disclreadcounts === 0) {
            this.getIsSign.emit(false);
          } else {
            this.getIsSign.emit(true);
          }
        }
        sessionStorage.setItem('tabFlag', 'true');
      });
      this.getConfigData();
      this.getReportDetail();
    }
    this.binDetailSrcData = {
      data: [],
      state: {
        searched: false,
        sorted: false,
        paginated: false
      }
    };
    this.cfileDetailSrcData = {
      data: [],
      state: {
        searched: false,
        sorted: false,
        paginated: false
      }
    };


    this.textForm1.firstItem.label = this.i18n.common_term_ipt_label.source_code_path;
    this.textForm1.secondItem.label = this.i18n.common_term_ipt_label.target_os;
    this.textForm1.thirdItem.label = this.i18n.common_term_ipt_label.target_system_kernel_version;
    this.textForm1.fourthItem.label = this.i18n.common_term_ipt_label.compiler_version;
    this.textForm1.fifthItem.label = this.i18n.common_term_ipt_label.construct_tool;
    this.textForm1.sixthItem.label = this.i18n.common_term_ipt_label.compile_command;
    this.scanItemsObj.soFile.label = this.i18n.common_term_result_soFile;
    this.scanItemsObj.cFile.label = this.i18n.common_term_result_cFile;
    this.scanItemsObj.lines.label = this.i18n.common_term_result_lines;
    this.binDetailColumns[0].title = this.i18n.common_term_no_label;
    this.binDetailColumns[1].title = this.i18n.common_term_name_label_1;
    this.binDetailColumns[2].title = this.i18n.common_term_type_label;
    this.binDetailColumns[3].title = this.i18n.common_term_report_type.software;
    this.binDetailColumns[4].title = this.i18n.common_term_operate_analysis_result;
    this.binDetailColumns[5].title = this.i18n.common_term_operate_sugg_label;
    this.cfileDetailColumn[0].title = this.i18n.common_term_no_label;
    this.cfileDetailColumn[1].title = this.i18n.common_term_name_label;
    this.cfileDetailColumn[2].title = this.i18n.common_term_cFile_path_label;
    this.cfileDetailColumn[3].title = this.i18n.common_term_type_label;
    this.cfileDetailColumn[4].title = this.i18n.common_term_option_lincount;
    this.cfileDetailColumn[5].title = this.i18n.common_term_log_down;
    this.tableWidth = document.body.clientWidth - 280 + 'px';
    this.cfileDetailColumn[3].options[0].label = this.i18n.common_term_option_cFile_all;
    this.binDetailColumns[4].options = [
      { // 该列的 headfilter 下拉选择项
        label: this.i18n.common_term_report_all
      }, {
        label: this.i18n.common_term_report_level0_desc
      }, {
        label: this.i18n.common_term_report_level5_desc
      }
    ];
    // 设置初始化第一列 headfilter 的选中项
    this.binDetailColumns[4].selected = this.binDetailColumns[4].options[0];
  }

  ngAfterViewInit() {
    // 整个页面的滚动条监听，关闭下拉框
    const element = $('.main-container')[0];
    this.renderer2.listen(element, 'scroll', () => {
      Util.trigger(document, 'tiScroll');
    });
  }

  public async goReportDiff(data: any) {
    await this.isOldReport();
    if (!this.haveNewReport) {
      return;
    }
    sessionStorage.setItem('currentfilename', data.path);
    this.viewSuggestion.emit(data);
  }

  public async isOldReport(type: any = 'View') {
    // 生成loading页面
    this.loadingRef = this.createLoadingRefService.createLoading(
      document.querySelector('body'), LoadingScene.GLOBAL);
    const CancelToken = axios.CancelToken;
    this.haveNewReport = true;
    this.IsLockReport = false;
    await this.Axios.axios.get(`/task/progress/?task_type=0&task_id=${encodeURIComponent(this.report.id)}`, {
      cancelToken: new CancelToken(c1 => (this.cancels.push(c1)))
    })
      .then((resp: any) => {
        if (resp.data.id){
          this.newReportId = resp.data.id;
        }
        if (resp.status === '0x0d0112') {
          this.haveNewReport = false;
          this.IsLockReport = true;
          this.showModalWarn = this.i18n.common_term_operate_locked1_noOldReport;
          this.showModalBtn = this.i18n.common_term_operate_Create;
          this.showModal();
        } else if (resp.status === '0x0d0223' && type === 'Download') {
          this.IsLockReport = true;
          this.showModalWarn = this.i18nService.I18nReplace(
            this.i18n.common_term_operate_locked1_download, {
              0: this.commonService.formatCreatedId(resp.data.id),
            });
          this.showModalBtn = this.i18n.common_term_operate_Download;
          this.showModal();
        }
        // 异常场景，销毁loading
        this.createLoadingRefService.destroyLoading(this.loadingRef);
        this.loadingRef = null;
      });
  }

  showModal() {
      this.tiModal.open(this.ieShowModal, {
        id: 'saveModal',
        modalClass: 'del-report',
        close: (): void => {
        },
        dismiss: (): void => {
        }
      });
  }

  goHome(context: any) {
    if (this.IsLockReport && !this.haveNewReport) {
      history.go(-1);
    } else {
      const param = {
        queryParams: {
          report: this.newReportId
        }
      };
      this.router.navigate(['report'], param);
      context.close();
    }
  }

  /**
   * 根据文件类型标签筛选源文件列表
   * @param selectOption 筛选标签
   */
  onSelect(selectOption: any): void {
    this.cfileDetailSrcData.data = this.cfileCopy;
    this.currentSelectLabel = selectOption.label;
    this.cfileDetailSrcData.data = this.cfileDetailSrcData.data.filter(cfileItem => {
      return (cfileItem.fileType === this.currentSelectLabel)
        || (this.currentSelectLabel === this.i18n.common_term_option_cFile_all);
    });
  }

  // 表格组件提供的排序中字符串比较是使用基于标准字典的 Unicode 值来进行比较的。如果开发者需要本地化的排序，
  // 可使用tiHeadSort组件的compareFn接口来自定义所在列的本地化排序规则。本地化排序规则可利用 localeCompare 方法。
  public compareFn = (a: TiTableRowData, b: TiTableRowData, sortKey: string): number => {
    const language = 'zh-CN'; // 根据实际情况设置当前语言种类
    if (sortKey === 'linecount') {
      return a.linecount - b.linecount;
    }
    return a[sortKey].localeCompare(b[sortKey], language); // localeCompare方法还有更多配置，可在网上查阅。
  }

  getConfigData() {
    this.Axios.axios.get(`/users/${encodeURIComponent(sessionStorage.getItem('loginId'))}/config/`).then((res: any) => {
      // 动态计算工作量预估标准
      const data = res.data;
      this.humanStandard = this.i18nService.I18nReplace(this.i18n.common_Estimated_standard_subtitle, {
        0: data.c_line || 0,
        1: data.asm_line || 0
      });
      if (!data.p_month_flag) {
        this.showHumanFlag = false;
        return;
      }
    });
  }

  async downloadReportAsCvs() {
    await this.isOldReport('Download');
    if (this.IsLockReport) {
      return;
    }
    this.Axios.axios.get(`/portadv/tasks/${encodeURIComponent(this.report.id)}/download/?report_type=0`)
      .then((resp: any) => {
        if (this.commonService.handleStatus(resp) !== 0 && resp.status) {
          const content = this.curLang === 'zh-cn' ? resp.infochinese : resp.info;
          this.mytip.alertInfo({type: 'warn', content, time: 10000});
          return;
        }
        const file = new Blob(['\ufeff' + resp]);
        if (window.navigator.msSaveOrOpenBlob) {
          window.navigator.msSaveOrOpenBlob(file, this.report.id + '.csv');
        } else {
          const link = document.createElement('a');
          link.href = URL.createObjectURL(file);
          link.setAttribute('style', 'visibility:hidden');
          link.download = this.report.id + '.csv';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      });
  }

  getBase64(imgUrl: any, content: any) {
    const that = this;
    const xhr = new XMLHttpRequest();
    xhr.open('get', imgUrl, true);
    // 至关重要
    xhr.responseType = 'blob';
    xhr.onload = () => {
      if (xhr.status === 200) {
        // 得到一个blob对象
        const blob = xhr.response;
        // 至关重要
        const oFileReader = new FileReader();
        oFileReader.onloadend = (e: any) => {
          let base64 = e.currentTarget.result;
          base64 = base64.replace('; charset=UTF-8', '');
          that.imgBase = base64;
          that.download2Html(content);
        };
        oFileReader.readAsDataURL(blob);
      }
    };
    xhr.send();
  }


  async downloadReportAsHtml() {
    await this.isOldReport('Download');
    if (this.IsLockReport) {
      return;
    }
    this.sourceCodeReportApi.downloadHTML(this.report.id).then((resp: any) => {
      if (this.commonService.handleStatus(resp) === 0) {
        const content = JSON.parse(resp.data.content);
        const iii = location.href.indexOf('#');
        const api = location.href.slice(0, iii);
        const image = `${api + './assets/img/home/nodata.svg'}`;
        this.getBase64(image, content);
      }
    });
  }

  download2Html(reportData: any) {
    const filename = this.report.id + '.html';
    const content = this.downloadTemplete(reportData);
    const blob = new Blob([content]);
    if ('download' in document.createElement('a')) {
      const link = document.createElement('a');
      link.setAttribute('style', 'visibility:hidden');
      link.download = filename;
      link.href = URL.createObjectURL(blob);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        // for IE
        window.navigator.msSaveOrOpenBlob(blob, filename);
      }
    }
  }

  downloadSoFile(row: any) {
    if (row.isHTTP) {
      return;
    }
    row.uploadVisited = true;
    const a = document.createElement('a');
    a.setAttribute('href', row.url);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  getReportDetail() {
    this.Axios.axios.defaults.headers.isLocked = true;
    this.sourceCodeReportApi.getReport(encodeURIComponent(this.report.id))
      .then((resp: any) => {
        // 生成loading页面
        this.loadingRef = this.createLoadingRefService.createLoading(
          document.querySelector('body'), LoadingScene.GLOBAL);
        if (this.commonService.handleStatus(resp) === 0) {
          this.getReportId.emit({id: '', isLocked: false});
        } else if (resp.status === '0x0d0223' || resp.status === '0x0d0112') {
          this.getReportId.emit({id: resp.data.id, isLocked: true});
        } else {
          const content = this.curLang === 'zh-cn' ? resp.infochinese : resp.info;
          this.mytip.alertInfo({type: 'error', content, time: 5000});
          // 销毁loading
          this.createLoadingRefService.destroyLoading(this.loadingRef);
          this.loadingRef = null;
          return;
        }
        this.portingLevelList = [];
        const soFileList: any = [];
        let compiler = '';
        this.soFilesNeed = 0;
        this.asmNeedTrans = 0;
        this.cmakeNeedTrans = 0;
        this.automakeNeedTrans = 0;
        this.asmFileLines = 0;
        this.asmlines = 0;
        this.makefileNeedTrans = 0;
        this.makefileTotal = 0;
        this.cmakelistsinfo = 0;
        this.makefileLines = 0;
        this.soFilesTotal = 0;
        this.soFilesUse = 0;
        this.cLines = 0;
        this.cFileTotal = 0;
        this.cFileNeed = 0;
        this.goTipSwitch = false;

        if (resp.data.info !== {}) {
          if (resp.data.info.compiler.type
            || (resp.data.info.compiler.type && resp.data.info.cgocompiler.type)
          ) {
            compiler = `${resp.data.info.compiler.type.toUpperCase()} ` + resp.data.info.compiler.version;
          } else if (resp.data.info.cgocompiler.type) {
            compiler = `${resp.data.info.cgocompiler.type.toUpperCase()} ` + resp.data.info.cgocompiler.version;
          }
          const sourcedirs = resp.data.info.sourcedir.split(',');
          if (sourcedirs.length > 0) {
            sourcedirs.forEach((item: any) => {
              this.textForm1.firstItem.value.push(item);
            });
          }
          const gf = resp.data.info.gfortran.toUpperCase() || '';
          this.textForm1.secondItem.value = resp.data.info.targetos === 'centos7.6'
            ? 'CentOS 7.6'
            : resp.data.info.targetos;
          this.textForm1.thirdItem.value = `${resp.data.info.targetkernel}`;
          if (compiler && gf) {
            this.textForm1.fourthItem.value = compiler + `, ${gf}`;
          } else if (compiler && !gf) {
            this.textForm1.fourthItem.value = compiler;
          } else if (!compiler && gf) {
            this.textForm1.fourthItem.value = `${gf} `;
          }
          this.textForm1.fifthItem.value = resp.data.info.constructtool;
          this.textForm1.sixthItem.value = resp.data.info.compilecommand;
        }
        if (resp.data.portingresult !== {}) {
          const porting_level = resp.data.portingresult.porting_level;
          const obj: any = {};
          if (resp.data.portingresult.tips) {
            if (resp.data.portingresult.tips.length !== 0 && this.curLang === 'zh-cn') {
              this.goTipSwitch = true;
              this.goTip = resp.data.portingresult.tips[0].info_cn;
            } else if (resp.data.portingresult.tips.length !== 0 && this.curLang === 'en-us') {
              this.goTipSwitch = true;
              this.goTip = resp.data.portingresult.tips[0].info_en;
            }
          } else {
            this.goTip = '';
          }
          if (porting_level) {
            for (const key in porting_level) {
              if (porting_level.hasOwnProperty(key)) {
                if (porting_level[key].amount) {
                  obj[key] = porting_level[key];
                  this.soFilesTotal += porting_level[key].amount; // total
                }
                if (Number(key) === 2 || Number(key) === 3) {
                  porting_level[key].bin_detail_info.forEach((bin: any) => {
                    bin.level = key;
                  });
                  this.portingLevelList = this.portingLevelList.concat(porting_level[key].bin_detail_info);
                  this.soFilesNeed += porting_level[key].amount; // need
                }
              }
            }
            this.soFilesUse = this.soFilesTotal - this.soFilesNeed;
          }
          let arr: any = [];
          for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
              obj[key].bin_detail_info.forEach((item: any) => {
                item.level = String(key);
              });
              arr = arr.concat(obj[key].bin_detail_info);
            }
          }
          this.portingLevelList = arr;
          this.portingLevelList = this.portingLevelList.map((item, index) => {
            const curTargetOs = this.textForm1.fifthItem.value.toLowerCase();
            const num = item.url.lastIndexOf('\/');
            item.downloadDesc = '';
            if (item.url) {
              if (curTargetOs.indexOf('linxos') >= 0
                || curTargetOs.indexOf('suse') >= 0
                || curTargetOs.indexOf('euleros') >= 0) {
                item.downloadDesc = this.i18n.common_term_report_level_download_opt_desc;
              }
            }
            item.type = this.formatSoType(item.type, true);
            let isHTTP = false;
            if (item.url) {
              // 判断是否为 chrome版本
              isHTTP = getExplore() && (item.url.split('://')[0].toLowerCase() === 'http');
            }
            return {
              number: index + 1,
              level: item.level,
              name: item.libname,
              desc: item.desc || '--',
              pathName: unescape(item.url.substring(num + 1, item.url.length)) || '--',
              oper: this.formatSoSuggestion(item.level, true) || '--',
              result: this.formatSoResult(item.level, item.type, true),
              url: item.url || '--',
              type: item.type,
              downloadDesc: item.downloadDesc,
              isHTTP,
              isVisited: false, // 是否点击过
              isClick: false // 是否点击了 复制链接
            };
          });

          // 行合并处理
          if (this.portingLevelList.length) {
            this.portingLevelList = this.linePortingLevel(this.portingLevelList);
          }

          // 版本问题规避部分字段
          const cmakelistsinfo = resp.data.portingresult.cmakelistsinfo;
          const cmakeLines = resp.data.portingresult.cmakelistslines || 0;
          const automakeinfo = resp.data.portingresult.automakeinfo;
          const automakeLines = resp.data.portingresult.automakelines || 0;

          this.binDetailSrcData.data = this.portingLevelList;
          this.cFileTotal = resp.data.portingresult.codefileinfo.totalcount;
          this.cFileNeed = resp.data.portingresult.codefileinfo.needtranscount;
          this.cLines = resp.data.portingresult.codelines;
          this.asmlines = resp.data.portingresult.asmlines;
          this.asmFileLines = resp.data.portingresult.asmfilelines;
          this.asmNeedTrans = resp.data.portingresult.asmfileinfo.needtranscount;
          this.fortranNeedTrans = resp.data.portingresult.fortranfileinfo.needtranscount;
          this.fortranLines = resp.data.portingresult.fortranlines;
          this.pythonNeedTrans = (resp.data.portingresult.hasOwnProperty('pythonfileinfo')
            ? resp.data.portingresult.pythonfileinfo.needtranscount
            : 0);
          this.pythonLines = resp.data.portingresult.pythonlines || 0;
          this.golangNeedTrans = (resp.data.portingresult.hasOwnProperty('golangfileinfo')
            ? resp.data.portingresult.golangfileinfo.needtranscount
            : 0);
          this.golangLines = resp.data.portingresult.golanglines || 0;
          this.javaNeedTrans = (resp.data.portingresult.hasOwnProperty('javafileinfo')
            ? resp.data.portingresult.javafileinfo.needtranscount
            : 0);
          this.javaLines = resp.data.portingresult.javalines || 0;
          this.scalaNeedTrans = (resp.data.portingresult.hasOwnProperty('scalafileinfo')
            ? resp.data.portingresult.scalafileinfo.needtranscount
            : 0);
          this.scalaLines = resp.data.portingresult.scalalines || 0;
          this.interpretedLines = (resp.data.portingresult.hasOwnProperty('interpretedlines')
            ? resp.data.portingresult.interpretedlines
            : 0);

          this.makefileNeedTrans = resp.data.portingresult.makefileinfo.needtranscount;
          this.makefileTotal = resp.data.portingresult.makefileinfo.totalcount;
          this.makefileLines = resp.data.portingresult.makefilelines;
          this.cmakeNeedTrans = cmakelistsinfo ? cmakelistsinfo.needtranscount : 0;
          this.cmakelistsinfo = resp.data.portingresult.cmakelistslines;
          this.automakeNeedTrans = automakeinfo ? automakeinfo.needtranscount : 0;
          this.scanItemsObj.soFile.content = this.soFilesNeed;
          this.scanItemsObj.soFile.hasDetail = this.portingLevelList.length > 0;
          this.scanItemsObj.soFile.files = soFileList;
          // cfile下拉的files
          const codefiles = resp.data.portingresult.codefileinfo.files; // cfiles
          const makefiles = resp.data.portingresult.makefileinfo.files;
          const cmakefiles = cmakelistsinfo ? cmakelistsinfo.files : [];
          const automakefiles = automakeinfo ? automakeinfo.files : [];
          const asmfiles = resp.data.portingresult.asmfileinfo.files;
          const fortranfiles = resp.data.portingresult.fortranfileinfo.files;
          const pythonfiles = resp.data.portingresult.hasOwnProperty('pythonfileinfo')
            ? resp.data.portingresult.pythonfileinfo.files
            : [];
          const golangfiles = resp.data.portingresult.hasOwnProperty('golangfileinfo')
            ? resp.data.portingresult.golangfileinfo.files
            : [];
          const javafiles = resp.data.portingresult.hasOwnProperty('javafileinfo')
            ? resp.data.portingresult.javafileinfo.files
            : [];
          const scalafiles = resp.data.portingresult.hasOwnProperty('scalafileinfo')
            ? resp.data.portingresult.scalafileinfo.files
            : [];
          this.scanItemsObj.cFile.content =
            this.cFileNeed
            + this.makefileNeedTrans
            + this.asmNeedTrans
            + this.cmakeNeedTrans
            + this.automakeNeedTrans
            + this.fortranNeedTrans
            + this.pythonNeedTrans
            + this.golangNeedTrans
            + this.javaNeedTrans
            + this.scalaNeedTrans;
          this.scanItemsObj.cFile.hasDetail =
            codefiles.length
            + makefiles.length
            + cmakefiles.length
            + asmfiles.length
            + automakefiles.length
            + fortranfiles.length
            + pythonfiles.length
            + golangfiles.length
            + javafiles.length
            + scalafiles.length
            > 0;
          this.scanItemsObj.cFile.files = codefiles
            .concat(asmfiles)
            .concat(makefiles)
            .concat(cmakefiles)
            .concat(automakefiles)
            .concat(fortranfiles)
            .concat(pythonfiles)
            .concat(golangfiles)
            .concat(javafiles)
            .concat(scalafiles);

          if (sessionStorage.getItem('language') === 'en-us') {
            this.enWidth = 240 + 'px';
            if (resp.data.portingresult.workload > 0 && resp.data.portingresult.workload <= 1) {
              this.humanBudget = this.i18n.common_Estimated_standard_subinfo2;
            } else {
              this.humanBudget = this.i18n.common_Estimated_standard_subinfo1;
            }
          } else {
            this.enWidth = 240 + 'px';
            this.humanBudget = this.i18n.common_Estimated_standard_subinfo;
          }
          const workload = resp.data.portingresult.workload;
          if (workload) {
            this.humanBudgetNum = workload;
            this.showHumanBudgetNum = true;
          } else {
            this.showHumanBudgetNum = false;
          }

          // cFile文件数据
          let cfileNameArr = [];
          this.scanItemsObj.cFile.files.forEach((item: any, index: any) => {
            cfileNameArr = (typeof (item) === 'string' ? item : item.filedirectory).split('/');
            this.cfileDetailSrcData.data.push({
              id: index + 1,
              filename: cfileNameArr[cfileNameArr.length - 1],
              path: typeof (item) === 'string' ? item : item.filedirectory,
              fileType: typeof (item) === 'string' ? '' : item.filetype,
              linecount: typeof (item) === 'string' ? '' : item.linecount,
            });
          });
          this.cfileCopy = JSON.parse(JSON.stringify(this.cfileDetailSrcData.data));
          if (this.cfileCopy.length > 0) {
            this.msgservice.sendMessage({type: 'defaultPath', value: this.cfileCopy[0].path});
          }
          // 旧报告不显示行数
          if (typeof (this.scanItemsObj.cFile.files[0]) === 'string') {
            this.cfileDetailColumn[3].title = '';
            this.cfileDetailColumn[4].title = '';
            this.cfileDetailColumn[3].width = '0';
            this.cfileDetailColumn[4].width = '0';
          }

          this.scanItemsObj.soFile.content = this.i18nService
            .I18nReplace(this.i18n.common_term_report_soFile_dependent, {
              0: this.soFilesTotal,
              1: this.soFilesNeed
            });
          this.cfileLine = this.scanItemsObj.cFile.content;
          this.scanItemsObj.cFile.content = this.i18nService.I18nReplace(this.i18n.common_term_report_cFile_dependent, {
            0: this.scanItemsObj.cFile.content
          });
          this.totalLine = this.cLines + this.makefileLines + cmakeLines
            + automakeLines
            + this.fortranLines
            + this.asmlines
            + this.asmFileLines
            + this.pythonLines
            + this.golangLines
            + this.javaLines
            + this.scalaLines;
          this.realTotalLine = this.totalLine + '';
          if (this.totalLine > 100000) {
            this.totalLine = parseInt(this.totalLine / 100000 + '', 10) + '0w+';
          }
          this.scanItemsObj.lines.content = this.i18nService
            .I18nReplace(this.i18n.common_term_report_detail_ctans_lins, {
              1: this.totalLine,
            });
          // 做动态代码行提示
          let codelines = '';
          if (this.curLang === 'zh-cn') {
            codelines = ' 行';
          } else if (this.curLang === 'en-us') {
            codelines = ' lines';
          }
          if (this.makefileLines + cmakeLines + automakeLines !== 0) {
            this.scanItemsObj.lines.content +=
              `makefile: ${this.makefileLines + cmakeLines + automakeLines + codelines}; `;
            this.cfileDetailColumn[3].options.push({
              label: 'makefile'
            });
          }
          if (this.cLines + this.asmlines !== 0) {
            this.scanItemsObj.lines.content +=
              `C/C++: ${this.cLines + this.asmlines + codelines}; `;
            this.cfileDetailColumn[3].options.push({
              label: 'C/C++ Source File'
            });
          }
          if (this.asmFileLines !== 0) {
            this.scanItemsObj.lines.content +=
              `ASM: ${this.asmFileLines + codelines}; `;
            this.cfileDetailColumn[3].options.push({
              label: 'ASM File'
            });
          }
          if (this.fortranLines !== 0) {
            this.scanItemsObj.lines.content +=
              `Fortran: ${this.fortranLines + codelines}; `;
            this.cfileDetailColumn[3].options.push({
              label: 'Fortran'
            });
          }
          if (this.pythonLines !== 0) {
            this.scanItemsObj.lines.content +=
              `Python: ${this.pythonLines + codelines}; `;
            this.cfileDetailColumn[3].options.push({
              label: 'Python'
            });
          }
          if (this.golangLines !== 0) {
            this.scanItemsObj.lines.content +=
              `Go: ${this.golangLines + codelines}; `;
            this.cfileDetailColumn[3].options.push({
              label: 'Go'
            });
          }
          if (this.javaLines !== 0) {
            this.scanItemsObj.lines.content +=
              `Java: ${this.javaLines + codelines}; `;
            this.cfileDetailColumn[3].options.push({
              label: 'Java'
            });
          }
          if (this.scalaLines !== 0) {
            this.scanItemsObj.lines.content +=
              `Scala: ${this.scalaLines + codelines}; `;
            this.cfileDetailColumn[3].options.push({
              label: 'Scala'
            });
          }
        }
        // 销毁loading
        this.createLoadingRefService.destroyLoading(this.loadingRef);
        this.loadingRef = null;
      })
      .catch((error: any) => {
      });
    this.Axios.axios.defaults.headers.isLocked = false;
  }

  // 行合并处理
  linePortingLevel(list: Array<any>): Array<any> {
    let rowSpan = 1;
    list[0] = Object.assign(list[0], {rowSpan, showTd: true});
    list.reduce((pre, cur) => {
      if (pre.url === cur.url && pre.oper === cur.oper && pre.result === cur.result) {
        rowSpan++;
        pre = Object.assign(pre, {rowSpan, showTd: true});
        cur = Object.assign(cur, {rowSpan: 1, showTd: false});
        return pre;
      } else {
        rowSpan = 1;
        cur = Object.assign(cur, {rowSpan, showTd: true});
        return cur;
      }
    });
    return list;
  }

  /**
   * 复制下载链接
   * @param url 链接地址
   * @param select 要复制的 input 类名
   * @param copy 点击 tip 名
   * @param row 每行详情
   */
  onCopy(url: string, sel: string, copy: any, row: any) {
    row.copyVisited = true;
    if (!row.isClick) {
      copy.show();
      row.isClick = true;
      setTimeout(() => {
        copy.hide();
        row.isClick = false;
      }, 3000);
    }
    this.reportService.onCopyLink(url, sel);
  }

  formatSoSuggestion(level: any, flag: any) {
    let suggestion = '';
    switch (level) {
      case '0':
        const level0En = 'Compatible with the Kunpeng platform.';
        suggestion = flag ? this.i18n.common_term_report_level0_desc : level0En;
        break;
      case '1':
        const level1En = 'Compatible with the Kunpeng platform.';
        suggestion = flag ? this.i18n.common_term_report_level1_desc : level1En;
        break;
      case '2':
        const level2En = 'Not compatible with the Kunpeng platform.';
        suggestion = flag ? this.i18n.common_term_report_level2_desc : level2En;
        break;
      case '3':
        const level3En = 'The compatibility with the Kunpeng platform is unknown.';
        suggestion = flag ? this.i18n.common_term_report_level7_desc : level3En;
        break;
    }
    return suggestion;
  }

  formatSoResult(level: any, type: any, flag: any) {
    let result = '';
    switch (level) {
      case '0':
        const levelResult0En = `Download`;
        result = flag ? this.i18n.common_term_report_level0_result : levelResult0En; // 动态库也需要维护一个format
        break;
      case '1':
        const levelResult1En = 'Download Source Code';
        result = flag ? this.i18n.common_term_report_level1_result : levelResult1En;
        break;
      case '2':
        const levelResult2En =
          'Obtain the source code and compile it to a Kunpeng-compatible version or use an alternate solution.';
        result = flag ? this.i18n.common_term_report_level2_result : levelResult2En;
        break;
      case '3':
        const levelResult3En = 'Verify whether it is compatible with the Kunpeng platform. If not, \
          obtain a Kunpeng-compatible version from the supplier or obtain \
          the source code and compile it to a Kunpeng-compatible version.';
        result = flag ? this.i18n.common_term_report_level7_result : levelResult3En;
        break;
    }
    return result;
  }

  formatSoType(type: any, flag: any) {
    let typeResult = '';
    switch (type) {
      case 'DYNAMIC_LIBRARY':
        const typeResult0En = 'Dynamic library';
        typeResult = flag ? this.i18n.common_term_report_type.dynamic_library : typeResult0En;
        break;
      case 'STATIC_LIBRARY':
        const typeResult1En = 'Static library';
        typeResult = flag ? this.i18n.common_term_report_type.static_library : typeResult1En;
        break;
      case 'EXEC':
        const typeResult2En = 'Executable file';
        typeResult = flag ? this.i18n.common_term_report_type.exec : typeResult2En;
        break;
      case 'JAR':
        const typeResult3En = 'Jar package';
        typeResult = flag ? this.i18n.common_term_report_type.jar : typeResult3En;
        break;
      case 'SOFTWARE':
        const typeResult4En = 'Software package';
        typeResult = flag ? this.i18n.common_term_report_type.software : typeResult4En;
        break;
    }
    return typeResult;
  }

  // 使 headfilter 和表格搜索联动。根据 headfilter 选中项给表格的搜索接口传入对应的搜索值，进行表格数据搜索。
  public onBinDetailSelect(item: any, column: TiTableColumns): void {
    const index: number = this.searchKeys.indexOf(column.key);
    const labelKey: string = column.labelKey || 'label';
    this.searchWords[index] = item[labelKey] === this.i18n.common_term_report_all ? '' : item[labelKey];
  }


  downloadTemplete(report: any): string {
    let humanFlag = 'block';
    if (!this.showHumanFlag || !this.showHumanBudgetNum) {
      humanFlag = 'none';
    }
    const firstValueTitle = this.textForm1.firstItem.value.join(',').length > 46
      ? this.textForm1.firstItem.value
      : '';
    const iii = location.href.indexOf('#');
    const api = location.href.slice(0, iii);
    let args = '';
    let scanTemp = '';
    args = `<h1 style="font-size: 20px;color: #282b33;margin-bottom: 24px;font-weight: normal;line-height: 1;">${
      this.i18n.common_term_setting_infor
    }</h1>
      <div class="setting-left" style="float: left;width: 50%;">
        <div class="setting-left-item" style="display: flex; justify-content: flex-start;margin-bottom: 20px;">
          <span>${this.textForm1.firstItem.label}</span>
          <span style="width: 370px;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;" title="
          ${firstValueTitle}">${this.textForm1.firstItem.value}</span>
        </div>
        <div class="setting-left-item" style="display: flex; justify-content: flex-start;margin-bottom: 20px;">
          <span>${this.textForm1.secondItem.label}</span>
          <span style="max-width: 556px;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;">${
      this.textForm1.secondItem.value
    }</span>
        </div>
        <div class="setting-left-item" style="display: flex; justify-content: flex-start;margin-bottom: 20px;">
          <span>${this.textForm1.thirdItem.label}</span>
          <span style="max-width: 556px;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;">${
      this.textForm1.thirdItem.value || '--'
    }</span>
        </div>
        <div class="setting-left-item" style="display: flex; justify-content: flex-start;margin-bottom: 20px;">
          <span>${this.textForm1.fourthItem.label}</span>
          <span style="max-width: 556px;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;">${
      this.textForm1.fourthItem.value || '--'
    }</span>
        </div>
        <div class="setting-left-item" style="display: flex; justify-content: flex-start;margin-bottom: 20px;">
          <span>${this.textForm1.fifthItem.label}</span>
          <span style="max-width: 556px;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;">${
      this.textForm1.fifthItem.value || '--'
    }</span>
        </div>
        <div class="setting-left-item" style="display: flex; justify-content: flex-start;margin-bottom: 20px;">
          <span>${this.textForm1.sixthItem.label}</span>
          <span style="max-width: 556px;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;">${
      this.textForm1.sixthItem.value || '--'
    }</span>
        </div>
      </div>
      <div class="setting-right" style="position: relative;float: right;width: 50%;margin-top: 10px;">
        <div class="setting-right-top">
          <div class="setting-right-item">
            <p>${this.i18n.common_term_report_level0_desc}</p>
            <p>${this.soFilesUse}</p>
          </div>
          <div class="setting-right-item">
            <p>${this.i18n.common_term_report_level2_desc}</p>
            <p>${this.soFilesNeed}</p>
          </div>
          <div class="setting-right-item">
            <p>${this.i18n.common_term_name_total}</p>
            <p>${this.soFilesTotal}</p>
          </div>
      </div>
      <div class="setting-right-bottom" style="margin-top: 30px;">
        <div class="setting-right-item">
          <p>${this.i18n.common_term_migrate_result_cFile}</p>
          <p>${this.cfileLine}</p>
        </div>
        <div class="setting-right-item">
          <p>${this.i18n.common_term_migrate_result_lines}</p>
          <p>${this.totalLine}</p>
        </div>
        <div class="setting-right-item" style="text-align: center;">
          <p>${this.i18n.common_term_report_right_info4}</p>
          <p>${this.humanBudgetNum}<span>${this.humanBudget}</span></p>
        </div>
      </div>
      <p class="tit" style="margin-top: 12px;color: #616161;font-size: 14px;text-align: right;">
        ${this.humanStandard}
      </p>
      </div>`;
    this.scanItems.forEach((scanItem) => {
      let itemFile = '';
      let fileListCon = '';
      let content = '';
      let cFilePadding = '';
      if (scanItem === 'soFile') {
        if (this.binDetailSrcData.data.length !== 0) {
          let rowSpan = 0;
          this.binDetailSrcData.data.forEach((bin: any, index: number) => {
            let optionstr = '';
            if (bin.url === '--') {
              optionstr = `<span class="content" >${bin.result}</span>`;
            } else if (bin.url.lastIndexOf('/') === -1) {
              optionstr = `<span title="${this.i18n.common_upload_unable}">--</span>`;
            } else {
              const downloadDesc = bin.downloadDesc
                ? `${bin.downloadDesc + ' ' + bin.url}`
                : ((bin.level === 0)
                    ? `<a onclick="downloadSoFile('
                    ${bin.url}')" style="text-transform: capitalize;">${bin.result}</a>`
                    : ((bin.result !== '下载源码' && bin.result !== 'Download Source Code')
                      ? `<a onclick="downloadSoFile('${bin.url}')">${bin.result}</a>`
                      : `<a href="${bin.url}" target="_blank">${bin.result}</a>`)
                );
              optionstr = `
                <span class="content">${downloadDesc}
                  <span class="copy-link link${index}" onclick="onCopyLink('${bin.url}', '.copy-inp', ${index})">
                    ${this.i18n.common_term_report_detail.copyLink}
                  </span>
                </span>
                <input class="copy-inp" />
              `;
            }
            let itemfileMiddle = '';
            if (rowSpan > 1) {
              rowSpan--;
            } else {
              itemfileMiddle = `
                <td class="border-color border-right-color" rowspan${index}" rowspan="${bin.rowSpan}">
                  <span class="content">${bin.pathName}</span>
                </td>
                <td
                  class="border-color border-right-color rowspan${index}"
                  rowspan="${bin.rowSpan}" showtd="${bin.showTd}"
                >
                  <span class="content">${bin.oper}</span>
                </td>
                <td class="border-color rowspan${index}" rowspan="${bin.rowSpan}">
                  ${optionstr}
                </td>
              `;
              rowSpan = bin.rowSpan;
            }
            itemFile += `
              <tr style="line-height:28px;">
                <td class="border-color">
                  <span class="content">${bin.number}</span>
                </td>
                <td class="border-color">
                  <span class="content">${bin.name}</span>
                </td>
                <td class="border-color border-right-color">
                  <span class="content">${bin.type}</span>
                </td>
                ${itemfileMiddle}
              </tr>
            `;
          });
        } else {
          itemFile += `
            <tr class="ti3-table-nodata">
            <td colspan="6" style="text-align: center;width: 100%;padding-top: 140px;box-sizing: border-box;">
            <span style="display:grid;margin: 5px 0;">${this.i18n.common_term_design_nodata}<span></td>
            </tr>
          `;
        }
        // theade th设置 text-align: left 是为了兼容IE
        fileListCon += `
          <div class="ti-table">
            <div class="items-detail-container table table-bordered" style="padding-right: 17px;">
              <table style="table-layout:fixed; text-align: left;line-height: 28px">
                <thead>
                  <tr class="table-header">
                    <th style="width: 5%;text-align: left;">${this.i18n.common_term_no_label}</th>
                    <th style="width: 15%;text-align: left;">${this.i18n.common_term_name_label_1}</th>
                    <th style="width: 10%;text-align: left;">${this.i18n.common_term_type_label}</th>
                    <th style="width: 25%;text-align: left;" class="ellispis content">
                      ${this.i18n.common_term_report_type.software}
                    </th>
                    <th style="width: 20%;text-align: left;">${this.i18n.common_term_operate_analysis_result}</th>
                    <th style="width: 25%;text-align: left;">${this.i18n.common_term_operate_sugg_label}</th>
                  </tr>
                </thead>
              </table>
            </div>
            <div class="table-box">
              <table class="table">
                <thead>
                  <tr>
                    <th style="width: 5%;"></th>
                    <th style="width: 15%;"></th>
                    <th style="width: 10%;"></th>
                    <th style="width: 25%;"></th>
                    <th style="width: 20%;"></th>
                    <th style="width: 25%;"></th>
                  </tr>
                </thead>
                <tbody style="font-size: 14px;">${itemFile}</tbody>
              </table>
            </div>
          </div>
        `;
      }
      if (scanItem !== 'soFile' && report.portingresultlist.length > 0) {
        content +=
          `<div class="detail-content" style="display:inline-block;">
            ${this.scanItemsObj[scanItem].content}
          </div>`;
      }
      if (scanItem === 'cFile' && this.scanItemsObj[scanItem].files) {
        if (this.cfileCopy.length !== 0) {
          cFilePadding = this.cfileCopy.length > 7
            ? 'padding-right: 17px;'
            : '';
          this.cfileCopy.forEach((item: any) => {
            itemFile += `
              <tr style="line-height:23px;">
                <td style="border-bottom: 1px solid #E6EBF5;">
                  <span class="content">${item.id}</span>
                </td>
                <td style="border-bottom: 1px solid #E6EBF5;">
                  <span class="content">${item.filename}</span>
                </td>
                <td style="border-bottom: 1px solid #E6EBF5;">
                  <span class="content">${item.path}</span>
                </td>
                <td style="border-bottom: 1px solid #E6EBF5;">
                  <span class="content">${item.fileType}</span>
                </td>
                <td style="border-bottom: 1px solid #E6EBF5;">
                  <span class="content">${item.linecount}</span>
                </td>
              </tr>
            `;
          });
        } else {
          itemFile += `
            <tr class="ti3-table-nodata">
              <td colspan="6"></td>
            </tr>
          `;
        }
        // theade th设置 text-align: left 是为了兼容IE
        fileListCon += `
          <div class="ti-table">
            <div class="items-detail-container" style="${cFilePadding}">`;
        if (scanItem === 'cFile' && this.goTipSwitch) {
          fileListCon += `<div class="go-tip-div">
                <span class="go-tip">${this.goTip}</span>
              </div>`;
        }
        fileListCon += `<table style="table-layout:fixed; text-align: left;line-height: 28px">
                <thead>
                  <tr class="table-header">
                    <th style="width: 5%;text-align: left;">${this.i18n.common_term_no_label}</th>
                    <th style="width: 15%;text-align: left;">${this.i18n.common_term_name_label}</th>
                    <th style="width: 50%;text-align: left;">${this.i18n.common_term_cFile_path_label}</th>
                    <th style="width: 10%;text-align: left;">${this.i18n.common_term_type_label}</th>
                    <th style="width: 20%;text-align: left;">${this.i18n.common_term_option_lincount}</th>
                  </tr>
                </thead>
              </table>
            </div>
            <div class="table-box" style="max-height: 210px;overflow-y: auto;margin-top: -4px;">
              <table style="table-layout:fixed; text-align: left;line-height: 28px">
                <thead>
                  <tr>
                    <th style="width: 5%;"></th>
                    <th style="width: 15%;"></th>
                    <th style="width: 50%;"></th>
                    <th style="width: 10%;"></th>
                    <th style="width: 20%;"></th>
                  </tr>
                </thead>
                <tbody style="font-size: 14px;">${itemFile}</tbody>
              </table>
            </div>
          </div>
        `;
      }
      if (scanItem === 'lines' && report.portingresultlist.length > 0) {
        let itemLines = '';
        if (report.portingresultlist.length !== 0) {
          report.portingresultlist.forEach((item: any) => {
            item.portingItems.forEach((line: any) => {
              line.strategy = line.strategy.replace(/\"/g, '\'');
              itemLines += `
                <tr style="line-height:23px;">
                  <td style="border-bottom: 1px solid #E6EBF5;">
                    <span class="content">${item.content}</span>
                  </td>
                  <td style="border-bottom: 1px solid #E6EBF5;">
                    <span class="content">${'(' + line.locbegin + ',' + line.locend + ')'}</span>
                  </td>
                  <td style="border-bottom: 1px solid #E6EBF5;">
                    <span class="content">${line.keyword}</span>
                  </td>
                  <td style="border-bottom: 1px solid #E6EBF5;">
                    <span class="content">${line.strategy}</span>
                  </td>
                </tr>
              `;
            });
          });
        } else {
          itemLines += `
            <tr class="ti3-table-nodata">
              <td colspan="6"></td>
            </tr>
          `;
        }
        // theade th设置 text-align: left 是为了兼容IE
        fileListCon += `
          <div class="ti-table">
            <div class="items-detail-container" style="padding-right: 17px;">
              <table style="text-align: left;line-height: 28px;table-layout:fixed">
                <thead>
                  <tr class="table-header">
                    <th style="width: 30%;text-align: left;">${this.i18n.common_term_download_html_filename}</th>
                    <th style="width: 10%;text-align: left;">${this.i18n.common_term_download_html_lineno}</th>
                    <th style="width: 15%;text-align: left;">${this.i18n.common_term_download_html_keyword}</th>
                    <th style="width: 45%;text-align: left;">${this.i18n.common_term_download_html_suggestion}</th>
                  </tr>
                </thead>
              </table>
            </div>
            <div class="table-box" style="max-height: 300px;overflow-y: auto;margin-top: -4px;">
              <table style="text-align: left;line-height: 28px;table-layout:fixed">
                <thead>
                  <tr>
                    <th style="width: 30%;"></th>
                    <th style="width: 10%;"></th>
                    <th style="width: 15%;"></th>
                    <th style="width: 45%;"></th>
                  </tr>
                </thead>
                <tbody style="font-size: 14px;">${itemLines}</tbody>
              </table>
            </div>
          </div>
        `;
      }
      scanTemp += `
      <div class="table-container" style="line-height: 56px;margin-top:30px;">
        <div class="detail-label" style="display:inline-block;width: 350px;font-size: 20px;color: #282b33;">
          <span>${this.scanItemsObj[scanItem].label}</span>
        </div>
        ${content}
      </div>
        ${fileListCon}
      `;
    });
    const template = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="X-UA-Compatible" content="ie=edge">
          <title>Document</title>
          <style>
            .setting-left span,
            .setting-left div {
              height: 18px;
              font-size: 14px;
              line-height: 18px;
            }
            .setting-left span:first-child{
              width: 240px;
              color: #6C7280;
            }
            .setting-left span:last-child{
              color: #222;
            }
            .setting-right-top,
            .setting-right-bottom {
              display: flex;
              justify-content: flex-end;
              height: 80px;
            }
            .setting-right-item{
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              align-items: center;
              margin-left: 14px;
              min-width: 176px;
              position: relative;
            }
            .setting-right-item:nth-child(2) {
              margin-right: 20px;
              padding-right: 30px;
              border-right: 1px solid #E1E6EE;
            }
            p {
              margin: 0;
            }
            p:first-child{
              font-size: 16px;
              height: 24px;
              padding: 0 20px;
              line-height: 24px;
              color: #979797;
              text-align: center;
            }
            p:nth-child(2){
              font-size: 48px;
              color: #222;
            }
            p:nth-child(2) span {
              font-size: 14px;
              color: #666;
              font-weight: normal;
            }
            a {
              color: #0067ff;
            }
            a:hover {
              color: #267DFF;
              cursor: pointer;
            }
            .ti3-table-nodata > td {
              height: 160px !important;
              background: url(${api + './assets/img/home/no-data.png'}) 50% 30% no-repeat !important;
              border-bottom: 1px solid #e1e6e6;
            }
            table th {
              font-size:12px;
            }
            table td {
              font-size:12px;
            }
            .detail-content {
              font-size:14px;
            }
            .table{
              table-layout: fixed;
            }
            .table-box {
              overflow-y: auto;
              max-height: 200px;
              margin-top: -4px;
            }
            .go-tip-div {
              height: 32px;
              background-color: #f0f6ff;
              border-radius: 2px;
              border: solid 1px #0067ff;
              display:flex;
              align-items: center; //交叉轴居中
            }
            .go-tip {
              height: 18px;
              font-family: FZLTHJW--GB1-0;
              font-size: 12px;
              font-weight: normal;
              font-stretch: normal;
              line-height: 18px;
              letter-spacing: 0px;
              color: #222222;
              margin-left: 10px;
            }
            table {
              width: 100%;
            }
            .table-header {
              padding: 0 10px;
              border-left: none;
              background:#f5f9ff;
              color:#333;
              font-size: 14px;
              font-weight: 400;
            }
            .table-header > th {
              box-sizing: border-box;
              padding-left: 10px;
            }
            td span {
              box-sizing: border-box;
              display: inline-block;
              overflow: hidden;
              padding-left: 10px;
              width: 100%;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
            .ellispis {
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
            .border-color {
              border-bottom: 1px solid #E6EBF5;
            }
            .border-right-color {
              border-right: 1px solid #E6EBF5;
            }
            .copy-link {
              position: relative;
              display: inline;
              margin-left: 16px;
              color: #0067FF;
              cursor: pointer;
            }
            .copy-link:hover,
            a:hover {
              color: #267DFF;
            }
            .copy-link::before {
              display: inline-block;
              position: absolute;
              top: 50%;
              left: -8px;
              content: '';
              width: 1px;
              height: 12px;
              margin-top: -6px;
              background-color: #E1E6EE;
            }
            .copy-inp {
              position: absolute;
              top: 0;
              left: 0;
              z-index: -666;
              opacity: 0;
            }
            .cursor-link {
              color: #0067FF;
              cursor: pointer;
            }
          </style>
      </head>
      <body style="padding:0 80px;">
        <div style="min-width: 1300px;width: 100%; height: 100%;">
        <h1
          style=
            "text-align: center;
            font-weight: normal;
            font-size: 24px;
            border-bottom: solid 1px #222;
            padding-bottom:20px"
        >
          ${this.report.created}
        </h1>
        <div >
        ${args}
        </div>
        <div style ="float:left;width:100%">
          ${scanTemp}
        </div>
        </div>
        <script>
          function downloadSoFile(url) {
            const a = document.createElement('a');
            a.setAttribute('href', url);
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          }
          // 点击复制下载链接
          function onCopyLink(url, select, index) {
            const aLink = document.querySelector('.link' + index);
            aLink.style.color = '#0057D9';
            const aInp = document.querySelector(select);
            aInp.value = url;
            aInp.select();
            document.execCommand('copy', false, null); // 执行浏览器复制命令
          }
          // 设置 title 属性
          function setTitle() {
            var tdList = document.querySelectorAll('.content');
            tdList = Array.prototype.slice.call(tdList);
            for (let i = 0; i < tdList.length; i++) {
              const td = tdList[i];
              td.removeAttribute('title');
              if (td.clientWidth < td.scrollWidth) {
                td.setAttribute('title', td.innerText);
              }
            }
          }
          window.onload = function(){
            setTitle();
          }
          window.onresize = function() {
            setTitle();
          }
        </script>
      </body>
    </html>
    `;
    return template;
  }
}
