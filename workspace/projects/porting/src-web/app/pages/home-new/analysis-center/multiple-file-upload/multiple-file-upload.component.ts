import { Component, OnInit, Output, EventEmitter, ViewChild, TemplateRef } from '@angular/core';
import { TiTableRowData, TiTableSrcData, TiTableColumns, TiModalService, TiModalRef } from '@cloud/tiny3';
import axios from 'axios';
import { Status } from '../../../../modules';

import {
  MytipService, CommonService, AxiosService,
  I18nService
} from '../../../../service';
import {fileSize} from '../../../../global/globalData';
@Component({
  selector: 'app-multiple-file-upload',
  templateUrl: './multiple-file-upload.component.html',
  styleUrls: ['./multiple-file-upload.component.scss']
})
export class MultipleFileUploadComponent implements OnInit {
  @Output() handleRelayFileName = new EventEmitter();

  @ViewChild('relayFileModal', { static: false }) relayFileModal: any;
  @ViewChild('cancelTaskModal', { static: false }) cancelTaskModal: any;

  constructor(
    private tiModal: TiModalService,
    public i18nService: I18nService,
    private axiosService: AxiosService,
    private commonService: CommonService,
    private mytipServe: MytipService
  ) {
    this.i18n = this.i18nService.I18n();
  }

  public i18n: any;
  public currLang: string;

  public cancel: any; // 取消 axios 请求

  // 拖拽上传表格数据
  public relayFileTableData: Array<TiTableRowData> = [];
  public relayFileSrcData: TiTableSrcData; // 实际显示表格
  public relayFileColumns: Array<TiTableColumns> = [];
  public relayMiddleData: Array<any> = []; // 用来存储上一个表格的值
  public exitFileList: Array<any> = []; // 用来存储已经存在的文件
  public largeFilesSize: Array<number> = []; // 用来存储过大文件大小
  public relayFileTotalSize: number;
  public relayFormData: any; // 依赖文件流
  public isUploadRelayFile = false; // 是否为上传依赖文件过程
  public relayUploadProgress = false;
  public relayUploadComplete = false;
  public relayUploadTotal: number; // 可上传文件数
  public relaySuccessFile: number;
  public relaySuccessSize: number;
  public barValue: number;
  public maxBarValue = 100;

  public isDone: boolean; // 文件是否全部上传完成
  public isDataBlank: boolean; // 是否为 上传完成 但是数据还没有返回的空白期

  public isError: boolean; // 是否为网络断开 或 取消上传
  public disabledReplace = false; // 是否显示禁用replace

  ngOnInit(): void {
    this.currLang = sessionStorage.getItem('language');
  }

  // 显示多文件上传 modal
  showRelayFileModal() {
    this.initData();
    this.tiModal.open(this.relayFileModal, {
      id: 'relayFileModal',
      modalClass: 'dragModal700',
      beforeClose: (modalRef: TiModalRef): void => {
        if (!this.relayUploadProgress && !this.isDataBlank) {
          modalRef.destroy(false);
        } else {
          this.cancelTask(this.cancelTaskModal, modalRef);
        }
      }
    });
  }

