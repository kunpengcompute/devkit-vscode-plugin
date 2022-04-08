import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-project-management',
  template: ` <div>
    <app-net-port-display [message]="message"></app-net-port-display>
  </div>`,
})
export class NetPortDisplayContainerComponent implements OnInit {
  message: {
    bindName: string;
    nodeId: number;
    taskId: number;
    title: string;
  };

  constructor(private router: ActivatedRoute) {}

  ngOnInit() {
    this.router.queryParams.subscribe((params) => {
      this.message = {
        bindName: params.bindName,
        nodeId: params.nodeId,
        taskId: params.taskId,
        title: params.title,
      };
    });
  }
}
