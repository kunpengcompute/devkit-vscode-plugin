import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import {isLightTheme} from 'sys/src-ide/app/service/vscode.service';

@Component({
  selector: 'app-table-chart-switch',
  templateUrl: './table-chart-switch.component.html',
  styleUrls: ['./table-chart-switch.component.scss']
})
export class TableChartSwitchComponent implements OnInit {
  @Output() public selectChange = new EventEmitter<any>();
  constructor(
    public sanitizer: DomSanitizer,
  ) { }
  public isLight = false;
  public isTable = false;
  public imgObj = {
    chart: {
        url: './assets/img/micarch/chart_selected_dark.svg',
        isTable: true
    },
    table: {
        url: './assets/img/micarch/table_dark.svg',
        isTable: false
    }
};
  ngOnInit(): void {
    if (isLightTheme) {
      this.isLight = true;
      this.imgObj = {
          chart: {
              url: './assets/img/micarch/chart_selected_dark.svg',
              isTable: true
          },
          table: {
              url: './assets/img/micarch/table_light.svg',
              isTable: false
          }
      };
  }
  }
    /**
     * 鼠标移入
     * @param type 类型
     */
       public mouseEnterChange(type: string) {
        if (type === 'chart') {
            this.imgObj.chart.url = this.isLight ? './assets/img/micarch/chart_hover_light.svg' :
                './assets/img/micarch/chart_hover_dark.svg';
        } else {
            this.imgObj.table.url = this.isLight ? './assets/img/micarch/table_hover_light.svg' :
                './assets/img/micarch/table_hover_dark.svg';
        }
    }

    /**
     * 鼠标移出
     * @param type 类型
     */
    public mouseLeaveChange(type: string) {
        if (type === 'chart') {
            if (this.imgObj.chart.isTable) {
                this.imgObj.chart.url = './assets/img/micarch/chart_selected_dark.svg';
            } else {
                this.imgObj.chart.url = this.isLight
                    ? './assets/img/micarch/chart_light.svg' : './assets/img/micarch/chart_dark.svg';
            }
        } else {
            if (this.imgObj.table.isTable) {
                this.imgObj.table.url = './assets/img/micarch/table_selected_dark.svg';
            } else {
                this.imgObj.table.url = this.isLight
                    ? './assets/img/micarch/table_light.svg' : './assets/img/micarch/table_dark.svg';
            }
        }
    }
    /**
     * 选中
     * @param type 类型
     */
    public mouseClickChange(type: string) {
        this.isTable = !this.isTable;
        this.selectChange.emit(this.isTable);
        if (type === 'chart') {
            this.imgObj.chart = {
                url: './assets/img/micarch/chart_selected_dark.svg',
                isTable: true
            };
            this.imgObj.table = {
                url: this.isLight ? './assets/img/micarch/table_light.svg' : './assets/img/micarch/table_dark.svg',
                isTable: false
            };
        } else {
            this.imgObj.table = {
                url: './assets/img/micarch/table_selected_dark.svg',
                isTable: true
            };
            this.imgObj.chart = {
                url: this.isLight ? './assets/img/micarch/chart_light.svg' : './assets/img/micarch/chart_dark.svg',
                isTable: false
            };
        }
    }
}
