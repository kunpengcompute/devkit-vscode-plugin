import { Component, OnInit } from '@angular/core';
import { I18nService } from '../../service/i18n.service';
@Component({
  selector: 'app-sample-storage',
  templateUrl: './sample-storage.component.html',
  styleUrls: ['./sample-storage.component.scss']
})
export class SampleStorageComponent implements OnInit {
  public i18n: any;
  constructor(private i18nService: I18nService) {
    this.i18n = this.i18nService.I18n();
  }
  public tabs =
    [
      {
        title: 'objects',
        link: 'objects',
        active: true,
        show: true
      },
      {
        title: 'leak',
        link: 'leak',
        active: false,
        show: false
      }
    ];
  ngOnInit() {
    this.tabs[0].title = this.i18n.protalserver_sampling_tab.allObjects;
    const enableOldObjectSample = JSON.parse(sessionStorage.getItem('enableOldObjectSample'));
    this.tabs.forEach(item => {
      if (item.title === 'leak') {
        item.show = enableOldObjectSample;
        item.title = this.i18n.protalserver_sampling_tab.leak;
      }
    });
  }
  public activeChange(index: number) {
    this.tabs.forEach((tab, i) => {
      tab.active = false;
    });
    this.tabs[index].active = true;
  }
}
