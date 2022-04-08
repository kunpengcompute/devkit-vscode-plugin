export type RespOSConfig = {
  tuning_os_version: string;
  tuning_kernel_version: string;
  tuning_glibc_version: string;
  tuning_smmu: string;
  tuning_page_size: string;
  tuning_huge_page_config: {
    [node: string]: { [key: string]: string },
  };
  tuning_transparent_hugepage: string;
  tuning_dirty_expire_centisecs: string;
  tuning_dirty_background_ratio: string;
  tuning_dirty_ratio: string;
  tuning_dirty_writeback_centisecs: string;
  tuning_swappiness: string;
  tuning_hz: string;
  tuning_nohz: string;
  /** 这个字段后端返回了，但前端不用显示 */
  tuning_is_virutal: string;
};

export type RespSystemConfigOS = {
  optimization: {
    data: RespOSConfig;
    info: string;
    status: number;
  };
};
