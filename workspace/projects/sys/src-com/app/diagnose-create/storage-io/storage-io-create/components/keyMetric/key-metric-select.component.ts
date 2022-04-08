import { Component, OnInit, Input, forwardRef } from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALIDATORS,
  FormArray,
  FormGroup,
  FormControl,
  NG_VALUE_ACCESSOR
} from '@angular/forms';
import { CommonTreeNode } from 'sys/src-com/app/shared/domain';
import { HttpService } from 'sys/src-com/app/service';
import { TiValidators, TiTableRowData, TiActionmenuItem, TiMessageService } from '@cloud/tiny3';
import { I18n } from 'sys/locale';

@Component({
  selector: 'app-key-metric-select',
  templateUrl: './key-metric-select.component.html',
  styleUrls: ['./key-metric-select.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => KeyMetricSelectComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => KeyMetricSelectComponent),
      multi: true
    },
  ]
})
export class KeyMetricSelectComponent implements OnInit, ControlValueAccessor {
  @Input() isDoOrder = false;
  @Input()
  set indicatorForm(val: any) {
    this.initTable(val);
    if (null == val) {
      return;
    }
  }
  public showScrollX = false;
  public showRateKeys = ['rw', 'randrw'];
  public formArray: FormArray;
  public preCheckedIdList: any = [];
  public checkedList: any = [];
  public checkboxList: { label?: string; value?: string; checked?: boolean; }[] = [
    {
      label: I18n.storageIo.keyMetric.throughput,
      value: 'throughput',
      checked: true
    },
    {
      label: 'IOPS',
      value: 'iops',
      checked: true
    },
    {
      label: I18n.storageIo.keyMetric.delay,
      value: 'latency',
      checked: true
    }
  ];
  public newRow: TiTableRowData = {
    block_size: '',
    rw_type: '',
    rw_mix_read_ratio: '',
    io_depth: '',
    io_engine: '',
    num_jobs: '',
    direct: '',
    size: '',
    runtime: '',
    indicator_type: []
  };
  public editingRow: TiTableRowData = {
    id: '',
    block_size: '',
    rw_type: '',
    rw_mix_read_ratio: '',
    io_depth: '',
    io_engine: '',
    num_jobs: '',
    direct: '',
    size: '',
    runtime: '',
    indicator_type: []
  };
  public validateMetricVal = true;
  public tableData: any = {
    defaultData: {
      block_size: '',
      rw_type: 'read',
      rw_mix_read_ratio: '',
      io_depth: '',
      io_engine: 'sync',
      num_jobs: '',
      direct: '1',
      size: '',
      runtime: '',
      indicator_type: []
    },
    srcData: [],
    allData: [],
    columnsTree: [] as Array<CommonTreeNode>,
  };

  public items: Array<TiActionmenuItem> = [
    {
      label: I18n.storageIo.keyMetric.edit,
      value: 'edit'
    }, {
      label: I18n.storageIo.keyMetric.delete,
      value: 'delete'
    }
  ];

  public editingItems: Array<TiActionmenuItem> = [
    {
      label: I18n.storageIo.keyMetric.save,
      value: 'save'
    }, {
      label: I18n.storageIo.keyMetric.cancel,
      value: 'cancel'
    }
  ];

  // 新增行actionmenu
  public addItems: Array<TiActionmenuItem> = [
    {
      label: I18n.storageIo.keyMetric.add,
      value: 'add'
    }, {
      label: I18n.storageIo.keyMetric.cancel,
      value: 'cancel'
    }
  ];

