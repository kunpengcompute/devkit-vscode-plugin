import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'sys/src-com/app/shared/shared.module';
import { PartModule } from 'sys/src-com/app/shared/part.module';
import { TiCollapseModule } from '@cloud/tiny3';

import { ConnectDialTestComponent } from './connect-dial-test/connect-dial-test.component';
import { NetIoDetailComponent } from './net-io-detail.component';
import { TcpDialTestComponent } from './tcp-dial-test/tcp-dial-test.component';
import { UdpDialTestComponent } from './udp-dial-test/udp-dial-test.component';
import { DialKpiSvgComponent } from './component/dial-kpi-svg/dial-kpi-svg.component';
import { DialConnectInfoComponent } from './component/dial-connect-info/dial-connect-info.component';
import { NetLoadMonitorComponent } from './net-load-monitor/net-load-monitor.component';
import { LoadCpuUsageComponent } from './net-load-monitor/load-cpu-usage/load-cpu-usage.component';
import { LoadCpuLoadComponent } from './net-load-monitor/load-cpu-load/load-cpu-load.component';
import { LoadMemoryUsageComponent } from './net-load-monitor/load-memory-usage/load-memory-usage.component';
import { LoadIoStatisticsComponent } from './net-load-monitor/load-io-statistics/load-io-statistics.component';
import { NetPortDisplayComponent } from './net-port-display/net-port-display.component';
import { PortNetworkConfigComponent } from './net-port-display/port-network-config/port-network-config.component';
import { PortXPSRPSComponent } from './net-port-display/port-xps-rps/port-xps-rps.component';
import { PortConsumeIOComponent } from './net-port-display/port-consume-io/port-consume-io.component';
import { NetworkPortInfoComponent } from './net-port-display/port-network-config/network-port-info/network-port-info.component';
import { NetworkBindInfoComponent } from './net-port-display/port-network-config/network-bind-info/network-bind-info.component';
import { RouteInfoComponent } from './net-port-display/port-network-config/route-info/route-info.component';
import { ARPInfoComponent } from './net-port-display/port-network-config/arp-info/arp-info.component';
import { PortHartInterComponent } from './net-port-display/port-xps-rps/port-hart-inter/port-hart-inter.component';
import { PortSoftwareInterComponent } from './net-port-display/port-xps-rps/port-software-inter/port-software-inter.component';
import { ConsumeIoProcessComponent } from './net-port-display/port-consume-io/consume-io-process/consume-io-process.component';
import { DailTestRttComponent } from './connect-dial-test/component/dail-test-rtt/dail-test-rtt.component';
import { DialTestStatComponent } from './connect-dial-test/component/dial-test-stat/dial-test-stat.component';
import { ConnectRouterInfoComponent } from './connect-dial-test/component/connect-router-info/connect-router-info.component';
import { LoadNetworkPortComponent } from './net-load-monitor/load-network-port/load-network-port.component';
import { LoadNetworkChartComponent } from './net-load-monitor/load-network-port/load-network-chart/load-network-chart.component';
import { SequeSubTableComponent } from './component/dail-statistcs-info/seque-sub-table/seque-sub-table.component';
import { DailStatistcsInfoComponent } from './component/dail-statistcs-info/dail-statistcs-info.component';
import { SequeSubChartComponent } from './component/dail-statistcs-info/seque-sub-chart/seque-sub-chart.component';
import { HartCpuTableComponent } from './net-port-display/port-xps-rps/port-hart-inter/hart-cpu-table/hart-cpu-table.component';
import { IrqModalTableComponent } from './net-port-display/port-xps-rps/port-hart-inter/hart-cpu-table/irq-modal-table/irq-modal-table.component';
import { KpiConfInfoComponent } from './component/dial-kpi-svg/kpi-conf-info/kpi-conf-info.component';
import { SoftIrqDistComponent } from './net-port-display/component/soft-irq-dist/soft-irq-dist.component';
import { MissionAnalysisModule } from 'sys/src-com/app/mission-analysis/mission-analysis.module';
import { NetIoTaskInfoComponent } from './net-io-task-info/net-io-task-info.component';
import { NetCapturePacketComponent } from './net-capture-packet-loss/net-capture-packet/net-capture-packet.component';
import { NetPacketLossComponent } from './net-capture-packet-loss/net-packet-loss/net-packet-loss.component';
import { CapturePacketTableComponent } from './net-capture-packet-loss/net-capture-packet/capture-packet-table/capture-packet-table.component';
import { NetworkIOPacketLossComponent } from './net-capture-packet-loss/net-packet-loss/network-io-packet-loss/network-io-packet-loss.component';
import { QueuePacketLossComponent } from './net-capture-packet-loss/net-packet-loss/queue-packet-loss/queue-packet-loss.component';
import { StackPacketLossComponent } from './net-capture-packet-loss/net-packet-loss/stack-packet-loss/stack-packet-loss.component';
import { KernelPacketLossComponent } from './net-capture-packet-loss/net-packet-loss/kernel-packet-loss/kernel-packet-loss.component';
import { TroubleSuggestionComponent } from './net-capture-packet-loss/net-packet-loss/components/trouble-suggestion/trouble-suggestion.component';
import { NetCaptureSourceComponent } from './net-capture-packet-loss/net-capture-source/net-capture-source.component';
import { KpiIntroductionComponent } from './component/dial-kpi-svg/kpi-introduction/kpi-introduction.component';
import { ColorCheckboxComponent } from './component/color-checkbox/color-checkbox.component';
import { DialTestFailedComponent } from './dial-test-failed/dial-test-failed.component';
import { DialCollapseComponent } from './component/dial-collapse/dial-collapse.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    PartModule,
    MissionAnalysisModule,
    TiCollapseModule
  ],
  declarations: [
    ConnectDialTestComponent,
    NetIoDetailComponent,
    TcpDialTestComponent,
    UdpDialTestComponent,
    NetLoadMonitorComponent,
    DialKpiSvgComponent,
    DialConnectInfoComponent,
    LoadCpuUsageComponent,
    LoadCpuLoadComponent,
    LoadMemoryUsageComponent,
    LoadIoStatisticsComponent,
    NetPortDisplayComponent,
    PortNetworkConfigComponent,
    PortXPSRPSComponent,
    PortConsumeIOComponent,
    NetworkPortInfoComponent,
    NetworkBindInfoComponent,
    RouteInfoComponent,
    ARPInfoComponent,
    PortHartInterComponent,
    PortSoftwareInterComponent,
    ConsumeIoProcessComponent,
    DailTestRttComponent,
    DialTestStatComponent,
    ConnectRouterInfoComponent,
    LoadNetworkPortComponent,
    LoadNetworkChartComponent,
    SequeSubTableComponent,
    DailStatistcsInfoComponent,
    SequeSubChartComponent,
    HartCpuTableComponent,
    IrqModalTableComponent,
    KpiConfInfoComponent,
    SoftIrqDistComponent,
    NetIoTaskInfoComponent,
    NetCapturePacketComponent,
    NetPacketLossComponent,
    CapturePacketTableComponent,
    NetworkIOPacketLossComponent,
    QueuePacketLossComponent,
    StackPacketLossComponent,
    KernelPacketLossComponent,
    TroubleSuggestionComponent,
    NetCaptureSourceComponent,
    KpiIntroductionComponent,
    ColorCheckboxComponent,
    DialTestFailedComponent,
    DialCollapseComponent
  ],
  exports: [
    NetIoDetailComponent,
    NetPortDisplayComponent,
    NetCaptureSourceComponent
  ]
})
export class NetIoDetailModule {
  constructor() { }
}
