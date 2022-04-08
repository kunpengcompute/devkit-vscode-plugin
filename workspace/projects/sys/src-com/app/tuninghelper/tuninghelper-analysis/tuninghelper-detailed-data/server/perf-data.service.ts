import { Injectable } from '@angular/core';
import { I18n } from 'sys/locale';
import { TiTreeNode } from '@cloud/tiny3';

@Injectable({
  providedIn: 'root'
})
export class PerfDataService {
  /**
   * 当前环境的NUMA数量
   */
  public numaNum: number;
  public usageData: any[][];
  public usageTitle: string[];
  public numaTitle: any[];
  public processTitle: any[];
  public equipConTitle: any[];
  public hardDistTitle: Array<TiTreeNode>;
  public hardConfigTitle: Array<TiTreeNode>;
  public raidTitle: Array<TiTreeNode>;
  public ioconsumTitle: Array<TiTreeNode>;
  public fileTitle: any[];
  public tcpTitle: any[];
  public filesysTitle: any[];
  constructor() {
    this.filesysTitle = [
      {
        title: 'Mounted on',
        key: 'mount on',
        sug: '',
      },
      {
        title: 'Mount Parameter',
        key: 'mount parameter',
        sug: '',
      },
      {
        title: I18n.ddr_summury.type,
        key: 'type',
      }
    ];
    this.hardConfigTitle = [
      {
        label: 'Network Interface',
        key: 'Network Interface',
        checked: true,
        expanded: true,
        disabled: true,
      },
      {
        label: 'Status',
        checked: true,
        key: 'Status',
        disabled: true,
        filterConfig: {
          options: [],
          select: []
        },
      },
      {
        label: 'IPv4',
        checked: true,
        key: 'IPv4',
        disabled: true,
      },
      {
        label: 'IPv6',
        checked: true,
        key: 'IPv6',
        disabled: true,
      },
      {
        label: 'Supported Ports',
        checked: true,
        key: 'Supported Ports',
        disabled: true,
      },
      {
        label: 'Speed(MiB/s)',
        checked: true,
        key: 'Speed(Mb/s)',
        disabled: true,
      },
      {
        label: 'Duplex',
        checked: true,
        key: 'Duplex',
        disabled: true,
      },
      {
        label: 'NUMA NODE',
        key: 'NUMA NODE',
        checked: true,
        expanded: true,
        disabled: true,
      },
      {
        label: 'Speed(Mb/s)',
        key: 'Speed(Mb/s)',
        checked: true,
        expanded: true,
        disabled: true,
      },
      {
        label: 'Driver',
        key: 'driver',
        checked: true,
        expanded: true,
        disabled: true,
        tip: '',
        children: [
          {
            label: 'driver',
            key: 'driver',
            checked: true,
            expanded: true,
            tip: I18n.sysPerfDetailed.netDriver,
          },
          {
            label: 'version',
            key: 'version',
            checked: false,
            expanded: true,
            tip: I18n.sysPerfDetailed.netVersion,
          },
          {
            label: 'firmware version',
            checked: false,
            key: 'firmware-version',
          }
        ]
      },
      {
        label: 'Coalesce',
        key: 'pid',
        checked: true,
        expanded: true,
        disabled: true,
        children: [
          {
            label: 'adaptive-rx',
            key: 'adaptive-rx',
            checked: true,
            expanded: true,
            tip: I18n.sys_cof.sum.network_info.irq_aggre.adaptive_rx,
          },
          {
            label: 'adaptive-tx',
            key: '%user',
            checked: false,
            expanded: true,
            tip: I18n.sys_cof.sum.network_info.irq_aggre.adaptive_tx,
          },
          {
            label: 'rx-usecs',
            key: 'rx-usecs',
            checked: false,
            expanded: true,
            tip: I18n.sys_cof.sum.network_info.irq_aggre.rx_usecs,
          },
          {
            label: 'tx-usecs',
            key: 'tx-usecs',
            checked: false,
            expanded: true,
            tip: I18n.sys_cof.sum.network_info.irq_aggre.tx_usecs,
          },
          {
            label: 'rx-frames',
            key: 'rx-frames',
            checked: false,
            expanded: true,
            tip: I18n.sys_cof.sum.network_info.irq_aggre.rx_frames,
          },
          {
            label: 'tx-frames',
            key: 'tx-frames',
            checked: false,
            expanded: true,
            tip: I18n.sys_cof.sum.network_info.irq_aggre.tx_frames,
          }
        ]
      },
      {
        label: 'Offload',
        key: 'pid',
        checked: true,
        expanded: true,
        disabled: true,
        children: [
          {
            label: 'rx-checksumming',
            key: 'rx-checksumming',
            checked: true,
            expanded: true,
            tip: I18n.sys_cof.sum.network_info.offload.rx_checksumming,
          },
          {
            label: 'tx-checksumming',
            checked: false,
            key: 'tx-checksumming',
            tip: I18n.sys_cof.sum.network_info.offload.tx_checksumming,
          },
          {
            label: 'scatter-gatter',
            checked: false,
            key: 'scatter-gatter',
            tip: I18n.sys_cof.sum.network_info.offload.scatter_gather,
          },
          {
            label: 'TSO',
            checked: false,
            key: 'TSO',
            tip: I18n.sys_cof.sum.network_info.offload.TSO,
          },
          {
            label: 'UFO',
            checked: false,
            key: 'UFO',
            tip: I18n.sys_cof.sum.network_info.offload.UFO,
          },
          {
            label: 'LRO',
            checked: false,
            key: 'LRO',
            tip: I18n.sys_cof.sum.network_info.offload.LRO,
          },
          {
            label: 'GSO',
            checked: false,
            key: 'GSO',
            tip: I18n.sys_cof.sum.network_info.offload.GSO,
          },
          {
            label: 'GRO',
            checked: false,
            key: 'GRO',
            tip: I18n.sys_cof.sum.network_info.offload.GRO,
          },
        ]
      },
      {
        label: 'Channels',
        key: 'pid',
        checked: true,
        expanded: true,
        disabled: true,
        children: [
          {
            label: 'Combined',
            key: 'Combined',
            checked: true,
            expanded: true,
            tip: I18n.sysPerfDetailed.queueConfiguration,
          }
        ]
      },
      {
        label: 'Ring Buffer',
        key: 'pid',
        checked: true,
        expanded: true,
        disabled: true,
        children: [
          {
            label: 'Tx',
            key: 'Tx',
            checked: true,
            expanded: true,
            tip: I18n.sys_cof.sum.network_info.nic_buff.tx_buff_size
          },
          {
            label: 'Rx',
            checked: false,
            key: 'Rx',
            tip: I18n.sys_cof.sum.network_info.nic_buff.rx_buff_size
          },
        ]
      }
    ];
    this.tcpTitle = [
      {
        title: I18n.common_term_projiect_task_process,
        key: 'process',
        searchKey: 'process',
        canClick: true
      },
      {
        title: 'Command',
        key: 'Command',
      },
      {
        title: 'Protocol',
        key: 'Protocol',
      },
      {
        title: 'Local IP',
        key: 'Local IP',
      },
      {
        title: 'Local Port',
        key: 'Local Port',
      },
      {
        title: 'Remote IP',
        key: 'Remote IP',
      },
      {
        title: 'Remote Interface',
        key: 'Remote Interface',
        canClick: true
      },
      {
        title: 'Remote Port',
        key: 'Remote Port',
      }
    ];
    this.ioconsumTitle = [
      {
        label: 'IFACE',
        key: 'iface',
        checked: true,
        expanded: true,
        disabled: true,
        searchKey: 'iface',
        canClick: true,
        tip: I18n.sys.tip.IFACE,
      },
      {
        label: I18n.sysPerfDetailed.loadStatistics,
        key: 'pid',
        checked: true,
        expanded: true,
        disabled: true,
        children: [
          {
            label: 'rxpck/s',
            key: 'rxpck',
            checked: true,
            expanded: true,
            sortKey: 'rxpck',
            tip: I18n.sys.tip['rxpck/s'],
          },
          {
            label: 'txpck/s',
            key: 'txpck',
            checked: true,
            expanded: true,
            sortKey: 'txpck',
            tip: I18n.sys.tip['txpck/s'],
          },
          {
            label: 'rx(KB)/s',
            key: 'rxkb',
            checked: true,
            expanded: true,
            sortKey: 'rxkb',
            tip: I18n.sys.tip['rxkB/s'],
          },
          {
            label: 'tx(KB)/s',
            key: 'txkb',
            checked: true,
            expanded: true,
            sortKey: 'txkb',
            tip: I18n.sys.tip['txkB/s'],
          }
        ]
      },
      {
        label: I18n.sysPerfDetailed.faultStatistics,
        key: 'pid',
        checked: true,
        expanded: true,
        disabled: true,
        children: [
          {
            label: 'rxerr/s ',
            key: 'rxerr',
            checked: true,
            expanded: true,
            sortKey: 'rxerr',
            tip: I18n.sys.tip['rxerr/s'],
          },
          {
            label: 'txerr/s',
            key: 'txerr',
            checked: true,
            expanded: true,
            sortKey: 'txerr',
            tip: I18n.sys.tip['txerr/s'],
          },
          {
            label: 'rxdrop/s',
            key: 'rxdrop',
            checked: true,
            expanded: true,
            sortKey: 'rxdrop',
            tip: I18n.sys.tip['rxdrop/s'],
          },
          {
            label: 'txdrop/s',
            key: 'txdrop',
            checked: true,
            expanded: true,
            sortKey: 'txdrop',
            tip: I18n.sys.tip['txdrop/s'],
          },
          {
            label: 'rxfifo/s',
            key: 'rxfifo',
            checked: true,
            expanded: true,
            sortKey: 'rxfifo',
            tip: I18n.sys.tip['rxfifo/s'],
          },
          {
            label: 'txfifo/s',
            key: 'txfifo',
            checked: true,
            expanded: true,
            sortKey: 'txfifo',
            tip: I18n.sys.tip['txfifo/s'],
          }
        ]
      },
    ];
    this.fileTitle = [
      {
        title: 'File Name',
        key: 'File Name',
        sug: I18n.common_term_task_tab_function_name,
        canClick: true
      },
      {
        title: 'File System',
        key: 'File System',
        sug: I18n.tuninghelper.sysConfigDetail.fileSystem,
      },
      {
        title: I18n.common_term_projiect_task_process,
        key: 'Process',
        searchKey: 'Process',
        canClick: true,
      },
      {
        title: 'Command',
        key: 'Command',
      },
      {
        title: 'Mode',
        key: 'Mode',
      }
    ];
    this.raidTitle = [
      {
        label: I18n.pcieDetailsinfo.disk_name,
        key: 'name',
        checked: true,
        expanded: true,
        disabled: true,
      },
      {
        label: 'RAID',
        key: 'RAID',
        checked: true,
        expanded: true,
        disabled: true,
        children: [
          {
            label: 'Level',
            key: 'level',
            checked: true,
            expanded: true,
            tip: I18n.sys_cof.sum.raid_level_info.raid_level
          },
          {
            label: 'Strip Size(KB)',
            key: 'strip_size',
            checked: true,
            expanded: true,
            tip: I18n.sys_cof.sum.raid_level_info.volume_size
          },
          {
            label: 'Read Policy',
            key: 'read_policy',
            checked: true,
            expanded: true,
            tip: I18n.sys_cof.sum.raid_level_info.volume_read
          },
          {
            label: 'Write Policy',
            key: 'write_policy',
            checked: true,
            expanded: true,
            tip: I18n.sys_cof.sum.raid_level_info.volume_write
          },
          {
            label: 'IO Policy',
            key: 'io_policy',
            checked: true,
            expanded: true,
            tip: I18n.sys_cof.sum.raid_level_info.volume_cache
          },
          {
            label: 'Disks',
            key: 'disks',
            checked: true,
            expanded: true,
            tip: I18n.sysPerfDetailed.disks
          }
        ]
      },
    ];
    this.hardDistTitle = [
      {
        label: I18n.pcieDetailsinfo.disk_name,
        width: '10%',
        key: 'name',
        checked: true,
        expanded: true,
        disabled: true,
      },
      {
        label: I18n.sys_cof.sum.disk_info.disk_cap + I18n.common_term_sign_left + 'TB' + I18n.common_term_sign_right,
        width: '10%',
        key: 'tuning_disk_size',
        checked: true,
        expanded: true,
        disabled: true,
      },
      {
        label: I18n.sys_cof.sum.disk_info.disk_type,
        width: '10%',
        key: 'tuning_disk_type',
        checked: true,
        expanded: true,
        disabled: true,
      },
      {
        label: I18n.sys_cof.sum.disk_info.disk_model,
        width: '10%',
        key: 'tuning_disk_manufacturer',
        checked: true,
        expanded: true,
        disabled: true,
      },
      {
        label: I18n.setting,
        width: '56%',
        key: 'tuning_read_ahead',
        checked: true,
        expanded: true,
        disabled: true,
        children: [
          {
            label: 'read_ahead_kb',
            width: '8%',
            key: 'tuning_read_ahead',
            checked: true,
            expanded: true,
            tip: I18n.tuninghelper.commonTableTooltip.read_ahead_kb
          },
          {
            label: 'scheduler',
            width: '8%',
            key: 'tuning_scheduler',
            checked: true,
            expanded: true,
            tip: I18n.tuninghelper.commonTableTooltip.scheduler
          },
          {
            label: 'rq_affinity',
            width: '8%',
            key: 'tuning_rq_affinity',
            checked: true,
            expanded: true,
            tip: I18n.tuninghelper.commonTableTooltip.rq_affinity
          },
          {
            label: 'nr_requests',
            width: '8%',
            key: 'tuning_nr_requests',
            checked: true,
            expanded: true,
            tip: I18n.tuninghelper.commonTableTooltip.nr_requests
          },
          {
            label: 'queue_depth',
            width: '8%',
            key: 'tuning_queue_depth',
            checked: true,
            expanded: true,
            tip: I18n.tuninghelper.commonTableTooltip.queue_depth
          },
          {
            label: 'nomerges',
            width: '8%',
            key: 'tuning_nomerges',
            checked: true,
            expanded: true,
            tip: I18n.tuninghelper.commonTableTooltip.nomerges
          },
          {
            label: 'write_cache',
            width: '8%',
            key: 'tuning_disk_write_cache',
            checked: true,
            expanded: true,
            tip: I18n.tuninghelper.commonTableTooltip.write_cache
          },
        ]
      },
    ];
    this.equipConTitle = [
      {
        title: 'Device',
        key: 'dev',
        sug: I18n.tuninghelper.sysConfigDetail.deviceName,
        searchKey: 'dev',
        canClick: true
      },
      {
        title: 'tps',
        key: 'tps',
        sug: I18n.sys.tip.tps,
        sortKey: 'tps'
      },
      {
        title: 'rd(KB)/s',
        key: 'rd_sec',
        sug: I18n.sys.tip['rd(KB)/s'],
        sortKey: 'rd_sec'
      },
      {
        title: 'wr(KB)/s',
        key: 'wr_sec',
        sug: I18n.sys.tip['wr(KB)/s'],
        sortKey: 'wr_sec'
      },
      {
        title: 'avgrq-sz(KB)',
        key: 'avgrq_sz',
        sug: I18n.sys.tip['avgrq-sz'],
        sortKey: 'avgrq_sz'
      },
      {
        title: 'avgqu-sz',
        key: 'avgqu_sz',
        sug: I18n.sys.tip['avgqu-sz'],
        sortKey: 'avgqu_sz'
      },
      {
        title: 'await(ms)',
        key: 'await',
        sug: I18n.sys.tip.await,
        sortKey: 'await'
      },
      {
        title: 'svctm(ms)',
        key: 'svctm',
        sug: I18n.sys.tip.svctm,
        sortKey: 'svctm'
      },
      {
        title: '%util',
        key: 'util_percentage',
        sug: I18n.sys.tip['%util'],
        sortKey: 'util_percentage'
      },
    ];
    this.usageTitle = [
      I18n.net_io.memory_usage,
      I18n.sysPerfDetailed.statistics,
      I18n.sysPerfDetailed.huge,
      I18n.sys.titles.memPag,
      I18n.sys.titles.memSwap,
      I18n.sysPerfDetailed.swap,
    ];
    this.processTitle = [
      {
        title: I18n.common_term_projiect_task_process,
        key: 'process',
        searchKey: 'process',
        canClick: true,
      },
      {
        title: 'minflt/s',
        key: 'minflt/s',
        sortKey: 'minflt/s',
        tip: I18n.process.sum.mem.min
      },
      {
        title: 'majflt/s',
        key: 'majflt/s',
        sortKey: 'majflt/s',
        tip: I18n.process.sum.mem.maj
      },
      {
        title: 'VSZ(KB)',
        key: 'VSZ(KB)',
        sortKey: 'VSZ(KB)',
        tip: I18n.process.sum.mem.vsz
      },
      {
        title: 'RSS(KB)',
        key: 'RSS(KB)',
        sortKey: 'RSS(KB)',
        tip: I18n.process.sum.mem.rss
      },
      {
        title: '%MEM',
        key: '%MEM',
        sortKey: '%MEM',
        tip: I18n.process.sum.mem.mem
      },
    ];
    this.numaTitle = [
      {
        title: 'NUMA Node',
        key: 'node_name',
        sug: '',
      },
      {
        title: 'numa_hit',
        key: 'numa_hit',
        sug: I18n.sys.tip.numahit,
      },
      {
        title: 'numa_miss',
        key: 'numa_miss',
        sug: I18n.sys.tip.numa_miss,
      },
      {
        title: 'numa_foreign',
        key: 'numa_foreign',
        sug: I18n.sys.tip.numa_foreign,
      },
      {
        title: 'interleave_hit',
        key: 'interleave_hit',
        sug: I18n.sys.tip.interleave_hit,
      },
      {
        title: 'local_node',
        key: 'local_node',
        sug: I18n.sys.tip.local_node,
      },
      {
        title: 'other_node',
        key: 'other_node',
        sug: I18n.sys.tip.other_node,
      }
    ];
    this.usageData = [
      [{
        title: 'total(KB)',
        data: '--',
        key: 'total',
        sug: I18n.sys_cof.sum.cpu_info.total_mem,
        mark: true
      },
      {
        title: 'free(KB)',
        data: '--',
        key: 'kbmemfree',
        sug: I18n.sys.tip['memfree(KB)'],
        mark: false
      },
      {
        title: 'used(KB)',
        data: '--',
        key: 'kbmemused',
        sug: I18n.sys.tip['memused(KB)'],
        mark: false
      },
      {
        title: '%used',
        data: '--',
        key: 'memused',
        sug: I18n.sys.tip['%memused'],
        mark: false
      },
      {
        title: 'avail(KB)',
        data: '--',
        key: 'avail',
        sug: I18n.sys.tip['avail(KB)'],
        mark: false
      },
      {
        title: 'buffers(KB)',
        data: '--',
        key: 'kbbuffers',
        sug: I18n.sys.tip['buffers(KB)'],
        mark: false
      },
      {
        title: 'cached(KB)',
        data: '--',
        key: 'kbcached',
        sug: I18n.sys.tip['cached(KB)'],
        mark: false
      }],
      [{
        title: I18n.sysPerfDetailed.totalRead,
        data: '--',
        key: 'accesscount_r',
        sug: '',
        mark: false
      },
      {
        title: I18n.sysPerfDetailed.totalWrite,
        data: '--',
        key: 'accesscount_w',
        sug: '',
        mark: false
      },
      {
        title: I18n.sysPerfDetailed.localRead,
        data: '--',
        key: 'localaccess_r',
        sug: '',
        mark: false
      },
      {
        title: I18n.sysPerfDetailed.localWrite,
        data: '--',
        key: 'localaccess_w',
        sug: '',
        mark: false
      },
      {
        title: I18n.sysPerfDetailed.dieRead,
        data: '--',
        key: 'spandie_r',
        sug: '',
        mark: false
      },
      {
        title: I18n.sysPerfDetailed.dieWrite,
        data: '--',
        key: 'spandie_w',
        sug: '',
        mark: false
      },
      {
        title: I18n.sysPerfDetailed.crossRead,
        data: '--',
        key: 'spanchip_r',
        sug: '',
        mark: false
      },
      {
        title: I18n.sysPerfDetailed.crossWrite,
        data: '--',
        key: 'spanchip_w',
        sug: '',
        mark: false
      }],
      [{
        title: 'kbhugfree',
        data: '--',
        key: 'kbhugfree',
        sug: I18n.sys.tip['memfree(KB)'],
      },
      {
        title: 'kbhugused',
        data: '--',
        key: 'kbhugused',
        sug: I18n.sys.tip['memused(KB)'],
        mark: false
      },
      {
        title: '%hugused',
        data: '--',
        key: 'hugused',
        sug: I18n.sysPerfDetailed['%memused'],
        mark: false
      }],
      [{
        title: 'pgpgin(KB)/s',
        data: '--',
        key: 'pgpgin',
        sug: I18n.sys.tip['pgpgin/s'],
      },
      {
        title: 'pgpgout(KB)/s',
        data: '--',
        key: 'pgpgout',
        sug: I18n.sys.tip['pgpgout/s'],
        mark: false
      },
      {
        title: 'fault/s',
        data: '--',
        key: 'fault',
        sug: I18n.sys.tip['fault/s'],
        mark: false
      },
      {
        title: 'minflt/s',
        data: '--',
        key: 'minflt',
        sug: I18n.process.sum.mem.min,
        mark: false
      },
      {
        title: 'majflt/s',
        data: '--',
        key: 'majflt',
        sug: I18n.sys.tip['majflt/s'],
        mark: false
      }],
      [{
        title: 'pswpin/s',
        data: '--',
        key: 'pswpin',
        sug: I18n.sys.tip['pswpin/s'],
      },
      {
        title: 'pswpout/s',
        data: '--',
        key: 'pswpout',
        sug: I18n.sys.tip['pgpgout/s'],
        mark: false
      }],
      [{
        title: 'kbswpfree',
        data: '--',
        key: 'kbswpfree',
        sug: I18n.sys.tip['memfree(KB)'],
      },
      {
        title: 'kbswpused',
        data: '--',
        key: 'kbswpused',
        sug: I18n.sys.tip['memused(KB)'],
        mark: false
      },
      {
        title: '%swpused',
        data: '--',
        key: 'swpused',
        sug: I18n.sysPerfDetailed['%memused'],
        mark: false
      },
      {
        title: 'kbswpcad',
        data: '--',
        key: 'kbswpcad',
        sug: I18n.sysPerfDetailed.Kbswpcad,
        mark: false
      },
      {
        title: '%swpcad',
        data: '--',
        key: 'swpcad',
        sug: I18n.sysPerfDetailed['%swpcad'],
        mark: false
      }],
    ];
  }
}
