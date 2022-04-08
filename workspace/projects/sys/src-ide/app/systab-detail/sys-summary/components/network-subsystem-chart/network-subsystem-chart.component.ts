import { Component, OnInit, AfterViewInit, ChangeDetectorRef, Input, ViewChild, ElementRef } from '@angular/core';
import { AxiosService } from '../../../../service/axios.service';
import { SvgElementInfo } from '../../classes/svg-element-info';
import { I18nService } from '../../../../service/i18n.service';
import { TooltipShowManager } from './network-subsystem-chart.component.helper';
import {isLightTheme, VscodeService} from '../../../../service/vscode.service';
@Component({
    selector: 'app-network-subsystem-chart',
    templateUrl: './network-subsystem-chart.component.html',
    styleUrls: ['./network-subsystem-chart.component.scss']
})

export class NetworkSubsystemChartComponent implements OnInit, AfterViewInit {
    @ViewChild('netWorkWarpper', { static: true }) el: ElementRef;

    @Input() networkData: any;
    @Input() cpuName: any;
    public i18n: any;
    public titleDetail = [];
    public currentTheme: any;
    private itemColor = [
        {
            title: '#e8e8e8',
            subTitle: '#aaaaaa',
            content: '#e8e8e8',
            border: '#353535'
        },
        {
            title: '#2a2f35',
            subTitle: '#50596f',
            content: '#282b33',
            border: '#e1e6ee'
        }
    ];
    public networkCard11 = new SvgElementInfo(); // 网卡1上面大块部分
    public networkCard12 = new SvgElementInfo(); // 网卡1下面左侧第一个
    public networkCard13 = new SvgElementInfo(); // 网卡1下面左侧第二个
    public networkCard14 = new SvgElementInfo(); // 网卡1下面左侧第三个
    public networkCard15 = new SvgElementInfo(); // 网卡1下面左侧第四个
    public networkCard111 = new SvgElementInfo(); // 数据不存在时整个隐藏
    public networkCard122 = new SvgElementInfo(); // 网卡1数据不存在时网卡与网口连接的横线隐藏
    public networkCard133 = new SvgElementInfo(); // 网卡1数据不存在时网卡与网口连接的横线隐藏
    public networkCard144 = new SvgElementInfo(); // 网卡1数据不存在时网卡与网口连接的横线隐藏
    public networkCard155 = new SvgElementInfo(); // 网卡1数据不存在时网卡与网口连接的横线隐藏
    public networkCard1555 = new SvgElementInfo(); // 网卡1数据不存在时网卡与网口连接的横线隐藏

    public networkCard21 = new SvgElementInfo(); // 网卡2上面大块部分
    public networkCard22 = new SvgElementInfo(); // 网卡2下面左侧第一个
    public networkCard23 = new SvgElementInfo(); // 网卡2下面左侧第二个
    public networkCard24 = new SvgElementInfo(); // 网卡2下面左侧第三个
    public networkCard25 = new SvgElementInfo(); // 网卡2下面左侧第四个
    public networkCard211 = new SvgElementInfo(); // 数据不存在时整个隐藏
    public networkCard222 = new SvgElementInfo(); // 网卡2下面左侧第一个数据不存在时网卡与网口连接的横线隐藏
    public networkCard233 = new SvgElementInfo(); // 网卡2下面左侧第二个数据不存在时网卡与网口连接的横线隐藏
    public networkCard244 = new SvgElementInfo(); // 网卡2下面左侧第三个数据不存在时网卡与网口连接的横线隐藏
    public networkCard255 = new SvgElementInfo(); // 网卡2下面左侧第四个数据不存在时网卡与网口连接的横线隐藏
    public networkCard2555 = new SvgElementInfo(); // 网卡2下面左侧第四个数据不存在时网卡与网口连接的横线隐藏

