import { Component, OnInit, ElementRef, ViewChild, ViewEncapsulation  } from '@angular/core';
import { I18nService, CommonService, MytipService, AxiosService, CustomValidators } from '../../../service';
import { FormControl, FormGroup, ValidationErrors } from '@angular/forms';
import { TiModalService, TiValidationConfig, TiValidators,
   TiTableColumns, TiTableSrcData, TiTableDataState } from '@cloud/tiny3';
import { HyMiniModalService } from 'hyper';

@Component({
  selector: 'app-weak-pwd',
  templateUrl: './weak-pwd.component.html',
  styleUrls: ['./weak-pwd.component.scss'],
  encapsulation: ViewEncapsulation.None // 要想设置的样式生效，此处必须配置成 ViewEncapsulation.None
})
export class WeakPwdComponent implements OnInit {
  @ViewChild('addWeakPwd', { static: false }) addWeakPwd: any;

  constructor(
    public Axios: AxiosService,
    public timessage: TiModalService,
    private miniModalServe: HyMiniModalService,
    private elementRef: ElementRef,
    public mytip: MytipService,
    public i18nService: I18nService,
    private commonService: CommonService
  ) {
    this.i18n = this.i18nService.I18n();
  }
  public i18n: any;
  public weakPwdTip: string;
  public WeakPwd: FormGroup;   // 弱口令
  public displayed: any = [];
  public pageSizeWeak: { options: Array<number>, size: number } = {
    options: [10, 20, 50, 100],
    size: 10
  };
  // 弱口令表单
  public columnsWeak: TiTableColumns = [
    {
      title: '弱口令'
    },
    {
      title: '操作'
    },
  ];
  public weakPwdData: TiTableSrcData;
  public currentPageWeak = 1;
  public totalNumberWeak = 0;
  public weakId = 0;
  public weakContent = '';
  public weakPadPlaceholder = '搜索弱口令';
  public searchWords: Array<string> = [''];
  public weakPwdContent = '';
  public validation: TiValidationConfig = {
    type: 'blur',
    errorMessage: {}
  };
  public msg: any;
  public isAdmin: any;
  public isZh: any;

  // table 相关
  public showGotoLink: boolean;

  ngOnInit() {
    this.showGotoLink = true;

    this.isZh = sessionStorage.getItem('language') === 'zh-cn';
    this.weakPwdTip = this.i18n.weakPasswordTip;
    this.isAdmin = sessionStorage.getItem('role') === 'Admin';
    this.weakPwdData = { // 表格源数据，开发者对表格的数据设置请在这里进行
      data: [], // 源数据
      state: {
        searched: true, // 后台搜索，源数据已进行过搜索处理
        sorted: false, // 后台排序，源数据已进行过排序处理
        paginated: true // 后台分页，源数据已进行过分页处理
      }
    };
    this.InquireWeakPwd(this.searchWords[0], this.currentPageWeak, this.pageSizeWeak.size);
    // 弱口令验证规则
    this.WeakPwd = new FormGroup({
      pwd: new FormControl('', [CustomValidators.resetPassword(this.i18n)]),
    });
    if (!this.isAdmin) {
      this.columnsWeak = [
        {
          title: this.i18n.weakPassword.WeakPwd
        },
      ];
    } else {
      this.columnsWeak = [
        {
          title: this.i18n.weakPassword.WeakPwd
        },
        {
          title: this.i18n.common_term_operate
        },
      ];
    }
    this.weakPwdTip = this.i18n.weakPasswordTip;
    this.weakPadPlaceholder = this.i18n.weakPassword.searchWeakPwd;
    this.weakPwdContent = this.i18n.weakPassword.WeakPwd;
  }

  // 搜索弱口令
  public weakPwdSearch(event: any): void {
    if (encodeURIComponent(event) !== 'undefined') {
      this.searchWords[0] = encodeURIComponent(event);
    }
  }

  // 清除弱口令
  public weakPwdClear(event: any): void {
    this.searchWords[0] = '';
  }

  //  新增弱口令
  public addWeakPassword(content: any) {
    this.WeakPwd.reset();
    this.addWeakPwd.Open();
  }

  public cancelWeakPwd(event: any) {
    if (event.button !== 0) { return; }
    this.WeakPwd.reset({pwd: ''});
    $(`.ti3-form-list`).find('ti-error-msg').remove();
    this.addWeakPwd.Close();
  }

