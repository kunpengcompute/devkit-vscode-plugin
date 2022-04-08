import { Component, Input, OnInit } from '@angular/core';
import { HttpService } from 'sys/src-com/app/service';
import { OptimizationTypeEnum } from '../domain';
@Component({
  selector: 'app-system-config',
  templateUrl: './system-config.component.html',
  styleUrls: ['./system-config.component.scss']
})
export class SystemConfigComponent implements OnInit {

  @Input() optimizationType: OptimizationTypeEnum;

  public allSugList: Array<any>;

  constructor(
    private http: HttpService
  ) { }

  ngOnInit(): void {
  }

  /**
   * 改变当前选中优化建议
   */
  changeSelecedState(sugData: any) {
    if (!sugData.selected) {
      this.allSugList.map((sug: any) => {
        if (sug.id === sugData.id) {
          sug.selected = true;
        } else {
          sug.selected = false;
        }
      });
    }
  }

}
