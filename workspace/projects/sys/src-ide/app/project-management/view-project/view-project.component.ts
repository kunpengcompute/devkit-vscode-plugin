import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { TiTableColumns, TiTableRowData, TiTableSrcData, TiValidators } from '@cloud/tiny3';
import { Router, ActivatedRoute } from '@angular/router';
import { I18nService } from '../../service/i18n.service';
import { VscodeService, } from '../../service/vscode.service';
import { FormBuilder, FormControl } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
@Component({
    selector: 'app-view-project',
    templateUrl: './view-project.component.html',
    styleUrls: ['./view-project.component.scss']
})
export class ViewProjectComponent implements OnInit {
    public myMask = false;
    public i18n: any;
    public projectInfoForm;
    public projectInfoFormGroup;
    public currentScene: any;
    public sceneId = 11;
    public sceneIds = {};  // scene id 信息列表，修改工程和查看工程根据Id就可知晓要做哪些
    constructor(
        public sanitizer: DomSanitizer,
        private route: ActivatedRoute,
        private router: Router,
        private i18nService: I18nService,
        private vscodeService: VscodeService,
        public changeDetectorRef: ChangeDetectorRef
    ) {
        this.i18n = this.i18nService.I18n();
        this.projectInfoForm = {
            scene: {  // 场景类型
                label: this.i18n.project.scenario,
                required: true,
                list: [],
                change: sceneValue => {
                    this.currentScene = sceneValue.prop.toLowerCase();
                },
            },
            component: {  // 组件
                label: this.i18n.project.component,
                required: true,
                placeholder: this.i18n.project.selectAComponent,
                list: [],
                change: value => {
                    this.projectInfoFormGroup.get('applicationScenario').reset();
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
                change: value => {
                    this.projectInfoFormGroup.get('storageTypeDetail').reset();
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
        this.projectInfoFormGroup = new FormBuilder().group({
            scene: new FormControl('', TiValidators.required),
            component: new FormControl('', TiValidators.required),
            applicationScenario: new FormControl('', TiValidators.required),
            storageType: new FormControl('', TiValidators.required),
            storageTypeDetail: new FormControl('', TiValidators.required),
            databaseType: new FormControl('', TiValidators.required)
        });
        this.getScene();
        // 禁止复用路由
        this.router.routeReuseStrategy.shouldReuseRoute = () => {
            return false;
        };
    }

    // agent节点表格
    public srcAgentNodeData: TiTableSrcData;
    public agentNodeDisplay: Array<TiTableRowData> = [];
    public checkAgentNodeList: Array<TiTableRowData> = []; // 默认选中项
    public columAgentNode: Array<TiTableColumns> = [
        {
            title: '节点名称',
            width: '30%'
        },
        {
            title: '节点状态',
            width: '10%'
        },
        {
            title: '节点IP',
            width: '15%'
        },
        {
            title: '端口',
            width: '10%'
        },
        {
            title: '用户名',
            width: '15%'
        },
        {
            title: '安装路径',
            width: '20%'
        }
    ];

    // 节点状态列表
    public nodeStatusList: any;
    // 工程名
    public projectName = '';
    // 工程ID
    public projectId: any;
    // 所属面板ID
    public panelId = '';
    // 手动查询，off时不影响token生命周期
    public autoFlag = 'off';
    public isAdmin = false;
    public isSelfProject = false;
    // 当前工程场景
    /**
     * ngOnInit
     */
    ngOnInit() {
        this.route.queryParams.subscribe((data) => {
            if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
                this.projectId = data.projectId;
                this.projectName = data.projectName;
                this.panelId = data.panelId;
            } else {
                data = JSON.parse(data.sendMessage.replace(/#/g, ':'));
                this.projectId = data.projectId;
                this.projectName = data.projectName;
                this.panelId = data.panelId;
                this.isSelfProject = data.isSelfProject;
            }

        });
        this.isAdmin = VscodeService.isAdmin();
        // 初始化节点表格数据
        this.initAgentNodeDataTable();
        // 初始化节点表格数据
        if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
            this.changeDetectorRef.markForCheck();
            this.changeDetectorRef.detectChanges();
        }
    }
    /**
     * 数据回显
     */
    public show(content: any) {
        const form = this.projectInfoForm;
        const formGroup = this.projectInfoFormGroup;
        formGroup.reset();
        this.sceneIds[content.sceneId].forEach(item => {
            formGroup.get(item[0]).setValue(item[1]);
            if (item[0] === 'scene') {
                form.scene.change({ prop: item[2].sceneNumber });
            }
        });
        // 初始化节点表格数据
        if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
            this.changeDetectorRef.markForCheck();
            this.changeDetectorRef.detectChanges();
        }
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
                    imgPath_hover: './assets/img/projects/bigdata-hover.svg',
                },
                distributed_storage: {  // 分布式存储
                    order: 2,
                    prop: 'distributed_storage',
                    imgPath_normal: './assets/img/projects/steps-normal.svg',
                    imgPath_hover: './assets/img/projects/steps-hover.svg',
                },
                general_scenario: {  // 通用场景
                    order: 0,
                    checked: true,
                    prop: 'general_scenario',
                    imgPath_normal: './assets/img/projects/normal-normal.svg',
                    imgPath_hover: './assets/img/projects/normal-hover.svg',
                },
                HPC: {  // HPC
                    order: 3,
                    prop: 'hpc',
                    imgPath_normal: './assets/img/projects/bigdata-normal.svg',
                    imgPath_hover: './assets/img/projects/bigdata-hover.svg',
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

            res.data.data.forEach(scene => {
                sceneIds[scene.Id] = [['scene', scene.Id, scene]];
                if (imgPathList[scene.sceneNumber]?.prop === 'database') {
                    scene.sceneNameEn = 'Database';
                }
                sceneList.push({
                    label: language === 'en' ? scene.sceneNameEn : scene.sceneName,
                    value: scene.Id,
                    ...imgPathList[scene.sceneNumber]
                });

                if (imgPathList[scene.sceneNumber]?.prop === 'distributed_storage') {  // 分布式存储
                    storageTypeList = scene.children.map(storageType => {
                        const storageTypeOption = {
                            label: language === 'en' ? storageType.sceneNameEn : storageType.sceneName,
                            value: storageType.Id,
                            _children: []
                        };

                        sceneIds[storageType.Id] = [...sceneIds[scene.Id],
                        ['storageType', storageTypeOption, storageTypeOption]];

                        storageTypeOption._children = storageType.children[0].map(item => {  // tiny会把children改成分组样式
                            const itemOption = {
                                label: language === 'en' ? item.sceneNameEn : item.sceneName,
                                value: item.Id,
                            };

                            sceneIds[item.Id] = [...sceneIds[storageType.Id],
                            ['storageTypeDetail', itemOption, itemOption]];

                            return itemOption;
                        });

                        return storageTypeOption;
                    });
                } else if (imgPathList[scene.sceneNumber]?.prop === 'big_data') { // 大数据
                    componentList = scene.children.map(component => {
                        const componentOption = {
                            label: language === 'en' ? component.sceneNameEn : component.sceneName,
                            value: component.Id,
                            _children: []
                        };

                        sceneIds[component.Id] = [...sceneIds[scene.Id],
                        ['component', componentOption, componentOption]];

                        componentOption._children = component.children[0].map(item => {  // tiny会把children改成分组样式
                            const itemOption = {
                                label: language === 'en' ? item.sceneNameEn : item.sceneName,
                                value: item.Id,
                            };

                            sceneIds[item.Id] = [...sceneIds[component.Id],
                            ['applicationScenario', itemOption, itemOption]];

                            return itemOption;
                        });

                        return componentOption;
                    });
                } else if (imgPathList[scene.sceneNumber]?.prop === 'database') { // 数据库
                    form.databaseType.list = scene.children.map((databaseType: any) => {
                        const databaseTypeOption = {
                            label: language === 'en' ? databaseType.sceneNameEn : databaseType.sceneName,
                            value: databaseType.Id,
                        };
                        sceneIds[databaseType.Id] = [...sceneIds[scene.Id],
                        ['databaseType', databaseTypeOption, databaseTypeOption]];
                        return databaseTypeOption;
                    });
                }
            });

            form.scene.list = sceneList.sort((a, b) => a.order - b.order);
            form.component.list = componentList;
            form.storageType.list = storageTypeList;
            this.sceneIds = sceneIds;
            const optionUrl = {
                url: `/projects/${this.projectId}/info/`
            };
            this.vscodeService.get(optionUrl, (resp: any) => {
                const params = resp.data;
                this.show({
                    type: 'edit',
                    projectName: params.projectName,
                    projectId: this.projectId,
                    sceneId: params.sceneId,
                    nodeList: params.nodeList,
                });
                if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
                    this.changeDetectorRef.markForCheck();
                    this.changeDetectorRef.detectChanges();
                }
            });
            // 默认选中通用场景
            if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
                this.changeDetectorRef.markForCheck();
                this.changeDetectorRef.detectChanges();
            }
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

        this.columAgentNode[0].title = this.i18n.plugins_common_agentNodeManagement.nodeName;
        this.columAgentNode[1].title = this.i18n.plugins_common_agentNodeManagement.nodeStatus;
        this.columAgentNode[2].title = this.i18n.plugins_common_agentNodeManagement.nodeIP;
        this.columAgentNode[3].title = this.i18n.plugins_common_agentNodeManagement.nodePort;
        this.columAgentNode[4].title = this.i18n.plugins_common_agentNodeManagement.userName;
        this.columAgentNode[5].title = this.i18n.plugins_common_agentNodeManagement.installPath;
        // 节点状态列表
        this.nodeStatusList = {
            on: { text: this.i18n.plugins_common_agentNode.online, color: '#61d274' },
            off: { text: this.i18n.plugins_common_agentNode.offline, color: '#ccc' },
            init: { text: this.i18n.plugins_common_agentNodeManagement.adding, color: '#267dff' },
            lock: { text: this.i18n.plugins_common_agentNodeManagement.deleting, color: '#ffd610' },
            failed: { text: this.i18n.plugins_common_agentNode.failed, color: '#F45C5E' },
        };
        this.gettAgentNodeDetail();
    }

    /**
     * 获取agent节点详细信息
     */
    private gettAgentNodeDetail() {
        const option = {
            url: '/projects/' + this.projectId + '/info/'
        };
        this.vscodeService.get(option, (data: any) => {
            this.srcAgentNodeData.data = data.data.nodeList;
            if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
                this.changeDetectorRef.markForCheck();
                this.changeDetectorRef.detectChanges();
            }
        });
    }

    /**
     * 修改工程
     */
    public modifyProject() {
        // 跳转到修改工程面板
        this.vscodeService.postMessage({
            cmd: 'navigateToPanel',
            data: {
                navigate: 'modifyProject',
                params: { projectId: this.projectId, projectName: this.projectName }
            }
        }, null);
        if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
            this.changeDetectorRef.markForCheck();
            this.changeDetectorRef.detectChanges();
        }
    }

    /**
     * 取消修改
     */
    public cancel() {
        this.vscodeService.postMessage({
            cmd: 'updateTree',
            data: {
                closePanel: this.panelId
            }
        }, null);
    }
    /**
     * 跳转至添加节点页面
     */
    public addNode() {
        // 跳转到修改工程面板
        this.vscodeService.postMessage({
            cmd: 'navigateToPanel',
            data: {
                navigate: 'sysperfSettings',
                params: { innerItem: 'itemNodeManaga' }
            }
        }, null);
        if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
            this.changeDetectorRef.markForCheck();
            this.changeDetectorRef.detectChanges();
        }
    }
}