  // 请求数据的方法
  public InquireWeakPwd(searchWords: any, currentPageWeak: any, size: any) {
    // 初始时向后台发送请求获取数据
    this.Axios.axios.get('weak-passwords/?keyword=' + searchWords + '&page=' + currentPageWeak + '&per-page=' + size)
    .then((resp: any) => {
      this.weakPwdData.data = resp.data.weak_passwords;   //  数据
      this.totalNumberWeak = resp.data.totalCounts;  // 总数量
    });
  }

  // 页码改变事件
  public stateUpdate(tiTable: any) {
    const dataState: TiTableDataState = tiTable.getDataState();
    this.InquireWeakPwd(this.searchWords[0], dataState.pagination.currentPage, dataState.pagination.itemsPerPage);
  }

  // 弱口令删除弹窗
  public delePopUp(id: any, value: any) {
    const lang = sessionStorage.getItem('language');
    this.weakId = id;
    this.weakContent = value;
    this.miniModalServe.open({
      type: 'warn',
      content: {
        title: this.i18n.weakPassword.deleWeakPwd,
        body: this.i18n.weakPassword.confirmdele + ' ' +  this.weakContent + (lang === 'zh-cn' ? '？' : '?')
      },
      close: (): void => {
        this.deleWeakPad();
      },
      dismiss: () => { }
    });
  }

  // 删除弱口令
  public deleWeakPad() {
    const params = {
      weak_password_id: this.weakId
    };
    this.Axios.axios.delete('weak-passwords/', { data: params }).then((res: any) => {
      if (this.weakPwdData.data.length === 1 && this.currentPageWeak !== 1) {
        this.currentPageWeak = this.currentPageWeak - 1;
      }
      this.InquireWeakPwd(this.searchWords[0], this.currentPageWeak, this.pageSizeWeak.size);
      const tipContent = this.isZh ? res.infochinese  : res.info;
      if (this.commonService.handleStatus(res) === 0) {
        this.mytip.alertInfo({ type: 'success', content: tipContent, time: 3500 });
      } else {
        this.mytip.alertInfo({ type: 'warn', content: tipContent, time: 3500 });
      }
    }).catch((error: any) => {
      const tipContent = this.isZh ? error.infochinese  : error.info;
      this.mytip.alertInfo({ type: 'error', content: tipContent, time: 3500 });

    });
  }

  // 确认新增
  public confirmWeakPwd(event: any): any {
    const errors: ValidationErrors | null = TiValidators.check(this.WeakPwd);
    // 整体校验后如果需要聚焦到第一个校验不通过元素，请参考以下代码
    if (errors) {
      // 注意：要保证fb.group时各个FormControl的顺序与对应表单元素dom放置顺序一致
      const firstError: any = Object.keys(errors)[0];
      const errorEle = this.elementRef.nativeElement.querySelector(`[formControlName=${firstError}]`);
      if (errorEle) {
        errorEle.focus();
        errorEle.blur();
      }
      return false;
    }
    const params = {
      weak_password: this.WeakPwd.get('pwd').value,
    };
    this.Axios.axios.post('weak-passwords/', params).then((res: any) => {
      this.WeakPwd = new FormGroup({
        pwd: new FormControl('', [CustomValidators.resetPassword(this.i18n)]),
      });
      this.InquireWeakPwd(this.searchWords[0], this.currentPageWeak, this.pageSizeWeak.size);
      const tipContent = this.isZh ? res.infochinese  : res.info;
      if (this.commonService.handleStatus(res) === 0) {
        this.mytip.alertInfo({ type: 'success', content: tipContent, time: 3500 });
        this.addWeakPwd.Close();
      } else {
        this.mytip.alertInfo({ type: 'error', content: tipContent, time: 3500 });
        if (tipContent !== '弱口令已经存在。' && tipContent !== 'The weak password already exists.') {
          this.addWeakPwd.Close();
        }
      }
    }).catch((error: any) => {
      this.addWeakPwd.Close();
      const tipContent = this.isZh ? error.infochinese  : error.info;
      this.mytip.alertInfo({ type: 'error', content: tipContent, time: 3500 });
    });
  }
}
