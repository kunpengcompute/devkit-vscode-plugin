import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-information-title',
  templateUrl: './information-title.component.html',
  styleUrls: ['./information-title.component.scss']
})
export class InformationTitleComponent implements OnInit {
  @Input() title: string;
  @Input() hasBorder = true;
  constructor() { }
  ngOnInit(): void {
  }

}
