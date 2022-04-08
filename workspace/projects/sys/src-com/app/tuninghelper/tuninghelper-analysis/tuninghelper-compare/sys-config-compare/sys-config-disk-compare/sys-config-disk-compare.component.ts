import { Component, OnInit } from '@angular/core';
import { TiTableRowData } from '@cloud/tiny3';
import { I18n } from 'sys/locale';
import { RespCommon } from 'sys/src-com/app/domain';
import { HttpService } from 'sys/src-com/app/service';
import { CommonTableData, CommonTreeNode } from 'sys/src-com/app/shared/domain';
import { TuninghelperStatusService } from '../../../service/tuninghelper-status.service';
import {
  RespCompareDiskInfo,
  RespCompareFileSystemInfo,
  RespCompareRaidInfo,
  RespSysConfigDiskCompare,
} from '../domain/resp-sys-config-disk-compare.type';

type Info = {
  title: string;
  tableData: CommonTableData;
  allData: TiTableRowData[];
};

@Component({
  selector: 'app-sys-config-disk-compare',
  templateUrl: './sys-config-disk-compare.component.html',
  styleUrls: ['./sys-config-disk-compare.component.scss']
})
export class SysConfigDiskCompareComponent implements OnInit {

  public diskInfo: Info = {
    title: '',
    tableData: {
      srcData: {
        data: [],
        state: {
          searched: false,
          sorted: false,
          paginated: false
        }
      },
      columnsTree: []
    },
    allData: [],
  };

  public raidInfo: Info = {
    title: '',
    tableData: {
      srcData: {
        data: [],
        state: {
          searched: false,
          sorted: false,
          paginated: false
        }
      },
      columnsTree: []
    },
    allData: [],
  };

  public fileSystemInfo: Info = {
    title: '',
    tableData: {
      srcData: {
        data: [],
        state: {
          searched: false,
          sorted: false,
          paginated: false
        }
      },
      columnsTree: []
    },
    allData: [],
  };

  private inited = false;
  private diff = true;

  constructor(
    private statusService: TuninghelperStatusService,
    private http: HttpService
  ) { }

  async ngOnInit() {
    const data = await this.getData();
    if (!data) { return; }
    this.initDiskInfo(data.disk_info);
    this.initRaidInfo(data.raid_info);
    this.initFileSystemInfo(data.file_system_info);
    this.inited = true;
    this.showDiff(this.diskInfo);
    this.showDiff(this.raidInfo);
    this.showDiff(this.fileSystemInfo);
  }

