// 性能全景分析_create
import { Component, OnInit, ViewChild, Output, Input, EventEmitter, NgZone, ChangeDetectorRef } from '@angular/core';
import { TiValidators, TiValidationConfig, TiModalService, TiMessageService } from '@cloud/tiny3';
import { FormControl, FormGroup, FormBuilder, } from '@angular/forms';
import { I18nService } from '../../service/i18n.service';
import { ScheduleTaskService } from '../../service/schedule-task.service';
import { VscodeService, HTTP_STATUS, COLOR_THEME, currentTheme } from '../../service/vscode.service';
import { PROJECT_TYPE } from '../../service/axios.service';
import { SpinnerBlurInfo } from 'projects/sys/src-ide/app/domain';
import {
    ImportedConfig, NodeInfo, Options
} from 'sys/src-com/app/mission-analysis/components/mission-node-configuration/doman';
import { CustomValidatorsService } from '../../service';
import { ProjectNodeListService } from 'sys/src-com/app/service/project-node-list.service';
import { Cat } from 'projects/hyper';

@Component({
    selector: 'app-mission-performance',
    templateUrl: './mission-performance.component.html',
    styleUrls: ['./mission-performance.component.scss']
})
export class MissionPerformanceComponent implements OnInit {
    @ViewChild('preSwitchSysA', { static: false }) preSwitchSysA: any;
    @ViewChild('createConfirmModal', { static: false }) createConfirmModal: any;
    @Output() private sendMissionKeep = new EventEmitter<any>();
    @Output() private sendPretable = new EventEmitter<any>();
    @Output() private closeTab = new EventEmitter<any>();

    @Input()
    set scenes(val: PROJECT_TYPE){
        if (null == val){
            return ;
        }
        this.scenesStash = val;
        PROJECT_TYPE.TYPE_HPC === val
            ? this.sysScenesForm.get('nodeList').enable()
            : this.sysScenesForm.get('nodeList').disable();
    }
    get scenes(){
        return this.scenesStash;
    }
    @Input() labelWidth: string;
    @Input() projectName: string;
    @Input() taskName: string;
    @Input() taskNameValid: boolean;
    @Input() isModifySchedule: boolean;
    @Input() projectId: number;
    @Input() restartAndEditId: number;
    @Input() isRestart: boolean;
    @Input() panelId: any;
    @Input() nodeConfigShow: boolean;
    @Input() nodeConfigedData: any;
    @Input() isEdit = false;
    @Input() modeProcess: any;
    @Input() modeAppValid: any;
    @Input() typeId: any;
    @Input() modePidValid: any;

    scenesStash: PROJECT_TYPE;
    analysisScene = PROJECT_TYPE;
    public i18n: any;
    // 获取主题颜色
    public currTheme = COLOR_THEME.Dark;
    public ColorTheme = {
        Dark: COLOR_THEME.Dark,
        Light: COLOR_THEME.Light
    };
    public sysForm: FormGroup;
    public sysItems: any = {};
    public currentForm: FormGroup;
    public sysScenesForm: FormGroup;
    public ifTracing = false; // 是否采集tracing数据

    public startCheckSys: any = {};   // 立即启动

    public startCheckC: any = {};

    public configCheckedTypes: Array<any> = [];

    public formDatas: any;
    public keepData: any; // 保存模板
    // 表单验证部分
    public validation: TiValidationConfig = {
        type: 'blur',
    };

    // 修改预约任务 接收从预约传来的值
    public editScheduleTask = false; // 判断是否是修改
    public scheduleTaskId: any; // 保存修改的预约任务ID

    public durationBlur: SpinnerBlurInfo;
    public intervalBlur: SpinnerBlurInfo;

    private nodeIpMap: { [nodeNickName: string]: string } = {};
    private userMessage: { [nodeIp: string]: { user_name: string, password: string } } = {};
    public startOrSaveBtnTip = '';
    public databaseConfig: any = {};

    // 数据库连接ip密码输入框类型
    public databasePasswdType = 'password';
    public nodeDatabasePasswdType = 'password';

    public nodeConfigOptions: Options;
    public importConfig: ImportedConfig;
    public nodeConfigForm: FormGroup;

    /**
     * 节点配置参数
     */
    private paramsNode: {
        switch: boolean;
        nodeConfig: {
            nickName: string;
            nodeId: number;
            task_param: any;
        }[];
    } = {
            switch: false,
            nodeConfig: []
        };

    /**
     * 预约任务开关提示
     */
    public switchTip = '';
    // 工程下节点信息
    nodeList: any[] = [];
    isSelectNodeDisabled: boolean;
    // 存储导入数据时nodeConfig参数
    nodeConfig: any[] = [];
    isLoading = true;

