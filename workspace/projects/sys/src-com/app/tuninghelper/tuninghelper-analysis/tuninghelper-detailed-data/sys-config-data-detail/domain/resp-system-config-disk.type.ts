export type RespDiskInfo = {
  title: [
    'name',
    'tuning_disk_size',
    'tuning_disk_type',
    'tuning_disk_manufacturer',
    'tuning_read_ahead',
    'tuning_scheduler',
    'tuning_rq_affinity',
    'tuning_nr_requests',
    'tuning_queue_depth',
    'tuning_nomerges',
    'tuning_disk_write_cache'
  ],
  data: Array<Array<string>>
};

export type RespRaidInfo = {
  title: ['name', 'level', 'strip_size', 'read_policy', 'write_policy', 'io_policy', 'disks'],
  data: Array<Array<string>>
};

export type RespFileSystemInfo = {
  title: ['name', 'part', 'lvm', 'file_system', 'mounted', 'mount_parameter', 'type'],
  data: Array<Array<string | string[]>>
};

export type RespDiskConfig = {
  disk_info: RespDiskInfo;
  raid_info: RespRaidInfo;
  file_system_info: RespFileSystemInfo;
};

export type RespSystemConfigDisk = {
  optimization: {
    data: RespDiskConfig;
    info: string;
    status: number;
  };
};
