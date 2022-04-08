import { Injectable } from '@angular/core';
import { I18nService } from 'projects/sys/src-ide/app/service/i18n.service';
import { Subject } from 'rxjs';
import { TiTableColumns } from '@cloud/tiny3';

@Injectable({
  providedIn: 'root'
})
export class ConfigTableService {
  public timelineUPData = new Subject<object>();
  private i18n: any;
  public configInfo: {[x: string]: any}[] = [];
  public multipleValues: Array<TiTableColumns> = [];
  public taskMsg: Array<TiTableColumns> = [];
  // 硬盘
  public hardDiskTitle: Array<TiTableColumns> = [];
  //  RAID控制卡
  public RAIDTitle: Array<TiTableColumns> = [];
  // 网络子系统 网口
  public networkPortTitle: Array<TiTableColumns> = [];
  // Raid级别
  public raidControlCardTitle: Array<TiTableColumns> = [];
  // 文件信息
  public filleInformationTitle: Array<TiTableColumns> = [];
  // 存储资源配置 存储信息
  public storageInformationTitle: Array<TiTableColumns> = [];
  // 网口配置 中断聚合
  public polymerizationTitle: Array<TiTableColumns> = [];
  // 网口配置 offload
  public offloadTitle: Array<TiTableColumns> = [];
  // 网口配置 列队
  public queue: Array<TiTableColumns> = [];
  // 网口配置 中断NUMA绑核
  public interruptTitle: Array<TiTableColumns> = [];
  // 网口配置 网卡缓冲区
  public nicBuff: Array<TiTableColumns> = [];
  // 内存子系统 DIMM列表
  public dimmListTitle: Array<TiTableColumns> = [];
  // NUMA节点配置
  public numaNodeTitle: Array<TiTableColumns> = [];
  // 网络子系统 网卡
  public networkTitle: Array<TiTableColumns> = [];
  // 存储io
  public storageIOTitle: Array<TiTableColumns> = [];
  // 网络io
  public netIOTitle: Array<TiTableColumns> = [];
    // raid配置
  public raidConfigTitle: Array<TiTableColumns> = [];
  constructor(
    public i18nService: I18nService,
  ) {
    this.i18n = this.i18nService.I18n();
    this.raidConfigTitle = [{
      title: 'Personalities',
      key: 'Personalities',
    },
    {
      title: 'unuseddevices',
      key: 'unuseddevices',
    }
    ];
    this.storageIOTitle = [{
      title: this.i18n.sys_cof.sum.disk_info.disk_name,
      key: 'dev',
      sortkey: 'dev'
    },
    {
      title: 'tps',
      key: 'tps',
      sortkey: 'tps'
    },
    {
      title: 'rd(KB)/s',
      key: 'rd',
      sortkey: 'rd'
    },
    {
      title: 'wr(KB)/s',
      key: 'wr',
      sortkey: 'wr'
    },
    {
      title: 'await',
      key: 'await',
      sortkey: 'await'
    }];
    this.netIOTitle = [{
      title: this.i18n.sys_summary.cpupackage_tabel.delay,
      key: 'delay',
    },
    {
      title: this.i18n.sys_summary.cpupackage_tabel.NUMAnode,
      key: 'node',
    },
    {
      title: this.i18n.sys_summary.cpupackage_tabel.drive,
      key: 'drive',
    },
    {
      title: this.i18n.sys_summary.cpupackage_tabel.model,
      key: 'model',
    },
    {
      title: this.i18n.sys_summary.cpupackage_tabel.equipment,
      key: 'equipment',
    }];
    this.networkTitle = [{
      title: this.i18n.linkage.name,
      key: 'name',
    },
    {
      title: 'rxpck/s',
      key: 'rxpck/s',
    },
    {
      title: 'txpck/s',
      key: 'txpck/s',
    },
    {
      title: 'rxkB/s',
      key: 'rxkB/s',
    },
    {
      title: 'txkB/s',
      key: 'txkB/s',
    },
    {
      title: 'eth_ge',
      key: 'eth_ge'
    }];
    this.numaNodeTitle = [
      {
        title: this.i18n.sys_cof.sum.cpu_info.node_name,
        key: 'node',
      },
      {
        title: this.i18n.sys_cof.sum.cpu_info.numa_core,
        key: 'numa_core',
      },
      {
        title: this.i18n.sys_cof.sum.cpu_info.total_mem,
        key: 'total_mem',
      },
      {
        title: this.i18n.sys_cof.sum.cpu_info.free_mem,
        key: 'free_mem',
      },
    ];
      // 内存子系统表格title
    this.dimmListTitle = [
        {
          title: this.i18n.sys_cof.sum.cpu_info.node,
          key: 'node',
        },
        {
          title: this.i18n.sys_cof.sum.mem_info.mem_cap,
          key: 'memCap',
        },
        {
          title: this.i18n.sys_cof.sum.mem_info.max_t,
          key: 'maxRate',
        },
      ];
    this.nicBuff = [
      { title: this.i18n.sys_cof.sum.network_info.nic_buff.nic_name, key: 'nic_name', tipStr: '', },
      { title: 'TX(Byte)', key: 'tx_buff_size', tipStr: this.i18n.sys_cof.sum.network_info.nic_buff.tx_buff_size, },
      { title: 'RX(Byte)', key: 'rx_buff_size', tipStr: this.i18n.sys_cof.sum.network_info.nic_buff.rx_buff_size, },
    ];
    this.interruptTitle = [
      {
        title: this.i18n.sys_summary.cpupackage_tabel.networkName,
        key: 'networkName',

      },
      {
        title: this.i18n.sys_cof.sum.network_info.numa_core.inter_id,
        key: 'inter_id',
      },
      {
        title: this.i18n.sys_cof.sum.network_info.numa_core.inter_info,
        key: 'inter_info',
      },
      {
        title: 'xps/rps',
        key: 'xps',
      },
    ];
    this.queue = [
      {
        title: this.i18n.sys_summary.cpupackage_tabel.networkName,
        key: 'networkName',

      },
      {
        title: this.i18n.sys_cof.sum.network_info.queue_num,
        key: 'queue_num',
      },

    ];
    this.offloadTitle = [
      {
        title: this.i18n.sys_summary.cpupackage_tabel.networkName,
        key: 'networkName',

      },
      {
        title: 'rx-checksumming',
        key: 'rx-checksumming',
        tipStr: this.i18n.sys_cof.sum.network_info.offload.rx_checksumming,
      },
      {
        title: 'tx-checksumming',
        key: 'tx-checksumming',
        tipStr: this.i18n.sys_cof.sum.network_info.offload.tx_checksumming,
      },
      {
        title: 'scatter-gather',
        key: 'scatter',
        tipStr: this.i18n.sys_cof.sum.network_info.offload.scatter_gather,
      },
      {
        title: 'TSO',
        key: 'TSO',
        tipStr: this.i18n.sys_cof.sum.network_info.offload.TSO,
      },
      {
        title: 'UFO',
        key: 'UFO',
        tipStr: this.i18n.sys_cof.sum.network_info.offload.UFO,
      },
      {
        title: 'LRO',
        key: 'LRO',
        tipStr: this.i18n.sys_cof.sum.network_info.offload.LRO,
      },
      {
        title: 'GSO',
        key: 'GSO',
        tipStr: this.i18n.sys_cof.sum.network_info.offload.GSO,
      },
      {
        title: 'GRO',
        key: 'GRO',
        tipStr: this.i18n.sys_cof.sum.network_info.offload.GRO,
      },

    ];
    this.polymerizationTitle = [
      {
        title: this.i18n.sys_summary.cpupackage_tabel.networkName,
        key: 'networkName',
      },
      {
        title: 'adaptive-rx',
        key: 'adaptive_rx',
        tipStr: this.i18n.sys_cof.sum.network_info.irq_aggre.adaptive_rx,
      },
      {
        title: 'adaptive-tx',
        key: 'adaptive_tx',
        tipStr: this.i18n.sys_cof.sum.network_info.irq_aggre.adaptive_tx,
      },
      {
        title: 'rx-usecs',
        key: 'rx_usecs',
        tipStr: this.i18n.sys_cof.sum.network_info.irq_aggre.rx_usecs,
      },
      {
        title: 'tx-usecs',
        key: 'tx_usecs',
        tipStr: this.i18n.sys_cof.sum.network_info.irq_aggre.tx_usecs,
      },
      {
        title: 'rx-frames',
        key: 'rx_frames',
        tipStr: this.i18n.sys_cof.sum.network_info.irq_aggre.rx_frames,
      },
      {
        title: 'tx-frames',
        key: 'tx_frames',
        tipStr: this.i18n.sys_cof.sum.network_info.irq_aggre.tx_frames,
      },
    ];
    this.raidControlCardTitle = [
      {
        title: this.i18n.sys_cof.sum.raid_level_info.volume_name,
        key: 'volume_name',
      },
      {
        title: this.i18n.sys_cof.sum.raid_level_info.volume_id,
        key: 'volume_id',
      },
      {
        title: this.i18n.sys_cof.sum.raid_level_info.raid_id,
        key: 'raid_id',
      },
      {
        title: this.i18n.sys_cof.sum.raid_level_info.raid_level,
        key: 'raid_level',
      },
      {
        title: this.i18n.sys_cof.sum.raid_level_info.volume_size,
        key: 'volume_size',
      },
      {
        title: this.i18n.sys_cof.sum.raid_level_info.volume_read,
        key: 'volume_read',
      },
      {
        title: this.i18n.sys_cof.sum.raid_level_info.volume_write,
        key: 'volume_write',
      },
      {
        title: this.i18n.sys_cof.sum.raid_level_info.volume_cache,
        key: 'volume_cache',
      },
      {
        title: this.i18n.sys_cof.sum.raid_level_info.cachecade,
        key: 'cachecade',
      },
    ];
    // 存储信息
    this.storageInformationTitle = [
      {
        title: this.i18n.sys_cof.sum.storage_msg_info.storange_name,
        key: 'storange_name',
      },
      {
        title: this.i18n.sys_cof.sum.storage_msg_info.storage_file,
        key: 'storage_file',
      },
      {
        title: this.i18n.sys_cof.sum.storage_msg_info.storage_io,
        key: 'storage_io',
      },
      {
        title: this.i18n.sys_summary.cpupackage_tabel.Affinity,
        key: 'Affinity',
      },
      {
        title: this.i18n.sys_summary.cpupackage_tabel.line_up,
        key: 'line_up',
      },
      {
        title: this.i18n.sys_summary.cpupackage_tabel.depth,
        key: 'depth',
      },
      {
        title: this.i18n.sys_summary.cpupackage_tabel.IO,
        key: 'IO',
      },
    ];
    //  文件系统信息
    this.filleInformationTitle = [
      {
        title: this.i18n.sys_cof.sum.file_info.file_name,
        key: 'file_name',
      },
      {
        title: this.i18n.sys_cof.sum.file_info.file_type,
        key: 'file_type',
        tipStr: this.i18n.sys_cof.sum.file_info.file_type_suggest,
      },
      {
        title: this.i18n.sys_cof.sum.file_info.file_dot,
        key: 'file_dot',
        tipStr: this.i18n.sys_cof.sum.file_info.file_dot_suggest,
      },
      {
        title: this.i18n.sys_cof.sum.file_info.file_msg,
        key: 'file_msg',
      },
    ];
    // 网络子系统 title
    this.networkPortTitle = [{
      title: this.i18n.sys_summary.cpupackage_tabel.delay,
      key: 'delay',
    },
    {
      title: this.i18n.sys_summary.cpupackage_tabel.NUMAnode,
      key: 'node',
    },
    {
      title: this.i18n.sys_summary.cpupackage_tabel.drive,
      key: 'drive',
    },
    {
      title: this.i18n.sys_summary.cpupackage_tabel.model,
      key: 'model',
    },
    {
      title: this.i18n.sys_summary.cpupackage_tabel.equipment,
      key: 'equipment',
    },
    { title: this.i18n.sys_cof.sum.cpu_info.node, key: 'nodeName1' }];
    this.hardDiskTitle = [
      {
        title: this.i18n.sys_cof.sum.disk_info.disk_name,
        key: 'disk_name',
      },
      {
        title: this.i18n.sys_cof.sum.disk_info.disk_model,
        key: 'disk_model',
      },
      {
        title: this.i18n.sys_cof.sum.disk_info.disk_cap,
        key: 'disk_cap',
      },
      {
        title: this.i18n.sys_cof.sum.disk_info.disk_type,
        key: 'disk_type',
      },
      {
        title: '%util',
        key: 'util',
      },
      {
        title: 'avgqu_sz',
        key: 'avgqu_sz',
      },
      {
        title: 'await',
        key: 'await',
      },
      {
        title: 'svctm',
        key: 'svctm',
      },
    ];
    this.RAIDTitle = [
      {
        title: this.i18n.sys_cof.sum.raid_info.raid_id,
        key: 'raid_id',
      },
      {
        title: this.i18n.sys_cof.sum.raid_info.raid_model,
        key: 'raid_model',
      },
      {
        title: this.i18n.sys_cof.sum.raid_info.raid_size,
        key: 'raid_size',
      },
    ];
    this.multipleValues = [
      {
        title: this.i18n.sys_cof.sum.cpu_info.node,
        key: 'node',
      },
      {
        title: '',
        key: '',
      },
      {
        title: this.i18n.common_term_task_name,
        key: 'task_name',
      },
      {
        title: this.i18n.common_term_projiect_name,
        key: 'project_name',
      }
    ];
    this.taskMsg = [
      {
        title: this.i18n.linkage.nodeName,
        key: 'node_name',
      },
      {
        title: this.i18n.common_term_node_ip,
        key: 'node_ip',
      },
      {
        title: this.i18n.linkage.startTime,
        key: 'start_time',
      },
      {
        title: this.i18n.linkage.endTime,
        key: 'end_time',
      },
      {
        title: this.i18n.linkage.task,
        key: 'task_name',
      },
      {
        title: this.i18n.linkage.project,
        key: 'project_name',
      }
    ];
    this.configInfo = [
      {
        title: this.i18n.sys.baseInfo,
        prop: 'system_base',
        table: [[{
          title: this.i18n.sys_cof.sum.bios,
          key: 'BIOS',
          type: 'singleData',
          prop: this.i18n.sys_cof.sum.bios,
        },
        {
          title: this.i18n.sys_cof.sum.os,
          key: 'cfg_os_version',
          type: 'singleData',
        },
        {
          title: this.i18n.sys_cof.sum.kernel,
          key: 'cfg_kernel_version',
          type: 'singleData',
        },
        {
          title: this.i18n.sys_cof.sum.jdk,
          key: 'cfg_jdk_version',
          type: 'singleData',
        },
        {
          title: this.i18n.sys_cof.sum.glibc,
          key: 'cfg_glibc_version',
          type: 'singleData',

        }],
        [{
          title: 'sysctl',
          key: 'sysctl',
          type: 'multipleRows'
        },
        {
          title: 'kernelConfig',
          key: 'kernelConfig',
          type: 'multipleRows'
        }],
        [
          {
            title: this.i18n.sys_cof.sum.firmware_info.bmc_version,
            key: 'BMC',
            type: 'singleData',
            prop: this.i18n.linkage.version,
          }
        ]]
      },
      {
        title: 'CPU Package',
        prop: 'CPU_Package',
        table: [[{
          title: this.i18n.sys.cpuType,
          key: 'cpu_type',
          type: 'singleData',
        },
        {
          title: this.i18n.sys.coreNum,
          key: 'cpu_cores',
          type: 'multipleValues',
        },
        {
          title: this.i18n.linkage.hz,
          key: 'current_freq',
          type: 'singleData',
        }],
        [{
          title: this.i18n.sys_cof.sum.cpu_info.numa_node,
          key: 'numa_node',
          type: 'differentNodes',
          columns: this.numaNodeTitle,
        },
        {
          title: this.i18n.sys_summary.cpupackage_tabel.NUMA_name,
          key: 'cfg_numa_balacing',
          type: 'multipleValues',
        }
        ]]
      },
      { // 内存子系统
        title: this.i18n.sys_summary.mem_subsystem_text,
        prop: 'memory_subsystem',
        table: [[{
          title: this.i18n.sys.memCap
          + this.i18n.common_term_sign_left + 'G' + this.i18n.common_term_sign_right,
          key: 'total_mem',
          type: 'singleData',
        },
        {
          title: this.i18n.sys_summary.mem_subsystem.dimm_num,
          key: 'dimm_num',
          type: 'singleData',
        },
        {
          title: this.i18n.sys.nullNum,
          key: 'null',
          type: 'singleData',
        }],
        [{
          title: '%memused',
          key: 'memused_percentage',
          type: 'singleData',
          prop: this.i18n.linkage.percent,
        },
        {
          title: 'pswpin/s',
          key: 'pswpin_sec',
          type: 'singleData',
        },
        {
          title: 'pswpout/s',
          key: 'pswpout_sec',
          type: 'singleData',
        }
        ],
        [{ // 返回缺失
          title: this.i18n.sys_cof.sum.mem_info.mem_list,
          key: 'dimm',
          type: 'differentNodes',
          columns: this.dimmListTitle,
        }
        ]]
      },
      { // 内存管理系统
        title: this.i18n.sys.memManage,
        prop: 'memory_manage_subsystem',
        table: [[{
          title: this.i18n.sys_cof.sum.smmu,
          key: 'cfg_smmu_info',
          type: 'singleData',
        },
        {
          title: this.i18n.sys_cof.sum.page_size
          + this.i18n.common_term_sign_left + 'B' + this.i18n.common_term_sign_right,
          key: 'cfg_page_size',
          type: 'singleData',
        },
        {
          title: this.i18n.sys_cof.sum.tran_page,
          key: 'cfg_transparent_info',
          type: 'singleData',
        },
        {
          title: this.i18n.sys_summary.cpupackage_tabel.standard_page
          + this.i18n.common_term_sign_left + 'KB' + this.i18n.common_term_sign_right,
          key: 'cfg_hugepage_size',
          type: 'singleData',
        },
        {
          title: this.i18n.sys_summary.cpupackage_tabel.page_number,
          key: 'cfg_hugepage_num',
          type: 'singleData',
        },
        {
          title: this.i18n.linkage.partition,
          key: 'cfg_vm_swappiness',
          type: 'singleData',
        }],
        [{
          title: this.i18n.sys_cof.sum.dirty_time,
          key: 'cfg_dirty_time',
          type: 'singleData',
        },
        {
          title: this.i18n.sys_cof.sum.dirty_ratio,
          key: 'cfg_dirty_ratio',
          type: 'singleData',
        },
        {
          title: this.i18n.sys_cof.sum.dirty_memratio,
          key: 'cfg_dirty_memratio',
          type: 'singleData',
        },
        {
          title: this.i18n.sys_summary.cpupackage_tabel.data_interval,
          key: 'cfg_dirty_interval',
          type: 'singleData',
        },
        {
          title: this.i18n.sys_summary.cpupackage_tabel.idle + '(KB)',
          key: 'cfg_vm_minfreekbyte',
          type: 'singleData',
        }]]
      },
      { // 存储子系统
        title: this.i18n.sys_summary.storage_subsystem_text,
        prop: 'storage_subsystem',
        table: [[{
          title: this.i18n.linkage.diskNum,
          key: 'diskNum',
          type: 'multipleValues',
        },
        {
          title: this.i18n.sys_summary.storage_subsystem.storage_tatol
          + this.i18n.common_term_sign_left + 'G' + this.i18n.common_term_sign_right,
          key: 'storage_cap',
          type: 'multipleValues',
        }],
        [{ // 返回有误
          title: this.i18n.linkage.diskList,
          key: 'storage',
          type: 'multipleObjects',
          columns: this.hardDiskTitle,
        },
        {
          title: this.i18n.sys_cof.sum.raid,
          key: 'raid_control',
          type: 'multipleObjects',
          columns: this.RAIDTitle,
        }
        ]]
      },
      { // 存储资源配置
        title: this.i18n.sys.storageConfig,
        prop: 'storage_resource_config',
        table: [[{
          title: this.i18n.sys_summary.cpupackage_tabel.raid_group,
          key: 'raid_num',
          type: 'singleData',
        },
        {
          title: this.i18n.linkage.stroug_volume,
          key: 'storage_num',
          type: 'singleData',
        },
        {
          title: this.i18n.linkage.fileNum,
          key: 'file_num',
          type: 'singleData',
        }],
        [{
          title: this.i18n.sys_cof.sum.raid_level_info.raid_level,
          key: 'raid_level',
          type: 'multipleObjects',
          columns: this.raidControlCardTitle,
        },
        {
          title: this.i18n.sys_summary.cpupackage_tabel.raid_config,
          key: 'cfg_raid_config',
          type: 'multipleObjects',
          columns: this.raidConfigTitle,
        },
        {
          title: this.i18n.sys_cof.sum.storage_msg,
          key: 'storage_msg',
          type: 'multipleObjects',
          columns: this.storageInformationTitle,
        }
        ],
        [{
          title: this.i18n.sys_cof.sum.file_system_msg,
          key: 'file_system_msg',
          type: 'multipleObjects',
          columns: this.filleInformationTitle,
        }
        ]]
      },
      { // 网络子系统
        title: this.i18n.sys_summary.net_subsystem_text,
        prop: 'network_subsystem',
        table: [[{
          title: this.i18n.linkage.netNum,
          key: 'net_work_num',
          type: 'multipleValues',
        },
        {
          title: this.i18n.sys_summary.panorama.tip.net_port_num,
          key: 'net_port',
          type: 'multipleValues',
        }],
        [{
          title: this.i18n.linkage.netMsg,
          key: 'rela',
          type: 'differentNodes',
          columns: this.networkPortTitle,
        }, {
          title: this.i18n.linkage.netportMsg,
          key: 'network',
          type: 'multipleObjects',
          columns: this.networkTitle,
        }
        ]]
      },
      { // 网口配置
        title: this.i18n.sys.networkConfig,
        prop: 'network_port_config',
        table: [[{
          title: this.i18n.sys_cof.sum.network_info.irq_aggre_title,
          key: 'irq_aggre',
          type: 'multipleObjects',
          columns: this.polymerizationTitle,
        },
        {
          title: this.i18n.sys_cof.sum.network_info.offload_title,
          key: 'offload',
          type: 'multipleObjects',
          columns: this.offloadTitle,
        },
        {
          title: this.i18n.sys_cof.sum.network_info.queue_title,
          key: 'queue',
          type: 'multipleObjects',
          columns: this.queue,
        }],
        [{
          title: this.i18n.sys_cof.sum.network_info.numa_core_NUMA,
          key: 'numa_core',
          type: 'multipleObjects',
          columns: this.interruptTitle,
        },
        {
          title: this.i18n.sys_cof.sum.network_info.nic_buff.circle_buff,
          key: 'buffer',
          type: 'multipleObjects',
          columns: this.nicBuff,
        }]]
      },
      { // 虚拟机/容器 数据缺失
        title: this.i18n.sys_cof.sum.docker,
        prop: 'vm_container',
        table: [[{
          title: this.i18n.sys_cof.sum.virtual_info.virtual_os,
          key: 'kvm_version',
          type: 'singleData',
        },
        {
          title: this.i18n.sys_cof.sum.virtual_info.virtual_docker,
          key: 'docker_info',
          type: 'singleData',
        }]]
      },
      { // Kernel内核相关参数
        title: this.i18n.sys.kernelParams,
        prop: 'kernel_related_param',
        table: [[{
          title: this.i18n.sys_cof.sum.hz_info,
          key: 'cfg_hz_info',
          type: 'singleData',
        },
        {
          title: this.i18n.sys_cof.sum.nohz_info,
          key: 'cfg_nohz_info',
          type: 'singleData',
        }]]
      },
    ];
  }
}
