// 伪共享分析_create
import { Component, OnInit, ViewChild, Output, Input, EventEmitter, OnDestroy } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { I18nService } from '../../../service/i18n.service';
import { Axios2vscodeServiceService } from '../../../service/axios2vscode-service.service';
import { BaseForm } from '../../taskParams/BaseForm';
import { AllParams } from '../../taskParams/AllParams';
import { TiModalService } from '@cloud/tiny3';
import { RunUserDataObj, LaunchRunUser, PidProcess, AppAndParams, RunUser } from './../../mission-domain/index';



@Component({
    selector: 'app-task-tmpl',
    templateUrl: './task-tmpl.component.html',
    styleUrls: [
        './task-tmpl.component.scss',
        '../../mission-structure/mission-structure.component.scss',
        '../mission-node-config/mission-node-config.component.scss'
    ]
})
export class TaskTmplComponent implements OnInit {
    @Input() analysisType: string;
    @Input() labelWidth: string;
    @Input() nodeConfigShow: boolean;
    @Input() projectId: number;
    @Input() parentFormEl: any;
    @Input() appendTarget: string;
    @Input() formEl: any;
    @Input() drawerLevel: number;
    @Input() isModifySchedule: boolean;
    @Input() widthIsLimited = false;  // 表单父容器的宽度是否受限，例如在 home 界面提示信息在输入框的后面显示，在修改预约任务的drawer里面提示信息需要在输入框的下面显示
    @Input() modeAppRunUserValid: boolean;
    @Input() taskDetail: any = {
      isFromTuningHelper: false,
    };
    @Input() nodeList: Array<any>;
    /** 工程类型 */
    @Input() isHpcPro: any;
    /** 工程类型 */
    @Input() nodeSelectForm: FormGroup;

    @Output() private sendAppOrPidDisable = new EventEmitter<any>();
    @Output() private handlePidTidDisable = new EventEmitter<any>();
    @Output() sendRunUserDataObj = new EventEmitter<LaunchRunUser>();

    @ViewChild('nodeConfigModal', { static: false }) nodeConfigModal: any;

    public i18n: any;
    public analysisObject: '' | 'analysisObject_sys' | 'analysisObject_app' = '';
    public analysisMode: 'sys' | 'app' | 'pid' = 'sys';
    public runUserData: {
        runUser: boolean,
        user: string,
        password: string
    };
    public runUserDataObj: LaunchRunUser = {};

    // -- 配置节点参数 --
    public nodeConfig: any = {
        modal: undefined,
        status: false,
        displayed: ([] as Array<TiTableRowData>),
        columns: ([] as Array<TiTableColumns>),
        srcData: ({} as TiTableSrcData)
    };
    // 禁用项和解禁项
    public nodeEditListArr: any = [];
    public isIntellij: boolean = (self as any).webviewSession.getItem('tuningOperation') === 'hypertuner';
    constructor(public I18n: I18nService, public Axios: Axios2vscodeServiceService, private tiModal: TiModalService) {
        this.i18n = I18n.I18n();

        // -- 配置节点参数 --
        this.nodeConfig.columns = [
            { title: this.i18n.nodeConfig.nickName },
            { title: this.i18n.nodeConfig.node },
            { title: this.i18n.nodeConfig.status },
            { title: this.i18n.nodeConfig.action },
        ];
        this.nodeConfig.srcData = {
            data: [], // 源数据
            state: {
                searched: false, // 源数据未进行搜索处理
                sorted: false, // 源数据未进行排序处理
                paginated: false, // 源数据未进行分页处理
            },
        };
    }

    /**
     * 组件初始化
     */
    ngOnInit() {
        this.parentFormEl.formGroup.get('analysisObject').valueChanges.subscribe((val: any) => {
            // 监测分析对象的变化
            this.analysisObject = val;
            if (val === 'analysisObject_sys') {
                this.analysisMode = 'sys';
            }
        });
        this.parentFormEl.formGroup.get('analysisMode').valueChanges.subscribe((val: any) => {
            // 解开 不可改参数
            this.formEl.setElementDisabledState({
                list: this.nodeEditListArr.filter((key: any) => this.formEl.displayOrder.includes(key)),
                reason: {
                    key: 'nodeConfig',
                    des: '',
                },
                operate: 'reduce',
            });
            if (val && this.analysisObject === 'analysisObject_app') {
                this.analysisMode = val;
            } else {
                this.analysisMode = 'sys';
            }
            // 监测切换模式
            this.nodeConfig.status = false;
        });
        this.analysisObject = this.parentFormEl.formGroup.get('analysisObject').value;
        if (this.analysisObject === 'analysisObject_app') {
            this.analysisMode = this.parentFormEl.formGroup.get('analysisMode').value;
        }
    }

