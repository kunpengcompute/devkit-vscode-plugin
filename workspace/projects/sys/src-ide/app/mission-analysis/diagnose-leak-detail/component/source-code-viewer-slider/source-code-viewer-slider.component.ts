import { Component, OnInit, ViewChild } from '@angular/core';
import { TiModalRef, TiModalService } from '@cloud/tiny3';
import { I18nService } from 'projects/sys/src-ide/app/service/i18n.service';
import { FunctionSourceInfo } from '../../doman';

@Component({
  selector: 'app-source-code-viewer-slider',
  templateUrl: './source-code-viewer-slider.component.html',
  styleUrls: ['./source-code-viewer-slider.component.scss']
})
export class SourceCodeViewerSliderComponent implements OnInit {
  @ViewChild('modalTemp') modalTemp: any;

  public i18n: any;

  public funcInfo: {
    funcName: string,
    stack: string,
    memReleaseType: string,
    sourceCodeData: {
      functionSourceInfo: FunctionSourceInfo;
    }
  } = {
      funcName: '',
      stack: '',
      memReleaseType: '',
      sourceCodeData: {
        functionSourceInfo: {
          childline: [],
          selfline: [],
          sourcecode: ''
        }
      }
    };

  private tiModalRef: TiModalRef;

  constructor(
    private i18nService: I18nService,
    private tiModalService: TiModalService
  ) {
    this.i18n = this.i18nService.I18n();
  }

  ngOnInit(): void { }

  public open(item: {
    funcName: string,
    stack: string,
    memReleaseType: string,
    sourceCodeData: {
      functionSourceInfo: FunctionSourceInfo;
    }
  }) {
    this.tiModalRef = this.tiModalService.open(this.modalTemp, {
      id: 'sourceCodeViewerModal',
    });
    // 异步一下，等弹窗渲染完再把数据更新过去
    setTimeout(() => {
      this.funcInfo = item;
    }, 0);
  }

  public close() {
    this.tiModalRef.close();
  }

}
