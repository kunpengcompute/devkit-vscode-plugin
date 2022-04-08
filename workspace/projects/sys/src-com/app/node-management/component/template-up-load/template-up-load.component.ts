import {
  Component,
  ElementRef,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { StateController, DispatchInfo, StateBaseOpreation } from '../../model';
import {
  TiFileInfo,
  TiFileItem,
  TiModalRef,
  TiModalService,
  TiUploadConfig,
  TiUploadRef,
  TiUploadService,
} from '@cloud/tiny3';
import { BatchOptEvent, BatchOptType } from '../../domain';
import { BehaviorSubject, Subject } from 'rxjs';
import { TemplateDownloadService } from '../../service';
import { ExplorerType, HyTheme, HyThemeService } from 'hyper';
import { I18n } from 'sys/locale';
import * as Util from 'sys/src-com/app/util';

/**
 * 功能点：
 * - 获取文件实例
 * - 下载模板
 *
 * 传输入参数：
 * NA
 *
 * 传出事件：
 * - 上传成功
 */
@Component({
  selector: 'app-template-up-load',
  templateUrl: './template-up-load.component.html',
  styleUrls: ['./template-up-load.component.scss'],
})
export class TemplateUpLoadComponent implements OnInit, StateBaseOpreation {
  @ViewChild('uploadModal', { static: true }) uploadModal: TemplateRef<any>;
  @ViewChild('sshTransferModal', { static: true })
  sshTransferModal: TemplateRef<any>;
  @ViewChild('fileUploader', { static: false }) fileUploaderEl: ElementRef;

  @Output()
  inited = new BehaviorSubject<StateController>(null);
  @Output() dispatch = new Subject<DispatchInfo>();

  // 批量操作类型
  batchOptType: BatchOptType;
  batchOptTypeEnum = BatchOptType;
  uploader: TiUploadRef;
  isDragUpload = false;
  uploadImg = 'drop-upload.svg';
  isIde = false;
  securityChecked = false;
  i18n: any = I18n;
  isIE = false;

  private uploadConfig: TiUploadConfig;
  private openModelRef: TiModalRef;
  private uploaderOpening = false;

  constructor(
    private uploaderService: TiUploadService,
    private themeServe: HyThemeService,
    private downloadServe: TemplateDownloadService,
    private tiModal: TiModalService
  ) {
    this.uploadConfig = {
      url: '',
      autoUpload: false,
      filters: [
        {
          name: 'maxCount',
          params: [1],
        },
      ],
      onAddItemFailed: (_: TiFileInfo, validResults: Array<string>): void => {
        this.dispatch.next({
          event: BatchOptEvent.Error,
          payLoad: validResults,
        });
        this.uploaderOpening = false;
        this.openModelRef.close();
      },
      onAddItemSuccess: (fileItem: TiFileItem): void => {
        this.dispatch.next({
          event: BatchOptEvent.UploadTpl,
          payLoad: fileItem.file,
        });
        this.uploaderOpening = false;
        this.openModelRef.close();
      },
    };
    this.uploader = this.uploaderService.create(this.uploadConfig);
  }

  ngOnInit(): void {
    this.isIde = document.body.className.includes('vscode') ? true : false;
    this.isIE = Util.judgeExplorer() === ExplorerType.IE;

    this.themeServe.subscribe((msg: HyTheme) => {
      this.uploadImg =
        msg === HyTheme.Dark
          ? './assets/img/home/drop-upload.svg'
          : './assets/img/home/drop-upload.svg';
    });
    this.inited.next({
      action: (payLoad: { isReplace: boolean }, openModel) => {
        this.openModelRef = openModel(this.uploadModal, {
          dismiss: () => {
            this.dispatch.next({
              event: BatchOptEvent.Close,
            });
          },
        });
        if (payLoad?.isReplace) {
          setTimeout(() => {
            this.triggerUploaderClick();
            this.uploaderOpening = true;
          }, 100);
        }
      },
    });
  }

  onTplDownload() {
    switch (this.batchOptType) {
      case BatchOptType.Import:
        this.downloadServe.downloadImport();
        break;
      case BatchOptType.Delete:
        this.downloadServe.downloadDelete();
        break;
      default:
        throw new Error('Template download error');
    }
  }

  onAddItemFailed(evt: { file: TiFileInfo; validResults: Array<string> }) {
    const { file, validResults } = evt;
    this.uploadConfig.onAddItemFailed(file, validResults);
    this.isDragUpload = false;
  }

  /**
   * 当文件被拖入线框，并成功获取后
   * @param fileItem 文件信息
   */
  onAddItemSuccess(fileItem: TiFileItem) {
    this.securityChecked = false;
    if (!this.uploaderOpening) {
      this.tiModal.open(this.sshTransferModal, {
        modalClass: 'ssh-transfer-class',
        close: () => {
          this.uploadConfig.onAddItemSuccess(fileItem);
          this.isDragUpload = false;
        },
      });
    } else {
      this.uploadConfig.onAddItemSuccess(fileItem);
      this.isDragUpload = false;
    }
  }

  onFileDragover() {
    if (this.isDragUpload) {
      return;
    }
    this.isDragUpload = true;
  }

  onFileDragleave() {
    this.isDragUpload = false;
  }

  onModelClose(_: any) {
    this.openModelRef.close();
    this.dispatch.next({
      event: BatchOptEvent.Close,
    });
  }

  /**
   * 当打开点击 "文件上传" 按钮后
   * @param _ 站位
   */
  onOpenSshModel(_: any) {
    this.securityChecked = false;
    this.tiModal.open(this.sshTransferModal, {
      modalClass: 'ssh-transfer-class',
      close: () => {
        this.triggerUploaderClick();
        this.uploaderOpening = true;
        this.isDragUpload = false;
      },
    });
  }

  /**
   * 主动触发文件上传
   */
  private triggerUploaderClick() {
    this.fileUploaderEl?.nativeElement.click();
  }
}
