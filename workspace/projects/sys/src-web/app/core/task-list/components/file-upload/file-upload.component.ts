import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { TaskListInterfaceService } from 'projects/sys/src-web/app/service/task-list-interface.service';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { ToolType } from 'projects/domain';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})

export class FileUploadComponent implements OnInit, OnDestroy {
  @Input() fileInfoList: any[]; // 文件列表
  @Input() taskId: any; // 任务 id
  @Input() projectName: string; // 工程名称
  @Input() taskName: string; // 任务名称
  @Input() chunkSize = 25 * 1024 * 1024;  // 每个切片的大小

  @Output() private sendDeleteMessage = new EventEmitter();

  // 导入任务
  @ViewChild('importTaskModel') importTaskModel: any;
  // 查看任务
  @ViewChild('viewTaskModal') viewTaskModal: any;

  public i18n: any;
  public isPolling = false; // 是否轮询
  public timer: any; // 轮询列表数据的定时器
  public taskInfo: any;
  public steps: any = [];  // [导入任务-]解压数据-导入任务
  public math = Math;
  public preExit = false; // 任务列表点击删除该项，但是任务还未完成，暂时隐藏该任务，子组件运行结束之后再通知父组件关闭该项
  public exited = false;
  public uploadSucceeded = false; // 是否导入成功
  private uploadedChunkList: any = {}; // 已经上传的切片列表
  public isDiagnose = sessionStorage.getItem('toolType') === ToolType.DIAGNOSE;
  constructor(public taskListInterface: TaskListInterfaceService, private i18nService: I18nService) {
    this.i18n = this.i18nService.I18n();

    this.steps = [
      { prop: 'unzip', text: this.i18n.project.unzipData, status: 'waiting' },
      { prop: 'import', text: this.i18n.project.importTask, status: 'waiting' },
    ];
  }

  ngOnInit() {
    if (this.fileInfoList && this.fileInfoList.length) {  // 需要上传文件
      const uploadFileStep: any = [];

      Object.keys(this.fileInfoList).forEach((fileKey: any, fileIndex) => {
        const target = this.fileInfoList[fileKey];
        uploadFileStep.push({
          prop: 'uploadFile',
          status: 'waiting',
          text: `${target.name} (${this.taskListInterface.formatFileSizeUnit(target.size, 'B')})`,
          id: `uploadFile${fileIndex}`
        });
      });

      this.steps = [...uploadFileStep, ...this.steps];

      // 获取文件切片列表
      this.taskListInterface.getUploadedChunkList({
        id: this.taskId,
      }).then((res: any) => {
        this.uploadedChunkList = res.data[this.taskId] || {};
        this.startUpload(0);
      });
    } else {  // 服务器上已有完整的文件数据，直接轮询更新解压状态和导入状态
      this.startPolling();
    }
  }

  ngOnDestroy() {
    this.endPolling();
  }

  // 开始轮询
  public startPolling() {
    this.isPolling = true;
    this.updateSteps();
  }

