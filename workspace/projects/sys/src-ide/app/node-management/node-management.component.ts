import { Component, ViewChild, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { FormControl, FormBuilder, ValidationErrors, ValidatorFn, AbstractControl } from '@angular/forms';
import {
    TiModalService, TiValidators, TiValidationConfig, TiTableColumns, TiTableRowData, TiTableSrcData
} from '@cloud/tiny3';

import { I18nService } from '../service/i18n.service';
import { VscodeService, COLOR_THEME, currentTheme } from '../service/vscode.service';
import { MytipService } from '../service/mytip.service';
import { DomSanitizer } from '@angular/platform-browser';
import { AnsiUpService } from '../service/ansi-up.service';
import { QueryNodeInfoService } from 'projects/sys/src-ide/app/service/query-node-info.service';
import { UrlService } from 'projects/sys/src-ide/app/service/url.service';
import { CustomValidatorsService } from 'projects/sys/src-ide/app/service';
import { ToolType } from 'projects/domain';
import { BatchOptEvent, BatchOptType } from 'sys/src-com/app/node-management/domain';
import { DispatchInfo, StateController } from 'sys/src-com/app/node-management/model';
import { INodeListRef } from './node-list-ref.model';

export class CustomValidators {
    /**
     * 正则校验
     */
    public static regValidate(reg: any, tip: string): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (control.value && !reg.test(control.value)) {
                return {
                    res: {
                        tiErrorMessage: tip,
                        type: 'blur'
                    }
                };
            } else {
                return null;
            }
        };
    }
}

@Component({
    selector: 'app-node-management',
    templateUrl: './node-management.component.html',
    styleUrls: ['./node-management.component.scss']
})
export class NodeManagementComponent implements OnInit {
    @ViewChild('nodeListComponent', { static: false }) nodeListComponent: INodeListRef;

    // 节点数节点数是否最大, 默认为是
    public isMaxNodeAllow = true;
    public i18n;
    public nodeParams: any;
    public config: any;
    public serverIp: string;
    public currTheme = COLOR_THEME.Dark;
    public textType = {
        type1: 'password',
        type2: 'password',
        type3: 'password',
        type4: 'password',
        type5: 'password',
        type6: 'password',
    };
    // 判断是否是管理员或普通用户
    public isAdminFlag = false;
    public validation: TiValidationConfig = {
        type: 'blur'
    };
    public ColorTheme = {
        Dark: COLOR_THEME.Dark,
        Light: COLOR_THEME.Light
    };

    // -- 添加节点 --
    @ViewChild('addNodeModalComponent', { static: false }) addNodeModalComponent: any;
    public addNodeModal: any;
    public addNodeForm = {
        formGroup: ({} as any),
    };
    // -- root添加节点提示 --
    @ViewChild('addNodeTipModalComponent', { static: false }) addNodeTipModalComponent: any;
    public addNodeTipModal: any;
    // -- 修改节点内容 --
    @ViewChild('editNodeNameModalComponent', { static: false }) editNodeNameModalComponent: any;
    public editNodeNameModal: any;
    public editNodeNameForm = {
        displayOrder: ['nodeIP', 'nodeName'],
        displayedElementList: ['nodeIP', 'nodeName'],
        form: ({} as any),
        formGroup: ({} as any),
    };

    // -- 删除节点 --
    @ViewChild('deleteNodeModalComponent', { static: false }) deleteNodeModalComponent: any;
    public deleteNodeModal: any;
    public deleteNodeTip: any;
    public deleteNodeForm = {
        formGroup: ({} as any),
    };

    // -- 删除节点失败 --
    @ViewChild('deleteNodeFailedModalComponent', { static: false }) deleteNodeFailedModalComponent: any;
    public deleteNodeFailedModal: any;
    public deleteNodeFailedReason = {
        columns: [],
        displayed: [],
        srcData: {},
    };
    // -- 安装日志 --
    @ViewChild('showNodeLogModalComponent', { static: false }) showNodeLogModalComponent: any;
    public showNodeLogModal: any;
    public nodeLogModalTitle: any;
    public fingerPrintConfirmationModal: any;
    public fingerPrintConfirmationTable: any = {
        columns: ([] as Array<TiTableColumns>),
        displayed: ([] as Array<TiTableRowData>),
        srcData: ({
            data: ([] as Array<TiTableRowData>),
            state: {
                searched: false, // 源数据未进行搜索处理
                sorted: false, // 源数据未进行排序处理
                paginated: false // 源数据未进行分页处理
            }
        } as TiTableSrcData),
    };
    public showLoading = false;