  relayFileDragover(e: Event) {
    e.preventDefault();
  }
  // 拖拽上传文件
  relayFileDrop(e: any): void {
    e.preventDefault();
    const fileList = [];
    const dataTransfer = e.dataTransfer;
    if (dataTransfer.items !== undefined) {
      for (let i = 0, len = dataTransfer.items.length; i < len; i++) {
        const file = dataTransfer.items[i];
        const fileInfo = file.getAsFile();
        // 如果为文件
        if (file.webkitGetAsEntry().isFile) {
          fileList.push(fileInfo);
        } else { // 文件夹
          fileList.push({
            name: fileInfo.name,
            size: fileInfo.size,
            msg: this.i18n.software_relay_file.failTitle,
            error: true
          });
        }
      }
    } else { // IE浏览器
      for (let i = 0, len = dataTransfer.files.length; i < len; i++) {
        const file = dataTransfer.files[i];
        fileList.push(file);
      }
    }

    this.hadleRelayFile(fileList);
  }
  // 点击上传依赖文件
  relayFileClick(e: any): void {
    const fileList = Array.from(e.target.files);
    this.hadleRelayFile(fileList);
  }
  // 对多文件上传进行处理
  hadleRelayFile(fileList: Array<any>) {
    fileList.forEach((file: any) => {
      const index = this.relayMiddleData.findIndex((item) => item.fileName === file.name);
      // 对重复文件进行替换
      if (index === -1) {
        this.relayMiddleData.push({
          fileName: file.name,
          fileSize: file.size,
          msg: file.msg || '',
          error: file.error || false,
          file, // 为后面的替换做一个存储
          type: this.i18n.common_term_operate_del
        });
      } else {
        // 重复文件处理走此处
        this.relayMiddleData.splice(index, 1, {
          fileName: file.name,
          fileSize: file.size,
          file,
          error: file.error || false,
          msg: file.msg || '',
          type: this.i18n.common_term_operate_del
        });
      }
    });

    this.checkRelayFile('normal', fileList);
  }

  /**
   * 检查文件内容是否合法
   * @param choice 上传类型
   * @param fileList 上传文件列表
   * @param isReplace 是否为替换
   * @param context 模态框上下文对象
   */
  checkRelayFile(choice: string, fileList: any, isReplace: boolean = false, context?: any) {
    if (isReplace) {
      this.disabledReplace = true;
      this.relayFormData = new FormData();
      this.relayFormData.append('file', fileList[0]);
      this.uploadRelayFile(true, context);
      return;
    }

    const params = {
      file_size: [] as Array<any>,
      file_name: [] as Array<any>,
      scan_type: '4',
      choice
    };
    fileList.forEach((file: any) => {
      // 前端文件大小校验
      if (file.size && (file.size / ( 1024 * 1024 ) > fileSize)){
        this.largeFilesSize.push(file.size);
        this.exitFileList.push({
          fileName: file.name,
          fileSize: file.size,
          file,
          status: this.i18n.common_term_upload_fail,
          msg: this.i18n.common_term_file_too_large_error,
          error: true
        });
        const index = this.relayMiddleData.findIndex((item) => item.fileName === file.name);
        this.relayMiddleData[index].msg = this.i18n.common_term_file_too_large_error;
        this.relayMiddleData[index].error = true;
        return;
      }
      if (!file.error){
        params.file_size.push(file.size);
        params.file_name.push(file.name);
      }
    });
    if (params.file_size.length === 0) {
      // 上传超限文件，不访问检查接口
      this.handleTotalFileSize();
      this.computedRestart();
      this.relayFileSrcData.data = this.relayMiddleData;
      return;
    }
    this.axiosService.axios.post('/portadv/autopack/check_upload/', params).then((res: any) => {
      // 磁盘空间不足
      if (res.status === '0x010611') {
        const content = this.currLang === 'zh-cn' ? res.infochinese : res.info;
        this.mytipServe.alertInfo({ type: 'error', content, time: 5000 });
        return;
      }
      if (this.commonService.handleStatus(res) !== 0) { // 有失败情况
        const failList = res.data.fail_file;
        if (failList && failList.length) {
          failList.forEach((item: any) => {
            const index = this.relayMiddleData.findIndex((file) => file.fileName === item[0]);
            const srcData = this.relayMiddleData[index];
            const folderName = 'The file or folder name contain Chinese spaces or special \
            characters such as ^ ` / | ; & $ > < \\ !. And cannot be uploaded.';
            // 如果文件已存在,则先保存起来
            if (item[1] === 'File already exist') {
              this.exitFileList.push({
                fileName: srcData.fileName,
                fileSize: srcData.fileSize,
                file: srcData.file,
                status: this.i18n.common_term_upload_fail,
                msg: this.currLang === 'zh-cn' ? '文件已存在' : 'File already exist',
                type: this.i18n.analysis_center.exit.replace
              });
            }
            this.relayMiddleData[index] = Object.assign(srcData, {
              msg: item[1] === ('File already exist' || folderName) ?
              '' : (this.currLang === 'zh-cn' ? item[2] : item[1]),
              error: true
            });
          });
        }
      }
      this.handleTotalFileSize();
      this.computedRestart();

      this.relayFileSrcData.data = this.relayMiddleData;
    });
  }

