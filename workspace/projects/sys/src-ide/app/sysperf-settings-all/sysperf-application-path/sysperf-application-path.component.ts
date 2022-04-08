import { Component, OnInit } from '@angular/core';
import { VscodeService } from '../../service/vscode.service';
import { I18nService } from '../../service/i18n.service';
import { TiValidationConfig, TiModalService } from '@cloud/tiny3';
import {
    FormControl,
    FormGroup,
    ValidationErrors,
    ValidatorFn,
    AbstractControl,
} from '@angular/forms';
import { UrlService } from 'projects/sys/src-ide/app/service/url.service';
import { ToolType } from 'projects/domain';
@Component({
    selector: 'app-sysperf-application-path',
    templateUrl: './sysperf-application-path.component.html',
    styleUrls: ['./sysperf-application-path.component.scss']
})
export class SysperfApplicationPathComponent implements OnInit {
    private url: any;
    constructor(
        public i18nService: I18nService,
        private tiModal: TiModalService,
        public vscodeService: VscodeService,
        private urlService: UrlService,
    ) {
        this.i18n = this.i18nService.I18n();
        this.url = this.urlService.Url();

        //  运行日志级别
        this.sysTuningConfig = {
            runLogLevel: {
                notice: './assets/img/mission/help.svg',
                label: this.i18n.plugins_perf_tip_sysSet.run_log_level,
                range: [
                    { label: 'DEBUG', val: 'DEBUG' },
                    { label: 'INFO', val: 'INFO' },
                    { label: 'WARNING', val: 'WARNING' },
                    { label: 'ERROR', val: 'ERROR' },
                    { label: 'CRITICAL', val: 'CRITICAL' }
                ],
                tip: this.i18n.plugins_perf_runLogTip,
                value: { label: '', val: '' },
            },
        };
    }
    public isAdmin: boolean;
    public i18n;
    public mode: 'read' | 'write' = 'read';
    public value = '';
    public strerr;
    public disabled = true;
    public sysConfForm = new FormGroup({
        inputValue: new FormControl(this.value, [this.inputValueValidator(this.i18nService.I18n())])
    });
    public validation: TiValidationConfig = {
        type: 'change',
        errorMessage: {},
    };
    public isLogModify = false;
    // 修改之前的运行日志级别
    public tempLogPreVal: any;
    // 修改之后的运行日志级别
    public temLogAfterVal: any;
    //  运行日志级别
    public sysTuningConfig: any;

    public toolType: ToolType;
    public ToolType = ToolType;

    /**
     * 页面初始化方法
     */
    ngOnInit() {
        this.sysConfForm.get('inputValue').valueChanges.subscribe(val => {
            if (val.indexOf('./') >= 0 || val.indexOf('../') >= 0) { // 相对路径转换成绝对路径
                this.pathNormalize(val);
            }
        });
        this.toolType = sessionStorage.getItem('toolType') as ToolType;
        // 用户角色判断
        this.isAdmin = VscodeService.isAdmin();
        this.sysConfForm.controls.inputValue.disable();
        this.requestConfigData();

        // 查询运行日志级别和运行文件
        this.getRunLogLevel();
    }

