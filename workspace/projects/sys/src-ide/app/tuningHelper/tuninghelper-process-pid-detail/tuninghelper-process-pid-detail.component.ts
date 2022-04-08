import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TiTreeNode } from '@cloud/tiny3';

@Component({
  selector: 'app-tuninghelper-process-pid-detail',
  templateUrl: './tuninghelper-process-pid-detail.component.html',
  styleUrls: ['./tuninghelper-process-pid-detail.component.scss']
})
export class TuninghelperProcessPidDetailComponent implements OnInit {

  public message: {
    taskId: any,
    nodeId: any,
    pid: any,
    showIndicatorInfo?: boolean
  };

  constructor(
    private router: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.router.queryParams.subscribe((params) => {
      this.message = {
        taskId: params.taskId,
        nodeId: params.nodeId,
        pid: params.pid,
        showIndicatorInfo: params.showIndicatorInfo
      };
    });
  }

}