    constructor(
        private tiModal: TiModalService,
        private zone: NgZone,
        private tiMessage: TiMessageService,
        public I18n: I18nService,
        public fb: FormBuilder,
        public scheduleTaskServer: ScheduleTaskService,
        public changeDetectorRef: ChangeDetectorRef,
        public vscodeService: VscodeService,
        public customValidatorsService: CustomValidatorsService,
        private projectNodeListService: ProjectNodeListService) {
        this.i18n = I18n.I18n();
        // system
        this.sysForm = fb.group({
            interval: new FormControl('', {
                validators: [
                    TiValidators.required,
                    TiValidators.minValue(1),
                    TiValidators.maxValue(10),
                ],
                updateOn: 'change',
            }),
            duration: new FormControl('', {
                validators: [
                    TiValidators.required,
                    TiValidators.minValue(2),
                    TiValidators.maxValue(300),
                ],
                updateOn: 'change',
            }),
            scenes: new FormControl('', [this.customValidatorsService.checkFilePath()]),
            collectTop: new FormControl(true, {
                updateOn: 'change',
            }),
        });
        this.sysScenesForm = fb.group({
            nodeList: new FormControl([]),
            interval: new FormControl('', {
                validators: [
                    TiValidators.required,
                    TiValidators.minValue(1),
                    TiValidators.maxValue(10),
                ],
                updateOn: 'change',
            }),
            duration: new FormControl('', {
                validators: [
                    TiValidators.required,
                    TiValidators.minValue(2),
                    TiValidators.maxValue(300),
                ],
                updateOn: 'change',
            }),
            traceForm: new FormGroup({
                traceSwitch: new FormControl(false, {
                    updateOn: 'change',
                }),
                events: new FormControl('', [TiValidators.required]),
            }),
            collectTop: new FormControl(true, {
                updateOn: 'change',
            }),
            databaseConfig: new FormGroup({
                ip: new FormControl('', [TiValidators.required, TiValidators.ipv4]),
                port: new FormControl(null, [TiValidators.minValue(1), TiValidators.maxValue(65535)]),
                username: new FormControl('', [TiValidators.required]),
                password: new FormControl('', [TiValidators.required]),
            })
        });
        this.currentForm = this.sysScenesForm;
        this.sysItems = {
            interval: {
                label: this.i18n.sys.interval,
                required: true,
                spinner: {
                    placeholder: '1-10',
                    min: 1,
                    max: 10,
                    format: 'N0',
                    step: 1,
                },
            },
            duration: {
                label: this.i18n.sys.duration,
                required: true,
                spinner: {
                    placeholder: '2-300',
                    min: 2,
                    max: 300,
                    format: 'N0',
                    step: 1,
                },
            },
            type: {
                label: this.i18n.sys.type,
            },
            info: {
                label: this.i18n.sys.time,
            },
            scenes: {
                label: this.i18n.sys.scenes_bigData,
                placeholder: this.i18n.sys.scenes_placeholder,
                tailPrompt: this.i18n.sys.scenes_tailprompt,
                collectTop: this.i18n.sys.scenes_top,
            }

        };
        this.startCheckSys = {
            title: this.i18n.common_term_task_start_now,
            checked: true,
        };
        this.startCheckC = {
            title: this.i18n.common_term_task_start_now,
            checked: true,
        };
        this.nodeConfigForm = fb.group({
            ip: new FormControl('', [TiValidators.required, TiValidators.ipv4]),
            port: new FormControl(null, [TiValidators.minValue(1), TiValidators.maxValue(65535)]),
            username: new FormControl('', [TiValidators.required]),
            password: new FormControl('', [TiValidators.required]),
        });
        const databaseFormGroup = this.sysScenesForm.controls.databaseConfig as FormGroup;
        this.nodeConfigOptions = {
            label: this.i18n.mission_create.nodeParamsConfig,
            switch: {
                disabled: true,
                status: false,
                tip: this.i18n.nodeConfig.nodeTip,
                hoverTip: this.i18n.mission_create.paramsConfigNotice,
                onSwitchChange: (status) => {
                    if (status) {
                        databaseFormGroup.disable();
                    } else {
                        databaseFormGroup.enable();
                    }
                    this.paramsNode.switch = status;
                }
            },
            beforeConfig: (nodeInfo) => {
                this.beforeNodeConfig(nodeInfo);
            },
            afterConfig: (nodeInfo) => {
                return this.afterNodeConfig(nodeInfo);
            }
        };
        databaseFormGroup.valueChanges.subscribe({
            next: () => {
                if (databaseFormGroup.disabled) { return; }
                // 如果任务名合法并且数据库配置参数合法，则解除多节点开关禁用，去掉开关的hoverTip
                if (this.taskNameValid && databaseFormGroup.valid) {
                    this.nodeConfigOptions.switch.disabled = false;
                    this.nodeConfigOptions.switch.hoverTip = '';
                    // 填入默认的数据库用户名和密码
                    Object.values(this.nodeIpMap).forEach(nodeIp => {
                        this.userMessage[nodeIp] = {
                            user_name: databaseFormGroup.value.username,
                            password: databaseFormGroup.value.password
                        };
                    });
                } else {
                    this.nodeConfigOptions.switch.disabled = true;
                    this.nodeConfigOptions.switch.hoverTip = this.i18n.mission_create.paramsConfigNotice;
                }
            }
        });
    }