    /**
     * onFixConfig修改配置
     * @param e 对象
     */
    onFixConfig(e) {
        this.show(e);
    }
    /**
     * onsubmit表单提交
     */
    onSubmit(e) {
        this.mode = 'read';
        this.sysConfForm.controls.inputValue.disable();
        if (this.sysConfForm.controls.inputValue.value === this.value) {
            return;
        }
        this.value = this.sysConfForm.controls.inputValue.value;
        const params = { system_config: { TARGET_APP_PATH: this.sysConfForm.controls.inputValue.value } };
        this.vscodeService.put({ url: '/config/system/', params }, (data) => {
            const tips = this.i18n.tipMsg.tipSuccess;
            this.vscodeService.showInfoBox(tips, 'info');
        });
    }
    /**
     * oncancel取消提交表单
     */
    onCancel(e) {
        this.mode = 'read';
        this.sysConfForm.controls.inputValue.setValue(this.value);
        this.sysConfForm.controls.inputValue.disable();
    }
    /**
     * 打开弹窗
     */
    show(content: any): void {
        this.tiModal.open(content, {
            id: 'myModal', // 定义id防止同一页面出现多个相同弹框

            // 模板上下文：一般通过context定义的是与弹出动作相关的数据，大部分数据还是建议在外部定义
            // 双向绑定的值，建议放在context对象中，每次打开弹窗都重新就行赋值。
            context: {
                myValue: 'text',
                value: 'textarea',
                name: 'aaa',
                spinnerValue: 20
            },
            close: (): void => {// 弹框关闭事件回调，可以在此处获取弹框组件的信息
                this.sysConfForm.controls.inputValue.enable();
                this.mode = 'write';
            },
        });
    }
    /**
     * 请求接口数据
     */
    public requestConfigData() {
        this.vscodeService.get({ url: '/config/system/' }, (data: any) => {
            this.value = data.data.TARGET_APP_PATH;
            this.sysConfForm.patchValue({ inputValue: this.value });
        });
    }
    /**
     * 修改路径提交
     */
    public inputValueValidator(i18n: any): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const tmpValue: string = control.value;
            const emptyJudge = { inputValue: { tiErrorMessage: i18n.tipMsg.system_setting_input_empty_judge } };
            const formatJudge = { inputValue: { tiErrorMessage: i18n.tipMsg.system_setting_input_format_judge } };
            const repetitionJudge = { inputValue: { tiErrorMessage: i18n.tipMsg.system_setting_input_repeat_judge } };
            // 为空判断
            if (tmpValue === '' || tmpValue == null) {
                this.strerr = emptyJudge.inputValue.tiErrorMessage;
                return emptyJudge;
            }
            // 逐项判断
            const itemList = tmpValue.split(';');
            for (let i = 0; i < itemList.length; i++) {
                const item = itemList[i];
                // 匹配规则简述：1、前后必有 /; 2、不含字符：^ ` / | ; & $ > < \ ! 任何空白字符; 3、不能出现：//
                const pathReg: RegExp = /^\/([^\/`|;&$><\\!\s]+\/)+$/;
                if (item === '') {
                    this.strerr = formatJudge.inputValue.tiErrorMessage;
                    return formatJudge;
                }
                if (!pathReg.test(item)) {
                    this.strerr = formatJudge.inputValue.tiErrorMessage;
                    return formatJudge;
                }
                if (itemList.lastIndexOf(item) !== i) {
                    this.strerr = repetitionJudge.inputValue.tiErrorMessage;
                    return repetitionJudge;
                }
            }
            return null;
        };
    }

    /**
     * 修改运行日志级别
     */
    public changeRunLogLevel() {
        this.isLogModify = true;
        this.tempLogPreVal = this.sysTuningConfig.runLogLevel.value.val;
    }

    /**
     * 取消修改运行日志级别
     */
    public cancelChangeRunLogLevel() {
        this.isLogModify = false;
        this.getRunLogLevel();
    }

    /**
     * 确认修改运行日志级别
     */
    public modifyRunLogLevel() {
        this.isLogModify = false;
        if (this.tempLogPreVal === this.sysTuningConfig.runLogLevel.value.val) {
            return;
        }
        const params = { logLevel: this.sysTuningConfig.runLogLevel.value.val };
        const option = {
            url: this.url.runlogUpdata,
            params
        };
        const message = {
            cmd: 'getData',
            data: option
        };
        this.vscodeService.postMessage(message, (res: any) => {
            this.temLogAfterVal = this.sysTuningConfig.runLogLevel.value.val;
            if (res.code === 'SysPerf.Success') {
                if (this.tempLogPreVal === this.temLogAfterVal) {
                    this.vscodeService.showInfoBox(this.i18n.plugins_perf_runlog_tip_modifySame, 'warn');
                } else {
                    this.vscodeService.showInfoBox(this.i18n.plugins_perf_tips_LogLevelNum, 'info');
                }
            } else {
                this.vscodeService.showInfoBox(res.message, 'error');
            }
        });
    }

    /**
     * 查询运行日志级别
     */
    public getRunLogLevel() {
        const option = {
            url: '/run-logs/info/'
        };
        this.vscodeService.get(option, (data: any) => {
            this.sysTuningConfig.runLogLevel.value = {
                label: data.data.logLevel,
                val: data.data.logLevel
            };
        });
    }
    private pathNormalize(value: any) {
        const path: string[] = [];
        value.split(';').forEach((item: any) => {
          const output: any[] = [];
          item.replace(/^(\.\.?(\/|$))+/, '')
              .replace(/\/(\.(\/|$))+/g, '/')
              .replace(/\/\.\.$/, '/../')
              .replace(/\/?[^\/]*/g, (p: any) => {
                  if (p === '/..') {
                      output.pop();
                  } else {
                      output.push(p);
                  }
              });
          path.push(output.join('').replace(/^\//, item.charAt(0) === '/' ? '/' : ''));
        });
        this.sysConfForm.controls.inputValue.setValue(path.join(';'));
    }
}
