import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { I18nService } from '../../../service/i18n.service';
import { TiTableColumns, TiTableRowData, TiTableSrcData } from '@cloud/tiny3';
import { AxiosService } from '../../../service/axios.service';
import { VscodeService, COLOR_THEME, HTTP_STATUS } from '../../../service/vscode.service';
import { HyTheme, HyThemeService } from 'hyper';

/**
 * 场景类型
 */
const enum SCENCE_TYPE {
    BIG_DATA = 101,
    DISTRIBUTED_STORAGE = 1
}
@Component({
    selector: 'app-config-information',
    templateUrl: './config-information.component.html',
    styleUrls: ['./config-information.component.scss']
})
export class ConfigInformationComponent implements OnInit {
    @Input() nodeid: any;
    @Input() taskid: any;
    @Input() currTheme: any;
    @Input() sceneSolution: any;
    @ViewChild('viewDetailMask', { static: false }) viewDetailMask: any;
    public headData: any = [];
    public hardData: any = [];
    public systemData: any = [];
    public componentData: any = [];
    public hardConfigData: any = [];
    public softConfigData: any = [];
    public searchComponent: Array<any>; // 搜索结果展示项
    public originComponentData: Array<any>;

    public toggle = {
        hard: true,
        soft: true,
        hardTab: true,
        syttemTab: true,
        componentTab: true,
    };
    // 硬件
    public hardTitle: Array<TiTableColumns> = [];
    public hardDisplayData: Array<TiTableRowData> = [];
    public hardContentData: TiTableSrcData;
    public hardCurrentPage = 1;
    public hardPageSize = {
        options: [10, 20, 50, 100],
        size: 10
    };
    public hardTotalNumber = 0;
    // 系统
    public systemTitle: Array<TiTableColumns> = [];
    public systemDisplayData: Array<TiTableRowData> = [];
    public systemContentData: TiTableSrcData;
    public systemCurrentPage = 1;
    public systemPageSize = {
        options: [10, 20, 50, 100],
        size: 10
    };
    public systemTotalNumber = 0;
    // 组件
    public componentitle: Array<TiTableColumns> = [];
    public componentDisplayData: Array<TiTableRowData> = [];
    public componentContentData: TiTableSrcData;
    public componentCurrentPage = 1;
    public componentPageSize = {
        options: [10, 20, 50, 100],
        size: 10
    };
    public componentTotalNumber = 0;

    public ifConfig = false;  // 判断点击的是 查看还是优化建议
    public language = 'zh';
    public scene: string;
    public nodeData = false;  // 虚拟机容器没有数据
    public isMySQL = false;
    public MySQLData: object[] = [];
    public nodataTips: string;
    public i18n: any;
    public value = ''; // 搜索输入
    public searchWords: Array<string> = [''];

