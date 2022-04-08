import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ValidationErrors } from '@angular/forms';
import {
    TiModalService, TiTableColumns, TiTableDataState, TiTableSrcData, TiValidationConfig, TiValidators
  } from '@cloud/tiny3';
import { I18nService, MytipService, COLOR_THEME, VscodeService, CustomValidators } from '../../service';
import { HyMiniModalService } from 'hyper';

const enum LANGUAGE_TYPE {
    // ZH表示界面语言为中文
    ZH = 0,
    // EH表示界面语言为英文
    EN = 1,
}

const enum STATUS {
    SUCCESS = 0,
    FAIL = 1,
    INSUFFICIENT_SPACE = 2
}
@Component({
    selector: 'app-weak-pwd-dictionary',
    templateUrl: './weak-pwd-dictionary.component.html',
    styleUrls: ['./weak-pwd-dictionary.component.scss']
})
export class WeakPwdDictionaryComponent implements OnInit {
    @ViewChild('addWeakPwd', { static: false }) addWeakPwd: any;
    @ViewChild('deleWeak', { static: false }) deleWeak: any;

    public i18n: any;
    constructor(
        public timessage: TiModalService,
        public vscodeService: VscodeService,
        public mytip: MytipService,
        private miniModalServe: HyMiniModalService,
        private elementRef: ElementRef,
        public i18nService: I18nService,
    ) {
        this.i18n = this.i18nService.I18n();
    }

    public currLang: number;
    public weakPadPlaceholder = '';
    // 弱口令页码
    public pageSizeWeak: { options: Array<number>, size: number } = {
        options: [10, 20, 50, 100],
        size: 10
    };
    // 弱口令表单
    public columnsWeak: TiTableColumns = [];
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
    public WeakPwd: FormGroup;   // 弱口令
    public weakPwdContent = '';
    public validation: TiValidationConfig = {
        type: 'blur',
        errorMessage: {}
    };
    public weakPwdTip = '';
    // 获取主题颜色
    public ColorTheme = {
        Dark: COLOR_THEME.Dark,
        Light: COLOR_THEME.Light
    };
    public currTheme = COLOR_THEME.Dark;
    // 判断是否为管理员
    public isAdmin: boolean;

    public showLoading = false;
    public pluginUrlCfg: any = {};
    public LANGUAGE_TYPE = {
        ZH : 0,
        EN : 1,
    };

    /**
     * ngOnInit
     */
    ngOnInit() {
        // 获取全局url配置数据
        this.vscodeService.postMessage({ cmd: 'readUrlConfig' }, (resp: any) => {
            this.pluginUrlCfg = resp;
        });
        this.currLang = I18nService.getLang();
        // vscode颜色主题
        if (document.body.className === 'vscode-light') {
            this.currTheme = COLOR_THEME.Light;
        }

        // 判断是否为管理员
        if (((self as any).webviewSession || {}).getItem('role') === 'Admin') { this.isAdmin = true; }

        this.vscodeService.regVscodeMsgHandler('colorTheme', (msg: any) => {
            this.currTheme = msg.colorTheme;
        });
        this.weakPadData = { // 表格源数据，开发者对表格的数据设置请在这里进行
            data: [], // 源数据
            state: {
                searched: true, // 后台搜索，源数据已进行过搜索处理
                sorted: false, // 后台排序，源数据已进行过排序处理
                paginated: true // 后台分页，源数据已进行过分页处理
            }
        };

        // 弱口令验证规则
        this.WeakPwd = new FormGroup({
            pwd: new FormControl('', [CustomValidators.resetPassword(this.i18n)]),
        });

        if (this.isAdmin) {
            this.columnsWeak = [
                {
                    title: this.i18n.plugins_porting_weakPassword.WeakPwd
                },
                {
                    title: this.i18n.common_term_operate
                },
            ];
        } else {
            this.columnsWeak = [
                {
                    title: this.i18n.plugins_porting_weakPassword.WeakPwd
                },
            ];
        }

        this.weakPwdTip = this.i18n.plugins_porting_weakPassword.weakPasswordTip;
        this.weakPadPlaceholder = this.i18n.plugins_porting_weakPassword.searchWeakPwd;
        this.weakPwdContent = this.i18n.plugins_porting_weakPassword.WeakPwd;
        this.showLoading = true;
        setTimeout(() => {
            this.inquireWeakPwd(this.searchWords[0], this.currentPageWeak, this.pageSizeWeak.size);
        }, 1500);
    }

