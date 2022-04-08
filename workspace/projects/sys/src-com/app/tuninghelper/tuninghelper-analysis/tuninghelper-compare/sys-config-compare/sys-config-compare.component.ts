import { Component, OnInit, Renderer2, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { Util } from '@cloud/tiny3';
import { RespCommon } from 'sys/src-com/app/domain';
import { HttpService } from 'sys/src-com/app/service';
import { TuninghelperStatusService } from '../../service/tuninghelper-status.service';
import { RespSysConfigDiff } from './domain/resp-sys-config-diff.type';

@Component({
  selector: 'app-sys-config-compare',
  templateUrl: './sys-config-compare.component.html',
  styleUrls: ['./sys-config-compare.component.scss']
})
export class SysConfigCompareComponent implements OnInit, AfterViewInit {

  public sysConfigDiff: RespSysConfigDiff;
  public contentWrapEl: ElementRef<HTMLDivElement>;
  @ViewChild('tiTabContent', { static: false }) tiTabContent: any;

  constructor(
    private el: ElementRef<HTMLDivElement>,
    private renderer2: Renderer2,
    private statusService: TuninghelperStatusService,
    private http: HttpService,
  ) { }

  ngAfterViewInit(): void {
    const ti3TabContentEl = this.el.nativeElement.querySelector('.ti3-tab-content');
    this.renderer2.listen(ti3TabContentEl, 'scroll', () => {
      Util.trigger(document, 'tiScroll');
    });
  }

  async ngOnInit() {
    this.sysConfigDiff = await this.getSystemConfigDiff();
    this.contentWrapEl = this.tiTabContent?.elementRef?.nativeElement?.parentElement?.parentNode;
  }

  private async getSystemConfigDiff() {
    const params = {
      id: this.statusService.taskId,
    };
    const resp: RespCommon<RespSysConfigDiff> = await this.http.get(
      `/data-comparison/system-config-diff/`,
      { params }
    );
    return resp.data;
  }

}