  // 结束轮询
  public endPolling() {
    this.isPolling = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }
  }


  // -- 上传文件 步骤 --
  /**
   * 开始上传
   * @param fileIndex 文件在 fileInfoList 中的 Index
   */
  public startUpload(fileIndex: any) {
    const list = this.steps.filter((item: any) => item.id === `uploadFile${fileIndex}`);
    const step = list[0];
    const uploading = this.taskListInterface.statusList.uploading;
    step.status = uploading.status;
    step.progress = 0;

    const fileInfo = this.fileInfoList[fileIndex];
    const fileChunkList = this.createFileChunk(fileInfo);
    const hasUploadChunkList = this.uploadedChunkList[fileInfo.name] ? this.uploadedChunkList[fileInfo.name]
    .split(';').map((item: string | number) => +item) : [];
    this.uploadChunks(step, fileIndex, fileInfo.name, fileInfo.size, fileChunkList, hasUploadChunkList, 1);
  }

  /**
   * 生成文件切片
   * @param file 文件对象
   * @param size 每个切片的大小
   */
  private createFileChunk(file: any, size = this.chunkSize) {
    const fileChunkList = [];
    let cur = 0;
    let index = 0;
    while (cur < file.size) {
      fileChunkList.push({
        chunk: file.slice(cur, cur + size),
        index: index++,
        process: 0,
      });
      cur += size;
    }
    return fileChunkList;
  }

  /**
   * 上传切片，同时过滤已上传的切片
   * @param step 步骤信息
   * @param fileIndex 文件在 fileInfoList 中的 Index
   * @param fileHash 整个file的hash值
   * @param fileSize 整个file的大小，后端需要此字段进行大小校验，大于一个G的直接失败，防止用户误传
   * @param fileChunkList 切片列表
   * @param hasUploadChunkList 已经上传的切片列表
   * @param maxReqNum 并发数
   */
  private async uploadChunks(step: any, fileIndex: any, fileHash: any, fileSize: any,
                             fileChunkList: any, hasUploadChunkList: any, maxReqNum = 5) {
    if (fileChunkList.length === hasUploadChunkList.length) { // 已经全部上传了，进行合并
      return this.mergeChunks(step, fileIndex, fileHash);
    }

    const unUploadedChunks: any = [];  // 未上传的切片列表
    fileChunkList.forEach((fileChunk: any) => {
      if (hasUploadChunkList.includes(fileChunk.index)) {
        fileChunk.progress = 100;
        this.calcFileUploadProgress(step, fileChunkList);
      } else {
        unUploadedChunks.push(fileChunk);
      }
    });

    // 开始上传切片
    let chunkIndex = 0;
    let hasUploadNum = 0; // 已经上传的数量
    let requestNum = 0;

    const sendReq = () => {
      const chunk = unUploadedChunks[chunkIndex];
      if (requestNum < maxReqNum && chunk) {
        requestNum++;
        chunkIndex++;

        const formData: any = new FormData();
        formData.append('id', this.taskId);
        formData.append('file_name', fileHash);
        formData.append('chunk', chunk.index);
        formData.append('file', chunk.chunk);
        formData.append('file_size', fileSize);

        this.taskListInterface.uploadChunk(formData).then(res => {
          requestNum--;

          chunk.progress = 100;
          this.calcFileUploadProgress(step, fileChunkList);

          if (++hasUploadNum === unUploadedChunks.length) {
            this.mergeChunks(step, fileIndex, fileHash);
          } else {
            sendReq();
          }
        }).catch(e => {
          step.status = this.taskListInterface.statusList.upload_fail.status;
          step.failedReason = e.response.data.message;
        });
      }
    };

    for (let index = 0; index < maxReqNum; index++) {
      sendReq();
    }
  }

  /**
   * 合并切片
   * @param step 步骤信息
   * @param fileIndex 文件在 fileInfoList 中的 Index
   * @param fileHash 整个file的hash值
   */
  private mergeChunks(step: any, fileIndex: number, fileHash: any, ) {
    // 开始合并
    const params: any = {
        id: this.taskId,
        file_name: fileHash,
    };
    if (this.isDiagnose){
        params.analysisType = 'memory_diagnostic';
    }
    this.taskListInterface.mergeFile(params).then(res => {
      // 合并成功
      step.status = 'succeeded';

      if (fileIndex === this.fileInfoList.length - 1) { // 上传完毕，开始轮询更新解压状态和导入状态
        this.startPolling();
      } else {  // 否则，继续下一个
        this.startUpload(fileIndex + 1);
      }
    }).catch(e => {
      step.status = this.taskListInterface.statusList.upload_fail.status;
      step.failedReason = e.response.data.message;
    });
  }

  /**
   * 根据每个切片的进度 计算整个 step 的进度
   * @param step step object
   * @param fileChunkList 切片列表
   */
  private calcFileUploadProgress(step: { progress: number; }, fileChunkList: any[]) {
    step.progress = +fileChunkList.map((chunk: { progress: number; }) =>
    chunk.progress / fileChunkList.length || 0).reduce((total: any, num: any) => total + num).toFixed(2);
  }


  /**
   * 轮询更新解压状态和导入状态
   */
  private updateSteps() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }

    this.taskListInterface.getTaskList({ taskId: this.taskId }).then((res: any) => {
      this.taskInfo = res.data;
      this.updateUnzipStatus();
      this.updateImportStatus();
    }).catch(e => {

    }).finally(() => {
      if (this.isPolling) {
        this.timer = setTimeout(() => this.updateSteps(), 3000);
      }
    });
  }

  /**
   * 更新解压状态
   */
  private updateUnzipStatus() {
    const unzipStep = this.steps.find((step: { prop: string; }) => step.prop === 'unzip');
    const processStatusIndex = this.taskListInterface.importStepsList.indexOf(this.taskInfo.process_status);

    if (processStatusIndex < 3) {
      unzipStep.text = this.i18n.project.unzipData;
      unzipStep.status = 'waiting';
    } else if (processStatusIndex === 3) {  // 解压中
      const extracting = this.taskListInterface.statusList.extracting;
      unzipStep.text = extracting.text;
      unzipStep.status =  extracting.status;
    } else if (processStatusIndex === 4) {  // 解压失败
      const extract_fail = this.taskListInterface.statusList.extract_fail;
      unzipStep.text = extract_fail.text;
      unzipStep.status = extract_fail.status;
      this.exit('failed');
    } else if ((processStatusIndex === 5) || (processStatusIndex > 6)) {  // 解压成功
      const extracting_success = this.taskListInterface.statusList.extracting_success;
      unzipStep.text = extracting_success.text;
      unzipStep.status = extracting_success.status;
    } else if (processStatusIndex === 6) {  // 导入校验失败
      const import_check_fail = this.taskListInterface.statusList.import_check_fail;
      unzipStep.text = import_check_fail.text;
      unzipStep.status = import_check_fail.status;
      this.exit('failed');
    }
  }

  /**
   * 更新导入状态
   */
  private updateImportStatus() {
    const importStep = this.steps.find((step: { prop: string; }) => step.prop === 'import');
    const processStatusIndex = this.taskListInterface.importStepsList.indexOf(this.taskInfo.process_status);

    if (processStatusIndex < 7) {
      importStep.text = this.i18n.project.importTask;
      importStep.status = 'waiting';
    } else if (processStatusIndex === 7) {  // 待导入
      const pre_import = this.taskListInterface.statusList.pre_import;
      importStep.text = pre_import.text;
      importStep.status = pre_import.status;
    } else if (processStatusIndex === 8) {  // 导入任务启动失败
      const import_start_fail = this.taskListInterface.statusList.import_start_fail;
      importStep.text = import_start_fail.text;
      importStep.status = import_start_fail.status;
      this.exit('failed');
    } else if (processStatusIndex === 9) {  // 导入中
      const importing = this.taskListInterface.statusList.importing;
      importStep.text = importing.text;
      importStep.status = importing.status;
    } else if (processStatusIndex === 10) {  // 导入失败
      const import_fail = this.taskListInterface.statusList.import_fail;
      importStep.text = import_fail.text;
      importStep.status = import_fail.status;
      this.exit('failed');
    } else if (processStatusIndex === 11) {  // 导入任务信息
      const adding_task_info = this.taskListInterface.statusList.adding_task_info;
      importStep.text = adding_task_info.text;
      importStep.status = adding_task_info.status;
    } else if (processStatusIndex === 12) {  // 导入任务信息失败
      const adding_task_info_fail = this.taskListInterface.statusList.adding_task_info_fail;
      importStep.text = adding_task_info_fail.text;
      importStep.status = adding_task_info_fail.status;
      this.exit('failed');
    } else if (processStatusIndex > 12) {  // 导入成功
      const import_success = this.taskListInterface.statusList.import_success;
      importStep.text = import_success.text;
      importStep.status = import_success.status;
      this.exit('succeeded');
    }
  }

  /**
   * 预删除任务
   */
  public preDeleteTask() {
    if (this.exited) {
      this.deleteTask();
    } else {
      this.preExit = true;
    }
  }

  /**
   * 导出成功或失败
   * @param status 成功| 失败
   */
  private exit(status: 'succeeded' | 'failed') {
    this.endPolling();
    this.exited = true;
    this.uploadSucceeded = status === 'succeeded';
    if (this.preExit) {
      this.deleteTask();
    }
  }

  /**
   * 通知任务列表界面关闭改任务，触发于以下情景
   *  1、任务列表界面点击删除该任务，但是该任务还在运行中，运行完成之后再通知任务列表界面可以删除该任务
   *  2、任务列表界面点击删除该任务，该任务已经运行完毕，通知任务列表界面可以删除该任务
   */
  private deleteTask() {
    this.sendDeleteMessage.emit();
  }

  /**
   * handle operate
   * @param operate 操作
   */
  public handleOperate(operate: string) {
    if (operate === 'retry') {  // 重试
      if (this.taskInfo) { // 文件已上传完毕，重试任务
        this.importTaskModel.openByRetry(this.taskInfo.file_path, this.taskInfo.id,
          this.taskInfo.projectname, this.taskInfo.taskname).finally(() => {
          this.startPolling();
        });
      } else {
        if (this.fileInfoList && this.fileInfoList.length) {  // 文件信息还存在
          this.startUpload(0);
        } else {  // 新进界面的时候弹出的历史失败任务
          this.importTaskModel.open(this.projectName, this.taskName);
        }
      }
    } else if (operate === 'viewTask') {  // 查看任务
      this.taskListInterface.getTaskList({ taskId: this.taskId }).then((res: any) => {
        this.taskInfo.is_delete = res.data.is_delete;
        this.viewTaskModal.open(this.taskInfo, this.i18n.project.viewTask);
      }).catch(e => {});
    }
  }
}
