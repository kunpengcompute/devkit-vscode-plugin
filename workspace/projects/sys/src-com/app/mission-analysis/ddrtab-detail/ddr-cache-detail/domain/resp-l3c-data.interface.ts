import { TiTableRowData } from '@cloud/tiny3';

export interface RespL3cData extends TiTableRowData {
  'NUMA node': string;
  accesscount: number;
  bandwith: number;
  hitbandwith: number;
  hitcount: number;
  hitrate: number;
  type: string;
}
