import { TiTableRowData } from '@cloud/tiny3';

export interface RespBandwidthData extends TiTableRowData {
  'DDRID': number;
  'NUMA node': string;
  bandcount: number;
  bandwidth_percent: number;
  bandwidth_theory_value: number;
  bandwith: number;
  type: string;
}
