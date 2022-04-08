import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { TiTableColumns, TiTableSrcData, TiTableDataState } from '@cloud/tiny3';
import { TiModalService, TiValidationConfig, TiValidators } from '@cloud/tiny3';
import { FormControl, FormGroup, ValidationErrors } from '@angular/forms';
import { MytipService } from '../../service/mytip.service';
import { I18nService } from '../../service/i18n.service';
import { VscodeService, HTTP_STATUS_CODE } from '../../service/vscode.service';
import { CustomValidatorsService } from '../../service';

@Component({
    selector: 'app-weak-pwd',
    templateUrl: './weak-pwd.component.html',
    styleUrls: ['./weak-pwd.component.scss']
})
export class WeakPwdComponent implements OnInit {
    constructor(
        public timessage: TiModalService,
        public vscodeService: VscodeService,
        private elementRef: ElementRef,
        public mytip: MytipService,
        public i18nService: I18nService,
        public customValidatorsService: CustomValidatorsService
    ) {
        this.i18n = this.i18nService.I18n();
    }
    @ViewChild('deleWeak', { static: false }) deleWeak;
    i18n: any;
    public currLang: number;
    public weakPadPlaceholder = '';
    // 弱口令页码
    public pageSizeWeak: { options: Array<number>, size: number } = {
        options: [10, 20, 50, 100],
        size: 10
    };
    // 弱口令表单
    public columnsWeak: TiTableColumns = [];
    public displayed = [];
    public value = '';
    // 弱口令列表
    public weakPadData: TiTableSrcData;
    public searchWords: Array<string> = [''];
    public currentPageWeak = 1;
    public totalNumberWeak = 0;
    public msg;
    public weakId = 0;
    public weakContent = '';
    public WeakPad: FormGroup;   // 弱口令
    public weakPwdContent = '';
    public role = VscodeService.isAdmin();
    public validation: TiValidationConfig = {
        type: 'blur',
        errorMessage: {}
    };
    public addWeakPwdBtn = false;
    public weakPwdTip = '';
    public showLoading = false;
    public image = {
        dark: './assets/img/projects/nodata-dark.png',
        light: './assets/img/projects/nodata-light.png',
  };
    /**
     * ngOnInit
     */
    ngOnInit() {
        this.currLang = I18nService.getLang();

        this.weakPadData = { // 表格源数据，开发者对表格的数据设置请在这里进行
            data: [], // 源数据
            state: {
                searched: true, // 后台搜索，源数据已进行过搜索处理
                sorted: false, // 后台排序，源数据已进行过排序处理
                paginated: true // 后台分页，源数据已进行过分页处理
            }
        };
        this.showLoading = true;
        setTimeout(() => {
            this.InquireWeakPad(this.searchWords[0], this.currentPageWeak, this.pageSizeWeak.size);
        }, 1500);
        // 弱口令验证规则
        this.WeakPad = new FormGroup({
            pwd: new FormControl('', [this.customValidatorsService.checkEmpty(), this.resetPassword]),
        });
        if (!this.role) {
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
    /**
     *  搜索弱口令
     */
    public weakPadSearch(event) {
        this.searchWords[0] = encodeURIComponent(event);
    }

    /**
     * 新增弱口令
     */
    public addWeakPad(content) {
        this.WeakPad.reset();
        this.addWeakPwdBtn = false;
        this.msg = this.timessage.open(content, {
            id: 'add',
            modalClass: 'weak',
            closeIcon: false,
            draggable: false,
        });
    }

    /**
     * 请求数据的方法
     */
    public InquireWeakPad(searchWords, currentPageWeak, size) {
        this.showLoading = true;
        const option = {
            url: '/weak-passwords/?keyword=' + searchWords +
            '&page=' + encodeURIComponent(currentPageWeak) + '&per-page=' + encodeURIComponent(size),
            subModule: VscodeService.PERF_SUBMODULE.TOOL_USER_MANAGEMENT
        };
        // 初始时向后台发送请求获取数据
        this.vscodeService.get(option, (val: any) => {
            this.weakPadData.data = val.data.passwords;   //  数据
            this.totalNumberWeak = val.data.totalCounts;  // 总数量
            this.showLoading = false;
        });
    }

    /**
     * 页码改变事件
     */
    public stateUpdate(tiTable) {
        const dataState: TiTableDataState = tiTable.getDataState();
        this.InquireWeakPad(this.searchWords[0], dataState.pagination.currentPage, dataState.pagination.itemsPerPage);
    }

    /**
     * 弱口令删除弹窗
     */
    public delePopUp(content, id, value) {
        this.msg = this.timessage.open(content, {
            id: 'delete',
            modalClass: 'weak',
            closeIcon: false
        });
        this.weakId = id;
        this.weakContent = value;
    }
    /**
     * 删除弱口令
     */
    public deleWeakPad(event) {
        const option = {
            url: '/weak-passwords/' + this.weakId + '/',
            subModule: VscodeService.PERF_SUBMODULE.TOOL_USER_MANAGEMENT
        };
        this.vscodeService.delete(option, (data) => {
            if (data.code === HTTP_STATUS_CODE.USERMANAGE_SUCCESS) {
                event.close();
                if (this.weakPadData.data.length === 1 && this.currentPageWeak !== 1) {
                    this.currentPageWeak = this.currentPageWeak - 1;
                }
                this.InquireWeakPad(this.searchWords[0], this.currentPageWeak, this.pageSizeWeak.size);
                this.vscodeService.showInfoBox(this.i18n.tip_msg.delete_ok, 'info');
            } else {
                this.vscodeService.showInfoBox(this.i18n.tip_msg.delete_error, 'error');
            }
        });
    }
    /**
     * 密码验证规则
     * 弱口令必须包含大写字母、小写字母、数字以及特殊字符（`~!@#$%^&*()-_=+\\|[{}];:\'",<.>/?）中两种及以上类型的组合，长度为8~32个字符
     * \u4E00-\uffe5为中文字符的Unicode编码
     */
    public resetPassword = (control: FormControl) => {
        const reg = new RegExp(/^(?![A-Z]+$)(?![a-z]+$)(?!\d+$)(?![`~!@#$%^&*()\-_=+\|\[\{\}\];:'\\",<.>/? ]+$)[A-Za-z\d`~!@#$%^&*()\-_=+\|\[\{\}\];:'\\",<.>/? ]{8,32}$/);
        if (reg.test(control.value) === false || (/[\u4E00-\u9FA5]/i.test(control.value))
            || (/[\u3002\uff1f\uff01\uff0c\u3001\uff1b\uff1a\u201c\u201d\u2018]/i).test(control.value)
            || (/[\u2019\uff08\uff09\u300a\u300b\u3008\u3009]/i).test(control.value)
            || (/[\u3010\u3011\u300e\u300f\u300c\u300d\ufe43\ufe44\u3014\u3015\u2026\u2014\uff5e\ufe4f\uffe5]/i).test(
                control.value
            )) {
            this.addWeakPwdBtn = false;
            return { pwd: { tiErrorMessage: this.i18n.weakPassword.pwd_rule } };
        } else {
            this.addWeakPwdBtn = true;
        }
    }
    /**
     * 确认新增
     */
    public confirmWeakPwd(event) {
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
        const option = {
            url: '/weak-passwords/',
            params: {
                weak_password: this.WeakPad.get('pwd').value,
            },
            subModule: VscodeService.PERF_SUBMODULE.TOOL_USER_MANAGEMENT,
        };
        this.vscodeService.post(option, (data) => {
            if (data.code === HTTP_STATUS_CODE.USERMANAGE_SUCCESS) {
                event.close();
                this.InquireWeakPad(this.searchWords[0], this.currentPageWeak, this.pageSizeWeak.size);
                this.vscodeService.showInfoBox(this.i18n.tip_msg.add_ok, 'info');
            } else {
                this.vscodeService.showInfoBox(data.message, 'error');
            }
        });
    }
}
