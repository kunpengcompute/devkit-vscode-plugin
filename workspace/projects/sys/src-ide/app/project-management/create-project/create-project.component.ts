import { ChangeDetectorRef, Component, OnInit, NgZone, } from '@angular/core';
import { TiTableColumns, TiTableRowData, TiTableSrcData, TiValidators } from '@cloud/tiny3';
import { ActivatedRoute, Router } from '@angular/router';
import { I18nService } from '../../service/i18n.service';
import { currentTheme, VscodeService, HTTP_STATUS_CODE, COLOR_THEME } from '../../service/vscode.service';
import { MessageService } from '../../service/message.service';
import { FormBuilder, FormControl } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { TaskStatus } from 'sys/src-com/app/domain';
/**
 * 场景枚举
 */
const enum SENCE_VALUE {
    GENERAL_SCENARIO = 11,
    HPC = 201
}
@Component({
    selector: 'app-create-project',
    templateUrl: './create-project.component.html',
    styleUrls: ['./create-project.component.scss']
})
export class CreateProjectComponent implements OnInit {
    static MAX_NODE_ALLOW = 101;
    private isFirstChange = true;
    public myMask = false;
    public i18n: any;
    public projectInfoForm;
    public projectInfoFormGroup;
    public currentScene: any;
    public sceneId = 11;
    public sceneIds = {};  // scene id 信息列表，修改工程和查看工程根据Id就可知晓要做哪些
    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private i18nService: I18nService,
        private vscodeService: VscodeService,
        public sanitizer: DomSanitizer,
        private msgService: MessageService,
        private zone: NgZone,
        public changeDetectorRef: ChangeDetectorRef,
    ) {
        this.i18n = this.i18nService.I18n();
        this.projectInfoForm = {
            scene: {  // 场景类型
                label: this.i18n.project.scenario,
                required: true,
                list: [],
                change: (sceneValue: any) => {
                    this.currentScene = sceneValue.prop;
                    if (this.currentScene === 'big_data') {
                        this.projectInfoFormGroup = new FormBuilder().group({
                            component: new FormControl('', TiValidators.required),
                            applicationScenario: new FormControl('', TiValidators.required),
                        });
                    } else if (this.currentScene === 'distributed_storage') {
                        this.projectInfoFormGroup = new FormBuilder().group({
                            storageType: new FormControl('', TiValidators.required),
                            storageTypeDetail: new FormControl('', TiValidators.required)
                        });
                    } else if (this.currentScene === 'general_scenario') {
                        this.projectInfoFormGroup = new FormBuilder().group({});
                    } else if (this.currentScene === 'database') {
                        this.projectInfoFormGroup = new FormBuilder().group({
                            databaseType: new FormControl('', TiValidators.required)
                        });
                    }
                    if (this.currentScene === 'HPC') {
                        this.nodeNumLimit = 101;
                        this.projectInfoFormGroup = new FormBuilder().group({});
                        if (this.isFirstChange) {
                            this.checkHpcNodeList = this.srcAgentNodeData.data.filter(node => {
                                return TaskStatus.On === node.nodeStatus;
                            }).map((item) => item.id);
                            this.isFirstChange = false;
                        }
                    } else {
                        this.nodeNumLimit = 10;
                        this.nodeList = '';
                    }
                    this.onNodeStatusSelect(this.isSelected);
                    this.updateWebViewPage();
                },
            },
            component: {  // 组件
                label: this.i18n.project.component,
                required: true,
                placeholder: this.i18n.project.selectAComponent,
                list: [],
                change: value => {
                    this.projectInfoFormGroup.get('applicationScenario').reset();
                    this.projectInfoFormGroup.get('applicationScenario').
                        setValue(this.projectInfoFormGroup.get('component').value._children[0]);
                    this.updateWebViewPage();
                },
            },
            applicationScenario: {  // 应用场景
                label: this.i18n.project.applicationScenario,
                required: true,
                placeholder: this.i18n.project.selectAnApplicationScenario,
                list: [],
            },
            storageType: {  // 存储类型
                label: this.i18n.project.storageType,
                required: true,
                placeholder: this.i18n.project.selectStorageType,
                list: [],
                value: '',
                change: value => {
                    this.projectInfoFormGroup.get('storageTypeDetail').reset();
                    this.projectInfoFormGroup.get('storageTypeDetail').
                        setValue(this.projectInfoFormGroup.get('storageType').value._children[0]);
                    this.updateWebViewPage();
                },
            },
            storageTypeDetail: {  // 存储类型
                label: '',
                required: true,
                placeholder: '',
                list: [],
            },
            // 数据库类型
            databaseType: {
                label: this.i18n.project.databaseType,
                required: true,
                placeholder: this.i18n.project.databasePlaceholder,
                list: [],
            },
        };
        this.projectInfoFormGroup = new FormBuilder().group({});
        this.getScene();
        // 禁止复用路由
        this.router.routeReuseStrategy.shouldReuseRoute = () => {
            return false;
        };
    }

    // agent节点表格
    public srcAgentNodeData: TiTableSrcData;
    public agentNodeDisplay: Array<TiTableRowData> = [];
    public checkAgentNodeList: Array<number> = []; // 默认选中项
    public checkHpcNodeList: Array<number> = []; // hpc选中项
    public checkOtherNodeList: Array<number> = []; // 其它选中项
    public allNodeIds: Array<number> = [];
    public columAgentNode: Array<TiTableColumns> = [];

    // 节点状态列表
    public nodeStatusList: any;
    public nodeList: any;
    // 新建工程名
    public projectName = '';


    // 当前用户类型
    public isAdmin = false;
    public errorNameMessage = '';
    public errorNameMessageFlag = false;

    // 手动查询，off时不影响token生命周期
    public autoFlag = 'off';
    public isGuideCreate: boolean; // 判断是否通过引导页进入创建工程
    public panelId: any;
    public noNodeData = '--';

    public colorTheme = {
        Dark: COLOR_THEME.Dark,
        Light: COLOR_THEME.Light
    };
    public currTheme: COLOR_THEME;
    public isSelected = false; // 表格展示数据方式
    private originNodeList: any[];
    public originTotal = 0;
    public currentPage = 1;
    public totalNumber = 0;
    public pageSize: { options: Array<number>, size: number } = {
        options: [10, 20, 50],
        size: 10
    };
    public search = {
        words: ['', ''],
        keys: ['nickName', 'nodeIp'],
    };
    public nodeNumLimit = 10;
    private srcAgentNodeDataCopy: TiTableSrcData;
    public isIntellij = ((self as any).webviewSession || {}).getItem('tuningOperation') === 'hypertuner';
    /**
     * ngOnInit
     */
    ngOnInit() {
        // 获取VSCode当前主题颜色
        this.currTheme = currentTheme();
        // VSCode主题颜色切换时调用
        this.vscodeService.regVscodeMsgHandler('colorTheme', (msg: any) => {
            this.currTheme = msg.colorTheme;
        });

        this.currentScene = 'general_scenario';
        // 接收通知刷新工程页面数据
        this.msgService.getMessage().subscribe(msg => {
            if (msg && msg.type && msg.type.indexOf('createProject') !== -1) {
                this.gettAgentNodeDetail();
            }
        });
        this.route.queryParams.subscribe((data) => {
            if (data.isGuideCreate === 'true') {  // 主页进入新建工程页面
                this.isGuideCreate = true;
                this.panelId = data.panelId;
                // 更新panel标题
                this.vscodeService.postMessage({
                    cmd: 'optProjectSuccess',
                    data: {
                        project: {
                            title: this.i18n.plugins_sysperf_term_new_project,
                        }
                    }
                }, null);
            } else {
                this.isGuideCreate = false;
            }
        });
        this.errorNameMessage = this.i18n.common_term_projiect_name_tip;
        // 节点状态列表
        this.nodeStatusList = {
            on: { text: this.i18n.plugins_common_agentNode.online, color: '#61d274' },
            off: { text: this.i18n.plugins_common_agentNode.offline, color: '#ccc' },
            init: { text: this.i18n.plugins_common_agentNodeManagement.adding, color: '#267dff' },
            lock: { text: this.i18n.plugins_common_agentNodeManagement.deleting, color: '#ffd610' },
            failed: { text: this.i18n.plugins_common_agentNode.failed, color: '#F45C5E' },
        };
        this.columAgentNode = [
            {
                key: '',
                title: ''
            },
            {
                key: 'nickName',
                title: this.i18n.plugins_common_agentNodeManagement.nodeName,
                width: '30%'
            },
            {
                key: 'nodeStatus',
                title: this.i18n.plugins_common_agentNodeManagement.nodeStatus,
                width: '10%',
                options: Object.keys(this.nodeStatusList).map(key => {
                    const label = this.nodeStatusList[key].text;
                    return { key, label };
                }),
                multiple: true,
                selected: [],
            },
            {
                key: 'nodeIp',
                title: this.i18n.plugins_common_agentNodeManagement.nodeIP,
                width: '15%'
            },
            {
                title: this.i18n.plugins_common_agentNodeManagement.nodePort,
                width: '10%'
            },
            {
                title: this.i18n.plugins_common_agentNodeManagement.userName,
                width: '15%'
            },
            {
                title: this.i18n.plugins_common_agentNodeManagement.installPath,
                width: '20%'
            }
        ];
        this.isAdmin = VscodeService.isAdmin();
        this.initAgentNodeDataTable();
        this.updateWebViewPage();
    }
    /**
     * 工程名校验
     */
    public checkProjectName() {
        this.projectName = this.projectName.trim();
        if (!this.projectName) {
            this.errorNameMessage = this.i18n.plugins_common_term_project_name_cannot_empty;
            this.errorNameMessageFlag = true;
        } else {
            const reg = new RegExp(/^[\w\@\#\$\%\^\&\*\(\)\[\]\<\>\.\-\!\~\+\s]{1,32}$/);
            this.errorNameMessage = this.i18n.common_term_projiect_name_tip;
            this.errorNameMessageFlag = !reg.test(this.projectName);
        }
    }

    onNodeStatusSelect(bool: boolean) {
        // 从每一行进行过滤筛选
        this.srcAgentNodeData.data = this.originNodeList.filter((rowData: TiTableRowData) => {
            // 遍历所有列
            for (const columnData of this.columAgentNode) {
                // 只有筛选列有选中项时进行筛选，如果某一筛选列选中项不包含当前行数据，则跳出循环
                if (columnData.selected && columnData.selected.length) {
                    const index: number = columnData.selected.findIndex((item: any) => {
                        return item.key === rowData[columnData.key];
                    });
                    if (index < 0) {
                        return false;
                    }
                }
            }

            return true;
        });
        this.selectClick(bool, this.srcAgentNodeData.data);
    }

    /**
     * 获取应用场景列表
     */
    public getScene() {
        const option = {
            url: '/projects/scene/'
        };
        this.vscodeService.get(option, (res: any) => {
            const imgPathList = {
                BIG_DATA: {  // 大数据
                    order: 1,
                    prop: 'big_data',
                    imgPath_normal: './assets/img/projects/bigdata-normal.svg',
                    imgPath_normal_light: './assets/img/projects/bigdata-normal-light.svg',
                    imgPath_hover: './assets/img/projects/bigdata-hover.svg',
                    imgPath_hover_light: './assets/img/projects/bigdata-hover-light.svg',
                },
                distributed_storage: {  // 分布式存储
                    order: 2,
                    prop: 'distributed_storage',
                    imgPath_normal: './assets/img/projects/steps-normal.svg',
                    imgPath_normal_light: './assets/img/projects/steps-normal-light.svg',
                    imgPath_hover: './assets/img/projects/steps-hover.svg',
                    imgPath_hover_light: './assets/img/projects/steps-hover-light.svg',
                },
                general_scenario: {  // 通用场景
                    order: 0,
                    checked: true,
                    prop: 'general_scenario',
                    imgPath_normal: './assets/img/projects/normal-normal.svg',
                    imgPath_normal_light: './assets/img/projects/normal-normal-light.svg',
                    imgPath_hover: './assets/img/projects/normal-hover.svg',
                    imgPath_hover_light: './assets/img/projects/normal-hover-light.svg',
                },
                HPC: {  // HPC
                    order: 3,
                    prop: 'HPC',
                    imgPath_normal: './assets/img/projects/hpc_normal.svg',
                    imgPath_normal_light: './assets/img/projects/hpc_normal-light.svg',
                    imgPath_hover: './assets/img/projects/hpc_hover.svg',
                    imgPath_hover_light: './assets/img/projects/hpc_hover-light.svg',
                },
                // 数据库
                Database: {
                    order: 4,
                    prop: 'database',
                    imgPath_normal: './assets/img/projects/database-normal.svg',
                    imgPath_normal_light: './assets/img/projects/database-normal-light.svg',
                    imgPath_hover: './assets/img/projects/database-hover.svg',
                    imgPath_hover_light: './assets/img/projects/database-hover-light.svg',
                },
            };
            const language = I18nService.getLang() ? 'en' : 'zh';
            const form = this.projectInfoForm;
            const formGroup = this.projectInfoFormGroup;
            const sceneIds = {};

            const sceneList = []; // 场景类型
            let componentList = []; // 组件
            let storageTypeList = [];  // 存储类型
            res.data.data.forEach((scene, index) => {
                if (Object.keys(imgPathList).includes(scene.sceneNumber)) {
                    sceneIds[scene.Id] = [['scene', scene.Id, scene]];
                    if (imgPathList[scene.sceneNumber]?.prop === 'database') {
                        scene.sceneNameEn = 'Database';
                    }
                    sceneList.push({
                        label: language === 'en' ? scene.sceneNameEn : scene.sceneName,
                        value: scene.Id,
                        ...imgPathList[scene.sceneNumber]
                    });
                    if (imgPathList[scene.sceneNumber].prop === 'distributed_storage') {  // 分布式存储
                        storageTypeList = scene.children.map(storageType => {
                            const storageTypeOption = {
                                label: language === 'en' ? storageType.sceneNameEn : storageType.sceneName,
                                value: storageType.Id,
                                _children: []
                            };
                            sceneIds[storageType.Id] =
                                [...sceneIds[scene.Id], ['storageType', storageTypeOption, storageTypeOption]];

                            storageTypeOption._children = storageType.children[0].map(item => {  // tiny会把children改成分组样式
                                const itemOption = {
                                    label: language === 'en' ? item.sceneNameEn : item.sceneName,
                                    value: item.Id,
                                };

                                sceneIds[item.Id] =
                                    [...sceneIds[storageType.Id], ['storageTypeDetail', itemOption, itemOption]];

                                return itemOption;
                            });

                            return storageTypeOption;
                        });
                    } else if (imgPathList[scene.sceneNumber].prop === 'big_data') { // 大数据
                        componentList = scene.children.map(component => {
                            const componentOption = {
                                label: language === 'en' ? component.sceneNameEn : component.sceneName,
                                value: component.Id,
                                _children: []
                            };

                            sceneIds[component.Id] =
                                [...sceneIds[scene.Id], ['component', componentOption, componentOption]];

                            componentOption._children = component.children[0].map(item => {  // tiny会把children改成分组样式
                                const itemOption = {
                                    label: language === 'en' ? item.sceneNameEn : item.sceneName,
                                    value: item.Id,
                                };

                                sceneIds[item.Id] =
                                    [...sceneIds[component.Id], ['applicationScenario', itemOption, itemOption]];

                                return itemOption;
                            });

                            return componentOption;
                        });
                    } else if (imgPathList[scene.sceneNumber].prop === 'database') { // 数据库
                        form.databaseType.list = scene.children.map((databaseType: any) => {
                            const databaseTypeOption = {
                                label: language === 'en' ? databaseType.sceneNameEn : databaseType.sceneName,
                                value: databaseType.Id,
                            };
                            sceneIds[databaseType.Id] =
                                [...sceneIds[scene.Id], ['databaseType', databaseTypeOption, databaseTypeOption]];
                            return databaseTypeOption;
                        });
                    }
                }
            });
            form.scene.list = sceneList.sort((a, b) => a.order - b.order);
            form.component.list = componentList;
            form.storageType.list = storageTypeList;
            this.sceneIds = sceneIds;
            this.updateWebViewPage();
            // 默认选中通用场景
        });
    }
    /**
     * 初始化AgentNodeDataTable表数据
     */
    private initAgentNodeDataTable() {
        this.srcAgentNodeData = {
            data: this.agentNodeDisplay,
            state: {
                searched: false,
                sorted: false,
                paginated: false
            }
        };

        this.columAgentNode[1].title = this.i18n.plugins_common_agentNodeManagement.nodeName;
        this.columAgentNode[2].title = this.i18n.plugins_common_agentNodeManagement.nodeStatus;
        this.columAgentNode[3].title = this.i18n.plugins_common_agentNodeManagement.nodeIP;
        this.columAgentNode[4].title = this.i18n.plugins_common_agentNodeManagement.nodePort;
        this.columAgentNode[5].title = this.i18n.plugins_common_agentNodeManagement.userName;
        this.columAgentNode[6].title = this.i18n.plugins_common_agentNodeManagement.installPath;
        this.gettAgentNodeDetail();
    }

    /**
     * 获取agent节点详细信息
     */
    private gettAgentNodeDetail() {
        let urlstr = '/nodes/?auto-flag='
            + this.autoFlag + '&page='
            + 1 + '&per-page='
            + CreateProjectComponent.MAX_NODE_ALLOW;
        if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
            urlstr = '/nodes/?auto-flag=' + this.autoFlag +
                '&page=' + this.currentPage + '&per-page=' + this.pageSize.size;
        }
        const option = {
            url: urlstr
        };
        this.vscodeService.get(option, (data: any) => {
            this.autoFlag = 'on';
            this.srcAgentNodeData.data = data.data.nodeList;
            this.originNodeList = JSON.parse(JSON.stringify(this.srcAgentNodeData.data));
            this.allNodeIds = this.srcAgentNodeData.data.map(item => item.id);
            this.totalNumber = this.originTotal = data.data.totalCounts;

            this.onNodeStatusSelect(this.isSelected);
            this.updateWebViewPage();
        });
    }
    /**
     * 创建新工程
     */
    public createProject() {
        this.checkAgentNodeList = this.currentScene === 'HPC' ? this.checkHpcNodeList : this.checkOtherNodeList;

        const formGroup = this.projectInfoFormGroup;
        if (this.currentScene === 'big_data') {
            this.sceneId = formGroup.get('applicationScenario').value.value;
        } else if (this.currentScene === 'distributed_storage') {
            this.sceneId = formGroup.get('storageTypeDetail').value.value;
        } else if (this.currentScene === 'general_scenario') {
            this.sceneId = SENCE_VALUE.GENERAL_SCENARIO;
        } else if (this.currentScene === 'HPC') {
            this.sceneId = SENCE_VALUE.HPC;
        } else if (this.currentScene === 'database') {
            this.sceneId = formGroup.get('databaseType').value.value;
        }
        const option = {
            url: '/projects/',
            params: {
                projectName: this.projectName,
                nodeList: this.checkAgentNodeList,
                sceneId: this.sceneId
            }
        };
        this.vscodeService.post(option, (data: any) => {
            if (data.code === HTTP_STATUS_CODE.SYSPERF_SUCCESS) {
                // hypertuner逻辑
                if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
                    this.vscodeService.showTuningInfo(data.message, 'info', 'createProject');
                } else { // vscode逻辑
                    if (!this.isGuideCreate) {
                        this.vscodeService.postMessage({
                            cmd: 'updateTree',
                            data: {
                                closePanel: 'createProject',
                                type: 'info',
                                info: this.i18nService.I18nReplace(this.i18n.plugins_term_project_add_success, {
                                    0: this.projectName
                                })
                            }
                        }, null);
                    } else {  // 进入新建分析任务引导页
                        this.vscodeService.postMessage({
                            cmd: 'updateTree',
                            data: {
                                type: 'info',
                                info: this.i18nService.I18nReplace(this.i18n.plugins_term_project_add_success, {
                                    0: this.projectName
                                })
                            }
                        }, null);
                        const param = {
                            queryParams: {
                                projectName: this.projectName,
                                panelId: this.panelId,
                                projectId: data.data.id,
                                operation: 'createTask',
                                isGuideCreate: this.isGuideCreate
                            }
                        };
                        // 跳转引导创建分析任务界面
                        this.router.navigate(['createProjectLater'], param);
                    }
                }
            } else {
                if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
                    this.vscodeService.showTuningInfo(data.message, 'error', 'createProject');
                } else {
                    this.vscodeService.showInfoBox(data.message, 'error');
                }
            }
        });
    }

    /**
     * 跳转至添加节点页面
     */
    public addNode() {
        // 跳转到修改工程面板
        if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
            this.vscodeService.showTuningInfo('addNode', 'info', 'addNode');
        } else {
            this.vscodeService.postMessage({
                cmd: 'navigateToPanel',
                data: {
                    navigate: 'sysperfSettings',
                    params: { innerItem: 'itemNodeManaga' }
                }
            }, null);
        }
    }

    /**
     * IntellIj刷新webview页面
     */
    public updateWebViewPage() {
        if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
            this.zone.run(() => {
                this.changeDetectorRef.checkNoChanges();
                this.changeDetectorRef.detectChanges();
            });
        }
    }
    public selectClick(bool: boolean, nodeList: Array<any> = this.originNodeList) {
        this.isSelected = bool;
        this.checkAgentNodeList = this.currentScene === 'HPC' ? this.checkHpcNodeList : this.checkOtherNodeList;
        if (bool) {
            this.srcAgentNodeData.data = nodeList.filter(node => {
                return this.checkAgentNodeList.includes(node.id);
            });
            if ( this.checkAgentNodeList.length <= 10) {
                    this.currentPage = 1;
                }
        }

        // 如果节点列表和刷新数据之前选中列表不为空，那么把选择中的节点重新勾选上
        if (this.srcAgentNodeData.data.length > 0 && this.checkAgentNodeList.length > 0) {
            if (this.currentScene === 'HPC') {
                this.checkHpcNodeList = this.checkAgentNodeList;
            } else {
                this.checkOtherNodeList = this.checkAgentNodeList;
            }
        }
        this.totalNumber = this.srcAgentNodeData.data.length;
    }
}