    public pluginUrlCfg: any = {
        sysNode_openFAQ1: '',
    };
    private url: any;
    public toolType = sessionStorage.getItem('toolType');

    private batchController: StateController;

    constructor(
        public i18nService: I18nService,
        public vscodeService: VscodeService,
        private queryNodeInfoService: QueryNodeInfoService,
        private tiModal: TiModalService,
        public router: Router,
        public location: Location,
        public mytip: MytipService,
        public ansiUp: AnsiUpService,
        private sanitizer: DomSanitizer,
        private urlService: UrlService,
        public customValidatorsService: CustomValidatorsService,
    ) {
        this.url = this.urlService.Url();
        this.i18n = this.i18nService.I18n();
        // vscode颜色主题
        this.currTheme = currentTheme();

        this.vscodeService.regVscodeMsgHandler('colorTheme', (msg: any) => {
            this.currTheme = msg.colorTheme;
        });

        // 节点参数表单
        this.nodeParams = {
            nodeName: {
                label: this.i18n.plugins_sysperf_message_nodeManagement.nodeName,
                required: false,
                type: 'input',
                customValidators: [this.customValidatorsService.nodeNameValidator],
                interfaceName: ['node_name'],
                placeholder: this.i18n.plugins_sysperf_message_nodeManagement.nodenamePlaceholder
            },
            nodeIP: {
                label: this.i18n.nodeConfig.node,
                required: true,
                type: 'ipv4',
                interfaceName: ['ip'],
            },
            port: {
                label: this.i18n.plugins_sysperf_message_nodeManagement.nodePort,
                required: true,
                type: 'inputNumber',
                uploadMode: 'string',
                value: 22,
                tailPrompt: '(1~65535)',
                interfaceName: ['port'],
            },
            username: {
                label: this.i18n.common_term_login_name,
                required: true,
                type: 'input',
                value: 'root',
                customValidators: [CustomValidators.regValidate(new RegExp(/^.{1,32}$/),
                    this.i18n.plugins_sysperf_message_nodeManagement.validation.username)],
                interfaceName: ['user_name'],
            },
            authenticationMode: {
                label: this.i18n.plugins_sysperf_message_nodeManagement.authenticationMode,
                required: true,
                type: 'select',
                list: [{
                    label: this.i18n.plugins_sysperf_message_nodeManagement.passwordAuth,
                    value: 'password',
                    prop: 'password',
                    checked: true,
                }, {
                    label: this.i18n.plugins_sysperf_message_nodeManagement.private_key_auth,
                    value: 'private_key',
                    prop: 'key',
                }],
                interfaceName: ['verification_method'],
            },
            password: {
                label: this.i18n.plugins_sysperf_message_nodeManagement.password,
                required: true,
                type: 'input',
                inputType: 'password',
                interfaceName: ['password'],
            },
            keyFile: {
                label: this.i18n.plugins_sysperf_message_nodeManagement.keyFile,
                required: true,
                type: 'input',
                interfaceName: ['identity_file'],
            },
            passphrase: {
                label: this.i18n.plugins_sysperf_message_nodeManagement.passphrase,
                required: false,
                type: 'input',
                inputType: 'password',
                interfaceName: ['passphrase'],
            },
            installPath: {
                label: this.i18n.plugins_sysperf_message_nodeManagement.installPath,
                required: false,
                type: 'input',
                value: '/opt',
                interfaceName: ['agent_install_path'],
            },
            rootPassword: {
                label: this.i18n.plugins_sysperf_message_nodeManagement.rootAuth,
                required: true,
                type: 'input',
                inputType: 'password',
                interfaceName: ['rootPassword'],
                placeholder: this.i18n.plugins_sysperf_message_nodeManagement.rootPlaceholder
            }
        };

        // 生成添加节点表单
        this.generateAddNodeForm();

        // 生成修改节点内容表单
        this.generateEditNodeNameForm();

        // 生成删除节点表单
        this.generateDeleteNodeForm();

        // 删除节点失败
        this.deleteNodeFailedReason.columns = [
            { prop: 'projectName', title: this.i18n.common_term_projiect_name, width: '50%' },
            { prop: 'tool', title: this.i18n.common_term_projiect_owning_Tool, width: '50%' },
        ];

        this.initFingerPrintConfirmationTable();
    }

