import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
import { MessageService } from 'projects/sys/src-web/app/service/message.service';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { MytipService } from 'projects/sys/src-web/app/service/mytip.service';
import { UrlService } from 'projects/sys/src-web/app/service/url.service';
import { ToolType } from 'projects/domain';
type operate = 'retry' | 'delete' | 'downloadTask' | 'viewTask';  // 重试 | 删除 | 下载 | 查看
interface Status {
  text: string; // 描述文本
  status: 'running' | 'failed' | 'succeeded' | 'uploading'; // 状态列表，运行中 | 失败 | 成功 | 上传中
  operateList: operate[];  // 操作列表
}

@Injectable({
  providedIn: 'root'
})
export class TaskListInterfaceService {
  private url: any;
  public language = 'en';
  public i18n: any;
  public exportStepsList = [
    'pre_export', 'export_start_fail', 'exporting', 'malluma_export_fail', 'packaging',
    'package_fail', 'export_success'];
  public importStepsList = [
    'uploading', 'upload_fail', 'upload_success', 'extracting',
    'extract_fail', 'extracting_success', 'import_check_fail',
    'pre_import', 'import_start_fail', 'importing', 'import_fail',
    'adding_task_info', 'adding_task_info_fail', 'import_success',
  ];
  public statusList: { [propName: string]: Status } = {}; // 所有的状态
  public operates: any;
  public listeningStatusTimer: any;  // 监听状态变化的定时器
  public listeningStatusTime = 3000;  // 定时器时长
  public isDiagnose = sessionStorage.getItem('toolType') === ToolType.DIAGNOSE;
  constructor(
      private urlService: UrlService,
      public Axios: AxiosService,
      public msgService: MessageService,
      private i18nService: I18nService,
      public router: Router,
      private mytip: MytipService
      ) {
    this.language = sessionStorage.getItem('language') === 'en-us' ? 'en' : 'zh';
    this.i18n = this.i18nService.I18n();
    this.url = this.urlService.Url();
    this.operates = {
      retry: { text: this.i18n.project.retry, width_en: '59px' },
      delete: { text: this.i18n.common_term_operate_del },
      viewTask: { text: this.i18n.common_term_view, width_en: '59px' },
      downloadTask: { text: this.i18n.operationLog.download, width_en: '59px' },
    };

    this.statusList = {
      // 导出
      pre_export: {
        text: this.i18n.project.toBeExported,
        status: 'running',
        operateList: [],
      },
      export_start_fail: {
        text: this.i18n.project.exportTaskStartFailed,
        status: 'failed',
        operateList: ['retry', 'delete'],
      },
      exporting: {
        text: this.i18n.project.exporting,
        status: 'running',
        operateList: [],
      },
      malluma_export_fail: {
        text: this.i18n.project.exportFailed,
        status: 'failed',
        operateList: ['retry', 'delete'],
      },
      packaging: {
        text: this.i18n.project.packaging,
        status: 'running',
        operateList: [],
      },
      package_fail: {
        text: this.i18n.project.packagingFailed,
        status: 'failed',
        operateList: ['retry', 'delete'],
      },
      export_success: {
        text: this.i18n.project.exportSucceeded,
        status: 'succeeded',
        operateList: ['downloadTask', 'delete'],
      },

      // 导入
      uploading: {
        text: this.i18n.project.uploading,
        status: 'uploading',
        operateList: [],
      },
      upload_fail: {
        text: this.i18n.project.uploadFailed,
        status: 'failed',
        operateList: ['delete'],
      },
      upload_success: {
        text: this.i18n.project.uploaded,
        status: 'succeeded',
        operateList: ['delete'],
      },
      extracting: {
        text: this.i18n.project.decompressing,
        status: 'running',
        operateList: [],
      },
      extract_fail: {
        text: this.i18n.project.decompressionFailed,
        status: 'failed',
        operateList: ['retry', 'delete'],
      },
      extracting_success: {
        text: this.i18n.project.decompressed,
        status: 'succeeded',
        operateList: ['delete'],
      },
      import_check_fail: {
        text: this.i18n.project.verificationFailed,
        status: 'failed',
        operateList: ['retry', 'delete'],
      },
      pre_import: {
        text: this.i18n.project.toBeImported,
        status: 'running',
        operateList: [],
      },
      import_start_fail: {
        text: this.i18n.project.importTaskStartFailed,
        status: 'failed',
        operateList: ['retry', 'delete'],
      },
      importing: {
        text: this.i18n.project.importing,
        status: 'running',
        operateList: [],
      },
      import_fail: {
        text: this.i18n.project.importFailed,
        status: 'failed',
        operateList: ['retry', 'delete'],
      },
      adding_task_info: {
        text: this.i18n.project.importingTaskInfo,
        status: 'running',
        operateList: [],
      },
      adding_task_info_fail: {
        text: this.i18n.project.importTaskFailed,
        status: 'failed',
        operateList: ['retry', 'delete'],
      },
      import_success: {
        text: this.i18n.project.imported,
        status: 'succeeded',
        operateList: ['viewTask', 'delete'],
      },

      // 删除
      deleting: {
        text: this.i18n.nodeManagement.deleting,
        status: 'running',
        operateList: [],
      },
      delete_success: {
        text: this.i18n.tip_msg.delete_ok,
        status: 'succeeded',
        operateList: [],
      },
      delete_fail: {
        text: this.i18n.tip_msg.delete_error,
        status: 'failed',
        operateList: ['delete'],
      },
    };
  }

