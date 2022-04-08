import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { HyCollapseModule } from 'hyper';
import { TiCollapseModule } from '@cloud/tiny3';

import { InputParamsUnitComponent } from './net-io/component/input-params-unit/input-params-unit.component';
import { Ipv4NodeInfoComponent } from './net-io/component/ip-node-info/ipv4-node-info.component';
import { Ipv6NodeInfoComponent } from './net-io/component/ip-node-info/ipv6-node-info.component';
import { NetworkingParamComponent } from './net-io/component/networking-param/networking-param.component';
import { CheckBoxControlComponent } from './net-io/component/check-box-control/check-box-control.component';

import { NetIoCreateComponent } from './net-io/view/net-io-create/net-io-create.component';
import { NetIoScheduleComponent } from './net-io/view/net-io-schedule/net-io-schedule.component';
import { NetworkDialingComponent } from './net-io/control/network-dialing/network-dialing.component';
import { NetworkPacketLossComponent } from './net-io/control/network-packet-loss/network-packet-loss.component';
import { NetworkCaughtComponent } from './net-io/control/network-caught/network-caught.component';
import { NetworkLoadComponent } from './net-io/control/network-load/network-load.component';
import { DialingConnectionComponent } from './net-io/control/network-dialing/dialing-control/dialing-connection/dialing-connection.component';
import { DialingTcpUdpComponent } from './net-io/control/network-dialing/dialing-control/dialing-tcp-udp/dialing-tcp-udp.component';
import { DialTestLimitComponent } from './net-io/component/dial-test-limit/dial-test-limit.component';
import { PacketlossFilterComponent } from './net-io/component/packetloss-filter/packetloss-filter.component';
import { SampleFrequencyComponent } from './net-io/component/sample-frequency/sample-frequency.component';
import { CaughtFilterComponent } from './net-io/component/caught-filter/caught-filter.component';
import { NetIoTempDetailComponent } from './net-io/view/net-io-temp-detail/net-io-temp-detail.component';
import { NetioCollapseComponent } from './net-io/component/netio-collapse/netio-collapse.component';

// 存储io组件
import { StorageIoCreateComponent } from './storage-io/storage-io-create/storage-io-create.component';
import { StorageIoScheduleComponent } from './storage-io/storage-io-schedule/storage-io-schedule.component';
import { StorageIoTempDetailComponent } from './storage-io/storage-io-temp-detail/storage-io-temp-detail.component';
import { StorageIoTempDetailPressureComponent } from './storage-io/storage-io-temp-detail/storage-io-temp-detail-pressure/storage-io-temp-detail-pressure.component';
import { StorageIoTempDetailMetricsComponent } from './storage-io/storage-io-temp-detail/storage-io-temp-detail-metrics/storage-io-temp-detail-metrics.component';
import { KeyMetricSelectComponent } from './storage-io/storage-io-create/components/keyMetric/key-metric-select.component';
import { PressObjComponent } from './storage-io/storage-io-create/components/pressObj/press-obj.component';

// 内存诊断
import { MemProcessPidComponent } from './memory/components/mem-process-pid/mem-process-pid.component';

@NgModule({
  imports: [CommonModule, SharedModule, HyCollapseModule, TiCollapseModule],
  exports: [
    NetIoCreateComponent,
    NetIoScheduleComponent,
    NetIoTempDetailComponent,
    StorageIoCreateComponent,
    StorageIoScheduleComponent,
    StorageIoTempDetailComponent,
    KeyMetricSelectComponent,
    PressObjComponent,
    MemProcessPidComponent
  ],
  declarations: [
    InputParamsUnitComponent,
    Ipv4NodeInfoComponent,
    Ipv6NodeInfoComponent,
    NetworkingParamComponent,
    CheckBoxControlComponent,
    NetIoCreateComponent,
    NetIoScheduleComponent,
    NetworkDialingComponent,
    NetworkPacketLossComponent,
    NetworkCaughtComponent,
    NetworkLoadComponent,
    DialingConnectionComponent,
    DialingTcpUdpComponent,
    DialTestLimitComponent,
    PacketlossFilterComponent,
    SampleFrequencyComponent,
    CaughtFilterComponent,
    NetIoTempDetailComponent,
    NetioCollapseComponent,

    // 存储io组件
    StorageIoCreateComponent,
    StorageIoScheduleComponent,
    StorageIoTempDetailComponent,
    StorageIoTempDetailPressureComponent,
    StorageIoTempDetailMetricsComponent,
    KeyMetricSelectComponent,
    PressObjComponent,
    MemProcessPidComponent
  ],
})
export class DiagnoseCreateModule { }
