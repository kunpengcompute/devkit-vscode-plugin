import { Component, OnInit } from '@angular/core';
import { I18nService } from '../../service/i18n.service';
import { VscodeService, COLOR_THEME } from '../../service/vscode.service';
import { TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';

@Component({
    selector: 'app-javaperf-secret-key',
    templateUrl: './javaperf-secret-key.component.html',
    styleUrls: ['./javaperf-secret-key.component.scss']
})
export class JavaperfSecretKeyComponent implements OnInit {
    constructor(
        public vscodeService: VscodeService,
        public i18nService: I18nService
    ) {
        this.i18n = this.i18nService.I18n();
        this.columns = [
            {
                title: this.i18n.newHeader.certificate.certName,
                sortKey: 'certName',
                width: '20%'
            },
            {
                title: this.i18n.newHeader.certificate.certType,
                sortKey: 'certType',
                width: '20%'
            },
            {
                title: this.i18n.newHeader.certificate.certValid,
                sortKey: 'certValid',
                width: '20%'
            },
            {
                title: this.i18n.newHeader.certificate.status,
                sortKey: 'status',
                width: '20%'
            }
        ];
    }
    public isOperate = false;
    public i18n: any;
    public displayed: Array<TiTableRowData> = []; // 表示表格实际呈现的数据（开发者默认设置为[]即可）
    public srcData: TiTableSrcData;
    private data: Array<TiTableRowData> = [];
    public columns: Array<TiTableColumns> = [];
    public noDadaInfo: any;
    // 获取主题颜色
    public currTheme = COLOR_THEME.Dark;
    public ColorTheme = {
        Dark: COLOR_THEME.Dark,
        Light: COLOR_THEME.Light
    };
    public showLoading = false;

    /**
     * 组件初始化
     */
    ngOnInit() {
        if (document.body.className.indexOf('vscode-light') !== -1) {
            this.currTheme = COLOR_THEME.Light;
        }
        this.vscodeService.regVscodeMsgHandler('colorTheme', (msg: any) => {
            this.currTheme = msg.colorTheme;
        });
        // 用户角色判断
        this.isOperate = VscodeService.isAdmin();

        this.srcData = {
            data: this.data,
            state: {
                searched: false,
                sorted: false,
                paginated: false
            }
        };
        if (this.isOperate) {
            this.showLoading = true;
            this.handleGetCertData();
        }
    }
    /**
     * 获取证书数据, 获取内部通信证书自动告警时间
     */
    public handleGetCertData() {
        this.showLoading = true;
        const option = {
            url: `/tools/certificates`
        };
        this.vscodeService.get(option, (data: any) => {
            this.data = data.members.map((item: any) => {
                const certName = item.certificateName;
                const certType = item.certificateType;
                const certValid = this.handleFormatTime(item.notAfter);
                const status = item.verify;
                const statusName = this.i18n.newHeader.certificate[item.verify];
                return {
                    certName,
                    certType,
                    certValid,
                    statusName,
                    status
                };
            });
            this.srcData.data = this.data;

            this.showLoading = false;
        });
    }
    /**
     * 当前证书状态
     * @param status status
     */
    public handleCertStatus(status: string) {
        let circleColor = '';
        switch (status) {
            case 'VALID':
                circleColor = 'color-green';
                break;
            case 'EXPIRING':
                circleColor = 'color-orange';
                break;
            case 'EXPIRED':
                circleColor = 'color-red';
                break;
            case 'NONE':
                circleColor = 'color-green';
                break;
            default:
                break;
        }
        return circleColor;
    }
    /**
     * 格式化证书数据日期
     * @param time time
     */
    public handleFormatTime(time: any) {
        const date = new Date(time);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const hour = date.getHours();
        const min = date.getMinutes();
        const sec = date.getSeconds();
        const DATE = `${year}/${month < 10 ? '0' + month : month}/${day < 10 ? '0' + day : day}`;
        const TIME = `${hour < 10 ? '0' + hour : hour}:${min < 10 ? '0' + min : min}:${sec < 10 ? '0' + sec : sec}`;
        return `${DATE} ${TIME}`;
    }
}