    /**
     * 组件初始化
     */
    ngOnInit() {
        // 用户角色判断
        this.isAdminFlag = VscodeService.isAdmin();

        // 获取全局url配置数据
        this.vscodeService.postMessage({ cmd: 'readURLConfig' }, (resp: any) => {
            this.pluginUrlCfg = resp;
        });
    }

    /**
     * 生成表单【从 nodeParams 中摘取】
     */
    public generateAddNodeForm() {
        const formGroup = new FormBuilder().group({
            nodeName: new FormControl(null, [this.customValidatorsService.nodeNameValidator]),
            installPath: new FormControl(null),
            nodeIP: new FormControl(null, [TiValidators.required]),
            port: new FormControl(null, [this.customValidatorsService.checkInteger(), this.checkIP()]),
            username: new FormControl(null,
                [TiValidators.required, CustomValidators.regValidate(new RegExp(/^.{1,32}$/),
                this.i18n.plugins_sysperf_message_nodeManagement.validation.username)]),
            authenticationMode: new FormControl(null, [TiValidators.required]),
            password: new FormControl({ disabled: true }, [TiValidators.required]),
            keyFile: new FormControl({ disabled: true }, [TiValidators.required]),
            passphrase: new FormControl({ disabled: true }),
            rootPassword: new FormControl({ disabled: true }, [TiValidators.required]),
        });
        this.addNodeForm.formGroup = formGroup;
        // 认证方式的修改
        formGroup.get('authenticationMode').valueChanges.subscribe(val => {
            if (val.prop === 'password') {
                formGroup.get('password').enable();
                formGroup.get('keyFile').disable();
                formGroup.get('passphrase').disable();
            } else {
                formGroup.get('password').disable();
                formGroup.get('keyFile').enable();
                formGroup.get('passphrase').enable();
            }
        });
        // 用户名不是root时，添加root口令输入框
        formGroup.get('username').valueChanges.subscribe(val => {
            if (val === 'root') {
                formGroup.get('rootPassword').disable();
            } else {
                formGroup.get('rootPassword').enable();
            }
        });

        this.resetAddNodeForm();
    }
    /**
     * 重置添加节点表单
     */
    public resetAddNodeForm() {
        if (!this.addNodeForm.formGroup) { return; }
        this.addNodeForm.formGroup.reset({
            installPath: '/opt',
            port: 22,
            username: 'root',
            authenticationMode: this.nodeParams.authenticationMode.list.find(item => item.value === 'password'),
        });
    }

    /**
     * 打开添加节点
     */
    public openAddNodeModal() {
        const self = this;
        this.addNodeModal = this.tiModal.open(this.addNodeModalComponent, {
            // 定义id防止同一页面出现多个相同弹框
            id: 'addNodeModal',
            modalClass: 'addNodeModal nodeManagementModal',
            context: {
                confirm: (context) => {
                    const formGroup = this.addNodeForm.formGroup;
                    const values = formGroup.getRawValue();
                    this.openFingerPrintConfirmationModal(values.nodeIP, values.port);
                    const params: any = {
                        node_name: values.nodeName?.trim(),
                        ip: values.nodeIP,
                        port: values.port,
                        user_name: values.username,
                        verification_method: values.authenticationMode.value,
                        agent_install_path: values.installPath,
                    };
                    if (params.verification_method === 'password') {
                        params.password = values.password;
                    } else {
                        params.identity_file = values.keyFile;
                        params.passphrase = values.passphrase;
                    }
                    if (params.user_name !== 'root') {
                        params.root_password = values.rootPassword;
                    }
                    Object.keys(params).forEach(key => {
                        if (params[key] == null) {
                            delete params[key];
                        }
                    });
                    const content = values.username === 'root'
                        ? this.i18n.plugins_sysperf_message_nodeManagement.sshUseRootConfirmText
                        : this.i18n.plugins_sysperf_message_nodeManagement.sshConfirmText;
                    if (params.user_name === 'root') {
                        context.close();
                        this.addNodeTipModal = this.tiModal.open(this.addNodeTipModalComponent, {
                            id: 'addNodeTipModal',
                            modalClass: 'addNodeTipModal nodeManagementModal',
                            dismiss: modalRef => {
                                self.resetAddNodeForm();
                            },
                            context: {
                                tipInfo: this.fillPlaceholder(content, values.nodeIP),
                                confirm: (tipContext) => {
                                    self.addNode(tipContext, params);
                                }
                            }
                        });
                    } else {
                        self.addNode(context, params);
                    }
                },
            },
            dismiss: modalRef => {
                this.resetAddNodeForm();
            },
            draggable: false
        });
    }