  private initDiskInfo(data: RespCompareDiskInfo) {
    this.diskInfo.title = I18n.tuninghelper.sysConfigDetail.diskInfo;

    this.diskInfo.tableData.columnsTree = [
      {
        label: I18n.tuninghelper.sysConfigDetail.deviceName,
        width: '8%',
        checked: true,
        key: 'deviceName',
        disabled: true,
        searchKey: 'deviceName',
      },
      {
        label: I18n.tuninghelper.compare.compareObject,
        width: '8%',
        key: 'compareObject',
        checked: true,
        disabled: true
      },
      {
        label: I18n.tuninghelper.sysConfigDetail.diskCapacityTb,
        width: '8%',
        checked: true,
        key: 'diskCapacityTb',
      },
      {
        label: I18n.tuninghelper.sysConfigDetail.diskType,
        width: '8%',
        checked: true,
        key: 'diskType',
      },
      {
        label: I18n.tuninghelper.sysConfigDetail.diskModel,
        width: '8%',
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

    Object.keys(data.data).forEach(deviceName => {
      const item = data.data[deviceName];

      this.diskInfo.tableData.srcData.data.push(
        {
          deviceName,
          compareObject: I18n.tuninghelper.compare.object1,
          diskCapacityTb: item[indexArr.diskCapacityTb][0],
          diskCapacityTbDiff: item[indexArr.diskCapacityTb][2],
          diskType: item[indexArr.diskType][0],
          diskTypeDiff: item[indexArr.diskType][2],
          diskModel: item[indexArr.diskModel][0],
          diskModelDiff: item[indexArr.diskModel][2],
          readAheadKb: item[indexArr.readAheadKb][0],
          readAheadKbDiff: item[indexArr.readAheadKb][2],
          scheduler: item[indexArr.scheduler][0],
          schedulerDiff: item[indexArr.scheduler][2],
          rqAffinity: item[indexArr.rqAffinity][0],
          rqAffinityDiff: item[indexArr.rqAffinity][2],
          nrRequests: item[indexArr.nrRequests][0],
          nrRequestsDiff: item[indexArr.nrRequests][2],
          queueDepth: item[indexArr.queueDepth][0],
          queueDepthDiff: item[indexArr.queueDepth][2],
          nomerges: item[indexArr.nomerges][0],
          nomergesDiff: item[indexArr.nomerges][2],
          writeCache: item[indexArr.writeCache][0],
          writeCacheDiff: item[indexArr.writeCache][2],
        },
        {
          deviceName,
          compareObject: I18n.tuninghelper.compare.object2,
          diskCapacityTb: item[indexArr.diskCapacityTb][1],
          diskType: item[indexArr.diskType][1],
          diskModel: item[indexArr.diskModel][1],
          readAheadKb: item[indexArr.readAheadKb][1],
          scheduler: item[indexArr.scheduler][1],
          rqAffinity: item[indexArr.rqAffinity][1],
          nrRequests: item[indexArr.nrRequests][1],
          queueDepth: item[indexArr.queueDepth][1],
          nomerges: item[indexArr.nomerges][1],
          writeCache: item[indexArr.writeCache][1],
        },
      );
    });

    this.diskInfo.tableData = { ...this.diskInfo.tableData };
    this.diskInfo.allData = this.diskInfo.tableData.srcData.data.slice();
    this.diskInfo = this.dealTableData(this.diskInfo);
  }

  private initRaidInfo(data: RespCompareRaidInfo) {

    this.raidInfo.title = I18n.tuninghelper.sysConfigDetail.raidConfigInfo;

    this.raidInfo.tableData.columnsTree = [
      {
        label: I18n.tuninghelper.sysConfigDetail.deviceName,
        width: '10%',
        key: 'deviceName',
        checked: true,
        disabled: true,
        searchKey: 'deviceName',
      },
      {
        label: I18n.tuninghelper.compare.compareObject,
        width: '5%',
        key: 'compareObject',
        checked: true,
        disabled: true,
      },
      {
        label: 'RAID',
        width: '85%',
        checked: true,
        expanded: true,
        children: [
          {
            label: 'Level',
            checked: true,
            key: 'level',
            tip: I18n.tuninghelper.commonTableTooltip.level,
          },
          {
            label: 'Strip Size(KiB)',
            checked: true,
            key: 'stripSize',
            tip: I18n.tuninghelper.commonTableTooltip.strip_size,
          },
          {
            label: 'Read Policy',
            checked: true,
            key: 'readPolicy',
            tip: I18n.tuninghelper.commonTableTooltip.read_policy
          },
          {
            label: 'Write Policy',
            checked: true,
            key: 'writePolicy',
            tip: I18n.tuninghelper.commonTableTooltip.write_policy
          },
          {
            label: 'IO Policy',
            checked: true,
            key: 'IOPolicy',
            tip: I18n.tuninghelper.commonTableTooltip.io_policy
          },
          {
            label: 'Drives',
            checked: true,
            key: 'disks',
            tip: I18n.tuninghelper.commonTableTooltip.drives
          },
        ]
      },
    ];

    if (!data) { return; }

    const indexArr = {
      level: data.title.indexOf('level'),
      stripSize: data.title.indexOf('strip_size'),
      readPolicy: data.title.indexOf('read_policy'),
      writePolicy: data.title.indexOf('write_policy'),
      IOPolicy: data.title.indexOf('io_policy'),
      disks: data.title.indexOf('disks'),
    };

    Object.keys(data.data).forEach(deviceName => {
      const item = data.data[deviceName];
      this.raidInfo.tableData.srcData.data.push(
        {
          deviceName,
          compareObject: I18n.tuninghelper.compare.object1,
          level: item[indexArr.level][0],
          levelDiff: item[indexArr.level][2],
          stripSize: item[indexArr.stripSize][0],
          stripSizeDiff: item[indexArr.stripSize][2],
          readPolicy: item[indexArr.readPolicy][0],
          readPolicyDiff: item[indexArr.readPolicy][2],
          writePolicy: item[indexArr.writePolicy][0],
          writePolicyDiff: item[indexArr.writePolicy][2],
          IOPolicy: item[indexArr.IOPolicy][0],
          IOPolicyDiff: item[indexArr.IOPolicy][2],
          disks: item[indexArr.disks][0],
          disksDiff: item[indexArr.disks][2],
        },
        {
          deviceName,
          compareObject: I18n.tuninghelper.compare.object2,
          level: item[indexArr.level][1],
          stripSize: item[indexArr.stripSize][1],
          readPolicy: item[indexArr.readPolicy][1],
          writePolicy: item[indexArr.writePolicy][1],
          IOPolicy: item[indexArr.IOPolicy][1],
          disks: item[indexArr.disks][1],
        },
      );
    });

    this.raidInfo.tableData = { ...this.raidInfo.tableData };
    this.raidInfo.allData = this.raidInfo.tableData.srcData.data.slice();
    this.raidInfo = this.dealTableData(this.raidInfo);
  }

  private initFileSystemInfo(data: RespCompareFileSystemInfo) {
    this.fileSystemInfo.title = I18n.tuninghelper.sysConfigDetail.fileSystem;

    this.fileSystemInfo.tableData.columnsTree = [
      {
        label: I18n.tuninghelper.sysConfigDetail.fileSystem,
        width: '15%',
        key: 'fileSystem',
        checked: true,
        disabled: true,
        searchKey: 'fileSystem'
      },
      {
        label: I18n.tuninghelper.compare.compareObject,
        width: '5%',
        key: 'compareObject',
        checked: true,
        disabled: true,
      },
      {
        label: I18n.tuninghelper.sysConfigDetail.mountedOn,
        width: '10%',
        checked: true,
        key: 'mountedOn',
      },
      {
        label: 'Mount Parameter',
        width: '40%',
        checked: true,
        key: 'mountParameter',
      },
      {
        label: I18n.tuninghelper.sysConfigDetail.type,
        width: '10%',
        checked: true,
        key: 'type',
      },
      {
        label: I18n.tuninghelper.sysConfigDetail.deviceName,
        width: '5%',
        checked: true,
        key: 'deviceName',
      },
      {
        label: I18n.tuninghelper.sysConfigDetail.partition,
        width: '5%',
        checked: true,
        key: 'partition',
      },
      {
        label: 'LVM',
        width: '10%',
        checked: true,
        key: 'lvm',
      },
    ];

    if (!data) { return; }

    const indexArr = {
      mountedOn: data.title.indexOf('mounted'),
      mountParameter: data.title.indexOf('mount_parameter'),
      type: data.title.indexOf('type'),
      deviceName: data.title.indexOf('name'),
      partition: data.title.indexOf('part'),
      lvm: data.title.indexOf('lvm'),
    };

    Object.keys(data.data).forEach(fileSystem => {
      const item = data.data[fileSystem];
      const rowSpan = Math.max(
        Array (Array.isArray(item[indexArr.deviceName][1]) ? item[indexArr.deviceName][1] : []).length,
        Array (Array.isArray(item[indexArr.deviceName][1]) ? item[indexArr.deviceName][1] : []).length
      ) || 1;
      for (let i = 0; i < rowSpan; i++) {
        this.fileSystemInfo.tableData.srcData.data.push(
          {
            fileSystem,
            fileSystemRowSpan: i > 0 ? 0 : rowSpan * 2,
            compareObject: I18n.tuninghelper.compare.object1,
            mountedOn: item[indexArr.mountedOn][0],
            mountedOnDiff: item[indexArr.mountedOn][2],
            mountParameter: item[indexArr.mountParameter][0],
            mountParameterDiff: item[indexArr.mountParameter][2],
            type: item[indexArr.type][0],
            typeDiff: item[indexArr.type][2],
            deviceName: item[indexArr.deviceName][0] || '--',
            deviceNameDiff: item[indexArr.deviceName][2],
            partition: item[indexArr.partition][0] || '--',
            partitionDiff: item[indexArr.partition][2],
            lvm: item[indexArr.lvm][0],
            lvmDiff: item[indexArr.lvm][2],
            rowSpan: i > 0 ? 0 : rowSpan,
          }
        );
      }
      for (let i = 0; i < rowSpan; i++) {
        this.fileSystemInfo.tableData.srcData.data.push(
          {
            fileSystem,
            compareObject: I18n.tuninghelper.compare.object2,
            mountedOn: item[indexArr.mountedOn][1],
            mountParameter: item[indexArr.mountParameter][1],
            type: item[indexArr.type][1],
            deviceName: item[indexArr.deviceName][1] || '--',
            deviceNameDiff: item[indexArr.deviceName][2],
            partition: item[indexArr.partition][1] || '--',
            partitionDiff: item[indexArr.partition][2],
            lvm: item[indexArr.lvm][1],
            rowSpan: i > 0 ? 0 : rowSpan,
          }
        );
      }
    });

    this.fileSystemInfo.tableData = { ...this.fileSystemInfo.tableData };
    this.fileSystemInfo.allData = this.fileSystemInfo.tableData.srcData.data.slice();
    this.fileSystemInfo = this.dealTableData(this.fileSystemInfo);
  }

  private async getData() {
    const params = {
      id: this.statusService.taskId,
      type: 'storage'
    };
    const resp: RespCommon<RespSysConfigDiskCompare> = await this.http.get(
      `/data-comparison/system-config-comparison/`,
      { params }
    );
    return resp?.data?.data;
  }

  public onDiskInfoChange(value: 'diff' | 'all') {
    this.onSelectedChange(value, this.diskInfo);
  }

  public onFilterDiskInfoColumn(columnsTree: CommonTreeNode[]) {
    this.diskInfo.tableData.columnsTree = columnsTree;
    if (this.diff) {
      this.showDiff(this.diskInfo);
    }
  }

  public onRaidInfoChange(value: 'diff' | 'all') {
    this.onSelectedChange(value, this.raidInfo);
  }

  public onFilterRaidInfoColumn(columnsTree: CommonTreeNode[]) {
    this.raidInfo.tableData.columnsTree = columnsTree;
    if (this.diff) {
      this.showDiff(this.raidInfo);
    }
  }

  public onFileSystemInfoChange(value: 'diff' | 'all') {
    this.onSelectedChange(value, this.fileSystemInfo);
  }

  private onSelectedChange(value: 'diff' | 'all', table: Info) {
    this.diff = value === 'diff';
    if (!this.inited) { return; }
    if (value === 'diff') {
      this.showDiff(table);
    } else {
      table.tableData.srcData.data = Array.from(table.allData);
      table.tableData = { ...table.tableData };
    }
  }

  private dealTableData(tableData: any) {
    const newTableData = JSON.parse(JSON.stringify(tableData));
    newTableData?.tableData?.columnsTree?.forEach((columnData: any) => {
      if (columnData.children?.length) {
        columnData?.children.forEach((subColumnData: any) => {
          subColumnData.hasEmptyPlace = newTableData?.tableData?.srcData?.data.some(
            (item: any) => item[subColumnData.key + 'Diff'] !== undefined && !item[subColumnData.key + 'Diff']
          );
        });
      }else {
        columnData.hasEmptyPlace = newTableData?.tableData?.srcData?.data.some(
          (item: any) => item[columnData.key + 'Diff'] !== undefined && !item[columnData.key + 'Diff']
        );
      }
    });
    return newTableData;
  }

  private showDiff(table: Info) {
    // 得到没有disabled并且当前显示的列的key
    const getShowKeys = (columns: CommonTreeNode[]) => {
      let result: string[] = [];
      for (const item of columns) {
        if (item.children) {
          result = result.concat(getShowKeys(item.children));
        } else if (!item.disabled && item.checked) {
          result.push(item.key);
        }
      }
      return result;
    };
    const showKeys = getShowKeys(table.tableData.columnsTree);
    const filteredData = [];
    for (let i = 0; i < table.allData.length; i += 2) {
      const item1 = table.allData[i];
      const diffIndex = showKeys.findIndex(key => !item1[key + 'Diff']);
      if (diffIndex > -1) {
        const item2 = table.allData[i + 1];
        filteredData.push(item1, item2);
      }
    }
    table.tableData.srcData.data = filteredData;
    table.tableData = { ...table.tableData };
  }

}
