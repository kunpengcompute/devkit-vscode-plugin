export interface ApiLinkageTask {
  'analysis-target': null;
  'analysis-type': 'task_contrast';
  comparison_type: 'vertical analysis' | 'horizontal analysis';
  createtime: string;
  id: number;
  nodeList: any;
  status_code: string;
  switch: boolean;
  'task-status': string;
  task_data: any;
  task_info: string;
  task_param: any;
  taskname: string;
  timeconsuming: any;
  [key: string]: any;
}
