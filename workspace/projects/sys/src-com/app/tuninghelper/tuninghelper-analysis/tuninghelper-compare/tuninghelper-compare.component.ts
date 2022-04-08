import { Component, Input, OnInit } from '@angular/core';
import { RespCommon, TaskStatus } from 'sys/src-com/app/domain';
import { HttpService } from 'sys/src-com/app/service';
import { TuninghelperStatusService } from '../service/tuninghelper-status.service';

@Component({
  selector: 'app-tuninghelper-compare',
  templateUrl: './tuninghelper-compare.component.html',
  styleUrls: ['./tuninghelper-compare.component.scss'],
  providers: [
    { provide: TuninghelperStatusService },
  ]
})
export class TuninghelperCompareComponent implements OnInit {

  @Input() status: TaskStatus;
  @Input() taskId: number;
  @Input() nodeId: number;

  public object1Text = '';
  public object2Text = '';
  public isSysConfig = true;
  public isSysPerf = false;

  constructor(
    private statusService: TuninghelperStatusService,
    private http: HttpService,
  ) { }

  async ngOnInit() {
    this.statusService.nodeId = this.nodeId;
    this.statusService.taskId = this.taskId;
    const compareDetails = await this.getCompareDetails();
    if (!compareDetails) { return; }
    this.object1Text = compareDetails[0].project_name + '/'
      + compareDetails[0].task_name + '/'
      + compareDetails[0].node_name;
    this.object2Text = compareDetails[1].project_name + '/'
      + compareDetails[1].task_name + '/'
      + compareDetails[1].node_name;
  }

  private async getCompareDetails() {
    const resp: RespCommon<any> = await this.http.get('/data-comparison/comparison-details/', {
      params: { id: this.statusService.taskId }
    });
    return resp?.data;
  }

  public activeChange(isActive: boolean) {
    this.isSysConfig = isActive;
  }
  public sysPerfActiveChange(isActive: boolean) {
    this.isSysPerf = isActive;
  }
}