    public networkCard31 = new SvgElementInfo(); // 网卡3上面大块部分
    public networkCard32 = new SvgElementInfo(); // 网卡3下面左侧第一个
    public networkCard33 = new SvgElementInfo(); // 网卡3下面左侧第二个
    public networkCard34 = new SvgElementInfo(); // 网卡3下面左侧第三个
    public networkCard35 = new SvgElementInfo(); // 网卡3下面左侧第四个
    public networkCard311 = new SvgElementInfo(); // 网卡3上面大块部分
    public networkCard322 = new SvgElementInfo(); // 网卡3下面左侧第一个
    public networkCard333 = new SvgElementInfo(); // 网卡3下面左侧第二个
    public networkCard344 = new SvgElementInfo(); // 网卡3下面左侧第三个
    public networkCard355 = new SvgElementInfo(); // 网卡3下面左侧第四个
    public networkCard3555 = new SvgElementInfo(); // 网卡3下面左侧第四个

    public networkCard41 = new SvgElementInfo(); // 网卡4上面大块部分
    public networkCard42 = new SvgElementInfo(); // 网卡4下面左侧第一个
    public networkCard43 = new SvgElementInfo(); // 网卡4下面左侧第二个
    public networkCard44 = new SvgElementInfo(); // 网卡4下面左侧第三个
    public networkCard45 = new SvgElementInfo(); // 网卡4下面左侧第四个
    public networkCard411 = new SvgElementInfo(); // 网卡4上面大块部分
    public networkCard422 = new SvgElementInfo(); // 网卡4下面左侧第一个
    public networkCard433 = new SvgElementInfo(); // 网卡4下面左侧第二个
    public networkCard444 = new SvgElementInfo(); // 网卡4下面左侧第三个
    public networkCard455 = new SvgElementInfo(); // 网卡4下面左侧第四个
    public networkCard4555 = new SvgElementInfo(); // 网卡4下面左侧第四个
    public tipsData = []; // 提示数据
    public turnPage = false;
    public isLight = false;

    // tooltip
    public tooltipShowManager: TooltipShowManager;
    public niceTooltipInfo: {
        html: string,
        top: { pointX: number, pointY: number },
        bottom: { pointX: number, pointY: number }
    };
    public niceTooltipShowCopy = false;
    set niceTooltipShow(val) {
        this.niceTooltipShowCopy = val;
        this.cdr.markForCheck();
        this.cdr.detectChanges();
    }
    get niceTooltipShow() {
        return this.niceTooltipShowCopy;
    }

    constructor(
        private axios: AxiosService,
        private cdr: ChangeDetectorRef,
        public i18nService: I18nService,
        private vscodeService: VscodeService) {
        this.i18n = this.i18nService.I18n();
    }

    /**
     * 组件初始化
     */
    ngOnInit() {
        if (isLightTheme) {
            this.currentTheme = this.itemColor[1];
        } else {
            this.currentTheme = this.itemColor[0];
        }
        this.vscodeService.regVscodeMsgHandler('colorTheme', (msg: any) => {
            this.currentTheme = this.itemColor[msg.colorTheme - 1];
        });
        // vscode颜色主题
        this.isLight = isLightTheme;
        const obj = new SvgElementInfo();
        this.networkData = this.networkData[this.cpuName];
        if (JSON.stringify(this.networkData) !== '{}') {
            this.getNetWorkData(this.networkData);
            this.getTipsData(this.networkData);
        }
    }
    /**
     * 初始化填充
     */
    public fillInit() {
        for (let i = 2; i <= 40; i += 2) {
            $('defs>linearGradient>stop:nth-child(1)').attr('stop-color', '#E1E6EF');
            $('defs>linearGradient>stop:nth-child(2)').attr('stop-color', '#F2F6FF');
        }
        $('#linearGradient-41>stop').attr('stop-color', '#D4DAE8');

        $('#linearGradient-42>stop').attr('stop-color', '#BED9FC');

        $('#Lines>line:nth-child(2)').attr('stop-color', '#BED9FC');
        $('#Big-Border').attr('stroke', '#E7E9F0');
    }

    /**
     * AfterView
     */
    ngAfterViewInit(): void {
        this.boundEvent(0);
        if (this.isLight) {
            this.fillInit();
        }
    }