    public ColorTheme = {
        Dark: HyTheme.Dark,
        Light: HyTheme.Light
    };
    public suggestHover = false;
    public isSuggest = false;  // 是否按下全量建议
    public closeHover = false;
    constructor(
        public i18nService: I18nService,
        public Axios: AxiosService,
        public vscodeService: VscodeService,
    ) {
        this.i18n = this.i18nService.I18n();
    }
    /**
     * 组件初始化
     */
    ngOnInit() {
        this.language = I18nService.getLang() === 0 ? 'zh' : 'en';
        if (this.sceneSolution === 2) {
            this.headData = [
                {
                    title: this.i18n.sys_summary.distributed.applicationType,
                    data: '',
                },
                {
                    title: this.i18n.sys_summary.distributed.databaseType,
                    data: '',
                },
            ];
        } else {
            this.headData = [
                {
                    title: this.i18n.sys_summary.distributed.applicationType,
                    data: '',
                },
                {
                    title: this.i18n.sys_summary.distributed.componentInformation,
                    data: '',
                },
                {
                    title: this.i18n.sys_summary.distributed.applicationScenario,
                    data: '',
                }
            ];
        }
        this.hardTitle = [
            {
                title: this.i18n.sys_summary.distributed.hardConfig
            },
            {
                title: this.i18n.sys_summary.distributed.currentValue
            },
            {
                title: this.i18n.sys_summary.distributed.suggestedValue
            },
            {
                title: this.i18n.sys_summary.distributed.Suggestion
            },
        ];
        this.systemTitle = [
            {
                title: this.i18n.sys_summary.distributed.systemCongif
            },
            {
                title: this.i18n.sys_summary.distributed.currentValue
            },
            {
                title: this.i18n.sys_summary.distributed.suggestedValue
            },
            {
                title: this.i18n.sys_summary.distributed.Suggestion
            },
        ];
        this.componentitle = [
            {
                title: this.i18n.sys_summary.distributed.componentConfig
            },
            {
                title: this.i18n.sys_summary.distributed.currentValue
            },
            {
                title: this.i18n.sys_summary.distributed.suggestedValue
            },
            {
                title: this.i18n.sys_summary.distributed.Suggestion
            },
        ];
        this.getCondigData();
    }
    /**
     * 查看配置，建议
     * @param e boolean 类型
     */
    public viewConfig(e: any) {
        this.ifConfig = e;
        if (!e) {
            this.isSuggest = true;
        }
        this.viewDetailMask.Open();
    }
    /**
     * 关闭弹框
     */
    public closeDetailMask() {
        this.viewDetailMask.Close();
        this.isSuggest = false;
        this.suggestHover = false;
    }

