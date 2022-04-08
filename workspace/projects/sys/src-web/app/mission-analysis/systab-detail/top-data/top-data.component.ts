import { Component, Input, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Subject } from 'rxjs';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import * as Util from 'projects/sys/src-web/app/util';

@Component({
  selector: 'app-top-data',
  templateUrl: './top-data.component.html',
  styleUrls: ['./top-data.component.scss']
})
export class TopDataComponent implements OnInit {
  @ViewChild('fileDataWarpper', { static: true, read: ElementRef })
  fileDataWarpperEl: ElementRef;
  @ViewChild('content', { static: true, read: ElementRef })
  contentEl: ElementRef;

  @Input() taskId: number;
  @Input() nodeId: number;

  public i18n: any;
  public initializing = false;
  public obtainingTableData = false;

  /** 文件列表【左侧】 */
  public fileList = {
    currentIndex: 0,  // 当前查看文件的索引
    list: ([] as string[]),
  };

  /** 文件内容【右侧】【使用表格在IE下会非常卡，所以整个content都是一个字符串】 */
  public fileData = {
    title: {
      index: '',
      text: '',
    },
    content: {
      indexes: '',
      text: ''
    }
  };

  private fileContentIterator: IterableIterator<any[]>;
  private fileIndexIterator: IterableIterator<any[]>;
  private fileDemandSource: Subject<any>;

  constructor(
    public i18nService: I18nService,
    private Axios: AxiosService,
  ) {
    this.i18n = this.i18nService.I18n();
  }

  ngOnInit() {

    this.initializing = true;
    this.getFileData(this.fileList.currentIndex).then(({ fileList, fileData }) => {
      this.setFileList(fileList);
      this.setFileContent(fileData);
    }).finally(() => {
      this.initializing = false;
    });
  }

  /**
   * 设置文件列表
   * @param fileList 文件列表
   */
  private setFileList(fileList: string[]) {
    this.fileList.list = fileList;
  }

  /**
   * 获取文件列表
   */
  private setFileContent(fileData: string[]) {
    const fileTitle = fileData[0];
    const fileContent = fileData.slice(1);

    // 文本内容index的最大位数，用来使index列表前补空格，保持宽度一致
    const indexBits = String(fileContent.length).length;

    // thead
    this.fileData.title.index = Util.padStart('', indexBits);
    this.fileData.title.text = fileTitle;

    // tbody
    const indexes = [...Array(fileContent.length + 1).keys()]
      .slice(1)
      .map(item => Util.padStart(item, indexBits));
    this.fileContentIterator = Util.sliceArray(fileContent, 10, 30);
    this.fileIndexIterator = Util.sliceArray(indexes, 10, 30);
    this.onDemandData(this.fileDemandSource);
    this.contentEl.nativeElement.scrollTop = 0;
  }

  /**
   * 获取文件数据
   * @param fileIndex 文件名索引
   */
  private getFileData(fileIndex: number) {
    return new Promise<{ fileList: string[], fileData: string[] }>((resolve, reject) => {
      const params = {
        nodeId: this.nodeId,
        page: fileIndex + 1,  // 后端是从1开始的
      };

      this.Axios.axios.get(`tasks/${encodeURIComponent(this.taskId)}/sys-performance/top-detail/`, {
        params,
        headers: {
          showLoading: false,
        }
      }).then((res: any) => {
        if (fileIndex === this.fileList.currentIndex) {
          resolve({
            fileList: res.data.top_timestamp,
            fileData: res.data.data,
          });
        }
      }).catch((e: Error) => {
        reject(e);
      });
    });
  }

  /**
   * 切换文件
   * @param fileIndex 文件名索引
   */
  public switchFile(fileIndex: number) {

    // 切换重置
    this.fileContentIterator = void 0;
    this.fileIndexIterator = void 0;
    this.fileData.content.indexes = '';
    this.fileData.content.text = '';

    this.fileList.currentIndex = fileIndex;
    this.obtainingTableData = true;
    this.getFileData(fileIndex).then(({ fileData }) => {
      this.setFileContent(fileData);
    }).finally(() => {
      this.obtainingTableData = false;
    });
  }

  onDemandData(demandSource: Subject<any[]>) {
    this.fileDemandSource = demandSource;

    if (
      this.fileContentIterator == null || this.fileIndexIterator == null
    ) {
      return;
    }

    demandSource.next([]);
    const textSegment = this.fileContentIterator.next();
    const indexSegment = this.fileIndexIterator.next();
    if (!textSegment.done && !indexSegment.done) {
      this.fileData.content.indexes
        += (indexSegment.value as string[]).reduce((pre: string, cur: string) => {
          return pre + '\n' + cur;
        }) + '\n';
      this.fileData.content.text
        += (textSegment.value as string[]).reduce((pre: string, cur: string) => {
          return pre + cur;
        });
    }
  }
}
