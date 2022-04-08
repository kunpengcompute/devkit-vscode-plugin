import { TiTableRowData } from '@cloud/tiny3';

export interface RespCountData extends TiTableRowData {
  'NUMA node': string;
  acessscount: string;
  ddr_access_count: string;
  ddr_access_per: number;
  local_access_per: number;
  localaccess: string;
  spanchip: string;
  spanchip_per: number;
  spandie: string;
  spandie_per: number;
  type: string;
}
