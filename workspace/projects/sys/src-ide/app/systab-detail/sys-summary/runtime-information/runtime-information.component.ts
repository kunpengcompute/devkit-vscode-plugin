import { Component, OnInit, ViewChild, Input, NgZone, ChangeDetectorRef } from '@angular/core';
import { AxiosService } from '../../../service/axios.service';
import { I18nService } from '../../../service/i18n.service';
import { COLOR_THEME, currentTheme, VscodeService } from '../../../service/vscode.service';

@Component({
    selector: 'app-runtime-information',
    templateUrl: './runtime-information.component.html',
    styleUrls: ['../sys-summary.component.scss', './runtime-information.component.scss']
})
export class RuntimeInformationComponent implements OnInit {

    constructor(
        public i18nService: I18nService,
        public changeDetectorRef: ChangeDetectorRef,
        private zone: NgZone,
        public Axios: AxiosService,
        public vscodeService: VscodeService) {
        this.i18n = this.i18nService.I18n();
    }
    @Input() runtimeInformationData: any;
    @Input() taskid: any;
    @Input() nodeid: any;
    @Input() Unfold: any;
    @Input() pagesizeTipStr: any;
    @ViewChild('viewDetailMask', { static: false }) viewDetailMask: any;
    public language = 'zh';
    public currTheme = COLOR_THEME.Dark;
    public resData: any = {};
    public noralMsgData: any = { baseInfo: [], memManage: [], netWorks: [] };
    public dockerData: any = [{}, {}, {}]; // 虚拟机data
    public configDetail = [
        { key: 'system_dmesg', value: 'systemDmesg' },
        { key: 'docker images', value: 'dockerImage' },
        { key: 'kernelConfig', value: 'kernelConfig' },
        { key: 'env', value: 'env' },
        { key: 'docker info', value: 'dockerInfo' },
        { key: 'sysctrl', value: 'sysctl' },
        { key: 'cmdline', value: 'cmdline' }
    ];
    public configDetailItem = {
        title: '',
        data: '',
    };
    public toggle = {   //  用于判断打开关闭
        environmentalInformation: false, // 运行时环境信息
    };
    public cmdIfClick = false;
    public i18n;
    public nodeKvmData = true;

    // 获取主题颜色
    public ColorTheme = {
        Dark: COLOR_THEME.Dark,
        Light: COLOR_THEME.Light
    };

    /**
     * 组件初始化
     */
    ngOnInit() {
        this.currTheme = currentTheme();

        this.vscodeService.regVscodeMsgHandler('colorTheme', (msg: any) => {
            this.currTheme = msg.colorTheme;
        });

        if (this.Unfold) {
            this.toggle.environmentalInformation = true;
        }
        if (self.webviewSession.getItem('language') === 'en' || self.webviewSession.getItem('language') === 'en-us') {
            this.language = 'en';
        } else {
            this.language = 'zh';
        }

        if (JSON.stringify(this.runtimeInformationData) !== '{}') {
            this.getOperationData(this.runtimeInformationData);
        }
    }

    /**
     * 获取数据长度
     * @param data 数据
     */
    public maxLength(data: any) {
        let num = 0;
        for (const item in data) {
            if (data[item].length > num) {
                num = data[item].length;
            }
        }
        return num;
    }

    /**
     * 查看详情
     * @param item 数据
     */
    public viewDetail(item, index) {
        if (item.data !== this.i18n.sys.viewDetails) {
            return;
        } else {
            const params = this.configDetail.find(val => {
                return val.key === item.key;
            });
            const params1 = {
                nodeId: this.nodeid,
                queryType: 'config',
                queryTarget: params.value,
                // 例如overView，CPU，net，storage，memory
            };
            const requestOption = {
                url: '/tasks/' + this.taskid + '/sys-performance/config-detail/?' + this.Axios.converUrl(params1)
            };
            this.vscodeService.get(requestOption, (res: any) => {
                this.configDetailItem.title = item.title;
                if (res.data === 'not message' || res.data === 'file not exist') {
                    this.configDetailItem.data = '';
                } else {
                    this.configDetailItem.data = res.data.join('\n');
                }
                this.viewDetailMask.Open();
                this.updateWebViewPage();
            });
        }
        if (index === -1) {
            this.cmdIfClick = true;
        } else {
            this.noralMsgData.baseInfo[1][index].ifClick = true;
        }
    }

