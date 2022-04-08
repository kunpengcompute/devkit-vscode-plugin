import { Component, OnInit, ViewChild } from '@angular/core';
// 引入tiny
import {
  TiTableRowData, TiTableColumns, TiTableComponent,
  TiTableSrcData, TiTableDataState, TiModalRef
} from '@cloud/tiny3';
import { TiModalService, TiValidationConfig } from '@cloud/tiny3';
// 引入axios服务
import { AxiosService } from 'projects/java/src-web/app/service/axios.service';
// 引入设置中文字体
import { I18nService } from 'projects/java/src-web/app/service/i18n.service';
import { FormControl, FormGroup } from '@angular/forms';
import { MytipService } from 'projects/java/src-web/app/service/mytip.service';
@Component({
  selector: 'app-dictionary',
  templateUrl: './dictionary.component.html',
  styleUrls: ['./dictionary.component.scss']
})
export class DictionaryComponent implements OnInit {

  constructor(
    public Axios: AxiosService,
    public i18nService: I18nService,
    public myTip: MytipService,
    private tiModal: TiModalService
  ) {
    this.i18n = this.i18nService.I18n();
  }
  public i18n: any;
  // 表格默认数据
  public displayed: Array<TiTableRowData> = [];
  public srcData: TiTableSrcData;
  private data: Array<TiTableRowData> = [];
  // 当前页
  public currentPage: any = 1;
  // 总条数
  public totalNumber: any = 20;
  // 当前每页展示多少条
  public pageSize: { options: Array<number>, size: number } = {
    options: [10, 20, 50, 100],
    size: 10
  };
  // 表头
  public columns: Array<TiTableColumns> = [];

  // 搜索数据
  public searchData: Array<TiTableRowData> = [];
  // 搜索框默认值
  public placeholder: any = '';
  public value: any = '';
  // 删除的id
  public weakId: any = 0;
  // 添加的弱口令
  public addWeackValue = '';
  // 添加弱口令按钮状态
  public disabled: any = false;
  // 操作
  public operate = '';
  // 弱口令验证规则
  public WeakPad: FormGroup;
  public validation: TiValidationConfig = {
    type: 'blur',
    errorMessage: {}
  };
  public addWeakPwdBtn = false;
  @ViewChild('table1', { static: true }) table1: TiTableComponent;

  // 自定义弹出层组件
  @ViewChild('mymodal') mymodal: any;
  // 是否展示
  public isOpen: any = false;
  // 自定义删除弹出层
  @ViewChild('deletemodal', { static: true }) deletemodal: any;
  public delIsOpen: any = false;
  public deleteContent: any = '';
  public hoverClose: any;
  public isLoading: any = false;


