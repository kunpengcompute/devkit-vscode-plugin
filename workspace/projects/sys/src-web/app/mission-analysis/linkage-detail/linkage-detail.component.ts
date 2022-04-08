import { Component, OnInit, Input } from '@angular/core';
import { I18nService } from 'projects/sys/src-com/app/service/i18n.service';
import { MytipService } from 'projects/sys/src-web/app/service/mytip.service';
import { LeftShowService } from 'projects/sys/src-web/app/service/left-show.service';
import { AnalysisType } from 'projects/sys/src-web/app/domain';
import { AxiosService } from 'projects/sys/src-web/app/service/axios.service';
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
    private Axios: AxiosService,
    public mytip: MytipService,
    public i18nService: I18nService,
    public leftShowService: LeftShowService) {
    this.i18n = this.i18nService.I18n();
  }

  ngOnInit(): void {
    let url = '';
    url = '/tasks/taskcontrast/configuration/?taskId=' + encodeURIComponent(this.taskId);
    this.Axios.axios.get(url, {
      headers: {
        showLoading: false,
      }
    }).then((resp: any) => {
      if (resp.data.analysisType === 'system'){
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
      if (resp.data.taskStatus === 'Completed' || resp.data.taskStatus === 'Aborted'){
        this.detailList[0].active = true;
      }else{
        this.detailList[0].disable = true;
        this.detailList[1].disable = true;
        this.detailList[2].disable = true;
      }
    });
  }

  /**
   * 获取配置页面信息
   * @param configInfo 配置信息
   */
   public getConfigInfo(configInfo: any) {
    this.detailList[0].active = true;
  }
  /**
   * tab切换
   */
  public change() {
    this.leftShowService.leftIfShow.next();
  }
}
