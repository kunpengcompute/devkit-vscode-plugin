import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { I18nService } from 'projects/sys/src-web/app/service';
import { FunctionSourceInfo } from '../../doman';

@Component({
  selector: 'app-source-code-viewer-slider',
  templateUrl: './source-code-viewer-slider.component.html',
  styleUrls: ['./source-code-viewer-slider.component.scss']
})
export class SourceCodeViewerSliderComponent implements OnInit {
  @Input() labelWidth: string;

  @ViewChild('missionModal') missionModal: any;

  public i18n: any;
  public explorer: string;

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

  constructor(
    public i18nService: I18nService,
  ) {
    this.i18n = this.i18nService.I18n();
    this.explorer = this.getExplorer();
  }

  ngOnInit(): void {
  }

  public open(item: {
    funcName: string,
    stack: string,
    memReleaseType: string,
    sourceCodeData: {
      functionSourceInfo: FunctionSourceInfo;
    }
  }) {
    this.funcInfo = item;
    this.missionModal.open();
  }

  public close() {
    this.missionModal.close();
  }

  public getExplorer(): any {
    const explorer = window.navigator.userAgent;
    const ie11 = 'ActiveXObject' in window;

    if (explorer.indexOf('MSIE') >= 0 || ie11) {
      return 'ie';
    } else if (explorer.indexOf('Firefox') && !ie11) {
      return 'Firefox';
    } else if (explorer.indexOf('Chrome') && !ie11) {
      return 'Chrome';
    } else if (explorer.indexOf('Opera') && !ie11) {
      return 'Opera';
    } else if (explorer.indexOf('Safari') && !ie11) {
      return 'Safari';
    }
  }

}