  public isEditingRow = false;
  public isAddingRow = false;
  public selectAllDisabled = false;
  private propagateChange = (_: any) => { };
  constructor(
    private http: HttpService,
    private tiMessage: TiMessageService,
  ) {
    let count = 0;
    while (count < 2) {
      const control  = new FormGroup({
        block_size: new FormControl('', [
          TiValidators.required,
          TiValidators.minValue(1),
          TiValidators.maxValue(10240)
        ]),
        rw_type: new FormControl('', [
          TiValidators.required
        ]),
        rw_mix_read_ratio: new FormControl('', [
          TiValidators.required,
          TiValidators.minValue(0),
          TiValidators.maxValue(100)
        ]),
        io_depth: new FormControl('', [
          TiValidators.required,
          TiValidators.minValue(1),
          TiValidators.maxValue(256)
        ]),
        io_engine: new FormControl('', [
          TiValidators.required
        ]),
        num_jobs: new FormControl('', [
          TiValidators.required,
          TiValidators.minValue(1),
          TiValidators.maxValue(128)
        ]),
        direct: new FormControl('', [
          TiValidators.required
        ]),
        size: new FormControl('', [
          TiValidators.required,
          TiValidators.minValue(1),
          TiValidators.maxValue(2048)
        ]),
        runtime: new FormControl('', [
          TiValidators.required,
          TiValidators.minValue(1),
          TiValidators.maxValue(200)
        ]),
        indicator_type: new FormControl('', [
          TiValidators.required
        ])
      });
      control.controls.rw_type.valueChanges.subscribe(() => {
        if (this.showRateKeys.includes(control.controls.rw_type.value)) {
          if (this.isAddingRow) {
            const val = this.newRow.rw_mix_read_ratio > 0 ? this.newRow.rw_mix_read_ratio : 50;
            this.newRow.rw_mix_read_ratio = val;
          } else {
            const val = this.editingRow.rw_mix_read_ratio > 0 ? this.editingRow.rw_mix_read_ratio : 50;
            this.editingRow.rw_mix_read_ratio = val;
          }
          control.controls.rw_mix_read_ratio.setValidators([
            TiValidators.required,
            TiValidators.minValue(0),
            TiValidators.maxValue(100)
          ]);
          control.controls.rw_mix_read_ratio.updateValueAndValidity();
        } else {
          control.controls.rw_mix_read_ratio.clearValidators();
          control.controls.rw_mix_read_ratio.updateValueAndValidity();
        }
      });
      if (this.formArray) {
        this.formArray.push(control);
      } else {
        this.formArray = new FormArray([control]);
      }
      count ++;
    }
    this.formArray.valueChanges.subscribe(() => {
      this.addItems = this.addItems.map((item: any) => {
        return {
          ...item,
          disabled: item.value !== 'cancel' && !this.formArray.controls[0].valid
        };
      });
      this.editingItems = this.editingItems.map((item: any) => {
        return {
          ...item,
          disabled: item.value !== 'cancel' && !this.formArray.controls[1].valid
        };
      });
    });
  }
  writeValue(obj: any): void {
    this.indicatorForm = obj;
  }
  registerOnTouched(): void {
  }
  setDisabledState?(): void {
  }
  ngOnInit(): void {
    this.showScrollX = this.isDoOrder;
  }