  /**
   * 格式化文件大小单位，例：1024M => 1G
   * @param value 文件大小
   * @param unit value 使用的单位
   */
  public formatFileSizeUnit = (value: number, unit: 'B' | 'KB' | 'MB' | 'GB'): string => {
    if (value === 0) {
      return `0 ${unit}`;
    }

    const unitList = [
      { label: 'B', prop: 'B', rate: 1 },
      { label: 'KB', prop: 'KB', rate: 1024 },
      { label: 'MB', prop: 'MB', rate: 1024 * 1024 },
      { label: 'GB', prop: 'GB', rate: 1024 * 1024 * 1024 },
    ];
    const baseValue = value * unitList.find(item => item.prop === unit).rate;
    let usedUnit;
    for (let index = 0; index < unitList.length; index++) {
      const rate = unitList[index].rate;
      const nextRate = unitList[index + 1] ? unitList[index + 1].rate : Infinity;
      if ((baseValue >= rate) && (baseValue < nextRate)) {
        usedUnit = unitList[index];
        break;
      }
    }
    return `${(baseValue / usedUnit.rate).toFixed(2)} ${usedUnit.label}`;
  }


  // -- 任务列表 --
  /**
   * 获取任务列表信息
   * @param params params
   */
  public getTaskList({ pageNo, pageSize, taskId, autoFlag }: {
    pageNo?: number, // 页码从1开始
    pageSize?: number,
    taskId?: number, // 任务id
    autoFlag?: 'on',  // 是否不算入超时退出功能
  }) {
    return new Promise((resolve, reject) => {
    const params: any = {
        page: pageNo,
        'per-page': pageSize,
        language: this.language,
        id: taskId,
        'auto-flag': autoFlag,
    };
    if (this.isDiagnose){
        params['analysis-type'] = 'memory_diagnostic';
    }

    this.Axios.axios.get('/import_export_tasks/', {
        params,
        headers: {
          showLoading: false,
        }
      }).then((res: any) => {
        resolve(res);
      }).catch((e: any) => {
        reject(e);
      });
    });
  }

  /**
   * 删除任务
   * @param taskId 任务 id
   */
  public deleteTsk(taskId: any) {
    const type = this.isDiagnose ? '?analysis-type=memory_diagnostic' : '';
    return new Promise((resolve, reject) => {
      this.Axios.axios.delete(`/import_export_tasks/${taskId}/${type}`, null, {
        headers: {
          showLoading: false,
        }
      }).then((res: any) => {
        resolve(res);
      }).catch((e: any) => {
      });
    });
  }


  // -- 导出 --
  /**
   * 导出 | 重试导出 任务
   * @param params url params
   */
  public createExportTask(params: {
    projectname: string,  // 工程名称
    taskname: string, // 任务名称
    id?: number,  // 任务 id，在导入/导出任务列表点击重试时，填入该项的任务的id
    analysisType?: string
  }) {
    return new Promise((resolve, reject) => {
      this.Axios.axios.post(`/import_export_tasks/export/`, params).then((res: any) => {
        this.msgService.sendMessage({
          type: 'downloadFile',
          taskId: res.data.id,
          projectName: params.projectname,
          taskName: params.taskname,
        });

        resolve(res);
      }).catch((e: any) => {
        reject(e);
      });
    });
  }

