import { Component, OnInit, Input } from '@angular/core';
import { I18nService } from '../../service/i18n.service';
import { LeftShowService } from '../../service/left-show.service';
import { AnalysisType } from '../../domain/analysis-type.enum';
import { VscodeService } from '../../service/vscode.service';
@Component({
  selector: 'app-linkage-detail',
  templateUrl: './linkage-detail.component.html',
  styleUrls: ['./linkage-detail.component.scss']
})
export class LinkageDetailComponent implements OnInit {

  @Input() projectName: string;
  @Input() taskName: string;
  @Input() status: any;
  @Input() taskId: any;
  @Input() nodeid: number;

  public analysisType = AnalysisType.TaskContrast;
  public subscription: any;
  public i18n: any;
  public detailList: Array<any> = [];
  constructor(
    private vscodeService: VscodeService,
    public i18nService: I18nService,
    public leftShowService: LeftShowService) {
    this.i18n = this.i18nService.I18n();
  }

  ngOnInit(): void {
    let url = '';
    url = '/tasks/taskcontrast/configuration/?taskId=' + encodeURIComponent(this.taskId);
    this.vscodeService.get({ url }, (resp: any) => {
      if (resp.data.analysisType === 'system') {
        this.detailList = [
          {
            title: this.i18n.linkage.configData,
            active: true,
            disable: false,
          },
          {
            title: this.i18n.linkage.perfData,
            disable: false,
            active: false
          },
        ];
        if (resp.data.tabType) {
          this.detailList.push({
            title: this.i18n.linkage.typeData,
            disable: false,
            active: false
          });
        }
      } else {
        this.detailList = [
          {
            title: this.i18n.linkage.onCPUdiff,
            disable: false,
            active: true
          },
          {
            title: this.i18n.linkage.offCPUdiff,
            disable: false,
            active: true
          }
        ];
      }

      this.detailList.push({
        title: this.i18n.common_term_task_tab_congration,
        disable: false,
        active: true
      });
    });
  }

  /**
   * 获取配置页面信息
   * @param configInfo 配置信息
   */
  public getConfigInfo(configInfo: any) {
    if (configInfo?.LinkageStatus === 'Completed' || configInfo?.LinkageStatus === 'Aborted') {
      this.detailList[1].disable = false;
      this.detailList[0].disable = false;
      this.detailList[0].active = true;
    } else {
      this.detailList[2].active = true;
      this.detailList[0].active = false;
      this.detailList[0].disable = true;
      this.detailList[1].disable = true;
      for (let index = this.detailList.length; index > 0; index--) {
        if (this.detailList[index - 1].disable) {
          this.detailList.splice((index - 1), 1);
        }
      }
    }
  }
  /**
   * tab切换
   */
  public change() {
    this.leftShowService.leftIfShow.next();
  }
}
