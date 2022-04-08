import { FormBuilder } from '@angular/forms';
import { MytipService } from '../service/mytip.service';
import { I18nService } from '../service/i18n.service';
import { VscodeService } from '../service/vscode.service';
import { TunsetComponent } from './tun-setting.component';

/**
 * 用户管理
 */
export class RunningLog {

    public static instance: RunningLog;
    elementRef: any;

    // 静态实例常量
    constructor(
        public fb: FormBuilder,
        public mytip: MytipService,
        public i18nService: I18nService,
        public vscodeService: VscodeService,
    ) {
        RunningLog.instance = this;
        this.i18n = this.i18nService.I18n();
    }

    public logList = [];
    public fileList = [];
    public i18n: any;

    /**
     * 下载运行日志------打开运行日志下载页面
     * @param tunSet tun-setting实例
     */
    public openRunningLog(tunSet: TunsetComponent) {
        this.showRunningLogList();
        tunSet.isShow = false;
        tunSet.DownloadLogPage.Open();
        return true;
    }


    /**
     * 取消运行日志下载
     * @param tunSet tun-setting实例
     */
    public closeDownloadLog(tunSet: TunsetComponent) {
        tunSet.DownloadLogPage.Close();
        tunSet.isShow = false;
    }


    /**
     *  确认下载运行日志
     */
    public sureToDownloadRunLog(tunSet: TunsetComponent) {
        if (this.fileList.length > 0) {
            this.closeDownloadLog(tunSet);
            this.fileList.forEach(filename => {
                this.startToDownloadRunLog(filename);
            });
        }
    }


    /**
     *
     *  开始遍历下载所有运行日志
     */
    public startToDownloadRunLog(filename: string) {
        // 对下载的文件命名
        const str = this.i18n.plugins_perf_tip_sysSet.commonRunLog;
        if (filename) {
            const option = {
                url: '/run-logs/download/?log-name=' + filename,
                subModule: VscodeService.PERF_SUBMODULE.TOOL_USER_MANAGEMENT,
                responseType: 'arraybuffer'
            };
            this.vscodeService.get(option, (res: any) => {
                const message = {
                    cmd: 'downloadFile',
                    data: {
                        fileName: str + '.zip',
                        fileContent: res,
                        invokeLocalSave: true,
                        contentType: 'arraybuffer'
                    }
                };
                this.vscodeService.postMessage(message, null);
            });
        }
    }


    /**
     * 查询运行日志列表
     *
     */
    showRunningLogList() {
        this.logList = [];
        this.fileList = [];
        const option = {
            url: '/run-logs/',
            subModule: VscodeService.PERF_SUBMODULE.TOOL_USER_MANAGEMENT,
        };
        this.vscodeService.get(option, (data: any) => {
            if (data.data.logs) {
                this.fileList = data.data.logs.file_name;
                data.data.logs.file_name.forEach((item, index) => {
                    const itemObj = { name: '', size: '' };
                    itemObj.name = item;
                    itemObj.size = data.data.logs.file_size[index];
                    this.logList.push(itemObj);
                });
            }
        });
    }
}
