import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { TiTableColumns, TiTableSrcData, TiTableDataState, TiTableComponent } from '@cloud/tiny3';
import { AxiosService } from '../../service/axios.service';
import { TiModalService, TiValidationConfig, TiValidators } from '@cloud/tiny3';
import { FormBuilder, FormControl, FormGroup, ValidationErrors } from '@angular/forms';
import { MytipService } from '../../service/mytip.service';
import { I18nService } from '../../service/i18n.service';

@Component({
  selector: 'app-weak-pwd',
  templateUrl: './weak-pwd.component.html',
  styleUrls: ['./weak-pwd.component.scss']
})
export class WeakPwdComponent implements OnInit {

  constructor(public Axios: AxiosService, public timessage: TiModalService,
              private elementRef: ElementRef, public mytip: MytipService, public i18nService: I18nService, ) {
    this.i18n = this.i18nService.I18n();
  }
  @ViewChild('deleWeak') deleWeak: any;
  i18n: any;
  public weakPadPlaceholder = '搜索弱口令';
  // 弱口令页码
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
  public displayed: any = [];
  public value = '';
  // 弱口令列表
  public weakPadData: TiTableSrcData;
  public searchWords: Array<string> = [''];
  public currentPageWeak = 1;
  public totalNumberWeak = 0;
  public msg: any;
  public weakId = 0;
  public weakContent = '';
  public WeakPad: FormGroup;   // 弱口令
  public weakPwdContent = '';
  public role: string;
  public validation: TiValidationConfig = {
    type: 'blur',
    errorMessage: {}
  };
  public addWeakPwdBtn = false;
  public weakPwdTip = '';
  public isLoading: any = false;


  ngOnInit() {
    this.weakPadData = { // 表格源数据，开发者对表格的数据设置请在这里进行
      data: [], // 源数据
      state: {
        searched: true, // 后台搜索，源数据已进行过搜索处理
        sorted: false, // 后台排序，源数据已进行过排序处理
        paginated: true // 后台分页，源数据已进行过分页处理
      }
    };
    this.InquireWeakPad(this.searchWords[0], this.currentPageWeak, this.pageSizeWeak.size);
    // 弱口令验证规则
    this.WeakPad = new FormGroup({
      pwd: new FormControl('', [this.resetPassword]),
    });
    this.role = sessionStorage.getItem('role');
    if (this.role !== 'Admin') {
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
  public weakPadSearch(event: any) {
    const keyword = event === undefined ? '' : event.toString().trim();
    this.searchWords[0] = encodeURIComponent(keyword);
  }

  // 清空搜索框
  public onClear(event: any): void {
    this.value = '';
    this.searchWords[0] = encodeURIComponent(this.value);
  }

  //  新增弱口令
  public addWeakPad(content: any) {
    this.WeakPad.reset();
    this.addWeakPwdBtn = false;
    this.msg = this.timessage.open(content, {
      id: 'add',
      modalClass: 'weak',
      closeIcon: false
      // 取消方法
    });
  }

  // 请求数据的方法
  public InquireWeakPad(searchWords: any, currentPageWeak: any, size: any) {
    this.isLoading = true;
    // 初始时向后台发送请求获取数据
    this.Axios.axios.get('weak-passwords/?keyword=' + searchWords + '&page=' + currentPageWeak
     + '&per-page=' + size, {headers: { showLoading: false }}).then((val: any) => {
      this.isLoading = false;
      this.weakPadData.data = val.data.passwords;   //  数据
      this.totalNumberWeak = val.data.totalCounts;  // 总数量
    }).catch(() => {
      this.isLoading = false;
    });
  }


  // 页码改变事件
  public stateUpdate(tiTable: any) {
    const dataState: TiTableDataState = tiTable.getDataState();
    this.InquireWeakPad(this.searchWords[0], dataState.pagination.currentPage, dataState.pagination.itemsPerPage);
  }

  // 弱口令删除弹窗
  public delePopUp(content: any, id: any, value: any) {
    this.msg = this.timessage.open(content, {
      id: 'delete',
      modalClass: 'weak',
      closeIcon: false
      // 取消方法
    });
    this.weakId = id;
    this.weakContent = value;
  }
  // 删除弱口令
  public deleWeakPad(event: any) {
    this.Axios.axios.delete('weak-passwords/' + this.weakId + '/', {
      baseURL: '../user-management/api/v2.2',
    }).then((res: any) => {
      event.close();
      if (this.weakPadData.data.length === 1 && this.currentPageWeak !== 1) {
        this.currentPageWeak = this.currentPageWeak - 1;
      }
      this.InquireWeakPad(this.searchWords[0], this.currentPageWeak, this.pageSizeWeak.size);
      this.mytip.alertInfo({ type: 'success', content: this.i18n.tip_msg.delete_ok, time: 3500 });
    }).catch((error: any) => {
      event.close();

    });
  }
  // 密码验证规则
  public resetPassword = (control: FormControl): any => {
    const reg = new RegExp(/^(?![A-Z]+$)(?![a-z]+$)(?!\d+$)(?![`~!@#$%^&*()\-_=+\|\[\{\}\];:'\\",<.>/? ]+$)[A-Za-z\d`~!@#$%^&*()\-_=+\|\[\{\}\];:'\\",<.>/? ]{8,32}$/);
    if (!control.value) {
      return { pwd: { tiErrorMessage: this.i18n.tip_msg.system_setting_input_empty_judge } };
    } else if (reg.test(control.value) === false || (/[\u4E00-\u9FA5]/i.test(control.value)) || (/[\u3002\uff1f\uff01\uff0c\u3001\uff1b\uff1a\u201c\u201d\u2018\u2019\uff08\uff09\u300a\u300b\u3008\u3009\u3010\u3011\u300e\u300f\u300c\u300d\ufe43\ufe44\u3014\u3015\u2026\u2014\uff5e\ufe4f\uffe5]/i).test(control.value)) {
      return { pwd: { tiErrorMessage: this.i18n.weakPassword.pwd_rule } };
    } else {
      this.addWeakPwdBtn = true;
    }
  }
  // 确认新增
  public confirmWeakPwd(event: any): any {
    const errors: ValidationErrors | null = TiValidators.check(this.WeakPad);
    // 整体校验后如果需要聚焦到第一个校验不通过元素，请参考以下代码
    if (errors) {
      // 注意：要保证fb.group时各个FormControl的顺序与对应表单元素dom放置顺序一致
      const firstError: any = Object.keys(errors)[0];
      this.elementRef.nativeElement.querySelector(`[formControlName=${firstError}]`)
        .focus();
      this.elementRef.nativeElement.querySelector(`[formControlName=${firstError}]`)
        .blur();
      return false;
    }
    const params = {
      weak_password: this.WeakPad.get('pwd').value,
    };
    this.Axios.axios.post('weak-passwords/', params, {
      baseURL: '../user-management/api/v2.2',
    }).then((res: any) => {
      event.close();
      this.InquireWeakPad(this.searchWords[0], this.currentPageWeak, this.pageSizeWeak.size);
      this.mytip.alertInfo({ type: 'success', content: this.i18n.tip_msg.add_ok, time: 3500 });
    }).catch((error: any) => {
      event.close();
    });
  }


}