    /**
     * 添加节点
     *
     * @param context 上下文信息
     */
    public async addNode(context, params) {
        this.showLoading = true;
        const timeout = 10000;
        const option = {
            url: this.url.nodes,
            timeout,
            params
        };

        const timeoutCloseLoading = setTimeout(() => {
            this.showLoading = false;
        }, timeout);
        try {
            this.vscodeService.post(option, (res: any) => {
                this.showLoading = false;
                clearTimeout(timeoutCloseLoading);
                if (res.status) {
                    if (params.user_name === 'root') {
                        context.close();
                        this.generateAddNodeForm();
                    }
                    this.vscodeService.showInfoBox(res.message, 'warn');
                } else {
                    const content = this.i18nService.I18nReplace(this.i18n.plugins_sysperf_message_tips.create_ok, {
                        0: params.ip
                    });
                    this.vscodeService.showInfoBox(content, 'info');

                    context.close();
                    this.nodeListComponent.getNodes(false);
                    this.generateAddNodeForm();
                }
            });
        } catch (error) {
            this.showLoading = false;
        }
    }

    /**
     * 生成表单【从 nodeParams 中摘取】
     */
    public generateEditNodeNameForm() {
        this.editNodeNameForm = {
            displayOrder: ['nodeIP', 'nodeName'],
            displayedElementList: ['nodeIP', 'nodeName'],
            form: ({} as any),
            formGroup: ({} as any),
        };

        const formEl = this.editNodeNameForm;

        // 表单元素
        this.generateForm(formEl);
        // 修改 节点IP 的 type 为 text
        formEl.form.nodeIP.type = 'text';
        formEl.form.nodeIP.required = false;
        formEl.form.nodeName.required = true;
        formEl.form.nodeName.customValidators.push(this.customValidatorsService.checkEmpty());
        // 表单元素验证
        this.generateFormGroup(formEl);

        this.initDefaultValue({
            formEl,
            list: formEl.displayedElementList,
            triggerMode: 'manual',
        });
    }