  private async initTable(indicatorForm?: any) {
    this.tableData.columnsTree = [
      {
        label: I18n.storageIo.keyMetric.blockSize,
        width: this.isDoOrder ? '180px' : '12%',
        key: 'block_size',
        type: 'input'
      },
      {
        label: I18n.storageIo.keyMetric.type,
        width: this.isDoOrder ? '150px' : '10%',
        key: 'rw_type',
        type: 'select',
        option: [
          {
            label: I18n.storageIo.keyMetric.read,
            value: 'read'
          },
          {
            label: I18n.storageIo.keyMetric.write,
            value: 'write'
          },
          {
            label: I18n.storageIo.keyMetric.rw,
            value: 'rw'
          },
          {
            label: I18n.storageIo.keyMetric.randRead,
            value: 'randread'
          },
          {
            label: I18n.storageIo.keyMetric.randWrite,
            value: 'randwrite'
          },
          {
            label: I18n.storageIo.keyMetric.randRw,
            value: 'randrw'
          }
        ]
      },
      {
        label: I18n.storageIo.keyMetric.rate,
        width: this.isDoOrder ? '120px' : '8%',
        key: 'rw_mix_read_ratio',
        type: 'rateInput'
      },
      {
        label: I18n.storageIo.keyMetric.ioDepth,
        width: this.isDoOrder ? '120px' : '8%',
        key: 'io_depth',
        type: 'input'
      },
      {
        label: I18n.storageIo.keyMetric.ioEngine,
        width: this.isDoOrder ? '120px' : '8%',
        key: 'io_engine',
        type: 'select',
        option: [
          {
            label: 'sync',
            value: 'sync'
          },
          {
            label: 'libaio',
            value: 'libaio'
          },
          {
            label: 'psync',
            value: 'psync'
          },
          {
            label: 'vsync',
            value: 'vsync'
          },
          {
            label: 'pvsync',
            value: 'pvsync'
          },
          {
            label: 'pvsync2',
            value: 'pvsync2'
          },
          {
            label: 'io_uring',
            value: 'io_uring'
          },
          {
            label: 'posixaio',
            value: 'posixaio'
          },
          {
            label: 'solarisaio',
            value: 'solarisaio'
          },
          {
            label: 'windowsaio',
            value: 'windowsaio'
          },
          {
            label: 'mmap',
            value: 'mmap'
          },
          {
            label: 'splice',
            value: 'splice'
          },
          {
            label: 'net',
            value: 'net'
          }
        ]
      },
      {
        label: I18n.storageIo.keyMetric.concurrency,
        width: this.isDoOrder ? '120px' : '8%',
        key: 'num_jobs',
        type: 'input'
      },
      {
        label: 'Direct I/O',
        width: this.isDoOrder ? '120px' : '8%',
        key: 'direct',
        type: 'select',
        option: [
          {
            label: 'Y',
            value: '1'
          },
          {
            label: 'N',
            value: '0'
          }
        ]
      },
      {
        label: I18n.storageIo.keyMetric.ioSize,
        width: this.isDoOrder ? '150px' : '10%',
        key: 'size',
        type: 'input'
      },
      {
        label: I18n.storageIo.keyMetric.testTime,
        width: this.isDoOrder ? '120px' : '8%',
        key: 'runtime',
        type: 'input'
      },
      {
        label: I18n.storageIo.keyMetric.relateMetric,
        width: this.isDoOrder ? '180px' : '12%',
        key: 'indicator_type',
        type: 'selectMultiple',
        option: [
          {
            label: I18n.storageIo.keyMetric.throughput,
            value: 'throughput'
          },
          {
            label: 'IOPS',
            value: 'iops'
          },
          {
            label: I18n.storageIo.keyMetric.delay,
            value: 'latency'
          }
        ]
      }
    ];
    // 给相关指标赋初始值
    this.tableData.defaultData.indicator_type = [this.tableData.columnsTree[9].option[0]];
    await this.getTableData();
    if (indicatorForm) {
      this.checkboxList = this.checkboxList.map((item: any) => {
        item.checked = !!indicatorForm[item.value];
        return item;
      });
      // 修改或重启时的默认值回填
      const srcData = this.tableData.srcData;
      srcData?.forEach((item: any) => {
        if (indicatorForm?.data?.some((model: any) => (item.id + '') === (model.id + ''))) {
          this.checkedList.push(item);
        }
      });
    } else {
      // 选中默认第一项
      this.checkedFirstRow();
    }
  }

  private checkedFirstRow() {
    const srcData = this.tableData.srcData;
    if (srcData && srcData[0]) {
        this.checkedList = [srcData[0]];
      }
  }

  private async getTableData() {
    const resp: any = await this.http.get(`/storage-tasks-model/`);
    const tableData = resp?.data.map((item: any) => {
      const arr = item.indicator_type.split('|');
      item.indicator_type = this.tableData.columnsTree[9].option.filter((n: any) => {
        return arr.some((m: any) => m === n.value);
      });
      this.dealOrginData(item, 'toString');
      return item;
    });
    this.tableData.srcData = tableData ?? [];
    this.tableData.allData = tableData ?? [];
    this.isAddingRow = false;
    this.isEditingRow = false;
    this.changeBtnStatus(false);
    this.changeAllSelect(false);
    this.checkedList = [];
    // 防止重新加载数据，跟关键指标筛选不对应
    this.validateMetricVal = this.checkboxList.some(item => item.checked);
    // 关键指标筛选表格列  相关指标
    this.tableData.srcData = this.tableData.allData.filter((item: any) => {
      return !this.checkboxList
      .filter(box => !box.checked)
      .some(box => item.indicator_type.some((n: { value: string }) => n.value === box.value));
    });
    return tableData;
  }