    /**
     * 页面初始化时执行
     */
    async ngOnInit() {
        try{
            const resp = await this.projectNodeListService.getProjectNodes(this.projectId);
            this.isLoading = false;
            if (resp?.data?.nodeList) {
                // 存储工程下的节点信息
                this.nodeList = resp.data.nodeList;
                this.setNodeListParam(this.nodeConfig, this.nodeList);
            }
        } catch (err){
            this.isLoading = false;
        }
        // vscode颜色主题适配
        this.currTheme = currentTheme();
        this.vscodeService.regVscodeMsgHandler('colorTheme', (msg: any) => {
            this.currTheme = msg.colorTheme;
        });
        (this.sysScenesForm.controls.traceForm as FormGroup).controls.events.disable();
        (this.sysScenesForm.controls.traceForm as FormGroup).controls.traceSwitch.valueChanges.subscribe((value) => {
            this.ifTracing = value;
            if (this.ifTracing) {
                (this.sysScenesForm.controls.traceForm as FormGroup).controls.events.enable();
            } else {
                (this.sysScenesForm.controls.traceForm as FormGroup).controls.events.disable();
            }
        });
        this.sysForm.controls.duration.setValue(300);
        this.sysForm.controls.interval.setValue(1);
        this.sysScenesForm.controls.duration.setValue(300);
        this.sysScenesForm.controls.interval.setValue(1);
        this.changeScenesTitle();

        this.setSpinnerBlur();
        this.initNodeIpMap();
    }

    // 初始化或导入数据时给表单nodeList赋值
    setNodeListParam(nodeConfig: any[], allNodeList: any[]){
        if (allNodeList.length) {
            let nodeList = [];
            const isNotCreat = this.isEdit || this.isRestart || this.isModifySchedule;
            nodeList = nodeConfig.length && isNotCreat
                ? nodeConfig.map((item: any) => {
                    return allNodeList.filter(
                    (nodeItem: any) => nodeItem.id === item.nodeId
                    )[0];
                })
                : allNodeList;
            this.currentForm.get('nodeList').patchValue(
                nodeList.length > 10 ? nodeList.slice(0, 10) : nodeList
            );
        }
    }

    selectNodeDisable(event: boolean){
        this.isSelectNodeDisabled = event;
    }
    private initNodeIpMap() {
        const url = `/projects/${this.projectId}/info/`;
        return new Promise((resolve) => {
            this.vscodeService.get({ url }, (res: any) => {
                res.data.nodeList.forEach((item: any) => {
                    this.nodeIpMap[item.nickName] = item.nodeIp;
                });
                resolve('');
            });
        });
    }

    private beforeNodeConfig(nodeInfo: NodeInfo) {
        const defaultDBFormGroup = this.sysScenesForm.controls.databaseConfig as FormGroup;
        if (nodeInfo.config) {
            this.nodeConfigForm.controls.ip.setValue(nodeInfo.config.ip);
            this.nodeConfigForm.controls.port.setValue(nodeInfo.config.port || '');
        } else {
            this.nodeConfigForm.controls.ip.setValue(defaultDBFormGroup.value.ip);
            this.nodeConfigForm.controls.port.setValue(defaultDBFormGroup.value.port || '');
        }
        this.nodeConfigForm.controls.username.reset();
        this.nodeConfigForm.controls.password.reset();
    }

    private afterNodeConfig(nodeInfo: NodeInfo) {
        this.userMessage[this.nodeIpMap[nodeInfo.nickName]] = {
            user_name: nodeInfo.config.username,
            password: nodeInfo.config.password
        };
        const idx = this.paramsNode.nodeConfig.findIndex(val => {
            return val.nodeId === nodeInfo.id;
        });
        const node = {
            nickName: nodeInfo.nickName,
            nodeId: nodeInfo.id,
            task_param: {
                sqlIp: nodeInfo.config.ip,
                sqlPort: nodeInfo.config.port || null,
            }
        };
        if (idx !== -1) {
            this.paramsNode.nodeConfig.splice(idx, 1, node);
        } else {
            this.paramsNode.nodeConfig.push(node);
        }
        return true;
    }

    /**
     * 改变校验表单及场景title
     */
    public changeScenesTitle() {
        if (this.scenes === PROJECT_TYPE.TYPE_BIGDATA) {
            this.currentForm = this.sysForm;
            this.sysItems.scenes.label = this.i18n.sys.scenes_bigData;
        } else if (this.scenes === PROJECT_TYPE.TYPE_DISTRIBUTED) {
            this.currentForm = this.sysForm;
            this.sysItems.scenes.label = this.i18n.sys.scenes_dds;
        } else if (this.scenes === PROJECT_TYPE.TYPE_DATABASE) {
            this.currentForm = this.sysScenesForm;
            this.switchTip = this.i18n.mission_create.disableDataTip;
        } else {
            (this.sysScenesForm.controls.databaseConfig as FormGroup).controls.ip.disable();
            (this.sysScenesForm.controls.databaseConfig as FormGroup).controls.port.disable();
            (this.sysScenesForm.controls.databaseConfig as FormGroup).controls.username.disable();
            (this.sysScenesForm.controls.databaseConfig as FormGroup).controls.password.disable();
            this.currentForm = this.sysScenesForm;
        }
    }

