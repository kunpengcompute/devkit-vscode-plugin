import { Component, OnInit, Input } from '@angular/core';
import { I18nService } from '../../service/i18n.service';
import { AxiosService } from '../../service/axios.service';

@Component({
    selector: 'app-system-config',
    templateUrl: './system-config.component.html',
    styleUrls: ['./system-config.component.scss']
})
export class SystemConfigComponent implements OnInit {
    @Input() projectName: any;
    @Input() taskName: any;
    @Input() analysisType: any;
    @Input() taskid: any;
    @Input() nodeid: any;
    i18n: any;

    public configItemData: any = { data: {}, language: 'zh' };
    public leftMenuList: Array<any> = [];
    public item: any = { level1: 'hard', level2: 'cpu' };
    public showDetail = 0;
    public noDataMsg = '';
    constructor(public i18nService: I18nService, public Axios: AxiosService) {
        this.i18n = this.i18nService.I18n();
    }

    /**
     * converUrl
     * @param data data
     */
    public converUrl(data) {
        const result = [];
        for (const key of Object.keys(data)) {
            const value = data[key];
            if (value.constructor === Array) {
                value.forEach((val) => {
                    result.push(key + '=' + val);
                });
            } else {
                result.push(key + '=' + value);
            }
        }
        return result.join('&');
    }

    /**
     * getType
     */
    public async getType() {
        const res = await this.Axios.axios.get('/tasks/'
            + this.taskid + '/common/configuration/?node-id=' + this.nodeid);
        // 确定左侧菜单初始状态
        const types = res.data.task_param.type;
        types.forEach(item => {
            if (item === 'hard') {
                this.leftMenuList[0].disable = false;
            }
            if (item === 'soft') {
                this.leftMenuList[1].disable = false;
            }
            if (item === 'env') {
                this.leftMenuList[2].disable = false;
            }
        });
        if (types.indexOf('hard') !== -1) {
            this.leftMenuList[0].expand = true;
            this.leftMenuList[0].children[0].active = true;
            this.item = { level1: 'hard', level2: 'cpu' };
        } else if (types.indexOf('soft') !== -1) {
            this.leftMenuList[1].expand = true;
            this.leftMenuList[1].children[0].active = true;
            this.item = { level1: 'soft', level2: 'normal_msg' };
        } else if (types.indexOf('env') !== -1) {
            this.leftMenuList[2].expand = true;
            this.leftMenuList[2].children[0].active = true;
            this.item = { level1: 'env', level2: 'docker' };
        }
        this.getConfigData(this.item);

    }
    /**
     * 获取配置数据
     * @param item item
     */
    public getConfigData(item) {
        this.showDetail = 1;
        const param = {
            'node-id': this.nodeid,

            'query-type': item.level1,

            'query-target': item.level2,

        };
        this.Axios.axios.get('/tasks/' + this.taskid + '/sys-config/?' + encodeURIComponent(this.converUrl(param)))
            .then((resp) => {
                this.noDataMsg = resp.message;
                if (resp.data && Object.keys(resp.data).length > 0) {
                    this.configItemData.data = resp.data;
                    this.showDetail = 2;
                } else {
                    this.showDetail = 3;
                }
            })
            .catch((error) => {
                this.noDataMsg = error.response.message;
                this.showDetail = 3;
            });
    }

    /**
     * 一级菜单展开隐藏
     * @param data data
     * @param level1 level1
     */
    public toggleExpand(data, level1) {
        if (level1.disable === true) { return; }
        const configIndex = this.leftMenuList.findIndex(val => val.title === data);
        this.leftMenuList[configIndex].expand = !this.leftMenuList[configIndex].expand;
    }

