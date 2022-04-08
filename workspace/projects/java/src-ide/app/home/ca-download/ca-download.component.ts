import { Component, OnInit } from '@angular/core';
import { VscodeService } from '../../service/vscode.service';
import { I18nService } from '../../service/i18n.service';

@Component({
    selector: 'app-cadownload',
    templateUrl: './ca-download.component.html',
    styleUrls: ['./ca-download.component.scss']
})
export class CaDownLoadComponent implements OnInit {

    public myMask = false;
    i18n: any;
    public currLang = '';
    public pluginUrlCfg: any = {
        java_home_openFAQ7: '',
    };

    constructor(
        public vscodeService: VscodeService,
        public i18nService: I18nService,
    ) {
        this.i18n = this.i18nService.I18n();
     }

    /**
     * 组件初始化
     */
    ngOnInit() {
        // 获取全局url配置数据
        this.vscodeService.postMessage({ cmd: 'readURLConfig' }, (resp: any) => {
            this.pluginUrlCfg = resp;
        });
        this.currLang = ((self as any).webviewSession || {}).getItem('language');
    }
    /**
     * 关闭caFileModalda弹窗
     */
     caFileModalCancel() {
        this.Close();
        const message = {
            cmd: 'closePanel'
        };
        this.vscodeService.postMessage(message, null);
        if (((self as any).webviewSession || {}).getItem('tuningOperation') === 'hypertuner') {
            this.vscodeService.showTuningInfo('cancel', 'info', 'closeCaFilePage');
        }
    }

    /**
     * 弹窗关闭
     */
    public Close() {
        this.myMask = false;
    }

    /**
     * 弹窗打开
     */
    public Open() {
        this.myMask = true;
    }

    /**
     * 忽略语言
     */
    public clearLang() {
        this.currLang = '';
    }

    /**
     * 下载ca证书
     */
    downloadCaFile() {
        this.vscodeService.get({
            url: `/certificates/download-ca/`,
            subModule: 'userManagement'
        }, (resp: any) => {
            const caFile = resp.data.ca;
            this.vscodeService.postMessage({
                cmd: 'downloadFile',
                data: {
                    fileContent: caFile,
                    fileName: 'ca.crt',
                    invokeLocalSave: false
                }
            }, (data: any) => {
                const filePath = data;
                this.vscodeService.postMessage({
                    cmd: 'openCaFile',
                    data: {
                        Path: filePath,
                    }
                }, null);
                this.showInfoBox(this.i18n.plugins_javaperf_message_cart, 'info');
            });
        });
    }

    /**
     * 发送消息给vscode, 右下角弹出提醒框
     * @param info info
     * @param type type
     */
     showInfoBox(info: any, type: any) {
        const message = {
            cmd: 'showInfoBox',
            data: {
                info,
                type
            }
        };
        this.vscodeService.postMessage(message, null);
    }
    /**
     * 下载缺失包
     * @param url 路径
     */
    openUrl(url: string) {
        // intellij走该逻辑
        if (((self as any).webviewSession || {}).getItem('tuningOperation') === 'hypertuner') {
            this.vscodeService.postMessage({
                cmd: 'openHyperlinks',
                data: {
                    hyperlinks: url
                }
            }, null);
        } else {
            const a = document.createElement('a');
            a.setAttribute('href', url);
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    }
}