    /**
     * 显示编辑节点
     *
     * @param node 节点
     */
    public showEditNodeNameModal(node) {
        this.editNodeNameModal = this.tiModal.open(this.editNodeNameModalComponent, {
            id: 'editNodeNameModal',
            modalClass: 'editNodeNameModal nodeManagementModal',
            context: {
                node,
            },
            draggable: false
        });

        this.editNodeNameForm.formGroup.controls.nodeIP.setValue(node.nodeIP);
        this.editNodeNameForm.formGroup.controls.nodeName.setValue(node.nodeName);
    }
    /**
     * 安装日志
     *
     * @param node 节点
     */
    public showNodeInstallLogModal(node) {
        this.nodeLogModalTitle = this.i18nService.I18nReplace(
            this.i18n.plugins_sysperf_message_nodeManagement.installationLog, {
            0: node.nodeIP
        });
        const type = this.toolType === ToolType.DIAGNOSE ? '?analysis-type=memory_diagnostic' : '';
        this.vscodeService.get({ url: `/nodes/${node.id}/logs/${type}` }, resp => {
            const content: any = this.sanitizer.bypassSecurityTrustHtml(this.ansiUp.ansi_to_html(resp.data.log_msg));
            const contentWithoutTag = this.ansiUp.ansi_to_html(resp.data.log_msg, false);
            this.showNodeLogModal = this.tiModal.open(this.showNodeLogModalComponent, {
                id: 'showNodeLogModal',
                modalClass: 'showNodeLogModal nodeManagementModal',
                context: {
                    content,
                    ...node,
                    download: () => {
                        const option = {
                            cmd: 'downloadFile',
                            data: {
                                fileName: this.nodeLogModalTitle + '.txt',
                                fileContent: contentWithoutTag,
                                invokeLocalSave: true,
                            }
                        };
                        this.vscodeService.postMessage(option, null);
                    },
                    copy: () => {
                        const option = {
                            cmd: 'clipboard',
                            data: {
                                content: contentWithoutTag,
                            }
                        };
                        this.vscodeService.postMessage(option, null);
                    }
                },
                draggable: false
            });
        });
    }
    /**
     * 显示编辑节点
     *
     * @param context 上下文信息
     */
    public editNodeName(context) {

        const params = this.editNodeNameForm.formGroup.getRawValue();
        const param = {
            ipaddr: params.nodeIP,
            nickName: params.nodeName?.trim()
        };
        const type = this.toolType === ToolType.DIAGNOSE ? '?analysis-type=memory_diagnostic' : '';
        const option = {
            url: `/nodes/${context.node.id}/${type}`,
            params: param
        };

        try {
            this.vscodeService.put(option, (res: any) => {
                const content = this.i18nService.I18nReplace(this.i18n.plugins_sysperf_message_tips.edit_ok, {
                    0: context.node.nodeIP
                });
                this.vscodeService.showInfoBox(content, 'info');

                context.close();
                this.nodeListComponent.getNodes(false);
                this.generateEditNodeNameForm();
            });
        } catch (error) {
            this.showLoading = false;
        }
    }
    /**
     * 生成表单【从 nodeParams 中摘取】
     */
    public generateDeleteNodeForm() {
        const formGroup = new FormBuilder().group({
            username: new FormControl(null,
                [TiValidators.required, CustomValidators.regValidate(new RegExp(/^.{1,32}$/),
                this.i18n.plugins_sysperf_message_nodeManagement.validation.username)]),
            authenticationMode: new FormControl(null, [TiValidators.required]),
            password: new FormControl({ disabled: true }, [TiValidators.required]),
            keyFile: new FormControl({ disabled: true }, [TiValidators.required]),
            passphrase: new FormControl({ disabled: true }),
            rootPassword: new FormControl(null, [TiValidators.required]),
        });
        this.deleteNodeForm.formGroup = formGroup;
        // 认证方式的修改
        formGroup.get('authenticationMode').valueChanges.subscribe(val => {
            if (val.prop === 'password') {
                formGroup.get('password').enable();
                formGroup.get('keyFile').disable();
                formGroup.get('passphrase').disable();
            } else {
                formGroup.get('password').disable();
                formGroup.get('keyFile').enable();
                formGroup.get('passphrase').enable();
            }
        });
        // 用户名不是root时，添加root口令输入框
        formGroup.get('rootPassword').disable();
        formGroup.get('username').valueChanges.subscribe(val => {
            if (val === 'root') {
                formGroup.get('rootPassword').disable();
            } else {
                formGroup.get('rootPassword').enable();
            }
        });
        this.resetDeleteNodeForm();
    }

    /**
     * 重置删除节点表单
     */
    public resetDeleteNodeForm() {
        if (!this.deleteNodeForm.formGroup) { return; }
        this.deleteNodeForm.formGroup.reset({
            authenticationMode: this.nodeParams.authenticationMode.list.find(item => item.value === 'password'),
        });
    }

