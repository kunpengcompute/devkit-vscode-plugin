import { Component, OnInit } from '@angular/core';
import { RespCommon } from 'sys/src-com/app/domain';
import { HttpService, TipService } from 'sys/src-com/app/service';
import {
  TuninghelperStatusService
} from 'sys/src-com/app/tuninghelper/tuninghelper-analysis/service/tuninghelper-status.service';
import {
  RespDiskInfo,
  RespFileSystemInfo,
  RespRaidInfo,
  RespSystemConfigDisk
} from '../domain/resp-system-config-disk.type';
import { CommonTableData } from 'sys/src-com/app/shared/domain';
import { I18n } from 'sys/locale';

@Component({
  selector: 'app-sys-config-disk',
  templateUrl: './sys-config-disk.component.html',
  styleUrls: ['./sys-config-disk.component.scss']
})
export class SysConfigDiskComponent implements OnInit {

  public tableData = {
    diskInfo: {
      title: '',
      srcData: {
        data: [],
        state: {
          searched: false,
          sorted: false,
          paginated: false
        }
      },
      columnsTree: []
    } as CommonTableData,
    raidInfo: {
      title: '',
      srcData: {
        data: [],
        state: {
          searched: false,
          sorted: false,
          paginated: false
        }
      },
      columnsTree: []
    } as CommonTableData,
    fileSystemInfo: {
      title: '',
      srcData: {
        data: [],
        state: {
          searched: false,
          sorted: false,
          paginated: false
        }
      },
      columnsTree: []
    } as CommonTableData,
  };
  public rowSpan: {[key: string]: number} = {};

  constructor(
    private statusService: TuninghelperStatusService,
    private http: HttpService,
    private tip: TipService,
  ) {
  }

  async ngOnInit() {
    const data = await this.getData();
    if (!data) { return; }
    this.initDiskInfo(data.disk_info);
    this.initRaidInfo(data.raid_info);
    this.initFileSystemInfo(data.file_system_info);
  }

  private initDiskInfo(data: RespDiskInfo) {

    this.tableData.diskInfo.title = I18n.tuninghelper.sysConfigDetail.diskInfo;

    const diskTypeFilterOptions: any[] = [];

    this.tableData.diskInfo.columnsTree = [
      {
        label: I18n.tuninghelper.sysConfigDetail.deviceName,
        width: '10%',
        checked: true,
        key: 'deviceName',
        searchKey: 'deviceName',
        disabled: true,
      },
      {
        label: I18n.tuninghelper.sysConfigDetail.diskCapacityTb,
        width: '10%',
        checked: true,
        key: 'diskCapacityTb',
        sortKey: 'diskCapacityTb',
      },
      {
        label: I18n.tuninghelper.sysConfigDetail.diskType,
        width: '10%',
        checked: true,
        key: 'diskType',
        filterConfig: {
          options: diskTypeFilterOptions,
        },
      },
      {
        label: I18n.tuninghelper.sysConfigDetail.diskModel,
        width: '10%',
        checked: true,
        key: 'diskModel',
      },
      {
        label: I18n.tuninghelper.sysConfigDetail.config,
        width: '60%',
        checked: true,
        expanded: true,
        children: [
          {
            label: 'read_ahead_kb',
            checked: true,
            key: 'readAheadKb',
            tip: I18n.tuninghelper.commonTableTooltip.read_ahead_kb
          },
          {
            label: 'scheduler',
            checked: true,
            key: 'scheduler',
            tip: I18n.tuninghelper.commonTableTooltip.scheduler
          },
          {
            label: 'rq_affinity',
            checked: true,
            key: 'rqAffinity',
            tip: I18n.tuninghelper.commonTableTooltip.rq_affinity
          },
          {
            label: 'nr_requests',
            checked: true,
            key: 'nrRequests',
            tip: I18n.tuninghelper.commonTableTooltip.nr_requests
          },
          {
            label: 'queue_depth',
            checked: true,
            key: 'queueDepth',
            tip: I18n.tuninghelper.commonTableTooltip.queue_depth
          },
          {
            label: 'nomerges',
            checked: true,
            key: 'nomerges',
            tip: I18n.tuninghelper.commonTableTooltip.nomerges
          },
          {
            label: 'write_cache',
            checked: true,
            key: 'writeCache',
            tip: I18n.tuninghelper.commonTableTooltip.write_cache
          },
        ]
      },
    ];

    if (!data) { return; }

    const indexArr = {
      deviceName: data.title.indexOf('name'),
      diskCapacityTb: data.title.indexOf('tuning_disk_size'),
      diskType: data.title.indexOf('tuning_disk_type'),
      diskModel: data.title.indexOf('tuning_disk_manufacturer'),
      readAheadKb: data.title.indexOf('tuning_read_ahead'),
      scheduler: data.title.indexOf('tuning_scheduler'),
      rqAffinity: data.title.indexOf('tuning_rq_affinity'),
      nrRequests: data.title.indexOf('tuning_nr_requests'),
      queueDepth: data.title.indexOf('tuning_queue_depth'),
      nomerges: data.title.indexOf('tuning_nomerges'),
      writeCache: data.title.indexOf('tuning_disk_write_cache'),
    };

    const diskTypeFilterOptionsMap: any = {};

    this.tableData.diskInfo.srcData.data = data.data.map(item => {
      if (!diskTypeFilterOptionsMap[item[indexArr.diskType]]) {
        diskTypeFilterOptionsMap[item[indexArr.diskType]] = { label: item[indexArr.diskType] };
      }
      return {
        deviceName: item[indexArr.deviceName],
        diskCapacityTb: item[indexArr.diskCapacityTb],
        diskType: item[indexArr.diskType],
        diskModel: item[indexArr.diskModel],
        readAheadKb: item[indexArr.readAheadKb],
        scheduler: item[indexArr.scheduler],
        rqAffinity: item[indexArr.rqAffinity],
        nrRequests: item[indexArr.nrRequests],
        queueDepth: item[indexArr.queueDepth],
        nomerges: item[indexArr.nomerges],
        writeCache: item[indexArr.writeCache],
      };
    });

    diskTypeFilterOptions.push(...Object.values(diskTypeFilterOptionsMap));

    /** 重新赋值触发表格更新 */
    this.tableData.diskInfo = { ...this.tableData.diskInfo };
  }