  public metricValChange() {
    this.validateMetricVal = this.checkboxList.some(item => item.checked);
    // 关键指标筛选表格列  相关指标
    this.tableData.srcData = this.tableData.allData.filter((item: any) => {
      return !this.checkboxList
      .filter(box => !box.checked)
      .some(box => item.indicator_type.some((n: { value: string }) => n.value === box.value));
    });
    // 表格内已选择的也需筛选，去勾选
    this.checkedList = this.checkedList.filter((item: any) => {
      return this.tableData.srcData.some((row: any) => row.id === item.id);
    });
    if (!this.checkedList.length) {
      // 列表项减少  如果没有已勾选的，默认选中第一行
      this.checkedFirstRow();
    } else {
      // 列表项增加  需重新改变每一行的置灰标志
      this.tableData.srcData = this.tableData.srcData.map((item: any) => {
        item.disabled = this.checkedList.length === 1 && this.checkedList.some((box: any) => box.id === item.id);
        return item;
      });
    }
    this.propagateChange(this.dealData());
  }

  public onCheckedChange() {
    // 选中项改变  如果只有一项勾选  则该项置灰
    this.tableData.srcData = this.tableData.srcData.map((item: any) => {
      // 当前项是否被选中
      const bool = this.checkedList.some((box: any) => box.id === item.id);
      if (this.checkedList.length >= 5) {
        // 如果选中项大于5项，则除先前选中的以外选项置灰
        item.disabled = !bool;
      } else if (this.checkedList.length === 1) {
        // 如果选中项只有1项，测置灰当前选中项
        item.disabled = bool;
      } else {
        item.disabled = false;
      }
      return item;
    });
    if (this.preCheckedIdList.length) {
      // 如果在编辑或者添加前有选择的数据  则反选
      this.checkedList = this.tableData.srcData.filter((item: any) => this.preCheckedIdList.includes(item.id));
      this.preCheckedIdList = [];
    } else if (!this.checkedList.length) {
      // 如果没有已勾选的，默认选中第一行
      this.checkedFirstRow();
    }
    this.propagateChange(this.dealData());
  }

  private dealData() {
    return {
      throughput: this.checkboxList.some(item => item.checked && item.value === 'throughput'),
      iops: this.checkboxList.some(item => item.checked && item.value === 'iops'),
      latency: this.checkboxList.some(item => item.checked && item.value === 'latency'),
      data: this.checkedList.map((item: any) => {
        return {
          id: item.id,
          block_size: item.block_size,
          rw_type: item.rw_type,
          rw_mix_read_ratio: item.rw_mix_read_ratio,
          io_depth: item.io_depth,
          io_engine: item.io_engine,
          num_jobs: item.num_jobs,
          direct: item.direct,
          size: item.size,
          runtime: item.runtime,
          indicator_type: item.indicator_type.map((v: any) => v.value).join('|')
        };
      })
    };
  }

  private changeBtnStatus(status: boolean) {
    this.items = this.items.map((item: any) => {
      return {
        ...item,
        disabled: status
      };
    });
  }

  public onSelect(item: any, row: TiTableRowData) {
    if (item.value === 'edit') {
      // 编辑表格行数据
      this.setData(this.editingRow, row);
      this.isEditingRow = true;
      this.isAddingRow = false;
      this.changeBtnStatus(true);
      this.changeAllSelect(true);
      this.preCheckedIdList = this.checkedList.map((selectedRow: any) => selectedRow.id);
    } else {
      const deleteModel = () => {
        // 删除表格行数据
        this.http.delete(
          `/storage-tasks-model/${row.id}/`,
        ).then(() => {
          this.getTableData();
        });
      };
      this.tiMessage.open({
        type: 'warn',
        title: I18n.common_term_operate_del,
        content: I18n.sureDeleteOne,
        close: deleteModel
      });
    }
  }

