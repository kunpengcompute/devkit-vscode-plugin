import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-tuninghelper-compare-process-pid-detail',
  templateUrl: './tuninghelper-compare-process-pid-detail.component.html',
  styleUrls: ['./tuninghelper-compare-process-pid-detail.component.scss']
})
export class TuninghelperCompareProcessPidDetailComponent implements OnInit {

  public message: {
    taskId: any;
    command: any;
  };

  constructor(
    private router: ActivatedRoute
  ) {
    this.router.queryParams.subscribe((params) => {
      this.message = {
        taskId: params.taskId,
        command: params.command,
      };
    });
  }

  ngOnInit(): void {
  }

}
