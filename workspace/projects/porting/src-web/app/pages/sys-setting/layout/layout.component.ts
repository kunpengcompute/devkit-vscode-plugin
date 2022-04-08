import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {
  constructor(private activeRoute: ActivatedRoute) { }

  public nowPath: string; // 当前路由

  ngOnInit(): void {
    this.activeRoute.params.subscribe((params: { path: string }) => {
      this.nowPath = params.path;
    });
  }
}
