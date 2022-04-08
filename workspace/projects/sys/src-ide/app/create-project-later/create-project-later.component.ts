import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { I18nService } from '../service/i18n.service';
import { VscodeService } from '../service/vscode.service';

@Component({
    selector: 'app-create-project-later',
    templateUrl: './create-project-later.component.html',
    styleUrls: ['./create-project-later.component.scss']
})
export class CreateProjectLaterComponent implements OnInit {
    public i18n: any;
    public projectInfo: any;  // 新建的工程信息
    constructor(
        public I18n: I18nService,
        public vscodeService: VscodeService,
        private route: ActivatedRoute,
        private router: Router,
    ) {
        this.i18n = I18n.I18n();
    }
    /**
     * 初始化
     */
    ngOnInit() {
        this.route.queryParams.subscribe((data) => {
            this.projectInfo = data;
            // 更新panel标题
            this.vscodeService.postMessage({
                cmd: 'optProjectSuccess',
                data: {
                    project: {
                        title: data.projectName,
                    }
                }
            }, null);
        });
    }
    /**
     * 打开新建分析任务界面
     */
    public openNewTask() {
        this.router.navigate(['home'], {
            queryParams: {
                ...this.projectInfo
            }
        });
    }
}