    /**
     * 显示删除节点
     *
     * @param node 节点
     */
    public showDeleteNodeModal(node) {
        const self = this;
        try {
            // 查询节点是否被工程引用
            const type = this.toolType === ToolType.DIAGNOSE ? '?analysis-type=memory_diagnostic' : '';
            this.vscodeService.get({ url: `/nodes/${node.id}/projects/${type}`}, (res: any) => {
                const data = res.data;
                const memoryProjectList: any = [];
                const sysProjectList: any = [];
                data.memoryProjectList.map((item: any) => {
                  memoryProjectList.push( Object.assign({}, item, {tool: this.i18n.common_term_mem_name}));
                });
                data.projectList.map((item: any) => {
                  sysProjectList.push( Object.assign({}, item, {tool: this.i18n.common_term_pro_name}));
                });
                const projectList = [...memoryProjectList, ...sysProjectList];
                if (projectList.length) {
                    this.showDeleteNodeFailedModal(projectList);
                } else {
                    // '{0}事件所占总事件比例为{1}%', a, b => a事件所占总事件比例为b%
                    const formatString = (str, ...replace) => {
                        replace.forEach((item, index) => {
                            str = str.replace(new RegExp('\\{' + index + '\\}', 'g'), item);
                        });
                        return str;
                    };
                    this.deleteNodeForm.formGroup.controls.username.setValue(node.username);
                    this.deleteNodeTip = formatString(
                        this.i18n.plugins_sysperf_message_nodeManagement.deleteNodeTip, node.nodeIP);
                    this.deleteNodeModal = this.tiModal.open(this.deleteNodeModalComponent, {
                        id: 'deleteNodeModal',
                        modalClass: 'deleteNodeModal nodeManagementModal',
                        context: {
                            node,
                            confirm: (context) => {
                                const values = this.deleteNodeForm.formGroup.getRawValue();
                                this.openFingerPrintConfirmationModal(context.node.nodeIP, context.node.port);
                                const params: any = {
                                    ip: context.node.nodeIP,
                                    user_name: values.username,
                                    verification_method: values.authenticationMode.value
                                };
                                if (params.verification_method === 'password') {
                                    params.password = values.password;
                                } else {
                                    params.identity_file = values.keyFile;
                                    params.passphrase = values.passphrase;
                                }
                                if (params.user_name !== 'root') {
                                    params.root_password = values.rootPassword;
                                }
                                Object.keys(params).forEach(key => {
                                    if (params[key] == null) {
                                        delete params[key];
                                    }
                                });
                                const content = values.username === 'root'
                                    ? this.i18n.plugins_sysperf_message_nodeManagement.sshUseRootConfirmText
                                    : this.i18n.plugins_sysperf_message_nodeManagement.sshConfirmText;
                                if (params.user_name === 'root') {
                                    context.close();
                                    this.addNodeTipModal = this.tiModal.open(this.addNodeTipModalComponent, {
                                        id: 'addNodeTipModal',
                                        modalClass: 'addNodeTipModal nodeManagementModal',
                                        dismiss: modalRef => {
                                            self.resetDeleteNodeForm();
                                        },
                                        context: {
                                            tipInfo: this.fillPlaceholder(content, node.nodeIP),
                                            node,
                                            confirm: (tipContext) => {
                                                self.deleteNode(tipContext, params);
                                            }
                                        }
                                    });
                                } else {
                                    self.deleteNode(context, params);
                                }
                            }
                        },
                        dismiss: modalRef => {
                            this.resetDeleteNodeForm();
                        },
                        draggable: false
                    });
                }
            });
        } catch (error) {
            this.showLoading = false;
        }
    }

    /**
     * 删除节点
     *
     * @param context 上下文信息
     */
    public deleteNode(context, params) {
        this.showLoading = true;
        const timeout = 10000;
        const type = this.toolType === ToolType.DIAGNOSE ? '?analysis-type=memory_diagnostic' : '';
        const option = {
            url: `/nodes/${context.node.id}/${type}`,
            timeout,
            params
        };

        const timeoutCloseLoading = setTimeout(() => {
            this.showLoading = false;
        }, timeout);
        try {
            this.vscodeService.delete(option, (res: any) => {
                this.showLoading = false;
                clearTimeout(timeoutCloseLoading);
                if (res.status) {
                    if (params.user_name === 'root') {
                        context.close();
                        this.generateDeleteNodeForm();
                    }
                    this.vscodeService.showInfoBox(res.message, 'warn');
                } else {
                    const content = this.i18nService.I18nReplace(this.i18n.plugins_sysperf_message_tips.delete_ok, {
                        0: context.node.nodeIP
                    });
                    this.vscodeService.showInfoBox(content, 'info');

                    context.close();
                    this.nodeListComponent.getNodes(false);
                    this.generateDeleteNodeForm();
                }
            });
        } catch (error) {
            this.showLoading = false;
        }
    }

    /**
     * 显示删除节点失败
     *
     * @param nodeData 节点数据
     */
    public showDeleteNodeFailedModal(nodeData: any) {
        const data = nodeData.map((item: any) => {
            return {
                projectName: item.projectname,
                tool: item.tool
            };
        });
        // 表格源数据，开发者对表格的数据设置请在这里进行
        this.deleteNodeFailedReason.srcData = {
            data,
            state: {
                searched: false, // 源数据未进行搜索处理
                sorted: false,   // 源数据未进行排序处理
                paginated: false // 源数据未进行分页处理
            }
        };

        this.deleteNodeFailedModal = this.tiModal.open(this.deleteNodeFailedModalComponent, {
            id: 'deleteNodeFailedModal',
            modalClass: 'deleteNodeFailedModal nodeManagementModal',
            draggable: false
        });
    }


