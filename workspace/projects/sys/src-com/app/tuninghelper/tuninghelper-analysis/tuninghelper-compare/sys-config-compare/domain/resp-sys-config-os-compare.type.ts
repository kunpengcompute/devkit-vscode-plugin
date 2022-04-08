import { CommonValue } from './common-value.type';

export type RespCompareOS = {
  tuning_os_version: CommonValue;
  tuning_kernel_version: CommonValue;
  tuning_glibc_version: CommonValue;
  tuning_smmu: CommonValue;
  tuning_page_size: CommonValue;
  tuning_huge_page_config: {
    [node: string]: { [key: string]: CommonValue },
  };
  tuning_transparent_hugepage: CommonValue;
  tuning_dirty_expire_centisecs: CommonValue;
  tuning_dirty_background_ratio: CommonValue;
  tuning_dirty_ratio: CommonValue;
  tuning_dirty_writeback_centisecs: CommonValue;
  tuning_swappiness: CommonValue;
  tuning_hz: CommonValue;
  tuning_nohz: CommonValue;
  /** 这个字段后端返回了，但前端不用显示 */
  tuning_is_virutal: CommonValue;
};

export type RespSysConfigOSCompare = {
  data: RespCompareOS;
};
