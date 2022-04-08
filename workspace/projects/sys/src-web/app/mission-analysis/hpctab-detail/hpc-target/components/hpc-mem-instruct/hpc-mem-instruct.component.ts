import { Component, OnInit, Input, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { I18nService } from 'projects/sys/src-web/app/service/i18n.service';
import { IHpcMemData } from '../../../domain';
import { HpcMemInstructService } from '../../service';

@Component({
  selector: 'app-hpc-mem-instruct',
  templateUrl: './hpc-mem-instruct.component.html',
  styleUrls: ['./hpc-mem-instruct.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HpcMemInstructComponent implements OnInit {

  @Input() projectName: string;
  @Input() taskName: string;
  @Input() taskId: number;
  @Input() nodeId: number;
  @Input() Topdown: boolean;

  public targetLeftData: Array<IHpcMemData> = [];
  public targetRightData: Array<IHpcMemData> = [];
  public instructLeftData: Array<IHpcMemData> = [];
  public instructRightData: Array<IHpcMemData> = [];
  public i18n: any;
  public isMem = false;
  public lang: string;
  public isLoading = false;
  public instrubool: any[] = [];

  constructor(
    private i18nService: I18nService,
    private hpcMemService: HpcMemInstructService,
    private cdr: ChangeDetectorRef
  ) {
    this.i18n = this.i18nService.I18n();
    this.lang = sessionStorage.getItem('language');
  }


  ngOnInit(): void {
    this.isLoading = true;
    this.hpcMemService.getTargetData(this.taskId, this.nodeId)
      .then((res) => {
        this.targetLeftData = res.targetData[0].content;
        this.targetRightData = res.targetData[1].content;
        this.instructLeftData = res.instructData[0].content;
        this.instructRightData = res.instructData[1].content;
        this.isLoading = false;
        this.getObeject();
        this.cdr.markForCheck();
      }).catch(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      });
  }

  // 判断有无数据
  getObeject() {
    this.instructLeftData.map((item: IHpcMemData) => {
      if (item.key) {
        this.instrubool.push(item.key);
      }
      if (item?.content) {
        item.content.map((el: IHpcMemData) => {
          if (el.key) {
            this.instrubool.push(el.key);
          }
        });
      }
      this.cdr.markForCheck();
    });
  }
}