  /**
   * 上传依赖文件
   * @param isReplace 是否为替换
   * @param context 模态框上下文对象
   */
  async uploadRelayFile(isReplace: boolean = false, context?: any) {
    this.barValue = 0;
    this.isDone = false;
    this.isDataBlank = false;
    const CancelToken = axios.CancelToken;
    const that = this;
    let choice = 'normal';
    // 如果点击的替换 | 重试
    if (isReplace) {
      // 替换
      if (context) {
        choice = 'override';
        context.dismiss(); // 关闭弹框
      }
      this.relayUploadProgress = true;
      this.axiosService.axios.post('/portadv/autopack/data/', this.relayFormData, {
        headers: {
          choice
        },
        cancelToken: new CancelToken(function executor(c) {
          that.cancel = c;
        }),
        onUploadProgress: (progressEvent: any) => {
          this.barValue = Math.floor(this.maxBarValue * (progressEvent.loaded / progressEvent.total));
          if (this.barValue >= 100) {
            this.relayUploadProgress = false;
            this.isDataBlank = true;
          }
          if (!sessionStorage.getItem('token')) {
            this.cancel();
            return;
          }
        }
      }).then((res: any) => {
        if (this.commonService.handleStatus(res) === 0) {
          const successList = res.data.success_file;
          if (successList.length) {
            this.relaySuccessFile++;
            successList.forEach((item: any) => {
              const index = this.relayFileSrcData.data.findIndex((file) => file.fileName === item );
              const srcData = this.relayFileSrcData.data[index];
              this.relaySuccessSize += this.transform(srcData.fileSize);
              this.relayFileSrcData.data[index] = Object.assign({}, srcData, {
                status: this.i18n.common_term_upload_success,
                msg: this.i18n.analysis_center.exit.replaceMsg,
                type: ''
              });

              this.handleRelayFileName.emit(item);
            });
            this.isDataBlank = false;
          }
        }
      }).catch((err: any) => {
        // 网络断开
        if (err.message === 'Network Error') {
          this.relayUploadProgress = false;
          this.cancel();
        }
      }).finally(() => {
        this.isDone = true;
        this.isDataBlank = false;
        this.disabledReplace = false;
      });
      return;
    }

    // 点击上传时 将不能上传的文件删除
    this.relayFileSrcData.data = this.relayFileSrcData.data.filter((item) => !item.error);

    this.relayFileColumns = [
      {
        title: this.i18n.common_term_name_label,
        sortKey: 'fileName', // 设置排序时按照源数据中的哪一个属性进行排序
        width: '20%'
      },
      {
        title: this.i18n.common_term_size_label,
        sortKey: 'fileSize',
        width: '15%'
      },
      {
        title: this.i18n.certificate.status,
        sortKey: 'status',
        width: '20%'
      },
      {
        title: this.i18n.common_term_detail_label,
        width: '30%'
      },
      {
        title: this.i18n.common_term_log_down,
        width: '15%'
      }
    ];
    this.isUploadRelayFile = true;
    // 重置表格数据
    this.relayFileSrcData.data = this.relayFileSrcData.data.map((file) => Object.assign({}, file, {
      status: '',
      msg: '',
      type: ''
    }));

    // 如果没有要上传的内容，则重新初始化
    if (!this.relayFileSrcData.data.length && !this.exitFileList.length) {
      this.initData();
      return;
    }

    // 如果有存着的 已存在文件||异常文件
    if (this.exitFileList.length) {
      this.exitFileList.forEach(data => {
        this.relayFileSrcData.data.unshift(data);
      });
    }
    const fileData = this.relayFileSrcData.data;
    let fileIndex = this.exitFileList.length;
    while ((fileIndex < fileData.length) && !this.isError) {
      const formData = new FormData();
      formData.append('file', fileData[fileIndex].file);
      this.relayUploadProgress = true;
      this.barValue = 0;
      await this.axiosService.axios.post('/portadv/autopack/data/', formData, {
        headers: {
          choice
        },
        cancelToken: new CancelToken(function executor(c) {
          that.cancel = c;
        }),
        onUploadProgress: (progressEvent: any) => {
          this.barValue = Math.floor(this.maxBarValue * (progressEvent.loaded / progressEvent.total));
          if (this.barValue >= 100) {
            this.relayUploadProgress = false;
            this.isDataBlank = true;
          }
          if (!sessionStorage.getItem('token')) {
            this.cancel();
            return;
          }
        }
      }).then((res: any) => {
        // 文件上传任务达到上限
        if (res.status === Status.maximumTask) {
          this.relayUploadProgress = false;
          this.isError = true;
          this.isDataBlank = false;
          const content = this.currLang === 'zh-cn' ? res.infochinese : res.info;
          this.mytipServe.alertInfo({ type: 'error', content, time: 5000 });
          return;
        }
        if (
          this.commonService.handleStatus(res) === 0
          || this.commonService.handleStatus(res) === 1
          || res.status === '0x010122'
        ) {
          const successList = res.data.success_file;
          const failList = res.data.fail_file;
          if (successList.length) {
            this.relaySuccessFile += successList.length;
            successList.forEach((item: any) => {
              const index = this.relayFileSrcData.data.findIndex((file) => file.fileName === item );
              const srcData = this.relayFileSrcData.data[index];
              this.relaySuccessSize += this.transform(srcData.fileSize);
              this.relayFileSrcData.data[index] = Object.assign({}, srcData, {
                status: this.i18n.common_term_upload_success,
                msg: '',
                type: ''
              });

              this.handleRelayFileName.emit(item);
            });
          }
          if (failList.length) {
            failList.forEach((item: any) => {
              const index = this.relayFileSrcData.data.findIndex((file) => file.fileName === item[0]);
              const srcData = this.relayFileSrcData.data[index];
              this.relayFileSrcData.data[index] = Object.assign({}, srcData, {
                status: this.i18n.common_term_upload_fail,
                msg: this.currLang === 'zh-cn' ? item[2] : item[1],
                type: item[2] === '文件已存在' ? this.i18n.analysis_center.exit.replace : ''
              });
            });
          }
          this.isDataBlank = false;
          fileIndex++;
        }
      }).catch((err: any) => {
        // 网络断开
        if (err.message === 'Network Error') {
          this.relayUploadProgress = false;
          // 将所有待上传的依赖文件标记为 上传失败
          this.relayFileSrcData.data.forEach(file => {
            if (!file.msg) {
              file.status = this.i18n.common_term_upload_fail;
              file.msg = this.i18n.analysis_center.retry.tip;
              file.type = this.i18n.analysis_center.retry.title;
            }
          });
          this.isError = true;
          this.cancel();
          return;
        } else {
          const srcData = this.relayFileSrcData.data[fileIndex];
          this.relayFileSrcData.data[fileIndex] = Object.assign({}, srcData, {
            status: this.i18n.common_term_upload_fail,
            msg: this.i18n.analysis_center.retry.excTip,
            type: this.i18n.analysis_center.retry.title
          });
          fileIndex++;
          this.isDataBlank = false;
          return;
        }
      });
    }
    this.isDone = true;
  }