    /**
     * 二级菜单选择
     * @param data1 data1
     * @param data2 data2
     */
    public getConfigDetail(data1, data2) {

        this.leftMenuList.forEach(ele => ele.children.forEach(item => item.active = false));
        const configIndex = this.leftMenuList.findIndex(val => val.title === data1);
        const detailIndex = this.leftMenuList[configIndex].children.findIndex(el => el.title === data2);
        this.leftMenuList[configIndex].children[detailIndex].active = true;
        this.item.level1 = this.leftMenuList[configIndex].head;
        this.item.level2 = this.leftMenuList[configIndex].children[detailIndex].params;
        this.getConfigData(this.item);
    }

    /**
     * ngOnInit
     */
    ngOnInit() {

        this.leftMenuList = [
            {
                title: this.i18n.sys_cof.check_types.hard,
                head: 'hard',
                expand: false,
                disable: true,
                children: [{
                    title: this.i18n.sys_cof.sum.cpu, params: 'cpu',
                    info: ['cfg_cpu_type', 'cfg_cpu_freq', 'cfg_cpu_core', 'cfg_numa_info'], active: false
                },
                {
                    title: this.i18n.sys_cof.sum.mem, params: 'mem',
                    info: ['cfg_mem_capacity', 'cfg_mem_freq', 'cfg_mem_max_capacity'], active: false
                },
                {
                    title: this.i18n.sys_cof.sum.disk, params: 'disk',
                    info: ['cfg_disk_manufacturer', 'cfg_disk_size', 'cfg_disk_type', 'cfg_disk_hdd'], active: false
                },
                {
                    title: this.i18n.sys_cof.sum.pcie, params: 'pcie',
                    info: ['cfg_pcie_bus', 'cfg_pcie_class', 'cfg_pcie_width', 'cfg_pcie_max_payload'], active: false
                },
                {
                    title: this.i18n.sys_cof.sum.network, params: 'network',
                    info: ['cfg_ethernet_susppend', 'cfg_ethernet_offload', 'cfg_ethernet_list',
                        'cfg_ether_numa_irq_num', 'cfg_ether_numa_irq_affinity_list', 'cfg_ether_numa_queue_tx',
                        'cfg_ether_numa_queue_rx'], active: false
                },

                { title: this.i18n.sys_cof.sum.raid, params: 'raid', active: false },
                { title: this.i18n.sys_cof.sum.firmware, params: 'cfg_firm_ver', active: false },
                ]
            },
            {
                title: this.i18n.sys_cof.check_types.soft,
                head: 'soft',
                disable: true,
                expand: false,
                children: [
                    {
                        title: this.i18n.sys_cof.sum.normal_msg, params: 'normal_msg',
                        info: ['cfg_soft_version', 'cfg_os_version', 'cfg_kernel_version', 'cfg_jdk_version',
                            'cfg_glibc_version', 'cfg_smmu_info', 'cfg_page_size', 'cfg_transparent_info',
                            'cfg_dirty_time', 'cfg_dirty_ratio', 'cfg_dirty_memratio', 'cfg_hz_info',
                            'cfg_nohz_info'], active: false
                    },
                    {
                        title: this.i18n.sys_cof.sum.raid_level, params: 'raid',
                        info: ['cfg_disk_ahead', 'cfg_disk_scheduler'], active: false
                    },
                    {
                        title: this.i18n.sys_cof.sum.storage_msg, params: 'storage_msg',
                        info: ['cfg_disk_ahead', 'cfg_disk_scheduler'], active: false
                    },
                    {
                        title: this.i18n.sys_cof.sum.file_system_msg, params: 'file_system_msg',
                        info: ['cfg_fs_mount', 'cfg_fs_type'], active: false
                    },
                ]
            },
            {
                title: this.i18n.sys_cof.check_types.env,
                head: 'env',
                disable: true,
                expand: false,
                children: [{
                    title: this.i18n.sys_cof.sum.docker, params: 'docker',
                    info: ['cfg_kvm_info', 'cfg_docker_info'], active: false
                },
                ]

            }
        ];
        this.getType();

        this.configItemData.language = I18nService.getLang() === 0 ? 'zh' : 'en';
    }
}
