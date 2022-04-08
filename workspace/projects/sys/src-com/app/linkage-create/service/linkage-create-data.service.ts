import { Injectable } from '@angular/core';
import { HttpService } from '../../service/http.service';

@Injectable({
  providedIn: 'root',
})
export class LinkageCreateDataService{

  constructor(
    private http: HttpService
  ){}

    // 获取工程树
  async getProjectTree() {

    const resp = await this.http.get(`/projects/?auto-flag=off&analysis-type=all`);
    const projectNameList: string[] = (resp.data.projects ?? []).map((item: any) => item.projectName);

    if (projectNameList.length < 1) { return; }

    const params = {
      'analysis-type': 'all',
      'project-name': projectNameList.join(','),
      'auto-flag': 'off',
      page: 1,
      'per-page': 1000
    };

    return (await this.http.get('/tasks/task-summary/', { params })).data;
  }
}