    /**
     * 获取配置数据
     */
    private getCondigData() {
        this.nodataTips = this.i18n.loading;
        this.vscodeService.get({
            url: '/tasks/' + this.taskid + '/sys-performance/scene-config-detail/?nodeId=' + this.nodeid
        }, (res: any) => {
            if (res.status === HTTP_STATUS.HTTP_400_BAD_REQUEST) {
                this.vscodeService.showInfoBox(this.i18n.sys_summary.distributed.no_scene_data, 'warn');
            } else if (res.data && Object.keys(res.data).length) {
                res.data.sceneData.forEach((item: any, index: any) => {
                    this.headData[index].data = this.language === 'zh' ? item[1] : item[2];
                });
                this.scene = res.data.sceneData[0][2];
                if (res.data.sceneData[1][1].indexOf('MySQL') > -1) {
                    this.isMySQL = true;
                }
                if (res.data.hard === 'NOT SUPPORT') {
                    this.nodeData = true;
                    return;
                }
                this.recommendation(res.data.data);
                let configData: { [x: string]: any; hard?: any; soft?: any; };
                if (this.language === 'zh') {
                    configData = res.data.environment;
                } else {
                    configData = res.data.environment_en;
                }
                if (this.isMySQL) {
                    this.MySQLData = [];
                    const list = Object.keys(configData);
                    list.forEach(val => {
                        const item = { toggle: true, title: '', data: [{}] };
                        item.toggle = true;
                        item.title = val;
                        item.data = configData[val];
                        this.MySQLData.push(item);
                    });
                } else {
                    const hardArr: any = [];
                    const softArr: any = [];
                    configData.hard.forEach((item: any) => {
                        const obj = {
                            title: item[0],
                            data: item.slice(1),
                        };
                        obj.data = obj.data.map((str: any) => {
                            return str.split(/\/|;|；/g);
                        })[0];
                        hardArr.push(obj);
                    });
                    configData.soft.forEach((item: any) => {
                        const obj = {
                            title: item[0],
                            data: item.slice(1),
                        };
                        obj.data = obj.data.map((str: any) => {
                            return str.split(/\/|;/g);
                        })[0];
                        softArr.push(obj);
                    });
                    this.hardConfigData = hardArr;
                    this.softConfigData = softArr;
                }
            }
        });
    }
    /**
     * 获取全量建议
     * @param data 任务节点
     */
    private recommendation(data: any) {
        this.getHardData(data.hard);
        this.getSystemData(data.system);
        this.getComponentData(data.component);
        this.originComponentData = data.component;
    }
    /**
     * 获取硬件数据
     * @param data 任务节点
     */
    private getHardData(data: any) {
        const hardData: any = [];
        const hatdConfigData: any = [];
        data.forEach((item: any) => {
            const obj = {
                config: item.indicators,
                current: item.cur_value,
                suggest: item.value,
                suggestValue: this.language === 'zh' ? item.sug : item.sug_en,
            };
            const object = {
                declaration: this.language === 'zh' ? item.declaration_ch : item.declaration_en,
                title: item.indicators,
                data: item.cur_value,
                tip: item.equal ? 'NULL' : this.language === 'zh' ? item.sug : item.sug_en
            };
            hardData.push(obj);
            hatdConfigData.push(object);
        });
        this.hardTotalNumber = hardData.length;
        this.hardData = hatdConfigData;
        this.hardContentData = {
            data: hardData,
            state: {
                searched: false, // 源数据未进行搜索处理
                sorted: false, // 源数据未进行排序处理
                paginated: false // 源数据未进行分页处理
            }
        };
    }
    /**
     * 获取系统数据
     * @param data 任务分析节点
     */
    // 系统
    private getSystemData(data: any) {
        const systemData: any = [];
        const systemConfigData: any = [];
        data.forEach((item: any) => {
            const obj = {
                config: item.indicators,
                current: item.cur_value,
                suggest: item.value,
                suggestValue: this.language === 'zh' ? item.sug : item.sug_en,
            };
            systemData.push(obj);
            const object = {
                declaration: this.language === 'zh' ? item.declaration_ch : item.declaration_en,
                title: item.indicators,
                data: item.cur_value,
                tip: item.equal ? 'NULL' : this.language === 'zh' ? item.sug : item.sug_en
            };
            systemConfigData.push(object);
        });
        this.systemTotalNumber = systemData.length;
        this.systemData = systemConfigData;
        this.systemContentData = {
            data: systemData,
            state: {
                searched: false, // 源数据未进行搜索处理
                sorted: false, // 源数据未进行排序处理
                paginated: false // 源数据未进行分页处理
            }
        };
    }
    /**
     * 获取组件数据
     * @param data 任务节点
     */
    // 组件
    private getComponentData(data: any, searchWords?: string) {
        const componentData: any = [];
        const componentConfigData: any = [];
        data.forEach((item: any) => {
            const obj = {
                config: item.indicators,
                current: item.cur_value,
                suggest: item.value,
                suggestValue: this.language === 'zh' ? item.sug : item.sug_en,
            };
            componentData.push(obj);
            const object = {
                declaration: this.language === 'zh' ? item.declaration_ch : item.declaration_en,
                title: item.indicators,
                data: item.cur_value,
                tip: item.equal ? 'NULL' : this.language === 'zh' ? item.sug : item.sug_en
            };
            if (searchWords) {
                if (item.indicators.indexOf(searchWords) > -1) {
                    componentData.push(obj);
                    componentConfigData.push(object);
                }
            } else {
                componentData.push(obj);
                componentConfigData.push(object);
            }
        });
        this.componentTotalNumber = componentData.length;
        if (!searchWords && this.componentData.length === 0) {
            this.componentData = componentConfigData;
        }
        this.searchComponent = componentConfigData;
        this.componentContentData = {
            data: componentData,
            state: {
                searched: false, // 源数据未进行搜索处理
                sorted: false, // 源数据未进行排序处理
                paginated: false // 源数据未进行分页处理
            }
        };
    }

    /**
     * 搜索组件
     * @param event 输入字符串
     */
    public comSearch(event: any) {
        const keyword = event === undefined ? '' : event.toString().trim();
        const str = encodeURIComponent(keyword);
        this.getComponentData(this.originComponentData, str);
    }

    /**
     * 清空搜索框
     */
    public onClear(): void {
        const str = '';
        this.getComponentData(this.originComponentData, str);
    }
}
