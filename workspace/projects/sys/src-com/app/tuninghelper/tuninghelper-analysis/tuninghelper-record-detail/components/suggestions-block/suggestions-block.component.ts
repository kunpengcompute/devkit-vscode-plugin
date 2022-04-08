import { Component, Input, OnInit } from '@angular/core';
import { HttpService, I18nService } from 'sys/src-com/app/service';

@Component({
  selector: 'app-suggestions-block',
  templateUrl: './suggestions-block.component.html',
  styleUrls: ['./suggestions-block.component.scss']
})
export class SuggestionsBlockComponent implements OnInit {

  @Input() taskId: any;
  @Input() taskName: any;
  @Input() suggestData: { title: '', data: [] };
  @Input() nodeId: any;
  @Input() taskDetail: any;
  public loginId = sessionStorage.getItem('loginId');
  public i18n: any;
  constructor(
    private http: HttpService,
    private i18nService: I18nService,
  ) {
    this.i18n = this.i18nService.I18n();
  }

  ngOnInit(): void {
  }

  /**
   * 处理未知状态同步问题并状态改变上传服务器
   */
  public getStatus(type: string, status: boolean, item: { invalid: boolean; effect: boolean; id: any; }) {
    if (this.taskDetail.ownerId !== this.loginId  && this.loginId !== '1') { return; }
    if (type === 'effect') {
      item.invalid = false;
    } else {
      item.effect = false;
    }
    let optimizationOperations;
    if (item.effect === true) {
      optimizationOperations = 1;
    } else {
      optimizationOperations = 2;
    }
    const params = {
      nodeId: this.nodeId,
      id: item.id,
      optimizationOperations,
    };
    this.http.put('/tasks/' + encodeURIComponent(this.taskId) + '/optimization/setting-optimization-status/',
    params).then((res: any) => {
    });
  }
}
