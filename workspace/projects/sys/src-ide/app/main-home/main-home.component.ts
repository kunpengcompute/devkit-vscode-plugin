import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AxiosService } from '../service/axios.service';
import { I18nService } from '../service/i18n.service';
import { HTTP_STATUS_CODE, VscodeService } from '../service/vscode.service';

@Component({
    selector: 'app-main-home',
    templateUrl: './main-home.component.html',
    styleUrls: ['./main-home.component.scss']
})
export class MainHomeComponent implements OnInit {

    constructor(
        public I18n: I18nService,
        public Axios: AxiosService,
        public vscodeService: VscodeService,
        private router: Router,
        private route: ActivatedRoute
    ) {
        this.i18n = I18n.I18n();
    }
    @Output() private closeIndexTab = new EventEmitter<any>();
    @Input() projectName: any;
    @Input() actionType: any;
    @Input() taskDetail: any;
    @Input() refreshItem: any;
    public i18n: any;
    public labelWidth = '225px';
    public allCanClick = false;
    public sysPerfCanClick = false;
    public javaPerfCanClick = false;
    public missionTypeDir = new Array();
    public panelId: any;

    /**
     * 初始化
     */
    ngOnInit() {
        // 查询是否安装后
        this.allCanClick = false;
        this.sysPerfCanClick = false;
        this.javaPerfCanClick = false;
        this.checkInstallInfo();
        this.route.queryParams.subscribe((data) => {
            this.panelId = data.panelId;
        });
    }

    /**
     * 关闭页签
     */
    public closeTab(e: any) {
        this.closeIndexTab.emit(e);
    }

    /**
     * 打开创建工程页面
     */
    public openNewProject() {
        if (this.allCanClick || this.sysPerfCanClick) {
            this.router.navigate(['createProject'], {
                queryParams: {
                    projectName: this.i18n.plugins_sysperf_term_new_project,
                    isGuideCreate: true,
                    panelId: this.panelId
                }
            });
        }
    }

    /**
     * 打开添加Guardian页面
     */
    public openNewGuardian() {
        if (this.allCanClick || this.javaPerfCanClick) {
            this.vscodeService.postMessage({
                cmd: 'navigateToPanel',
                data: {
                    navigate: 'targetEnviroment',
                    params: { innerItem: 'targetEnviroiment' }
                }
            }, null);
        }
    }

    /**
     * 获取后台服务器安装的工具信息
     */
    checkInstallInfo() {
        const option = {
            url: '/users/install-info/',
            subModule: VscodeService.PERF_SUBMODULE.TOOL_USER_MANAGEMENT
        };
        this.vscodeService.get(option, (data: any) => {
            if (data.code === HTTP_STATUS_CODE.USERMANAGE_SUCCESS) {
                if (data.data.data === 'all') {
                    this.allCanClick = true;
                } else if (data.data.data === 'sys_perf') {
                    this.sysPerfCanClick = true;
                } else if (data.data.data === 'java_perf') {
                    this.javaPerfCanClick = true;
                }
            } else {
                if (self.webviewSession.getItem('language') === 'zh-cn') {
                    this.vscodeService.showInfoBox(data.message, 'warn');
                } else {
                    this.vscodeService.showInfoBox(data.code, 'warn');
                }
            }
        });
    }
}