    /**
     * 打开联机帮助
     */
    public openHelp() {
        this.vscodeService.postMessage({ cmd: 'readConfig' }, (data: any) => {
            const ip = data.sysPerfConfig[0].ip;
            const port = data.sysPerfConfig[0].port;
            let url = 'https://' + ip + ':' + port + '/sys-perf/';
            if (sessionStorage.getItem('language') === 'en-us') {
                url +=
                './assets/help/en/index.html';
            } else {
                url +=
                './assets/help/zh/index.html';
            }
            // intellij走该逻辑
            if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
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
        });
    }

    /**
     * 微调器回填初始化
     */
    public setSpinnerBlur() {
        this.durationBlur = {
            control: this.sysScenesForm.controls.duration,
            min: 2,
            max: 300,
        };
        this.intervalBlur = {
            control: this.sysScenesForm.controls.interval,
            min: 1,
            max: 10,
        };
    }

    /**
     * 通用模式下的全景分析 采样间隔
     */
    public intervalSysScenesChage(e: number): void {
        if (this.sysItems.interval.spinner.max > 10) {
            this.sysItems.interval.spinner.max = 10;
        }
        if (e >= Math.ceil(this.sysScenesForm.controls.duration.value / 2)) {
            this.sysItems.interval.spinner.max = Math.floor(
                this.sysScenesForm.controls.duration.value / 2
            );
            if (Math.floor(this.sysScenesForm.controls.duration.value / 2) === 0) {
                this.sysItems.interval.spinner.max = 1;
            }
            if (this.sysItems.interval.spinner.max > 10) {
                this.sysItems.interval.spinner.max = 10;
            }
        }
        this.updateWebViewPage();
    }

    /**
     * 采样时长失焦校验
     */
    public onDurationBlur(form: any): void {
        if (form.controls.duration.value < form.controls.interval.value * 2) {
            form.controls.duration.setValue(form.controls.interval.value * 2);
        }
        this.updateWebViewPage();
    }

    /**
     * 采样间隔失焦校验
     */
    public onIntervalBlur(form: any): void {
        if (form.controls.interval.value > Math.floor(form.controls.duration.value / 2)) {
            form.controls.interval.setValue(Math.floor(form.controls.duration.value / 2));
        }
        this.updateWebViewPage();
    }

    /**
     * 获取表单数据
     */
    public getFormDatas() {
        TiValidators.check(this.currentForm);
        const ctrls = this.currentForm.controls;
        const params: any = {
            'analysis-type': 'system',
            projectname: this.projectName,
            taskname: this.taskName,
            interval: ctrls.interval.value,
            duration: ctrls.duration.value,
            topCheck: ctrls.collectTop.value,
        };
        if (this.scenes === PROJECT_TYPE.TYPE_DISTRIBUTED || this.scenes === PROJECT_TYPE.TYPE_BIGDATA) {
            params.configDir = ctrls.scenes.value;
            params.sceneSolution = this.scenes === PROJECT_TYPE.TYPE_BIGDATA ? 1 : 0;
        } else if (this.scenes === PROJECT_TYPE.TYPE_DATABASE) {
            const databaseConfig = ctrls.databaseConfig.value;
            params.sqlIp = databaseConfig.ip;
            params.sqlPort = databaseConfig.port;
            params.traceSwitch = ctrls.traceForm.value.traceSwitch;
            if (ctrls.traceForm.value.traceSwitch) {
                params.events = ctrls.traceForm.value.events;
            } else {
                params.events = '';
            }
            params.sceneSolution = 2;
        }
        if (params.interval > Math.floor(params.duration / 2)) {
            params.interval = Math.floor(params.duration / 2);
        }
        if (this.preSwitchSysA.switchState) {
            // 预约
            if (this.preSwitchSysA.selected === 1) {
                const durationArr = this.preSwitchSysA.durationTime.split(' ');
                params.cycle = true;
                params.targetTime = this.preSwitchSysA.pointTime;
                params.cycleStart = durationArr[0];
                params.cycleStop = durationArr[1];
                params.appointment = '';
            } else {
                // 单次
                const onceArr = this.preSwitchSysA.onceTime.split(' ');
                params.cycle = false;
                params.targetTime = onceArr[1];
                params.appointment = onceArr[0];
            }
        }
        this.formDatas = params;
    }

    /**
     * 多节点 当配置节点参数没开时
     */
    async getNodeConfigDatas() {
        this.getFormDatas();
        // 当开关组件没有打开时
        const url = `/projects/${this.projectId}/info/`;
        return new Promise((resolve, reject) => {
            const data: any[] = [];
            const nodeList = PROJECT_TYPE.TYPE_HPC === this.scenes
                ? this.currentForm.get('nodeList').value
                : this.nodeList;
            nodeList.forEach((item: { id: any; nickName: any; }) => {
                data.push({
                    nodeId: item.id,
                    nickName: item.nickName,
                    task_param: Object.assign({}, { status: false }, this.formDatas),
                });
            });
            resolve(data);
        });
    }

