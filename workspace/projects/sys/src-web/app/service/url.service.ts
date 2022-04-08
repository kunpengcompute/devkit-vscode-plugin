import { Injectable } from '@angular/core';
import { SysPerfUrl } from 'projects/sys/src-web/url/sysperf';
import { MemPerfUrl } from 'projects/sys/src-web/url/memperf';
import { TunningHelperUrl } from 'projects/sys/src-web/url/tunninghelper';
import { ToolType } from 'projects/domain';

@Injectable({
  providedIn: 'root',
})
export class UrlService {

  Url(): { [key: string]: string } {
    const toolType = sessionStorage.getItem('toolType');
    switch (toolType) {
      case ToolType.DIAGNOSE:
        return MemPerfUrl;
      case ToolType.SYSPERF:
        return SysPerfUrl;
      case ToolType.TUNINGHELPER:
        return TunningHelperUrl;
      default:
        return SysPerfUrl;
    }
  }

}