  ngOnInit(): void {
    // i18n只能在nginit中拿到
    this.operate = this.i18n.common_term_operate_del;
    // 搜索弱口令
    this.placeholder = this.i18n.weakPassword.searchWeakPwd;
    this.srcData = {  // 表格元数据
      data: this.data,
      state: {
        searched: true,  // 后台搜索
        sorted: false,
        paginated: true  // 后台分页
      }
    };
    this.getDirectList(this.value, this.currentPage, this.pageSize.size);
    // 弱口令验证规则
    this.WeakPad = new FormGroup({
      pwd: new FormControl('', [this.resetPassword]),
    });
    //  判断是否为管理员用户
    const role: string = sessionStorage.getItem('role');
    if (role !== 'Admin') {
      this.columns = [{
        title: this.i18n.weakPassword.WeakPwd,
        width: '100%'
      }],
      this.disabled = true;
      this.operate = '';
    } else {
      this.columns = [{
        title: this.i18n.weakPassword.WeakPwd,
        width: '50%'
      },
      {
        title: this.i18n.common_term_operate,
        width: '50%'
      }];
    }
  }
  // 表单验证
  public resetPassword = (control: FormControl): any => {
    const reg = new RegExp(/^(?![A-Z]+$)(?![a-z]+$)(?!\d+$)(?![`~!@#$%^&*()\-_=+\|\[\{\}\];:'\\",<.>/? ]+$)[A-Za-z\d`~!@#$%^&*()\-_=+\|\[\{\}\];:'\\",<.>/? ]{8,32}$/);
    if (control.value === '' || control.value == null) {
      return { pwd: { tiErrorMessage: this.i18n.newHeader.nullNotice } };
    }
    if (reg.test(control.value) === false || (/[\u4E00-\u9FA5]/i.test(control.value)) || (/[\u3002\uff1f\uff01\uff0c\u3001\uff1b\uff1a\u201c\u201d\u2018\u2019\uff08\uff09\u300a\u300b\u3008\u3009\u3010\u3011\u300e\u300f\u300c\u300d\ufe43\ufe44\u3014\u3015\u2026\u2014\uff5e\ufe4f\uffe5]/i).test(control.value)) {
      return { pwd: { tiErrorMessage: this.i18n.weakPassword.pwd_rule } };
    } else {
      this.addWeakPwdBtn = true;
    }
  }
  // 页码改变事件
  public stateUpdate(tiTable: any): void {
    const dataState: TiTableDataState = tiTable.getDataState();
    this.getDirectList(this.value, dataState.pagination.currentPage, dataState.pagination.itemsPerPage);
  }

  // 搜索弱口令
  onSearch(value: string): void {
    this.currentPage = 1;
    this.getDirectList(this.value, this.currentPage, this.pageSize.size);
  }
  // 清空搜素框
  onClear(e: any): void {
    this.value = '';
    this.getDirectList(this.value, this.currentPage, this.pageSize.size);
  }
  // 请求方法
  public getDirectList(searchWords: any, currentPageWeak: any, size: any) {
    // 初始时向后台发送请求获取数据
    this.isLoading = true;
    this.Axios.axios.get('weak-passwords/?keyword=' +
      encodeURIComponent(searchWords) + '&page=' + encodeURIComponent(currentPageWeak) +
      '&per-page=' + encodeURIComponent(size), {
      baseURL: '../user-management/api/v2.2',
    }).then((val: any) => {
      this.isLoading = false;
      this.data = val.data.passwords.map((item: any) => {
        return item;
      });   //  数据
      this.srcData.data = this.data;
      this.totalNumber = val.data.totalCounts;  // 总数量
    });
  }

  // 确认添加弱口令
  public addConfirm(event: any) {
    if (!this.addWeakPwdBtn) { return; }
    const params = { weak_password: this.WeakPad.get('pwd').value };
    // 发起请求
    this.Axios.axios.post('weak-passwords/', params, {
      baseURL: '../user-management/api/v2.2',
    }).then(() => {
      this.myTip.alertInfo({
        type: 'success',
        content: this.i18n.tip_msg.add_ok,
        time: 3500,
      });
      event.close();
      this.WeakPad.reset();
      // 刷新列表
      this.getDirectList(this.value, this.currentPage, this.pageSize.size);
    });
  }
  // 确认删除弱口令
  public deleteConfirm() {
    // 发起请求
    this.Axios.axios.delete('weak-passwords/' + encodeURIComponent(this.weakId) + '/', {
      baseURL: '../user-management/api/v2.2', headers: { showLoading: false }
    }).then(() => {
      // 关闭弹出层
      this.myTip.alertInfo({
        type: 'success',
        content: this.i18n.tip_msg.delete_ok,
        time: 3500,
      });
      // 刷新列表
      this.getDirectList(this.value, this.currentPage, this.pageSize.size);
    });
  }
  // 添加弱口令
  public showAddmodal(content: any): void {
    this.tiModal.open(content, {
      closeIcon: false,
      context: {
        id: 'myModal'
      },
      dismiss: (modalRef: TiModalRef): void => {
        this.hoverClose = '';
        this.WeakPad.reset();
      }
    });
    this.addWeakPwdBtn = false;
    this.isOpen = true;
  }
  // 打开删除层
  public showDelmodal(row: any, content: any) {
    const role: string = sessionStorage.getItem('role');
    if (role !== 'Admin') {
      return;
    }
    this.deleteContent = this.i18nService.I18nReplace(
      this.i18n.weakPassword.sureDelteWeakPwd,
      { 0: row.weak_password }
    );
    this.delIsOpen = true;
    this.weakId = row.id;
    this.tiModal.open(content, {
      closeIcon: false,
      context: {
        id: 'deletemodal'
      },
      close: (modalRef: TiModalRef) => {
        this.deleteConfirm();
      },
      dismiss: (modalRef: TiModalRef) => {
        this.hoverClose = '';
      }
    });
  }
  // 关闭删除层
  public closeDelmodal() {
    this.deletemodal.close();
    this.delIsOpen = false;
  }
  public onHoverClose(msg: any) {
    this.hoverClose = msg;
  }
}
