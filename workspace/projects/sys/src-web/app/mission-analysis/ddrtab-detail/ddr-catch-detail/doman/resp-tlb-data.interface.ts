import { TiTableRowData } from '@cloud/tiny3';

export interface RespTlbData extends TiTableRowData {
  acessscount: number;
  bandwith: number;
  core: string;
  hitcount: number;
  hitrate: number;
  type: string;
}
