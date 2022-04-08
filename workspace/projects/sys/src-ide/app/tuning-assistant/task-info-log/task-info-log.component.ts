import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-task-info-log',
  templateUrl: './task-info-log.component.html',
  styleUrls: ['./task-info-log.component.scss']
})
export class TaskInfoLogComponent implements OnInit {

  public taskDetail: any;

  constructor(
    private route: ActivatedRoute,
  ) {
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((data) => {
      const response = data.sendMessage.replace(/#/g, ':');
      const respParams = JSON.parse(response);
      this.taskDetail = respParams.selfInfo;
    });
  }

}