    // -- 导入 --
    /**
     * 初始化参数
     * @param param0 参数
     */
    public init({ params, values }: {
        params: any,  // 未将接口数据转换的taskInfo
        values: any,  // 将接口数据转换过的taskInfo
    }) {
        setTimeout(() => {  // 设置个定时器异步下，防止默认值还没设置完开始设置修改参数了
            this.formEl.setValues({
                values,
                formEl: this.formEl,
                type: 'form',
                i18n: this.i18n,
            });

            // 如果配置了节点参数
            if (params.switch) {
                this.nodeConfig.status = true;

                this.switchNodeConfig(true, params.nodeConfig);
            } else {
                this.restoreNodeConfig();
            }
        }, 10);
    }

    // -- 导出 --
    /**
     * 导出参数【获取任务数据】
     */
    public getTaskData({ extendParams, runUserData }: {
        extendParams: object, runUserData: { runUser: boolean, user: string, password: string } // 需要扩展加上的参数
    }) {
        this.runUserData = runUserData;
        const values = this.formEl.getValues({
            formElList: [this.parentFormEl, this.formEl],
        });
        const params = this.formEl.valuesToParams({
            values,
            removeNulls: this.analysisType === 'miss_event',
            nullValue: this.analysisType === 'miss_event' ? ['', undefined, null] : [],
        });

        return new Promise((resolve, reject) => {
            const resolveParams = (nodeList: any) => {
                const taksParams = Object.assign(params, extendParams);

                resolve({
                    params: {
                        ...taksParams,
                        switch: this.nodeConfig.status,
                        nodeConfig: nodeList.map((node: any) => {
                            if (nodeList.length === 1) {
                                this.runUserDataObj[node.nodeIp] = {
                                    runUser: this.runUserData.runUser,
                                    user_name: this.runUserData.user,
                                    password: this.runUserData.password
                                };
                            }
                            let nodeParams;

                            if (node.hasConfig) {
                                const nodeEditList = this.formEl.getNodeConfigKeys({
                                    analysisObject: this.parentFormEl.formGroup.get('analysisObject').value,
                                    analysisMode: this.parentFormEl.formGroup.get('analysisMode').value,
                                });
                                const nodeValues: any = {};
                                Object.keys(node.params).forEach(key => {
                                    if (nodeEditList.includes(key)) {
                                        nodeValues[key] = node.params[key];
                                    }
                                });
                                nodeParams = this.formEl.valuesToParams({
                                    values: {
                                        ...values,
                                        ...nodeValues,
                                    },
                                    removeNulls: this.analysisType === 'miss_event',
                                    nullValue: this.analysisType === 'miss_event' ? ['', undefined, null] : [],
                                });
                            }

                            if (this.taskDetail && this.taskDetail.isFromTuningHelper) {
                              return {
                                nodeId: this.taskDetail.nodeId,
                                nickName: node.nickName,
                                task_param: {
                                  status: !!node.hasConfig,
                                  ...nodeParams ? Object.assign(nodeParams, extendParams) : taksParams,
                                }
                              };
                            }
                            return {
                                nodeId: node.id,
                                nickName: node.nickName,
                                task_param: {
                                    status: !!node.hasConfig,
                                    ...nodeParams ? Object.assign(nodeParams, extendParams) : taksParams,
                                }
                            };
                        })
                    },
                    runUserDataObj: this.runUserDataObj
                });
            };

            if (this.nodeConfig.status) { // 配置节点参数
                resolveParams(this.nodeConfig.srcData.data);
            } else {
                // 判断是否为hpc万核任务
                if (this.nodeList) {
                    resolveParams(this.nodeList);
                } else {
                    // 获取节点列表
                    this.getProjectNodes().then((res: any) => {
                        resolveParams(res.data.nodeList);
                    }).catch(error => {
                        reject(error);
                    });
                }
            }
        });
    }

