import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonI18nService } from 'projects/java/src-com/app/service/common-i18n.service';

@Component({
  selector: 'app-infor-collection',
  templateUrl: './infor-collection.component.html',
  styleUrls: ['./infor-collection.component.scss']
})
export class InforCollectionComponent implements OnInit {
  @Input() valueMaxWidth: number;
  @Input()
  get data() { return this.infoData; }
  set data(data) {
    this.infoData = data;
  }
  @Output() public viewInforDetail = new EventEmitter<any>();
  public i18n: any;
  public infoData: any;
  constructor(
    public i18nService: CommonI18nService,
  ) {
    this.i18n = this.i18nService.I18n();
  }

  ngOnInit(): void {
  }
  public viewDetail(item: any) {
    this.viewInforDetail.emit(item);
  }

}