  /**
   * 删除依赖文件 + 重新计算文件大小 + 重新遍历是否显示详情 + 如果有缓存的 已存在文件则 删除
   * @param index 下标
   */
  delRelayFile(index: number): void {
    // 如果有缓存的 已存在文件则 删除
    const num = this.exitFileList.findIndex(file => file.fileName === this.relayMiddleData[index].fileName);
    if (num >= 0) {
      this.exitFileList.splice(num, 1);
    }

    this.relayFileSrcData.data.splice(index, 1);
    this.handleTotalFileSize();
    this.computedRestart();
  }

  // 计算可上传文件总大小
  handleTotalFileSize(): void {
    const dataList = this.relayMiddleData.filter((data) => !data.msg);
    this.relayUploadTotal = dataList.length;
    this.relayFileTotalSize = 0;
    dataList.forEach((data) => {
      this.relayFileTotalSize += this.transform(data.file.size);
    });
    this.largeFilesSize.forEach((data) => {
      this.relayFileTotalSize += this.transform(data);
    });
    while (this.largeFilesSize.length > 0) {
      this.largeFilesSize.pop();
    }
  }

  // 如果有错误信息，则显示详情，没有则不显示
  computedRestart(): void {
    this.relayFileColumns = [
      {
        title: this.i18n.common_term_name_label,
        sortKey: 'fileName', // 设置排序时按照源数据中的哪一个属性进行排序
        width: '40%'
      },
      {
        title: this.i18n.common_term_size_label,
        sortKey: 'fileSize',
        width: '40%'
      },
      {
        title: this.i18n.common_term_log_down,
        width: '20%'
      }
    ];
  }