    /**
     * 组件状态改变，活跃<==>不活跃
     *  1、activated：
     *    1.1、通知index组件，禁用 / 解开 不可改参数【不然切换了类型，应用和应用参数等还是禁用状态】
     */
    public componentStatusChange(componentStatus: 'activated' | 'deactivated') {
        if (componentStatus === 'activated') {
            this.sendAppOrPidDisable.emit(this.nodeConfig.status);
            this.handlePidTidDisable.emit(this.nodeConfig.status);
        }
    }

    /**
     * clear
     */
    public clear() {
        this.restoreNodeConfig();
    }

    /**
     * 还原配置节点参数
     */
    public restoreNodeConfig() {
        this.nodeConfig.status = false;
        this.switchNodeConfig(false);
    }


    // -- 配置节点参数相关 --
    /**
     * 获取节点列表
     */
    public getProjectNodes() {
        return new Promise((resolve, reject) => {
            this.Axios.axios.get(`projects/${this.projectId}/info/`).then((res: any) => {
                resolve(res);
            }).catch((error: any) => {
                reject(error);
            });
        });
    }

    /**
     * 打开 / 关闭 节点配置【计算节点参数列表】
     */
    public switchNodeConfig(val: boolean, importedNodeConfigList?: any) {
        // 如果没有配置节点参数选项，退出
        if (!this.formEl.hasNodeConfig) {
            return;
        }

        const analysisObject = this.parentFormEl.formGroup.get('analysisObject').value;
        const analysisMode = this.parentFormEl.formGroup.get('analysisMode').value;
        const nodeEditList = this.formEl.getNodeConfigKeys({ analysisObject, analysisMode });
        this.nodeEditListArr = nodeEditList;

        // 禁用 / 解开 不可改参数
        this.formEl.setElementDisabledState({
            list: nodeEditList.filter((key: any) => this.formEl.displayOrder.includes(key)),
            reason: {
                key: 'nodeConfig',
                des: '',
            },
            operate: val ? 'add' : 'reduce',
        });

        this.nodeConfig.srcData.data = [];

        if (val) {
            if (this.nodeList) {
                this.dealwithNodeConfigTableData(this.nodeList, nodeEditList, analysisMode, importedNodeConfigList);
            } else {
                // 获取节点列表
                this.getProjectNodes().then((res: any) => {
                    this.dealwithNodeConfigTableData(
                        res.data.nodeList, nodeEditList, analysisMode, importedNodeConfigList);
                }).catch(error => { });
            }
        }

        // 通知index组件，禁用 / 解开 不可改参数
        this.sendAppOrPidDisable.emit(val);
    }

    /**
     * 处理节点配置列表数据
     * @param nodeList 工程节点数据
     * @param nodeEditList 编辑列表
     * @param analysisMode 分析模式 系统/应用launch/应用attach
     * @param importedNodeConfigList 导入数据列表
     */
    private dealwithNodeConfigTableData(
        nodeList: Array<any>,
        nodeEditList: any,
        analysisMode: any,
        importedNodeConfigList: any
    ) {
        const nodeTableData: any[] = [];
        nodeList.forEach((item: any) => {
            let hasConfig = false;
            let params;
            const nodeFormEL = new BaseForm();
            const allParamsClone = nodeFormEL.deepClone(new AllParams().allParams);

            nodeFormEL.displayOrder = nodeEditList;
            nodeFormEL.displayedElementList = nodeEditList;
            nodeEditList.forEach((key: any) => {
                nodeFormEL.form[key] = allParamsClone[key];
            });
            nodeFormEL.generateFormGroup();

            // app 模式下，application，applicationParams，switchState,user_name,password参数使用两个表单来控制
            if (analysisMode === 'app') {
                nodeFormEL.displayedElementList =
                  nodeFormEL.displayedElementList.filter(
                    (key: string) =>
                      ![
                        'application',
                        'applicationParams',
                        'switchState',
                        'user_name',
                        'password',
                      ].includes(key)
                  );
                nodeFormEL.formGroup.addControl('app_params_ctrl', new FormControl());
                nodeFormEL.formGroup.addControl('run_user_password_ctrl', new FormControl());
            }
            // pid 模式下，pid参数和process_name参数需要单独使用表单控制
            if (analysisMode === 'pid') {
                nodeFormEL.displayedElementList
                    = nodeFormEL.displayedElementList.filter(key => !['pid', 'process_name'].includes(key));
                nodeFormEL.formGroup.addControl('p_t_ctrl', new FormControl());
            }

            // 导入任务
            if (importedNodeConfigList) {
                const importedNodeConfig = importedNodeConfigList.find((node: any) => node.nodeId === item.id);
                if (importedNodeConfig) {
                    hasConfig = importedNodeConfig.task_param.status;
                    params = this.formEl.paramsToValues({
                        params: importedNodeConfig.task_param,
                    });
                    nodeTableData.push({
                        id: item.id,
                        nickName: item.nickName,
                        nodeIp: item.nodeIp,
                        hasConfig,
                        params,
                        formEl: nodeFormEL,
                    });
                }
            } else {
                nodeTableData.push({
                    id: item.id,
                    nickName: item.nickName,
                    nodeIp: item.nodeIp,
                    hasConfig,
                    params,
                    formEl: nodeFormEL,
                });
            }
        });
        this.nodeConfig.srcData.data = nodeTableData;
    }