    // 节点参数表单
    private deepClone(obj: any): any {
        if (typeof (obj) !== 'object' || obj === null) {
            return obj;
        }

        let clone: any;

        clone = Array.isArray(obj) ? obj.slice() : { ...obj };

        const keys: Array<string> = Object.keys(clone);

        for (const key of keys) {
            clone[key] = this.deepClone(clone[key]);
        }

        return clone;
    }

    /**
     * 生成表单元素
     *
     * @param formEl 表单元素
     */
    public generateForm(formEl) {
        const nodeParams = this.deepClone(this.nodeParams);

        formEl.displayOrder.forEach(key => {
            formEl.form[key] = nodeParams[key];
        });
    }

    /**
     * 生成表单元素验证
     *
     * @param formEl 表单元素
     */
    public generateFormGroup(formEl) {
        const validation = {};
        Object.keys(formEl.form).forEach(key => {
            const formItem = formEl.form[key];

            const validators = [];

            if (formItem.required) {
                validators.push(TiValidators.required);
            }

            if (formItem.customValidators) {
                validators.push(...formItem.customValidators);
            }

            validation[key] = new FormControl('', validators);

            // 设置每个元素的disabledReason为{}；就不一一设置了
            if (!formItem.disabledReason) {
                formItem.disabledReason = {};
            }

            formItem.order = formEl.displayOrder.indexOf(key);
        });

        formEl.formGroup = new FormBuilder().group(validation);

        // 先给不在显示的元素全部加一次禁用【禁用表单验证】，switchDiaplayWhenChange会解开相关的禁用
        this.setElementDisabledState({
            formEl,
            list: formEl.displayOrder.filter(key => !formEl.displayedElementList.includes(key)),
            reason: {
                key: 'switchDisplay',
                des: '',
            },
            operate: 'add',
        });
    }

    /**
     * 初始化默认值
     */
    public initDefaultValue({ formEl, list, triggerMode }) {
        list.forEach(key => {
            const el = formEl.form[key];

            if (['select'].includes(el.type)) {
                const option = el.list.find(item => item.checked);

                if (option) {
                    formEl.formGroup.controls[key].setValue(option);

                    if (triggerMode === 'manual' && typeof el.change === 'function') {
                        el.change(option);
                    }
                }
            } else {
                if (el.value !== undefined) {
                    formEl.formGroup.controls[key].setValue(el.value);

                    if (triggerMode === 'manual' && typeof el.change === 'function') {
                        el.change(el.value);
                    }
                }
            }
        });
    }

    /**
     * 修改显示元素列表
     */
    public setDisplayedElementList({ formEl, operate, list }: {
        formEl: any,
        operate: 'add' | 'reduce';
        list: string[];
    }) {
        if (operate === 'add') {
            list.forEach(item => {
                if (!formEl.displayedElementList.includes(item)) {
                    formEl.displayedElementList.push(item);
                }
            });
        } else if (operate === 'reduce') {
            list.forEach(item => {
                if (formEl.displayedElementList.includes(item)) {
                    formEl.displayedElementList.splice(formEl.displayedElementList.indexOf(item), 1);
                }
            });
        }

        // 禁用不显示的选项 / 解禁需要显示的选项 【禁用选项可以禁用校验】
        this.setElementDisabledState({
            formEl,
            list,
            reason: {
                key: 'switchDisplay',
                des: '',
            },
            operate: operate === 'add' ? 'reduce' : 'add',
        });
    }

    /**
     * 设置表单禁用(禁用掉表单校验)
     */
    public setElementDisabledState({ formEl, list, reason, operate }: {
        formEl: any,
        list: string[];
        reason: {
            key: string;
            des: string;
        };
        operate: 'add' | 'reduce';
    }) {
        list.forEach(key => {
            const disabledReason = formEl.form[key].disabledReason;

            if (operate === 'add') {
                disabledReason[reason.key] = reason.des;
            } else if (operate === 'reduce') {
                delete disabledReason[reason.key];
            }

            const status = Object.keys(disabledReason).length ? 'disable' : 'enable';
            formEl.formGroup.controls[key][status]();
        });
    }