  private initRaidInfo(data: RespRaidInfo) {

    this.tableData.raidInfo.title = I18n.tuninghelper.sysConfigDetail.raidConfigInfo;

    const levelFilterOptions: any[] = [];

    this.tableData.raidInfo.columnsTree = [
      {
        label: I18n.tuninghelper.sysConfigDetail.deviceName,
        width: '10%',
        checked: true,
        key: 'deviceName',
        expanded: true,
        searchKey: 'deviceName',
        disabled: true,
      },
      {
        label: 'RAID',
        width: '90%',
        checked: true,
        expanded: true,
        children: [
          {
            label: 'Level',
            checked: true,
            key: 'level',
            expanded: true,
            tip: I18n.tuninghelper.commonTableTooltip.level,
            filterConfig: {
              options: levelFilterOptions,
            }
          },
          {
            label: 'Strip Size(KiB)',
            checked: true,
            key: 'stripSize',
            expanded: true,
            tip: I18n.tuninghelper.commonTableTooltip.strip_size,
            sortKey: 'stripSize',
          },
          {
            label: 'Read Policy',
            checked: true,
            key: 'readPolicy',
            expanded: true,
            tip: I18n.tuninghelper.commonTableTooltip.read_policy
          },
          {
            label: 'Write Policy',
            checked: true,
            key: 'writePolicy',
            expanded: true,
            tip: I18n.tuninghelper.commonTableTooltip.write_policy
          },
          {
            label: 'IO Policy',
            checked: true,
            key: 'IOPolicy',
            expanded: true,
            tip: I18n.tuninghelper.commonTableTooltip.io_policy
          },
          {
            label: 'Drives',
            checked: true,
            key: 'disks',
            expanded: true,
            tip: I18n.tuninghelper.commonTableTooltip.drives
          },
        ]
      },
    ];

    if (!data) { return; }

    const indexArr = {
      deviceName: data.title.indexOf('name'),
      level: data.title.indexOf('level'),
      stripSize: data.title.indexOf('strip_size'),
      readPolicy: data.title.indexOf('read_policy'),
      writePolicy: data.title.indexOf('write_policy'),
      IOPolicy: data.title.indexOf('io_policy'),
      disks: data.title.indexOf('disks'),
    };

    const levelFilterOptionsMap: any = {};

    this.tableData.raidInfo.srcData.data = data.data.map(item => {
      if (!levelFilterOptionsMap[item[indexArr.level]]) {
        levelFilterOptionsMap[item[indexArr.level]] = { label: item[indexArr.level] };
      }
      return {
        deviceName: item[indexArr.deviceName],
        level: item[indexArr.level],
        stripSize: item[indexArr.stripSize],
        readPolicy: item[indexArr.readPolicy],
        writePolicy: item[indexArr.writePolicy],
        IOPolicy: item[indexArr.IOPolicy],
        disks: item[indexArr.disks],
      };
    });

    levelFilterOptions.push(...Object.values(levelFilterOptionsMap));

    /** 重新赋值触发表格更新 */
    this.tableData.raidInfo = { ...this.tableData.raidInfo };
  }

