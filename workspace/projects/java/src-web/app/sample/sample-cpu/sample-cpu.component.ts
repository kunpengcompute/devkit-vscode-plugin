

import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { I18nService } from '../../service/i18n.service';

@Component({
  selector: 'app-sample-cpu',
  templateUrl: './sample-cpu.component.html',
  styleUrls: ['./sample-cpu.component.scss']
})
export class SampleCpuComponent implements OnInit {
  public i18n: any;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private i18nService: I18nService
  ) {
    this.i18n = this.i18nService.I18n();
  }
  public cpuTabs: any = [];
  /**
   * ngOnInit
   */
  ngOnInit() {
    const enableThreadDump = JSON.parse(sessionStorage.getItem('enableThreadDump'));
    const enableMethodSample = JSON.parse(sessionStorage.getItem('enableMethodSample'));
    // 线程转储
    if (enableThreadDump) {
      this.cpuTabs.push({
        title: this.i18n.protalserver_sampling_tab.threadDump,
        link: 'thread',
        active: false,
        show: true
      });
    }
    // 方法采样
    if (enableMethodSample) {
      this.cpuTabs.push({
        title: this.i18n.protalserver_sampling_tab.methodSample,
        link: 'method',
        active: false,
        show: true
      });
    }
    // 锁与等待
    this.cpuTabs.push({
      title: this.i18n.protalserver_sampling_tab.lock,
      link: 'lock',
      active: false,
      show: true
    });
    this.cpuTabs[0].active = true;
    this.router.navigate([`./${this.cpuTabs[0].link}`], { relativeTo: this.route });
  }
  /**
   * activeChange
   * @param index index
   */
  public activeChange(index: number) {
    this.cpuTabs.forEach((tab: any, i: any) => {
      tab.active = i === index;
    });
  }
}
