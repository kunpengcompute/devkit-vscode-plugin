import {
    Component,
    OnInit,
    Input,
    ViewChild,
    Output,
    EventEmitter,
} from '@angular/core';
import {VscodeService, COLOR_THEME, currentTheme} from '../../service/vscode.service';
import { I18nService } from '../../service/i18n.service';
import { Utils } from '../../service/utils.service';

@Component({
    selector: 'app-consumption-detail',
    templateUrl: './consumption-detail.component.html',
    styleUrls: ['./consumption-detail.component.scss'],
})
export class ConsumptionDetailComponent implements OnInit {
    constructor(public vscodeService: VscodeService, public i18nService: I18nService) {
        this.i18n = this.i18nService.I18n();
    }
    @Input() taskid: any;
    @Input() nodeid: any;
    @Input() timeLine: any;
    @Output() public ZoomData = new EventEmitter<any>();
    @Output() public consumptionEchartsInstOut = new EventEmitter<any>();
    @ViewChild('consumption', { static: false }) consumption;

    public consumptionEchartData = []; // 存储echarts需要的数据
    public consumptionShow = true; // 能耗是否展示
    public i18n: any;
    public currTheme: any;
    // 获取主题颜色
    public ColorTheme = {
        Dark: COLOR_THEME.Dark,
        Light: COLOR_THEME.Light
    };
    public showLoading = false;
    /**
     * 页面初始化时执行
     */
    ngOnInit() {
        // vscode颜色主题
        this.currTheme = currentTheme();

        this.vscodeService.regVscodeMsgHandler('colorTheme', (msg: any) => {
            this.currTheme = msg.colorTheme;
        });
        this.getData();
    }

    /**
     * 获取数据
     */
    public getData() {
        this.showLoading = true;
        const params1 = {
            'node-id': this.nodeid,
            'query-type': 'detail',
            'query-target': 'cfg_sys_power', // 例如cpu_usage, cpu_avgload, mem_usage等
        };
        this.vscodeService.get(
          {
            url:
              '/tasks/' +
              this.taskid +
              '/sys-performance/?' +
              Utils.converUrl(params1),
          },
          (res) => {
            this.initData(res.data);
            this.showLoading = false;
          }
        );
    }
    private initData(resData: any) {
        const dataArr = {
            time: [],
            values: {},
        };
        const objPower = {};
        const keyName = this.i18n.plugins_sysperf_title_consumption.powerUnits;
        objPower[keyName] = resData.origin_data.values.power_val;
        const objAll = {};
        objAll[keyName] = resData.origin_data.values.avg_power;
        const valuesObj = { all: null };
        valuesObj[this.i18n.plugins_sysperf_title_consumption.power] = objPower;
        valuesObj.all = objAll;
        dataArr.time = resData.origin_data.time;
        dataArr.values = valuesObj;
        const key = [];
        const obj = {
            label: keyName,
            id: keyName,
            disabled: true,
        };
        key.push(obj);
        const spec = [];
        const object = {
            label: this.i18n.plugins_sysperf_title_consumption.power,
            id: this.i18n.plugins_sysperf_title_consumption.power,
        };
        spec.push(object);
        const consumptionEchartData = [];
        const option = {
            spec,
            key,
            data: dataArr,
            title: 'CPU Usage',
            type: 'consumption',
        };
        if (option.data.time.length > 0) {
          consumptionEchartData.push(option);
        }
        this.consumptionEchartData = consumptionEchartData;
    }
    /**
     * 时间轴
     */
    public upDataTimeLine(data) {
        if (this.consumptionShow) {
            this.consumption.upDateTimeLine(data);
        }
    }

    /**
     * 更新时间轴
     */
    public dataZoom(e) {
        this.ZoomData.emit(e);
    }

    /**
     * 实例
     */
    public echartsInstOut(e) {
        this.consumptionEchartsInstOut.emit(e);
    }
}