  /**
   * 替换 + 重试逻辑处理
   * @param modalTemplate 模态框
   * @param file 具体文件
   * @param isRetry 是否为 重试
   */
  openReplaceModal(modalTemplate: TemplateRef<any> | string, file: any, isRetry: boolean) {
    // 重试
    if (isRetry) {
      this.checkRelayFile('normal', [file.file], true, '');
      return;
    }

    // 打开替换模态框
    this.tiModal.open(modalTemplate, {
      id: 'replaceFileModal',
      modalClass: 'modal400',
      context: {
        tip: this.i18nService.I18nReplace(this.i18n.analysis_center.exit.content, { 1: file.fileName }),
        fileList: [file.file]
      }
    });
  }

  /**
   * 取消上传
   * @param modalTemplate 模态框
   * @param modalRef 多文件上传的 关闭 ref
   */
  cancelTask(modalTemplate: TemplateRef<any>, modalRef: TiModalRef) {
    // 如果处于数据返回阶段 则不可关闭弹框
    if (this.isDataBlank) {
      return;
    }
    this.tiModal.open(modalTemplate, {
      id: 'cancelTaskModal',
      modalClass: 'modal400',
      close: () => {
        this.isError = true;
        this.isDataBlank = false;
        this.cancel();
        if (this.relayUploadProgress) {
          modalRef.destroy(false);
        }
      }
    });
  }

  // 打开多文件弹框时，重新初始化数据
  initData(): void {
    this.relayFileSrcData = {
      data: [],
      state: {
        searched: false,
        sorted: false,
        paginated: false
      }
    };
    this.relayMiddleData = [];
    this.exitFileList = [];
    this.relayFileTotalSize = 0;
    this.relaySuccessFile = 0;
    this.relaySuccessSize = 0;
    this.relayUploadTotal = 0;
    this.isUploadRelayFile = false;
    this.isDone = true;
    this.isDataBlank = false;
    this.relayUploadProgress = false;
    this.barValue = 0;
    this.isError = false;
    this.relayFormData = new FormData();
  }

  // 对字节大小 进行处理
  transform(value: number): number {
    const sizeMB = value / 1024 / 1024;
    const sizeGB = sizeMB / 1024;
    if (sizeGB >= 1) {
      return Number(sizeGB.toFixed(0)) * 1024 * 1024 * 1024;
    } else if (sizeMB >= 1) {
      return Number(sizeMB.toFixed(0)) * 1024 * 1024;
    } else {
      return Number((value / 1024).toFixed(0)) * 1024;
    }
  }
}
