import {
  Component,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { TiFileInfo, TiModalRef } from '@cloud/tiny3';
import { BehaviorSubject, Subject } from 'rxjs';
import { BatchOptEvent, BatchNodeInfo, BatchOptType } from '../../domain';
import {
  StateController,
  DispatchInfo,
  StateBaseOpreation,
  OpenModelFn,
} from '../../model';
import { ExcelParseService } from './excel-parse.service';
import { I18n } from 'sys/locale';
import { HyMiniModalService } from 'hyper';
import { HttpService } from 'sys/src-com/app/service';
import { HPC_NODE_NUM_MAX } from 'sys/src-com/app/global/constant';
import { Queue } from './queue.class';

/**
 * 功能点：
 * - 解析xlsx文件，并输出错误原因
 *
 * 传输入参数：
 * - xlsx文件实例
 *
 * 传出事件：
 * - 失败
 * - 成功
 * - 关闭
 */
@Component({
  selector: 'app-excel-parse',
  templateUrl: './excel-parse.component.html',
  styleUrls: ['./excel-parse.component.scss'],
})
export class ExcelParseComponent implements OnInit, StateBaseOpreation {
  static FILE_SIZE_LIMIT = 1024000; // KB
  static FILE_TYPES = ['xlsx'];
  static CURRENT_PAGE = 1;

  @ViewChild('excelParseModal', { static: true })
  excelParseModal: TemplateRef<any>;

  @Output() inited = new BehaviorSubject<StateController>(null);
  @Output() dispatch = new Subject<DispatchInfo>();

  // 批量操作类型
  batchOptType: BatchOptType;
  batchOptTypeEnum = BatchOptType;
  constructor(
    private excelParse: ExcelParseService,
    private miniModal: HyMiniModalService,
    private http: HttpService
  ) {}

  flieInfo: TiFileInfo;
  parseState: 'ready' | 'parsing' | 'error' = 'ready';
  parseInfoStack = new Queue<{
    type: 'ready' | 'parsing' | 'success' | 'fail';
    text: string;
  }>(2);
  private openModelRef: TiModalRef;
  private isBulletBoxShow = false;
  private dispatchFunc = () => {};

  ngOnInit(): void {
    this.inited.next({
      action: (payLoad: TiFileInfo, openModel: OpenModelFn) => {
        this.flieInfo = payLoad;
        this.openModelRef = openModel(this.excelParseModal, {
          dismiss: () => {},
        });
        this.validFile(payLoad);
      },
    });
  }

  /**
   * 重试
   */
  onRetry() {
    this.parseInfoStack.clear();
    this.parseState = 'ready';
    this.validFile(this.flieInfo);
  }

  /**
   * 替换
   */
  onReplaceClick() {
    this.openModelRef.close();
    this.dispatch.next({
      event: BatchOptEvent.Replace,
      payLoad: {
        isReplace: true,
      },
    });
  }

  onModelClose(_: any) {
    this.isBulletBoxShow = false;
    if (this.parseState === 'error') {
      this.openModelRef.close();
      this.dispatch.next({
        event: BatchOptEvent.Close,
      });
    } else {
      this.miniModal.open({
        type: 'warn',
        content: {
          title:
            BatchOptType.Import === this.batchOptType
              ? I18n.nodeManagement.cancelImport
              : I18n.nodeManagement.cancelDelet,
          body:
            BatchOptType.Import === this.batchOptType
              ? I18n.nodeManagement.cancelImportWarn
              : I18n.nodeManagement.cancelDeletWarn,
        },
        close: (): void => {
          this.openModelRef.close();
          this.dispatch.next({
            event: BatchOptEvent.Close,
          });
        },
        dismiss: () => {
          this.isBulletBoxShow = true;
          this.dispatchFunc();
        },
      });
    }
  }

  /**
   * 文件校验
   * @param file 文件
   * @returns 无
   */
  private async validFile(file: TiFileInfo) {
    this.isBulletBoxShow = true;
    this.parseInfoStack.toPush({
      type: 'parsing',
      text: I18n.nodeManagement.fileParseing,
    });
    this.parseInfoStack.toPush({
      type: 'ready',
      text: I18n.nodeManagement.flieVerify,
    });

    await this.awaitTime(1500);

    // 1、文件有效性校验
    try {
      await this.verifyFileFormat(file);
    } catch (error) {
      if (this.isBulletBoxShow) {
        this.parseInfoStack.set(0, {
          type: 'fail',
          text: error,
        });
        this.parseState = 'error';
      } else {
        this.dispatchFunc = () => {
          this.parseInfoStack.set(0, {
            type: 'fail',
            text: error,
          });
          this.parseState = 'error';
        };
      }
      return;
    }

    // 2、文件读取
    let info: BatchNodeInfo[];
    try {
      info = await this.readDExcelFile(file);
    } catch (error) {
      if (this.isBulletBoxShow) {
        this.parseInfoStack.set(0, {
          type: 'fail',
          text: I18n.nodeManagement.fileParseError,
        });
        this.parseState = 'error';
      } else {
        this.dispatchFunc = () => {
          this.parseInfoStack.set(0, {
            type: 'fail',
            text: I18n.nodeManagement.fileParseError,
          });
          this.parseState = 'error';
        };
      }
      return;
    }

    await this.awaitTime(1500);

    // 3、文件数据合法性校验
    try {
      await this.dataVerify(info);
      this.parseInfoStack.set(0, {
        type: 'success',
        text: I18n.nodeManagement.fileParseOk,
      });
      this.parseInfoStack.set(1, {
        type: 'parsing',
        text: I18n.nodeManagement.flieVerifying,
      });
      await this.awaitTime(1000);
      this.dispatchFunc = () => {
        this.openModelRef.close();
        this.dispatch.next({
          event: BatchOptEvent.Success,
          payLoad: info as BatchNodeInfo[],
        });
      };
      if (this.isBulletBoxShow) {
        this.dispatchFunc();
      }
    } catch (error) {
      if (this.isBulletBoxShow) {
        this.parseInfoStack.set(0, {
          type: 'fail',
          text: error,
        });
        this.parseState = 'error';
      } else {
        this.dispatchFunc = () => {
          this.parseInfoStack.set(0, {
            type: 'fail',
            text: error,
          });
          this.parseState = 'error';
        };
      }
      return;
    }
  }

  /**
   * 文件数据合法性校验
   * @param info 批量节点信息
   * @returns 错误文本信息
   */
  private dataVerify(info: BatchNodeInfo[]): Promise<string> {
    return new Promise(async (resolve, reject) => {
      if (!info?.length) {
        reject(I18n.nodeManagement.uploadEmptyData);
      }
      // 导入添加时判断节点数量是否大于101
      if (BatchOptType.Import === this.batchOptType) {
        const hasAddNum = await this.getAllNodeList();
        if (info?.length + hasAddNum > HPC_NODE_NUM_MAX) {
          reject(I18n.nodeManagement.maxNodeNum);
        }
      }
      // 节点重复校验
      const ipList = info.map((item) => item.ip);
      const ipSet = new Set(ipList);
      if (ipList.length > ipSet.size) {
        reject(I18n.nodeManagement.ipRepeat);
      }
      resolve('');
    });
  }

  /**
   * 获取节点的数目
   * @returns 当前的节点数
   */
  private async getAllNodeList() {
    const url = '/nodes/';
    const params = {
      'auto-flag': 'on',
      page: ExcelParseComponent.CURRENT_PAGE,
      'per-page': HPC_NODE_NUM_MAX,
    };
    const resp = await this.http.get(url, {
      params,
      headers: { showLoading: false },
    });
    return resp?.data?.totalCounts ?? 0;
  }

  /**
   * 检验文件类型和大小
   * @param file 文件对象
   * @returns 错误信息
   */
  private verifyFileFormat(file: TiFileInfo): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!ExcelParseComponent.FILE_TYPES.includes(file.type)) {
        reject(I18n.nodeManagement.fileTypeError);
        return;
      }
      if (ExcelParseComponent.FILE_SIZE_LIMIT < file.size) {
        reject(I18n.nodeManagement.fileSizeError);
        return;
      }
      resolve('');
    });
  }

  /**
   * 文件读取
   * @param file 文件对象
   * @returns 文件中的数据
   */
  private readDExcelFile(file: TiFileInfo): Promise<BatchNodeInfo[]> {
    return new Promise((resolve, reject) => {
      this.parseExcel(
        file,
        (res: BatchNodeInfo[]) => {
          resolve(res);
        },
        (err: any) => {
          reject(err);
        }
      );
    });
  }

  /**
   * 延时函数
   * @param ms 毫秒
   * @returns void
   */
  private awaitTime(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, ms);
    });
  }

  /**
   * 解析excel
   * @param file 文件信息
   * @param resolve resolve函数
   * @param reject reject函数
   */
  private parseExcel(
    file: TiFileInfo,
    resolve: (value: void | BatchNodeInfo[]) => void,
    reject: (err: any) => void
  ) {
    switch (this.batchOptType) {
      case BatchOptType.Import:
        this.excelParse.parseImportExcel(file, resolve, reject);
        break;
      case BatchOptType.Delete:
        this.excelParse.parseDeleteExcel(file, resolve, reject);
        break;
      default:
        throw new Error('Parse excel fail');
    }
  }
}
