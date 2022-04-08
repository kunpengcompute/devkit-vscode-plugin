/*
 * Copyright 2022 Huawei Technologies Co., Ltd
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

interface AffinityMaskDict {
  [key: string]: {
    irq_affinity_mask: string;
    irq_count: number;
    irq_event_name: string;
    irq_device_name: string;
    irq_device_bdf: string;
    eth_name: string;
    queue_name: string;
    xps_affinity_mask: string;
    rps_affinity_mask: string;
    rps_flow_cnt: string;
    numa_node: string;
  };
}

// 复合表头
interface Theads {
  title: string;
  width?: string;
  colspan?: number;
  rowspan?: number;
  textAlign?: 'center';
  checked?: boolean | undefined | string;
}

// 硬中断编号 table
interface HartInterTable {
  number: string;
  deviceName: string;
  bdf: string;
  eventName: string;
  irqCount: number;
  affinityMask: string;
  ethName: string;
  queueName: string;
  xpsCpus: string;
  rpxCpus: string;
  rpsFlowCnt: string;
  irqCountList?: number[];
  numaNode: string;
}

// 硬中断 CPU table
interface HartInterCPUTable {
  cpu: string;
  irqNum: number;
  iqrDict: AffinityMaskDict;
  xpsNum: number;
  xpsDict: AffinityMaskDict;
  rpsNum: number;
  rpsDict: AffinityMaskDict;
}

export {
  Theads,
  HartInterTable,
  HartInterCPUTable,
  AffinityMaskDict
};