    /**
     * 创建任务
     */
    async createSys(isEdit: any) {
        TiValidators.check(this.currentForm);
        const ctrls = this.currentForm.controls;
        const params: any = {
            'analysis-type': 'system',
            projectname: this.projectName,
            taskname: this.taskName,
            interval: ctrls.interval.value,
            duration: ctrls.duration.value,
            topCheck: ctrls.collectTop.value,
        };
        if (this.scenes === PROJECT_TYPE.TYPE_DISTRIBUTED || this.scenes === PROJECT_TYPE.TYPE_BIGDATA) {
            params.configDir = ctrls.scenes.value;
            params.sceneSolution = this.scenes === PROJECT_TYPE.TYPE_BIGDATA ? 1 : 0;
        } else if (this.scenes === PROJECT_TYPE.TYPE_DATABASE) {
            const databaseConfig = ctrls.databaseConfig.value;
            params.sqlIp = databaseConfig.ip;
            params.sqlPort = databaseConfig.port;
            params.traceSwitch = ctrls.traceForm.value.traceSwitch;
            if (ctrls.traceForm.value.traceSwitch) {
                params.events = ctrls.traceForm.value.events;
            } else {
                params.events = '';
            }
            params.sceneSolution = 2;
        }
        if (params.interval > Math.floor(params.duration / 2)) {
            params.interval = Math.floor(params.duration / 2);
        }

        // 多节点数据
        if (this.paramsNode.switch) {
            params.nodeConfig = this.paramsNode.nodeConfig.map(item => {
                item.task_param = Object.assign({ status: true }, params, item.task_param);
                return item;
            });
        } else {
            params.nodeConfig = await this.getNodeConfigDatas();
        }
        params.switch = this.paramsNode.switch || false;
        if (this.isRestart) {
            this.restartFunction(params);
            return;
        }

        let urlAnalysis = '';
        let errorText = '';
        let method = '';
        //  预约任务 preSwitch 预约组件名
        if (this.preSwitchSysA.switchState) {
            this.startCheckSys.checked = false;
            // 创建预约任务
            const flag = await this.createPreMission(this.preSwitchSysA, params, 'POST');
            if (flag) {
                this.startCheckSys.checked = true;
            }
        } else {
            //  非预约任务
            if (isEdit) {
                urlAnalysis = '/tasks/' + this.restartAndEditId + '/';
                errorText = 'task_edit_error';
                method = 'PUT';
                const options = {
                    url: urlAnalysis,
                    params,
                    method
                };

                const message = {
                    cmd: 'getData',
                    data: options
                };

                this.vscodeService.postMessage(message, (res: any) => {

                    const data = res.data;
                    // 接口调用失败，则有status返回
                    if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
                        if (res.code === 'SysPerf.Success') {
                            this.vscodeService.showTuningInfo(res.message, 'info', 'modifyTask');
                            if (this.startCheckSys.checked) {
                                this.startDataSamplingTask(
                                    this.projectName,
                                    this.taskName,
                                    data.id,
                                    params
                                );
                            } else {
                                this.vscodeService.showTuningInfo('cancel', 'info', 'modifyTask');
                                this.vscodeService.postMessage({
                                    cmd: 'openSomeNode',
                                    data: {
                                        taskId: data.id,
                                        projectName: this.projectName,
                                    }
                                }, null);
                            }
                        } else {
                            this.vscodeService.showTuningInfo(res.message, 'error', 'modifyTask');
                        }
                    } else {
                        if (res.status) {
                            this.vscodeService.showInfoBox(res.message, 'error');
                        } else {
                            setTimeout(() => {
                                this.vscodeService.showInfoBox(
                                    this.I18n.I18nReplace(this.i18n.plugins_term_task_modify_success, {
                                        0: this.taskName
                                    }), 'info');
                            }, 3500);
                            if (this.startCheckSys.checked) {
                                this.startDataSamplingTask(
                                    this.projectName,
                                    this.taskName,
                                    data.id,
                                    params
                                );
                            } else {
                                setTimeout(() => {
                                    this.vscodeService.showInfoBox(
                                        this.I18n.I18nReplace(this.i18n.plugins_term_task_modify_success, {
                                            0: this.taskName
                                        }), 'info');
                                    this.closeTab.emit({});
                                }, 200);
                            }
                        }
                    }
                });
            } else {
                const context = this;
                if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
                    const createPerformanceInstance = this.tiMessage.open({
                        id: 'create',
                        type: 'warn',
                        title: this.i18n.secret_title,
                        content: '<div>' +
                            '<div class="warn-tip-msg">' +
                            '<div class="ti3-icon ti3-icon-warn"></div>' + this.i18n.secret_count + '</div>' +
                            '</div>',
                        dismiss: (): void => {
                            this.zone.run(() => {
                                createPerformanceInstance.close();
                            });
                        },
                        okButton: {
                            show: true,
                            click: (): void => {
                                urlAnalysis = '/tasks/';
                                errorText = 'task_create_error';
                                method = 'POST';
                                const options = {
                                    url: urlAnalysis,
                                    params,
                                    method
                                };

                                const message = {
                                    cmd: 'getData',
                                    data: options
                                };

                                context.vscodeService.postMessage(message, (res: any) => {

                                    const data = res.data;
                                    // 接口调用失败，则有status返回
                                    if (res.code === 'SysPerf.System.CreateTask.TaskExist') {
                                        this.vscodeService.showTuningInfo(res.message, 'error', 'createTask');
                                    } else {
                                        let timer = 0;
                                        if (context.startCheckSys.checked) {
                                            timer = 3500;
                                            context.startDataSamplingTask(
                                                context.projectName,
                                                context.taskName,
                                                data.id,
                                                params
                                            );
                                        } else {
                                            this.vscodeService.showTuningInfo('cancel', 'info', 'createTask');
                                            this.vscodeService.postMessage({
                                                cmd: 'openSomeNode',
                                                data: {
                                                    taskId: data.id,
                                                    projectName: context.projectName
                                                }
                                            }, null);
                                        }

                                        this.vscodeService.showTuningInfo(res.message, 'info', 'createTask');
                                    }
                                });
                                this.zone.run(() => {
                                    createPerformanceInstance.close();
                                });
                            }
                        },
                        cancelButton: {
                            show: true,
                            click: (): void => {
                                this.zone.run(() => {
                                    createPerformanceInstance.close();
                                });
                            }
                        }
                    });
                } else {

                    this.tiModal.open(this.createConfirmModal, {
                        // 定义id防止同一页面出现多个相同弹框
                        id: 'createMicarch',
                        modalClass: 'createConfirmModal',
                        close() {
                            urlAnalysis = '/tasks/';
                            errorText = 'task_create_error';
                            method = 'POST';
                            const options = {
                                url: urlAnalysis,
                                params,
                                method
                            };

                            const message = {
                                cmd: 'getData',
                                data: options
                            };
                            context.vscodeService.postMessage(message, (res: any) => {
                                const data = res.data;
                                // 接口调用失败，则有status返回
                                if (res.status) {
                                    context.vscodeService.showInfoBox(res.message, 'error');
                                } else {
                                    let timer = 0;
                                    if (context.startCheckSys.checked) {
                                        timer = 3500;
                                        context.startDataSamplingTask(
                                            context.projectName,
                                            context.taskName,
                                            data.id,
                                            params
                                        );
                                    } else {
                                        context.closeTab.emit({
                                            title: `${data.taskname}-${params.nodeConfig[0].nickName}`,
                                            id: data.id,
                                            startCheckCNo: true,
                                            nodeid: params.nodeConfig[0].nodeId,
                                            taskId: data.id,
                                            taskType: data['analysis-type'],
                                            status: data['task-status'],
                                            projectName: context.projectName,
                                        });
                                    }
                                    setTimeout(() => {
                                        context.vscodeService.showInfoBox(context.I18n.I18nReplace(
                                            context.i18n.plugins_term_task_create_success, {
                                            0: context.taskName
                                        }), 'info');
                                    }, timer);
                                }
                            });
                        }
                    });
                }
            }

        }
    }

    /**
     *  创建/修改 预约任务函数
     */
    public createPreMission(context: any, params: any, method: string): any {
        //  周期
        if (context.selected === 1) {
            const durationArr = context.durationTime.split(' ');
            params.cycle = true;
            params.targetTime = context.pointTime;
            params.cycleStart = durationArr[0];
            params.cycleStop = durationArr[1];
            params.appointment = '';
        } else {
            // 单次
            const onceArr = context.onceTime.split(' ');
            params.cycle = false;
            params.targetTime = onceArr[1];
            params.appointment = onceArr[0];
            params.cycleStart = '';
            params.cycleStop = '';
        }
        // 预约任务请求地址
        let urlAnalysis = '';
        if (!this.editScheduleTask) {
            urlAnalysis = '/schedule-tasks/';
        } else {
            urlAnalysis = '/schedule-tasks/' + this.scheduleTaskId + '/';
            method = 'PUT';
        }
        const options = {
            url: urlAnalysis,
            method,
            params
        };

        const message = {
            cmd: 'getData',
            data: options
        };
        if (self.webviewSession.getItem('tuningOperation') === 'hypertuner') {
            this.vscodeService.post(options, (res: any) => {
                if (res.code === 'SysPerf.Success') {
                    this.vscodeService.showTuningInfo(res.message, 'info', 'createTask');
                    this.vscodeService.showTuningInfo('cancel', 'info', 'createTask');
                } else {
                    this.vscodeService.showTuningInfo(res.message, 'error', 'createTask');
                }
            });
        } else {
            return new Promise((resolve, reject) => {
                this.vscodeService.postMessage(message, (res: any) => {
                    if (res.status) {
                        this.vscodeService.showInfoBox(res.message, 'error');
                    } else {
                        if (this.editScheduleTask) {
                            this.vscodeService.showInfoBox(
                                this.I18n.I18nReplace(this.i18n.plugins_term_scheduleTask_modify_success, {
                                    0: this.taskName
                                }), 'info');
                            this.editScheduleTask = false;
                        } else {
                            this.vscodeService.showInfoBox(
                                this.I18n.I18nReplace(this.i18n.plugins_term_scheduleTask_create_success, {
                                    0: this.taskName
                                }), 'info');
                        }
                        context.clear();
                        this.sendPretable.emit('on');
                        this.closeTab.emit({});
                        resolve(true);
                    }
                });
            });
        }
    }
    /**
     *  导入模板
     */
    public getTemplateData(e: any): void {
        this.changeScenesTitle();
        this.taskNameValid = true;
        this.currentForm.controls.interval.setValue(e.interval);
        this.currentForm.controls.duration.setValue(e.duration);
        this.currentForm.controls.collectTop.setValue(e.topCheck);
        if (this.scenes === PROJECT_TYPE.TYPE_DISTRIBUTED || this.scenes === PROJECT_TYPE.TYPE_BIGDATA) {
            this.currentForm.controls.scenes.setValue(e.configDir);
        } else if (this.scenes === PROJECT_TYPE.TYPE_DATABASE) {
            const databaseFormGroup = this.currentForm.controls.databaseConfig as FormGroup;
            const traceFormGroup = this.currentForm.controls.traceForm as FormGroup;
            databaseFormGroup.controls.ip.setValue(e.sqlIp);
            databaseFormGroup.controls.port.setValue(e.sqlPort);
            databaseFormGroup.controls.username.reset();
            databaseFormGroup.controls.password.reset();
            traceFormGroup.controls.traceSwitch.setValue(e.traceSwitch);
            traceFormGroup.controls.events.setValue(e.events);

            if (e.switch) {
                databaseFormGroup.disable();
                this.nodeConfigOptions.switch.disabled = false;
                this.nodeConfigOptions.switch.hoverTip = '';
            } else {
                this.nodeConfigOptions.switch.disabled = true;
                this.nodeConfigOptions.switch.hoverTip = this.i18n.mission_create.paramsConfigNotice;
            }

            this.paramsNode.switch = e.switch;
            this.nodeConfigOptions.switch.status = e.switch;
            this.importConfig = e.nodeConfig.reduce((obj: any, item: any) => {
                obj[item.nodeId] = {
                    ip: item.task_param.sqlIp,
                    port: item.task_param.sqlPort,
                };
                return obj;
            }, {});
        }
        this.nodeConfig = e.nodeConfig;
        this.setNodeListParam(e.nodeConfig, this.nodeList);

        // 预约任务数据导入
        this.preSwitchSysA.importTemp(e);
        if (this.isEdit || this.isRestart) {
            this.preSwitchSysA.isEdit = this.isEdit || this.isRestart;
        }
        if (this.isEdit) {
            this.startCheckSys.checked = false;
        }
    }

    /**
     * 取消按钮
     */
    public close() {
        this.closeTab.emit({});
        if (this.isModifySchedule) {
            this.sendPretable.emit();
        }
        if (((self as any).webviewSession || {}).getItem('tuningOperation') === 'hypertuner') {
            // 关闭当前页面
            this.vscodeService.showTuningInfo('cancel', 'info', 'createTask');
        }
    }

    /**
     * 保存模板
     */
    async saveTemplates() {
        const errors = TiValidators.check(this.currentForm);
        const self = this;
        const ctrls = self.currentForm.controls;
        const params: any = {
            'analysis-type': 'system',
            projectname: self.projectName,
            taskname: self.taskName,
            interval: ctrls.interval.value,
            duration: ctrls.duration.value,
            topCheck: ctrls.collectTop.value,
        };
        if (this.scenes === PROJECT_TYPE.TYPE_DISTRIBUTED || this.scenes === PROJECT_TYPE.TYPE_BIGDATA) {
            params.configDir = ctrls.scenes.value;
            params.sceneSolution = this.scenes === PROJECT_TYPE.TYPE_BIGDATA ? 1 : 0;
        } else if (this.scenes === PROJECT_TYPE.TYPE_DATABASE) {
            const databaseConfig = ctrls.databaseConfig.value;
            params.sqlIp = databaseConfig.ip;
            params.sqlPort = databaseConfig.port;
            params.traceSwitch = ctrls.traceForm.value.traceSwitch;
            if (ctrls.traceForm.value.traceSwitch) {
                params.events = ctrls.traceForm.value.events;
            } else {
                params.events = '';
            }
            params.sceneSolution = 2;
        }
        if (params.interval > Math.floor(params.duration / 2)) {
            params.interval = Math.floor(params.duration / 2);
        }
        if (this.preSwitchSysA.switchState) {
            // 预约
            if (this.preSwitchSysA.selected === 1) {
                const durationArr = this.preSwitchSysA.durationTime.split(' ');
                params.cycle = true;
                params.targetTime = this.preSwitchSysA.pointTime;
                params.cycleStart = durationArr[0];
                params.cycleStop = durationArr[1];
                params.appointment = '';
            } else {
                // 单次
                const onceArr = this.preSwitchSysA.onceTime.split(' ');
                params.cycle = false;
                params.targetTime = onceArr[1];
                params.appointment = onceArr[0];
            }
        }
        if (this.paramsNode.switch) {
            params.nodeConfig = this.paramsNode.nodeConfig.map(item => {
                item.task_param = Object.assign({ status: true }, params, item.task_param);
                return item;
            });
        } else {
            params.nodeConfig = await this.getNodeConfigDatas();
        }
        params.switch = this.paramsNode.switch || false;
        this.keepData = params;
        this.sendMissionKeep.emit(this.keepData);
    }

    /**
     * 清空任务参数
     */
    public clear() {
        this.preSwitchSysA.clear();
    }

    /**
     * 立即启动
     */
    public startDataSamplingTask(projectname: string, taskname: string, id: string, params: any) {
        this.vscodeService.get({
            url: '/res-status/?type=disk_space&project-name=' +
                encodeURIComponent(projectname) +
                '&task-name=' +
                encodeURIComponent(taskname)
        }, (data: any) => {
            const self = this;
            const option = {
                url: '/tasks/' + id + '/status/',
                params: { status: 'running', user_message: this.userMessage }
            };
            this.vscodeService.put(option, (res: any) => {
                const backData = res.data;
                self.closeTab.emit({
                    title: `${params.taskname}-${params.nodeConfig[0].nickName}`,
                    id: backData.id,
                    nodeid: params.nodeConfig[0].nodeId,
                    taskId: backData.id,
                    taskType: params['analysis-type'],
                    status: backData['task-status'],
                    projectName: self.projectName
                });
            });
        });
    }

    /**
     * 重启
     */
    public restartFunction(params: any) {
        params.status = 'restarted';
        if (this.scenes === PROJECT_TYPE.TYPE_DATABASE) {
            params.user_message = this.userMessage;
        }
        const self = this;
        const option = {
            url: '/tasks/' + this.restartAndEditId + '/status/',
            params
        };
        self.vscodeService.put(option, (res: any) => {
            const data = res.data;
            if (res.status === HTTP_STATUS.HTTP_400_BAD_REQUEST) {
                this.vscodeService.showInfoBox(res.message, 'error');
            } else {
                this.closeTab.emit({
                    title: `${params.taskname}-${params.nodeConfig[0].nickName}`,
                    id: data.id,
                    nodeid: params.nodeConfig[0].nodeId,
                    taskId: data.id,
                    taskType: params['analysis-type'],
                    status: data['task-status'],
                    projectName: this.projectName
                });
                setTimeout(() => {
                    self.vscodeService.postMessage({
                        cmd: 'updateTree',
                        data: {
                            type: 'info',
                            info: this.I18n.I18nReplace(this.i18n.plugins_term_task_reanalyze_success, {
                                0: this.taskName
                            })
                        }
                    }, null);
                }, 3500);
            }

            this.isRestart = false;
        });
    }

    /**
     * 计算 info-icon 的 left 值
     */
    get tipInfoLeftPosition() {
        return -parseInt(this.labelWidth, 10) - 20 + 'px';
    }

    /**
     * 确认和保存按钮是否禁用
     *
     * @returns boolean
     */
    public startOrSaveBtnIsDisabled() {
        if (this.scenes === PROJECT_TYPE.TYPE_DATABASE) {
            let isDisabled = false;

            if (this.paramsNode.switch) {
                isDisabled = isDisabled || this.paramsNode.nodeConfig.length !== Object.keys(this.nodeIpMap).length;
                this.startOrSaveBtnTip = isDisabled ? this.i18n.databaseConfig.btnTip : '';
            } else {
                const databaseFormGroup = this.currentForm.controls.databaseConfig as FormGroup;
                isDisabled = isDisabled || !databaseFormGroup.valid;
                this.startOrSaveBtnTip = '';
            }

            const traceFormGroup = this.currentForm.controls.traceForm as FormGroup;
            if (traceFormGroup.value.traceSwitch) {
                isDisabled = isDisabled || !traceFormGroup.controls.events.valid;
            }

            return isDisabled || !this.taskNameValid;
        } else {
            return !(
                this.currentForm.valid
                && this.taskNameValid
                && (this.preSwitchSysA?.previewState || !this.preSwitchSysA?.switchState)
            );
        }
    }

    /**
     * 微调器鼠标移出数据校验
     * @param e event
     * @param type 类型
     */
    selectBlur(e: { target: { value: any; }; }, type: string) {
        setTimeout(() => {
            const value = e.target.value;
            if (type === 'duration') {
                const maxVal = this.durationBlur.max;
                const minVal = this.durationBlur.min;
                if (value < minVal) {
                    this.sysScenesForm.controls[type].setValue(minVal);
                    this.sysForm.controls[type].setValue(minVal);
                } else if (value > maxVal) {
                    this.sysScenesForm.controls[type].setValue(maxVal);
                    this.sysForm.controls[type].setValue(maxVal);
                }
            }
            if (type === 'interval') {
                const maxVal = this.intervalBlur.max;
                const minVal = this.intervalBlur.min;
                if (value < minVal) {
                    this.sysScenesForm.controls[type].setValue(minVal);
                    this.sysForm.controls[type].setValue(minVal);
                } else if (value > maxVal) {
                    this.sysScenesForm.controls[type].setValue(maxVal);
                    this.sysForm.controls[type].setValue(maxVal);
                }
            }
        }, 100);
    }
    /**
     * intellIj刷新webview页面
     */
    public updateWebViewPage() {
        if (((self as any).webviewSession || {}).getItem('tuningOperation') === 'hypertuner') {
            this.zone.run(() => {
                this.changeDetectorRef.detectChanges();
                this.changeDetectorRef.checkNoChanges();
            });
        }
    }
}
