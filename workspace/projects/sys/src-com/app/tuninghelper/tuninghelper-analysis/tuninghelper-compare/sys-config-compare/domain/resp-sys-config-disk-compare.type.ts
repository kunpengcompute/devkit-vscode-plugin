import { CommonValue } from './common-value.type';

export type RespCompareDiskInfo = {
  title: [
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
  data: {
    [deviceName: string]: CommonValue[]
  }
};

export type RespCompareRaidInfo = {
  title: ['level', 'strip_size', 'read_policy', 'write_policy', 'io_policy', 'disks'],
  data: {
    [deviceName: string]: CommonValue[]
  }
};

export type RespCompareFileSystemInfo = {
  title: ['name', 'part', 'lvm', 'mounted', 'mount_parameter', 'type'],
  data: {
    [fileSystem: string]: Array<CommonValue | [string[], string[], boolean]>
  }
};

export type RespCompareDiskConfig = {
  disk_info: RespCompareDiskInfo;
  raid_info: RespCompareRaidInfo;
  file_system_info: RespCompareFileSystemInfo;
};

export type RespSysConfigDiskCompare = {
  data: RespCompareDiskConfig
};