  /**
   * 下载文件
   * @param id 任务 id
   * @param filesNum 压缩包个数
   */
  public downloadFile(id: any, filesNum: any) {
    const that = this;
    let sectionIndex = 0;
    const download = () => {
      this.Axios.axios.get(this.url.taskDownload, {
        params: {
          id,
          section: ++sectionIndex,
          responseHeaders: true,
        },
        responseType: 'blob'
      }).then(({ data, headers }: any) => {
        let filename;
        const disposition = headers['Content-Disposition'] || headers['content-disposition'];
        if (disposition && disposition.indexOf('attachment') !== -1) {
          const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
          const matches = filenameRegex.exec(disposition);
          if (matches != null && matches[1]) {
            filename = matches[1].replace(/['"]/g, '');
          }
        }
        this.Axios.downloadFile(data, filename);
        if (sectionIndex < filesNum) {
          download();
        }
      }).catch((e: any) => {
        const reader = new FileReader();
        reader.onload = function() {
          // 查看文件输出内容
          const res = JSON.parse(this.result as string);
          that.mytip.alertInfo({ type: 'warn', content: res.message, time: 3500 });
        };
        reader.readAsText(e.response.data);
      });
    };

    download();
  }


  // -- 导入 --
  /**
   * 导入 | 重试导入 任务
   * @param params url params
   * @param fileInfoList file对象，创建任务和重新导入需要传该参数，如果导入成功之后的重试直接去掉上传进度的显示
   */
  public createImportTask(
    params: {
      upload_path: 'web' | 'server',  // 上传方式，上传文件 | 指定文件路径
      file_path?: string, // 文件路径，在上传方式为“指定文件路径”时必填
      task_filesize?: number, // 总文件大小，后端每次收到切片会根据总文件大小和已上传大小来判断是否已上传完成，在上传方式为“上传文件”时必填
      project_name?: any,  // 工程名，在导入/导出任务列表点击重试时，填入该项的工程名称【因为有可能是工程名冲突导致导入任务失败】
      task_name?: any, // 任务名，在导入/导出任务列表点击重试时，填入该项的任务名称【因为有可能是任务名冲突导致导入任务失败】
      id?: any // 任务 id，在导入/导出任务列表点击重试时，填入该项的任务的id
      analysisType?: string
    },
    fileInfoList?: any
  ) {
    return new Promise((resolve, reject) => {
      this.Axios.axios.post('/import_export_tasks/import_task/', params).then((res: any) => {
        this.msgService.sendMessage({
          type: 'uploadFile',
          fileInfoList,
          taskId: res.data.id,
          projectName: params.project_name,
          taskName: params.task_name,
        });

        resolve(res);
      }).catch((e: any) => {
        reject(e);
      });
    });
  }

  /**
   * 获取已上传的切片列表
   * @param params params
   */
  public getUploadedChunkList(params: {
    id: number, // 任务id
  }) {
    return new Promise((resolve, reject) => {
      this.Axios.axios.get(this.url.taskTrunkNumber, { params }).then((res: any) => {
        resolve(res);
      }).catch((e: any) => {
        reject(e);
      });
    });
  }

  /**
   * 上传切片
   * @param params params
   */
  public uploadChunk(params: {
    id: number, // 任务id
    file_name: string,  // 文件名
    chunk: number,  // 切片索引
    file: any,  // 切片数据
    file_size: number,  // 整个file的大小，后端需要此字段进行大小校验，大于一个G的直接失败，防止用户误传
  }) {
    return new Promise((resolve, reject) => {
      this.Axios.axios.post(this.url.tasksIndex, params, {
        headers: {
          'Content-Type': 'multipart/form-data',
          showLoading: false,
        },
      }).then((res: any) => {
        resolve(res);
      }).catch((e: any) => {
        reject(e);
      });
    });
  }

  /**
   * 合并文件切片
   * @param params params
   */
  public mergeFile(params: {
    id: number, // 任务id
    file_name: string,  // 文件名
    analysisType?: string
  }) {
    return new Promise((resolve, reject) => {
      this.Axios.axios.post(this.url.uploadSuccess, params, {
        headers: {
          showLoading: false,
        }
      }).then((res: any) => {
        resolve(res);
      }).catch((e: any) => {
        reject(e);
      });
    });
  }
}
