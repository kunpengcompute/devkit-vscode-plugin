import { Component, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { I18nService } from '../service/i18n.service';
import { TiTableRowData, TiTableColumns, TiTableSrcData } from '@cloud/tiny3';
import { MytipService } from '../service/mytip.service';
import { VscodeService, COLOR_THEME } from '../service/vscode.service';
import { UtilsService } from '../service/utils.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService } from '../service/message.service';
import { MIGRATION_SERVER_STATUS } from '../migration-detail/migration-detail.component';

const SUB_LOGIN_FIRST = '1';
const REPORT_ID_RADIX = 10;
/**
 * 消息返回状态
 */
const enum STATUS {
    SUCCESS = 0,
    RUNNING = 1
}

@Component({
    selector: 'app-migration-center',
    templateUrl: './migration-center.component.html',
    styleUrls: ['./migration-center.component.scss']
})
export class MigrationCenterComponent implements OnInit, AfterViewInit {
    @ViewChild('migrationTip', { static: false }) migrationTip: { Close: () => void; Open: () => void; };
    @ViewChild('migrationModal', { static: false }) migrationModal: { Close: () => void; Open: () => void; };

    public i18n: any;
    public isClick = 0;
    public firstSort = '';
    public currLang = '';

    public currTheme = COLOR_THEME.Dark;

    public displayed: Array<TiTableRowData> = []; // 表示表格实际呈现的数据（开发者默认设置为[]即可）
    public srcData: TiTableSrcData;
    public secondSortData: Array<TiTableRowData> = [];
    public columns: Array<TiTableColumns> = [];
    public sortLabels: Map<string, string>;
    public firstSortData: Array<any> = [];

    // intelliJ调用标识
    intelliJFlagDef = false;

    // 迁移前必读相关
    public needFlag = true;
    public flag = false;
    public custPath = '';
    // 分页
    public currentPage = 1;
    public totalNumber: number;
    public pageSize: { options: Array<number>, size: number } = {
        options: [5, 10, 20, 50, 100],
        size: 10
    };
    public ColorTheme = {
        Dark: COLOR_THEME.Dark,
        Light: COLOR_THEME.Light
    };
    public backParams: Array<any> = [];
    public taskId: any;
    public showLoading = false;
    public dataSuccess = false;
    public isRunning = false;
    public pluginUrlCfg: any = {};
    public fromPage = '';

    constructor(
        public i18nService: I18nService,
        public router: Router,
        public route: ActivatedRoute,
        public mytip: MytipService,
        public vscodeService: VscodeService,
        public utilsService: UtilsService,
        public changeDetectorRef: ChangeDetectorRef,
        private msgService: MessageService,
    ) {
        this.i18n = this.i18nService.I18n();
    }

    /**
     * 组件初始化
     */
    ngOnInit() {
        // 获取全局url配置数据
        this.vscodeService.postMessage({ cmd: 'readUrlConfig' }, (resp: any) => {
            this.pluginUrlCfg = resp;
        });
        this.currLang = this.getWebViewSession('language');

        this.getTaskName();

        this.columns = [
            { title: this.i18n.plugins_porting_migration_table_label1, width: '10%' },
            { title: this.i18n.plugins_porting_migration_table_label2, width: '10%' },
            { title: this.i18n.plugins_porting_migration_table_label3, width: '70%' },
            { title: this.i18n.plugins_porting_migration_table_label4, width: '10%' }
        ];

        this.sortLabels = new Map<string, string>([
            ['BD', this.i18n.plugins_porting_migration_sort_BD],
            ['MS', this.i18n.plugins_porting_migration_sort_MS],
            ['DS', this.i18n.plugins_porting_migration_sort_DS],
            ['DB', this.i18n.plugins_porting_migration_sort_DB],
            ['NW', this.i18n.plugins_porting_migration_sort_NW],
            ['RTL', this.i18n.plugins_porting_migration_sort_RTL],
            ['HPC', this.i18n.plugins_porting_migration_sort_HPC],
            ['SDS', this.i18n.plugins_porting_migration_sort_SDS],
            ['CLOUD', this.i18n.plugins_porting_migration_sort_CLOUD],
            ['NATIVE', this.i18n.plugins_porting_migration_sort_NATIVE],
            ['WEB', this.i18n.plugins_porting_migration_sort_WEB],
        ]);

        this.route.queryParams.subscribe(data => {
            this.intelliJFlagDef = data.intelliJFlag === 'true';
            this.isRunning = data.isRunning === 'true';
            this.fromPage = data.from;
            if (data && data.backParams) {
                this.backParams = data.backParams.split('_');
            }
        });

        if (this.getWebViewSession('isFirst') !== SUB_LOGIN_FIRST) {
            this.utilsService.queryDiskState();
            this.showLoading = true;
            this.getFirstSort();
        }

        if (document.body.className.indexOf('vscode-light') > -1) {
            this.currTheme = COLOR_THEME.Light;
        }

        this.vscodeService.regVscodeMsgHandler('colorTheme', (msg: any) => {
            this.currTheme = msg.colorTheme;
            this.changeDetectorRef.markForCheck();
            this.changeDetectorRef.detectChanges();
        });
        this.getCustPath();
        // 接收结束专项软件迁移任务的消息
        this.msgService.getMessage().subscribe(msg => {
            if (msg.value && msg.type === 'migrationFinished') {
                this.isRunning = false;
            }
        });
    }

    openHyperlinks(url: string) {
        // intellij走该逻辑
        if (this.intelliJFlagDef) {
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

    /**
     * 迁移前必读提示确认
     */
    public confirmMsgTip() {
        const options = {
            url: '/portadv/solution/disclaimer/'
        };
        this.vscodeService.post(options, (resp: any) => {
            if (resp.realStatus === '0x020800') {
                this.updateMigrationTip(false);
                this.migrationTip.Close();
                if (this.intelliJFlagDef) {
                    this.changeDetectorRef.markForCheck();
                    this.changeDetectorRef.detectChanges();
                }
                this.checkRunningStatus();
            } else {
                const message = {
                    cmd: 'showInfoBox',
                    data: {
                        info: this.currLang === 'zh-cn' ? resp.infochinese : resp.info,
                        type: 'error'
                    }
                };
                this.vscodeService.postMessage(message, null);
            }
        });
    }

    private updateMigrationTip(migrationTip: boolean) {
        ((self as any).webviewSession || {}).setItem('migrationTip', migrationTip);
        const getParams = {
            cmd: 'getGlobleState',
            data: {
                data: {
                    keys: ['porting' + 'Session']
                }
            }
        };
        this.vscodeService.postMessage(getParams, (data: any) => {
            data['porting' + 'Session'].migrationTip = migrationTip;
            const params = {
                cmd: 'setGlobleState',
                data: {
                    data: {
                        list: [
                            { key: 'porting' + 'Session', value: data['porting' + 'Session'] },
                        ]
                    }
                }
            };
            this.vscodeService.postMessage(params, null);
        });
    }

    /**
     * 迁移前必读提示取消
     */
    public cancelMsgTip() {
        this.migrationTip.Close();
        const message = {
            cmd: 'closePanel'
        };
        this.vscodeService.postMessage(message, null);
    }

    /**
     * 组件加载后处理，包括迁移前必读提示及查询正在进行的迁移任务
     */
    ngAfterViewInit() {
        // 查询是否已阅读迁移前必读提示
        const options = {
            url: '/portadv/solution/category/'
        };
        this.vscodeService.get(options, (resp: any) => {
            if (!resp.data.disclaimer) {
                this.needFlag = true;
                this.migrationTip.Open();
            } else {
                this.checkRunningStatus();
            }
        });
    }

    /**
     * 获取任务消息
     */
    private getTaskName() {
        const options = {
            url: `/task/progress/?task_type=3`
        };
        this.vscodeService.get(options, (resp: any) => {
            if (resp.status === STATUS.SUCCESS && resp.data) {
                this.taskId = resp.data ? resp.data.task_name : '';
            }
            if (resp.data.runningstatus === STATUS.RUNNING) {
                this.isRunning = true;
            } else {
                this.isRunning = false;
            }
        });

    }

    private checkRunningStatus() {
        if (this.fromPage === 'detail') {
            return;
        }
        const message: any = {
            cmd: 'showProgress',
            data: {
                entry: 'center',
                url: '/task/progress/?task_type=3',
                method: 'GET',
                fixPath: `${this.custPath}/portadv/`,
                reQueryState: this.isRunning ? (this.isRunning === true).toString() : 'false',
            }
        };
        if (this.taskId) {
            message.data.taskID = this.taskId;
        }
        this.vscodeService.postMessage(message, (resp: any) => {
            if (this.intelliJFlagDef && resp.data) {
                if (resp.data.runningstatus === MIGRATION_SERVER_STATUS.PROGRESS_RUNNING) {
                    this.isRunning = true;
                } else {
                    this.isRunning = false;
                }
                ((self as any).webviewSession || {}).setItem('softWare', resp.data.solution_xml);
            } else {
                if (resp.enable !== undefined) {
                    this.enableView(resp.enable);
                }
            }
            if (this.intelliJFlagDef) {
                this.changeDetectorRef.markForCheck();
                this.changeDetectorRef.detectChanges();
            }
        });
    }

    private enableView(flag: boolean) {
        if (flag) {
            this.migrationModal.Close();
        } else {
            this.migrationModal.Open();
        }
    }

    private getCustPath() {
        if (this.getWebViewSession('isFirst') !== SUB_LOGIN_FIRST) {
            const options = {
                url: '/customize/'
            };
            this.vscodeService.get(options, (resp: any) => {
                if (resp.status === STATUS.SUCCESS) {
                    this.custPath = resp.data.customize_path;
                }
            });
        }
    }

    private getWebViewSession(paramName: string) {
        return ((self as any).webviewSession || {}).getItem(paramName);
    }

    /**
     * 获取支持迁移的软件大类
     */
    public async getFirstSort() {
        const option = {
            url: '/portadv/solution/category/'
        };
        this.vscodeService.get(option, (data: any) => {
            if (data.status === STATUS.SUCCESS) {
                if (data.data.category.length) {
                    data.data.category.forEach((el: any) => {
                        this.add2FirstSortData(el);
                    });
                    if (this.backParams.length > 0) {
                        this.showSecondData(this.backParams[0], this.backParams[1]);
                    } else {
                        this.showSecondData(data.data.category[0], 0);
                    }
                }
            } else {
                this.showAlertInfo(data, 'warn');
            }
        });
        if (this.intelliJFlagDef) {
            while (!this.dataSuccess) {
                await this.sleep(10);
            }
            this.changeDetectorRef.markForCheck();
            this.changeDetectorRef.detectChanges();
        }

    }
    /**
     * 等待指定的时间
     * @param ms 等待时间
     */
    private async sleep(ms: number) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve('');
            }, ms);
        });
    }
    private add2FirstSortData(el: any) {
        this.firstSortData.push({
            key: el,
            label: this.sortLabels.get(el)
        });
    }

    /**
     * 获取支持的迁移软件详情
     * @param item 大类
     * @param index 索引
     */
    public async showSecondData(item: any, index: number) {
        this.showLoading = true;

        this.dataSuccess = false;
        this.isClick = index;
        this.firstSort = item;
        const option = {
            url: `/portadv/solution/basicinfo/?category=${encodeURIComponent(item)}`
        };
        this.vscodeService.get(option, (data: any) => {
            if (data.status === STATUS.SUCCESS) {
                this.secondSortData = data.data.software;
                this.totalNumber = data.data.software.length;
                if (this.backParams.length > 0) {
                    setTimeout(() => {
                        this.pageSize.size = parseInt(this.backParams[2], REPORT_ID_RADIX);
                    }, 0);
                    setTimeout(() => {
                        this.currentPage = parseInt(this.backParams[3], REPORT_ID_RADIX);
                    }, 0);
                }
                this.srcData = {
                    data: this.secondSortData,
                    state: {
                        searched: false, // 源数据未进行搜索处理
                        sorted: false, // 源数据未进行排序处理
                        paginated: false // 源数据未进行分页处理
                    }
                };
                setTimeout(() => {
                    $('.ti3-resize-wrapper a').on('click', (e) => {
                        $(e.target).addClass('visited');
                    });
                }, 500);
            } else {
                this.showAlertInfo(data, 'warn');
            }

            this.showLoading = false;
            this.dataSuccess = true;
        });
        if (this.intelliJFlagDef) {
            while (!this.dataSuccess) {
                await this.sleep(10);
            }
            this.changeDetectorRef.markForCheck();
            this.changeDetectorRef.detectChanges();
        }
    }

    showAlertInfo(data: any, type: any) {
        if (this.intelliJFlagDef) {
            let info = '';
            if (this.currLang === 'zh-cn') {
                info = data.infochinese;
            } else {
                info = data.info;
            }
            const message = {
                cmd: 'showInfoBox',
                data: {
                    info,
                    type
                }
            };
            this.vscodeService.postMessage(message, null);
        } else {
            if (this.currLang === 'zh-cn') {
                this.mytip.alertInfo({ type, content: data.infochinese, time: 10000, web: 'migration' });
            } else {
                this.mytip.alertInfo({ type, content: data.info, time: 10000, web: 'migration' });
            }
        }
    }

    /**
     * 跳转到软件迁移详情界面
     * @param item 软件信息
     */
    public showDetail(item: any) {
        const params = {
            queryParams: {
                software: `${this.firstSort}_${item.name}_${item.version}_${item.type}`,
                backParams: `${this.firstSort}_${this.isClick}_${this.pageSize.size}_${this.currentPage}`,
                intelliJFlag: this.intelliJFlagDef,
                isRunning: this.isRunning
            }
        };
        this.router.navigate(['migrationDetail'], params);
    }

}