  public onSelectAdd(item: any) {
    const {disabled, ...data} = this.newRow;
    this.dealOrginData(data, 'dealPostData');
    if (item.value === 'add') {
      // 添加一条表格行数据
      this.http.post(
        `/storage-tasks-model/`,
        {data}
      ).then((res: any) => {
        this.isAddingRow = false;
        this.getTableData();
      });
    } else {
      // 取消当前操作
      this.isAddingRow = false;
      this.changeBtnStatus(false);
      this.changeAllSelect(false);
      this.checkedList = [];
    }
  }

  public onSelectEditing(item: any, row: TiTableRowData) {
    const {disabled, id, ...data} = this.editingRow;
    this.dealOrginData(data, 'dealPostData');
    if (item.value === 'save') {
      // 保存修改当前表格行数据
      this.http.put(
        `/storage-tasks-model/${row.id}/`,
        {data}
      ).then(() => {
        this.getTableData();
      });
    } else {
      // 取消当前操作
      this.isEditingRow = false;
      this.changeBtnStatus(false);
      this.changeAllSelect(false);
      this.checkedList = [];
    }
  }

  public changeNewrowFlag(flag: boolean) {
    if (flag) {
      this.setData(this.newRow, this.tableData.defaultData);
      this.formArray.controls[0].reset({
        block_size: '',
        io_depth: '',
        num_jobs: '',
        size: '',
        runtime: ''
      });
      this.isEditingRow = false;
    }
    this.isAddingRow = flag;
    this.changeAllSelect(flag);
    this.changeBtnStatus(flag);
    this.preCheckedIdList = this.checkedList.map((selectedRow: any) => selectedRow.id);
  }

  private changeAllSelect(flag: boolean) {
    this.selectAllDisabled = flag;
    this.tableData.srcData.forEach((row: { disabled?: boolean; }) => {
      row.disabled = flag;
    });
  }

  private setData(originData: TiTableRowData, targetData: TiTableRowData) {
    Object.keys(originData).forEach(key => {
      if (key === 'rw_mix_read_ratio') {
        // 默认值50
        originData[key] = targetData[key] > 0 ? targetData[key] : 50;
      } else if (key === 'indicator_type') {
        originData[key] = this.tableData.columnsTree[9].option.filter((n: any) => {
          return targetData[key].some((m: any) => m.value === n.value);
        });
      } else {
        originData[key] = targetData[key];
      }
    });
  }

  public format(val: any, column: any) {
    if (column.type === 'select') {
      return column.option?.find((v: any) => v.value === val)?.label;
    } else if (column.type === 'rateInput') {
      return val && val > 0 ? `${val} : ${100 - val}` : '--';
    } else if (column.type === 'selectMultiple') {
      return val.map((v: any) => v.label).join(' | ');
    } else {
      return val;
    }
  }

  public getMultipleText(val: any) {
    return val.map((item: any) => item.label).join(I18n.common_term_sign_comma);
  }

  private dealOrginData(data: any, type: ('toString' | 'dealPostData')) {
    // 'toString'   只是把数据变成字符串
    // 'dealPostData'    处理上送数据
    Object.keys(data).forEach((key: string) => {
      if (key === 'rw_mix_read_ratio' && !this.showRateKeys.includes(data.rw_type)) {
        data[key] = '--';
      } else if (key === 'indicator_type') {
        if (type === 'dealPostData') {
          data[key] = data[key].map((v: any) => v.value).join('|');
        }
      } else {
        data[key] += '';
      }
    });
  }

  registerOnChange(fn: any) {
    this.propagateChange = fn;
  }

  validate() {
    return (this.validateMetricVal && this.checkedList?.length ? null : { indicatorForm: { valid: false } });
  }
}