  private initFileSystemInfo(data: RespFileSystemInfo) {

    this.tableData.fileSystemInfo.title = I18n.tuninghelper.sysConfigDetail.fileSystem;

    this.tableData.fileSystemInfo.columnsTree = [
      {
        label: I18n.tuninghelper.sysConfigDetail.fileSystem,
        width: '15%',
        checked: true,
        key: 'fileSystem',
        expanded: true,
      },
      {
        label: I18n.tuninghelper.sysConfigDetail.mountedOn,
        width: '10%',
        checked: true,
        key: 'mountedOn',
        expanded: true,
      },
      {
        label: 'Mount Parameter',
        width: '30%',
        checked: true,
        key: 'mountParameter',
        expanded: true,
      },
      {
        label: I18n.tuninghelper.sysConfigDetail.type,
        width: '30%',
        checked: true,
        key: 'type',
        expanded: true,
      },
      {
        label: I18n.tuninghelper.sysConfigDetail.deviceName,
        width: '10%',
        checked: true,
        key: 'deviceName',
        expanded: true,
      },
      {
        label: I18n.tuninghelper.sysConfigDetail.partition,
        width: '10%',
        checked: true,
        key: 'partition',
        expanded: true,
      },
      {
        label: 'LVM',
        width: '10%',
        checked: true,
        key: 'lvm',
        expanded: true,
      },
    ];

    if (!data) { return; }

    const indexArr = {
      fileSystem: data.title.indexOf('file_system'),
      mountedOn: data.title.indexOf('mounted'),
      mountParameter: data.title.indexOf('mount_parameter'),
      type: data.title.indexOf('type'),
      deviceName: data.title.indexOf('name'),
      partition: data.title.indexOf('part'),
      lvm: data.title.indexOf('lvm'),
    };

    this.tableData.fileSystemInfo.srcData.data = data.data.reduce((newArr: any[], item) => {
      newArr.push({
        fileSystem: item[indexArr.fileSystem],
        mountedOn: item[indexArr.mountedOn],
        mountParameter: item[indexArr.mountParameter],
        type: item[indexArr.type],
        deviceName: item[indexArr.deviceName][0],
        partition: item[indexArr.partition][0],
        lvm: item[indexArr.lvm],
        rowSpan: item[indexArr.deviceName].length,
      });
      if (item[indexArr.deviceName].length > 1) {
        for (let i = 1; i < item[indexArr.deviceName].length; i++) {
          newArr.push({
            fileSystem: item[indexArr.fileSystem],
            mountedOn: item[indexArr.mountedOn],
            mountParameter: item[indexArr.mountParameter],
            type: item[indexArr.type],
            deviceName: item[indexArr.deviceName][i],
            partition: item[indexArr.partition][i],
            lvm: item[indexArr.lvm],
            rowSpan: 0,
          });
        }
      }
      return newArr;
    }, []);

    /** 重新赋值触发表格更新 */
    this.tableData.fileSystemInfo = { ...this.tableData.fileSystemInfo };
  }

  private async getData() {
    const params = {
      'node-id': this.statusService.nodeId,
      'config-type': 'storage',
    };
    const resp: RespCommon<RespSystemConfigDisk> = await this.http.get(
      `/tasks/${encodeURIComponent(this.statusService.taskId)}/optimization/system-config/`,
      { params }
    );
    return resp?.data?.optimization?.data;
  }

}
