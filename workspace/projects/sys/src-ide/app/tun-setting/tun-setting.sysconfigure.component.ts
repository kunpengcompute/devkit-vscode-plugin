import { FormBuilder } from '@angular/forms';
import { MytipService } from '../service/mytip.service';
import { I18nService } from '../service/i18n.service';
import { VscodeService, HTTP_STATUS_CODE } from '../service/vscode.service';
import { TunsetComponent } from './tun-setting.component';

/**
 * 用户管理
 */
export class SysConfigure {

    public static instance: SysConfigure;
    elementRef: any;

    // 静态实例常量
    constructor(
        public fb: FormBuilder,
        public mytip: MytipService,
        public i18nService: I18nService,
        public vscodeService: VscodeService,
    ) {
        SysConfigure.instance = this;
        this.i18n = this.i18nService.I18n();
        this.initOptionData('INFO');
    }
    public userInput = false;
    public userNumsFlag = false;
    public i18n: any;
    // 记录上一次选中的运行日志级别
    public selectLogLever: string;
    public finnaluserNum = 10;
    public spinnerValue = 10;

    public operatingInput = false;
    public operatingFlag = false;
    public operatingNum = 15;

    public levelset = false;
    public LogLevelInput = false;

    public LogLevel = {
        selected: {
            label: '',
            value: ''
        },
        options: [
            {
                label: '',
                value: ''
            },
            {
                label: '',
                value: ''
            },
            {
                label: '',
                value: ''
            },
            {
                label: '',
                value: ''
            },
            {
                label: '',
                value: ''
            },
        ]
    };

    /**
     * 初始化数据
     */
    initOptionData(data) {
        this.LogLevel = {
            selected: {
                label: data,
                value: data
            },
            options: [
                {
                    label: 'INFO',
                    value: 'INFO'
                },
                {
                    label: 'DEBUG',
                    value: 'DEBUG'
                },
                {
                    label: 'WARNING',
                    value: 'WARNING'
                },
                {
                    label: 'ERROR',
                    value: 'ERROR'
                },
                {
                    label: 'CRITICAL',
                    value: 'CRITICAL'
                },
            ]
        };
    }

    /**
     * 运行日志------获取级别
     */
    public getLogLevelNum() {
        const option = {
            url: `/run-logs/info/`,
            subModule: VscodeService.PERF_SUBMODULE.TOOL_USER_MANAGEMENT
        };
        this.vscodeService.get(option, (data: any) => {
            if (data.code === HTTP_STATUS_CODE.USERMANAGE_SUCCESS) {
                // 存放当前值
                this.selectLogLever = data.data.logLevel;
                this.initOptionData(data.data.logLevel);
            }
        });
    }

    /**
     * 运行日志------打开修改页面
     */
    public openLogLevelChange() {
        this.LogLevelInput = true;
        this.levelset = true;
        this.getLogLevelNum();
    }
    /**
     * 运行日志------修改级别
     */
    public changeLogLevelNum(tunSet: TunsetComponent) {
        // 修改值不能与当前值相同
        if (this.LogLevel.selected.label === this.selectLogLever) {
            this.LogLevelInput = false;
            this.levelset = false;
            return;
        }
        const param = {
            logLevel: this.LogLevel.selected.label,
        };
        const option = {
            url: `/run-logs/update/`,
            params: param,
            subModule: VscodeService.PERF_SUBMODULE.TOOL_USER_MANAGEMENT
        };
        this.vscodeService.post(option, (data: any) => {
            if (data.code === HTTP_STATUS_CODE.USERMANAGE_SUCCESS) {
                this.vscodeService.showInfoBox(tunSet.LogLevelNumsTips, 'info');
            } else if (data.code === 'SysPerf.Common.Config.NoModify') {
                this.vscodeService.showInfoBox(tunSet.operationgNumsTips, 'info');
                this.getLogLevelNum();
            }
        });
        this.LogLevelInput = false;
        this.levelset = false;
        return true;
    }
    /**
     * 运行日志------取消修改运行日志级别
     */
    public closeLogLevelNumChange() {
        this.LogLevelInput = false;
        this.levelset = false;

        this.getLogLevelNum();
    }

    /**
     * 操作日志------校验天数是否输入正确
     */
    checkOperatingNums() {
        const spinnerValueTemp: any = this.operatingNum;
        const reg = new RegExp(/^([3-9][0-9]|280|[1][0-9][0-9]|[2][0-7][0-9])$/);
        this.operatingFlag = !reg.test(spinnerValueTemp);
    }

    /**
     * 操作日志------取消修改最大用户数
     */
    public closeOperatingNumChange() {
        this.operatingInput = false;
        this.operatingFlag = false;
    }

    /**
     * 修改最大用户数------获取当前最大用户数
     */
    public getUserNum() {
        const option = {
            url: `/config/userconf/`,
            subModule: VscodeService.PERF_SUBMODULE.TOOL_USER_MANAGEMENT
        };
        this.vscodeService.get(option, (data: any) => {
            if (data.code === HTTP_STATUS_CODE.USERMANAGE_SUCCESS) {
                this.finnaluserNum = data.data.ONLINE_USERS;
            }
        });
    }

    /**
     * 修改最大用户数------打开修改页面
     */
    public openNumChange() {
        this.userInput = true;
        this.spinnerValue = this.finnaluserNum;
    }

    /**
     * 下载操作日志
     * @param data data
     */
    public downloadOperaLog() {
        // 对下载的文件命名
        const str = this.i18n.plugins_perf_tip_sysSet.commonOperationLog;
        const option = {
            url: '/operation-logs/download/',
            subModule: VscodeService.PERF_SUBMODULE.TOOL_USER_MANAGEMENT,
            responseType: 'arraybuffer'
        };
        this.vscodeService.get(option, (res: any) => {
            const message = {
                cmd: 'downloadFile',
                data: {
                    fileName: str + '.csv',
                    fileContent: res,
                    contentType: 'arraybuffer',
                    invokeLocalSave: true
                }
            };
            this.vscodeService.postMessage(message, null);
        });
    }

    /**
     * 修改最大用户数------提交确认修改最大用户数
     */
    public changeNum(tunSet: TunsetComponent) {
        if (this.userNumsFlag) {
            return false;
        }
        const param = {
            user_config: { ONLINE_USERS: this.spinnerValue },
        };
        const option = {
            url: `/config/userconf/`,
            params: param,
            subModule: VscodeService.PERF_SUBMODULE.TOOL_USER_MANAGEMENT
        };
        this.vscodeService.put(option, (data: any) => {
            if (data.code === HTTP_STATUS_CODE.USERMANAGE_SUCCESS) {
                this.finnaluserNum = this.spinnerValue;
                this.vscodeService.showInfoBox(tunSet.changeNumsTips, 'info');
            }
        });
        this.userInput = false;
        return true;
    }

    /**
     * 修改最大用户数------取消修改最大用户数
     */
    public closeNumChange() {
        this.userInput = false;
        this.userNumsFlag = false;
    }

    /**
     * 修改最大用户数------校验最大用户数是否输入正确
     */
    checkNums() {
        const spinnerValueTemp: any = this.spinnerValue;
        const reg = new RegExp(/^([1][0-9]|20|[1-9])$/);
        this.userNumsFlag = !reg.test(spinnerValueTemp);
    }
}
