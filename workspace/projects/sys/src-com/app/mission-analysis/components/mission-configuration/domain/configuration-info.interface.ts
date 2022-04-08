import { TaskStatus } from 'sys/src-com/app/domain';

export interface ConfigurationInfo {
  header: Array<{
    label: string;
    value: string;
    status?: TaskStatus;
    statusCode?: string;
  }>;
  main: Array<{
    label: string;
    value: string;
  }>;
  footer: Array<{
    label: string;
    value: string;
  }>;
}