    /**
     *  搜索弱口令
     */
    public weakPadSearch(event: any) {
        if (event) {
            this.searchWords[0] = encodeURIComponent(event);
        } else {
            this.searchWords[0] = '';
        }
    }

    // 清除弱口令
    public weakPwdClear(event: any): void {
        this.searchWords[0] = '';
    }

    /**
     * 新增弱口令
     */
    public addWeakPad(content: any) {
        this.WeakPwd.reset();
        this.addWeakPwd.Open();
    }

    /**
     * 关闭弹窗
     */
    public cancelWeakPwd(event: any) {
        if (event.button !== 0) { return; }
        this.WeakPwd.reset();
        $(`.ti3-form-list`).find('ti-error-msg').remove();
        this.addWeakPwd.Close();
      }

    /**
     * 请求数据的方法
     */
    public inquireWeakPwd(searchWords: string, currentPageWeak: string | number, size: string | number) {
        this.showLoading = true;
        const option = {
            url: '/weak-passwords/?keyword=' + searchWords +
              '&page=' + encodeURIComponent(currentPageWeak) +
              '&per-page=' + encodeURIComponent(size),
        };
        // 初始时向后台发送请求获取数据
        this.vscodeService.get(option, (val: any) => {
            this.weakPadData.data = val.data.weak_passwords;   //  数据
            this.totalNumberWeak = val.data.totalCounts;  // 总数量
            this.showLoading = false;
        });
    }

    /**
     * 页码改变事件
     */
    public stateUpdate(tiTable: { getDataState: () => any; }) {
        const dataState: TiTableDataState = tiTable.getDataState();
        this.inquireWeakPwd(this.searchWords[0], dataState.pagination.currentPage, dataState.pagination.itemsPerPage);
    }

    /**
     * 弱口令删除弹窗
     */
    public delePopUp(content: any, id: number, value: string) {
        const lang = sessionStorage.getItem('language');
        this.weakId = id;
        this.weakContent = value;
        this.miniModalServe.open({
          type: 'warn',
          content: {
            title: this.i18n.plugins_porting_weakPassword.deleWeakPwd,
            body: this.i18n.plugins_porting_weakPassword.confirmdele + ' '
              +  this.weakContent + (lang === 'zh-cn' ? '？' : '?')
          },
          close: (): void => {
            this.deleWeakPad();
          },
          dismiss: () => { }
        });
    }
    /**
     * 删除弱口令
     */
    public deleWeakPad() {
        const params = {
            weak_password_id: this.weakId
        };
        const option = {
            url: '/weak-passwords/',
            params
        };
        this.vscodeService.delete(option, (data: any) => {
            if (data.status === 0) {
                if (this.weakPadData.data.length === 1 && this.currentPageWeak !== 1) {
                    this.currentPageWeak = this.currentPageWeak - 1;
                }
                this.inquireWeakPwd(this.searchWords[0], this.currentPageWeak, this.pageSizeWeak.size);
            }
            this.showMessageByLang(data);
        });
    }
    /**
     * 密码验证规则
     * 弱密码必须包含大写字母、小写字母、数字以及特殊字符（`~!@#$%^&*()-_=+\\|[{}];:\'",<.>/?）中两种及以上类型的组合，长度为8~32个字符
     * \u4E00-\uffe5为中文字符的Unicode编码
     */

    public checkWeakPwdRule(event: any){
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
            return;
        }
        this.confirmWeakPwd(event);
    }


    /**
     * 确认新增
     */
    public confirmWeakPwd(event: any) {
        const option = {
            url: '/weak-passwords/',
            params: {
                weak_password: this.WeakPwd.get('pwd').value,
            }
        };
        this.vscodeService.post(option, (data: any) => {
            if (data.status === STATUS.SUCCESS) {
                this.addWeakPwd.Close();
                this.inquireWeakPwd(this.searchWords[0], this.currentPageWeak, this.pageSizeWeak.size);
            }
            this.showMessageByLang(data);
        });
        return true;
    }

    private showInfoBox(info: any, type: any) {
        const message = {
            cmd: 'showInfoBox',
            data: {
                info,
                type
            }
        };
        this.vscodeService.postMessage(message, null);
    }
    // 发送消息给vscode, 右下角弹出提醒框
    private showMessageByLang(data: any) {
        let type = 'info';
        if (data.status !== STATUS.SUCCESS) {
            type = 'error';
        }
        if (LANGUAGE_TYPE.ZH === this.currLang) {
            this.showInfoBox(data.infochinese, type);
        } else {
            this.showInfoBox(data.info, type);
        }
    }
}

