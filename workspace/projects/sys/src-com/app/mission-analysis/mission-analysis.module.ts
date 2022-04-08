import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';

// 组件
import { MissionLogComponent } from './components/mission-log/mission-log.component';
import { MissionConfigurationComponent } from './components/mission-configuration/mission-configuration.component';
import { MissionNodeConfigComponent } from './components/mission-node-configuration/mission-node-configuration.component';

// 访存分析
import { DdrtabDetailComponent } from './ddrtab-detail/ddrtab-detail.component';
import { DdrSummuryComponent } from './ddrtab-detail/ddr-summury/ddr-summury.component';
import { DdrSummuryEchartComponent } from './ddrtab-detail/ddr-summury/ddr-summury-echart/ddr-summury-echart.component';
import { TableCatchComponent } from './ddrtab-detail/table-catch/table-catch.component';
import { DdrCatchDetailComponent } from './ddrtab-detail/ddr-cache-detail/ddr-cache-detail.component';
import { DdrCacheEchartsComponent } from './ddrtab-detail/ddr-cache-detail/ddr-cache-echarts/ddr-cache-echarts.component';
import { DdrCacheTableComponent } from './ddrtab-detail/ddr-cache-detail/ddr-cache-table/ddr-cache-table.component';
import { TlbFilterSliderComponent } from './ddrtab-detail/ddr-cache-detail/tlb-filter-slider/tlb-filter-slider.component';
import { DdrDdrDetaililComponent } from './ddrtab-detail/ddr-ddr-detailil/ddr-ddr-detailil.component';
import { DdrDdrEchartsComponent } from './ddrtab-detail/ddr-ddr-detailil/ddr-ddr-echarts/ddr-ddr-echarts.component';
import { DdrDdrTableComponent } from './ddrtab-detail/ddr-ddr-detailil/ddr-ddr-table/ddr-ddr-table.component';
@NgModule({
    imports: [
        CommonModule,
        SharedModule
    ],
    entryComponents: [
    ],
    exports: [
        DdrtabDetailComponent,
        MissionNodeConfigComponent,
        MissionLogComponent,
        MissionConfigurationComponent,
    ],
    declarations: [
        // 组件
        MissionLogComponent,
        MissionConfigurationComponent,
        MissionNodeConfigComponent,

        // 访存分析
        DdrtabDetailComponent,
        DdrSummuryComponent,
        DdrSummuryEchartComponent,
        TableCatchComponent,
        DdrCatchDetailComponent,
        DdrCacheEchartsComponent,
        DdrCacheTableComponent,
        TlbFilterSliderComponent,
        DdrDdrDetaililComponent,
        DdrDdrTableComponent,
        DdrDdrEchartsComponent,
    ],
})
export class MissionAnalysisModule {
    constructor() { }
}