    /**
     * 获取弹窗信息
     * @param data 弹窗数据
     */
    public getTipsData(data: any) {
        let index = Math.ceil(Object.keys(data.rela).length / 4);
        if (index === 0) {
            index = 1;
        }
        const arrData = [];
        for (const key of Object.keys(data.rela)) {
            arrData.push(key);
        }
        for (let i = 0; i < index; i++) {
            const obj = {
                svgShow: i === 0 ? true : false,
                networkTotal: arrData,
                network1: this.i18n.sys_cof.sum.network + '-' + ((index - 1) * 4) + 1,
                network2: this.i18n.sys_cof.sum.network + '-' + ((index - 1) * 4) + 2,
                network3: this.i18n.sys_cof.sum.network + '-' + ((index - 1) * 4) + 3,
                network4: this.i18n.sys_cof.sum.network + '-' + ((index - 1) * 4) + 4,
            };
            this.tipsData.push(obj);
        }
        if (Object.keys(data.rela).length < 5) {
            this.turnPage = true;
        } else {
            this.turnPage = false;
        }
    }

    /**
     * 绑定事件
     * @param index 索引
     */
    public boundEvent(index) {
        this.tooltipShowManager = new TooltipShowManager(this);
        for (let i = 1; i < 5; i++) {
            const titleName = 'networkCard' + i + '555';
            this[titleName].initSelectionById(this.el);
            for (let j = 1; j < 6; j++) {
                const hideName = 'networkCard' + i + j + j;
                this[hideName].initSelectionById(this.el);
                const strName = 'networkCard' + i + j;
                this[strName].initSelectionById(this.el);
                this[strName].selection.attr('cursor', 'pointer');
                const tipsArr = [];
                if (this.tipsData[index].networkTotal[(i - 1) + (index * 4)]) {
                    const maxArrData = this.networkData.rela[this.tipsData[index].networkTotal[(i - 1) + (index * 4)]];
                    const max = maxArrData.length;
                    if (j <= (max + 1)) {
                        if (this.isLight) {
                            // 网卡
                            $('#' + this[strName].id + '>g>path:nth-child(1)').attr('fill', '#DCE3ED');
                            $('#' + this[strName].id + '>g>path:nth-child(2)').attr('fill', '#C6CCDB');
                            $('#' + this[strName].outId).attr('stroke', '#576170');
                            // 总线
                            $('#' + this[hideName].id + '>line').attr('stroke', '#BED9FC');
                            $('#' + this[hideName].id + '>path').attr('stroke', '#BED9FC');
                            // 网口
                            $('#' + this[hideName].id + '>g>g>path:nth-child(1)').attr('fill', '#C6CCDB');
                            // 描述
                            $('#' + this[titleName].id).attr('fill', '#282B33');
                        }
                        if (j === 1) {
                            const obj1 = {
                              title:
                                this.i18n.sys_summary.cpupackage_tabel.delay,
                              data: this.networkData.rela.config[
                                this.tipsData[index].networkTotal[i - 1 + 0 * 4]
                              ].Latency
                                ? this.networkData.rela.config[
                                    this.tipsData[index].networkTotal[
                                      i - 1 + 0 * 4
                                    ]
                                  ].Latency
                                : '--',
                            };
                            const obj2 = {
                              title:
                                this.i18n.sys_summary.cpupackage_tabel.NUMAnode,
                              data: this.networkData.rela.config[
                                this.tipsData[index].networkTotal[i - 1 + 0 * 4]
                              ].NUMAnode
                                ? this.networkData.rela.config[
                                    this.tipsData[index].networkTotal[
                                      i - 1 + 0 * 4
                                    ]
                                  ].NUMAnode
                                : '--',
                            };
                            const obj3 = {
                              title:
                                this.i18n.sys_summary.cpupackage_tabel.drive,
                              data: this.networkData.rela.config[
                                this.tipsData[index].networkTotal[i - 1 + 0 * 4]
                              ].Kerneldriverinuse
                                ? this.networkData.rela.config[
                                    this.tipsData[index].networkTotal[
                                      i - 1 + 0 * 4
                                    ]
                                  ].Kerneldriverinuse
                                : '--',
                            };
                            const obj4 = {
                              title:
                                this.i18n.sys_summary.cpupackage_tabel.model,
                              data: this.networkData.rela.config[
                                this.tipsData[index].networkTotal[i - 1 + 0 * 4]
                              ].Kernelmodules
                                ? this.networkData.rela.config[
                                    this.tipsData[index].networkTotal[
                                      i - 1 + 0 * 4
                                    ]
                                  ].Kernelmodules
                                : '--',
                            };
                            const obj5 = {
                              title:
                                this.i18n.sys_summary.cpupackage_tabel
                                  .equipment,
                              data: this.networkData.rela.config[
                                this.tipsData[index].networkTotal[i - 1 + 0 * 4]
                              ].Systemperipheral
                                ? this.networkData.rela.config[
                                    this.tipsData[index].networkTotal[
                                      i - 1 + 0 * 4
                                    ]
                                  ].Systemperipheral
                                : '--',
                            };
                            tipsArr.push(obj1);
                            tipsArr.push(obj2);
                            tipsArr.push(obj3);
                            tipsArr.push(obj4);
                            tipsArr.push(obj5);
                        } else {
                            const name = maxArrData[(j - 2)];
                            let data = '';
                            let rxk = 0;
                            let txk = 0;
                            let txdr = 0;
                            let rxdr = 0;
                            for (const value in this.networkData.pic) {
                                if (this.networkData.pic[value].device === name) {
                                    data = this.networkData.pic[value].max_speed;
                                    rxk = this.networkData.pic[value]['rxkB/s'];
                                    txk = this.networkData.pic[value]['txkB/s'];
                                    txdr = this.networkData.pic[value]['txdrop/s'];
                                    rxdr = this.networkData.pic[value]['rxdrop/s'];
                                }
                            }
                            const obj1 = {
                                title1: 'ID',
                                data1: name,
                                title2: this.i18n.sys_summary.cpupackage_tabel.rate,
                                data2: data,
                                title3: 'rxkB/s',
                                data3: rxk,
                                title4: 'txkB/s',
                                data4: txk,
                                title5: 'txdrop/s',
                                data5: txdr,
                                title6: 'rxdrop/s',
                                data6: rxdr
                            };
                            tipsArr.push(obj1);
                        }
                    } else {
                        this[strName].selection.attr('display', 'none');
                        this[hideName].selection.attr('display', 'none');
                        this[titleName].selection.attr('display', 'none');

                    }
                } else {
                    this[strName].selection.attr('display', 'none');
                    this[hideName].selection.attr('display', 'none');
                    this[titleName].selection.attr('display', 'none');
                }

                this[strName].selection.on('mouseenter', (event) => {
                    this.tooltipShowManager.show(this[strName].selection, i, j, tipsArr, this.i18n);
                    this[strName].outSelection.attr('display', 'unset');
                });
                this[strName].selection.on('mouseleave', () => {
                    this[strName].outSelection.attr('display', 'none');
                    this.tooltipShowManager.hidden();
                });
            }
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
     * 获取网络子系统数据
     * @param data 网络子系统数据
     */
    public getNetWorkData(data) {
        this.titleDetail = [{
            title: this.i18n.sys_cof.sum.network + '：',
            data: String(Object.keys(data.rela).length - 1) + this.i18n.sys_summary.unit.entry,
        }, {
            title: this.i18n.sys_summary.cpupackage_tabel.network_port + '：',
            data: data.net_work_num ? data.net_work_num + this.i18n.sys_summary.unit.entry : '--',
        }];
    }

    /**
     * 左移
     * @param index 索引
     */
    public leftSwitch(index) {
        if (this.tipsData[index - 1]) {

            this.boundEvent(index - 1);
        }
    }

    /**
     * 右移
     * @param index 索引
     */
    public rightSwitch(index) {
        if (this.tipsData[index + 1]) {
            this.boundEvent(index + 1);
        }
    }


}