    /**
     * kvm 虚拟机配置参数
     * @param item item
     * @param i index
     */
    public kvmConfig(item, i) {
        this.configDetailItem.title = item.slice(13);
        this.configDetailItem.data = this.resData.docker.virsual.kvm_info[item].join('\n');

        this.viewDetailMask.Open();
        this.dockerData[1].data[i].ifClick = true;
    }
    /**
     * 获取运行时环境信息
     * @param itemData 数据
     */
    public getOperationData(itemData: any) {
        this.resData = itemData;
        const data = this.resData.noral_msg;
        const NetworkCardVersion = [];
        const NetworkCardVersion1 = [];
        const NetworkCardVersion2 = [];
        const NetworkCardVersion3 = [];
        this.resData.version.net_name.forEach((val: string, index: number) => {
            const obj = { title: '', data: '' };
            obj.title = val;
            obj.data = this.resData.version.net_version[index] === 'NULL'
                ? '--' : this.resData.version.net_version[index];
            if ((index + 1) % 3 === 0) {
                NetworkCardVersion3.push(obj);
            } else if ((index + 1) % 3 === 1) {
                NetworkCardVersion1.push(obj);
            } else {
                NetworkCardVersion2.push(obj);
            }
            NetworkCardVersion.push(obj);
        });
        this.noralMsgData = {
            baseInfo: [[{
                title: this.i18n.sys_cof.sum.bios,
                data: data.cfg_soft_version[0] || '--',
                tipStr: this.language === 'zh'
                    ? data.suggest.suggest_chs_cfg_soft_version.join('\n')
                    : data.suggest.suggest_chs_cfg_soft_version.join('\n'),
            },
            {
                title: this.i18n.sys_cof.sum.os,
                data: data.cfg_os_version[0] || '--',
                tipStr: this.language === 'zh'
                    ? data.suggest.suggest_chs_cfg_os_version.join('\n')
                    : data.suggest.suggest_chs_cfg_os_version.join('\n'),

            },
            {
                title: this.i18n.sys_cof.sum.kernel,
                data: data.cfg_kernel_version[0] || '--',
                tipStr: this.language === 'zh'
                    ? data.suggest.suggest_chs_cfg_kernel_version.join('\n')
                    : data.suggest.suggest_chs_cfg_kernel_version.join('\n'),

            },
            {
                title: this.i18n.sys_cof.sum.jdk,
                data: data.cfg_jdk_version[0] || '--',
                tipStr: this.language === 'zh'
                    ? data.suggest.suggest_chs_cfg_jdk_version.join('\n')
                    : data.suggest.suggest_chs_cfg_jdk_version.join('\n'),

            },
            {
                title: this.i18n.sys_cof.sum.glibc,
                data: data.cfg_glibc_version || '--',
                tipStr: this.language === 'zh'
                    ? data.suggest.suggest_chs_cfg_glibc_version.join('\n')
                    : data.suggest.suggest_chs_cfg_glibc_version.join('\n'),

            }],
            [{
                key: 'system_dmesg',
                title: this.i18n.sys_cof.loginfo,
                data: this.i18n.sys.viewDetails,
                ifClick: false
            },
            {
                key: 'docker info',
                title: this.i18n.sys_cof.dockerinfo,
                data: this.i18n.sys.viewDetails,
                ifClick: false
            },
            {
                key: 'sysctrl',
                title: this.i18n.sys_cof.systemparameters,
                data: this.i18n.sys.viewDetails,
                ifClick: false
            },
            {
                key: 'kernelConfig',
                title: this.i18n.sys_cof.kernelconfiguration,
                data: this.i18n.sys.viewDetails,
                ifClick: false
            },
            {
                key: 'docker images',
                title: this.i18n.sys_cof.dockerimage,
                data: this.i18n.sys.viewDetails,
                ifClick: false
            }
            ],
            [
                {
                    title: this.i18n.sys_cof.sum.firmware_info.bmc_version,
                    data: this.resData.firm_ver.get_firm_ver.BMC === 'not supported'
                        ? '-- ' : this.resData.firm_ver.get_firm_ver.BMC
                }
            ]],
            memManage: [[{
                title: this.i18n.sys_cof.sum.smmu,
                data: !Array.isArray(data.cfg_smmu_info) ? '--' : data.cfg_smmu_info.length > 0 ?
                    this.i18n.sys_cof.sum.open : this.i18n.sys_cof.sum.close,
                tipStr: this.language === 'zh' ?
                    data.suggest.suggest_chs_cfg_smmu_info.join('\n') :
                    data.suggest.suggest_en_cfg_smmu_info.join('\n'),
            },
            {
                title: this.i18n.sys_cof.sum.page_size,
                data: data.cfg_page_size + ' B',
                tipStr: this.language === 'zh' ?
                    data.suggest.suggest_chs_cfg_page_size.join('\n') :
                    data.suggest.suggest_en_cfg_page_size.join('\n'),
                tipStr2: this.pagesizeTipStr,
            },
            {
                title: this.i18n.sys_cof.sum.tran_page,
                data: data.cfg_transparent_info || '--',
                tipStr: this.language === 'zh' ?
                    data.suggest.suggest_chs_cfg_transparent_info.join('\n') :
                    data.suggest.suggest_en_cfg_transparent_info.join('\n'),
            },
            {
                title: this.i18n.sys_summary.cpupackage_tabel.standard_page,
                data: data.cfg_hugepage_size[0] || '--',
            },
            {
                title: this.i18n.sys_summary.cpupackage_tabel.page_number,
                data: data.cfg_hugepage_num[0] === 0 ?
                    data.cfg_hugepage_num[0] : data.cfg_hugepage_num[0] ? data.cfg_hugepage_num[0] : '--',
            },
            {
                title: this.i18n.sys_summary.cpupackage_tabel.partition,
                data: data.cfg_vm_swappiness[0] || '--',
                tip: this.i18n.sys_summary.cpupackage_tabel.partitiondetail,
            }],
            [{
                title: this.i18n.sys_cof.sum.dirty_time,
                data: data.cfg_dirty_time || '--',
                tipStr: this.language === 'zh' ?
                    data.suggest.suggest_chs_cfg_dirty_time.join('\n') :
                    data.suggest.suggest_en_cfg_dirty_time.join('\n'),
            },
            {
                title: this.i18n.sys_cof.sum.dirty_ratio,
                data: data.cfg_dirty_ratio || '--',
                tipStr: this.language === 'zh' ?
                    data.suggest.suggest_chs_cfg_dirty_ratio.join('\n') :
                    data.suggest.suggest_en_cfg_dirty_ratio.join('\n'),
            },
            {
                title: this.i18n.sys_cof.sum.dirty_memratio,
                data: data.cfg_dirty_memratio || '--',
                tipStr: this.language === 'zh'
                    ? data.suggest.suggest_chs_cfg_dirty_memratio.join('\n')
                    : data.suggest.suggest_en_cfg_dirty_memratio.join('\n'),
            },
            {
                title: this.i18n.sys_summary.cpupackage_tabel.data_interval,
                data: data.cfg_dirty_interval[0] || '--',
            },
            {
                title: this.i18n.sys_summary.cpupackage_tabel.idle + '(KB)',
                data: data.cfg_vm_minfreekbyte[0] || '--',
            }],
            [{
                title: this.i18n.sys_cof.sum.hz_info,
                data: data.cfg_hz_info.length === 0 ? '--' : data.cfg_hz_info[0],
                tipStr: this.language === 'zh' ?
                    data.suggest.suggest_chs_cfg_hz_info.join('\n') : data.suggest.suggest_en_cfg_hz_info.join('\n'),
            },
            {
                title: this.i18n.sys_cof.sum.nohz_info,
                data: data.cfg_nohz_info[0] ? data.cfg_nohz_info[0] === 'Not Support'
                    ? '--' : data.cfg_nohz_info[0] : '--',
                tipStr: this.language === 'zh'
                    ? data.suggest.suggest_chs_cfg_nohz_info.join('\n')
                    : data.suggest.suggest_en_cfg_nohz_info.join('\n'),
                tipStr2: data.optimize.suggestion !== null ?
                    data.optimize.suggestion.indexOf('suggest_chs_cfg_nohz_info') !== -1 ?
                        this.language === 'zh' ? data.suggest.suggest_chs_cfg_nohz_info.join('\n') :
                            data.suggest.suggest_en_cfg_nohz_info.join('\n') : 'NULL' : 'NULL',
            },
            {
                title: 'cmdline',
                key: 'cmdline',
                data: this.i18n.sys.viewDetails,
            }]],
            netWorks: [NetworkCardVersion1, NetworkCardVersion2, NetworkCardVersion3, NetworkCardVersion]
        };

        const kvmMessage = [];
        this.resData.docker.virsual.kvm_info.cfg_xml_list.forEach(item => {
            const obj = {
                title: item,
                ifClick: false
            };
            kvmMessage.push(obj);
        });
        if (kvmMessage.length === 0) {
            this.nodeKvmData = true;
        } else {
            this.nodeKvmData = false;
        }
        this.dockerData = [
            {
                title: this.i18n.sys_cof.sum.virtual_info.virtual_os,
                data: this.resData.docker.virsual.version[0] ? this.resData.docker.virsual.version[0] : '--'
            },
            {
                title: this.i18n.sys_cof.sum.virtual_info.virtual_config,
                data: kvmMessage.length === 0 ? '--' : kvmMessage,
            },
            {
                title: this.i18n.sys_cof.sum.virtual_info.virtual_docker,
                data: this.resData.docker.virsual.docker_info[0] ? this.resData.docker.virsual.docker_info[0] : '--'
            }
        ];
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

}