    /**
     * 获取表单信息【基于任务】
     */
    public getFormParams({ formEl }) {
        const values = formEl.formGroup.getRawValue();
        const params: any = {};

        formEl.displayedElementList.forEach(key => {
            const el = formEl.form[key];

            if (el.interfaceName) {
                let current = params;

                el.interfaceName.forEach((item, index) => {
                    if (index === el.interfaceName.length - 1) {
                        if (el.type === 'select') {
                            current[item] = values[key].value;
                        } else if (el.type === 'inputNumber' && el.uploadMode === 'string') {
                            current[item] = values[key] + '';
                        } else {
                            current[item] = values[key];
                        }
                    } else {
                        if (current[item] === undefined) {
                            current[item] = {};
                        }

                        current = current[item];
                    }
                });
            }
        });

        return params;
    }

    /**
     * 改变密文
     */
    changeType(type) {
        this.textType['type' + type] = 'password';
    }

    /**
     *  改变明文
     */
    changeType1(type) {
        this.textType['type' + type] = 'text';
    }

    /**
     * 响应批量导入事件的点击
     * @param _ 无用参数
     */
    onBatchImportClick(_: any) {
        this.batchController?.action(BatchOptType.Import);
    }

    /**
     * 响应批量删除事件的点击
     * @param  _ 无用参数
     */
    onBatchDeleteClick(_: any) {
        this.batchController?.action(BatchOptType.Delete);
    }

    /**
     * 响应批量操作组件的初始化
     * @param ctl 批量操作的状态控制器
     */
    onBatchInited(ctl: StateController) {
        this.batchController = ctl;
    }

    /**
     * 响应批量操作组件的分发
     * @param ctl 批量操作的状态控制器
     */
    onBatchDispatsh(dispatchInfo: DispatchInfo) {
      if ([BatchOptEvent.DeleteSuccess, BatchOptEvent.ImportSuccess].includes(
        dispatchInfo.event
      )) {
        this.nodeListComponent.getNodes(false);
      }
    }

    /**
     * 填充字符串的占位符
     * 例如：'{0}事件所占总事件比例为{1}%'.format(a, b) => a事件所占总事件比例为b%
     * @param targetString 要替换的字符串
     * @param actualContent 实际内容
     */
    private fillPlaceholder(targetString: string, ...actualContent: string[]) {
        for (let i = 0; i < actualContent.length; i++) {
            targetString = targetString.replace(new RegExp(`\\{${i}\\}`, 'g'), actualContent[i]);
        }
        return targetString;
    }

    // -- 确认指纹/root用户二次确认弹框 --
    /**
     * 初始化指纹确认表格
     */
    private initFingerPrintConfirmationTable() {
        this.fingerPrintConfirmationTable.columns = [
            { prop: 'hashType', title: this.i18n.plugins_sysperf_message_nodeManagement.hashType, width: '100px' },
            { prop: 'keyType', title: this.i18n.plugins_sysperf_message_nodeManagement.keyType, width: '100px' },
            { prop: 'fingerPrint', title: this.i18n.plugins_sysperf_message_nodeManagement.fingerPrint },
        ];
    }

    /**
     * 确认指纹/root用户二次确认
     * @param nodeIP 节点IP
     * @param port 端口
     * @param isRoot 是否是root账号，root账号二次确认
     */
    private openFingerPrintConfirmationModal(nodeIP: string, port?: number) {
        this.queryNodeInfoService.getFingerPrint(nodeIP, port).then((fingerPrint) => {
            const fingerPrintList: Array<TiTableRowData> = [];
            Object.keys(fingerPrint).forEach((hashType: keyof typeof fingerPrint) => {
                fingerPrint[hashType].forEach(item => {
                    fingerPrintList.push({
                        hashType: item.hash_type,
                        keyType: item.key_type,
                        fingerPrint: item.finger_print,
                    });
                });
            });
            this.fingerPrintConfirmationTable.srcData.data = fingerPrintList;
        });
    }
    /**
     * 校验端口范围
     */
    public checkIP() {
        return (control: AbstractControl): ValidationErrors | null => {
            if (control.value >= 1 && control.value <= 65535) {
                return null;
            } else {
                return { ipValid: { tiErrorMessage: this.i18n.validata.overRange }};
            }
        };
    }

    /**
     * 监听节点是否为最大
     * @param allow 是否为最大节点的标志
     */
    onMaxNodeAllow(allow: boolean) {
        this.isMaxNodeAllow = allow;
    }
}
