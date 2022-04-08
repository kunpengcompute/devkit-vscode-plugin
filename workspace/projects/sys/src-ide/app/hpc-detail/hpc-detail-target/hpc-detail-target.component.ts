import { Component, Input, OnInit } from '@angular/core';
import { HpcPresetType } from '../domain/hpcPresetType.enum';

@Component({
    selector: 'app-hpc-detail-target',
    templateUrl: './hpc-detail-target.component.html',
    styleUrls: ['./hpc-detail-target.component.scss']
})
export class HpcDetailTargetComponent implements OnInit {
    @Input() nodeId: any;
    @Input() taskId: any;
    @Input() projectName: any;
    @Input() taskName: any;
    @Input() analysisType: any;
    @Input() analysisTarget: any;
    @Input()
    set mpiHpcInfo(data: any) {
      this.targetHpcInfo = data;
      this.hpcPreset = data.data.preset as HpcPresetType;
    }

    public hpcPreset: HpcPresetType;
    public targetHpcInfo: any;
    public hpcPresetType = HpcPresetType;

    constructor() { }
    /**
     * 初始化
     */
    ngOnInit() {}

}