    /**
     * 打开配置参数二级框
     */
    public openConfigNodeModal(node: any) {
        let values = node.params;
        if (!node.hasConfig) {
            values = this.formEl.getValues({
                formElList: [this.parentFormEl, this.formEl],
            });
        }

        this.nodeConfig.configNode = node;
        this.nodeConfig.formEl = node.formEl;
        setTimeout(() => {
            this.nodeConfig.modal = this.tiModal.open(this.nodeConfigModal, {
                modalClass: 'nodeConfigModal',
                draggable: false
            });

            node.formEl.setValues({
                values,
                formEl: node.formEl,
                type: 'form',
                i18n: this.i18n,
            });

            if (this.parentFormEl.formGroup.get('analysisMode').value === 'app') {
                node.formEl.formGroup.controls.app_params_ctrl.setValue(({
                    app: values.application,
                    params: values.applicationParams
                } as AppAndParams));
                node.formEl.formGroup.controls.run_user_password_ctrl.setValue(({
                    runUser: values.switchState,
                    user: values.user_name,
                    password: values.password
                } as RunUser));
            }

            // pid 模式下，pid参数和process_name参数需要单独使用表单控制
            if (this.parentFormEl.formGroup.get('analysisMode').value === 'pid') {
                node.formEl.formGroup.controls.p_t_ctrl.setValue(({
                    pid: values.pid,
                    process: values.process_name,
                } as PidProcess));
            }
        }, 0);
    }

    /**
     * 回填节点配置
     */
    public setNodeParams(context: any) {
        const node = this.nodeConfig.configNode;
        const paramsInfo = node.formEl.getValues({
            formEl: node.formEl,
        });
        node.hasConfig = true;
        if (this.parentFormEl.formGroup.get('analysisMode').value === 'app') {
            const { app, params } = (node.formEl.formGroup.controls.app_params_ctrl.value as AppAndParams);
            paramsInfo.application = app;
            paramsInfo.applicationParams = params;
            const { runUser, user, password } = node.formEl.formGroup.controls
              .run_user_password_ctrl.value as RunUser;
            paramsInfo.switchState = runUser;
            paramsInfo.user_name = user;
            paramsInfo.password = password;
        }
        // pid 模式下，pid参数和process_name参数需要单独使用表单控制
        if (this.parentFormEl.formGroup.get('analysisMode').value === 'pid') {
            const { pid, process } = (node.formEl.formGroup.controls.p_t_ctrl.value as PidProcess);
            paramsInfo.pid = pid;
            paramsInfo.process_name = process;
        }
        node.params = paramsInfo;
        this.nodeConfig.displayed.forEach((item: any) => {
            this.runUserDataObj[item.nodeIp] = {
                runUser: item.params?.switchState || false,
                user_name: item.params?.switchState ? item.params.user_name : '',
                password: item.params?.password
            };
        });
        this.sendRunUserDataObj.emit(this.runUserDataObj);
        context.close();
    }

    get formValid() {
        const nodeSelectValid  = this.isHpcPro ? this.nodeSelectForm.valid : true;
        return this.parentFormEl.formGroup.valid && this.formEl.formGroup.valid && nodeSelectValid;
    }

    // 计算配置节点参数弹框的labelWidth【嵌套drawer】
    get calcLabelWidth() {
        return (drawerLevel: any) => parseInt(this.labelWidth, 10) - (drawerLevel || 0) * 32 + 'px';
    }
}
